import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import { CATEGORY_CONFIG, RELATIONSHIP_CONFIG } from '../theme/tokens';
import { CARE_ROUTINE_TEMPLATES } from '../data/routineTemplates';
import { Screen } from '../ui/Screen';
import { Sheet } from '../ui/Sheet';
import { Button, Chip, Divider, Glass, IconWell, Rise, Tap, Txt, haptic } from '../ui/primitives';
import { Avatar } from '../ui/pieces';
import { CareRoutineTemplate, RelationshipType, User } from '../types';
import { formatRepeat } from '../utils/formatters';

type Filter = 'all' | RelationshipType | 'recovery';
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'partner', label: 'Partners' },
  { value: 'parent', label: 'Parents' },
  { value: 'child', label: 'Kids' },
  { value: 'recovery', label: 'Recovery' },
];

export function RoutinesScreen({ navigation }: any) {
  const { people, currentUser, applyRoutineTemplate } = useApp();
  const { theme } = useTheme();
  const { c } = theme;
  const [filter, setFilter] = useState<Filter>('all');
  const [picked, setPicked] = useState<CareRoutineTemplate | null>(null);
  const [targetId, setTargetId] = useState<string>(people[0]?.id ?? currentUser.id);
  const [applied, setApplied] = useState<number | null>(null);

  const everyone: User[] = [...people, currentUser];
  const list = CARE_ROUTINE_TEMPLATES.filter((t) =>
    filter === 'all' ? true : filter === 'recovery' ? t.id.includes('recovery') : t.recommendedFor.includes(filter),
  );
  const target = everyone.find((p) => p.id === targetId);

  const apply = () => {
    if (!picked || !target) return;
    const n = applyRoutineTemplate(picked.id, target.id);
    haptic.success();
    setApplied(n);
    setTimeout(() => {
      setApplied(null);
      setPicked(null);
      navigation.navigate('HomeTab', { screen: 'Home' });
    }, 1300);
  };

  return (
    <Screen title="Routines" large subtitle="A few nudges that belong together, set up in one tap." onBack={() => navigation.goBack()}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
        {FILTERS.map((f) => (
          <Chip key={f.value} label={f.label} selected={filter === f.value} onPress={() => setFilter(f.value)} />
        ))}
      </ScrollView>

      <View style={{ gap: 14, marginTop: theme.space.lg }}>
        {list.map((t, i) => {
          const forWho = t.recommendedFor.map((r) => RELATIONSHIP_CONFIG[r]?.label).filter(Boolean).join(', ');
          return (
            <Rise key={t.id} index={i}>
              <Tap onPress={() => setPicked(t)} scaleTo={0.985} accessibilityRole="button" accessibilityLabel={`${t.title}, ${t.items.length} nudges`}>
                <Glass strong style={{ padding: theme.space.xl }}>
                  <Txt v="title2">{t.title}</Txt>
                  <Txt v="footnote" tone="secondary" style={{ marginTop: 4 }}>
                    {t.subtitle}
                  </Txt>
                  <View style={{ marginTop: theme.space.lg, gap: 10 }}>
                    {t.items.slice(0, 3).map((item) => {
                      const tint = c.category[item.category];
                      return (
                        <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <IconWell name={CATEGORY_CONFIG[item.category].icon} size={32} fg={tint.fg} bg={tint.bg} />
                          <Txt v="callout" style={{ flex: 1 }} numberOfLines={1}>
                            {item.title}
                          </Txt>
                          <Txt v="footnote" tone="tertiary">
                            {item.timeLabel}
                          </Txt>
                        </View>
                      );
                    })}
                    {t.items.length > 3 && (
                      <Txt v="footnote" tone="secondary" style={{ marginLeft: 44 }}>
                        and {t.items.length - 3} more
                      </Txt>
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: theme.space.lg }}>
                    <Txt v="caption" tone="secondary">
                      {forWho ? `For ${forWho.toLowerCase()}` : ''}
                    </Txt>
                    <Txt v="subhead" tone="accent">
                      Use routine
                    </Txt>
                  </View>
                </Glass>
              </Tap>
            </Rise>
          );
        })}
      </View>

      <Sheet
        visible={!!picked}
        onClose={() => setPicked(null)}
        title={applied !== null ? 'Routine added' : picked?.title ?? ''}
        footer={
          applied !== null ? null : (
            <Button label={target ? `Add for ${target.id === currentUser.id ? 'me' : target.firstName}` : 'Choose someone'} icon="leaf-outline" disabled={!target} onPress={apply} />
          )
        }
      >
        {applied !== null ? (
          <View style={{ alignItems: 'center', paddingVertical: 28 }}>
            <IconWell name="checkmark" size={64} fg={c.onAccent} bg={c.accent} />
            <Txt v="callout" tone="secondary" style={{ marginTop: 14, textAlign: 'center' }}>
              {applied} nudges scheduled for {target?.id === currentUser.id ? 'you' : target?.firstName}.
            </Txt>
          </View>
        ) : picked ? (
          <>
            <Txt v="callout" tone="secondary">
              {picked.description}
            </Txt>
            <Txt v="headline" style={{ marginTop: theme.space.xl, marginBottom: theme.space.md }}>
              For
            </Txt>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
              {everyone.map((p) => {
                const on = p.id === targetId;
                const me = p.id === currentUser.id;
                return (
                  <Tap key={p.id} onPress={() => setTargetId(p.id)} scaleTo={0.92} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={me ? 'Me' : p.firstName} style={{ alignItems: 'center', width: 64 }}>
                    <View style={{ padding: 3, borderRadius: 36, borderWidth: 2, borderColor: on ? c.accent : 'transparent' }}>
                      <Avatar user={p} size={50} label={me ? 'Me' : undefined} />
                    </View>
                    <Txt v="footnote" tone={on ? 'accent' : 'secondary'} style={{ marginTop: 4 }} numberOfLines={1}>
                      {me ? 'Me' : p.firstName}
                    </Txt>
                  </Tap>
                );
              })}
            </ScrollView>
            <Txt v="headline" style={{ marginTop: theme.space.xl, marginBottom: theme.space.md }}>
              Includes
            </Txt>
            <Glass style={{ paddingVertical: 4 }}>
              {picked.items.map((item, i) => {
                const tint = c.category[item.category];
                return (
                  <View key={item.id}>
                    {i > 0 && <Divider inset={48} />}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
                      <IconWell name={CATEGORY_CONFIG[item.category].icon} size={34} fg={tint.fg} bg={tint.bg} />
                      <View style={{ flex: 1 }}>
                        <Txt v="callout" style={{ fontWeight: '500' }}>
                          {item.title}
                        </Txt>
                        <Txt v="footnote" tone="secondary">
                          {item.timeLabel} · {formatRepeat(item.repeat)}
                        </Txt>
                      </View>
                    </View>
                  </View>
                );
              })}
            </Glass>
          </>
        ) : null}
      </Sheet>
    </Screen>
  );
}
