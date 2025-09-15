module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@shared': '../shared',
            '@assets': './assets',
          },
        },
      ],
      'react-native-reanimated/plugin', // Must be last
    ],
  };
};