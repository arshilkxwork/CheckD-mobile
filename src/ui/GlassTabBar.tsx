import React, { useState } from 'react';
import { View, StyleSheet, Platform, Pressable, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import type { IconName } from '../theme/tokens';
import { haptic, Tap } from './primitives';

const TABS: Record<string, { label: string; icon: IconName; active: IconName }> = {
  HomeTab: { label: 'Home', icon: 'home-outline', active: 'home' },
  PeopleTab: { label: 'Circle', icon: 'people-outline', active: 'people' },
  HistoryTab: { label: 'History', icon: 'time-outline', active: 'time' },
  MeTab: { label: 'You', icon: 'person-circle-outline', active: 'person-circle' },
};

/** Focused screens that own the whole viewport (wizards, modals). */
const HIDE_ON = new Set(['CreateNudge', 'ReceiverNudge', 'AddPerson']);

export function GlassTabBar({ state, navigation }: BottomTabBarProps) {
  const { theme } = useTheme();
  const { c } = theme;
  const insets = useSafeAreaInsets();
  const [width, setWidth] = useState(0);

  const focused = state.routes[state.index];
  const nested = getFocusedRouteNameFromRoute(focused) ?? '';
  const hidden = focused.name === 'CreateTab' || HIDE_ON.has(nested);

  const bottom = Math.max(insets.bottom - 6, 12);
  const hide = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(hidden ? 120 : 0, { duration: hidden ? 180 : 260 }) }],
    opacity: withTiming(hidden ? 0 : 1, { duration: 180 }),
  }));

  // Slots: Home, Circle, [+], History, You
  const order = ['HomeTab', 'PeopleTab', 'CreateTab', 'HistoryTab', 'MeTab'];
  const slot = width / order.length;
  const activeSlot = Math.max(0, order.indexOf(focused.name));
  const indicator = useAnimatedStyle(
    () => ({
      transform: [{ translateX: withSpring(activeSlot * slot + (slot - 56) / 2, { damping: 20, stiffness: 200 }) }],
      opacity: focused.name === 'CreateTab' ? 0 : 1,
    }),
    [activeSlot, slot, focused.name],
  );

  const go = (name: string) => {
    const route = state.routes.find((r) => r.name === name);
    if (!route) return;
    const isFocused = focused.name === name;
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    // A second tap on the focused tab is handled by its stack (pops to top).
    if (!isFocused && !event.defaultPrevented) {
      haptic.tap();
      navigation.navigate(name as never);
    }
  };

  return (
    <Animated.View
      pointerEvents={hidden ? 'none' : 'box-none'}
      style={[styles.wrap, { bottom }, hide]}
    >
      <View
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        style={[
          styles.bar,
          {
            borderColor: c.glassEdge,
            backgroundColor: Platform.OS === 'android' ? c.barGlass : 'transparent',
          },
          theme.shadow.lifted,
        ]}
      >
        {Platform.OS !== 'android' && (
          <BlurView
            intensity={c.isDark ? 50 : 70}
            tint={c.blurTint}
            style={[StyleSheet.absoluteFill, { backgroundColor: c.isDark ? 'rgba(18,32,24,0.55)' : 'rgba(250,252,249,0.55)' }]}
          />
        )}
        {width > 0 && (
          <Animated.View style={[styles.indicator, { backgroundColor: c.accentSoft }, indicator]} />
        )}
        {order.map((name) => {
          if (name === 'CreateTab') {
            return (
              <View key={name} style={styles.slot}>
                <Tap
                  onPress={() => go(name)}
                  scaleTo={0.9}
                  accessibilityRole="button"
                  accessibilityLabel="New nudge"
                  style={[styles.create, { backgroundColor: c.accent }, theme.shadow.accent]}
                >
                  <Ionicons name="add" size={28} color={c.onAccent} />
                </Tap>
              </View>
            );
          }
          const tab = TABS[name];
          const active = focused.name === name;
          return (
            <Pressable
              key={name}
              onPress={() => go(name)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={tab.label}
              style={styles.slot}
            >
              <Ionicons name={active ? tab.active : tab.icon} size={22} color={active ? c.accentText : c.textSecondary} />
              <Text
                style={[
                  theme.type.caption,
                  { fontSize: 11, marginTop: 2, color: active ? c.accentText : c.textSecondary, fontWeight: active ? '600' : '500' },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16 },
  bar: {
    height: 68,
    borderRadius: 34,
    borderWidth: StyleSheet.hairlineWidth * 2,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  slot: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center' },
  indicator: { position: 'absolute', left: 0, top: 8, width: 56, height: 52, borderRadius: 22 },
  create: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
});
