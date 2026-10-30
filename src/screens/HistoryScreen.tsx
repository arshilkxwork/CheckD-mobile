import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import { CATEGORY_CONFIG } from '../theme/tokens';
import { Screen } from '../ui/Screen';
import { Button, Glass, IconButton, IconWell, Rise, Segmented, Txt } from '../ui/primitives';
import { EmptyState, LinkCard } from '../ui/pieces';
import { HistoryEntry } from '../types';
import { formatDate, formatTime } from '../utils/formatters';

type Filter = 'all' | 'completed' | 'missed';
const PAGE = 14; // days per page

export function HistoryScreen({ navigation }: any) {
  const { history } = useApp();
  const { theme } = useTheme();
  const { c } = theme;
  const [filter, setFilter] = useState<Filter>('all');
  const [days, setDays] = useState(PAGE);

  const sections = useMemo(() => {
    const byDate: Record<string, HistoryEntry[]> = {};
    history
      .filter((h) => filter === 'all' || h.status === filter)
      .forEach((h) => {
        (byDate[h.date] ??= []).push(h);
      });
    return Object.keys(byDate)
      .sort((a, b) => b.localeCompare(a))
      .map((date) => ({
        date,
        entries: byDate[date].sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? '')),
      }));
  }, [history, filter]);

  const doneCount = history.filter((h) => h.status === 'completed').length;

  return (
    <Screen
      title="History"
      large
      subtitle={history.length ? `${doneCount} moments of care so far.` : undefined}
      right={<IconButton name="stats-chart-outline" label="Insights" onPress={() => navigation.navigate('Insights')} />}
    >
      {history.length === 0 ? (
        <Rise>
          <EmptyState
            icon="book-outline"
            title="Your story starts here"
            body="Every nudge that gets done is kept here, day by day."
          />
        </Rise>
      ) : (
        <>
          <Rise style={{ flexDirection: 'row', gap: theme.space.md }}>
            <LinkCard icon="analytics-outline" title="Insights" body="Streaks, weeks and badges" tint={c.category.water} onPress={() => navigation.navigate('Insights')} />
            <LinkCard icon="medkit-outline" title="Care Cabinet" body="Dose logs and refills" tint={c.category.medicine} onPress={() => navigation.navigate('Medications')} />
          </Rise>

          <View style={{ marginTop: theme.space.xl }}>
            <Segmented<Filter>
              options={[
                { value: 'all', label: 'All' },
                { value: 'completed', label: 'Done' },
                { value: 'missed', label: 'Missed' },
              ]}
              value={filter}
              onChange={setFilter}
            />
          </View>

          {sections.length === 0 ? (
            <View style={{ marginTop: theme.space.xl }}>
              <EmptyState icon="leaf-outline" title={filter === 'missed' ? 'Nothing missed' : 'Nothing here yet'} />
            </View>
          ) : null}

          {sections.slice(0, days).map((s, si) => (
            <Rise key={s.date} index={si} style={{ marginTop: theme.space.xxl }}>
              <Txt v="title2" style={{ marginBottom: theme.space.md }}>
                {formatDate(`${s.date}T12:00:00`)}
              </Txt>
              <Glass style={{ paddingVertical: 6 }}>
                {s.entries.map((h, i) => {
                  const missed = h.status === 'missed';
                  const cat = CATEGORY_CONFIG[h.nudge.category] ?? CATEGORY_CONFIG.custom;
                  const tint = c.category[h.nudge.category] ?? c.category.custom;
                  const last = i === s.entries.length - 1;
                  return (
                    <View key={h.id} style={{ flexDirection: 'row', gap: 14 }}>
                      {/* the day's thread */}
                      <View style={{ alignItems: 'center', width: 40 }}>
                        <View style={{ width: 2, height: 12, backgroundColor: i === 0 ? 'transparent' : c.hairline }} />
                        <IconWell name={missed ? 'remove' : cat.icon} size={36} fg={missed ? c.danger : tint.fg} bg={missed ? c.dangerSoft : tint.bg} />
                        <View style={{ width: 2, flex: 1, backgroundColor: last ? 'transparent' : c.hairline }} />
                      </View>
                      <View style={{ flex: 1, paddingTop: 14, paddingBottom: 12 }}>
                        <Txt v="callout" style={{ fontWeight: '600' }} tone={missed ? 'secondary' : 'primary'}>
                          {h.nudge.title}
                        </Txt>
                        <Txt v="footnote" tone="secondary" style={{ marginTop: 2 }}>
                          {[h.personName, missed ? 'Missed' : h.completedAt ? formatTime(h.completedAt) : null].filter(Boolean).join(' · ')}
                        </Txt>
                        {h.note ? (
                          <Txt v="footnote" tone="tertiary" style={[theme.type.serifItalic, { marginTop: 4, fontSize: 15 }]}>
                            {h.note}
                          </Txt>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </Glass>
            </Rise>
          ))}

          {sections.length > days && (
            <Button label="Show earlier days" variant="glass" onPress={() => setDays((d) => d + PAGE)} style={{ marginTop: theme.space.xl }} />
          )}
        </>
      )}
    </Screen>
  );
}
