import { EntriesData, ProgressStats } from '../types';
import { getCECycleInfo, calculateTimeProgress } from './dateUtils';

export const calculateProgress = (entries: EntriesData, trainingStartDate?: string): ProgressStats => {
  const allEntries = Object.values(entries).flat();
  
  // Clinical hours breakdown - only count clinical activities, not documentation
  const sessionEntries = allEntries.filter(e => e.type === 'session');
  const clinicalSessionEntries = sessionEntries.filter(e => 
    // Include psychotherapy sessions (individual, family, couple)
    e.subtype === 'individual' || e.subtype === 'family' || e.subtype === 'couple' ||
    // Include assessment and consultation
    e.subtype === 'assessment' || e.subtype === 'consultation'
    // Exclude documentation and other non-clinical activities
  );
  const totalClinicalHours = clinicalSessionEntries.reduce((sum, e) => sum + e.hours, 0);
  
  // Direct face-to-face MFT client contact hours
  const directMftHours = sessionEntries
    .filter(e => e.subtype === 'individual' || e.subtype === 'family' || e.subtype === 'couple')
    .reduce((sum, e) => sum + e.hours, 0);
    
  // For backward compatibility, keep relational hours calculation
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
  
  // For now, assume all ethics-law-tech hours are MFT-specific (can be enhanced later)
  const ethicsLawTechMftHours = ethicsLawTechHours;
  
  // Non-interactive distance learning hours
  const nonInteractiveHours = ceEntries
    .filter(e => e.deliveryFormat === 'online-non-interactive')
    .reduce((sum, e) => sum + e.hours, 0);
  
  // General CE is total minus required categories
  const generalCeHours = ceCycleHours - ethicsLawTechHours - suicidePreventionHours - mftSpecificHours;

  // Supervision hours - calculate from entries
  const supervisionEntries = allEntries.filter(e => e.type === 'supervision');
  const totalSupervisionHours = supervisionEntries.reduce((sum, e) => sum + e.hours, 0);
  const videoAudioSupervisionHours = supervisionEntries
    .filter(e => e.reviewedVideo || e.reviewedAudio)
    .reduce((sum, e) => sum + e.hours, 0);

  // Time-based progress calculation
  const timeCalc = calculateTimeProgress(trainingStartDate || null);

  return {
    // Clinical Hours (for MFT licensure)
    totalClinicalHours,
    directMftHours,
    relationalHours,
    clinicalProgress: (totalClinicalHours / 3000) * 100, // 3,000 total clinical hours required for initial licensure
    endorsementProgress: (totalClinicalHours / 4000) * 100, // 4,000 total clinical hours required for licensure by endorsement
    directMftProgress: (directMftHours / 1000) * 100, // 1,000 direct MFT hours required
    
    // Backward compatibility
    totalSessionHours: totalClinicalHours,
    sessionProgress: (totalClinicalHours / 3000) * 100,
    relationalProgress: (relationalHours / 500) * 100,
    
    // CE Hours (for license renewal)
    ceCycleHours,
    ceProgress: (ceCycleHours / 40) * 100,
    ethicsLawTechHours,
    ethicsLawTechMftHours,
    suicidePreventionHours,
    mftSpecificHours,
    generalCeHours: Math.max(0, generalCeHours),
    nonInteractiveHours,
    ethicsLawTechProgress: (ethicsLawTechHours / 6) * 100,
    suicidePreventionProgress: (suicidePreventionHours / 2) * 100,
    mftSpecificProgress: (mftSpecificHours / 15) * 100,
    generalCeProgress: (Math.max(0, generalCeHours) / 17) * 100, // 40 total - 6 - 2 - 15 = 17 remaining for general
    nonInteractiveProgress: (nonInteractiveHours / 15) * 100, // Max 15 hours allowed
    
    // Supervision Hours
    totalSupervisionHours,
    videoAudioSupervisionHours,
    supervisionProgress: (totalSupervisionHours / 100) * 100,
    videoAudioSupervisionProgress: (videoAudioSupervisionHours / 25) * 100, // 25 hours video/audio required
    
    // Time-based Progress
    timeProgress: timeCalc.timeProgress,
    timeRemaining: timeCalc.timeRemaining
  };
};