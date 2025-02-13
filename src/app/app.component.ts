import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DarkModeToggleComponent } from './shared/components/dark-mode-toggle/dark-mode-toggle.component';
import { CommonModule } from '@angular/common';
import { BackgroundAnimationComponent } from './shared/components/background-animation/background-animation.component';
import { AboutMeComponent } from './features/about-me/about-me.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, AboutMeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
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
}
