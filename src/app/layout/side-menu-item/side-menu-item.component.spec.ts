import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { heroHome } from '@ng-icons/heroicons/outline';

import { SideMenuItemComponent } from './side-menu-item.component';

describe('SideMenuItemComponent', () => {
  let component: SideMenuItemComponent;
  let fixture: ComponentFixture<SideMenuItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideMenuItemComponent],
      providers: [provideRouter([]), provideIcons({ heroHome })],
    }).compileComponents();

    fixture = TestBed.createComponent(SideMenuItemComponent);
    component = fixture.componentInstance;
    component.item = {
      iconName: 'heroHome',
      label: 'Home',
      route: '/about',
      feature: 'about',
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
