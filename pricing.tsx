import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown, AlertTriangle, Shield, FileText, ExternalLink, CreditCard } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import type { User, Subscription } from "@shared/schema";

// Type definitions for API responses
interface SubscriptionStatusResponse {
  user: {
    subscriptionStatus: string;
    subscriptionType?: string;
    trialEndsAt?: string;
  };
  subscription?: Subscription;
}

interface CreateSubscriptionResponse {
  clientSecret: string;
}

// Initialize Stripe only if key is available
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY) 
  : null;

interface SubscriptionFormProps {
  priceType: string;
  onSuccess: () => void;
}

function SubscriptionForm({ priceType, onSuccess }: SubscriptionFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/subscription/success",
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Your subscription is now active!",
        });
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
        data-testid="button-confirm-payment"
      >
        {isProcessing ? "Processing..." : `Subscribe to ${priceType}`}
      </Button>
    </form>
  );
}

export default function PricingPage() {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string>("");

  // Get subscription status
  const { data: subscriptionStatus, isLoading: statusLoading } = useQuery<SubscriptionStatusResponse>({
    queryKey: ["/api/subscription/status"],
    enabled: isAuthenticated,
  });

  // Create subscription mutation
  const createSubscriptionMutation = useMutation<CreateSubscriptionResponse, any, string>({
    mutationFn: async (priceType: string) => {
      const response = await apiRequest("POST", "/api/subscription/create", {
        priceType,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
    },
  });

  const plans = [
    {
      id: "weekly",
      name: t("pricing.plans.weekly.name", "Weekly"),
      price: "2.99",
      period: t("pricing.plans.weekly.period", "/week"),
      description: t("pricing.plans.weekly.description", "Perfect for short-term projects"),
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      features: [
        t("pricing.features.unlimited_docs", "Unlimited document processing"),
        t("pricing.features.ai_analysis", "AI-powered analysis"),
        t("pricing.features.cloud_storage", "Cloud storage"),
        t("pricing.features.email_support", "Email support"),
      ],
      popular: false,
    },
    {
      id: "monthly",
      name: t("pricing.plans.monthly.name", "Monthly"),
      price: "9.98",
      period: t("pricing.plans.monthly.period", "/month"),
      description: t("pricing.plans.monthly.description", "Most popular choice for professionals"),
      icon: <Star className="w-6 h-6 text-blue-500" />,
      features: [
        t("pricing.features.unlimited_docs", "Unlimited document processing"),
        t("pricing.features.ai_analysis", "AI-powered analysis"),
        t("pricing.features.cloud_storage", "Cloud storage"),
        t("pricing.features.priority_support", "Priority support"),
        t("pricing.features.advanced_analytics", "Advanced analytics"),
      ],
      popular: true,
    },
    {
      id: "yearly",
      name: t("pricing.plans.yearly.name", "Yearly"),
      price: "99.97",
      period: t("pricing.plans.yearly.period", "/year"),
      description: t("pricing.plans.yearly.description", "Best value for long-term users"),
      icon: <Crown className="w-6 h-6 text-purple-500" />,
      features: [
        t("pricing.features.unlimited_docs", "Unlimited document processing"),
        t("pricing.features.ai_analysis", "AI-powered analysis"),
        t("pricing.features.cloud_storage", "Cloud storage"),
        t("pricing.features.priority_support", "Priority support"),
        t("pricing.features.advanced_analytics", "Advanced analytics"),
        t("pricing.features.api_access", "API access"),
        t("pricing.features.custom_integrations", "Custom integrations"),
      ],
      popular: false,
      savings: t("pricing.plans.yearly.savings", "Save 17%"),
    },
  ];

  const handlePlanSelect = (planId: string) => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    
    setSelectedPlan(planId);
    createSubscriptionMutation.mutate(planId);
  };

  const handleSubscriptionSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/subscription/status"] });
    setSelectedPlan(null);
    setClientSecret("");
    toast({
      title: "Success!",
      description: "Your subscription has been activated.",
    });
  };

  if (authLoading || statusLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t("pricing.title", "Choose Your Plan")}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {t("pricing.subtitle", "Start with a free 3-week trial, then choose the plan that fits your needs")}
          </p>

          {/* Important Policy Notice */}
          <div className="max-w-2xl mx-auto mb-8">
            <Alert className="border-destructive bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive font-medium">
                {t("pricing.no_refund_alert", "Important: All subscriptions are NON-REFUNDABLE. Please use the free trial period to evaluate the service.")}
              </AlertDescription>
            </Alert>
          </div>
          
          {/* Trial info */}
          {subscriptionStatus?.user?.subscriptionStatus === "trial" && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-blue-800 dark:text-blue-200">
                {t("pricing.trial_active", "Trial active until")} {" "}
                <span className="font-semibold">
                  {subscriptionStatus.user.trialEndsAt && 
                    new Date(subscriptionStatus.user.trialEndsAt).toLocaleDateString()
                  }
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Security & Trust */}
        <div className="flex justify-center items-center gap-6 mb-12 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-500" />
            {t("pricing.secure_payments", "Secure payments with Stripe")}
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            {t("pricing.no_refunds", "No refunds policy")}
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            <Link href="/terms" className="hover:underline">
              {t("pricing.view_terms", "View terms")}
            </Link>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular ? "border-primary shadow-lg scale-105" : ""
              } ${
                subscriptionStatus?.user?.subscriptionType === plan.id
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : ""
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                  {t("pricing.popular", "Most Popular")}
                </Badge>
              )}
              
              {plan.savings && (
                <Badge className="absolute -top-3 right-4 bg-green-500">
                  {plan.savings}
                </Badge>
              )}

              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl text-center">{plan.name}</CardTitle>
                <CardDescription className="text-center">{plan.description}</CardDescription>
                <div className="text-center mt-4">
                  <span className="text-4xl font-bold">€{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                {subscriptionStatus?.user?.subscriptionType === plan.id ? (
                  <Button
                    disabled
                    className="w-full"
                    data-testid={`button-current-${plan.id}`}
                  >
                    {t("pricing.current_plan", "Current Plan")}
                  </Button>
                ) : (
                  <Button
                    onClick={() => handlePlanSelect(plan.id)}
                    disabled={createSubscriptionMutation.isPending}
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    data-testid={`button-select-${plan.id}`}
                  >
                    {createSubscriptionMutation.isPending && selectedPlan === plan.id
                      ? t("pricing.processing", "Processing...")
                      : subscriptionStatus?.user?.subscriptionStatus === "trial"
                      ? t("pricing.upgrade_from_trial", "Upgrade from Trial")
                      : t("pricing.select_plan", "Select Plan")
                    }
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Payment Form */}
        {clientSecret && selectedPlan && (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>{t("pricing.complete_payment", "Complete Your Payment")}</CardTitle>
              <CardDescription>
                {!stripePromise 
                  ? t("pricing.stripe_not_configured", "Payment processing is not yet configured. Please contact support.")
                  : t("pricing.payment_description", "Enter your payment details to activate your subscription")
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stripePromise ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <SubscriptionForm
                    priceType={selectedPlan}
                    onSuccess={handleSubscriptionSuccess}
                  />
                </Elements>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    {t("pricing.stripe_setup_required", "Stripe configuration is required for payments.")}
                  </p>
                  <Button onClick={() => setSelectedPlan(null)} variant="outline">
                    {t("pricing.back_to_plans", "Back to Plans")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Policies and Terms Section */}
        <div className="mt-16 bg-muted/30 rounded-lg p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
              <Shield className="w-6 h-6 text-blue-500" />
              {t("pricing.policies_title", "Payment Policies & Terms")}
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("pricing.policies_subtitle", "Important information about payments, cancellations, and refunds. Please read carefully before subscribing.")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* No Refund Policy */}
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  {t("pricing.no_refund_title", "No Refund Policy")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="font-semibold text-destructive text-sm mb-2">
                    {t("pricing.no_refund_main", "ALL PAYMENTS ARE NON-REFUNDABLE")}
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• {t("pricing.no_refund_point1", "No refunds for any reason")}</li>
                    <li>• {t("pricing.no_refund_point2", "No partial refunds for unused time")}</li>
                    <li>• {t("pricing.no_refund_point3", "Trial period is provided for evaluation")}</li>
                  </ul>
                </div>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/terms">
                    <FileText className="w-4 h-4 mr-2" />
                    {t("pricing.read_full_terms", "Read Full Terms")}
                    <ExternalLink className="w-3 h-3 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Cancellation Policy */}
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Shield className="w-5 h-5" />
                  {t("pricing.cancellation_title", "Cancellation Policy")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="font-semibold text-blue-800 dark:text-blue-200 text-sm mb-2">
                    {t("pricing.cancellation_main", "Cancel anytime, access until period ends")}
                  </p>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• {t("pricing.cancellation_point1", "Cancel from your account settings")}</li>
                    <li>• {t("pricing.cancellation_point2", "Access continues until billing period ends")}</li>
                    <li>• {t("pricing.cancellation_point3", "No charges after cancellation")}</li>
                    <li>• {t("pricing.cancellation_point4", "Resubscribe anytime")}</li>
                  </ul>
                </div>
                {isAuthenticated && (
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/subscription">
                      <CreditCard className="w-4 h-4 mr-2" />
                      {t("pricing.manage_subscription", "Manage Subscription")}
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          <Separator className="my-8" />

          {/* Security Information */}
          <div className="text-center">
            <div className="flex justify-center items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                {t("pricing.ssl_encrypted", "SSL Encrypted")}
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-500" />
                {t("pricing.stripe_powered", "Powered by Stripe")}
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" />
                {t("pricing.gdpr_compliant", "GDPR Compliant")}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold mb-8">{t("pricing.faq_title", "Frequently Asked Questions")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h4 className="font-semibold mb-2">{t("pricing.faq.trial_q", "What's included in the free trial?")}</h4>
              <p className="text-muted-foreground">
                {t("pricing.faq.trial_a", "Full access to all features for 3 weeks, no credit card required.")}
              </p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold mb-2">{t("pricing.faq.cancel_q", "Can I cancel anytime?")}</h4>
              <p className="text-muted-foreground">
                {t("pricing.faq.cancel_a", "Yes, you can cancel your subscription at any time from your account settings. Access continues until the end of your billing period.")}
              </p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold mb-2 text-destructive">{t("pricing.faq.refund_q", "Can I get a refund?")}</h4>
              <p className="text-muted-foreground">
                {t("pricing.faq.refund_a", "No, all payments are final and non-refundable. We offer a 3-week free trial to evaluate the service before payment.")}
              </p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold mb-2">{t("pricing.faq.secure_q", "Is my payment information secure?")}</h4>
              <p className="text-muted-foreground">
                {t("pricing.faq.secure_a", "Yes, all payments are processed securely through Stripe. We never store your credit card information.")}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}