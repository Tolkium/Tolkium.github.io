/**
 * Data for About Me component
 */

import type { Experience, CodeLine, StatCard, ProfileInfo, BranchColors } from '../../models/about-me.model';

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
    value: '7',
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
  institution: 'Slovak University of Technology',
  degree: 'Information Technology',
  period: '2016 → 2022',
  icon: '🏛️',
} as const;

// Branch colors for GitLens-style visualization
export const BRANCH_COLORS: BranchColors = {
  main: {
    light: '#7dd3fc', // sky-300
    dark: '#7dd3fc',
    bgLight: '#e0f2fe', // sky-100
    bgDark: '#0c4a6e', // sky-900
  },
  feature: {
    light: '#a5b4fc', // indigo-300
    dark: '#fdba74', // orange-300
    bgLight: '#e0e7ff', // indigo-100
    bgDark: '#7c2d12', // orange-900
  },
  merge: {
    light: '#5eead4', // teal-300
    dark: '#f9a8d4', // pink-300
    bgLight: '#ccfbf1', // teal-100
    bgDark: '#831843', // pink-900
  },
} as const;

// Work experience with branch visualization data
export const EXPERIENCES: readonly Experience[] = [
  {
    company: 'T7',
    role: 'Fullstack',
    period: 'Apr 2024 → Aug 2024',
    description: 'Built analytics dashboard for Etsy seller optimization. Full-stack development with modern frameworks.',
    icon: '📊',
    color: '#f29f67',
    tech: ['Angular', 'Node.js', 'PostgreSQL'] as const,
    branch: 'main',
    lineStyle: 'dashed',
  },
  {
    company: 'Exomal',
    role: 'Solidity Dev',
    period: 'Mar 2024 → Apr 2024',
    description: 'ERC20 token development and smart contract security auditing.',
    icon: '⛓️',
    color: '#8833cc',
    tech: ['Solidity', 'Hardhat', 'Web3.js'] as const,
    branch: 'feature',
    lineStyle: 'dashed',
    isBranchStart: true,
  },
  {
    company: 'Capco',
    role: 'Frontend',
    period: 'Nov 2022 → Jun 2023',
    description: 'Enterprise banking software development with Angular. Integrated AI-powered solutions.',
    icon: '🏦',
    color: '#3b82f6',
    tech: ['Angular', 'TypeScript', 'RxJS', 'AI/ML'] as const,
    branch: 'main',
    lineStyle: 'solid',
  },
  {
    company: 'AmNFT',
    role: 'Web3 Dev',
    period: 'Jul 2022 → Sep 2022',
    description: 'NFT marketplace smart contracts and beautiful frontend interfaces.',
    icon: '🎨',
    color: '#10b981',
    tech: ['Solidity', 'React', 'IPFS'] as const,
    branch: 'merge',
    lineStyle: 'solid',
    isMerge: true,
  },
  {
    company: 'alfaBASE',
    role: 'Frontend',
    period: 'Jun 2022 → Aug 2022',
    description: 'Government IT projects using Angular. Focus on accessibility and security.',
    icon: '🏛️',
    color: '#6366f1',
    tech: ['Angular', 'TypeScript', 'SCSS'] as const,
    branch: 'feature',
    lineStyle: 'solid',
  },
  {
    company: 'Hmstrsoc.io',
    role: 'Fullstack',
    period: 'Sep 2021 → Dec 2021',
    description: 'NFT collection platform with Angular frontend and Solidity smart contracts.',
    icon: '🐹',
    color: '#f59e0b',
    tech: ['Angular', 'Solidity', 'Firebase'] as const,
    branch: 'merge',
    lineStyle: 'solid',
    isBranchEnd: true,
  },
  {
    company: 'Siemens Healthineers',
    role: 'Intern',
    period: 'Jul 2019 → Aug 2019',
    description: 'Azure migration automation tools. First taste of enterprise development.',
    icon: '⚕️',
    color: '#14b8a6',
    tech: ['Azure', 'Python', 'PowerShell'] as const,
    branch: 'main',
    lineStyle: 'solid',
  },
] as const;
