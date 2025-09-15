import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { queryClient } from "@/lib/queryClient";

export default function SubscriptionSuccessPage() {
  const { t } = useTranslation();

  useEffect(() => {
    // Invalidate subscription status to refresh data
    queryClient.invalidateQueries({ queryKey: ["/api/subscription/status"] });
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">
            {t("subscription_success.title", "Payment Successful!")}
          </CardTitle>
          <CardDescription>
            {t("subscription_success.subtitle", "Your subscription has been activated")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {t("subscription_success.description", "Thank you for subscribing to AdminIA. You now have full access to all premium features.")}
          </p>
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full" data-testid="button-dashboard">
              <Link href="/">
                {t("subscription_success.go_to_dashboard", "Go to Dashboard")}
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full" data-testid="button-subscription">
              <Link href="/subscription">
                {t("subscription_success.manage_subscription", "Manage Subscription")}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}