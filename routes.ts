import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { analyzeDocument, extractTextFromImage } from "./openai";
import { z } from "zod";
import { insertDocumentSchema } from "@shared/schema";
import multer from "multer";
import { setupAuth, isAuthenticated } from "./replitAuth";
import Stripe from "stripe";

// Initialize Stripe (we'll ask for secrets later)
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
  });
}


// Price validation schema
const priceConfig = {
  weekly: { amount: 299, label: "Weekly" },
  monthly: { amount: 998, label: "Monthly" },
  yearly: { amount: 9997, label: "Yearly" },
} as const;

// Input validation schemas
const createSubscriptionSchema = z.object({
  priceType: z.enum(["weekly", "monthly", "yearly"]),
});

const confirmSubscriptionSchema = z.object({
  paymentIntentId: z.string().min(1),
  subscriptionType: z.enum(["weekly", "monthly", "yearly"]),
});

const upload = multer({ storage: multer.memoryStorage() });

// Webhook helper functions
async function handlePaymentSuccess(paymentIntent: any) {
  try {
    const { userId, subscriptionType } = paymentIntent.metadata;
    
    if (!userId || !subscriptionType) {
      console.error('Missing metadata in payment intent:', paymentIntent.id);
      return;
    }

    const user = await storage.getUser(userId);
    if (!user) {
      console.error('User not found for payment:', userId);
      return;
    }

    // Calculate subscription period
    const now = new Date();
    let periodEnd = new Date();
    
    switch (subscriptionType) {
      case 'weekly':
        periodEnd.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        periodEnd.setMonth(now.getMonth() + 1);
        break;
      case 'yearly':
        periodEnd.setFullYear(now.getFullYear() + 1);
        break;
    }

    // Create subscription record
    const priceInfo = priceConfig[subscriptionType as keyof typeof priceConfig];
    await storage.createSubscription({
      userId,
      stripeSubscriptionId: paymentIntent.id,
      stripeCustomerId: paymentIntent.customer,
      status: "active",
      type: subscriptionType,
      amount: priceInfo.amount,
      currency: "eur",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: 0,
    });

    // Update user status
    await storage.upsertUser({
      ...user,
      subscriptionStatus: "active",
      subscriptionType,
    });

    console.log(`Subscription activated for user ${userId}`);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailure(paymentIntent: any) {
  try {
    const { userId } = paymentIntent.metadata;
    
    if (userId) {
      console.log(`Payment failed for user ${userId}:`, paymentIntent.last_payment_error?.message);
      // Could send notification email here
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const objectStorageService = new ObjectStorageService();

  // Setup authentication
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Stripe webhook endpoint (before authentication middleware)
  if (stripe && process.env.STRIPE_WEBHOOK_SECRET) {
    app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
      try {
        const signature = req.headers['stripe-signature'] as string;
        
        if (!signature) {
          console.error('Missing Stripe signature header');
          return res.status(400).send('Missing signature');
        }

        // Use Stripe's official webhook verification method
        const event = stripe!.webhooks.constructEvent(
          req.body, // raw body buffer
          signature,
          process.env.STRIPE_WEBHOOK_SECRET!
        );

        console.log('Stripe webhook received:', event.type);

        switch (event.type) {
          case 'payment_intent.succeeded':
            await handlePaymentSuccess(event.data.object);
            break;
          case 'payment_intent.payment_failed':
            await handlePaymentFailure(event.data.object);
            break;
          default:
            console.log(`Unhandled webhook event type: ${event.type}`);
        }

        res.json({ received: true });
      } catch (error: any) {
        console.error('Webhook error:', error);
        if (error.type === 'StripeSignatureVerificationError') {
          return res.status(400).send('Invalid signature');
        }
        res.status(400).send(`Webhook Error: ${error.message}`);
      }
    });
  }

  // Stripe subscription routes
  if (stripe) {
    // Get or create subscription for the user
    app.post('/api/subscription/create', isAuthenticated, async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        
        // Validate input
        const parseResult = createSubscriptionSchema.safeParse(req.body);
        if (!parseResult.success) {
          return res.status(400).json({ 
            message: "Invalid input",
            errors: parseResult.error.errors
          });
        }
        
        const { priceType } = parseResult.data;
        
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        const priceInfo = priceConfig[priceType];
        if (!priceInfo) {
          return res.status(400).json({ message: "Invalid price type" });
        }

        let customerId = user.stripeCustomerId;
        
        // Create Stripe customer if doesn't exist
        if (!customerId) {
          const customer = await stripe!.customers.create({
            email: user.email || undefined,
            name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : undefined,
          });
          customerId = customer.id;
          await storage.updateUserStripeInfo(userId, customerId);
        }

        // Create payment intent with enhanced security
        const paymentIntent = await stripe!.paymentIntents.create({
          amount: priceInfo.amount,
          currency: "eur",
          customer: customerId,
          automatic_payment_methods: {
            enabled: true,
          },
          metadata: {
            userId,
            subscriptionType: priceType,
            createdAt: new Date().toISOString(),
          },
          description: `AdminIA ${priceInfo.label} Subscription`,
        });

        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error: any) {
        console.error("Error creating subscription:", error);
        res.status(500).json({ message: "Error creating subscription: " + error.message });
      }
    });

    // Confirm subscription payment
    app.post('/api/subscription/confirm', isAuthenticated, async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        
        // Validate input
        const parseResult = confirmSubscriptionSchema.safeParse(req.body);
        if (!parseResult.success) {
          return res.status(400).json({ 
            message: "Invalid input",
            errors: parseResult.error.errors
          });
        }
        
        const { paymentIntentId, subscriptionType } = parseResult.data;
        
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // Update user subscription status
        const now = new Date();
        let periodEnd = new Date();
        
        switch (subscriptionType) {
          case 'weekly':
            periodEnd.setDate(now.getDate() + 7);
            break;
          case 'monthly':
            periodEnd.setMonth(now.getMonth() + 1);
            break;
          case 'yearly':
            periodEnd.setFullYear(now.getFullYear() + 1);
            break;
        }

        // Verify payment intent exists and is successful
        const paymentIntent = await stripe!.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status !== 'succeeded') {
          return res.status(400).json({ message: "Payment not completed" });
        }

        // Create subscription record
        const priceInfo = priceConfig[subscriptionType];
        const subscription = await storage.createSubscription({
          userId,
          stripeSubscriptionId: paymentIntentId,
          stripeCustomerId: user.stripeCustomerId!,
          status: "active",
          type: subscriptionType,
          amount: priceInfo.amount,
          currency: "eur",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: 0,
        });

        // Update user
        await storage.upsertUser({
          ...user,
          subscriptionStatus: "active",
          subscriptionType,
        });

        res.json({ subscription });
      } catch (error: any) {
        console.error("Error confirming subscription:", error);
        res.status(500).json({ message: "Error confirming subscription: " + error.message });
      }
    });

    // Get user subscription status
    app.get('/api/subscription/status', isAuthenticated, async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        const subscription = await storage.getUserActiveSubscription(userId);
        
        res.json({
          user: {
            subscriptionStatus: user?.subscriptionStatus || "trial",
            subscriptionType: user?.subscriptionType,
            trialEndsAt: user?.trialEndsAt,
          },
          subscription,
        });
      } catch (error: any) {
        console.error("Error getting subscription status:", error);
        res.status(500).json({ message: "Error getting subscription status: " + error.message });
      }
    });

    // Cancel subscription
    app.post('/api/subscription/cancel', isAuthenticated, async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const subscription = await storage.getUserActiveSubscription(userId);
        
        if (!subscription) {
          return res.status(404).json({ message: "No active subscription found" });
        }

        await storage.cancelSubscription(subscription.id);
        
        // Update user status
        const user = await storage.getUser(userId);
        if (user) {
          await storage.upsertUser({
            ...user,
            subscriptionStatus: "canceled",
          });
        }

        res.json({ message: "Subscription canceled successfully" });
      } catch (error: any) {
        console.error("Error canceling subscription:", error);
        res.status(500).json({ message: "Error canceling subscription: " + error.message });
      }
    });
  }

  // Serve private objects
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Get upload URL for document (protected)
  app.post("/api/documents/upload-url", isAuthenticated, async (req, res) => {
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Create document after upload (protected)
  app.post("/api/documents", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertDocumentSchema.parse(req.body);
      
      // Normalize object path
      const objectPath = objectStorageService.normalizeObjectEntityPath(validatedData.objectPath);
      
      const document = await storage.createDocument({
        ...validatedData,
        objectPath,
      });

      // Queue for AI processing
      await storage.createAiProcessingQueue({
        documentId: document.id,
        status: "pending"
      });

      res.json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(400).json({ error: "Invalid document data" });
    }
  });

  // Get all documents (protected)
  app.get("/api/documents", isAuthenticated, async (req, res) => {
    try {
      const documents = await storage.getDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error getting documents:", error);
      res.status(500).json({ error: "Failed to get documents" });
    }
  });

  // Get document by ID (protected)
  app.get("/api/documents/:id", isAuthenticated, async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Error getting document:", error);
      res.status(500).json({ error: "Failed to get document" });
    }
  });

  // Delete document (protected)
  app.delete("/api/documents/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteDocument(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  // Process document with AI (protected)
  app.post("/api/documents/:id/analyze", isAuthenticated, async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      // Update status to processing
      await storage.updateDocument(document.id, { status: "processing" });

      let analysis;
      if (document.mimeType.startsWith('image/')) {
        // For images, extract text first then analyze
        const objectFile = await objectStorageService.getObjectEntityFile(document.objectPath);
        
        // Get image data (simplified - in production you'd stream this properly)
        const [metadata] = await objectFile.getMetadata();
        const imageStream = objectFile.createReadStream();
        const chunks: Buffer[] = [];
        
        for await (const chunk of imageStream) {
          chunks.push(chunk);
        }
        
        const imageBuffer = Buffer.concat(chunks);
        const base64Image = imageBuffer.toString('base64');
        
        const extractedText = await extractTextFromImage(base64Image);
        analysis = await analyzeDocument(extractedText, base64Image);
      } else {
        // For text documents, analyze directly (you'd need to implement text extraction for PDFs, etc.)
        analysis = await analyzeDocument("Document content would be extracted here");
      }

      // Update document with analysis results
      await storage.updateDocument(document.id, {
        status: "completed",
        category: analysis.category,
        aiAnalysis: analysis,
        extractedData: analysis.extractedData,
      });

      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing document:", error);
      
      // Update status to error
      await storage.updateDocument(req.params.id, { status: "error" });
      
      res.status(500).json({ error: "Failed to analyze document" });
    }
  });

  // Get categories (public)
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error getting categories:", error);
      res.status(500).json({ error: "Failed to get categories" });
    }
  });

  // Get document statistics (protected)
  app.get("/api/statistics", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDocumentStatistics();
      res.json(stats);
    } catch (error) {
      console.error("Error getting statistics:", error);
      res.status(500).json({ error: "Failed to get statistics" });
    }
  });

  // Get AI processing queue status (protected)
  app.get("/api/ai-queue", isAuthenticated, async (req, res) => {
    try {
      const queue = await storage.getAiProcessingQueue();
      res.json(queue);
    } catch (error) {
      console.error("Error getting AI queue:", error);
      res.status(500).json({ error: "Failed to get AI queue" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
