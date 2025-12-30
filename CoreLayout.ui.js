/**
 * CoreLayout.ui.js
 *
 * ✅ EDIT UI HERE (safe)
 * - All layout, styles, strings, colors live in THIS file.
 * - Do not change navigation logic here (that lives in CoreLayout.logic.js).
 */

import React, { useContext, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Image, Platform, Pressable, StyleSheet, Text, Vibration, View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { useCoreLayoutLogic } from './CoreLayout.logic';

let didWarnMissingSafeAreaProvider = false;

/**
 * =========================
 * ✅ DESIGN CONTROLS (EDIT)
 * =========================
 *
 * Change theme colors here
 * Change spacing here
 * Change navbar pill style here
 */
const DESIGN = {
  colors: {
    bg: '#FFFFFF',
    text: '#111827',
    muted: 'rgba(17,24,39,0.55)',
    pillBg: '#FFFFFF',
    pillBorder: 'rgba(236,72,153,0.18)',
    activeBg: '#EC4899',
    shadow: 'rgba(236,72,153,0.26)',
  },
  spacing: {
    screenPadding: 16,
    navBottomGap: 10,
    // v1 navbar specs (design-driven)
    // - pill height: 54
    // - inside padding: ~8 (vertical uses 7 to fit 40px active rect inside 54px pill)
    // - active rect: 60x40
    navPillHeight: 54,
    navPillPadH: 8,
    navPillPadV: 7,
    navItemW: 60,
    navItemH: 40,
    navItemGap: 8,
    navIconSize: 28,
    // Perfect pill: 50% of height (40/2 = 20)
    navActiveRadius: 20,
  },
  radius: {
    pill: 999,
  },
  font: {
    title: 20,
    iconEmoji: 28,
  },
};

function isEmojiIcon(icon) {
  return typeof icon === 'string';
}

function warnIfMissingSafeArea(insets) {
  if (insets != null) return;
  if (didWarnMissingSafeAreaProvider) return;
  didWarnMissingSafeAreaProvider = true;
  // eslint-disable-next-line no-console
  console.warn(
    '[expo-core-layout-module] Safe area insets are missing. Wrap your app root with <SafeAreaProvider>.'
  );
}

function NavbarIcon({ icon, active }) {
  if (isEmojiIcon(icon)) {
    return (
      <Text style={[styles.navEmoji, active ? styles.navEmojiActive : null]} numberOfLines={1}>
        {icon}
      </Text>
    );
  }

  // ImageSourcePropType supports:
  // - require('...') -> number
  // - { uri: 'https://...' } -> object
  return (
    <Image
      source={icon}
      style={[styles.navImage, active ? styles.navImageActive : null]}
      resizeMode="contain"
    />
  );
}

function triggerTabHaptic() {
  // Prefer Expo Haptics if available, fallback to a tiny vibration.
  try {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    const Haptics = require('expo-haptics');
    if (Haptics?.selectionAsync) {
      Haptics.selectionAsync();
      return;
    }
  } catch (_e) {
    // ignore
  }

  // iOS Vibration is not a subtle "tick" (it can feel like a full vibration).
  // If expo-haptics isn't installed, skip haptics on iOS to avoid a harsh feel.
  if (Platform.OS === 'ios') return;

  // Keep extremely subtle on Android.
  Vibration.vibrate(8);
}

/**
 * @param {{
 *  pages: Array<{ key: string, title: string, icon: any, Component: any, initialProps?: any }>,
 *  initialPageKey?: string,
 *  onPageChange?: (pageKey: string) => void,
 *  maxPages?: number
 *  enableHaptics?: boolean
 * }} props
 */
export function CoreLayout(props) {
  const insets = useContext(SafeAreaInsetsContext);
  warnIfMissingSafeArea(insets);

  const {
    pages,
    activeIndex,
    activePage,
    handlersByKey,
  } = useCoreLayoutLogic({
    pages: props.pages,
    initialPageKey: props.initialPageKey,
    onPageChange: props.onPageChange,
    maxPages: props.maxPages,
  });

  const ActiveComponent = activePage.Component;
  const activeProps = useMemo(() => activePage.initialProps ?? {}, [activePage.initialProps]);

  const bottomInset = typeof insets?.bottom === 'number' ? insets.bottom : 0;

  // Sliding active indicator (smooth)
  const indicatorX = useRef(new Animated.Value(0)).current;

  const activeX = useMemo(() => {
    return (
      DESIGN.spacing.navPillPadH
      + activeIndex * (DESIGN.spacing.navItemW + DESIGN.spacing.navItemGap)
    );
  }, [activeIndex]);

  useEffect(() => {
    Animated.timing(indicatorX, {
      toValue: activeX,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [activeX, indicatorX]);

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        <ActiveComponent {...activeProps} />
      </View>

      <View style={[styles.navWrap, { paddingBottom: bottomInset + DESIGN.spacing.navBottomGap }]}>
        <View style={styles.navPill}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.activeIndicator,
              {
                transform: [{ translateX: indicatorX }],
              },
            ]}
          />
          {pages.map((p, idx) => {
            const active = idx === activeIndex;
            return (
              <Pressable
                key={p.key}
                onPress={() => {
                  if (!active && props.enableHaptics !== false) triggerTabHaptic();
                  handlersByKey[p.key]();
                }}
                style={[styles.navItem, idx < pages.length - 1 ? styles.navItemWithGap : null]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={p.title}
                hitSlop={10}
              >
                <NavbarIcon icon={p.icon} active={active} />
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DESIGN.colors.bg,
  },
  content: {
    flex: 1,
  },
  navWrap: {
    alignItems: 'center',
    paddingHorizontal: DESIGN.spacing.screenPadding,
  },
  navPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DESIGN.colors.pillBg,
    borderRadius: DESIGN.radius.pill,
    borderWidth: 1,
    borderColor: DESIGN.colors.pillBorder,
    height: DESIGN.spacing.navPillHeight,
    paddingHorizontal: DESIGN.spacing.navPillPadH,
    paddingVertical: DESIGN.spacing.navPillPadV,
    shadowColor: DESIGN.colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  activeIndicator: {
    position: 'absolute',
    top: DESIGN.spacing.navPillPadV,
    left: 0,
    width: DESIGN.spacing.navItemW,
    height: DESIGN.spacing.navItemH,
    borderRadius: DESIGN.spacing.navActiveRadius,
    backgroundColor: DESIGN.colors.activeBg,
    zIndex: 0,
  },
  navItem: {
    width: DESIGN.spacing.navItemW,
    height: DESIGN.spacing.navItemH,
    borderRadius: DESIGN.spacing.navActiveRadius,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  navItemWithGap: {
    marginRight: DESIGN.spacing.navItemGap,
  },
  navEmoji: {
    fontSize: DESIGN.font.iconEmoji,
    color: DESIGN.colors.text,
  },
  navEmojiActive: {
    color: '#FFFFFF',
  },
  navImage: {
    width: DESIGN.spacing.navIconSize,
    height: DESIGN.spacing.navIconSize,
    tintColor: DESIGN.colors.text,
  },
  navImageActive: {
    tintColor: '#FFFFFF',
  },
});


