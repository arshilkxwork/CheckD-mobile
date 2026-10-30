import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { User } from '../types';
import { Sheet } from '../ui/Sheet';
import { Button, Chip, Glass, Tap, Txt, haptic } from '../ui/primitives';

interface CheerModalProps {
  visible: boolean;
  onClose: () => void;
  people: User[];
  defaultPersonId?: string;
  onSendCheer: (personId: string, emoji: string, message: string) => void;
}

const PRESET_CHEERS = [
  { emoji: '🌿', title: 'Proud of you', message: 'So proud of how steady you’ve been.' },
  { emoji: '❤️', title: 'Sending warmth', message: 'Thinking of you and cheering you on.' },
  { emoji: '💪', title: 'Keep going', message: 'You’ve got this. Every day counts.' },
  { emoji: '☕', title: 'Take a pause', message: 'Take a soft moment for yourself today.' },
  { emoji: '🎉', title: 'Little win', message: 'That’s a lovely streak. Well done.' },
  { emoji: '🌟', title: 'You inspire me', message: 'You make looking after each other easy.' },
];

/** A cheer is a small reaction sent to someone in your circle. */
export function CheerModal({ visible, onClose, people, defaultPersonId, onSendCheer }: CheerModalProps) {
  const { theme } = useTheme();
  const { c } = theme;
  const [personId, setPersonId] = useState(defaultPersonId || people[0]?.id || '');
  const [idx, setIdx] = useState(0);
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);

  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setPersonId(defaultPersonId || people[0]?.id || '');
      setSent(false);
    }
  }

  const person = people.find((p) => p.id === personId) || people[0];

  const send = () => {
    if (!person) return;
    const preset = PRESET_CHEERS[idx];
    onSendCheer(person.id, preset.emoji, note.trim() || preset.message);
    haptic.success();
    setSent(true);
    setTimeout(() => {
      setNote('');
      onClose();
    }, 1100);
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={sent ? 'Cheer sent' : 'Send a cheer'}
      footer={
        sent ? null : (
          <Button label={person ? `Send to ${person.firstName}` : 'Send'} icon="heart-outline" disabled={!person} onPress={send} />
        )
      }
    >
      {sent ? (
        <View style={{ alignItems: 'center', paddingVertical: 32 }}>
          <Text style={{ fontSize: 44 }}>{PRESET_CHEERS[idx].emoji}</Text>
          <Txt v="callout" tone="secondary" style={{ marginTop: 12, textAlign: 'center' }}>
            {person?.firstName} will see it in their activity.
          </Txt>
        </View>
      ) : (
        <>
          {people.length > 1 && !defaultPersonId && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {people.map((p) => (
                <Chip key={p.id} label={p.firstName} selected={p.id === personId} onPress={() => setPersonId(p.id)} />
              ))}
            </View>
          )}
          <View style={styles.grid}>
            {PRESET_CHEERS.map((p, i) => {
              const active = i === idx;
              return (
                <Tap
                  key={p.title}
                  onPress={() => setIdx(i)}
                  scaleTo={0.95}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={{ width: '48%' }}
                >
                  <Glass
                    strong={active}
                    style={{
                      alignItems: 'flex-start',
                      gap: 6,
                      paddingVertical: 14,
                      borderColor: active ? c.accent : c.glassEdge,
                      borderWidth: active ? 1.5 : StyleSheet.hairlineWidth * 2,
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>{p.emoji}</Text>
                    <Txt v="subhead" style={{ fontWeight: '600' }}>
                      {p.title}
                    </Txt>
                  </Glass>
                </Tap>
              );
            })}
          </View>
          <Glass padded={false} radius={18} style={{ marginTop: 16 }}>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder={PRESET_CHEERS[idx].message}
              placeholderTextColor={c.textTertiary}
              selectionColor={c.accent}
              multiline
              maxLength={140}
              accessibilityLabel="Add your own words"
              style={[theme.type.body, { color: c.text, minHeight: 72, padding: 16, textAlignVertical: 'top' }]}
            />
          </Glass>
        </>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
});
