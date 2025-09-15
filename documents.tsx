import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { MobileNavigation } from "@/components/MobileNavigation";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Document } from "@shared/schema";
import type { UploadResult } from "@uppy/core";

export default function DocumentsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: { name: string; originalName: string; mimeType: string; size: number; objectPath: string }) => {
      const response = await apiRequest('POST', '/api/documents', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      toast({
        title: "Succès",
        description: "Document téléchargé avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: t('error.upload'),
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (documentId: string) => {
      await apiRequest('DELETE', `/api/documents/${documentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      toast({
        title: "Succès",
        description: "Document supprimé avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression",
        variant: "destructive",
      });
    }
  });

  const analyzeMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const response = await apiRequest('POST', `/api/documents/${documentId}/analyze`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: "Succès",
        description: "Analyse IA terminée",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: t('error.analysis'),
        variant: "destructive",
      });
    }
  });

  const getUploadParameters = async () => {
    const response = await fetch('/api/documents/upload-url', {
      method: 'POST',
    });
    const data = await response.json();
    return {
      method: 'PUT' as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    result.successful.forEach((file) => {
      uploadMutation.mutate({
        name: file.name,
        originalName: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size || 0,
        objectPath: file.uploadURL || '',
      });
    });
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return { icon: 'fas fa-file-pdf', color: 'text-red-600', bg: 'bg-red-500/10' };
    if (mimeType.includes('word')) return { icon: 'fas fa-file-word', color: 'text-blue-600', bg: 'bg-blue-500/10' };
    if (mimeType.includes('image')) return { icon: 'fas fa-file-image', color: 'text-green-600', bg: 'bg-green-500/10' };
    return { icon: 'fas fa-file', color: 'text-gray-600', bg: 'bg-gray-500/10' };
  };

  const formatFileSize = (bytes: number): string => {
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('nav.documents')}
            </h1>
            <p className="text-muted-foreground">
              Gérez tous vos documents en un seul endroit
            </p>
          </div>
          <ObjectUploader
            maxNumberOfFiles={5}
            maxFileSize={50 * 1024 * 1024} // 50MB
            onGetUploadParameters={getUploadParameters}
            onComplete={handleUploadComplete}
            buttonClassName="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <div className="flex items-center gap-2">
              <i className="fas fa-cloud-upload-alt" />
              <span>{t('button.upload')}</span>
            </div>
          </ObjectUploader>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  data-testid="input-document-search"
                  placeholder="Rechercher des documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger data-testid="select-document-category" className="w-full sm:w-48">
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.name}>
                      {t(`categories.${category.name}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Documents Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <i className="fas fa-inbox text-4xl text-muted-foreground mb-4 block" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Aucun document trouvé
              </h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Essayez d\'ajuster vos filtres de recherche.'
                  : 'Commencez par télécharger votre premier document.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((document) => {
              const fileIcon = getFileIcon(document.mimeType);
              
              return (
                <Card key={document.id} data-testid={`card-document-${document.id}`} className="hover-lift">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`w-12 h-12 ${fileIcon.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <i className={`${fileIcon.icon} ${fileIcon.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate mb-1">
                          {document.name}
                        </h3>
                        <div className="text-sm text-muted-foreground mb-2">
                          {document.category && t(`categories.${document.category}`)} • {formatFileSize(document.size)}
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge
                            variant={document.status === 'completed' ? 'default' : 'secondary'}
                            className={
                              document.status === 'completed' ? 'bg-accent/10 text-accent' :
                              document.status === 'processing' ? 'bg-yellow-500/10 text-yellow-600' :
                              document.status === 'error' ? 'bg-destructive/10 text-destructive' :
                              'bg-blue-500/10 text-blue-600'
                            }
                          >
                            {t(`status.${document.status}`)}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            {document.status === 'pending' && (
                              <Button
                                data-testid={`button-analyze-${document.id}`}
                                size="sm"
                                variant="ghost"
                                onClick={() => analyzeMutation.mutate(document.id)}
                                disabled={analyzeMutation.isPending}
                                className="p-1 h-6 w-6"
                              >
                                <i className="fas fa-brain text-xs" />
                              </Button>
                            )}
                            <Button
                              data-testid={`button-download-${document.id}`}
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(document.objectPath, '_blank')}
                              className="p-1 h-6 w-6"
                            >
                              <i className="fas fa-download text-xs" />
                            </Button>
                            <Button
                              data-testid={`button-delete-${document.id}`}
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteMutation.mutate(document.id)}
                              disabled={deleteMutation.isPending}
                              className="p-1 h-6 w-6 text-destructive hover:text-destructive"
                            >
                              <i className="fas fa-trash text-xs" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <MobileNavigation />
    </div>
  );
}
