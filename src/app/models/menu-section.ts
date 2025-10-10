// menu-section.ts
export interface MenuItem {
  iconName: string;
  label: string;
  route: string;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}
