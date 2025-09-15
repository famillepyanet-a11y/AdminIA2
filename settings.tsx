import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Settings, 
  Wifi, 
  WifiOff, 
  Globe, 
  HardDrive, 
  RotateCw, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  Upload,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LanguageSelector } from "@/components/LanguageSelector";

// Offline storage service
class OfflineStorageService {
  private static readonly OFFLINE_KEY = "adminIA_offline_mode";
  private static readonly DOCUMENTS_KEY = "adminIA_offline_documents";
  private static readonly SYNC_QUEUE_KEY = "adminIA_sync_queue";

  static isOfflineMode(): boolean {
    return localStorage.getItem(this.OFFLINE_KEY) === "true";
  }

  static setOfflineMode(enabled: boolean): void {
    localStorage.setItem(this.OFFLINE_KEY, enabled.toString());
    window.dispatchEvent(new CustomEvent("offlineModeChanged", { detail: { enabled } }));
  }

  static getOfflineDocuments() {
    const docs = localStorage.getItem(this.DOCUMENTS_KEY);
    return docs ? JSON.parse(docs) : [];
  }

  static saveOfflineDocument(document: any) {
    const docs = this.getOfflineDocuments();
    docs.push({ ...document, id: Date.now().toString(), offline: true, createdAt: new Date() });
    localStorage.setItem(this.DOCUMENTS_KEY, JSON.stringify(docs));
  }

  static getSyncQueue() {
    const queue = localStorage.getItem(this.SYNC_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  }

  static addToSyncQueue(item: any) {
    const queue = this.getSyncQueue();
    queue.push(item);
    localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(queue));
  }

  static clearSyncQueue() {
    localStorage.removeItem(this.SYNC_QUEUE_KEY);
  }

  static getOfflineStorageSize(): number {
    let total = 0;
    for (let key in localStorage) {
      if (key.startsWith("adminIA_")) {
        total += localStorage[key].length;
      }
    }
    return total;
  }

  static clearOfflineData() {
    const keys = Object.keys(localStorage).filter(key => key.startsWith("adminIA_"));
    keys.forEach(key => localStorage.removeItem(key));
  }
}

