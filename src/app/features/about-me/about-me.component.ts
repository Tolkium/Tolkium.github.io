import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TECHNICAL_SKILLS, SOFT_SKILLS } from '../../models/skills.model';

interface Experience {
  company: string;
  role: string;
  period: string;
  description: string;
  icon: string;
  color: string;
  tech?: string[];
}

@Component({
    selector: 'app-about-me',
    imports: [],
    templateUrl: './about-me.component.html',
    styleUrls: ['./about-me.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutMeComponent {
  title = 'About Me';

  softSkills = SOFT_SKILLS;
  technicalSkills = [...TECHNICAL_SKILLS, 'And More...'];

  experiences: Experience[] = [
    {
      company: 'T7',
      role: 'Fullstack',
      period: 'Apr 2024 → Aug 2024',
      description: 'Built analytics dashboard for Etsy seller optimization. Full-stack development with modern frameworks.',
      icon: '📊',
      color: '#f29f67',
      tech: ['Angular', 'Node.js', 'PostgreSQL']
    },
    {
      company: 'Exomal',
      role: 'Solidity Dev',
      period: 'Mar 2024 → Apr 2024',
      description: 'ERC20 token development and smart contract security auditing.',
      icon: '⛓️',
      color: '#8833cc',
      tech: ['Solidity', 'Hardhat', 'Web3.js']
    },
    {
      company: 'Capco',
      role: 'Frontend',
      period: 'Nov 2022 → Jun 2023',
      description: 'Enterprise banking software development with Angular. Integrated AI-powered solutions.',
      icon: '🏦',
      color: '#3b82f6',
      tech: ['Angular', 'TypeScript', 'RxJS', 'AI/ML']
    },
    {
      company: 'AmNFT',
      role: 'Web3 Dev',
      period: 'Jul 2022 → Sep 2022',
      description: 'NFT marketplace smart contracts and beautiful frontend interfaces.',
      icon: '🎨',
      color: '#10b981',
      tech: ['Solidity', 'React', 'IPFS']
    },
    {
      company: 'alfaBASE',
      role: 'Frontend',
      period: 'Jun 2022 → Aug 2022',
      description: 'Government IT projects using Angular. Focus on accessibility and security.',
      icon: '🏛️',
      color: '#6366f1',
      tech: ['Angular', 'TypeScript', 'SCSS']
    },
    {
      company: 'Hmstrsoc.io',
      role: 'Fullstack',
      period: 'Sep 2021 → Dec 2021',
      description: 'NFT collection platform with Angular frontend and Solidity smart contracts.',
      icon: '🐹',
      color: '#f59e0b',
      tech: ['Angular', 'Solidity', 'Firebase']
    },
    {
      company: 'Siemens Healthineers',
      role: 'Intern',
      period: 'Jul 2019 → Aug 2019',
      description: 'Azure migration automation tools. First taste of enterprise development.',
      icon: '⚕️',
      color: '#14b8a6',
      tech: ['Azure', 'Python', 'PowerShell']
    }
  ];

  goToLinkedIn(): void {
    window.open('https://www.linkedin.com/in/marek-sipos/', '_blank');
  }
}
