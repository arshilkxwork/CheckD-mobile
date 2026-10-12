import {
  Medication,
  MedicationForm,
  MedicationFrequency,
  MedicationLog,
  MedicationSummaryStats,
} from '../types';

export function getFormEmoji(form: MedicationForm): string {
  switch (form) {
    case 'tablet':
      return '💊';
    case 'capsule':
      return '💊';
    case 'liquid':
      return '🧪';
    case 'drops':
      return '💧';
    case 'inhaler':
      return '🌬️';
    case 'injection':
      return '💉';
    case 'topical':
      return '🧴';
    case 'spray':
      return '💨';
    default:
      return '🩹';
  }
}

export function getFormLabel(form: MedicationForm): string {
  switch (form) {
    case 'tablet':
      return 'Tablet';
    case 'capsule':
      return 'Capsule';
    case 'liquid':
      return 'Liquid Solution';
    case 'drops':
      return 'Drops';
    case 'inhaler':
      return 'Inhaler';
    case 'injection':
      return 'Injection';
    case 'topical':
      return 'Topical Cream';
    case 'spray':
      return 'Nasal Spray';
    default:
      return 'Medication';
  }
}

export function getFrequencyLabel(frequency: MedicationFrequency): string {
  switch (frequency) {
    case 'once_daily':
      return 'Once daily';
    case 'twice_daily':
      return 'Twice daily';
    case 'thrice_daily':
      return '3× daily';
    case 'as_needed':
      return 'As needed';
    case 'weekly':
      return 'Weekly';
    default:
      return 'Daily';
  }
}

export function formatTimeLabel(timeStr: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  const hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${minutes} ${ampm}`;
}

export function formatScheduledTimes(times: string[]): string {
  if (!times || times.length === 0) return 'As needed';
  return times.map(formatTimeLabel).join(' • ');
}

export function calculateDaysRemaining(currentSupply: number, timesCount: number): number {
  const dailyRate = Math.max(timesCount, 1);
  return Math.max(0, Math.floor(currentSupply / dailyRate));
}

export function isMedicationLowSupply(med: Medication): boolean {
  return med.currentSupply <= med.lowSupplyThreshold;
}

export interface SupplyStatusInfo {
  status: 'healthy' | 'low' | 'empty';
  label: string;
  color: string;
  badgeBg: string;
  percentage: number;
  daysRemaining: number;
}

export function getSupplyStatus(med: Medication): SupplyStatusInfo {
  const capacity = Math.max(med.totalCapacity, 1);
  const percentage = Math.min(100, Math.max(0, Math.round((med.currentSupply / capacity) * 100)));
  const daysRemaining = calculateDaysRemaining(med.currentSupply, med.times.length || 1);

  if (med.currentSupply === 0) {
    return {
      status: 'empty',
      label: 'Depleted',
      color: '#E64949',
      badgeBg: '#FDE8E8',
      percentage,
      daysRemaining: 0,
    };
  }

  if (isMedicationLowSupply(med)) {
    return {
      status: 'low',
      label: `${med.currentSupply} ${med.unit} left (${daysRemaining}d)`,
      color: '#FF784B',
      badgeBg: '#FFF0EB',
      percentage,
      daysRemaining,
    };
  }

  return {
    status: 'healthy',
    label: `${med.currentSupply} ${med.unit} (${daysRemaining}d)`,
    color: '#388E3C',
    badgeBg: '#E8F5E9',
    percentage,
    daysRemaining,
  };
}

export function wasDoseTakenToday(med: Medication, logs: MedicationLog[]): boolean {
  const todayStr = new Date().toISOString().split('T')[0];
  return logs.some(
    (log) =>
      log.medicationId === med.id &&
      log.status === 'taken' &&
      log.takenAt.startsWith(todayStr)
  );
}

export function computeCabinetStats(
  medications: Medication[],
  logs: MedicationLog[]
): MedicationSummaryStats {
  const activeMeds = medications.filter((m) => m.isActive);
  const totalActive = activeMeds.length;
  const lowSupplyCount = activeMeds.filter(isMedicationLowSupply).length;

  const todayStr = new Date().toISOString().split('T')[0];
  const dosesLoggedToday = logs.filter(
    (l) => l.status === 'taken' && l.takenAt.startsWith(todayStr)
  ).length;

  const averageAdherence =
    totalActive > 0
      ? Math.round(
          activeMeds.reduce((acc, m) => acc + (m.adherenceRate || 0), 0) / totalActive
        )
      : 100;

  return {
    totalActive,
    lowSupplyCount,
    dosesLoggedToday,
    averageAdherence,
  };
}
