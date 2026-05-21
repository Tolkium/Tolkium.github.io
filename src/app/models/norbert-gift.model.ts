export interface Milestone {
  id: number;
  name: string;
  percentage: number;
}

export interface Contributor {
  name: string;
  amount: number;
  date: string;
  color: string;
}

export interface WishlistItem {
  id: number;
  name: string;
  brand: string;
  category: string;
  description: string;
  longDescription: string;
  price: number;
  imageUrl: string;
  productUrl: string;
  specs: { label: string; value: string }[];
  contributors: Contributor[];
  milestones: Milestone[];
  color: string;
  icon: string;
}

export interface PaymentInfo {
  name: string;
  iban: string;
  bicSwift: string;
}

export interface ChartData {
  dailyDonations: number[];
  days: string[];
  growthTrend: number[];
  velocityTrend: number[];
  growth: number;
  totalRaised: number;
}

export const GIFTS: WishlistItem[] = [
  {
    id: 1,
    name: 'VC104CE SET 4/4 Black',
    brand: 'Valencia',
    category: 'Klasická gitara s elektronikou',
    description: 'Klasická gitara 4/4 s výrezom a piezo snímačom, ideálna pre začiatočníkov. Set obsahuje puzdro, stojan, ladičku a podnožku.',
    longDescription: 'Klasická gitara štandardnej veľkosti 4/4 s výrezom a piezo snímačom určená predovšetkým pre začiatočníkov. Vrchná doska je vyrobená z lipy, luby a zadná doska z rovnakej dreviny. Javorový krk s menzúrou 650mm, ebonizovaný hmatník s 19 mosadznými pražcami. Piezo snímač s predzosilňovačom a EQ. V balení: puzdro, stojan, klipová ladička, podnožka.',
    price: 145,
    imageUrl: 'https://www.ehudobniny.sk/image/cache/wp/gj/product/513/51331/main-1b0d12a3-680x475h.webp',
    productUrl: 'https://www.muziker.sk/valencia-vc104ce-set-4-4-black-klasicka-gitara-s-elektronikou',
    specs: [
      { label: 'Veľkosť', value: '4/4' },
      { label: 'Zadná doska a luby', value: 'Lipa americká' },
      { label: 'Krk', value: 'Javor' },
      { label: 'Menzúra', value: '650 mm' },
      { label: 'Šírka nultého pražca', value: '52 mm' },
      { label: 'Počet pražcov', value: '19' },
      { label: 'Snímače', value: 'Piezo s EQ' },
      { label: 'Farba', value: 'Black' },
      { label: 'Súprava', value: 'Gigbag, ladička, stojan, podnožka' },
    ],
    contributors: [
      { name: 'Šimon', amount: 30, date: '2026-05-01', color: '#cc0000' },
    ],
    milestones: [
      { id: 1, name: 'Prvé brnknutie', percentage: 0 },
      { id: 2, name: 'Naučený akord', percentage: 25 },
      { id: 3, name: 'Prvá pesnička', percentage: 50 },
      { id: 4, name: 'Rodinný koncert', percentage: 75 },
      { id: 5, name: 'Gitarový majster', percentage: 100 },
    ],
    color: '#cc0000',
    icon: '🎸',
  },
  {
    id: 2,
    name: 'Spark 40',
    brand: 'Positive Grid',
    category: 'Inteligentný gitarový zosilňovač',
    description: '40W smart amp s Bluetooth, desiatkami efektov a aplikáciou. Kombinuje analógový zvuk s modernými digitálnymi technológiami.',
    longDescription: 'Revolučný inteligentný gitarový zosilňovač Positive Grid Spark 40 kombinuje tradičný analógový zvuk s modernými digitálnymi technológiami. 40W výkon, 30+ modelov zosilňovačov a efektov, Bluetooth streaming, Smart Looper, USB audio rozhranie. Ovládanie cez aplikáciu Spark pre iOS/Android. Užívaj si slobodu tvoriť, učiť sa a experimentovať.',
    price: 219,
    imageUrl: 'https://www.positivegrid.com/cdn/shop/products/spark-shopify-hero.png?v=1664261701&width=1200',
    productUrl: 'https://www.muziker.sk/positive-grid-spark-40',
    specs: [
      { label: 'Výkon', value: '40W' },
      { label: 'Bluetooth', value: 'Áno' },
      { label: 'Efekty', value: '30+ modelov' },
      { label: 'Aplikácia', value: 'Spark App' },
      { label: 'Smart Looper', value: 'Áno' },
      { label: 'USB Audio', value: 'Áno' },
      { label: 'Hmotnosť', value: '5.8 kg' },
    ],
    contributors: [
      { name: 'Šimon', amount: 50, date: '2026-05-01', color: '#8b0000' },
    ],
    milestones: [
      { id: 1, name: 'Zapojený', percentage: 0 },
      { id: 2, name: 'Čistý tón', percentage: 25 },
      { id: 3, name: 'Skúšanie efektov', percentage: 50 },
      { id: 4, name: 'Bluetooth party', percentage: 75 },
      { id: 5, name: 'Jam session', percentage: 100 },
    ],
    color: '#8b0000',
    icon: '🔊',
  },
  {
    id: 3,
    name: 'Gitarový balíček',
    brand: 'Essential Pack',
    category: 'Príslušenstvo',
    description: 'Všetko čo gitarista potrebuje: stojan, ladička, struny, trsátka, popruh a kábel. Dokonalý doplnok k novej gitare.',
    longDescription: 'Kompletný balíček nevyhnutného príslušenstva pre každého gitaristu. Skladací stojan A-štýl, presná klipová chromatická ladička, sada kvalitných nylonových strún, 10 trsátok rôznych hrúbok, nastaviteľný popruh a 3m nástrojový kábel s 6.3mm jack konektormi.',
    price: 75,
    imageUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1200&q=80',
    productUrl: 'https://www.muziker.sk/',
    specs: [
      { label: 'Stojan', value: 'Skladací A-štýl' },
      { label: 'Ladička', value: 'Klipová chromatická' },
      { label: 'Struny', value: 'Nylonové klasické' },
      { label: 'Trsátka', value: '10ks rôzne hrúbky' },
      { label: 'Popruh', value: 'Nastaviteľný 2"' },
      { label: 'Kábel', value: '3m 6.3mm jack' },
    ],
    contributors: [
      { name: 'Šimon', amount: 25, date: '2026-05-01', color: '#a0a0a0' },
    ],
    milestones: [
      { id: 1, name: 'Rozbalené', percentage: 0 },
      { id: 2, name: 'Stojan zložený', percentage: 25 },
      { id: 3, name: 'Naladené', percentage: 50 },
      { id: 4, name: 'Prvé brnkanie', percentage: 75 },
      { id: 5, name: 'Pripravené na cesty', percentage: 100 },
    ],
    color: '#a0a0a0',
    icon: '🎵',
  },
];

