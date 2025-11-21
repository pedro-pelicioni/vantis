module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Temporarily disabled to test if app loads
      // 'react-native-reanimated/plugin',
    ],
  };
};
