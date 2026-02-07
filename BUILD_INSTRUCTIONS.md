# Build Instructions for Tree of Growth

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Add App Assets

Before building, you need to add app assets to the `assets/` directory:

- **icon.png** - 1024x1024px app icon
- **splash.png** - 1284x2778px splash screen (recommended)
- **adaptive-icon.png** - 1024x1024px Android adaptive icon
- **favicon.png** - 48x48px web favicon

You can generate these using:
- [AppIcon.co](https://www.appicon.co)
- [IconKitchen](https://icon.kitchen)
- Or any image editor

### 3. Development

```bash
# Start development server
npx expo start

# Or with specific platform
npx expo start --android
npx expo start --ios
npx expo start --web
```

## Building APK for Android

### Method 1: Local Build (Recommended for Testing)

1. **Prebuild native code:**
   ```bash
   npx expo prebuild
   ```

2. **Build APK:**
   ```bash
   npx expo run:android
   ```

   This will create an APK in: `android/app/build/outputs/apk/debug/app-debug.apk`

3. **For release APK:**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

   APK will be in: `android/app/build/outputs/apk/release/app-release.apk`

### Method 2: EAS Build (Recommended for Production)

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Configure project:**
   ```bash
   eas build:configure
   ```

4. **Build APK:**
   ```bash
   # Preview build (APK)
   eas build --platform android --profile preview

   # Production build (AAB)
   eas build --platform android --profile production
   ```

5. **Download build:**
   - Build will be available in your Expo dashboard
   - Or use: `eas build:list` to see builds

## Building for iOS

### Prerequisites
- macOS with Xcode installed
- Apple Developer account (for device testing)

### Build Steps

1. **Prebuild:**
   ```bash
   npx expo prebuild
   ```

2. **Build:**
   ```bash
   npx expo run:ios
   ```

   Or use EAS:
   ```bash
   eas build --platform ios
   ```

## Building for Web (PWA)

```bash
npm run web
```

Or build static files:
```bash
npx expo export:web
```

## GitHub Setup

### 1. Initialize Git Repository

```bash
git init
git add .
git commit -m "Initial commit: Tree of Growth app"
```

### 2. Create GitHub Repository

1. Go to GitHub and create a new repository
2. Don't initialize with README (we already have one)

### 3. Push to GitHub

```bash
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

### 4. GitHub Actions (Optional)

Create `.github/workflows/build.yml` for automated builds:

```yaml
name: Build

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npx expo export:web
```

## Environment Variables (Optional)

If you need environment variables, create `.env`:

```
EXPO_PUBLIC_API_URL=your-api-url
```

Then install `expo-constants` and access via `Constants.expoConfig.extra`.

## Troubleshooting

### Build Fails

1. **Clear cache:**
   ```bash
   npx expo start -c
   ```

2. **Clean prebuild:**
   ```bash
   npx expo prebuild --clean
   ```

3. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules
   npm install
   ```

### Android Build Issues

1. **Update Android SDK:**
   - Open Android Studio
   - SDK Manager → Update all packages

2. **Check Java version:**
   ```bash
   java -version  # Should be Java 17 or 11
   ```

3. **Clean Gradle:**
   ```bash
   cd android
   ./gradlew clean
   ```

### iOS Build Issues

1. **Update CocoaPods:**
   ```bash
   cd ios
   pod deintegrate
   pod install
   ```

2. **Check Xcode version:**
   - Requires Xcode 14+

### Image Picker Not Working

1. Check permissions in `app.json`
2. For Android, ensure `READ_MEDIA_IMAGES` permission is set
3. Test on physical device (emulator may have issues)

## Testing

### Run Tests (if you add tests)

```bash
npm test
```

### Test on Physical Device

1. Connect device via USB
2. Enable USB debugging (Android) or Developer mode (iOS)
3. Run: `npx expo start`
4. Select device from list

## Release Checklist

- [ ] All assets added to `assets/` directory
- [ ] App version updated in `app.json`
- [ ] Tested on physical devices
- [ ] All features working offline
- [ ] Images loading correctly
- [ ] Notifications working
- [ ] Export/import data working
- [ ] Dark mode tested
- [ ] Build successful
- [ ] APK tested on Android device

## Distribution

### Android

1. **Internal Testing:**
   - Upload APK to Google Play Console
   - Add testers

2. **Production:**
   - Create release in Play Console
   - Upload AAB (Android App Bundle)
   - Submit for review

### iOS

1. **TestFlight:**
   - Upload via Xcode or EAS
   - Add testers

2. **App Store:**
   - Submit via App Store Connect
   - Wait for review

## Support

For issues:
- Check Expo documentation: https://docs.expo.dev
- Check React Native documentation: https://reactnative.dev
- Open GitHub issue

---

**Happy Building! 🌱**
