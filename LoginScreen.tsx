import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Button, Text, LoadingSpinner, Toast } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';
import type { AuthStackScreenProps } from '@/navigation/types';

export function LoginScreen({ navigation }: AuthStackScreenProps<'Login'>) {
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

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('button.login')}</Text>
          <Text style={styles.subtitle}>
            Connect with your Replit account to continue
          </Text>
        </View>

        <View style={styles.actions}>
          {isLoggingIn ? (
            <LoadingSpinner 
              text="Connecting to Replit..."
              centered={false}
            />
          ) : (
            <>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onPress={handleLogin}
                disabled={isLoggingIn}
              >
                Continue with Replit
              </Button>
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onPress={handleBack}
              >
                {t('button.cancel')}
              </Button>
            </>
          )}
        </View>
      </View>
      
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
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.headlineMedium,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.bodyLarge,
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
  backButton: {
    borderColor: colors.outline,
    borderRadius: 8,
  },
  backButtonText: {
    ...typography.labelLarge,
    color: colors.onSurface,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
  },
});