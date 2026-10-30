import React, { ReactNode } from 'react';
import {
  Text,
  TextProps,
  View,
  ViewProps,
  StyleSheet,
  Platform,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeInDown,
  useReducedMotion,
} from 'react-native-reanimated';
import { useTheme, Theme } from '../theme/ThemeContext';
import type { IconName } from '../theme/tokens';

// ─── Haptics ──────────────────────────────────────────────────────────────────

const canBuzz = Platform.OS === 'ios' || Platform.OS === 'android';
export const haptic = {
  tap: () => canBuzz && Haptics.selectionAsync().catch(() => {}),
  soft: () => canBuzz && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {}),
  success: () => canBuzz && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
};

// ─── Text ─────────────────────────────────────────────────────────────────────

type Variant = keyof Theme['type'];
type Tone = 'primary' | 'secondary' | 'tertiary' | 'accent' | 'warm' | 'danger' | 'onAccent';

export function Txt({
  v = 'body',
  tone = 'primary',
  color,
  style,
  ...rest
}: TextProps & { v?: Variant; tone?: Tone; color?: string }) {
  const { theme } = useTheme();
  const { c } = theme;
  const toneColor = {
    primary: c.text,
    secondary: c.textSecondary,
    tertiary: c.textTertiary,
    accent: c.accentText,
    warm: c.warm,
    danger: c.danger,
    onAccent: c.onAccent,
  }[tone];
  return <Text {...rest} style={[theme.type[v], { color: color ?? toneColor }, style]} />;
}

// ─── Icon ─────────────────────────────────────────────────────────────────────

export function Icon({ name, size = 20, color }: { name: IconName; size?: number; color?: string }) {
  const { theme } = useTheme();
  return <Ionicons name={name} size={size} color={color ?? theme.c.text} />;
}

/** A line icon sitting in a round tinted well. */
export function IconWell({
  name,
  size = 44,
  fg,
  bg,
}: {
  name: IconName;
  size?: number;
  fg?: string;
  bg?: string;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg ?? theme.c.glassStrong,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={name} size={Math.round(size * 0.46)} color={fg ?? theme.c.text} />
    </View>
  );
}

// ─── Press feedback ───────────────────────────────────────────────────────────

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Pressable that settles down to 0.97 under the finger. */
export function Tap({
  children,
  style,
  scaleTo = 0.97,
  hapticOnPress = false,
  onPress,
  ...rest
}: PressableProps & { style?: StyleProp<ViewStyle>; scaleTo?: number; hapticOnPress?: boolean; children?: ReactNode }) {
  if (Platform.OS === 'web') {
    const { accessibilityRole, ...webRest } = rest;
    return (
      <Pressable
        {...webRest}
        style={style}
        onPress={(e) => {
          if (hapticOnPress) haptic.tap();
          onPress?.(e);
        }}
      >
        {children}
      </Pressable>
    );
  }

  const s = useSharedValue(1);
  const reduce = useReducedMotion();
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <AnimatedPressable
      {...rest}
      onPress={(e) => {
        if (hapticOnPress) haptic.tap();
        onPress?.(e);
      }}
      onPressIn={(e) => {
        if (!reduce) s.set(withTiming(scaleTo, { duration: 110 }));
        rest.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        s.set(withSpring(1, { damping: 16, stiffness: 260 }));
        rest.onPressOut?.(e);
      }}
      style={[style, anim]}
    >
      {children}
    </AnimatedPressable>
  );
}

// ─── Glass ────────────────────────────────────────────────────────────────────

export function Glass({
  children,
  style,
  strong,
  blur,
  radius,
  padded = true,
  lifted,
  ...rest
}: ViewProps & {
  strong?: boolean;
  /** Real backdrop blur for chrome that scrolls over content (iOS and web). */
  blur?: boolean;
  radius?: number;
  padded?: boolean;
  lifted?: boolean;
}) {
  const { theme } = useTheme();
  const { c } = theme;
  const r = radius ?? theme.radius.lg;
  const useBlur = blur && Platform.OS !== 'android';
  return (
    <View
      {...rest}
      style={[
        {
          borderRadius: r,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor: c.glassEdge,
          backgroundColor: useBlur ? 'transparent' : strong ? c.glassStrong : c.glass,
          overflow: useBlur ? 'hidden' : 'visible',
          padding: padded ? theme.space.lg : 0,
        },
        lifted ? theme.shadow.lifted : theme.shadow.soft,
        style,
      ]}
    >
      {useBlur && (
        <BlurView
          intensity={c.isDark ? 40 : 55}
          tint={c.blurTint}
          style={[StyleSheet.absoluteFill, { backgroundColor: strong ? c.glassStrong : c.glass }]}
        />
      )}
      {children}
    </View>
  );
}

// ─── Buttons ──────────────────────────────────────────────────────────────────

export function Button({
  label,
  onPress,
  icon,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  style,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  variant?: 'primary' | 'glass' | 'quiet' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const { theme } = useTheme();
  const { c } = theme;
  const h = { sm: 40, md: 50, lg: 56 }[size];
  const bg = {
    primary: c.accent,
    glass: c.glassStrong,
    quiet: 'transparent',
    danger: c.dangerSoft,
  }[variant];
  const fg = { primary: c.onAccent, glass: c.text, quiet: c.accentText, danger: c.danger }[variant];
  return (
    <Tap
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      hapticOnPress={variant === 'primary'}
      style={[
        {
          height: h,
          borderRadius: h / 2,
          paddingHorizontal: size === 'sm' ? 16 : 24,
          backgroundColor: bg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: disabled ? 0.45 : 1,
          borderWidth: variant === 'glass' ? StyleSheet.hairlineWidth * 2 : 0,
          borderColor: c.glassEdge,
        },
        variant === 'primary' && !disabled ? theme.shadow.accent : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={size === 'sm' ? 16 : 19} color={fg} />}
          <Text style={[size === 'sm' ? theme.type.subhead : theme.type.headline, { color: fg }]}>{label}</Text>
        </>
      )}
    </Tap>
  );
}

