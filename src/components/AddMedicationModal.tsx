import React, { useState } from 'react';
import { View, TextInput, Switch, ScrollView, Platform, TextInputProps } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Medication, MedicationForm, MedicationFrequency, User } from '../types';
import { generateId } from '../utils/formatters';
import { formatTimeLabel } from '../utils/medications';
import { Sheet } from '../ui/Sheet';
import { Button, Chip, Glass, Tap, Txt, haptic } from '../ui/primitives';
import { Avatar, Tag } from '../ui/pieces';

interface AddMedicationModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (med: Medication, autoCreateNudges: boolean) => void;
  people: User[];
  currentUser: User;
  initialPersonId?: string;
}

const FORMS: { form: MedicationForm; label: string }[] = [
  { form: 'tablet', label: 'Tablet' },
  { form: 'capsule', label: 'Capsule' },
  { form: 'liquid', label: 'Liquid' },
  { form: 'drops', label: 'Drops' },
  { form: 'inhaler', label: 'Inhaler' },
  { form: 'spray', label: 'Spray' },
];

const FREQS: { freq: MedicationFrequency; label: string; times: string[] }[] = [
  { freq: 'once_daily', label: 'Once a day', times: ['08:00'] },
  { freq: 'twice_daily', label: 'Twice a day', times: ['08:00', '20:00'] },
  { freq: 'thrice_daily', label: '3 times a day', times: ['08:00', '13:00', '20:00'] },
  { freq: 'as_needed', label: 'As needed', times: [] },
];

