export type PlanId = 'free' | 'premium' | 'ultimate';

export const FREE_UPLOAD_LIMIT = 5;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ALLOWED_UPLOAD_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'text/plain'];
export const KI_DAILY_LIMIT = 30;

export type Plan = {
  id: PlanId;
  name: string;
  price: string;
  note: string;
  highlight?: boolean;
  features: string[];
};

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Kostenlos',
    price: '0 €',
    note: 'Zum Ausprobieren',
    features: [
      'Begrenzter Zugriff auf Lernmaterialien',
      'Einige Quizze',
      'Basis-Dashboard',
      `Bis zu ${FREE_UPLOAD_LIMIT} eigene Dateien hochladen`,
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '9,90 €',
    note: 'pro Monat',
    highlight: true,
    features: [
      'Vollständige Lernmaterialien',
      'Erweiterte Quizze',
      'Persönlicher Lernplan',
      'Lernfortschrittsanalyse',
      'Eigene Dateien unbegrenzt hochladen',
    ],
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    price: '14,90 €',
    note: 'pro Monat',
    features: [
      'Alle Premium-Funktionen',
      'KI-Lernassistent mit fairen Nutzungslimits',
      'Erweiterte Lernanalysen',
      'Zusätzliche Lernwerkzeuge',
    ],
  },
];

export function planName(id: string | null | undefined) {
  return PLANS.find((p) => p.id === id)?.name ?? 'Kostenlos';
}
