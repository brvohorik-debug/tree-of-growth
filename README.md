# Tree of Growth 🌱

A beautiful, offline-first to-do app that visualizes your productivity as a growing tree. Complete tasks to watch your tree grow from a seed to a blooming tree!

## Features

- 🌳 **Animated Tree Growth** - Watch your tree grow as you complete tasks
- ✅ **Task Management** - Add, edit, and organize tasks with categories and priorities
- 📅 **Calendar View** - See your tasks organized by date
- 🖼️ **Custom Images** - Import your own images for themes, backgrounds, leaves, and rewards
- 🔥 **Streak Tracking** - Build daily streaks to keep motivated
- 📊 **Growth Points & Levels** - Level up your tree with every completed task
- 🌙 **Dark Mode** - Beautiful light and dark themes
- 📱 **Offline First** - Works completely offline, no internet required
- 💾 **Local Storage** - All data stored locally on your device
- 📤 **Export/Backup** - Export your data for backup

## Tech Stack

- **React Native** with **Expo** - Cross-platform mobile development
- **TypeScript** - Type-safe code
- **Expo Router** - File-based navigation
- **Zustand** - State management
- **AsyncStorage** - Local data persistence
- **Expo FileSystem** - Local file storage for images
- **Expo Image Picker** - Image selection from gallery
- **React Native Reanimated** - Smooth animations
- **date-fns** - Date utilities

## Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (installed globally or via npx)
- For Android: Android Studio and Android SDK
- For iOS: Xcode (macOS only)

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd tree-of-growth
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add app assets**
   
   Place the following files in the `assets/` directory:
   - `icon.png` (1024x1024px) - App icon
   - `splash.png` (1284x2778px) - Splash screen
   - `adaptive-icon.png` (1024x1024px) - Android adaptive icon
   - `favicon.png` (48x48px) - Web favicon

   You can use online tools like [AppIcon.co](https://www.appicon.co) to generate these.

4. **Start the development server**
   ```bash
   npx expo start
   ```

   Then:
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Press `w` for web
   - Scan QR code with Expo Go app on your phone

## Building for Production

### Android APK

1. **Prebuild native code**
   ```bash
   npx expo prebuild
   ```

2. **Build APK**
   ```bash
   npx expo run:android
   ```

   Or for a standalone APK:
   ```bash
   npx eas build --platform android --profile preview
   ```

   For production builds, you'll need to set up EAS (Expo Application Services):
   ```bash
   npm install -g eas-cli
   eas login
   eas build:configure
   eas build --platform android
   ```

### iOS

1. **Prebuild native code**
   ```bash
   npx expo prebuild
   ```

2. **Build for iOS**
   ```bash
   npx expo run:ios
   ```

   Or use EAS:
   ```bash
   eas build --platform ios
   ```

### Web (PWA)

```bash
npm run web
```

The app will be available at `http://localhost:8081` (or the port shown).

## Project Structure

```
tree-of-growth/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Tree screen (main)
│   │   ├── tasks.tsx      # Tasks management
│   │   ├── calendar.tsx   # Calendar view
│   │   ├── gallery.tsx   # Image gallery
│   │   └── settings.tsx  # Settings
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   └── Tree.tsx          # Animated tree component
├── store/                 # State management
│   └── useStore.ts       # Zustand store
├── types/                 # TypeScript types
│   └── index.ts
├── utils/                 # Utility functions
│   └── treeUtils.ts      # Tree calculation logic
├── assets/                # App assets (icons, images)
└── user_assets/          # User-imported images (created at runtime)
```

## Customization

### Changing Tree Appearance

Edit `components/Tree.tsx` to customize:
- Tree colors
- Growth stages
- Animation speeds
- Leaf styles

### Adding Custom Images

1. Go to the **Gallery** tab
2. Select image type (Theme, Background, Leaf, or Reward)
3. Tap **Add** button
4. Choose image from your gallery
5. Images are stored locally in `user_assets/` directory

### Modifying Task Categories

Edit `types/index.ts` to change task categories:
```typescript
export type TaskCategory = 'daily' | 'long-term' | 'habit' | 'your-category';
```

### Adjusting Growth Points

Edit `utils/treeUtils.ts` to modify:
- Points per task
- Points for different priorities
- Level requirements
- Tree stage thresholds

## Data Storage

All data is stored locally on the device:

- **Tasks & Settings**: AsyncStorage (key-value storage)
- **Images**: FileSystem (`user_assets/` directory)
- **No cloud required**: Everything works offline

### Exporting Data

1. Go to **Settings**
2. Tap **Export Data**
3. Share the backup file to save it

### Importing Data

1. Place backup JSON file on your device
2. Use a file manager to open it with Tree of Growth
3. Data will be restored

## Development

### Running on Device

1. Install **Expo Go** app on your phone
2. Start development server: `npx expo start`
3. Scan QR code with Expo Go

### Debugging

- Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android) to open developer menu
- Use React Native Debugger or Chrome DevTools
- Check logs in terminal

### Common Issues

**Images not loading:**
- Check file permissions in `app.json`
- Ensure images are in correct format (JPG/PNG)

**Build fails:**
- Run `npx expo prebuild --clean`
- Clear cache: `npx expo start -c`

**Notifications not working:**
- Check notification permissions in device settings
- Ensure `expo-notifications` is properly configured

## Performance

- App opens in under 2 seconds
- Optimized for older devices
- Smooth 60fps animations
- Efficient local storage

## Future Enhancements

- Widget support (structure ready)
- Cloud sync (optional, structure prepared)
- More tree customization options
- Achievement system
- Social sharing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation
- Review Expo documentation: https://docs.expo.dev

## Credits

Built with ❤️ using React Native and Expo.

---

**Grow your tree, grow yourself** 🌱
