import React, { ReactNode, useEffect, useState } from 'react';
import { Modal, Pressable, View, StyleSheet, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { IconButton, Txt } from './primitives';

/** A frosted bottom sheet: rises over a soft scrim, tap outside to close. */
export function Sheet({
  visible,
  onClose,
  title,
  children,
  footer,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { theme } = useTheme();
  const { c } = theme;
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(visible);
  const t = useSharedValue(0);
  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    if (visible) {
      t.set(withTiming(1, { duration: reduce ? 120 : 380, easing: Easing.out(Easing.cubic) }));
    } else if (mounted) {
      t.set(withTiming(0, { duration: reduce ? 100 : 220, easing: Easing.in(Easing.cubic) }));
      const id = setTimeout(() => setMounted(false), reduce ? 110 : 230);
      return () => clearTimeout(id);
    }
  }, [visible, mounted, reduce, t]);

  const scrim = useAnimatedStyle(() => ({ opacity: t.value }));
  const sheet = useAnimatedStyle(() => ({
    transform: [{ translateY: reduce ? 0 : (1 - t.value) * 420 }],
    opacity: reduce ? t.value : 1,
  }));

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: c.scrim }, scrim]}>
          <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" />
        </Animated.View>
        <View style={{ flex: 1 }} pointerEvents="box-none" />
        <Animated.View
          style={[
            styles.sheet,
            {
              borderColor: c.glassEdge,
              backgroundColor: Platform.OS === 'android' ? (c.isDark ? '#15241B' : '#F3F7F2') : 'transparent',
              maxHeight: '88%',
            },
            sheet,
          ]}
        >
          {Platform.OS !== 'android' && (
            <BlurView
              intensity={c.isDark ? 60 : 80}
              tint={c.blurTint}
              style={[StyleSheet.absoluteFill, { backgroundColor: c.isDark ? 'rgba(18,32,24,0.78)' : 'rgba(245,248,244,0.8)' }]}
            />
          )}
          <View style={[styles.handle, { backgroundColor: c.hairline }]} />
          <View style={styles.head}>
            <Txt v="title2" style={{ flex: 1 }} accessibilityRole="header">
              {title}
            </Txt>
            <IconButton name="close" label="Close" onPress={onClose} size={40} />
          </View>
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: theme.space.xl, paddingBottom: footer ? 12 : insets.bottom + 20 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
          {footer ? (
            <View style={{ paddingHorizontal: theme.space.xl, paddingTop: 8, paddingBottom: insets.bottom + 16 }}>{footer}</View>
          ) : null}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderBottomWidth: 0,
    overflow: 'hidden',
  },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginTop: 10 },
  head: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
});
