import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Calendar, CreditCard, AlertCircle, CheckCircle, XCircle, ExternalLink, FileText } from "lucide-react";
import { Link } from "wouter";
import type { User, Subscription } from "@shared/schema";
import { useState } from "react";

// Type definitions for API responses
interface SubscriptionStatusResponse {
  user: {
    subscriptionStatus: string;
    subscriptionType?: string;
    trialEndsAt?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    createdAt?: string;
  };
  subscription?: Subscription;
}

export default function SubscriptionPage() {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Get subscription status
  const { data: subscriptionData, isLoading: statusLoading, refetch } = useQuery<SubscriptionStatusResponse>({
    queryKey: ["/api/subscription/status"],
    enabled: isAuthenticated,
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation<{ message: string }, any>({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/subscription/cancel");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("subscription.cancel_success_title", "Subscription Canceled"),
        description: t("subscription.cancel_success_desc", "Your subscription has been canceled successfully."),
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/status"] });
    },
    onError: (error: any) => {
      toast({
        title: t("subscription.cancel_error_title", "Error"),
        description: error.message || t("subscription.cancel_error_desc", "Failed to cancel subscription"),
        variant: "destructive",
      });
    },
  });

  const handleCancelSubscription = () => {
    setShowCancelDialog(false);
    cancelSubscriptionMutation.mutate();
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>{t("subscription.auth_required", "Authentication Required")}</CardTitle>
              <CardDescription>
                {t("subscription.auth_desc", "Please log in to view your subscription details.")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href="/api/login">{t("subscription.login", "Log In")}</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { user: subscriptionUser, subscription } = subscriptionData || {};

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "trial":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "canceled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "trial":
        return <Calendar className="w-4 h-4" />;
      case "canceled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isTrialExpiring = subscriptionUser?.subscriptionStatus === "trial" && 
    subscriptionUser?.trialEndsAt && 
    new Date(subscriptionUser.trialEndsAt).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000; // 7 days

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t("subscription.title", "Subscription Management")}
          </h1>
          <p className="text-muted-foreground">
            {t("subscription.subtitle", "Manage your AdminIA subscription and billing details")}
          </p>
        </div>

        {/* Trial expiring warning */}
        {isTrialExpiring && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              {t("subscription.trial_expiring", "Your trial expires on")} {" "}
              {subscriptionUser?.trialEndsAt && formatDate(subscriptionUser.trialEndsAt)}.{" "}
              <Link href="/pricing" className="font-semibold underline">
                {t("subscription.upgrade_now", "Upgrade now")}
              </Link>{" "}
              {t("subscription.trial_expiring_desc", "to continue using AdminIA.")}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  {t("subscription.current_plan", "Current Plan")}
                </CardTitle>
                <Badge className={getStatusColor(subscriptionUser?.subscriptionStatus || "inactive")}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(subscriptionUser?.subscriptionStatus || "inactive")}
                    <span className="capitalize">
                      {t(`subscription.status.${subscriptionUser?.subscriptionStatus || "inactive"}`, subscriptionUser?.subscriptionStatus || "inactive")}
                    </span>
                  </div>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscriptionUser?.subscriptionStatus === "trial" ? (
                <div>
                  <h3 className="font-semibold text-lg">
                    {t("subscription.free_trial", "Free Trial")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("subscription.trial_description", "Full access to all features")}
                  </p>
                  {subscriptionUser?.trialEndsAt && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {t("subscription.expires", "Expires")}: {formatDate(subscriptionUser.trialEndsAt)}
                    </p>
                  )}
                </div>
              ) : subscriptionUser?.subscriptionType ? (
                <div>
                  <h3 className="font-semibold text-lg capitalize">
                    {t(`pricing.plans.${subscriptionUser.subscriptionType}.name`, subscriptionUser.subscriptionType)}
                  </h3>
                  <p className="text-2xl font-bold">
                    €{subscriptionUser.subscriptionType === "weekly" ? "3" : subscriptionUser.subscriptionType === "monthly" ? "10" : "100"}
                    <span className="text-sm font-normal text-muted-foreground">
                      {subscriptionUser.subscriptionType === "weekly" ? "/week" : subscriptionUser.subscriptionType === "monthly" ? "/month" : "/year"}
                    </span>
                  </p>
                  {subscription?.currentPeriodEnd && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {subscription.status === "canceled" 
                        ? t("subscription.ends", "Ends")
                        : t("subscription.renews", "Renews")
                      }: {formatDate(subscription.currentPeriodEnd)}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <h3 className="font-semibold text-lg">
                    {t("subscription.no_subscription", "No Active Subscription")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("subscription.no_subscription_desc", "Choose a plan to get started")}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {subscriptionUser?.subscriptionStatus === "trial" || !subscriptionUser?.subscriptionType ? (
                  <Button asChild className="flex-1" data-testid="button-upgrade">
                    <Link href="/pricing">
                      {t("subscription.choose_plan", "Choose a Plan")}
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="outline" className="flex-1" data-testid="button-change-plan">
                      <Link href="/pricing">
                        {t("subscription.change_plan", "Change Plan")}
                      </Link>
                    </Button>
                    {subscriptionUser?.subscriptionStatus === "active" && (
                      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            disabled={cancelSubscriptionMutation.isPending}
                            data-testid="button-cancel"
                          >
                            {cancelSubscriptionMutation.isPending
                              ? t("subscription.canceling", "Canceling...")
                              : t("subscription.cancel", "Cancel")
                            }
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertCircle className="w-5 h-5 text-destructive" />
                              {t("subscription.cancel_title", "Cancel Subscription?")}
                            </AlertDialogTitle>
                            <AlertDialogDescription className="space-y-3">
                              <p>
                                {t("subscription.cancel_warning", "Are you sure you want to cancel your subscription? This action cannot be undone.")}
                              </p>
                              
                              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                                <h4 className="font-semibold text-destructive text-sm mb-1">
                                  {t("subscription.cancel_effects_title", "What happens when you cancel:")}
                                </h4>
                                <ul className="text-xs text-muted-foreground space-y-1">
                                  <li>• {t("subscription.cancel_effect1", "Your access continues until the end of the current billing period")}</li>
                                  <li>• {t("subscription.cancel_effect2", "No refund will be provided for the remaining period")}</li>
                                  <li>• {t("subscription.cancel_effect3", "You can resubscribe at any time")}</li>
                                </ul>
                              </div>
                              
                              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                  {t("subscription.cancel_policy", "By canceling, you acknowledge our")}{" "}
                                  <Link href="/terms" className="font-semibold underline">
                                    {t("subscription.no_refund_policy", "no-refund policy")}
                                  </Link>
                                  {t("subscription.cancel_policy_end", ". All payments are final and non-refundable.")}
                                </p>
                              </div>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-testid="button-cancel-keep">
                              {t("subscription.keep_subscription", "Keep Subscription")}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleCancelSubscription}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              data-testid="button-cancel-confirm"
                            >
                              {t("subscription.confirm_cancel", "Yes, Cancel")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t("subscription.account_info", "Account Information")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("subscription.email", "Email")}
                </label>
                <p className="text-foreground" data-testid="text-user-email">
                  {subscriptionData?.user?.email || t("subscription.no_email", "No email provided")}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("subscription.name", "Name")}
                </label>
                <p className="text-foreground" data-testid="text-user-name">
                  {subscriptionData?.user?.firstName || subscriptionData?.user?.lastName 
                    ? `${subscriptionData.user.firstName || ""} ${subscriptionData.user.lastName || ""}`.trim()
                    : t("subscription.no_name", "No name provided")
                  }
                </p>
              </div>

              {subscriptionData?.user?.createdAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("subscription.member_since", "Member since")}
                  </label>
                  <p className="text-foreground" data-testid="text-user-created">
                    {formatDate(subscriptionData.user.createdAt)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Usage Statistics */}
        {subscriptionUser?.subscriptionStatus === "active" && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>{t("subscription.usage_stats", "Usage Statistics")}</CardTitle>
              <CardDescription>
                {t("subscription.usage_desc", "Your document processing activity")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">∞</div>
                  <p className="text-sm text-muted-foreground">
                    {t("subscription.unlimited_docs", "Unlimited Documents")}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">✓</div>
                  <p className="text-sm text-muted-foreground">
                    {t("subscription.ai_analysis", "AI Analysis")}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">☁</div>
                  <p className="text-sm text-muted-foreground">
                    {t("subscription.cloud_storage", "Cloud Storage")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Terms and Policies */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t("subscription.terms_policies", "Terms & Policies")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {t("subscription.no_refund_notice", "Important: All subscriptions are non-refundable. Please review our terms before making any changes.")}
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" asChild className="h-auto p-4 justify-start" data-testid="button-terms">
                  <Link href="/terms">
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4" />
                        {t("subscription.view_terms", "Terms of Service")}
                        <ExternalLink className="w-3 h-3" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("subscription.terms_desc", "View our complete terms and conditions")}
                      </p>
                    </div>
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="h-auto p-4 justify-start" data-testid="button-privacy">
                  <Link href="/privacy">
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-4 h-4" />
                        {t("subscription.privacy_policy", "Privacy Policy")}
                        <ExternalLink className="w-3 h-3" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("subscription.privacy_desc", "How we protect your data")}
                      </p>
                    </div>
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{t("subscription.help", "Need Help?")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {t("subscription.help_desc", "If you have any questions about your subscription, please don't hesitate to contact us.")}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" asChild data-testid="button-support">
                <a href="mailto:support@adminia.app">
                  {t("subscription.contact_support", "Contact Support")}
                </a>
              </Button>
              <Button variant="outline" asChild data-testid="button-docs">
                <Link href="/terms">
                  {t("subscription.view_docs", "View Documentation")}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}