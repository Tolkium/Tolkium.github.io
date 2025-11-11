import { MenuSection } from './menu-section';

// Temporarily saved menu sections (icons as inline SVG). To be wired after Angular upgrade.
export const MENU_SECTIONS: MenuSection[] = [
  {
    title: 'NAVIGATION',
    items: [
      {
        iconName: 'heroHome',
        label: 'Home',
        route: '/about'
      },
      {
        iconName: 'heroFolder',
        label: 'Projects',
        route: '/projects'
      },
      {
        iconName: 'heroPhoto',
        label: 'Gallery',
        route: '/gallery'
      },
      {
        iconName: 'heroSquares2x2',
        label: 'TODO list',
        route: '/todo'
      },
      {
        iconName: 'heroCalendarDays',
        label: 'Personal calendar',
        route: '/calendar'
      },
      {
        iconName: 'heroCubeTransparent',
        label: 'Docker Dashboard',
        route: '/DockerDashboard'
      }
    ]
  },
  {
    title: 'TOOLS',
    items: [
      {
        iconName: 'heroCommandLine',
        label: 'Regex Tester',
        route: '/Regex'
      },
      {
        iconName: 'heroSwatch',
        label: 'Color Palette Generator',
        route: '/ColorPaletteGenerator'
      },
      {
        iconName: 'heroCodeBracketSquare',
        label: 'GitHub Repo Explorer',
        route: '/GitHubRepoExplorer'
      },
      {
        iconName: 'heroCube',
        label: 'Package Version Checker',
        route: '/PackageVersionChecker'
      },
      {
        iconName: 'heroSquaresPlus',
        label: 'Skill Matrix',
        route: '/SkillMatrix'
      },
      {
        iconName: 'heroArchiveBox',
        label: 'Snippet Vault',
        route: '/SnippetVault'
      },
      {
        iconName: 'heroDevicePhoneMobile',
        label: 'Local Storage Viewer',
        route: '/local-storage-viewer'
      },
      {
        iconName: 'heroServerStack',
        label: 'Server Analitics',
        route: '/DockerDashboard'
      },
      
    ]
  },
  {
    title: 'PROFILE & SETTINGS',
    items: [
      {
        iconName: 'heroArrowDownTray',
        label: 'Download CV as PDF',
        route: '/roles'
      },
      {
        iconName: 'heroUsers',
        label: 'User Management',
        route: '/User'
      },
      {
        iconName: 'heroCog8Tooth',
        label: 'Settings',
        route: '/settings'
      }
    ]
  } 
];
