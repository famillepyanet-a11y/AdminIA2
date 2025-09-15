import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Brain, Cloud, Zap, Shield, Users } from "lucide-react";

export default function LandingPage() {
  const { t } = useTranslation();

  const features = [
    {
      icon: <FileText className="w-8 h-8 text-blue-500" />,
      title: t("landing.features.document_processing.title", "Document Processing"),
      description: t("landing.features.document_processing.desc", "Upload and process PDF, images, and text documents with ease"),
    },
    {
      icon: <Brain className="w-8 h-8 text-purple-500" />,
      title: t("landing.features.ai_analysis.title", "AI-Powered Analysis"),
      description: t("landing.features.ai_analysis.desc", "Advanced document analysis and information extraction using OpenAI"),
    },
    {
      icon: <Cloud className="w-8 h-8 text-green-500" />,
      title: t("landing.features.cloud_storage.title", "Cloud Storage"),
      description: t("landing.features.cloud_storage.desc", "Secure cloud storage for all your documents with easy access"),
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: t("landing.features.fast_processing.title", "Fast Processing"),
      description: t("landing.features.fast_processing.desc", "Quick document analysis and categorization in seconds"),
    },
    {
      icon: <Shield className="w-8 h-8 text-red-500" />,
      title: t("landing.features.secure.title", "Secure & Private"),
      description: t("landing.features.secure.desc", "Enterprise-grade security to protect your sensitive documents"),
    },
    {
      icon: <Users className="w-8 h-8 text-indigo-500" />,
      title: t("landing.features.collaboration.title", "Team Collaboration"),
      description: t("landing.features.collaboration.desc", "Share and collaborate on documents with your team"),
    },
  ];

  const testimonials = [
    {
      name: "Marie Dubois",
      role: t("landing.testimonials.lawyer", "Lawyer"),
      content: t("landing.testimonials.marie", "AdminIA has revolutionized how I manage legal documents. The AI analysis saves me hours every week."),
    },
    {
      name: "Jean Martin",
      role: t("landing.testimonials.accountant", "Accountant"),
      content: t("landing.testimonials.jean", "Perfect for organizing invoices and financial documents. The automatic categorization is incredibly accurate."),
    },
    {
      name: "Sophie Laurent",
      role: t("landing.testimonials.consultant", "Business Consultant"),
      content: t("landing.testimonials.sophie", "The cloud storage and document processing features have streamlined our entire workflow."),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary">AdminIA</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                asChild
                variant="ghost"
                data-testid="button-login"
              >
                <a href="/api/login">
                  {t("landing.login", "Log In")}
                </a>
              </Button>
              <Button
                asChild
                data-testid="button-get-started"
              >
                <a href="/api/login">
                  {t("landing.get_started", "Get Started Free")}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {t("landing.badge", "AI-Powered Document Management")}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            {t("landing.hero.title", "Intelligent Document Management with AdminIA")}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            {t("landing.hero.subtitle", "Transform your document workflow with AI-powered analysis, automatic categorization, and secure cloud storage. Start your free 3-week trial today.")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              asChild
              data-testid="button-start-trial"
            >
              <a href="/api/login">
                {t("landing.start_free_trial", "Start Free 3-Week Trial")}
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              data-testid="button-view-pricing"
            >
              <a href="/pricing">
                {t("landing.view_pricing", "View Pricing")}
              </a>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            {t("landing.no_credit_card", "No credit card required • Cancel anytime")}
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t("landing.features.title", "Powerful Features for Modern Teams")}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t("landing.features.subtitle", "Everything you need to manage documents intelligently")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("landing.pricing.title", "Simple, Transparent Pricing")}
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            {t("landing.pricing.subtitle", "Start free, then choose the plan that fits your needs")}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Weekly Plan */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl">
                  {t("landing.pricing.weekly.name", "Weekly")}
                </CardTitle>
                <div className="text-3xl font-bold">
                  €3<span className="text-sm font-normal text-muted-foreground">/week</span>
                </div>
                <CardDescription>
                  {t("landing.pricing.weekly.desc", "Perfect for short-term projects")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/api/login">
                    {t("landing.pricing.get_started", "Get Started")}
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Monthly Plan */}
            <Card className="border-2 border-primary relative scale-105">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                {t("landing.pricing.popular", "Most Popular")}
              </Badge>
              <CardHeader>
                <CardTitle className="text-xl">
                  {t("landing.pricing.monthly.name", "Monthly")}
                </CardTitle>
                <div className="text-3xl font-bold">
                  €10<span className="text-sm font-normal text-muted-foreground">/month</span>
                </div>
                <CardDescription>
                  {t("landing.pricing.monthly.desc", "Best for professionals")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" asChild>
                  <a href="/api/login">
                    {t("landing.pricing.get_started", "Get Started")}
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Yearly Plan */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl">
                  {t("landing.pricing.yearly.name", "Yearly")}
                </CardTitle>
                <div className="text-3xl font-bold">
                  €100<span className="text-sm font-normal text-muted-foreground">/year</span>
                </div>
                <CardDescription>
                  {t("landing.pricing.yearly.desc", "Best value for teams")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/api/login">
                    {t("landing.pricing.get_started", "Get Started")}
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t("landing.testimonials.title", "Trusted by Professionals")}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t("landing.testimonials.subtitle", "See what our users say about AdminIA")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("landing.cta.title", "Ready to Transform Your Document Management?")}
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            {t("landing.cta.subtitle", "Join thousands of professionals using AdminIA to streamline their workflow")}
          </p>
          <Button
            size="lg"
            asChild
            data-testid="button-cta-start"
          >
            <a href="/api/login">
              {t("landing.cta.button", "Start Your Free Trial Now")}
            </a>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            {t("landing.cta.guarantee", "3 weeks free • No commitment • Cancel anytime")}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">
            © 2024 AdminIA. {t("landing.footer.rights", "All rights reserved.")}
          </p>
        </div>
      </footer>
    </div>
  );
}