/** Round glass button for bar actions; 44pt so it's an honest tap target. */
export function IconButton({
  name,
  onPress,
  label,
  badge,
  size = 44,
  tone = 'glass',
}: {
  name: IconName;
  onPress: () => void;
  label: string;
  badge?: number;
  size?: number;
  tone?: 'glass' | 'accent' | 'plain';
}) {
  const { theme } = useTheme();
  const { c } = theme;
  const bg = tone === 'accent' ? c.accent : tone === 'plain' ? 'transparent' : c.glassStrong;
  return (
    <Tap
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      scaleTo={0.92}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        borderWidth: tone === 'glass' ? StyleSheet.hairlineWidth * 2 : 0,
        borderColor: c.glassEdge,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={name} size={20} color={tone === 'accent' ? c.onAccent : c.text} />
      {!!badge && badge > 0 && (
        <View
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            minWidth: 16,
            height: 16,
            paddingHorizontal: 4,
            borderRadius: 8,
            backgroundColor: c.accent,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: c.onAccent, fontSize: 10, fontWeight: '700' }}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      )}
    </Tap>
  );
}

// ─── Chips & segmented ───────────────────────────────────────────────────────

export function Chip({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
}) {
  const { theme } = useTheme();
  const { c } = theme;
  return (
    <Tap
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      scaleTo={0.95}
      style={{
        minHeight: 40,
        paddingHorizontal: 16,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: selected ? c.accent : c.glassStrong,
        borderWidth: StyleSheet.hairlineWidth * 2,
        borderColor: selected ? c.accent : c.glassEdge,
      }}
    >
      {icon && <Ionicons name={icon} size={16} color={selected ? c.onAccent : c.textSecondary} />}
      <Text style={[theme.type.subhead, { color: selected ? c.onAccent : c.text }]}>{label}</Text>
    </Tap>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { theme } = useTheme();
  const { c } = theme;
  const [w, setW] = React.useState(0);
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  const seg = w / options.length;
  const pill = useAnimatedStyle(
    () => ({
      transform: [{ translateX: withSpring(idx * seg, { damping: 20, stiffness: 220 }) }],
    }),
    [idx, seg],
  );
  return (
    <View
      onLayout={(e) => setW(e.nativeEvent.layout.width - 8)}
      style={{
        flexDirection: 'row',
        padding: 4,
        borderRadius: 24,
        backgroundColor: c.glass,
        borderWidth: StyleSheet.hairlineWidth * 2,
        borderColor: c.glassEdge,
      }}
    >
      {w > 0 && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 4,
              left: 4,
              bottom: 4,
              width: seg,
              borderRadius: 20,
              backgroundColor: c.accent,
            },
            pill,
          ]}
        />
      )}
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => {
              if (!active) haptic.tap();
              onChange(o.value);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={{ flex: 1, height: 38, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={[theme.type.subhead, { color: active ? c.onAccent : c.textSecondary }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Layout helpers ──────────────────────────────────────────────────────────

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginTop: theme.space.xxl,
        marginBottom: theme.space.md,
      }}
    >
      <Txt v="title2" accessibilityRole="header">
        {title}
      </Txt>
      {action && onAction && (
        <Pressable onPress={onAction} hitSlop={10} accessibilityRole="button">
          <Txt v="subhead" tone="accent">
            {action}
          </Txt>
        </Pressable>
      )}
    </View>
  );
}

/** First-mount entrance for list items; capped so long lists don't drag. */
export function Rise({ index = 0, children, style }: { index?: number; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const reduce = useReducedMotion();
  const entering = reduce
    ? undefined
    : FadeInDown.delay(Math.min(index, 6) * 55)
        .duration(460)
        .springify()
        .damping(22)
        .stiffness(170);
  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}

export function Divider({ inset = 0 }: { inset?: number }) {
  const { theme } = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.c.hairline, marginLeft: inset }} />;
}

/** A tappable row inside a grouped glass list. */
export function Row({
  icon,
  iconTint,
  title,
  subtitle,
  right,
  onPress,
  chevron = !!onPress,
}: {
  icon?: IconName;
  iconTint?: { fg: string; bg: string };
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
  chevron?: boolean;
}) {
  const { theme } = useTheme();
  const { c } = theme;
  const body = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, minHeight: 56 }}>
      {icon && <IconWell name={icon} size={38} fg={iconTint?.fg} bg={iconTint?.bg} />}
      <View style={{ flex: 1 }}>
        <Txt v="callout" style={{ fontWeight: '500' }}>
          {title}
        </Txt>
        {subtitle ? (
          <Txt v="footnote" tone="secondary" style={{ marginTop: 1 }}>
            {subtitle}
          </Txt>
        ) : null}
      </View>
      {right}
      {chevron && <Ionicons name="chevron-forward" size={18} color={c.textTertiary} />}
    </View>
  );
  if (!onPress) return body;
  return (
    <Tap onPress={onPress} scaleTo={0.985} accessibilityRole="button" accessibilityLabel={title}>
      {body}
    </Tap>
  );
}
