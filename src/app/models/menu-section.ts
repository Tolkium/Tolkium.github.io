// menu-section.ts
export interface MenuItem {
  // Prefer using Heroicons via ng-icons
  iconName?: string;
  // Fallback for legacy inline SVGs until all are migrated
  icon?: string;
  label: string;
  route: string;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}
