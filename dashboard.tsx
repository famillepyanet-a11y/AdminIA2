import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { QuickActions } from "@/components/QuickActions";
import { DocumentCategories } from "@/components/DocumentCategories";
import { RecentDocuments } from "@/components/RecentDocuments";
import { Sidebar } from "@/components/Sidebar";
import { MobileNavigation } from "@/components/MobileNavigation";
import { OfflineStatusIndicator } from "@/components/OfflineStatusIndicator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { t } = useTranslation();

  const { data: stats, isLoading } = useQuery<{
    totalDocuments: number;
    processedToday: number;
  }>({
    queryKey: ['/api/statistics'],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {t('welcome.greeting', { name: 'Jean Dupont' })}
              </h2>
              <p className="text-muted-foreground">
                {t('welcome.subtitle')}
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <div className="text-center">
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mx-auto mb-1" />
                ) : (
                  <div className="text-2xl font-bold text-primary" data-testid="text-total-documents">
                    {stats?.totalDocuments || 0}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  {t('stats.documents')}
                </div>
              </div>
              <div className="text-center">
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mx-auto mb-1" />
                ) : (
                  <div className="text-2xl font-bold text-accent" data-testid="text-processed-today">
                    {stats?.processedToday || 0}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  {t('stats.processedToday')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Document Categories and Recent Documents */}
          <div className="lg:col-span-2 space-y-8">
            <DocumentCategories />
            <RecentDocuments />
          </div>

          {/* Sidebar */}
          <Sidebar />
        </div>
      </main>

      {/* Floating Action Button */}
      <Button
        data-testid="button-floating-scan"
        size="lg"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 z-40 md:bottom-6"
      >
        <i className="fas fa-camera text-xl" />
      </Button>

      <OfflineStatusIndicator />
      <MobileNavigation />
    </div>
  );
}
