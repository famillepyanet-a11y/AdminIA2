import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface StorageInfo {
  local: { used: number; total: number };
  cloud: { used: number; total: number };
}

interface AIStatus {
  pending: number;
  processed: number;
  credits: number;
  currentlyProcessing?: string;
}

export function Sidebar() {
  const { t } = useTranslation();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/statistics'],
  });

  const { data: aiQueue, isLoading: aiLoading } = useQuery({
    queryKey: ['/api/ai-queue'],
  });

  // Mock storage data (would come from API in production)
  const storageInfo: StorageInfo = {
    local: { used: 2.4 * 1024 * 1024 * 1024, total: 5 * 1024 * 1024 * 1024 },
    cloud: { used: 1.2 * 1024 * 1024 * 1024, total: 10 * 1024 * 1024 * 1024 }
  };

  const formatStorage = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  const getStoragePercentage = (used: number, total: number) => {
    return Math.round((used / total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Storage Statistics */}
      <Card>
        <CardContent className="p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4">
            {t('storage.title')}
          </h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-foreground">{t('storage.local')}</span>
                <span className="text-sm text-muted-foreground">
                  <span data-testid="text-storage-local">
                    {formatStorage(storageInfo.local.used)} / {formatStorage(storageInfo.local.total)}
                  </span>
                </span>
              </div>
              <Progress 
                value={getStoragePercentage(storageInfo.local.used, storageInfo.local.total)}
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-foreground">{t('storage.cloud')}</span>
                <span className="text-sm text-muted-foreground">
                  <span data-testid="text-storage-cloud">
                    {formatStorage(storageInfo.cloud.used)} / {formatStorage(storageInfo.cloud.total)}
                  </span>
                </span>
              </div>
              <Progress 
                value={getStoragePercentage(storageInfo.cloud.used, storageInfo.cloud.total)}
                className="h-2"
              />
            </div>
          </div>
          <Button 
            data-testid="button-sync-cloud"
            className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 text-sm font-medium"
          >
            <i className="fas fa-cloud-upload-alt mr-2" />
            {t('storage.sync')}
          </Button>
        </CardContent>
      </Card>

      {/* AI Processing Status */}
      <Card>
        <CardContent className="p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4">
            {t('ai.title')}
          </h4>
          {aiLoading || statsLoading ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-8" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-6" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">{t('ai.pending')}</span>
                <span className="text-sm font-medium text-yellow-600">
                  <span data-testid="text-ai-pending">{stats?.pendingProcessing || 0}</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">{t('ai.processed')}</span>
                <span className="text-sm font-medium text-accent">
                  <span data-testid="text-ai-processed">{stats?.processedToday || 0}</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">{t('ai.credits')}</span>
                <span className="text-sm font-medium text-primary">
                  <span data-testid="text-ai-credits">847</span>
                </span>
              </div>
            </div>
          )}
          
          {aiQueue && aiQueue.some((item: any) => item.status === 'processing') && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-sm text-foreground">{t('ai.processing')}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Document en cours...
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardContent className="p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4">
            {t('links.title')}
          </h4>
          <div className="space-y-3">
            <a 
              href="#"
              data-testid="link-help"
              className="flex items-center space-x-3 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <i className="fas fa-question-circle" />
              <span>{t('links.help')}</span>
            </a>
            <a 
              href="#"
              data-testid="link-tutorial"
              className="flex items-center space-x-3 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <i className="fas fa-graduation-cap" />
              <span>{t('links.tutorial')}</span>
            </a>
            <a 
              href="#"
              data-testid="link-support"
              className="flex items-center space-x-3 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <i className="fas fa-headset" />
              <span>{t('links.support')}</span>
            </a>
            <a 
              href="#"
              data-testid="link-docs"
              className="flex items-center space-x-3 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <i className="fas fa-book" />
              <span>{t('links.docs')}</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
