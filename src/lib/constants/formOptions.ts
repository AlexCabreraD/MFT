import { SubtypeOption, CECategoryOption, DeliveryFormatOption } from '../types';

export const getSubtypeOptions = (type: string): SubtypeOption[] => {
  switch (type) {
    case 'psychotherapy':
      return [
        { value: 'individual', label: 'Individual Therapy' },
        { value: 'family', label: 'Family Therapy' },
        { value: 'couple', label: 'Couple/Marriage Therapy' }
      ];
    case 'session':
      return [
        { value: 'assessment', label: 'Assessment/Evaluation' },
        { value: 'consultation', label: 'Consultation' },
        { value: 'documentation', label: 'Documentation/Case Notes' },
        { value: 'other', label: 'Other Clinical Activities' }
      ];
    case 'supervision':
      return [
        { value: 'individual', label: 'Individual' },
        { value: 'group', label: 'Group' }
      ];
    case 'ce':
      return [
        { value: 'workshop', label: 'Workshop' },
        { value: 'conference', label: 'Conference' },
        { value: 'webinar', label: 'Webinar' },
        { value: 'course', label: 'Course' },
        { value: 'other', label: 'Other' }
      ];
    default:
      return [];
  }
};

export const getSubtypeLabel = (type: string): string => {
  switch (type) {
    case 'psychotherapy':
      return 'Therapy Type';
    case 'session':
      return 'Session Type';
    case 'supervision':
      return 'Supervision Type';
    case 'ce':
      return 'CE Type';
    default:
      return 'Type';
  }
};

export const ceCategoryOptions: CECategoryOption[] = [
  {
    value: 'general',
    label: 'General CE',
    description: 'General continuing education hours',
    required: 17, // 40 total - 6 - 2 - 15 = 17 remaining
    color: 'blue'
  },
  {
    value: 'ethics-law-tech',
    label: 'Ethics, Law, or Technology',
    description: 'Ethics, Law, or Technology',
    required: 6,
    color: 'green'
  },
  {
    value: 'suicide-prevention',
    label: 'Suicide Prevention',
    description: 'Suicide Prevention',
    required: 2,
    color: 'orange'
  },
  {
    value: 'mft-specific',
    label: 'MFT-Specific',
    description: 'MFT-Specific (Marriage & Family Therapists only)',
    required: 15,
    color: 'indigo',
    isSpecialty: true
  }
];

export const deliveryFormatOptions: DeliveryFormatOption[] = [
  {
    value: 'in-person',
    label: 'In-Person'
  },
  {
    value: 'online-interactive',
    label: 'Online Interactive (Live/Real-time)'
  },
  {
    value: 'online-non-interactive',
    label: 'Online Non-Interactive (Self-paced/Recorded)'
  }
];