import { MenuSection } from './menu-section';

export const MENU_SECTIONS: MenuSection[] = [
  {
    title: 'ACTIVITY DATA & TARGETS',
    items: [
      {
        iconName: 'heroHome',
        label: 'Home',
        route: '/'
      },
      {
        iconName: 'heroFolder',
        label: 'Projects',
        route: '/projects'
      },
      {
        iconName: 'heroPhoto',
        label: 'Gallery',
        route: '/hierarchy'
      },
      {
        iconName: 'heroSquares2x2',
        label: 'TODO list',
        route: '/departments'
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
    title: 'MASTERS',
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
        route: '/SkillMatrix'
      },
      {
        iconName: 'heroServerStack',
        label: 'Server Analitics',
        route: '/DockerDashboard'
      },
      
    ]
  },
  {
    title: 'USERS & ROLES',
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
