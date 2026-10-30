import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { withAlpha } from '../theme/palette';
import { Glass, Txt, IconWell, Button, haptic, Tap } from './primitives';
import type { IconName } from '../theme/tokens';
import type { User } from '../types';

// ─── Avatar ───────────────────────────────────────────────────────────────────

export function Avatar({ user, size = 44, label }: { user: Pick<User, 'firstName' | 'avatarColor'>; size?: number; label?: string }) {
  const { theme } = useTheme();
  const { c } = theme;
  const tone = user.avatarColor || c.accent;
  const initial = (label ?? user.firstName ?? '?').trim().charAt(0).toUpperCase() || '?';
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: withAlpha(tone, c.isDark ? 0.28 : 0.2),
        borderWidth: StyleSheet.hairlineWidth * 2,
        borderColor: withAlpha(tone, c.isDark ? 0.5 : 0.35),
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={[theme.type.title2, { fontSize: size * 0.48, lineHeight: size * 0.6, color: c.text }]}>{initial}</Text>
    </View>
  );
}

// ─── Done check: the one authored moment ─────────────────────────────────────

/**
 * Tapping fills the ring from its centre, pops the tick, sends out one ripple
 * and a success haptic, then reports `onDone` once the moment has landed.
 */
export function CheckButton({
  done = false,
  onDone,
  size = 44,
  label = 'Mark done',
}: {
  done?: boolean;
  onDone: () => void;
  size?: number;
  label?: string;
}) {
  const { theme } = useTheme();
  const { c } = theme;
  const reduce = useReducedMotion();
  const fill = useSharedValue(done ? 1 : 0);
  const ripple = useSharedValue(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fill.set(done ? 1 : 0);
  }, [done, fill]);

  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fill.value }],
    opacity: fill.value > 0 ? 1 : 0,
  }));
  const tickStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.4 + fill.value * 0.6 }],
    opacity: fill.value,
  }));
  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + ripple.value * 0.9 }],
    opacity: ripple.value === 0 ? 0 : 0.5 * (1 - ripple.value),
  }));

  const press = () => {
    if (done || busy) return;
    setBusy(true);
    haptic.success();
    if (reduce) {
      fill.set(withTiming(1, { duration: 120 }));
      setTimeout(onDone, 160);
      return;
    }
    ripple.set(
      withSequence(withTiming(0.001, { duration: 0 }), withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) })),
    );
    fill.set(withSpring(1, { damping: 15, stiffness: 240 }));
    // Let the tick land and breathe before the row glides away.
    setTimeout(onDone, 480);
  };

  return (
    <Tap
      onPress={press}
      disabled={done}
      scaleTo={0.9}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={done ? 'Done' : label}
      accessibilityState={{ checked: done, disabled: done }}
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          { position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: c.accent },
          rippleStyle,
        ]}
      />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderColor: done ? c.accent : withAlpha(c.text, 0.22),
          backgroundColor: c.glassStrong,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Animated.View
          style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: c.accent }, fillStyle]}
        />
        <Animated.View style={tickStyle}>
          <Ionicons name="checkmark" size={size * 0.5} color={c.onAccent} />
        </Animated.View>
      </View>
    </Tap>
  );
}

// ─── Progress ring ───────────────────────────────────────────────────────────

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function ProgressRing({
  value,
  size = 76,
  stroke = 7,
  children,
}: {
  value: number; // 0..1
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
}) {
  const { theme } = useTheme();
  const { c } = theme;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const p = useSharedValue(0);
  useEffect(() => {
    p.set(withTiming(Math.max(0, Math.min(1, value)), { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, [value, p]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: circ * (1 - p.value) }));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={c.accentSoft} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={c.accent}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circ} ${circ}`}
          animatedProps={props}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  body,
  action,
  onAction,
}: {
  icon: IconName;
  title: string;
  body?: string;
  action?: string;
  onAction?: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Glass style={{ alignItems: 'center', paddingVertical: theme.space.xxxl, paddingHorizontal: theme.space.xxl }}>
      <IconWell name={icon} size={56} fg={theme.c.accentText} bg={theme.c.accentSoft} />
      <Txt v="title2" style={{ marginTop: theme.space.lg, textAlign: 'center' }}>
        {title}
      </Txt>
      {body ? (
        <Txt v="callout" tone="secondary" style={{ marginTop: 6, textAlign: 'center', maxWidth: 300 }}>
          {body}
        </Txt>
      ) : null}
      {action && onAction ? <Button label={action} onPress={onAction} size="sm" style={{ marginTop: theme.space.xl }} /> : null}
    </Glass>
  );
}

// ─── Stat pill ───────────────────────────────────────────────────────────────

export function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Txt v="title">{value}</Txt>
      <Txt v="caption" tone="secondary" style={{ marginTop: 2 }}>
        {label}
      </Txt>
    </View>
  );
}

// ─── Status tag ──────────────────────────────────────────────────────────────

export function Tag({ label, tone = 'accent', icon }: { label: string; tone?: 'accent' | 'warm' | 'danger' | 'muted'; icon?: IconName }) {
  const { theme } = useTheme();
  const { c } = theme;
  const map = {
    accent: [c.accentText, c.accentSoft],
    warm: [c.warm, c.warmSoft],
    danger: [c.danger, c.dangerSoft],
    muted: [c.textSecondary, c.glassStrong],
  } as const;
  const [fg, bg] = map[tone];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderRadius: 10,
        backgroundColor: bg,
      }}
    >
      {icon && <Ionicons name={icon} size={12} color={fg} />}
      <Text style={[theme.type.caption, { color: fg }]}>{label}</Text>
    </View>
  );
}

// ─── Linkable glass card with icon ───────────────────────────────────────────

export function LinkCard({
  icon,
  title,
  body,
  onPress,
  tint,
}: {
  icon: IconName;
  title: string;
  body?: string;
  onPress: () => void;
  tint?: { fg: string; bg: string };
}) {
  const { theme } = useTheme();
  return (
    <Tap onPress={onPress} accessibilityRole="button" accessibilityLabel={title} style={{ flex: 1 }}>
      <Glass style={{ flex: 1, gap: 10 }}>
        <IconWell name={icon} size={40} fg={tint?.fg} bg={tint?.bg} />
        <View>
          <Txt v="subhead" style={{ fontWeight: '600' }}>
            {title}
          </Txt>
          {body ? (
            <Txt v="footnote" tone="secondary" style={{ marginTop: 2 }} numberOfLines={2}>
              {body}
            </Txt>
          ) : null}
        </View>
        <View style={{ position: 'absolute', top: theme.space.lg, right: theme.space.lg }}>
          <Ionicons name="arrow-forward" size={16} color={theme.c.textTertiary} />
        </View>
      </Glass>
    </Tap>
  );
}

// ─── Brand mark ───────────────────────────────────────────────────────────────

/** The check-with-ping-waves mark from the app icon, as line art. */
export function Mark({ size = 72, color, wave }: { size?: number; color?: string; wave?: string }) {
  const { theme } = useTheme();
  const stroke = color ?? theme.c.accentText;
  const w = wave ?? theme.c.warm;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path d="M22 52 L40 70 L74 32" stroke={stroke} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M80 18 A14 14 0 0 1 88 32" stroke={w} strokeWidth={5} strokeLinecap="round" fill="none" />
      <Path d="M83 6 A26 26 0 0 1 99 30" stroke={w} strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.7} />
    </Svg>
  );
}