// Connection status hook
function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const isOnline = useConnectionStatus();
  const [offlineMode, setOfflineMode] = useState(OfflineStorageService.isOfflineMode());
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [storageSize, setStorageSize] = useState(0);

  // Update storage size
  useEffect(() => {
    const updateStorageSize = () => {
      setStorageSize(OfflineStorageService.getOfflineStorageSize());
    };
    
    updateStorageSize();
    const interval = setInterval(updateStorageSize, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOfflineModeToggle = (enabled: boolean) => {
    setOfflineMode(enabled);
    OfflineStorageService.setOfflineMode(enabled);
    
    toast({
      title: enabled ? 
        t("settings.offline_enabled", "Offline mode enabled") : 
        t("settings.offline_disabled", "Offline mode disabled"),
      description: enabled ?
        t("settings.offline_enabled_desc", "You can now use AdminIA without internet connection") :
        t("settings.offline_disabled_desc", "AdminIA will require internet connection"),
    });
  };

  const handleSyncData = async () => {
    if (!isOnline) {
      toast({
        title: t("settings.sync_offline_error", "Cannot sync while offline"),
        description: t("settings.sync_offline_desc", "Please connect to the internet to sync your data"),
        variant: "destructive",
      });
      return;
    }

    setSyncInProgress(true);
    try {
      const syncQueue = OfflineStorageService.getSyncQueue();
      const offlineDocuments = OfflineStorageService.getOfflineDocuments();
      
      // Simulate sync process (in real implementation, you'd sync with the server)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      OfflineStorageService.clearSyncQueue();
      
      toast({
        title: t("settings.sync_success", "Data synchronized"),
        description: t("settings.sync_success_desc", "All offline changes have been synchronized"),
      });
    } catch (error) {
      toast({
        title: t("settings.sync_error", "Synchronization failed"),
        description: t("settings.sync_error_desc", "Failed to sync offline data. Please try again."),
        variant: "destructive",
      });
    } finally {
      setSyncInProgress(false);
    }
  };

  const handleClearOfflineData = () => {
    OfflineStorageService.clearOfflineData();
    setStorageSize(0);
    toast({
      title: t("settings.data_cleared", "Offline data cleared"),
      description: t("settings.data_cleared_desc", "All offline data has been removed"),
    });
  };

  const formatStorageSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const offlineDocuments = OfflineStorageService.getOfflineDocuments();
  const syncQueue = OfflineStorageService.getSyncQueue();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Settings className="w-8 h-8" />
            {t("nav.settings", "Settings")}
          </h1>
          <p className="text-muted-foreground">
            {t("settings.subtitle", "Manage your AdminIA preferences and offline functionality")}
          </p>
        </div>

        {/* Connection Status */}
        <Card className="mb-6" data-testid="card-connection-status">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <Wifi className="w-5 h-5 text-green-500" />
                  {t("settings.connection.online", "Online")}
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5 text-red-500" />
                  {t("settings.connection.offline", "Offline")}
                </>
              )}
            </CardTitle>
            <CardDescription>
              {isOnline 
                ? t("settings.connection.online_desc", "Connected to the internet")
                : t("settings.connection.offline_desc", "No internet connection available")
              }
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Offline Mode Settings */}
        <Card className="mb-6" data-testid="card-offline-settings">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              {t("settings.offline.title", "Offline Mode")}
            </CardTitle>
            <CardDescription>
              {t("settings.offline.description", "Use AdminIA without an internet connection")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="offline-mode" className="text-base font-medium">
                  {t("settings.offline.enable", "Enable offline mode")}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("settings.offline.enable_desc", "Documents and analyses will be stored locally")}
                </p>
              </div>
              <Switch
                id="offline-mode"
                checked={offlineMode}
                onCheckedChange={handleOfflineModeToggle}
                data-testid="switch-offline-mode"
              />
            </div>

            {offlineMode && (
              <Alert>
                <HardDrive className="h-4 w-4" />
                <AlertDescription>
                  {t("settings.offline.warning", "In offline mode, your data is stored locally on this device. Make sure to sync regularly to avoid data loss.")}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Offline Data Management */}
        {offlineMode && (
          <Card className="mb-6" data-testid="card-offline-data">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="w-5 h-5" />
                {t("settings.offline.data_title", "Offline Data")}
              </CardTitle>
              <CardDescription>
                {t("settings.offline.data_desc", "Manage your locally stored documents and synchronization")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Storage Usage */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>{t("settings.storage.usage", "Storage used")}</Label>
                  <Badge variant="secondary" data-testid="badge-storage-size">
                    {formatStorageSize(storageSize)}
                  </Badge>
                </div>
                <Progress value={Math.min((storageSize / (10 * 1024 * 1024)) * 100, 100)} className="w-full" />
                <p className="text-xs text-muted-foreground">
                  {t("settings.storage.limit", "Up to 10MB of local storage available")}
                </p>
              </div>

              <Separator />

              {/* Offline Documents */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>{t("settings.offline.documents", "Offline documents")}</Label>
                  <Badge variant="outline" data-testid="badge-offline-docs-count">
                    {offlineDocuments.length}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("settings.offline.documents_desc", "Documents stored locally for offline access")}
                </p>
              </div>

              {/* Sync Queue */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>{t("settings.sync.queue", "Pending sync")}</Label>
                  <Badge 
                    variant={syncQueue.length > 0 ? "destructive" : "secondary"}
                    data-testid="badge-sync-queue-count"
                  >
                    {syncQueue.length}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("settings.sync.queue_desc", "Changes waiting to be synchronized")}
                </p>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleSyncData}
                  disabled={!isOnline || syncInProgress || syncQueue.length === 0}
                  className="flex-1"
                  data-testid="button-sync-data"
                >
                  {syncInProgress ? (
                    <>
                      <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                      {t("settings.sync.syncing", "Syncing...")}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {t("settings.sync.sync_now", "Sync now")}
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleClearOfflineData}
                  disabled={storageSize === 0}
                  data-testid="button-clear-offline-data"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t("settings.offline.clear_data", "Clear offline data")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Language Settings */}
        <Card className="mb-6" data-testid="card-language-settings">
          <CardHeader>
            <CardTitle>{t("settings.language.title", "Language")}</CardTitle>
            <CardDescription>
              {t("settings.language.description", "Choose your preferred language for AdminIA")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LanguageSelector />
          </CardContent>
        </Card>

        {/* Sync Status */}
        {offlineMode && syncQueue.length > 0 && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t("settings.sync.pending_warning", "You have {{count}} pending changes that need to be synchronized when you're back online.", { count: syncQueue.length })}
            </AlertDescription>
          </Alert>
        )}
      </main>
    </div>
  );
}