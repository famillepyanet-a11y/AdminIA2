const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Ensure shared types can be imported from parent directory
config.watchFolders = [
  path.resolve(__dirname, '../shared'),
];

// Configure Metro to handle TypeScript files from shared directory
config.resolver.platforms = ['native', 'ios', 'android', 'web'];
config.resolver.alias = {
  '@shared': path.resolve(__dirname, '../shared'),
};

// Configure transformer to handle shared TypeScript files
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;