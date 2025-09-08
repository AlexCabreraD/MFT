import { EntriesData, ProgressStats } from '../types';
import { getCECycleInfo } from './dateUtils';

export const calculateProgress = (entries: EntriesData): ProgressStats => {
  const allEntries = Object.values(entries).flat();
  
  // Session hours
  const sessionEntries = allEntries.filter(e => e.type === 'session');
  const totalSessionHours = sessionEntries.reduce((sum, e) => sum + e.hours, 0);
  const relationalHours = sessionEntries
    .filter(e => e.subtype === 'family' || e.subtype === 'couple')
    .reduce((sum, e) => sum + e.hours, 0);

  // CE hours in current cycle
  const ceInfo = getCECycleInfo();
  const ceEntries = allEntries.filter(e => {
    const entryDate = new Date(e.timestamp);
    return e.type === 'ce' && entryDate >= ceInfo.start && entryDate <= ceInfo.end;
  });
  const ceCycleHours = ceEntries.reduce((sum, e) => sum + e.hours, 0);

  // CE category breakdown
  const ethicsLawTechHours = ceEntries
    .filter(e => e.ceCategory === 'ethics-law-tech')
    .reduce((sum, e) => sum + e.hours, 0);
  
  const suicidePreventionHours = ceEntries
    .filter(e => e.ceCategory === 'suicide-prevention')
    .reduce((sum, e) => sum + e.hours, 0);
  
  const mftSpecificHours = ceEntries
    .filter(e => e.ceCategory === 'mft-specific')
    .reduce((sum, e) => sum + e.hours, 0);
  
  // General CE is total minus required categories
  const generalCeHours = ceCycleHours - ethicsLawTechHours - suicidePreventionHours - mftSpecificHours;

  return {
    totalSessionHours,
    relationalHours,
    ceCycleHours,
    sessionProgress: (totalSessionHours / 3000) * 100,
    relationalProgress: (relationalHours / 500) * 100,
    ceProgress: (ceCycleHours / 40) * 100,
    ethicsLawTechHours,
    suicidePreventionHours,
    mftSpecificHours,
    generalCeHours: Math.max(0, generalCeHours),
    ethicsLawTechProgress: (ethicsLawTechHours / 6) * 100,
    suicidePreventionProgress: (suicidePreventionHours / 2) * 100,
    mftSpecificProgress: (mftSpecificHours / 15) * 100,
    generalCeProgress: (Math.max(0, generalCeHours) / 17) * 100 // 40 total - 6 - 2 - 15 = 17 remaining for general
  };
};