import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Document } from "@shared/schema";

const getFileIcon = (mimeType: string) => {
  if (mimeType.includes('pdf')) return { icon: 'fas fa-file-pdf', color: 'text-red-600', bg: 'bg-red-500/10' };
  if (mimeType.includes('word')) return { icon: 'fas fa-file-word', color: 'text-blue-600', bg: 'bg-blue-500/10' };
  if (mimeType.includes('image')) return { icon: 'fas fa-file-image', color: 'text-green-600', bg: 'bg-green-500/10' };
  if (mimeType.includes('excel')) return { icon: 'fas fa-file-excel', color: 'text-green-600', bg: 'bg-green-500/10' };
  return { icon: 'fas fa-file', color: 'text-gray-600', bg: 'bg-gray-500/10' };
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`;
  if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
  return `Il y a ${Math.floor(diffInMinutes / 1440)}j`;
};

const getStatusBadge = (status: string, t: (key: string) => string) => {
  const statusConfig = {
    completed: { variant: 'default' as const, className: 'bg-accent/10 text-accent' },
    processing: { variant: 'secondary' as const, className: 'bg-yellow-500/10 text-yellow-600' },
    pending: { variant: 'outline' as const, className: 'bg-blue-500/10 text-blue-600' },
    error: { variant: 'destructive' as const, className: 'bg-destructive/10 text-destructive' },
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  
  return (
    <Badge variant={config.variant} className={config.className}>
      {t(`status.${status}`)}
    </Badge>
  );
};

export function RecentDocuments() {
  const { t } = useTranslation();

  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ['/api/documents/recent'],
    queryFn: async () => {
      const response = await fetch('/api/documents');
      const allDocuments = await response.json();
      return allDocuments.slice(0, 5); // Get recent 5 documents
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-3">
                <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="w-6 h-6" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-foreground">
            {t('documents.recent')}
          </h4>
          <Button
            data-testid="button-documents-view-all"
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            {t('documents.viewAll')}
          </Button>
        </div>

        <div className="space-y-3">
          {documents?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <i className="fas fa-inbox text-3xl mb-4 block" />
              <p>Aucun document trouvé</p>
            </div>
          ) : (
            documents?.map((document) => {
              const fileIcon = getFileIcon(document.mimeType);
              
              return (
                <div
                  key={document.id}
                  data-testid={`card-document-${document.id}`}
                  className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200 cursor-pointer"
                >
                  <div className={`w-10 h-10 ${fileIcon.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <i className={`${fileIcon.icon} ${fileIcon.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-foreground truncate">
                      <span data-testid={`text-document-name-${document.id}`}>
                        {document.name}
                      </span>
                    </h5>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span data-testid={`text-document-category-${document.id}`}>
                        {document.category ? t(`categories.${document.category}`) : t('categories.other')}
                      </span>
                      <span>•</span>
                      <span data-testid={`text-document-size-${document.id}`}>
                        {formatFileSize(document.size)}
                      </span>
                      <span>•</span>
                      <span data-testid={`text-document-date-${document.id}`}>
                        {formatTimeAgo(new Date(document.createdAt))}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span data-testid={`badge-document-status-${document.id}`}>
                      {getStatusBadge(document.status, t)}
                    </span>
                    <Button
                      data-testid={`button-document-menu-${document.id}`}
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground transition-colors duration-200 p-1"
                    >
                      <i className="fas fa-ellipsis-v" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
