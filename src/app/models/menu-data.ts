import { MenuSection } from './menu-section';

// Temporarily saved menu sections (icons as inline SVG). To be wired after Angular upgrade.
export const MENU_SECTIONS: MenuSection[] = [
  {
    title: 'ACTIVITY DATA & TARGETS',
    items: [
      { iconName: 'heroSquares2x2', label: 'Home', route: '/activities' },
      { iconName: 'heroFolderOpen', label: 'Projects', route: '/projects' },
      { iconName: 'heroPhoto', label: 'Gallery', route: '/hierarchy' },
      { iconName: 'heroPuzzlePiece', label: 'TODO list', route: '/departments' },
      { iconName: 'heroCalendar', label: 'Personal calendar', route: '/calendar' },
      { iconName: 'heroCube', label: 'Docker Dashboard', route: '/DockerDashboard' },      

    ]
  },
  {
    title: 'MASTERS',
    items: [
      { iconName: 'heroBeaker', label: 'Regex Tester', route: '/Regex' },
      { iconName: 'heroSwatch', label: 'Color Palette Generator', route: '/ColorPaletteGenerator' },
      { iconName: 'heroCommandLine', label: 'GitHub Repo Explorer', route: '/GitHubRepoExplorer' },
      { iconName: 'heroCpuChip', label: 'Package Version Checker', route: '/PackageVersionChecker' },
      { iconName: 'heroPresentationChartBar', label: 'Skill Matrix', route: '/SkillMatrix' },
      // { iconName: 'heroCodeBracket', label: 'CSS Playground', route: '/CSS Playground' },
      { iconName: 'heroArchiveBox', label: 'Snippet Vault', route: '/SnippetVault' },
      { iconName: 'heroServer', label: 'Local Storage Viewer', route: '/SkillMatrix' },
      // { iconName: 'heroSparkles', label: 'Glitch Art Generator', route: '/SkillMatrix' },
      // { iconName: 'heroBeaker', label: 'Code Pattern Library', route: '/CodePatternLibrary' }
      { iconName: 'heroChartPie', label: 'Server Analitics', route: '/DockerDashboard' },
    ]
  },
  {
    title: 'USERS & ROLES',
    items: [

      { iconName: 'heroArrowDownTray', label: 'Download CV as PDF', route: '/roles' },
      { iconName: 'heroUserGroup', label: 'User Management', route: '/User' },
      { iconName: 'heroCog6Tooth', label: 'Setings', route: 'Setings' }
    ]
  } 
];



// ACTIVITY DATA & TARGETS
// Home
// Projects
// Gallery
// TODO list
// Personal calendar
// Docker Dashboard
// MASTERS
// Regex Tester
// Color Palette Generator
// GitHub Repo Explorer
// Package Version Checker
// Skill Matrix
// Snippet Vault
// Local Storage Viewer
// USERS & ROLES
// Download CV as PDF
// User Management
// Setings