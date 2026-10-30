import React, { useMemo, useState } from 'react';
import { View, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, LinearTransition, useReducedMotion } from 'react-native-reanimated';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import { CATEGORY_CONFIG } from '../theme/tokens';
import { Screen } from '../ui/Screen';
import { Chip, Glass, IconButton, Segmented, Txt } from '../ui/primitives';
import { EmptyState, Stat } from '../ui/pieces';
import { NudgeRow } from '../ui/NudgeRow';
import { Nudge, NudgeCategory, User } from '../types';

type StatusFilter = 'all' | 'open' | 'done' | 'snoozed';
type Direction = 'all' | 'sent' | 'received';

export function AllNudgesScreen({ navigation }: any) {
  const { nudges, people, currentUser, completeNudge } = useApp();
  const { theme } = useTheme();
  const { c } = theme;
  const reduce = useReducedMotion();

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [direction, setDirection] = useState<Direction>('all');
  const [category, setCategory] = useState<NudgeCategory | 'all'>('all');
  const [personId, setPersonId] = useState<string>('all');

  const person = (id: string): User | null => people.find((p) => p.id === id) ?? (id === currentUser.id ? currentUser : null);

  const open = nudges.filter((n) => n.status === 'pending' || n.status === 'snoozed').length;
  const done = nudges.filter((n) => n.status === 'completed').length;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return nudges.filter((n) => {
      if (q) {
        const names = [person(n.receiverId)?.name, person(n.creatorId)?.name].join(' ').toLowerCase();
        if (!n.title.toLowerCase().includes(q) && !n.category.includes(q) && !names.includes(q)) return false;
      }
      if (status === 'open' && n.status !== 'pending' && n.status !== 'snoozed') return false;
      if (status === 'done' && n.status !== 'completed') return false;
      if (status === 'snoozed' && n.status !== 'snoozed') return false;
      if (direction === 'sent' && (n.creatorId !== currentUser.id || n.receiverId === currentUser.id)) return false;
      if (direction === 'received' && n.receiverId !== currentUser.id) return false;
      if (category !== 'all' && n.category !== category) return false;
      if (personId !== 'all' && n.receiverId !== personId && n.creatorId !== personId) return false;
      return true;
    });
  }, [nudges, query, status, direction, category, personId]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtersOn = query || status !== 'all' || direction !== 'all' || category !== 'all' || personId !== 'all';
  const clear = () => {
    setQuery('');
    setStatus('all');
    setDirection('all');
    setCategory('all');
    setPersonId('all');
  };

  const row = (n: Nudge) => {
    const self = n.receiverId === currentUser.id && n.creatorId === currentUser.id;
    const forMe = n.receiverId === currentUser.id;
    return (
      <NudgeRow
        nudge={n}
        who={forMe ? person(n.creatorId) : person(n.receiverId)}
        direction={self ? 'self' : forMe ? 'for-me' : 'sent'}
        onPress={() =>
          forMe ? navigation.navigate('ReceiverNudge', { nudgeId: n.id }) : navigation.navigate('NudgeDetail', { nudgeId: n.id })
        }
        onDone={() => completeNudge(n.id)}
      />
    );
  };

  return (
    <Screen
      title="All nudges"
      large
      onBack={() => navigation.goBack()}
      right={<IconButton name="add" label="New nudge" onPress={() => navigation.navigate('CreateTab', { screen: 'CreateNudge' })} />}
    >
      <Glass strong style={{ flexDirection: 'row', paddingVertical: 18 }}>
        <Stat value={nudges.length} label="total" />
        <Stat value={open} label="open" />
        <Stat value={nudges.length ? `${Math.round((done / nudges.length) * 100)}%` : '–'} label="done" />
      </Glass>

      <Glass padded={false} radius={22} style={{ marginTop: theme.space.lg, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
        <Ionicons name="search" size={18} color={c.textTertiary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search nudges or people"
          placeholderTextColor={c.textTertiary}
          selectionColor={c.accent}
          returnKeyType="search"
          accessibilityLabel="Search nudges"
          style={[theme.type.body, { flex: 1, color: c.text, paddingVertical: 14, paddingHorizontal: 10 }]}
        />
        {query ? <IconButton name="close" label="Clear search" size={32} tone="plain" onPress={() => setQuery('')} /> : null}
      </Glass>

      <View style={{ marginTop: theme.space.md }}>
        <Segmented<StatusFilter>
          options={[
            { value: 'all', label: 'All' },
            { value: 'open', label: 'Open' },
            { value: 'done', label: 'Done' },
            { value: 'snoozed', label: 'Snoozed' },
          ]}
          value={status}
          onChange={setStatus}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, marginTop: theme.space.md }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
        <Chip label="Sent" icon="paper-plane-outline" selected={direction === 'sent'} onPress={() => setDirection(direction === 'sent' ? 'all' : 'sent')} />
        <Chip label="For me" icon="mail-open-outline" selected={direction === 'received'} onPress={() => setDirection(direction === 'received' ? 'all' : 'received')} />
        {people.map((p) => (
          <Chip key={p.id} label={p.firstName} selected={personId === p.id} onPress={() => setPersonId(personId === p.id ? 'all' : p.id)} />
        ))}
        {(Object.keys(CATEGORY_CONFIG) as NudgeCategory[]).map((k) => (
          <Chip
            key={k}
            label={CATEGORY_CONFIG[k].label}
            icon={CATEGORY_CONFIG[k].icon}
            selected={category === k}
            onPress={() => setCategory(category === k ? 'all' : k)}
          />
        ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.space.xl, marginBottom: theme.space.md }}>
        <Txt v="footnote" tone="secondary">
          {results.length} {results.length === 1 ? 'nudge' : 'nudges'}
        </Txt>
        {filtersOn ? (
          <Txt v="subhead" tone="accent" onPress={clear} accessibilityRole="button">
            Clear filters
          </Txt>
        ) : null}
      </View>

      {results.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title={nudges.length ? 'Nothing matches' : 'No nudges yet'}
          body={nudges.length ? 'Try a different search or clear the filters.' : 'Your nudges will collect here.'}
          action={nudges.length ? 'Clear filters' : 'Send a nudge'}
          onAction={nudges.length ? clear : () => navigation.navigate('CreateTab', { screen: 'CreateNudge' })}
        />
      ) : (
        <View style={{ gap: 10 }}>
          {results.map((n) => (
            <Animated.View
              key={n.id}
              entering={reduce ? undefined : FadeIn.duration(260)}
              exiting={reduce ? undefined : FadeOut.duration(180)}
              layout={reduce ? undefined : LinearTransition.springify().damping(22)}
            >
              {row(n)}
            </Animated.View>
          ))}
        </View>
      )}
    </Screen>
  );
}
