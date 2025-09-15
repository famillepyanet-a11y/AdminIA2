import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useApiQuery } from '@/hooks/useApi';
import { 
  Header, 
  Card, 
  Text, 
  Button, 
  Badge, 
  LoadingSpinner, 
  Skeleton,
  FloatingActionButton 
} from '@/components/ui';
import { API_ENDPOINTS } from '@/constants/api';
import { colors, spacing, typography } from '@/constants/theme';
import type { MainTabScreenProps } from '@/navigation/types';

interface DashboardStats {
  totalDocuments: number;
  processingDocuments: number;
  completedDocuments: number;
  recentActivity: {
    id: string;
    title: string;
    status: string;
    timestamp: string;
  }[];
}

export function DashboardScreen({ navigation }: MainTabScreenProps<'Dashboard'>) {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  
  const {
    data: stats,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useApiQuery<DashboardStats>(
    ['dashboard', 'stats'],
    API_ENDPOINTS.DASHBOARD_STATS,
    {
      enabled: isAuthenticated,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  const handleQuickScan = () => {
    navigation.navigate('Scan');
  };

  const handleViewAllDocuments = () => {
    navigation.navigate('Documents');
  };

  const handleUploadFiles = () => {
    navigation.navigate('Upload');
  };

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <Card style={styles.actionCard}>
          <View style={styles.actionContent}>
            <Text style={styles.actionIcon}>📷</Text>
            <Text style={styles.actionTitle}>Scan Document</Text>
            <Text style={styles.actionDescription}>
              Use camera to capture
            </Text>
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onPress={handleQuickScan}
            >
              Scan
            </Button>
          </View>
        </Card>

        <Card style={styles.actionCard}>
          <View style={styles.actionContent}>
            <Text style={styles.actionIcon}>📁</Text>
            <Text style={styles.actionTitle}>Upload Files</Text>
            <Text style={styles.actionDescription}>
              Select from gallery
            </Text>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onPress={handleUploadFiles}
            >
              Upload
            </Button>
          </View>
        </Card>
      </View>
    </View>
  );

  const renderStats = () => {
    if (!stats) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{stats.totalDocuments}</Text>
              <Text style={styles.statLabel}>Total Documents</Text>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{stats.processingDocuments}</Text>
              <Text style={styles.statLabel}>Processing</Text>
              <Badge variant="warning" size="sm">
                In Progress
              </Badge>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{stats.completedDocuments}</Text>
              <Text style={styles.statLabel}>Completed</Text>
              <Badge variant="success" size="sm">
                Done
              </Badge>
            </View>
          </Card>
        </View>
      </View>
    );
  };

  const renderRecentActivity = () => {
    if (!stats?.recentActivity?.length) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Button
            variant="ghost"
            size="sm"
            onPress={handleViewAllDocuments}
          >
            View All
          </Button>
        </View>

        <View style={styles.activityList}>
          {stats.recentActivity.slice(0, 5).map((activity) => (
            <Card key={activity.id} style={styles.activityCard}>
              <View style={styles.activityContent}>
                <View style={styles.activityDetails}>
                  <Text style={styles.activityTitle} numberOfLines={1}>
                    {activity.title}
                  </Text>
                  <Text style={styles.activityTimestamp}>
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </Text>
                </View>
                <Badge
                  variant={
                    activity.status === 'completed' ? 'success' :
                    activity.status === 'processing' ? 'warning' : 'default'
                  }
                  size="sm"
                >
                  {activity.status}
                </Badge>
              </View>
            </Card>
          ))}
        </View>
      </View>
    );
  };

  const renderWelcome = () => (
    <View style={styles.welcomeSection}>
      <Text style={styles.welcomeTitle}>
        Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
      </Text>
      <Text style={styles.welcomeSubtitle}>
        Manage your documents with AI-powered processing
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title={t('nav.dashboard')} />
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <Skeleton height={60} style={{ marginBottom: spacing.lg }} />
          <Skeleton height={120} style={{ marginBottom: spacing.lg }} />
          <Skeleton height={200} style={{ marginBottom: spacing.lg }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('nav.dashboard')} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderWelcome()}
        {renderQuickActions()}
        {renderStats()}
        {renderRecentActivity()}
      </ScrollView>

      <FloatingActionButton
        icon="plus"
        onPress={handleQuickScan}
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl + 60, // Account for FAB
  },
  welcomeSection: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  welcomeTitle: {
    ...typography.headlineMedium,
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  welcomeSubtitle: {
    ...typography.bodyLarge,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.titleLarge,
    color: colors.onSurface,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  actionContent: {
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  actionTitle: {
    ...typography.labelLarge,
    color: colors.onSurface,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionDescription: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  statContent: {
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statNumber: {
    ...typography.headlineSmall,
    color: colors.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  activityList: {
    gap: spacing.sm,
  },
  activityCard: {
    backgroundColor: colors.surface,
  },
  activityContent: {
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityDetails: {
    flex: 1,
    marginRight: spacing.md,
  },
  activityTitle: {
    ...typography.bodyMedium,
    color: colors.onSurface,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  activityTimestamp: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
  },
});