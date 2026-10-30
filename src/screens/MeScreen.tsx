import React, { useCallback, useEffect, useState } from 'react';
import { View, TextInput, Switch, Alert, Linking, AppState, Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useApp } from '../context/AppContext';
import { useTheme, AppearanceMode } from '../theme/ThemeContext';
import { Screen } from '../ui/Screen';
import { Button, Divider, Glass, IconButton, Rise, Row, Segmented, SectionTitle, Txt } from '../ui/primitives';
import { Avatar, Tag } from '../ui/pieces';
import { getPermissionStatus, requestPermission, configureReminders, NUDGE_CATEGORY } from '../services/reminders';
import { isMedicationLowSupply } from '../utils/medications';
import type { IconName } from '../theme/tokens';
import type { AccountabilityLevel, PrivacySettings } from '../types';

const APP_NAME = Constants.expoConfig?.name ?? 'Pingkin';

const ACCOUNTABILITY: { key: AccountabilityLevel; label: string; desc: string; icon: IconName }[] = [
  { key: 'trust', label: 'Trust', desc: 'Just confirm when done.', icon: 'hand-left-outline' },
  { key: 'checkin', label: 'Check-in', desc: 'Confirm, with an optional note.', icon: 'chatbubble-outline' },
  { key: 'strict', label: 'Strict', desc: 'Full confirmation required.', icon: 'lock-closed-outline' },
];

const PRIVACY: { key: keyof PrivacySettings; label: string; desc: string }[] = [
  { key: 'showCompletedTasks', label: 'Show completed tasks', desc: 'Your circle sees when you finish' },
  { key: 'showExactTimes', label: 'Show exact times', desc: 'Share precise completion times' },
  { key: 'showMedicationNames', label: 'Show medicine names', desc: 'Otherwise shown as “medicine”' },
  { key: 'shareHistory', label: 'Share history', desc: 'Let your circle see past activity' },
];

