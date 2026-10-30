import React, { useMemo, useState } from 'react';
import { View, TextInput, ScrollView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import { Screen } from '../ui/Screen';
import { Button, Chip, Glass, IconButton, IconWell, Rise, Txt } from '../ui/primitives';
import { EmptyState, Stat, Tag } from '../ui/pieces';
import { AddMedicationModal } from '../components/AddMedicationModal';
import { Medication, User } from '../types';
import {
  computeCabinetStats,
  formatScheduledTimes,
  getFormLabel,
  getSupplyStatus,
  isMedicationLowSupply,
  wasDoseTakenToday,
} from '../utils/medications';

type Filter = 'all' | 'low' | 'morning' | 'evening' | 'as_needed';
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'low', label: 'Running low' },
  { value: 'morning', label: 'Morning' },
  { value: 'evening', label: 'Evening' },
  { value: 'as_needed', label: 'As needed' },
];

const hourOf = (t: string) => parseInt(t.split(':')[0], 10);

export function MedicationsScreen({ navigation, route }: any) {
  const { medications, medicationLogs, people, currentUser, addMedication, logMedicationDose, refillMedication } = useApp();
  const { theme } = useTheme();
  const { c } = theme;

  const [personId, setPersonId] = useState<string | null>(route?.params?.personId ?? null);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);

  const everyone: User[] = useMemo(() => [currentUser, ...people], [currentUser, people]);
  const stats = useMemo(() => computeCabinetStats(medications, medicationLogs), [medications, medicationLogs]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return medications.filter((m) => {
      if (personId && m.personId !== personId) return false;
      if (filter === 'low' && !isMedicationLowSupply(m)) return false;
      if (filter === 'morning' && !m.times.some((t) => hourOf(t) >= 5 && hourOf(t) < 12)) return false;
      if (filter === 'evening' && !m.times.some((t) => hourOf(t) >= 17)) return false;
      if (filter === 'as_needed' && m.frequency !== 'as_needed') return false;
      if (q) {
        const who = everyone.find((p) => p.id === m.personId)?.name.toLowerCase() ?? '';
        if (![m.name, m.dosage, m.prescribingDoctor ?? '', who].some((s) => s.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [medications, personId, filter, query, everyone]);

  const refill = (m: Medication) => {
    if (Platform.OS === 'web') return refillMedication(m.id, 30);
    Alert.alert(`Refill ${m.name}`, `${m.currentSupply} ${m.unit} left now. How many are you adding?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: '+30', onPress: () => refillMedication(m.id, 30) },
      { text: '+60', onPress: () => refillMedication(m.id, 60) },
    ]);
  };

  return (
    <Screen
      title="Care Cabinet"
      large
      subtitle="Medicines, doses and refills in one place."
      onBack={() => navigation.goBack()}
      right={<IconButton name="add" label="Add a medicine" onPress={() => setAdding(true)} />}
    >
      <Rise>
        <Glass strong style={{ flexDirection: 'row', paddingVertical: 18 }}>
          <Stat value={stats.totalActive} label="medicines" />
          <Stat value={stats.dosesLoggedToday} label="doses today" />
          <Stat value={stats.lowSupplyCount} label="running low" />
        </Glass>
      </Rise>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, marginTop: theme.space.lg }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
        <Chip label="Everyone" icon="people-outline" selected={!personId} onPress={() => setPersonId(null)} />
        {everyone.map((p) => (
          <Chip key={p.id} label={p.id === currentUser.id ? 'Me' : p.firstName} selected={personId === p.id} onPress={() => setPersonId(p.id)} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, marginTop: 8 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
        {FILTERS.map((f) => (
          <Chip key={f.value} label={f.label} selected={filter === f.value} onPress={() => setFilter(f.value)} />
        ))}
      </ScrollView>

      {medications.length > 4 && (
        <Glass padded={false} radius={22} style={{ marginTop: theme.space.md, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
          <Ionicons name="search" size={18} color={c.textTertiary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search medicines"
            placeholderTextColor={c.textTertiary}
            selectionColor={c.accent}
            accessibilityLabel="Search medicines"
            style={[theme.type.body, { flex: 1, color: c.text, paddingVertical: 13, paddingHorizontal: 10 }]}
          />
        </Glass>
      )}

      <View style={{ gap: 12, marginTop: theme.space.xl }}>
        {list.length === 0 ? (
          <EmptyState
            icon="medkit-outline"
            title={medications.length ? 'Nothing matches' : 'An empty cabinet'}
            body={medications.length ? 'Try another filter.' : 'Add a medicine to track doses and get a heads-up before it runs out.'}
            action={medications.length ? undefined : 'Add a medicine'}
            onAction={medications.length ? undefined : () => setAdding(true)}
          />
        ) : (
          list.map((m, i) => (
            <Rise key={m.id} index={i}>
              <MedCard
                med={m}
                who={personId ? null : everyone.find((p) => p.id === m.personId) ?? null}
                me={currentUser.id}
                taken={wasDoseTakenToday(m, medicationLogs)}
                onLog={() => logMedicationDose(m.id, 'taken')}
                onRefill={() => refill(m)}
              />
            </Rise>
          ))
        )}
      </View>

      <AddMedicationModal
        visible={adding}
        onClose={() => setAdding(false)}
        onSave={addMedication}
        people={people}
        currentUser={currentUser}
        initialPersonId={personId ?? undefined}
      />
    </Screen>
  );
}

function MedCard({
  med,
  who,
  me,
  taken,
  onLog,
  onRefill,
}: {
  med: Medication;
  who: User | null;
  me: string;
  taken: boolean;
  onLog: () => void;
  onRefill: () => void;
}) {
  const { theme } = useTheme();
  const { c } = theme;
  const s = getSupplyStatus(med);
  const tone = s.status === 'empty' ? c.danger : s.status === 'low' ? c.warm : c.accent;
  const tint = c.category.medicine;
  return (
    <Glass strong>
      <View style={{ flexDirection: 'row', gap: 14 }}>
        <IconWell name="medkit-outline" size={46} fg={tint.fg} bg={tint.bg} />
        <View style={{ flex: 1 }}>
          <Txt v="title2">{med.name}</Txt>
          <Txt v="footnote" tone="secondary" style={{ marginTop: 2 }}>
            {[med.dosage, getFormLabel(med.form), who ? (who.id === me ? 'Me' : who.firstName) : null].filter(Boolean).join(' · ')}
          </Txt>
          {med.times.length > 0 && (
            <Txt v="footnote" tone="secondary" style={{ marginTop: 2 }}>
              {formatScheduledTimes(med.times)}
            </Txt>
          )}
        </View>
        {taken ? <Tag tone="accent" icon="checkmark" label="Taken" /> : null}
      </View>

      <View style={{ marginTop: theme.space.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Txt v="caption" tone="secondary">
            {s.status === 'empty' ? 'Out of stock' : `${med.currentSupply} ${med.unit} left`}
          </Txt>
          <Txt v="caption" color={tone}>
            {s.status === 'empty' ? 'Refill now' : `about ${s.daysRemaining} days`}
          </Txt>
        </View>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: c.hairline, overflow: 'hidden' }}>
          <View style={{ width: `${s.percentage}%`, height: 6, borderRadius: 3, backgroundColor: tone }} />
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: theme.space.lg }}>
        {!taken && med.frequency !== 'as_needed' ? (
          <Button label="Log dose" icon="checkmark" size="sm" onPress={onLog} style={{ flex: 1 }} />
        ) : null}
        {med.frequency === 'as_needed' && !taken ? (
          <Button label="Took one" size="sm" onPress={onLog} style={{ flex: 1 }} />
        ) : null}
        <Button label="Refill" icon="refresh" size="sm" variant="glass" onPress={onRefill} style={{ flex: taken ? 1 : undefined }} />
      </View>
    </Glass>
  );
}
