import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Import translations from the web app (we'll share the same translations)
const resources = {
  fr: {
    translation: {
      // Header
      'app.title': 'AdminIA',
      'app.subtitle': 'Gestionnaire Intelligent',
      'nav.dashboard': 'Tableau de bord',
      'nav.documents': 'Documents',
      'nav.analysis': 'Analyses',
      'nav.settings': 'Paramètres',
      
      // Welcome section
      'welcome.greeting': 'Bonjour, {{name}} 👋',
      'welcome.subtitle': 'Gérez vos documents intelligemment avec l\'IA',
      'stats.documents': 'Documents',
      'stats.processedToday': 'Traités aujourd\'hui',
      
      // Quick actions
      'actions.scan.title': 'Scanner un document',
      'actions.scan.description': 'Utilisez votre caméra pour numériser instantanément vos documents',
      'actions.upload.title': 'Importer des fichiers',
      'actions.upload.description': 'Sélectionnez vos fichiers à traiter',
      'actions.upload.formats': 'PDF, JPG, PNG, DOCX supportés',
      'actions.ai.title': 'Analyse IA',
      'actions.ai.description': 'Extraction automatique d\'informations avec OpenAI',
      'actions.ai.active': 'IA active',
      
      // Categories
      'categories.title': 'Catégories de documents',
      'categories.viewAll': 'Voir tout',
      'categories.thisWeek': 'Cette semaine',
      'categories.factures': 'Factures',
      'categories.contrats': 'Contrats',
      'categories.medical': 'Médical',
      'categories.legal': 'Légal',
      'categories.correspondence': 'Correspondance',
      'categories.financial': 'Financier',
      'categories.administrative': 'Administratif',
      'categories.other': 'Autres',
      
      // Recent documents
      'documents.recent': 'Documents récents',
      'documents.viewAll': 'Voir tout',
      'status.completed': 'Traité',
      'status.processing': 'En cours',
      'status.pending': 'En attente',
      'status.error': 'Erreur',
      
      // Sidebar
      'storage.title': 'Stockage',
      'storage.local': 'Local',
      'storage.cloud': 'Cloud',
      'storage.sync': 'Synchroniser vers le cloud',
      'ai.title': 'Traitement IA',
      'ai.pending': 'Documents en attente',
      'ai.processed': 'Traités aujourd\'hui',
      'ai.credits': 'Crédits IA restants',
      'ai.processing': 'Traitement en cours...',
      
      // Mobile specific
      'mobile.home': 'Accueil',
      'mobile.documents': 'Documents',
      'mobile.scan': 'Scanner',
      'mobile.settings': 'Réglages',
      
      // Common
      'button.upload': 'Télécharger',
      'button.scan': 'Scanner',
      'button.analyze': 'Analyser',
      'button.delete': 'Supprimer',
      'button.cancel': 'Annuler',
      'button.save': 'Sauvegarder',
      'button.continue': 'Continuer',
      'button.login': 'Se connecter',
      'button.logout': 'Se déconnecter',
      
      // Error messages
      'error.upload': 'Erreur lors du téléchargement',
      'error.analysis': 'Erreur lors de l\'analyse IA',
      'error.network': 'Erreur de connexion',
      'error.permissions': 'Permissions requises',
      'error.camera': 'Impossible d\'accéder à la caméra',
      
      // Success messages
      'success.upload': 'Fichier téléchargé avec succès',
      'success.analysis': 'Analyse terminée',
      'success.scan': 'Document scanné avec succès',
    }
  },
  en: {
    translation: {
      // Header
      'app.title': 'AdminIA',
      'app.subtitle': 'Smart Manager',
      'nav.dashboard': 'Dashboard',
      'nav.documents': 'Documents',
      'nav.analysis': 'Analysis',
      'nav.settings': 'Settings',
      
      // Welcome section
      'welcome.greeting': 'Hello, {{name}} 👋',
      'welcome.subtitle': 'Manage your documents intelligently with AI',
      'stats.documents': 'Documents',
      'stats.processedToday': 'Processed today',
      
      // Quick actions
      'actions.scan.title': 'Scan a document',
      'actions.scan.description': 'Use your camera to instantly digitize your documents',
      'actions.upload.title': 'Upload files',
      'actions.upload.description': 'Select your files to process',
      'actions.upload.formats': 'PDF, JPG, PNG, DOCX supported',
      'actions.ai.title': 'AI Analysis',
      'actions.ai.description': 'Automatic information extraction with OpenAI',
      'actions.ai.active': 'AI active',
      
      // Categories
      'categories.title': 'Document categories',
      'categories.viewAll': 'View all',
      'categories.thisWeek': 'This week',
      'categories.factures': 'Invoices',
      'categories.contrats': 'Contracts',
      'categories.medical': 'Medical',
      'categories.legal': 'Legal',
      'categories.correspondence': 'Correspondence',
      'categories.financial': 'Financial',
      'categories.administrative': 'Administrative',
      'categories.other': 'Other',
      
      // Recent documents
      'documents.recent': 'Recent documents',
      'documents.viewAll': 'View all',
      'status.completed': 'Completed',
      'status.processing': 'Processing',
      'status.pending': 'Pending',
      'status.error': 'Error',
      
      // Mobile specific
      'mobile.home': 'Home',
      'mobile.documents': 'Documents',
      'mobile.scan': 'Scan',
      'mobile.settings': 'Settings',
      
      // Common
      'button.upload': 'Upload',
      'button.scan': 'Scan',
      'button.analyze': 'Analyze',
      'button.delete': 'Delete',
      'button.cancel': 'Cancel',
      'button.save': 'Save',
      'button.continue': 'Continue',
      'button.login': 'Login',
      'button.logout': 'Logout',
      
      // Error messages
      'error.upload': 'Upload error',
      'error.analysis': 'AI analysis error',
      'error.network': 'Network error',
      'error.permissions': 'Permissions required',
      'error.camera': 'Unable to access camera',
      
      // Success messages
      'success.upload': 'File uploaded successfully',
      'success.analysis': 'Analysis completed',
      'success.scan': 'Document scanned successfully',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3', // For React Native compatibility
    resources,
    lng: Localization.locale.split('-')[0] || 'en', // Use device locale
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false, // React already escapes
    },
    
    react: {
      useSuspense: false, // Avoid suspense for React Native
    },
  });

export default i18n;