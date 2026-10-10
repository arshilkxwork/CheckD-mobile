import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle?: string;
}

export function EmptyState({ emoji, title, subtitle }: EmptyStateProps) {
  const { theme } = useTheme();
  const { colors, typography, fonts, radius } = theme;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.emojiBox,
          {
            backgroundColor: colors.surfaceWarm,
            borderRadius: radius.xxxl,
          },
        ]}
      >
        <Text style={styles.emojiIcon}>{emoji}</Text>
      </View>
      <Text
        style={[
          styles.title,
          {
            color: colors.text,
            fontSize: typography.xl,
            fontFamily: fonts.heading,
          },
        ]}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          style={[
            styles.subtitle,
            {
              color: colors.textSecondary,
              fontSize: typography.md,
              fontFamily: fonts.body,
              lineHeight: typography.md * typography.lineHeightRelaxed,
            },
          ]}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 40,
  },
  emojiBox: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emojiIcon: { fontSize: 44 },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    textAlign: 'center',
  },
});
