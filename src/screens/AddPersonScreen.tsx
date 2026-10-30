import React, { useState } from 'react';
import { View, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import { RELATIONSHIP_CONFIG } from '../theme/tokens';
import { Screen } from '../ui/Screen';
import { Button, Chip, Glass, Rise, Tap, Txt, haptic } from '../ui/primitives';
import { Avatar } from '../ui/pieces';
import { User, RelationshipType } from '../types';
import { generateId } from '../utils/formatters';

const RELATIONSHIPS: RelationshipType[] = ['partner', 'parent', 'family', 'child', 'friend'];

// Earthy tones that read on both the misty and the forest ground.
const AVATAR_COLORS = ['#9E5946', '#4F7F42', '#6D5FA0', '#8A6627', '#3F7398', '#8B6A55', '#3F8A78', '#A0607A'];

export function AddPersonScreen({ navigation }: any) {
  const { addPerson } = useApp();
  const { theme } = useTheme();
  const { c } = theme;
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [relationship, setRelationship] = useState<RelationshipType>('partner');
  const [color, setColor] = useState(AVATAR_COLORS[0]);

  const trimmed = name.trim();

  const add = () => {
    if (!trimmed) return;
    const person: User = {
      id: generateId(),
      name: trimmed,
      firstName: trimmed.split(' ')[0],
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      avatarColor: color,
      bio: bio.trim() || undefined,
      relationship,
      accountabilityLevel: 'trust',
      privacy: {
        showCompletedTasks: true,
        showExactTimes: true,
        showMedicationNames: false,
        shareHistory: true,
        requireProof: false,
      },
      notificationPrefs: {
        enabled: true,
        reminderInterval: 15,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
        sounds: true,
        vibration: true,
      },
      createdAt: new Date().toISOString(),
    };
    addPerson(person);
    haptic.success();
    navigation.goBack();
  };

  const field = [theme.type.body, { color: c.text, paddingHorizontal: 18, paddingVertical: 16 }];

  return (
    <Screen
      title="Add someone"
      onBack={() => navigation.goBack()}
      backIcon="close"
      keyboard
      bottomInset={24}
      footer={
        <View style={{ paddingHorizontal: theme.space.xl, paddingBottom: insets.bottom + 12, paddingTop: 8 }}>
          <Button label={trimmed ? `Add ${trimmed.split(' ')[0]}` : 'Add to circle'} icon="checkmark" disabled={!trimmed} onPress={add} />
        </View>
      }
    >
      <Rise style={{ alignItems: 'center', marginTop: 8, marginBottom: theme.space.xxl }}>
        <Avatar user={{ firstName: trimmed || '?', avatarColor: color }} size={88} />
        <Txt v="title" style={{ marginTop: 12 }}>
          {trimmed || 'Someone you love'}
        </Txt>
      </Rise>

      <Txt v="subhead" tone="secondary" style={{ marginBottom: 8 }}>
        Name
      </Txt>
      <Glass strong padded={false} radius={18}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Their name"
          placeholderTextColor={c.textTertiary}
          selectionColor={c.accent}
          autoCapitalize="words"
          autoFocus
          maxLength={40}
          accessibilityLabel="Their name"
          style={field}
        />
      </Glass>

      <Txt v="subhead" tone="secondary" style={{ marginTop: theme.space.xl, marginBottom: 8 }}>
        Email Address
      </Txt>
      <Glass strong padded={false} radius={18}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="partner@example.com"
          placeholderTextColor={c.textTertiary}
          selectionColor={c.accent}
          autoCapitalize="none"
          keyboardType="email-address"
          maxLength={80}
          accessibilityLabel="Their email"
          style={field}
        />
      </Glass>

      <Txt v="subhead" tone="secondary" style={{ marginTop: theme.space.xl, marginBottom: 8 }}>
        Contact Number (Phone)
      </Txt>
      <Glass strong padded={false} radius={18}>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="+1 (555) 012-3456"
          placeholderTextColor={c.textTertiary}
          selectionColor={c.accent}
          keyboardType="phone-pad"
          maxLength={30}
          accessibilityLabel="Their contact number"
          style={field}
        />
      </Glass>
      <Txt v="footnote" tone="tertiary" style={{ marginTop: 6, marginHorizontal: 4 }}>
        CheckD will ping them directly with gentle reminder notifications.
      </Txt>

      <Txt v="subhead" tone="secondary" style={{ marginTop: theme.space.xl, marginBottom: 8 }}>
        They are your
      </Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {RELATIONSHIPS.map((r) => (
          <Chip
            key={r}
            label={RELATIONSHIP_CONFIG[r].label}
            icon={RELATIONSHIP_CONFIG[r].icon}
            selected={relationship === r}
            onPress={() => setRelationship(r)}
          />
        ))}
      </View>

      <Txt v="subhead" tone="secondary" style={{ marginTop: theme.space.xl, marginBottom: 8 }}>
        Colour
      </Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {AVATAR_COLORS.map((col) => (
          <Tap
            key={col}
            onPress={() => setColor(col)}
            scaleTo={0.9}
            accessibilityRole="button"
            accessibilityLabel={`Colour ${col}`}
            accessibilityState={{ selected: color === col }}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              padding: 4,
              borderWidth: 2,
              borderColor: color === col ? c.text : 'transparent',
            }}
          >
            <View style={{ flex: 1, borderRadius: 18, backgroundColor: col }} />
          </Tap>
        ))}
      </View>

      <Txt v="subhead" tone="secondary" style={{ marginTop: theme.space.xl, marginBottom: 8 }}>
        A few words (optional)
      </Txt>
      <Glass strong padded={false} radius={18}>
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="My favourite person"
          placeholderTextColor={c.textTertiary}
          selectionColor={c.accent}
          maxLength={80}
          accessibilityLabel="A few words about them"
          style={field}
        />
      </Glass>
    </Screen>
  );
}
