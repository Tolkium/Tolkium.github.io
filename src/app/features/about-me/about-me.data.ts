/**
 * Data for About Me component
 */

import type { Experience, CodeLine, StatCard, ProfileInfo } from '../../models/about-me.model';

// Profile information
export const PROFILE_INFO: ProfileInfo = {
  name: 'Marek Šípoš',
  title: 'Frontend Web Developer',
  location: 'Bratislava, Slovakia',
  avatarUrl: 'assets/images/avatar1.png',
  linkedInUrl: 'https://www.linkedin.com/in/marek-sipos/',
} as const;

// Statistics cards
export const STAT_CARDS: readonly StatCard[] = [
  {
    value: '5+',
    label: 'Years Exp',
    color: '#f29f67',
  },
  {
    value: '6',
    label: 'Companies',
    color: '#8833cc',
  },
  {
    value: '∞',
    label: 'Curiosity',
    color: '#10b981',
  },
] as const;

// Code snippet lines
export const CODE_LINES: readonly CodeLine[] = [
  {
    lineNumber: 1,
    parts: [{ text: '// Who am I?', type: 'comment' }],
  },
  {
    lineNumber: 2,
    parts: [
      { text: 'const', type: 'keyword' },
      { text: ' developer', type: 'variable' },
      { text: ' = {', type: 'operator' },
    ],
  },
  {
    lineNumber: 3,
    parts: [
      { text: '  passion:', type: 'property' },
      { text: ' "exceptional digital experiences"', type: 'string' },
      { text: ',', type: 'default' },
    ],
  },
  {
    lineNumber: 4,
    parts: [
      { text: '  approach:', type: 'property' },
      { text: ' "perfectionism + pragmatism"', type: 'string' },
      { text: ',', type: 'default' },
    ],
  },
  {
    lineNumber: 5,
    parts: [
      { text: '  superpower:', type: 'property' },
      { text: ' "Angular 🚀"', type: 'string' },
      { text: ',', type: 'default' },
    ],
  },
  {
    lineNumber: 6,
    parts: [
      { text: '  mode:', type: 'property' },
      { text: ' "always learning"', type: 'string' },
    ],
  },
  {
    lineNumber: 7,
    parts: [{ text: '};', type: 'operator' }],
  },
] as const;

// Education information
export const EDUCATION = {
  institution: 'Slovak University of Technology in Bratislava (STU)',
  faculty: 'Faculty of Electrical Engineering and Information Technology (FEI)',
  program: 'Applied Informatics',
  period: '2016 – 2022',
  icon: '🏛️',
} as const;

// Work experience, newest first. Order matters: the git graph is derived from it.
// main = career path, school = studies, side = work during studies.
// All lanes start at "Initial commit"; school merges into main at STU, side merges into main at Capco.
export const EXPERIENCES: readonly Experience[] = [
  {
    company: 'Career break',
    badge: 'Break',
    period: 'Jul 2025 → Oct 2026',
    description:
      'Continued development during the break: QRHant (Angular 22 PWA), Parakeet speech-to-text plugin, Manga Reader TTS.',
    icon: 'heroPauseCircle',
    tech: ['Angular', 'C#', 'Local AI'],
    lane: 'main',
    isPause: true,
  },
  {
    company: 'Freelance – Web & IoT',
    badge: 'Freelance',
    period: 'Aug 2024 → Jun 2025',
    description:
      'Independent projects for multiple clients – web control interfaces and firmware for custom IoT devices.',
    icon: 'heroCpuChip',
    tech: ['JavaScript', 'ESP32', 'Raspberry Pi'],
    lane: 'main',
  },
  {
    company: 'T7',
    badge: 'Fullstack',
    period: 'Feb 2024 → Jul 2024',
    description:
      'Analytics dashboard for Etsy sellers – React frontend, independently designed Node.js/PostgreSQL backend.',
    logoUrl: 'assets/images/t7-logo.png',
    tech: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    lane: 'main',
  },
  {
    company: 'Capco',
    badge: 'Frontend',
    period: 'Nov 2022 → Aug 2023',
    description:
      'Internal banking applications in Angular; internal AI research project on LLMs; co-organized a company hackathon.',
    logoUrl: 'assets/images/capco-logo.ico',
    tech: ['Angular', 'TypeScript', 'RxJS', 'LLM'],
    lane: 'main',
    mergeFrom: 'side',
  },
  {
    company: 'AmNFT',
    badge: 'Contract',
    period: 'Sep 2022 → Oct 2022',
    description: 'NFT marketplace frontend in React and smart contracts in Solidity.',
    logoUrl: 'assets/images/amnft-logo.png',
    tech: ['React', 'Solidity'],
    lane: 'side',
  },
  {
    company: 'alfaBASE',
    badge: 'Frontend',
    period: 'Jun 2022 → Aug 2022',
    description:
      'Angular frontends for public-sector projects with a focus on accessibility and security; reusable UI component library.',
    logoUrl: 'assets/images/alfabase-logo.png',
    tech: ['Angular', 'TypeScript', 'SCSS'],
    lane: 'side',
  },
  {
    company: 'STU Bratislava',
    badge: 'Education',
    period: '2016 → 2022',
    description:
      'Applied Informatics – Slovak University of Technology in Bratislava, Faculty of Electrical Engineering and Information Technology (FEI).',
    icon: 'heroAcademicCap',
    lane: 'main',
    mergeFrom: 'school',
    tone: 'school',
  },
  {
    company: 'Hmstrsoc.io',
    badge: 'Frontend',
    period: 'Sep 2021 → Dec 2021',
    description: 'NFT collection website in Angular and Solidity smart contracts.',
    logoUrl: 'assets/images/hmstrsoc-logo.ico',
    tech: ['Angular', 'Solidity', 'Firebase'],
    lane: 'side',
  },
  {
    company: 'Siemens Healthineers',
    badge: 'Intern',
    period: 'Jul 2019 → Aug 2019',
    description:
      'Web application automating system migration to Azure; CI/CD in Azure DevOps, unit tests.',
    logoUrl: 'assets/images/simens-logo.png',
    tech: ['Angular', 'C#', 'Azure DevOps'],
    lane: 'main',
  },
] as const;
