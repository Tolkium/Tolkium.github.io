import { MenuSection } from './menu-section';

export const MENU_SECTIONS: MenuSection[] = [
  {
    title: 'NAVIGATION',
    items: [
      {
        iconName: 'heroHome',
        label: 'Home',
        route: '/about',
        feature: 'about'
      },
      {
        iconName: 'heroGift',
        label: 'Christmas Gift',
        route: '/christmas-gift',
        feature: 'christmasGift'
      },
      {
        iconName: 'heroSparkles',
        label: "Norbert's Wishlist",
        route: '/norbert-gift',
        feature: 'norbertGift'
      },
      {
        iconName: 'heroFolder',
        label: 'Projects',
        route: '/projects',
        feature: 'projects'
      },
      {
        iconName: 'heroPhoto',
        label: 'Gallery',
        route: '/gallery',
        feature: 'gallery'
      },
      {
        iconName: 'heroSquares2x2',
        label: 'TODO list',
        route: '/todo',
        feature: 'todo'
      },
      {
        iconName: 'heroCalendarDays',
        label: 'Personal calendar',
        route: '/calendar',
        feature: 'calendar'
      },
      {
        iconName: 'heroCubeTransparent',
        label: 'Docker Dashboard',
        route: '/DockerDashboard',
        feature: 'dockerDashboard'
      }
    ]
  },
  {
    title: 'TOOLS',
    items: [
      {
        iconName: 'heroCommandLine',
        label: 'Regex Tester',
        route: '/Regex',
        feature: 'regex'
      },
      {
        iconName: 'heroSwatch',
        label: 'Color Palette Generator',
        route: '/ColorPaletteGenerator',
        feature: 'colorPalette'
      },
      {
        iconName: 'heroCodeBracketSquare',
        label: 'GitHub Repo Explorer',
        route: '/GitHubRepoExplorer',
        feature: 'githubExplorer'
      },
      {
        iconName: 'heroCube',
        label: 'Package Version Checker',
        route: '/PackageVersionChecker',
        feature: 'packageChecker'
      },
      {
        iconName: 'heroSquaresPlus',
        label: 'Skill Matrix',
        route: '/SkillMatrix',
        feature: 'skillMatrix'
      },
      {
        iconName: 'heroArchiveBox',
        label: 'Snippet Vault',
        route: '/snippet-vault',
        feature: 'snippetVault'
      },
      {
        iconName: 'heroDevicePhoneMobile',
        label: 'Design Viewer',
        route: '/design-viewer',
        feature: 'designViewer'
      },
      {
        iconName: 'heroDevicePhoneMobile',
        label: 'Local Storage Viewer',
        route: '/LocalStorageViewer',
        feature: 'localStorageViewer'
      },
      {
        iconName: 'heroServerStack',
        label: 'Server Analytics',
        route: '/ServerAnalytics',
        feature: 'serverAnalytics'
      }
    ]
  },
  {
    title: 'PROFILE & SETTINGS',
    items: [
      {
        iconName: 'heroArrowDownTray',
        label: 'Download CV as PDF',
        route: '/roles',
        feature: 'cvDownload'
      },
      {
        iconName: 'heroUsers',
        label: 'User Management',
        route: '/User',
        feature: 'userManagement'
      },
      {
        iconName: 'heroCog8Tooth',
        label: 'Settings',
        route: '/settings',
        feature: 'settings'
      }
    ]
  }
];
