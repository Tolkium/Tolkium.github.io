import { Component } from '@angular/core';
import { DarkModeToggleComponent } from '../../shared/components/dark-mode-toggle/dark-mode-toggle.component';
import { CommonModule } from '@angular/common';
import { BackgroundAnimationComponent } from '../../shared/components/background-animation/background-animation.component';


@Component({
  selector: 'app-about-me',
  standalone: true,
  imports: [CommonModule, DarkModeToggleComponent, BackgroundAnimationComponent],
  templateUrl: './about-me.component.html',
  styleUrl: './about-me.component.scss'
})
export class AboutMeComponent {
  title = 'Tolkium.github.io';

  skills = [
    'Angular',
    'TypeScript',
    'HTML5',
    'CSS3',
    'Responsive Design',
    'Git',
    'Bootstrap',
    'Web3',
    'Solidity',
    'Azure',
    '.NET Core'
  ];

  goToLinkedIn() {
    window.open('https://www.linkedin.com/in/marek-sipos/', '_blank');
  }
}