export function AddMedicationModal({ visible, onClose, onSave, people, currentUser, initialPersonId }: AddMedicationModalProps) {
  const { theme } = useTheme();
  const { c } = theme;
  const everyone = [currentUser, ...people.filter((p) => p.id !== currentUser.id)];

  const [personId, setPersonId] = useState(initialPersonId || people[0]?.id || currentUser.id);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [form, setForm] = useState<MedicationForm>('tablet');
  const [frequency, setFrequency] = useState<MedicationFrequency>('once_daily');
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [supply, setSupply] = useState('30');
  const [threshold, setThreshold] = useState('7');
  const [unit, setUnit] = useState('pills');
  const [instructions, setInstructions] = useState('');
  const [doctor, setDoctor] = useState('');
  const [pharmacy, setPharmacy] = useState('');
  const [more, setMore] = useState(false);
  const [autoNudges, setAutoNudges] = useState(true);
  const [error, setError] = useState('');

  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setPersonId(initialPersonId || people[0]?.id || currentUser.id);
  }

  const reset = () => {
    setName('');
    setDosage('');
    setForm('tablet');
    setFrequency('once_daily');
    setTimes(['08:00']);
    setSupply('30');
    setThreshold('7');
    setUnit('pills');
    setInstructions('');
    setDoctor('');
    setPharmacy('');
    setMore(false);
    setError('');
  };

  // Each tap moves that dose an hour later, wrapping at midnight.
  const shiftTime = (i: number) => {
    setTimes((prev) =>
      prev.map((t, idx) => {
        if (idx !== i) return t;
        const [h, m] = t.split(':').map(Number);
        return `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      }),
    );
  };

  const save = () => {
    if (!name.trim()) return setError('Add the medicine’s name.');
    if (!dosage.trim()) return setError('Add the dose, for example 5 mg.');
    const s = parseInt(supply, 10) || 30;
    const med: Medication = {
      id: generateId(),
      personId,
      name: name.trim(),
      dosage: dosage.trim(),
      form,
      color: '#6D5FA0',
      instructions: instructions.trim(),
      frequency,
      times,
      currentSupply: s,
      totalCapacity: s,
      lowSupplyThreshold: parseInt(threshold, 10) || 7,
      unit: unit.trim() || 'pills',
      prescribingDoctor: doctor.trim() || undefined,
      pharmacy: pharmacy.trim() || undefined,
      isActive: true,
      adherenceRate: 100,
      createdAt: new Date().toISOString(),
    };
    haptic.success();
    onSave(med, autoNudges && times.length > 0);
    reset();
    onClose();
  };

  const input = (props: TextInputProps & { label: string }) => (
    <View style={{ flex: 1 }}>
      <Txt v="subhead" tone="secondary" style={{ marginBottom: 6 }}>
        {props.label}
      </Txt>
      <Glass strong padded={false} radius={16}>
        <TextInput
          {...props}
          placeholderTextColor={c.textTertiary}
          selectionColor={c.accent}
          accessibilityLabel={props.label}
          style={[theme.type.body, { color: c.text, paddingHorizontal: 16, paddingVertical: 13 }]}
        />
      </Glass>
    </View>
  );

  const heading = (t: string) => (
    <Txt v="headline" style={{ marginTop: theme.space.xl, marginBottom: theme.space.md }}>
      {t}
    </Txt>
  );

  return (
    <Sheet
      visible={visible}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Add a medicine"
      footer={
        <View style={{ gap: 8 }}>
          {error ? (
            <Txt v="footnote" tone="danger" style={{ textAlign: 'center' }} accessibilityLiveRegion="polite">
              {error}
            </Txt>
          ) : null}
          <Button label="Add to cabinet" icon="medkit-outline" onPress={save} />
        </View>
      }
    >
      <Txt v="headline" style={{ marginBottom: theme.space.md }}>
        For
      </Txt>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        {everyone.map((p) => {
          const on = p.id === personId;
          const me = p.id === currentUser.id;
          return (
            <Tap key={p.id} onPress={() => setPersonId(p.id)} scaleTo={0.92} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={me ? 'Me' : p.firstName} style={{ alignItems: 'center', width: 60 }}>
              <View style={{ padding: 3, borderRadius: 34, borderWidth: 2, borderColor: on ? c.accent : 'transparent' }}>
                <Avatar user={p} size={46} label={me ? 'Me' : undefined} />
              </View>
              <Txt v="footnote" tone={on ? 'accent' : 'secondary'} style={{ marginTop: 4 }} numberOfLines={1}>
                {me ? 'Me' : p.firstName}
              </Txt>
            </Tap>
          );
        })}
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: theme.space.xl }}>
        <View style={{ flex: 1.6 }}>{input({ label: 'Name', value: name, onChangeText: (t) => { setName(t); setError(''); }, placeholder: 'Amlodipine', autoCapitalize: 'words' })}</View>
        <View style={{ flex: 1 }}>{input({ label: 'Dose', value: dosage, onChangeText: (t) => { setDosage(t); setError(''); }, placeholder: '5 mg' })}</View>
      </View>

      {heading('Form')}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {FORMS.map((f) => (
          <Chip key={f.form} label={f.label} selected={form === f.form} onPress={() => setForm(f.form)} />
        ))}
      </View>

      {heading('How often')}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {FREQS.map((f) => (
          <Chip
            key={f.freq}
            label={f.label}
            selected={frequency === f.freq}
            onPress={() => {
              setFrequency(f.freq);
              setTimes(f.times);
            }}
          />
        ))}
      </View>
      {times.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, alignItems: 'center' }}>
          {times.map((t, i) => (
            <Chip key={i} label={formatTimeLabel(t)} icon="time-outline" onPress={() => shiftTime(i)} />
          ))}
          <Txt v="caption" tone="tertiary">
            Tap a time to move it an hour
          </Txt>
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 10, marginTop: theme.space.xl }}>
        {input({ label: 'In stock', value: supply, onChangeText: setSupply, keyboardType: 'number-pad' })}
        {input({ label: 'Unit', value: unit, onChangeText: setUnit })}
        {input({ label: 'Warn at', value: threshold, onChangeText: setThreshold, keyboardType: 'number-pad' })}
      </View>

      <Glass style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: theme.space.xl }}>
        <View style={{ flex: 1 }}>
          <Txt v="callout" style={{ fontWeight: '500' }}>
            Create dose nudges
          </Txt>
          <Txt v="footnote" tone="secondary">
            A daily nudge for each time above
          </Txt>
        </View>
        <Switch
          value={autoNudges && times.length > 0}
          disabled={times.length === 0}
          onValueChange={setAutoNudges}
          accessibilityLabel="Create dose nudges"
          trackColor={{ false: c.hairline, true: c.accent }}
          thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
          {...({ activeThumbColor: '#FFFFFF' } as object)}
          ios_backgroundColor={c.hairline}
        />
      </Glass>

      {more ? (
        <View style={{ gap: 12, marginTop: theme.space.xl }}>
          {input({ label: 'Instructions', value: instructions, onChangeText: setInstructions, placeholder: 'With food, after breakfast' })}
          {input({ label: 'Doctor', value: doctor, onChangeText: setDoctor, placeholder: 'Optional' })}
          {input({ label: 'Pharmacy', value: pharmacy, onChangeText: setPharmacy, placeholder: 'Optional' })}
        </View>
      ) : (
        <View style={{ marginTop: theme.space.lg, alignItems: 'flex-start' }}>
          <Tap onPress={() => setMore(true)} accessibilityRole="button">
            <Tag tone="muted" icon="add" label="Instructions, doctor, pharmacy" />
          </Tap>
        </View>
      )}
    </Sheet>
  );
}
