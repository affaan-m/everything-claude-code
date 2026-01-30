---
paths:
  - "**/*.native.tsx"
  - "**/screens/**"
  - "**/navigation/**"
  - "app.json"
  - "eas.json"
  - "**/App.tsx"
  - "**/App.js"
---

# Mobile Development Rules

## React Native / Expo

- Use Expo SDK features when available
- Test on both iOS and Android
- Handle safe areas properly with SafeAreaView
- Use react-native-reanimated for performant animations
- Prefer Expo Router for navigation when possible

## File Structure

```
src/
  screens/       # Screen components
  components/    # Reusable components
  navigation/    # Navigation configuration
  hooks/         # Custom hooks
  utils/         # Utility functions
  constants/     # App constants
  types/         # TypeScript types
```

## Navigation

- Use React Navigation v6+ or Expo Router
- Type navigation props properly
- Implement deep linking
- Handle back button behavior on Android

## Performance

- Use FlatList for long lists (never ScrollView)
- Memoize expensive computations with useMemo
- Avoid inline arrow functions in render
- Use useCallback for event handlers passed as props
- Profile with React DevTools

## Styling

- Use StyleSheet.create for styles
- Avoid inline styles in production
- Use responsive units (%, flex)
- Handle different screen sizes

## Platform Specifics

- Use Platform.select for platform-specific code
- Test on multiple device sizes
- Handle notches and home indicators
- Consider Android back button behavior

## Build and Deploy

- Use EAS Build for production builds
- Configure app.json properly
- Handle environment variables
- Test on real devices before release
