/**
 * Centralized skills definitions
 * Update this file to change skills throughout the application
 */

export interface SkillsConfig {
  technical: string[];
  soft: string[];
}

/**
 * Technical skills list
 */
export const TECHNICAL_SKILLS: string[] = [
  'Angular',
  'JavaScript',
  'TypeScript',
  'HTML',
  'SCSS',
  'Web Development',
  'Software Design Patterns',
  'SOLID',
  'Bootstrap',
  'Git',
  'Azure DevOps',
  'Docker',
  'Nx',
  'Unit Testing',
  'RXJS',
  'NodeJS',
  'NestJS',
  'OpenAI API',
  'Python'
];

/**
 * Soft skills list
 */
export const SOFT_SKILLS: string[] = [
  'Problem Solving',
  'Fast Learner',
  'Agile',
  'Team Player',
  'Creativity',
  'Solution Design'
];

/**
 * Combined skills configuration
 */
export const SKILLS_CONFIG: SkillsConfig = {
  technical: TECHNICAL_SKILLS,
  soft: SOFT_SKILLS
};

