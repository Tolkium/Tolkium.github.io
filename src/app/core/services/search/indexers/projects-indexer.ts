import { Injectable } from '@angular/core';
import { MOCK_PROJECTS } from '../../../../models/project.model';
import type { Project } from '../../../../models/project.model';
import type { IContentIndexer } from './content-indexer.interface';
import type { SearchableItem } from '../search.models';
import { extractKeywords, extractMeaningfulWords, generateBigrams } from '../search.utils';

/**
 * Indexer for project items with sophisticated keyword extraction
 */
@Injectable({ providedIn: 'root' })
export class ProjectsIndexer implements IContentIndexer {
  index(): SearchableItem[] {
    const items: SearchableItem[] = [];

    MOCK_PROJECTS.forEach((project) => {
      items.push(this.createSearchableItem(project));
    });

    return items;
  }

  private createSearchableItem(project: Project): SearchableItem {
    const descriptionLower = project.description.toLowerCase();
    const descriptionWords = extractMeaningfulWords(descriptionLower);
    const bigrams = generateBigrams(descriptionWords);

    const keywords = [
      project.title.toLowerCase(),
      descriptionLower,
      project.category.toLowerCase(),
      project.status.toLowerCase(),
      ...project.technologies.map(t => t.toLowerCase()),
      ...extractKeywords(project.title),
      ...extractKeywords(project.description),
      ...descriptionWords,
      ...bigrams
    ];

    return {
      id: `project-${project.id}`,
      type: 'feature',
      title: project.title,
      description: `${project.category} - ${project.description}`,
      route: '/projects',
      keywords,
      category: 'Projects',
      parent: 'Features'
    };
  }
}
