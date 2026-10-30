import React, { useState } from 'react';
import { View, Alert, Platform, Linking } from 'react-native';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import { RELATIONSHIP_CONFIG } from '../theme/tokens';
import { Screen } from '../ui/Screen';
import { Button, Divider, Glass, Rise, Row, SectionTitle, Txt } from '../ui/primitives';
import { Avatar, EmptyState, Stat, Tag } from '../ui/pieces';
import { NudgeRow } from '../ui/NudgeRow';
import { CheerModal } from '../components/CheerModal';
import { calculateStreak } from '../utils/insights';
import { isMedicationLowSupply, wasDoseTakenToday } from '../utils/medications';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function PersonProfileScreen({ navigation, route }: any) {
  const { personId } = route.params;
  const { people, nudges, history, completeNudge, sendCheer, medications, logMedicationDose, medicationLogs, removePerson } =
    useApp();
  const { theme } = useTheme();
  const { c } = theme;
  const [cheerOpen, setCheerOpen] = useState(false);

  const person = people.find((p) => p.id === personId);
  if (!person) return null;

  const rel = person.relationship ? RELATIONSHIP_CONFIG[person.relationship] : null;
  const tint = person.relationship ? c.relationship[person.relationship] : null;
  const streak = calculateStreak(history, nudges, personId);

  const theirs = nudges.filter((n) => n.receiverId === personId);
  const today = theirs.filter(
    (n) => new Date(n.dueAt ?? n.scheduledTime).toDateString() === new Date().toDateString() || n.repeat !== 'once',
  );
  const open = today.filter((n) => n.status === 'pending' || n.status === 'snoozed');
  const done = today.filter((n) => n.status === 'completed');
  const meds = medications.filter((m) => m.personId === personId && m.isActive);

  // This week, Monday first: did they finish at least one nudge that day?
  const personHistory = history.filter((h) => h.personId === personId);
  const dow = new Date().getDay();
  const week = WEEKDAYS.map((label, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1) + i);
    const key = d.toISOString().split('T')[0];
    const isToday = d.toDateString() === new Date().toDateString();
    const hit = personHistory.some((h) => h.date === key && h.status === 'completed') || (isToday && done.length > 0);
    return { label, hit, isToday, future: d > new Date() && !isToday };
  });

  const nudgeThem = () => navigation.navigate('CreateTab', { screen: 'CreateNudge', params: { personId } });

  const confirmRemove = () => {
    const run = () => {
      removePerson(personId);
      navigation.goBack();
    };
    if (Platform.OS === 'web') return run();
    Alert.alert(`Remove ${person.firstName}?`, 'Their nudges stay in your history.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: run },
    ]);
  };

  return (
    <Screen title={person.firstName} onBack={() => navigation.goBack()}>
      <Rise>
        <View style={{ alignItems: 'center', paddingTop: 8 }}>
          <Avatar user={person} size={96} />
          <Txt v="largeTitle" style={{ marginTop: 14 }} accessibilityRole="header">
            {person.name}
          </Txt>
          {rel && tint ? (
            <View style={{ marginTop: 6, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, backgroundColor: tint.bg }}>
              <Txt v="caption" color={tint.fg}>
                {rel.label}
              </Txt>
            </View>
          ) : null}
          {person.bio ? (
            <Txt v="title2" tone="secondary" style={[theme.type.serifItalic, { marginTop: 12, textAlign: 'center', fontSize: 19 }]}>
              “{person.bio}”
            </Txt>
          ) : null}
        </View>
      </Rise>

      <Rise index={1} style={{ flexDirection: 'row', gap: 10, marginTop: theme.space.xxl }}>
        <Button label={`Nudge ${person.firstName}`} icon="paper-plane-outline" onPress={nudgeThem} style={{ flex: 1 }} />
        <Button label="Cheer" icon="heart-outline" variant="glass" onPress={() => setCheerOpen(true)} />
      </Rise>

      {(person.phone || person.email) && (
        <Rise index={1} style={{ marginTop: theme.space.md }}>
          <Glass strong style={{ padding: 16, gap: 12 }}>
            <Txt v="headline">Contact & Ping</Txt>
            {person.phone ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Txt v="footnote" tone="secondary">Phone / Contact</Txt>
                  <Txt v="body" style={{ fontWeight: '600' }}>{person.phone}</Txt>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button label="Ping SMS" size="sm" variant="glass" icon="chatbubble-ellipses-outline" onPress={() => Linking.openURL(`sms:${person.phone}`).catch(() => {})} />
                  <Button label="Call" size="sm" variant="glass" icon="call-outline" onPress={() => Linking.openURL(`tel:${person.phone}`).catch(() => {})} />
                </View>
              </View>
            ) : null}
            {person.phone && person.email ? <Divider /> : null}
            {person.email ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Txt v="footnote" tone="secondary">Email</Txt>
                  <Txt v="body" style={{ fontWeight: '600' }}>{person.email}</Txt>
                </View>
                <Button label="Email" size="sm" variant="glass" icon="mail-outline" onPress={() => Linking.openURL(`mailto:${person.email}`).catch(() => {})} />
              </View>
            ) : null}
          </Glass>
        </Rise>
      )}

      <Rise index={2} style={{ marginTop: theme.space.lg }}>
        <Glass strong>
          <View style={{ flexDirection: 'row' }}>
            <Stat value={streak.currentStreak} label="day streak" />
            <Stat value={`${streak.completionRate}%`} label="done on time" />
            <Stat value={streak.totalCompleted} label="completed" />
          </View>
          <Divider />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
            {week.map((d, i) => (
              <View key={i} style={{ alignItems: 'center', gap: 6 }} accessibilityLabel={`${d.label}: ${d.hit ? 'done' : 'nothing done'}`}>
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: d.hit ? c.accent : 'transparent',
                    borderWidth: d.hit ? 0 : 1.5,
                    borderColor: d.isToday ? c.accent : c.hairline,
                    opacity: d.future ? 0.4 : 1,
                  }}
                />
                <Txt v="caption" tone={d.isToday ? 'accent' : 'tertiary'}>
                  {d.label}
                </Txt>
              </View>
            ))}
          </View>
        </Glass>
      </Rise>

      <SectionTitle title="Today" action="Insights" onAction={() => navigation.navigate('Insights', { personId })} />
      {open.length === 0 && done.length === 0 ? (
        <EmptyState icon="leaf-outline" title="Nothing for today" body={`Send ${person.firstName} a gentle nudge.`} />
      ) : (
        <View style={{ gap: 10 }}>
          {[...open, ...done].map((n, i) => (
            <Rise key={n.id} index={i}>
              <NudgeRow
                nudge={n}
                who={person}
                direction="sent"
                onPress={() => navigation.navigate('NudgeDetail', { nudgeId: n.id })}
                onDone={() => completeNudge(n.id)}
              />
            </Rise>
          ))}
        </View>
      )}

      {meds.length > 0 && (
        <>
          <SectionTitle title="Medicines" action="Cabinet" onAction={() => navigation.navigate('Medications', { personId })} />
          <Glass style={{ paddingVertical: 4 }}>
            {meds.map((m, i) => {
              const taken = wasDoseTakenToday(m, medicationLogs);
              const low = isMedicationLowSupply(m);
              return (
                <View key={m.id}>
                  {i > 0 && <Divider inset={52} />}
                  <Row
                    icon="medkit-outline"
                    iconTint={c.category.medicine}
                    title={`${m.name} · ${m.dosage}`}
                    subtitle={low ? `Running low · ${m.currentSupply} ${m.unit} left` : `${m.currentSupply} ${m.unit} left`}
                    right={
                      taken ? (
                        <Tag tone="accent" icon="checkmark" label="Taken" />
                      ) : (
                        <Button label="Log dose" size="sm" variant="glass" onPress={() => logMedicationDose(m.id, 'taken')} />
                      )
                    }
                  />
                </View>
              );
            })}
          </Glass>
        </>
      )}

      <Button
        label={`Remove ${person.firstName} from circle`}
        variant="danger"
        size="sm"
        onPress={confirmRemove}
        style={{ marginTop: theme.space.xxxl, alignSelf: 'center' }}
      />

      <CheerModal
        visible={cheerOpen}
        onClose={() => setCheerOpen(false)}
        people={[person]}
        defaultPersonId={person.id}
        onSendCheer={sendCheer}
      />
    </Screen>
  );
}