export const TOTAL_GOAL = GIFTS.reduce((sum, g) => sum + g.price, 0);

export const PAYMENT_INFO: PaymentInfo = {
  name: 'Norbert Šípoš',
  iban: 'LT303250033127984669',
  bicSwift: 'REVOLUT21',
};

export function calculateGiftChartData(gift: WishlistItem): ChartData {
  const byDate = new Map<string, number>();
  gift.contributors.forEach(c => {
    byDate.set(c.date, (byDate.get(c.date) || 0) + c.amount);
  });

  const sortedDates = Array.from(byDate.keys()).sort();
  const dailyDonations = sortedDates.map(d => byDate.get(d)!);
  const days = sortedDates.map(d => {
    const date = new Date(d);
    return `${date.getDate()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
  });

  const total = gift.contributors.reduce((s, c) => s + c.amount, 0);
  const growthTrend = sortedDates.map((_, i) => {
    const cumulative = dailyDonations.slice(0, i + 1).reduce((s, v) => s + v, 0);
    return Math.round((cumulative / gift.price) * 100);
  });

  const velocityTrend = sortedDates.map((_, i) => {
    const cumulative = dailyDonations.slice(0, i + 1).reduce((s, v) => s + v, 0);
    const daysPassed = i + 1;
    const remaining = gift.price - cumulative;
    const needed = remaining / Math.max(1, 30 - daysPassed);
    const actual = cumulative / daysPassed;
    return Number((actual - needed).toFixed(1));
  });

  return {
    dailyDonations,
    days,
    growthTrend,
    velocityTrend,
    growth: total > 0 ? Number(((total / gift.price) * 100).toFixed(2)) : 0,
    totalRaised: total,
  };
}

export function getOverallContributors(): Contributor[] {
  const map = new Map<string, Contributor>();
  GIFTS.forEach(g => {
    g.contributors.forEach(c => {
      const existing = map.get(c.name);
      if (existing) {
        existing.amount += c.amount;
      } else {
        map.set(c.name, { ...c });
      }
    });
  });
  return Array.from(map.values());
}

export function getGiftRaised(gift: WishlistItem): number {
  return gift.contributors.reduce((s, c) => s + c.amount, 0);
}
