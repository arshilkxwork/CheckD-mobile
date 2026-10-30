import React from 'react';
import { View } from 'react-native';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import { RELATIONSHIP_CONFIG } from '../theme/tokens';
import { Screen } from '../ui/Screen';
import { Button, Glass, IconButton, Rise, SectionTitle, Tap, Txt } from '../ui/primitives';
import { Avatar, EmptyState, Tag } from '../ui/pieces';
import { Nudge, User } from '../types';

const ORDER = ['partner', 'parent', 'child', 'family', 'friend'];

function statsFor(personId: string, nudges: Nudge[]) {
  const theirs = nudges.filter((n) => n.receiverId === personId);
  const open = theirs.filter((n) => n.status === 'pending' || n.status === 'snoozed').length;
  const doneToday = theirs.filter(
    (n) => n.status === 'completed' && n.completedAt && new Date(n.completedAt).toDateString() === new Date().toDateString(),
  ).length;
  return { total: theirs.length, open, doneToday };
}

export function PeopleScreen({ navigation }: any) {
  const { people, nudges } = useApp();
  const { theme } = useTheme();

  const sorted = [...people].sort(
    (a, b) => ORDER.indexOf(a.relationship ?? 'friend') - ORDER.indexOf(b.relationship ?? 'friend'),
  );
  const [featured, ...rest] = sorted;
  const openProfile = (p: User) => navigation.navigate('PersonProfile', { personId: p.id });
  const nudge = (p: User) => navigation.navigate('CreateTab', { screen: 'CreateNudge', params: { personId: p.id } });

  return (
    <Screen
      title="Your circle"
      large
      subtitle="The people you look out for."
      right={<IconButton name="person-add-outline" label="Add someone" onPress={() => navigation.navigate('AddPerson')} />}
    >
      {people.length === 0 ? (
        <Rise>
          <EmptyState
            icon="heart-outline"
            title="Add your person"
            body="Start with your partner, or anyone you’d like to look out for. You can nudge them as soon as they’re here."
            action="Add someone"
            onAction={() => navigation.navigate('AddPerson')}
          />
        </Rise>
      ) : (
        <>
          <Rise index={0}>
            <FeaturedPerson person={featured} nudges={nudges} onPress={() => openProfile(featured)} onNudge={() => nudge(featured)} />
          </Rise>

          {rest.length > 0 && <SectionTitle title="Everyone else" />}
          <View style={{ gap: 10 }}>
            {rest.map((p, i) => {
              const s = statsFor(p.id, nudges);
              const rel = p.relationship ? RELATIONSHIP_CONFIG[p.relationship] : null;
              return (
                <Rise key={p.id} index={i + 1}>
                  <Tap onPress={() => openProfile(p)} scaleTo={0.985} accessibilityRole="button" accessibilityLabel={p.name}>
                    <Glass style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 }}>
                      <Avatar user={p} size={48} />
                      <View style={{ flex: 1, gap: 2 }}>
                        <Txt v="title2">{p.firstName}</Txt>
                        <Txt v="footnote" tone="secondary">
                          {[rel?.label, s.open ? `${s.open} open` : s.doneToday ? `${s.doneToday} done today` : 'All quiet']
                            .filter(Boolean)
                            .join(' · ')}
                        </Txt>
                      </View>
                      <IconButton name="paper-plane-outline" label={`Nudge ${p.firstName}`} onPress={() => nudge(p)} />
                    </Glass>
                  </Tap>
                </Rise>
              );
            })}
          </View>

          <Button
            label="Add someone"
            icon="person-add-outline"
            variant="glass"
            onPress={() => navigation.navigate('AddPerson')}
            style={{ marginTop: theme.space.xxl }}
          />
        </>
      )}
    </Screen>
  );
}

function FeaturedPerson({
  person,
  nudges,
  onPress,
  onNudge,
}: {
  person: User;
  nudges: Nudge[];
  onPress: () => void;
  onNudge: () => void;
}) {
  const { theme } = useTheme();
  const s = statsFor(person.id, nudges);
  const rel = person.relationship ? RELATIONSHIP_CONFIG[person.relationship] : null;
  const tint = person.relationship ? theme.c.relationship[person.relationship] : undefined;
  return (
    <Tap onPress={onPress} scaleTo={0.985} accessibilityRole="button" accessibilityLabel={`${person.name}, open profile`}>
      <Glass strong lifted radius={theme.radius.xl} style={{ padding: theme.space.xl }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Avatar user={person} size={72} />
          <View style={{ flex: 1, gap: 6 }}>
            <Txt v="title">{person.firstName}</Txt>
            {rel && tint ? (
              <View style={{ flexDirection: 'row' }}>
                <View style={{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, backgroundColor: tint.bg }}>
                  <Txt v="caption" color={tint.fg}>
                    {rel.label}
                  </Txt>
                </View>
              </View>
            ) : null}
          </View>
        </View>
        {person.bio ? (
          <Txt v="callout" tone="secondary" style={[theme.type.serifItalic, { marginTop: theme.space.lg, fontSize: 18 }]}>
            “{person.bio}”
          </Txt>
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: theme.space.lg }}>
          <View style={{ flex: 1 }}>
            {s.open > 0 ? (
              <Tag tone="warm" icon="time-outline" label={`${s.open} still open`} />
            ) : (
              <Tag tone="accent" icon="checkmark" label={s.doneToday ? `${s.doneToday} done today` : 'All quiet'} />
            )}
          </View>
          <Button label={`Nudge ${person.firstName}`} icon="paper-plane-outline" size="sm" onPress={onNudge} />
        </View>
      </Glass>
    </Tap>
  );
}
