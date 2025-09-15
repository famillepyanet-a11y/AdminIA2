import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useApiQuery } from '@/hooks/useApi';
import { 
  Header, 
  Card, 
  Text, 
  Button, 
  Badge, 
  LoadingSpinner, 
  Skeleton,
  FloatingActionButton,
  StatusChip
} from '@/components/ui';
import { API_ENDPOINTS } from '@/constants/api';
import { colors, spacing, typography } from '@/constants/theme';
import type { MainTabScreenProps } from '@/navigation/types';
import type { Document } from '@shared/schema';

export function DocumentsScreen({ navigation }: MainTabScreenProps<'Documents'>) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const {
    data: documents,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useApiQuery<Document[]>(
    ['documents'],
    API_ENDPOINTS.DOCUMENTS,
    {
      staleTime: 30 * 1000, // 30 seconds
    }
  );

  const handleDocumentPress = (documentId: string) => {
    navigation.navigate('DocumentDetail', { documentId });
  };

  const handleAddDocument = () => {
    navigation.navigate('Scan');
  };

  const filteredDocuments = documents?.filter(doc => {
    const matchesSearch = !searchQuery || 
      doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.filename.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || doc.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }) || [];

  const categories = documents?.reduce((acc, doc) => {
    if (doc.category && !acc.includes(doc.category)) {
      acc.push(doc.category);
    }
    return acc;
  }, [] as string[]) || [];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const renderDocument = ({ item }: { item: Document }) => (
    <Card style={styles.documentCard}>
      <View style={styles.documentContent}>
        <View style={styles.documentHeader}>
          <View style={styles.documentInfo}>
            <Text style={styles.documentTitle} numberOfLines={2}>
              {item.title || item.filename}
            </Text>
            <Text style={styles.documentFilename} numberOfLines={1}>
              {item.filename}
            </Text>
          </View>
          <StatusChip status={item.status as any} />
        </View>

        <View style={styles.documentMetadata}>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>
              📅 {formatDate(item.createdAt)}
            </Text>
            {item.fileSize && (
              <Text style={styles.metadataLabel}>
                📁 {formatFileSize(item.fileSize)}
              </Text>
            )}
          </View>
          
          {item.category && (
            <View style={styles.categoryRow}>
              <Badge variant="info" size="sm">
                {item.category}
              </Badge>
            </View>
          )}
        </View>

        <Button
          variant="outline"
          size="sm"
          fullWidth
          onPress={() => handleDocumentPress(item.id)}
          style={styles.viewButton}
        >
          View Details
        </Button>
      </View>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📄</Text>
      <Text style={styles.emptyTitle}>No Documents</Text>
      <Text style={styles.emptySubtitle}>
        Start by scanning or uploading your first document
      </Text>
      <Button
        variant="primary"
        size="lg"
        onPress={handleAddDocument}
        style={styles.emptyButton}
      >
        📷 Scan Document
      </Button>
    </View>
  );

  const renderCategoryFilter = () => {
    if (categories.length === 0) return null;

    return (
      <View style={styles.filterSection}>
        <FlatList
          horizontal
          data={[null, ...categories]}
          keyExtractor={(item) => item || 'all'}
          contentContainerStyle={styles.categoryList}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Button
              variant={selectedCategory === item ? 'primary' : 'outline'}
              size="sm"
              onPress={() => setSelectedCategory(item)}
              style={styles.categoryButton}
            >
              {item || 'All'}
            </Button>
          )}
        />
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title={t('nav.documents')} />
        <View style={styles.content}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} style={styles.skeletonCard}>
              <Skeleton height={120} style={{ margin: spacing.md }} />
            </Card>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('nav.documents')} />
      
      {renderCategoryFilter()}

      <FlatList
        data={filteredDocuments}
        keyExtractor={(item) => item.id}
        renderItem={renderDocument}
        contentContainerStyle={[
          styles.listContent,
          filteredDocuments.length === 0 && styles.emptyListContent
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <FloatingActionButton
        icon="plus"
        onPress={handleAddDocument}
        position="bottom-right"
        variant="primary"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  filterSection: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.outline,
  },
  categoryList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  categoryButton: {
    marginRight: spacing.sm,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl + 60, // Account for FAB
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  documentCard: {
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  documentContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  documentInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  documentTitle: {
    ...typography.titleMedium,
    color: colors.onSurface,
    fontWeight: '600',
  },
  documentFilename: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
  },
  documentMetadata: {
    gap: spacing.sm,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metadataLabel: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
  },
  categoryRow: {
    alignItems: 'flex-start',
  },
  viewButton: {
    marginTop: spacing.sm,
  },
  separator: {
    height: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.titleLarge,
    color: colors.onSurface,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyButton: {
    marginTop: spacing.md,
  },
  skeletonCard: {
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
});