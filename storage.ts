import { type Document, type InsertDocument, type Category, type InsertCategory, type AiProcessingQueue, type InsertAiProcessingQueue, type User, type UpsertUser, type Subscription, type InsertSubscription } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users - (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(id: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User | undefined>;

  // Subscriptions
  getSubscription(id: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | undefined>;
  getUserActiveSubscription(userId: string): Promise<Subscription | undefined>;
  cancelSubscription(subscriptionId: string): Promise<void>;

  // Documents
  getDocument(id: string): Promise<Document | undefined>;
  getDocuments(): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: string, updates: Partial<Document>): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<void>;
  getDocumentsByCategory(category: string): Promise<Document[]>;
  getRecentDocuments(limit?: number): Promise<Document[]>;

  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // AI Processing Queue
  getAiProcessingQueue(): Promise<AiProcessingQueue[]>;
  createAiProcessingQueue(item: InsertAiProcessingQueue): Promise<AiProcessingQueue>;
  updateAiProcessingQueue(id: string, updates: Partial<AiProcessingQueue>): Promise<AiProcessingQueue | undefined>;

  // Statistics
  getDocumentStatistics(): Promise<{
    totalDocuments: number;
    processedToday: number;
    pendingProcessing: number;
    categoryCounts: Record<string, number>;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private subscriptions: Map<string, Subscription>;
  private documents: Map<string, Document>;
  private categories: Map<string, Category>;
  private aiQueue: Map<string, AiProcessingQueue>;

  constructor() {
    this.users = new Map();
    this.subscriptions = new Map();
    this.documents = new Map();
    this.categories = new Map();
    this.aiQueue = new Map();
    
    // Initialize default categories
    this.initializeDefaultCategories();
  }

  // User operations - (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    const now = new Date();
    
    const user: User = {
      ...existingUser,
      ...userData,
      id: userData.id!,
      email: userData.email ?? null,
      firstName: userData.firstName ?? null,
      lastName: userData.lastName ?? null,
      profileImageUrl: userData.profileImageUrl ?? null,
      stripeCustomerId: userData.stripeCustomerId ?? null,
      stripeSubscriptionId: userData.stripeSubscriptionId ?? null,
      subscriptionStatus: userData.subscriptionStatus ?? existingUser?.subscriptionStatus ?? "trial",
      subscriptionType: userData.subscriptionType ?? null,
      trialEndsAt: userData.trialEndsAt ?? null,
      createdAt: existingUser?.createdAt ?? now,
      updatedAt: now,
    };
    
    this.users.set(user.id, user);
    return user;
  }

  async updateUserStripeInfo(id: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser: User = {
      ...user,
      stripeCustomerId,
      stripeSubscriptionId: stripeSubscriptionId ?? null,
      updatedAt: new Date(),
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Subscription operations
  async getSubscription(id: string): Promise<Subscription | undefined> {
    return this.subscriptions.get(id);
  }

  async createSubscription(subscriptionData: InsertSubscription): Promise<Subscription> {
    const id = randomUUID();
    const now = new Date();
    const subscription: Subscription = {
      ...subscriptionData,
      id,
      currency: subscriptionData.currency || "eur",
      currentPeriodStart: subscriptionData.currentPeriodStart ?? null,
      currentPeriodEnd: subscriptionData.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd ?? 0,
      createdAt: now,
      updatedAt: now,
    };
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return undefined;

    const updatedSubscription: Subscription = {
      ...subscription,
      ...updates,
      updatedAt: new Date(),
    };
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }

  async getUserActiveSubscription(userId: string): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values())
      .find(sub => sub.userId === userId && sub.status === "active");
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      const updatedSubscription: Subscription = {
        ...subscription,
        status: "canceled",
        cancelAtPeriodEnd: 1,
        updatedAt: new Date(),
      };
      this.subscriptions.set(subscriptionId, updatedSubscription);
    }
  }

  private initializeDefaultCategories() {
    const defaultCategories: InsertCategory[] = [
      { name: "factures", icon: "fas fa-file-invoice", color: "blue" },
      { name: "contrats", icon: "fas fa-file-contract", color: "green" },
      { name: "medical", icon: "fas fa-file-medical", color: "purple" },
      { name: "legal", icon: "fas fa-gavel", color: "red" },
      { name: "correspondence", icon: "fas fa-envelope", color: "yellow" },
      { name: "financial", icon: "fas fa-chart-line", color: "indigo" },
      { name: "administrative", icon: "fas fa-building", color: "gray" },
      { name: "other", icon: "fas fa-file-alt", color: "orange" },
    ];

    defaultCategories.forEach(category => {
      const id = randomUUID();
      const categoryWithId: Category = {
        ...category,
        id,
        createdAt: new Date(),
      };
      this.categories.set(id, categoryWithId);
    });
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const now = new Date();
    const document: Document = {
      ...insertDocument,
      id,
      status: insertDocument.status || "pending",
      category: insertDocument.category ?? null,
      aiAnalysis: insertDocument.aiAnalysis ?? null,
      extractedData: insertDocument.extractedData ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;

    const updatedDocument: Document = {
      ...document,
      ...updates,
      updatedAt: new Date(),
    };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }

  async deleteDocument(id: string): Promise<void> {
    this.documents.delete(id);
    // Also remove from AI queue
    const queueEntries = Array.from(this.aiQueue.entries());
    for (const [queueId, item] of queueEntries) {
      if (item.documentId === id) {
        this.aiQueue.delete(queueId);
      }
    }
  }

  async getDocumentsByCategory(category: string): Promise<Document[]> {
    return Array.from(this.documents.values())
      .filter(doc => doc.category === category)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getRecentDocuments(limit: number = 10): Promise<Document[]> {
    return Array.from(this.documents.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = {
      ...insertCategory,
      id,
      createdAt: new Date(),
    };
    this.categories.set(id, category);
    return category;
  }

  async getAiProcessingQueue(): Promise<AiProcessingQueue[]> {
    return Array.from(this.aiQueue.values()).sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
  }

  async createAiProcessingQueue(insertItem: InsertAiProcessingQueue): Promise<AiProcessingQueue> {
    const id = randomUUID();
    const now = new Date();
    const item: AiProcessingQueue = {
      ...insertItem,
      id,
      status: insertItem.status || "pending",
      result: insertItem.result ?? null,
      error: insertItem.error ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.aiQueue.set(id, item);
    return item;
  }

  async updateAiProcessingQueue(id: string, updates: Partial<AiProcessingQueue>): Promise<AiProcessingQueue | undefined> {
    const item = this.aiQueue.get(id);
    if (!item) return undefined;

    const updatedItem: AiProcessingQueue = {
      ...item,
      ...updates,
      updatedAt: new Date(),
    };
    this.aiQueue.set(id, updatedItem);
    return updatedItem;
  }

  async getDocumentStatistics(): Promise<{
    totalDocuments: number;
    processedToday: number;
    pendingProcessing: number;
    categoryCounts: Record<string, number>;
  }> {
    const documents = Array.from(this.documents.values());
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const processedToday = documents.filter(
      doc => doc.updatedAt >= today && doc.status === "completed"
    ).length;

    const categoryCounts: Record<string, number> = {};
    documents.forEach(doc => {
      if (doc.category) {
        categoryCounts[doc.category] = (categoryCounts[doc.category] || 0) + 1;
      }
    });

    const pendingProcessing = Array.from(this.aiQueue.values()).filter(
      item => item.status === "pending" || item.status === "processing"
    ).length;

    return {
      totalDocuments: documents.length,
      processedToday,
      pendingProcessing,
      categoryCounts,
    };
  }
}

export const storage = new MemStorage();
