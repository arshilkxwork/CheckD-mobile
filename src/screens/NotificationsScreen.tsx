import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import { formatTime } from '../utils/formatters';

export function NotificationsScreen({ navigation }: any) {
  const { notifications, markNotificationRead, markAllRead, unreadCount } = useApp();
  const { theme } = useTheme();
  const { colors, spacing, typography, fonts, radius, shadows } = theme;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 56 }}>
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[{ color: colors.accent, fontSize: typography.md, fontFamily: fonts.bodyMedium }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text, fontSize: typography.xl, fontFamily: fonts.heading }]}>
            Notifications
          </Text>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllRead}>
              <Text style={[{ color: colors.accent, fontSize: typography.sm, fontFamily: fonts.bodyMedium }]}>
                Mark all read
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {notifications.length === 0 ? (
          <View style={styles.emptyCenter}>
            <Text style={{ fontSize: 48 }}>🔔</Text>
            <Text style={[{ color: colors.text, fontSize: typography.xl, fontFamily: fonts.heading, marginTop: 20 }]}>
              All quiet here
            </Text>
            <Text style={[{ color: colors.textSecondary, fontSize: typography.md, fontFamily: fonts.body, marginTop: 10, textAlign: 'center', lineHeight: typography.md * typography.lineHeightRelaxed }]}>
              Your notifications will appear here.
            </Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
            {notifications.map((notif) => (
              <NotifItem
                key={notif.id}
                notif={notif}
                onPress={() => markNotificationRead(notif.id)}
                colors={colors}
                typography={typography}
                fonts={fonts}
                radius={radius}
                shadows={shadows}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function NotifItem({ notif, onPress, colors, typography, fonts, radius, shadows }: any) {
  const bgColor = notif.read ? colors.surface : colors.accentLight;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={[
        styles.notifCard,
        {
          backgroundColor: bgColor,
          borderRadius: radius.xl,
          ...shadows.sm,
        },
      ]}
    >
      <View style={styles.notifEmoji}>
        <Text style={{ fontSize: 24 }}>{notif.emoji}</Text>
      </View>
      <View style={styles.notifContent}>
        <Text
          style={[
            styles.notifTitle,
            {
              color: colors.text,
              fontSize: typography.md,
              fontFamily: notif.read ? fonts.body : fonts.bodySemibold,
            },
          ]}
        >
          {notif.title}
        </Text>
        <Text style={[styles.notifBody, { color: colors.textSecondary, fontSize: typography.sm, fontFamily: fonts.body, lineHeight: typography.sm * typography.lineHeightBody }]}>
          {notif.body}
        </Text>
        <Text style={[styles.notifTime, { color: colors.textTertiary, fontSize: typography.xs, fontFamily: fonts.body }]}>
          {formatTime(notif.timestamp)}
        </Text>
      </View>
      {!notif.read && (
        <View style={[styles.unreadDot, { backgroundColor: colors.accent }]} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
  },
  title: {},
  emptyCenter: {
    alignItems: 'center',
    paddingTop: 88,
    paddingHorizontal: 40,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    marginBottom: 12,
    gap: 14,
  },
  notifEmoji: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifContent: { flex: 1 },
  notifTitle: { marginBottom: 3 },
  notifBody: { marginBottom: 8 },
  notifTime: {},
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 8,
  },
});
