import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import { formatTime, formatRepeat, formatReminderInterval } from '../utils/formatters';
import { CATEGORY_CONFIG, RELATIONSHIP_CONFIG } from '../theme/tokens';

export function NudgeDetailScreen({ navigation, route }: any) {
  const { nudgeId } = route.params;
  const { nudges, people, currentUser, deleteNudge, completeNudge, snoozeNudge } = useApp();
  const { theme } = useTheme();
  const { colors, spacing, typography, fonts, radius, shadows } = theme;

  const nudge = nudges.find((n) => n.id === nudgeId);
  if (!nudge) {
    navigation.goBack();
    return null;
  }

  const receiver =
    people.find((p) => p.id === nudge.receiverId) ||
    (nudge.receiverId === currentUser.id ? currentUser : null);

  const rel = receiver?.relationship ? RELATIONSHIP_CONFIG[receiver.relationship] : null;
  const cat = CATEGORY_CONFIG[nudge.category];
  const isOwner = nudge.creatorId === currentUser.id;
  const isPending = nudge.status === 'pending' || nudge.status === 'snoozed';

  const handleDelete = () => {
    Alert.alert('Delete nudge?', 'This will remove the nudge permanently.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteNudge(nudgeId);
          navigation.goBack();
        },
      },
    ]);
  };

  const statusColor =
    nudge.status === 'completed'
      ? colors.success
      : nudge.status === 'missed'
      ? colors.danger
      : colors.warning;
  const statusLabel =
    nudge.status === 'completed'
      ? `✓ Completed at ${nudge.completedAt ? formatTime(nudge.completedAt) : ''}`
      : nudge.status === 'missed'
      ? '— Missed'
      : nudge.status === 'snoozed'
      ? '⏱ Snoozed'
      : `⏳ Pending · due ${formatTime(nudge.scheduledTime)}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      {/* Nav */}
      <View style={[styles.navHeader, { borderBottomColor: colors.divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[{ color: colors.accent, fontSize: typography.md, fontFamily: fonts.bodyMedium }]}>← Back</Text>
        </TouchableOpacity>
        {isOwner && (
          <TouchableOpacity onPress={handleDelete}>
            <Text style={[{ color: colors.danger, fontSize: typography.md, fontFamily: fonts.bodyMedium }]}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 56 }}>
        {/* Big emoji */}
        <View style={{ alignItems: 'center', paddingTop: 36, paddingBottom: 28 }}>
          <View
            style={[
              styles.bigEmoji,
              { backgroundColor: colors.surfaceWarm, borderRadius: radius.xxxl },
            ]}
          >
            <Text style={{ fontSize: 48 }}>{nudge.emoji}</Text>
          </View>
          <Text
            style={[
              styles.nudgeTitle,
              { color: colors.text, fontSize: typography.xxl, fontFamily: fonts.headingBold, marginTop: 20 },
            ]}
          >
            {nudge.title}
          </Text>
          {nudge.description && (
            <Text style={[{ color: colors.textSecondary, fontSize: typography.md, fontFamily: fonts.body, marginTop: 8, textAlign: 'center', lineHeight: typography.md * typography.lineHeightRelaxed }]}>
              {nudge.description}
            </Text>
          )}
        </View>

        {/* Status card */}
        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: colors.surface,
              borderRadius: radius.xxl,
              ...shadows.sm,
            },
          ]}
        >
          <Text style={[{ color: statusColor, fontSize: typography.md, fontFamily: fonts.bodySemibold, textAlign: 'center' }]}>
            {statusLabel}
          </Text>
        </View>

        {/* Details */}
        <View
          style={[
            styles.detailCard,
            {
              backgroundColor: colors.surface,
              borderRadius: radius.xxl,
              marginTop: spacing.lg,
              ...shadows.sm,
            },
          ]}
        >
          <DetailRow
            label="For"
            value={receiver?.firstName ?? '—'}
            extra={rel ? `${rel.emoji} ${rel.label}` : undefined}
            colors={colors}
            typography={typography}
            fonts={fonts}
          />
          <DetailRow label="Category" value={`${cat?.emoji} ${cat?.label}`} colors={colors} typography={typography} fonts={fonts} />
          <DetailRow label="Time" value={formatTime(nudge.scheduledTime)} colors={colors} typography={typography} fonts={fonts} />
          <DetailRow label="Repeat" value={formatRepeat(nudge.repeat)} colors={colors} typography={typography} fonts={fonts} />
          <DetailRow
            label="Reminder"
            value={formatReminderInterval(nudge.reminderInterval)}
            colors={colors}
            typography={typography}
            fonts={fonts}
            isLast
          />
        </View>

        {/* Actions for owner */}
        {isOwner && isPending && (
          <View style={{ marginTop: spacing.xl, gap: 12 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('CreateNudge')}
              style={[
                styles.actionBtn,
                {
                  backgroundColor: colors.surface,
                  borderRadius: radius.xxl,
                  ...shadows.sm,
                },
              ]}
            >
              <Text style={[{ color: colors.text, fontSize: typography.md, fontFamily: fonts.bodyMedium }]}>
                ✏️  Edit nudge
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action for receiver */}
        {!isOwner && isPending && (
          <View style={{ marginTop: spacing.xl, gap: 12 }}>
            <TouchableOpacity
              onPress={() => {
                completeNudge(nudgeId);
                navigation.goBack();
              }}
              style={[
                styles.completeBtn,
                { backgroundColor: colors.accent, borderRadius: radius.full, ...shadows.accent },
              ]}
            >
              <Text style={[{ color: '#fff', fontSize: typography.lg, fontFamily: fonts.bodySemibold }]}>
                ✓ Mark as done
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                snoozeNudge(nudgeId, 15);
                navigation.goBack();
              }}
              style={[
                styles.actionBtn,
                {
                  backgroundColor: colors.surface,
                  borderRadius: radius.xxl,
                  ...shadows.sm,
                },
              ]}
            >
              <Text style={[{ color: colors.textSecondary, fontSize: typography.md, fontFamily: fonts.bodyMedium }]}>
                ⏰ Snooze 15 min
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({
  label,
  value,
  extra,
  isLast,
  colors,
  typography,
  fonts,
}: {
  label: string;
  value: string;
  extra?: string;
  isLast?: boolean;
  colors: any;
  typography: any;
  fonts: any;
}) {
  return (
    <View
      style={[
        styles.detailRow,
        {
          borderBottomWidth: isLast ? 0 : 1,
          borderBottomColor: colors.divider,
        },
      ]}
    >
      <Text style={[styles.detailLabel, { color: colors.textSecondary, fontSize: typography.sm, fontFamily: fonts.body }]}>
        {label}
      </Text>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.detailValue, { color: colors.text, fontSize: typography.md, fontFamily: fonts.bodyMedium }]}>
          {value}
        </Text>
        {extra && (
          <Text style={[{ color: colors.textTertiary, fontSize: typography.xs, fontFamily: fonts.body }]}>{extra}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  bigEmoji: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nudgeTitle: {
    textAlign: 'center',
  },
  statusCard: {
    paddingVertical: 18,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  detailCard: {
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 16,
  },
  detailLabel: {},
  detailValue: {},
  completeBtn: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  actionBtn: {
    paddingVertical: 18,
    alignItems: 'center',
  },
});
