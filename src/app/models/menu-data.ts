import { MenuSection } from './menu-section';

export const MENU_SECTIONS: MenuSection[] = [
  {
    title: 'ACTIVITY DATA & TARGETS',
    items: [
      {
        iconName: 'heroCog6Tooth',
        label: 'Target settings',
        route: '/targets'
      },
      {
        iconName: 'heroFolder',
        label: 'Projects',
        route: '/projects'
      },
      {
        iconName: 'heroChartBarSquare',
        label: 'Data reporting',
        route: '/reporting'
      },
      {
        iconName: 'heroPresentationChartLine',
        label: 'Reports/Analytics',
        route: '/analytics'
      },
      {
        iconName: 'heroClipboardDocumentList',
        label: 'Manage activities',
        route: '/activities'
      },
    ]
  },
  {
    title: 'MASTERS',
    items: [
      {
        iconName: 'heroSquares2X2',
        label: 'TODO list',
        route: '/departments'
      },
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
        iconName: 'heroCalendarDays',
        label: 'Personal calendar',
        route: '/calendar'
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
        iconName: 'heroBeaker',
        label: 'CSS Playground',
        route: '/CSS Playground'
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
        iconName: 'heroSparkles',
        label: 'Glitch Art Generator',
        route: '/SkillMatrix'
      },
      {
        iconName: 'heroSquares2X2',
        label: 'Code Pattern Library',
        route: '/CodePatternLibrary'
      }
    ]
  },
  {
    title: 'USERS & ROLES',
    items: [
      {
        iconName: 'heroDocumentText',
        label: 'Code Snippet Manager',
        route: '/SnippetManager'
      },      
      {
        iconName: 'heroCubeTransparent',
        label: 'Docker Dashboard',
        route: '/DockerDashboard'
      },      
      {
        iconName: 'heroServerStack',
        label: 'Server Analitics',
        route: '/DockerDashboard'
      },
      {
        iconName: 'heroArrowDownTray',
        label: 'Download CV as PDF',
        route: '/roles'
      },
      {
        iconName: 'heroPhoto',
        label: 'Gallery',
        route: '/hierarchy'
      },
      {
        iconName: 'heroUsers',
        label: 'User Management',
        route: '/User'
      },
      {
        iconName: 'heroCog8Tooth',
        label: 'Setings',
        route: 'Setings'
      }
    ]
  } 
];
