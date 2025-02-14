// menu-section.ts
export interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}
