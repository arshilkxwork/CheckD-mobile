import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { User } from '../types';

interface AvatarProps {
  user: Pick<User, 'firstName' | 'avatarColor'>;
  size?: number;
  fontSize?: number;
}

export function Avatar({ user, size = 46, fontSize }: AvatarProps) {
  const { theme } = useTheme();
  const { fonts } = theme;
  const fs = fontSize ?? Math.round(size * 0.36);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: user.avatarColor + '18',
        },
      ]}
    >
      <Text style={{ fontSize: fs, color: user.avatarColor, fontFamily: fonts.heading }}>
        {user.firstName.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
