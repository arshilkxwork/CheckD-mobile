import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const { theme } = useTheme();
  const { colors, radius, typography, fonts } = theme;

  const sizeMap = {
    sm: { height: 40, px: 20, fontSize: typography.sm, radius: radius.full },
    md: { height: 52, px: 26, fontSize: typography.md, radius: radius.full },
    lg: { height: 58, px: 30, fontSize: typography.lg, radius: radius.full },
    xl: { height: 64, px: 34, fontSize: typography.xl, radius: radius.full },
  };
  const s = sizeMap[size];

  const variantStyles: Record<Variant, { bg: string; text: string; border?: string; shadow?: boolean }> = {
    primary:   { bg: colors.accent, text: '#FFFFFF', shadow: true },
    secondary: { bg: colors.accentLight, text: colors.accentDark },
    soft:      { bg: colors.surfaceSubtle, text: colors.text },
    ghost:     { bg: 'transparent', text: colors.textSecondary, border: colors.border },
    danger:    { bg: colors.dangerLight, text: colors.danger },
  };
  const vs = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        {
          height: s.height,
          paddingHorizontal: s.px,
          backgroundColor: vs.bg,
          borderRadius: s.radius,
          borderWidth: vs.border ? 1.5 : 0,
          borderColor: vs.border,
          opacity: isDisabled ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        vs.shadow && !isDisabled && {
          shadowColor: colors.accent,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.18,
          shadowRadius: 16,
          elevation: 4,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={vs.text} size="small" />
      ) : (
        <>
          {icon && <View style={styles.iconLeft}>{icon}</View>}
          <Text
            style={[
              styles.label,
              {
                color: vs.text,
                fontSize: s.fontSize,
                fontFamily: fonts.bodySemibold,
              },
              textStyle,
            ]}
          >
            {label}
          </Text>
          {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { letterSpacing: 0.1 },
  iconLeft: { marginRight: 10 },
  iconRight: { marginLeft: 10 },
});
