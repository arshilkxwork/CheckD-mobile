import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import { formatTime } from '../utils/formatters';

export function ReceiverNudgeScreen({ navigation, route }: any) {
  const { nudgeId } = route.params;
  const { nudges, people, currentUser, completeNudge, snoozeNudge } = useApp();
  const { theme } = useTheme();
  const { colors, typography, fonts, radius, shadows } = theme;

  const [phase, setPhase] = useState<'main' | 'completing' | 'done' | 'snoozed'>('main');

  const nudge = nudges.find((n) => n.id === nudgeId);
  if (!nudge) return null;

  const sender =
    people.find((p) => p.id === nudge.creatorId) ||
    (nudge.creatorId === currentUser.id ? currentUser : null);

  const handleComplete = async () => {
    setPhase('completing');
    await new Promise((r) => setTimeout(r, 800));
    completeNudge(nudgeId);
    setPhase('done');
  };

  const handleSnooze = () => {
    snoozeNudge(nudgeId, 15);
    setPhase('snoozed');
  };

  if (phase === 'completing') {
    return (
      <View style={[styles.fullCenter, { backgroundColor: colors.bg }]}>
        <Text style={{ fontSize: 60 }}>🌿</Text>
        <Text style={[{ color: colors.textSecondary, fontSize: typography.md, fontFamily: fonts.body, marginTop: 20 }]}>
          Saving…
        </Text>
      </View>
    );
  }

  if (phase === 'done') {
    return (
      <View style={[styles.fullCenter, { backgroundColor: colors.bg, padding: 44 }]}>
        <View
          style={[
            styles.doneCircle,
            {
              backgroundColor: colors.successLight,
            },
          ]}
        >
          <Text style={{ fontSize: 44 }}>🌿</Text>
        </View>
        <Text style={[styles.doneTitle, { color: colors.text, fontSize: typography.xxxl, fontFamily: fonts.headingBold }]}>
          Done ❤️
        </Text>
        <Text style={[{ color: colors.textSecondary, fontSize: typography.lg, fontFamily: fonts.body, marginTop: 10 }]}>
          You're all set.
        </Text>
        {sender && (
          <View
            style={[
              styles.senderNote,
              {
                backgroundColor: colors.accentSoft,
                borderRadius: radius.xxl,
                marginTop: 28,
              },
            ]}
          >
            <Text style={{ fontSize: 18 }}>💌</Text>
            <Text style={[{ color: colors.accentDark, fontSize: typography.md, fontFamily: fonts.bodyMedium }]}>
              {sender.firstName} has been notified.
            </Text>
          </View>
        )}
        <Text style={[{ color: colors.textTertiary, fontSize: typography.sm, fontFamily: fonts.body, marginTop: 24 }]}>
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[
            styles.backBtn,
            {
              backgroundColor: colors.accent,
              borderRadius: radius.full,
              marginTop: 40,
              ...shadows.accent,
            },
          ]}
        >
          <Text style={[{ color: '#fff', fontSize: typography.md, fontFamily: fonts.bodySemibold }]}>
            Back to home
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === 'snoozed') {
    return (
      <View style={[styles.fullCenter, { backgroundColor: colors.bg, padding: 44 }]}>
        <Text style={{ fontSize: 52 }}>⏰</Text>
        <Text style={[{ color: colors.text, fontSize: typography.xxl, fontFamily: fonts.headingBold, marginTop: 24, textAlign: 'center' }]}>
          Snoozed 15 min
        </Text>
        <Text style={[{ color: colors.textSecondary, fontSize: typography.md, fontFamily: fonts.body, marginTop: 10, textAlign: 'center', lineHeight: typography.md * typography.lineHeightRelaxed }]}>
          We'll check in again soon.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[
            styles.backBtn,
            {
              backgroundColor: colors.surface,
              borderRadius: radius.full,
              marginTop: 40,
              ...shadows.sm,
            },
          ]}
        >
          <Text style={[{ color: colors.text, fontSize: typography.md, fontFamily: fonts.bodySemibold }]}>
            Back to home
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        {/* Close */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[
            styles.closeBtn,
            {
              position: 'absolute',
              top: 20,
              right: 20,
              backgroundColor: colors.surfaceSubtle,
              borderRadius: radius.full,
            },
          ]}
        >
          <Text style={[{ color: colors.textSecondary, fontSize: 15 }]}>✕</Text>
        </TouchableOpacity>

        {/* Emoji bubble — large and warm */}
        <View
          style={[
            styles.bigEmoji,
            {
              backgroundColor: colors.surfaceWarm,
              borderRadius: radius.xxxl,
              ...shadows.md,
            },
          ]}
        >
          <Text style={{ fontSize: 60 }}>{nudge.emoji}</Text>
        </View>

        {/* Sender tag */}
        {sender && (
          <View
            style={[
              styles.senderTag,
              {
                backgroundColor: sender.avatarColor + '14',
                borderRadius: radius.full,
                marginTop: 32,
              },
            ]}
          >
            <View style={[styles.senderDot, { backgroundColor: sender.avatarColor }]} />
            <Text style={[{ color: sender.avatarColor, fontSize: typography.sm, fontFamily: fonts.bodySemibold }]}>
              from {sender.firstName}
            </Text>
          </View>
        )}

        {/* Title */}
        <Text
          style={[
            styles.receiverTitle,
            {
              color: colors.text,
              fontSize: typography.xxxl,
              fontFamily: fonts.headingBold,
              marginTop: 16,
            },
          ]}
        >
          {nudge.category === 'medicine'
            ? 'Time for your\nmedicine'
            : nudge.title}
        </Text>

        <Text style={[{ color: colors.textTertiary, fontSize: typography.md, fontFamily: fonts.body, marginTop: 12 }]}>
          {formatTime(nudge.scheduledTime)}
        </Text>

        {/* Actions */}
        <View style={{ width: '100%', marginTop: 52, gap: 14 }}>
          <TouchableOpacity
            onPress={handleComplete}
            activeOpacity={0.8}
            style={[
              styles.completeBtn,
              {
                backgroundColor: colors.accent,
                borderRadius: radius.full,
                ...shadows.accent,
              },
            ]}
          >
            <Text style={[{ fontSize: 20, marginRight: 10 }]}>✓</Text>
            <Text style={[{ color: '#fff', fontSize: typography.xl, fontFamily: fonts.bodySemibold }]}>
              I took it
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSnooze}
            activeOpacity={0.82}
            style={[
              styles.snoozeBtn,
              {
                backgroundColor: colors.surface,
                borderRadius: radius.full,
                ...shadows.sm,
              },
            ]}
          >
            <Text style={[{ color: colors.textSecondary, fontSize: typography.md, fontFamily: fonts.bodyMedium }]}>
              ⏰ Remind me later
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  doneCircle: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  doneTitle: { textAlign: 'center' },
  senderNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 22,
    paddingVertical: 16,
  },
  backBtn: {
    paddingVertical: 18,
    paddingHorizontal: 44,
    alignItems: 'center',
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigEmoji: {
    width: 148,
    height: 148,
    alignItems: 'center',
    justifyContent: 'center',
  },
  senderTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  senderDot: { width: 6, height: 6, borderRadius: 3 },
  receiverTitle: {
    textAlign: 'center',
    lineHeight: 38,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
  },
  snoozeBtn: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
