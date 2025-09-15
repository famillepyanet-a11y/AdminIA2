import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info, Shield, CreditCard } from "lucide-react";

export default function TermsOfServicePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="heading-terms">
            {t("terms.title", "Conditions Générales de Vente")}
          </h1>
          <p className="text-muted-foreground">
            {t("terms.subtitle", "Dernière mise à jour : 15 septembre 2025")}
          </p>
        </div>

        {/* Important notices */}
        <div className="grid gap-4 mb-8">
          <Alert data-testid="alert-no-refund">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="font-medium">
              {t("terms.no_refund_notice", "IMPORTANT : Tous les abonnements sont NON REMBOURSABLES. Veuillez lire attentivement nos conditions avant de vous abonner.")}
            </AlertDescription>
          </Alert>
          
          <Alert data-testid="alert-cancellation">
            <Info className="h-4 w-4" />
            <AlertDescription>
              {t("terms.cancellation_notice", "Vous pouvez annuler votre abonnement à tout moment depuis votre compte. L'annulation prend effet à la fin de votre période de facturation actuelle.")}
            </AlertDescription>
          </Alert>
        </div>

        <div className="space-y-8">
          {/* Service Description */}
          <Card data-testid="card-service-description">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                {t("terms.service.title", "1. Description du Service")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{t("terms.service.description", "AdminIA est un service de gestion intelligente de documents utilisant l'intelligence artificielle pour analyser, classer et extraire des informations de vos documents.")}</p>
              <div>
                <h4 className="font-semibold mb-2">{t("terms.service.features", "Fonctionnalités incluses :")}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("terms.service.feature1", "Traitement illimité de documents")}</li>
                  <li>{t("terms.service.feature2", "Analyse IA avec OpenAI")}</li>
                  <li>{t("terms.service.feature3", "Stockage cloud sécurisé")}</li>
                  <li>{t("terms.service.feature4", "Support technique")}</li>
                  <li>{t("terms.service.feature5", "Interface web et mobile")}</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Pricing and Billing */}
          <Card data-testid="card-pricing">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                {t("terms.pricing.title", "2. Tarification et Facturation")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">{t("terms.pricing.plans", "Plans disponibles :")}</h4>
                <div className="grid gap-2">
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span>{t("terms.pricing.trial", "Période d'essai")}</span>
                    <Badge variant="secondary">{t("terms.pricing.trial_duration", "3 semaines gratuites")}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span>{t("terms.pricing.weekly", "Abonnement hebdomadaire")}</span>
                    <Badge variant="outline">3€ / semaine</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span>{t("terms.pricing.monthly", "Abonnement mensuel")}</span>
                    <Badge variant="outline">10€ / mois</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span>{t("terms.pricing.yearly", "Abonnement annuel")}</span>
                    <Badge variant="outline">100€ / an</Badge>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("terms.pricing.currency", "Tous les prix sont en euros (EUR) et incluent les taxes applicables.")}
              </p>
            </CardContent>
          </Card>

          {/* No Refund Policy */}
          <Card data-testid="card-no-refund" className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                {t("terms.refund.title", "3. Politique de Non-Remboursement")}
              </CardTitle>
              <CardDescription className="text-destructive">
                {t("terms.refund.subtitle", "Cette section est importante - Veuillez la lire attentivement")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <h4 className="font-bold text-destructive mb-2">
                  {t("terms.refund.no_refund_title", "AUCUN REMBOURSEMENT")}
                </h4>
                <p className="text-sm">
                  {t("terms.refund.no_refund_description", "Tous les paiements pour les abonnements AdminIA sont définitifs et NON REMBOURSABLES. Cette politique s'applique à tous les types d'abonnements (hebdomadaire, mensuel, annuel) et dans toutes les circonstances.")}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">{t("terms.refund.exceptions", "Aucune exception :")}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("terms.refund.exception1", "Changement d'avis après l'achat")}</li>
                  <li>{t("terms.refund.exception2", "Utilisation partielle du service")}</li>
                  <li>{t("terms.refund.exception3", "Problèmes techniques temporaires")}</li>
                  <li>{t("terms.refund.exception4", "Insatisfaction du service")}</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  {t("terms.refund.trial_title", "Période d'essai gratuite")}
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {t("terms.refund.trial_description", "Nous offrons une période d'essai gratuite de 3 semaines pour vous permettre d'évaluer le service avant tout engagement financier. Profitez de cette période pour tester toutes les fonctionnalités.")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cancellation Policy */}
          <Card data-testid="card-cancellation">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {t("terms.cancellation.title", "4. Politique d'Annulation")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">{t("terms.cancellation.how_to", "Comment annuler :")}</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("terms.cancellation.step1", "Connectez-vous à votre compte AdminIA")}</li>
                  <li>{t("terms.cancellation.step2", "Allez dans la section \"Abonnement\"")}</li>
                  <li>{t("terms.cancellation.step3", "Cliquez sur \"Annuler l'abonnement\"")}</li>
                  <li>{t("terms.cancellation.step4", "Confirmez votre annulation")}</li>
                </ol>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  {t("terms.cancellation.effect_title", "Effet de l'annulation")}
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {t("terms.cancellation.effect_description", "L'annulation prend effet à la fin de votre période de facturation actuelle. Vous conserverez l'accès au service jusqu'à cette date. Aucun remboursement ne sera accordé pour la période restante.")}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">{t("terms.cancellation.immediate", "Annulation immédiate :")}</h4>
                <p className="text-sm text-muted-foreground">
                  {t("terms.cancellation.immediate_description", "En cas d'annulation, votre accès au service sera maintenu jusqu'à la fin de la période déjà payée. Après cette date, votre compte passera automatiquement en mode gratuit avec les limitations associées.")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card data-testid="card-responsibilities">
            <CardHeader>
              <CardTitle>{t("terms.responsibilities.title", "5. Responsabilités de l'Utilisateur")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{t("terms.responsibilities.description", "En utilisant AdminIA, vous vous engagez à :")}</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>{t("terms.responsibilities.item1", "Utiliser le service conformément à sa destination")}</li>
                <li>{t("terms.responsibilities.item2", "Ne pas partager vos identifiants de connexion")}</li>
                <li>{t("terms.responsibilities.item3", "Respecter les droits de propriété intellectuelle")}</li>
                <li>{t("terms.responsibilities.item4", "Ne pas tenter de contourner les mesures de sécurité")}</li>
                <li>{t("terms.responsibilities.item5", "Signaler tout problème de sécurité découvert")}</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card data-testid="card-contact">
            <CardHeader>
              <CardTitle>{t("terms.contact.title", "6. Contact et Support")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{t("terms.contact.description", "Pour toute question concernant ces conditions générales de vente ou notre service :")}</p>
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-semibold mb-2">{t("terms.contact.support", "Support AdminIA")}</h4>
                <p className="text-sm text-muted-foreground">
                  {t("terms.contact.email", "Email : support@adminia.app")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("terms.contact.response", "Temps de réponse : 24-48 heures ouvrées")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="text-center text-sm text-muted-foreground" data-testid="text-last-update">
            <p>{t("terms.last_update", "Ces conditions générales de vente ont été mises à jour le 15 septembre 2025.")}</p>
            <p>{t("terms.changes", "Nous nous réservons le droit de modifier ces conditions à tout moment. Les utilisateurs seront notifiés des changements importants.")}</p>
          </div>
        </div>
      </main>
    </div>
  );
}