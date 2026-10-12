import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import { Medication, User } from '../types';
import { MedicationCard } from '../components/MedicationCard';
import { RefillAlertBanner } from '../components/RefillAlertBanner';
import { AddMedicationModal } from '../components/AddMedicationModal';
import { EmptyState } from '../components/EmptyState';
import { Avatar } from '../components/Avatar';
import {
  computeCabinetStats,
  isMedicationLowSupply,
  wasDoseTakenToday,
} from '../utils/medications';

type FilterCategory = 'all' | 'low_stock' | 'morning' | 'evening' | 'as_needed';

export function MedicationsScreen({ navigation, route }: any) {
  const initialPersonId = route?.params?.personId;
  const {
    medications,
    medicationLogs,
    people,
    currentUser,
    addMedication,
    logMedicationDose,
    refillMedication,
  } = useApp();

  const { theme } = useTheme();
  const { colors, typography, fonts, radius, shadows, spacing } = theme;

  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(
    initialPersonId || null
  );
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const allPersons: User[] = useMemo(
    () => [currentUser, ...people.filter((p) => p.id !== currentUser.id)],
    [currentUser, people]
  );

  const stats = useMemo(
    () => computeCabinetStats(medications, medicationLogs),
    [medications, medicationLogs]
  );

  const lowMeds = useMemo(
    () => medications.filter((m) => m.isActive && isMedicationLowSupply(m)),
    [medications]
  );

  // Filtered list
  const filteredMedications = useMemo(() => {
    return medications.filter((med) => {
      // Person filter
      if (selectedPersonId && med.personId !== selectedPersonId) {
        return false;
      }

      // Category filter
      if (filterCategory === 'low_stock' && !isMedicationLowSupply(med)) {
        return false;
      }
      if (filterCategory === 'morning') {
        const hasMorning = med.times.some((t) => {
          const hour = parseInt(t.split(':')[0], 10);
          return hour >= 5 && hour < 12;
        });
        if (!hasMorning) return false;
      }
      if (filterCategory === 'evening') {
        const hasEvening = med.times.some((t) => {
          const hour = parseInt(t.split(':')[0], 10);
          return hour >= 17 && hour <= 23;
        });
        if (!hasEvening) return false;
      }
      if (filterCategory === 'as_needed' && med.frequency !== 'as_needed') {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const person = allPersons.find((p) => p.id === med.personId);
        const nameMatch = med.name.toLowerCase().includes(q);
        const dosageMatch = med.dosage.toLowerCase().includes(q);
        const doctorMatch = med.prescribingDoctor?.toLowerCase().includes(q);
        const personMatch = person?.name.toLowerCase().includes(q);
        return nameMatch || dosageMatch || doctorMatch || personMatch;
      }

      return true;
    });
  }, [medications, selectedPersonId, filterCategory, searchQuery, allPersons]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleRefillPrompt = (med: Medication) => {
    Alert.alert(
      `Refill ${med.name}`,
      `Current stock: ${med.currentSupply} ${med.unit}. Choose standard pack to add:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: '+30 Supply',
          onPress: () => refillMedication(med.id, 30),
        },
        {
          text: '+60 Supply',
          onPress: () => refillMedication(med.id, 60),
        },
      ]
    );
  };

  const handleDoseTaken = (med: Medication) => {
    logMedicationDose(med.id, 'taken');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      {/* ── Top App Bar ── */}
      <View style={[styles.topBar, { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityLabel="Go back"
        >
          <Text style={[{ color: colors.accent, fontSize: typography.md, fontFamily: fonts.bodyMedium }]}>
            ← Back
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsAddModalOpen(true)}
          style={[styles.addBtn, { backgroundColor: colors.accent, borderRadius: radius.full, ...shadows.sm }]}
        >
          <Text style={[{ color: '#FFFFFF', fontSize: typography.sm, fontFamily: fonts.bodyBold }]}>
            + Add Med
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
      >
        {/* ── Screen Hero Header ── */}
        <View style={[styles.heroHeader, { paddingHorizontal: spacing.lg, marginBottom: spacing.md }]}>
          <Text style={[styles.screenTitle, { color: colors.text, fontSize: typography.xxxl, fontFamily: fonts.headingBold }]}>
            Care Cabinet 💊
          </Text>
          <Text style={[{ color: colors.textSecondary, fontSize: typography.sm, fontFamily: fonts.body, marginTop: 4 }]}>
            Prescription vault, refill tracking & gentle dose adherence
          </Text>
        </View>

        {/* ── Summary Stats Cards ── */}
        <View style={[styles.statsRow, { paddingHorizontal: spacing.lg, marginBottom: spacing.lg }]}>
          <View style={[styles.statBox, { backgroundColor: colors.surface, borderRadius: radius.xl, ...shadows.sm }]}>
            <Text style={[{ color: colors.accent, fontSize: typography.xxl, fontFamily: fonts.headingBold }]}>
              {stats.totalActive}
            </Text>
            <Text style={[{ color: colors.textTertiary, fontSize: 11, fontFamily: fonts.bodyBold }]}>
              ACTIVE MEDS
            </Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: colors.surface, borderRadius: radius.xl, ...shadows.sm }]}>
            <Text
              style={[
                {
                  color: stats.lowSupplyCount > 0 ? '#FF784B' : colors.success,
                  fontSize: typography.xxl,
                  fontFamily: fonts.headingBold,
                },
              ]}
            >
              {stats.lowSupplyCount}
            </Text>
            <Text style={[{ color: colors.textTertiary, fontSize: 11, fontFamily: fonts.bodyBold }]}>
              LOW SUPPLY
            </Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: colors.surface, borderRadius: radius.xl, ...shadows.sm }]}>
            <Text style={[{ color: colors.success, fontSize: typography.xxl, fontFamily: fonts.headingBold }]}>
              {stats.dosesLoggedToday}
            </Text>
            <Text style={[{ color: colors.textTertiary, fontSize: 11, fontFamily: fonts.bodyBold }]}>
              DOSES TODAY
            </Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: colors.surface, borderRadius: radius.xl, ...shadows.sm }]}>
            <Text style={[{ color: colors.honey, fontSize: typography.xxl, fontFamily: fonts.headingBold }]}>
              {stats.averageAdherence}%
            </Text>
            <Text style={[{ color: colors.textTertiary, fontSize: 11, fontFamily: fonts.bodyBold }]}>
              ADHERENCE
            </Text>
          </View>
        </View>

        {/* ── Refill Shortage Alert Banner ── */}
        {lowMeds.length > 0 && (
          <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
            <RefillAlertBanner
              lowMeds={lowMeds}
              people={allPersons}
              onPressManage={() => setFilterCategory('low_stock')}
              onPressQuickRefill={handleRefillPrompt}
            />
          </View>
        )}

        {/* ── Person Filter Tabs ── */}
        <View style={{ marginBottom: spacing.sm }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.personScroll, { paddingHorizontal: spacing.lg }]}
          >
            <TouchableOpacity
              onPress={() => setSelectedPersonId(null)}
              style={[
                styles.personTab,
                {
                  backgroundColor: selectedPersonId === null ? colors.accent : colors.surface,
                  borderRadius: radius.full,
                  borderColor: selectedPersonId === null ? colors.accent : colors.border,
                  ...shadows.sm,
                },
              ]}
            >
              <Text style={{ fontSize: 14 }}>👥</Text>
              <Text
                style={[
                  styles.personTabText,
                  {
                    color: selectedPersonId === null ? '#FFFFFF' : colors.text,
                    fontSize: typography.xs,
                    fontFamily: selectedPersonId === null ? fonts.bodyBold : fonts.bodyMedium,
                  },
                ]}
              >
                All Circle ({medications.length})
              </Text>
            </TouchableOpacity>

            {allPersons.map((p) => {
              const isSelected = selectedPersonId === p.id;
              const count = medications.filter((m) => m.personId === p.id).length;
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setSelectedPersonId(p.id)}
                  style={[
                    styles.personTab,
                    {
                      backgroundColor: isSelected ? colors.accent : colors.surface,
                      borderRadius: radius.full,
                      borderColor: isSelected ? colors.accent : colors.border,
                      ...shadows.sm,
                    },
                  ]}
                >
                  <Avatar user={p} size={22} />
                  <Text
                    style={[
                      styles.personTabText,
                      {
                        color: isSelected ? '#FFFFFF' : colors.text,
                        fontSize: typography.xs,
                        fontFamily: isSelected ? fonts.bodyBold : fonts.bodyMedium,
                      },
                    ]}
                  >
                    {p.firstName} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Search Bar ── */}
        <View style={[styles.searchWrap, { paddingHorizontal: spacing.lg, marginBottom: spacing.sm }]}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.xl,
                ...shadows.sm,
              },
            ]}
          >
            <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by medication, dose, or doctor..."
              placeholderTextColor={colors.textTertiary}
              style={[
                styles.searchInput,
                { color: colors.text, fontSize: typography.sm, fontFamily: fonts.body },
              ]}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={{ color: colors.textTertiary, fontSize: 14 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Category Pill Filters ── */}
        <View style={{ marginBottom: spacing.md }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.categoryScroll, { paddingHorizontal: spacing.lg }]}
          >
            {[
              { key: 'all', label: 'All Medications' },
              { key: 'low_stock', label: `⚠️ Low Stock (${lowMeds.length})` },
              { key: 'morning', label: '🌅 Morning Doses' },
              { key: 'evening', label: '🌙 Evening Doses' },
              { key: 'as_needed', label: '🩹 As Needed' },
            ].map((cat) => {
              const active = filterCategory === cat.key;
              return (
                <TouchableOpacity
                  key={cat.key}
                  onPress={() => setFilterCategory(cat.key as FilterCategory)}
                  style={[
                    styles.catPill,
                    {
                      backgroundColor: active ? colors.accentLight : colors.surfaceWarm,
                      borderColor: active ? colors.accent : 'transparent',
                      borderRadius: radius.full,
                    },
                  ]}
                >
                  <Text
                    style={[
                      {
                        color: active ? colors.accentDark : colors.textSecondary,
                        fontSize: 12,
                        fontFamily: active ? fonts.bodyBold : fonts.bodyMedium,
                      },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Medication Cards List ── */}
        <View style={{ paddingHorizontal: spacing.lg }}>
          {filteredMedications.length === 0 ? (
            <View style={{ alignItems: 'center' }}>
              <EmptyState
                emoji="💊"
                title="No medications found"
                subtitle="No medications match your selected filters or search query."
              />
              <TouchableOpacity
                onPress={() => setIsAddModalOpen(true)}
                style={[
                  styles.addBtn,
                  { backgroundColor: colors.accent, borderRadius: radius.full, marginTop: 14, ...shadows.sm },
                ]}
              >
                <Text style={[{ color: '#FFFFFF', fontSize: typography.sm, fontFamily: fonts.bodyBold }]}>
                  + Add New Medication
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredMedications.map((med) => {
              const person = allPersons.find((p) => p.id === med.personId);
              const isTaken = wasDoseTakenToday(med, medicationLogs);
              return (
                <MedicationCard
                  key={med.id}
                  medication={med}
                  person={person}
                  isTakenToday={isTaken}
                  onLogDose={handleDoseTaken}
                  onRefill={handleRefillPrompt}
                  showPersonBadge={selectedPersonId === null}
                />
              );
            })
          )}
        </View>
      </ScrollView>

      {/* ── Add Medication Modal ── */}
      <AddMedicationModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={addMedication}
        people={people}
        currentUser={currentUser}
        initialPersonId={selectedPersonId || undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  backBtn: {
    paddingVertical: 6,
  },
  addBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  heroHeader: {
    marginTop: 4,
  },
  screenTitle: {
    letterSpacing: -0.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0ECE8',
  },
  personScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  personTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
  },
  personTabText: {},
  searchWrap: {
    marginTop: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    padding: 0,
  },
  categoryScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
});
