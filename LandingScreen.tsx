import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Button, Card, Text, LoadingSpinner, Toast } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';
import type { AuthStackScreenProps } from '@/navigation/types';

export function LandingScreen({ navigation }: AuthStackScreenProps<'Landing'>) {
  const { t } = useTranslation();
  const { login, isLoggingIn, error } = useAuth();
  const [showError, setShowError] = React.useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login error:', error);
      setShowError(true);
    }
  };

  const features = [
    {
      title: t('actions.scan.title'),
      description: t('actions.scan.description'),
      icon: '📱',
    },
    {
      title: t('actions.ai.title'),
      description: t('actions.ai.description'),
      icon: '🤖',
    },
    {
      title: t('storage.title'),
      description: t('storage.sync'),
      icon: '☁️',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('app.title')}</Text>
          <Text style={styles.subtitle}>{t('app.subtitle')}</Text>
        </View>

        <View style={styles.features}>
          {features.map((feature, index) => (
            <Card key={index} style={styles.featureCard}>
              <Card.Content style={styles.cardContent}>
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </Card.Content>
            </Card>
          ))}
        </View>

        <View style={styles.actions}>
          {isLoggingIn ? (
            <LoadingSpinner 
              text="Connecting to Replit..."
              centered={false}
            />
          ) : (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleLogin}
              disabled={isLoggingIn}
            >
              {t('button.login')}
            </Button>
          )}
        </View>
      </ScrollView>
      
      <Toast
        visible={showError}
        message={error?.message || 'Authentication failed. Please try again.'}
        type="error"
        onDismiss={() => setShowError(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginVertical: spacing.xxl,
  },
  title: {
    ...typography.headlineLarge,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  features: {
    flex: 1,
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  featureCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  cardContent: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  featureTitle: {
    ...typography.titleMedium,
    color: colors.onSurface,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  featureDescription: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  actions: {
    gap: spacing.md,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  loginButtonText: {
    ...typography.labelLarge,
    color: colors.onPrimary,
  },
});