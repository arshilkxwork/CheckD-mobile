import React, { createContext, ReactNode, useContext } from 'react';
import { View, Image, StyleSheet, Platform, RefreshControlProps, KeyboardAvoidingView, ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { IconButton, Txt } from './primitives';

export const BAR_HEIGHT = 56;
/** Room left under content for the floating tab bar. */
export const TAB_CLEARANCE = 112;

const ScrollContext = createContext<SharedValue<number> | null>(null);
/** Scroll offset of the enclosing Screen, for scroll-linked children. */
export const useScreenScroll = () => useContext(ScrollContext);

// ─── Backdrop ─────────────────────────────────────────────────────────────────

/** The blurred botanical field behind every screen; drifts at 0.25x scroll. */
export function Backdrop({ scrollY }: { scrollY?: SharedValue<number> }) {
  const { theme } = useTheme();
  const reduce = useReducedMotion();
  const drift = useAnimatedStyle(() => {
    const y = !scrollY || reduce ? 0 : scrollY.value;
    return {
      transform: [
        { translateY: interpolate(y, [-200, 0, 2000], [40, 0, -260], Extrapolation.CLAMP) },
        { scale: interpolate(y, [-200, 0], [1.08, 1], Extrapolation.CLAMP) },
      ] as const,
    };
  });
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.c.bg, overflow: 'hidden' }]} pointerEvents="none">
      <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, height: '125%' }, drift]}>
        <Image source={theme.c.backdrop} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
      </Animated.View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

type Props = {
  title: string;
  /** Serif large title that collapses into the bar on scroll (top-level screens). */
  large?: boolean;
  subtitle?: ReactNode;
  /** Replaces the large title text (e.g. a two-line greeting). */
  heading?: ReactNode;
  onBack?: () => void;
  /** 'close' for modally presented screens. */
  backIcon?: 'back' | 'close';
  right?: ReactNode;
  children: ReactNode;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  keyboard?: boolean;
  /** Pinned content under the scroll area, e.g. a primary action. */
  footer?: ReactNode;
  bottomInset?: number;
  scrollProps?: Partial<ScrollViewProps>;
  /** Lets a screen scroll itself, e.g. back to a field that needs attention. */
  scrollRef?: React.Ref<any>;
};

export function Screen({
  title,
  large = false,
  subtitle,
  heading,
  onBack,
  backIcon = 'back',
  right,
  children,
  refreshControl,
  keyboard,
  footer,
  bottomInset = TAB_CLEARANCE,
  scrollProps,
  scrollRef,
}: Props) {
  const { theme } = useTheme();
  const { c } = theme;
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const top = insets.top + BAR_HEIGHT;
  const collapseAt = large ? 52 : 8;

  // Bar material and inline title fade in as the large title tucks under.
  const barStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [collapseAt - 24, collapseAt + 8], [0, 1], Extrapolation.CLAMP),
  }));
  const inlineTitle = useAnimatedStyle(() => ({
    opacity: large ? interpolate(scrollY.value, [collapseAt - 6, collapseAt + 14], [0, 1], Extrapolation.CLAMP) : 1,
    transform: [
      { translateY: large ? interpolate(scrollY.value, [collapseAt - 6, collapseAt + 14], [8, 0], Extrapolation.CLAMP) : 0 },
    ],
  }));
  // Large title: stretches on pull-down, drifts up and fades as it collapses.
  const largeTitle = useAnimatedStyle(() => {
    const y = scrollY.value;
    return {
      opacity: interpolate(y, [0, collapseAt], [1, 0], Extrapolation.CLAMP),
      transform: [
        { translateY: interpolate(y, [-120, 0, collapseAt], [0, 0, -10], Extrapolation.CLAMP) },
        { scale: interpolate(y, [-120, 0], [1.08, 1], Extrapolation.CLAMP) },
      ] as const,
    };
  });

  const scroll = (
    <Animated.ScrollView
      {...scrollProps}
      ref={scrollRef}
      onScroll={onScroll}
      scrollEventThrottle={16}
      refreshControl={refreshControl}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: top + (large ? 4 : 8),
        paddingBottom: (footer ? 24 : bottomInset) + insets.bottom,
        paddingHorizontal: theme.space.xl,
      }}
    >
      {large && (
        <Animated.View style={[{ transformOrigin: 'left', marginBottom: theme.space.lg }, largeTitle]}>
          {heading ?? (
            <Txt v="largeTitle" accessibilityRole="header">
              {title}
            </Txt>
          )}
          {subtitle ? (
            typeof subtitle === 'string' ? (
              <Txt v="callout" tone="secondary" style={{ marginTop: 4 }}>
                {subtitle}
              </Txt>
            ) : (
              subtitle
            )
          ) : null}
        </Animated.View>
      )}
      {children}
    </Animated.ScrollView>
  );

  return (
    <ScrollContext.Provider value={scrollY}>
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <Backdrop scrollY={scrollY} />
        {keyboard ? (
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            {scroll}
            {footer}
          </KeyboardAvoidingView>
        ) : (
          <>
            {scroll}
            {footer}
          </>
        )}

        {/* Top bar: transparent at rest, frosted once content passes under it */}
        <View style={[styles.bar, { height: top, paddingTop: insets.top }]} pointerEvents="box-none">
          <Animated.View style={[StyleSheet.absoluteFill, barStyle]} pointerEvents="none">
            {Platform.OS === 'android' ? (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: c.barGlass }]} />
            ) : (
              <BlurView
                intensity={c.isDark ? 45 : 60}
                tint={c.blurTint}
                style={[StyleSheet.absoluteFill, { backgroundColor: c.isDark ? 'rgba(13,24,19,0.45)' : 'rgba(240,245,239,0.45)' }]}
              />
            )}
            <View style={[styles.barEdge, { backgroundColor: c.hairline }]} />
          </Animated.View>
          <View style={styles.barRow} pointerEvents="box-none">
            <View style={styles.barSide}>
              {onBack && (
                <IconButton
                  name={backIcon === 'close' ? 'close' : 'chevron-back'}
                  label={backIcon === 'close' ? 'Close' : 'Back'}
                  onPress={onBack}
                />
              )}
            </View>
            <Animated.View style={[styles.barTitle, inlineTitle]} pointerEvents="none">
              <Txt v="headline" numberOfLines={1} style={{ fontWeight: '600' }}>
                {title}
              </Txt>
            </Animated.View>
            <View style={[styles.barSide, { alignItems: 'flex-end' }]}>
              <View style={{ flexDirection: 'row', gap: 8 }}>{right}</View>
            </View>
          </View>
        </View>
      </View>
    </ScrollContext.Provider>
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', top: 0, left: 0, right: 0 },
  barEdge: { position: 'absolute', left: 0, right: 0, bottom: 0, height: StyleSheet.hairlineWidth },
  barRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  barSide: { minWidth: 44 },
  barTitle: { position: 'absolute', left: 120, right: 120, alignItems: 'center' },
});
