import { FeatureKey } from '../core/features/features';

export interface MenuItem {
  iconName: string;
  label: string;
  route: string;
  feature: FeatureKey;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}
