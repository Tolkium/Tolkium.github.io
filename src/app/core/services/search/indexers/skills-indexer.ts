import { Injectable } from '@angular/core';
import { TECHNICAL_SKILLS, SOFT_SKILLS } from '../../../../models/skills.model';
import type { IContentIndexer } from './content-indexer.interface';
import type { SearchableItem } from '../search.models';
import { extractKeywords } from '../search.utils';

/**
 * Indexer for skills (technical and soft skills)
 * Skills are sourced from the centralized skills.model.ts
 */
@Injectable({ providedIn: 'root' })
export class SkillsIndexer implements IContentIndexer {
  index(): SearchableItem[] {
    const items: SearchableItem[] = [];

    [...TECHNICAL_SKILLS, ...SOFT_SKILLS].forEach((skill) => {
      const keywords = [
        skill.toLowerCase(),
        ...extractKeywords(skill),
        'skill', 'about', 'experience'
      ];

      items.push({
        id: `skill-${skill.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'feature',
        title: skill,
        description: `Technical skill: ${skill}`,
        route: '/about',
        keywords,
        category: 'Skills',
        parent: 'About'
      });
    });

    return items;
  }
}

