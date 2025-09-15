import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, RotateCw } from "lucide-react";

// Offline storage service reference
declare global {
  interface Window {
    offlineStorageService: any;
  }
}

export function OfflineStatusIndicator() {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [syncInProgress, setSyncInProgress] = useState(false);

  useEffect(() => {
    // Check initial offline mode state
    const offlineMode = localStorage.getItem("adminIA_offline_mode") === "true";
    setIsOfflineMode(offlineMode);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    const handleOfflineModeChange = (event: CustomEvent) => {
      setIsOfflineMode(event.detail.enabled);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("offlineModeChanged" as any, handleOfflineModeChange);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("offlineModeChanged" as any, handleOfflineModeChange);
    };
  }, []);

  // Don't show indicator if offline mode is not enabled
  if (!isOfflineMode) {
    return null;
  }

  const getStatusVariant = () => {
    if (syncInProgress) return "secondary";
    if (!isOnline) return "destructive";
    return "default";
  };

  const getStatusText = () => {
    if (syncInProgress) return t("settings.sync.syncing", "Syncing...");
    if (!isOnline) return t("settings.connection.offline", "Offline");
    return t("settings.connection.online", "Online");
  };

  const getStatusIcon = () => {
    if (syncInProgress) return <RotateCw className="w-3 h-3 animate-spin" />;
    if (!isOnline) return <WifiOff className="w-3 h-3" />;
    return <Wifi className="w-3 h-3" />;
  };

  return (
    <Badge 
      variant={getStatusVariant()} 
      className="fixed top-4 right-4 z-50 flex items-center gap-2"
      data-testid="offline-status-indicator"
    >
      {getStatusIcon()}
      {getStatusText()}
    </Badge>
  );
}