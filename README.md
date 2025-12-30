## Expo Core Layout Module (v1)

A reusable **core layout + primary bottom navbar** for **Expo React Native**.

This module is designed to be:
- **Dependency-free for navigation** (no React Navigation required)
- **Scalable** (add/remove pages by editing one config array)
- **Editable UI** (all styling/layout lives in one file)

## What it supports (v1)
- 1 to 5 pages (hard cap)
- Bottom pill-style primary navbar
- Icons as **emoji** or **images**
  - Local assets (e.g. `require('./icon.png')`)
  - Remote images (e.g. `{ uri: 'https://...' }`)
- Optional **haptics on tab switch** (best on iOS with `expo-haptics`)

## Install (local monorepo style)

```bash
npm install
```

Then in your app `package.json` add:

```json
{
  "dependencies": {
    "expo-core-layout-module": "file:./expoCoreLayout"
  }
}
```

## Safe area setup (required)

This module reads safe area insets for bottom padding.

Wrap your app root with `SafeAreaProvider` (your demo app already does this in `index.js`):

```js
import React from 'react';
import { registerRootComponent } from 'expo';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import App from './App';

function Root() {
  return (
    <SafeAreaProvider>
      <App />
    </SafeAreaProvider>
  );
}

registerRootComponent(Root);
```

## Usage

```js
import React from 'react';
import { Text, View } from 'react-native';
import { CoreLayout } from 'expo-core-layout-module';

function Home() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home</Text>
    </View>
  );
}

function Games() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Games</Text>
    </View>
  );
}

function Profile() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Profile</Text>
    </View>
  );
}

export function AppShell() {
  return (
    <CoreLayout
      pages={[
        { key: 'home', title: 'Home', icon: '🏠', Component: Home },
        { key: 'games', title: 'Games', icon: '🕹️', Component: Games },
        { key: 'profile', title: 'Profile', icon: '👸', Component: Profile },
      ]}
      initialPageKey="home"
      enableHaptics
    />
  );
}
```

### Haptics note (recommended for iOS)
For the subtle “tick” feel on iOS, install Expo Haptics in your app:

```bash
npx expo install expo-haptics
```

## Optional gating (onboarding/auth/home)
If you want a single entry point that can route to onboarding, auth, or home, use `CoreLayoutGate`.

```js
import React from 'react';
import { Text, View, Pressable } from 'react-native';
import { CoreLayoutGate } from 'expo-core-layout-module';

export function AppShell() {
  return (
    <CoreLayoutGate
      resolveEntry={async () => 'home'} // 'onboarding' | 'auth' | 'home'
      renderOnboarding={({ complete }) => (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Pressable onPress={complete}>
            <Text>Finish onboarding</Text>
          </Pressable>
        </View>
      )}
      renderAuth={({ complete }) => (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Pressable onPress={complete}>
            <Text>Finish auth</Text>
          </Pressable>
        </View>
      )}
      coreLayoutProps={{
        pages: [
          { key: 'home', title: 'Home', icon: '🏠', Component: () => <Text>Home</Text> },
        ],
      }}
    />
  );
}
```

## Icon examples
- Emoji: `icon: '🏠'`
- Local image: `icon: require('./assets/home.png')`
- Remote image: `icon: { uri: 'https://example.com/home.png' }`

## Where to edit UI (important)
✅ All UI + styling is in **one file**:
- `CoreLayout.ui.js`

Logic lives separately:
- `CoreLayout.logic.js`

## Notes
- This module intentionally does **not** manage navigation stacks. Each page can render any component tree you want.
- v1 enforces a **1–5 pages** limit with explicit runtime errors for invalid configs.