export function MeScreen({ navigation }: any) {
  const { currentUser, setCurrentUser, nudges, medications, resetApp, logout } = useApp();
  const { theme, mode, setMode } = useTheme();
  const { c } = theme;

  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(currentUser.firstName);
  const [permission, setPermission] = useState<string>('undetermined');
  const lowMeds = medications.filter((m) => m.isActive && isMedicationLowSupply(m));

  const refreshPermission = useCallback(() => {
    getPermissionStatus().then(setPermission);
  }, []);
  useEffect(() => {
    refreshPermission();
    const sub = AppState.addEventListener('change', (s) => s === 'active' && refreshPermission());
    return () => sub.remove();
  }, [refreshPermission]);

  const saveName = () => {
    const n = nameInput.trim();
    if (n) setCurrentUser({ ...currentUser, firstName: n, name: n });
    setEditing(false);
  };

  const enableNotifications = async () => {
    if (permission === 'denied') return Linking.openSettings();
    await requestPermission();
    refreshPermission();
  };

  const sendTestPing = async () => {
    await configureReminders();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test ping',
        body: 'This is what a nudge looks like. The buttons work on real nudges.',
        categoryIdentifier: NUDGE_CATEGORY,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5, channelId: 'nudges' },
    });
    Alert.alert('Test ping on its way', 'Lock your phone or leave the app. It arrives in about 5 seconds.');
  };

  const confirmReset = () => {
    const run = () => {
      resetApp();
    };
    if (Platform.OS === 'web') return run();
    Alert.alert(
      'Reset everything?',
      'This deletes your people, nudges, history and Care Cabinet from this phone and cancels all reminders.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: run },
      ],
    );
  };

  const prefs = currentUser.notificationPrefs;
  const setPref = (key: keyof typeof prefs, value: any) =>
    setCurrentUser({ ...currentUser, notificationPrefs: { ...prefs, [key]: value } });
  const setPrivacy = (key: keyof PrivacySettings, value: boolean) =>
    setCurrentUser({ ...currentUser, privacy: { ...currentUser.privacy, [key]: value } });

  const toggle = (value: boolean, onChange: (v: boolean) => void, label: string) => (
    <Switch
      value={value}
      onValueChange={onChange}
      accessibilityLabel={label}
      trackColor={{ false: c.hairline, true: c.accent }}
      thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
      {...({ activeThumbColor: '#FFFFFF' } as object)}
      ios_backgroundColor={c.hairline}
    />
  );

  const since = new Date(currentUser.createdAt).toLocaleDateString([], { month: 'long', year: 'numeric' });

  return (
    <Screen title="You" large>
      <Rise>
        <Glass strong lifted radius={theme.radius.xl} style={{ flexDirection: 'row', alignItems: 'center', gap: 16, padding: theme.space.xl }}>
          <Avatar user={currentUser} size={72} />
          <View style={{ flex: 1 }}>
            {editing ? (
              <TextInput
                value={nameInput}
                onChangeText={setNameInput}
                onBlur={saveName}
                onSubmitEditing={saveName}
                autoFocus
                maxLength={40}
                selectionColor={c.accent}
                accessibilityLabel="Your name"
                style={[theme.type.title, { color: c.text, borderBottomWidth: 1.5, borderBottomColor: c.accent, paddingVertical: 2 }]}
              />
            ) : (
              <Txt v="title">{currentUser.firstName}</Txt>
            )}
            <Txt v="footnote" tone="secondary" style={{ marginTop: 4 }}>
              {nudges.length} nudges · caring since {since}
            </Txt>
          </View>
          <IconButton
            name={editing ? 'checkmark' : 'create-outline'}
            label={editing ? 'Save name' : 'Edit name'}
            onPress={() => (editing ? saveName() : (setNameInput(currentUser.firstName), setEditing(true)))}
          />
        </Glass>
      </Rise>

      <SectionTitle title="Appearance" />
      <Segmented<AppearanceMode>
        options={[
          { value: 'system', label: 'System' },
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
        ]}
        value={mode}
        onChange={setMode}
      />

      <SectionTitle title="Notifications" />
      <Glass style={{ paddingVertical: 4 }}>
        {permission !== 'unsupported' && (
          <>
            <Row
              icon={permission === 'granted' ? 'notifications-outline' : 'notifications-off-outline'}
              iconTint={permission === 'granted' ? { fg: c.accentText, bg: c.accentSoft } : { fg: c.warm, bg: c.warmSoft }}
              title={permission === 'granted' ? 'Notifications are on' : 'Notifications are off'}
              subtitle={permission === 'granted' ? 'Send yourself a test' : 'Nudges can’t ping you yet'}
              chevron={false}
              right={
                <Button
                  label={permission === 'granted' ? 'Test ping' : permission === 'denied' ? 'Settings' : 'Turn on'}
                  size="sm"
                  variant="glass"
                  onPress={permission === 'granted' ? sendTestPing : enableNotifications}
                />
              }
            />
            <Divider inset={52} />
          </>
        )}
        <Row icon="pulse-outline" title="Reminders" subtitle="Ping until things are done" chevron={false} right={toggle(prefs.enabled, (v) => setPref('enabled', v), 'Reminders')} />
        <Divider inset={52} />
        <Row icon="musical-note-outline" title="Sound" chevron={false} right={toggle(prefs.sounds, (v) => setPref('sounds', v), 'Sound')} />
        <Divider inset={52} />
        <Row
          icon="moon-outline"
          title="Quiet hours"
          subtitle="Follow-up pings wait until morning"
          chevron={false}
          right={
            <Txt v="callout" tone="secondary">
              {prefs.quietHoursStart}–{prefs.quietHoursEnd}
            </Txt>
          }
        />
      </Glass>

      <SectionTitle title="Care" />
      <Glass style={{ paddingVertical: 4 }}>
        <Row icon="analytics-outline" iconTint={c.category.water} title="Insights & streaks" onPress={() => navigation.navigate('Insights')} />
        <Divider inset={52} />
        <Row icon="leaf-outline" iconTint={c.category.exercise} title="Routine templates" onPress={() => navigation.navigate('Routines')} />
        <Divider inset={52} />
        <Row
          icon="medkit-outline"
          iconTint={c.category.medicine}
          title="Care Cabinet"
          subtitle={`${medications.length} medicines`}
          right={lowMeds.length ? <Tag tone="warm" label={`${lowMeds.length} low`} /> : null}
          onPress={() => navigation.navigate('Medications')}
        />
        <Divider inset={52} />
        <Row icon="list-outline" iconTint={c.category.custom} title="All nudges" subtitle={`${nudges.length} in total`} onPress={() => navigation.navigate('AllNudges')} />
      </Glass>

      <SectionTitle title="How you confirm" />
      <Glass style={{ paddingVertical: 4 }}>
        {ACCOUNTABILITY.map((opt, i) => {
          const on = currentUser.accountabilityLevel === opt.key;
          return (
            <View key={opt.key}>
              {i > 0 && <Divider inset={52} />}
              <Row
                icon={opt.icon}
                iconTint={on ? { fg: c.onAccent, bg: c.accent } : undefined}
                title={opt.label}
                subtitle={opt.desc}
                chevron={false}
                right={on ? <IconButton name="checkmark" label={`${opt.label} selected`} tone="plain" size={32} onPress={() => {}} /> : null}
                onPress={() => setCurrentUser({ ...currentUser, accountabilityLevel: opt.key })}
              />
            </View>
          );
        })}
      </Glass>

      <SectionTitle title="Privacy" />
      <Glass style={{ paddingVertical: 4 }}>
        {PRIVACY.map((p, i) => (
          <View key={p.key}>
            {i > 0 && <Divider />}
            <Row title={p.label} subtitle={p.desc} chevron={false} right={toggle(currentUser.privacy[p.key], (v) => setPrivacy(p.key, v), p.label)} />
          </View>
        ))}
      </Glass>

      <SectionTitle title="Proof of done" />
      <Glass style={{ paddingVertical: 4 }}>
        <Row icon="hand-right-outline" title="One-tap confirm" subtitle="Available now" chevron={false} right={<Tag tone="accent" label="On" />} />
        {(
          [
            ['camera-outline', 'Photo'],
            ['create-outline', 'Short note'],
            ['mic-outline', 'Voice message'],
          ] as [IconName, string][]
        ).map(([icon, label]) => (
          <View key={label}>
            <Divider inset={52} />
            <Row icon={icon} title={label} chevron={false} right={<Tag tone="muted" label="Soon" />} />
          </View>
        ))}
      </Glass>

      <View style={{ alignItems: 'center', marginTop: theme.space.huge }}>
        <Txt v="title2" tone="secondary" style={theme.type.serifItalic}>
          Less worrying. More caring.
        </Txt>
        <Txt v="caption" tone="tertiary" style={{ marginTop: 6 }}>
          {APP_NAME} {Constants.expoConfig?.version ?? '1.0.0'}
        </Txt>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: theme.space.md }}>
          <Button label="Sign out" variant="glass" size="sm" icon="log-out-outline" onPress={logout} />
          <Button label="Reset data" variant="danger" size="sm" onPress={confirmReset} />
        </View>
      </View>
    </Screen>
  );
}
