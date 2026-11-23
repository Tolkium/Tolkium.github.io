import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { routes } from '../../app.routes';
import { AccessRestrictedComponent } from '../../features/access-restricted/access-restricted.component';
import { TrustedUrlPipe } from '../../features/design-viewer/trusted-url.pipe';
import { ProjectsComponent } from '../../features/projects/projects.component';
import { MENU_SECTIONS } from '../../models/menu-data';
import { SearchService } from '../services/search.service';
import { MenuIndexer } from '../services/search/indexers/menu-indexer';
import { RoutesIndexer } from '../services/search/indexers/routes-indexer';
import { initialUiState } from '../store/ui.state';
import { FeatureFlagService } from './feature-flag.service';
import { isFeatureKey, provideFeatureFlags } from './features';

describe('FeatureFlagService & routing', () => {
  it('classifies enabled, locked, unlisted, and disabled visibilities correctly', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(FeatureFlagService);

    expect(service.getVisibility('about')).toBe('enabled');
    expect(service.isEnabled('about')).toBeTrue();
    expect(service.isListed('about')).toBeTrue();
    expect(service.isRoutable('about')).toBeTrue();
    expect(service.isLocked('about')).toBeFalse();

    expect(service.getVisibility('projects')).toBe('locked');
    expect(service.isEnabled('projects')).toBeFalse();
    expect(service.isListed('projects')).toBeTrue();
    expect(service.isRoutable('projects')).toBeFalse();
    expect(service.isLocked('projects')).toBeTrue();

    expect(service.getVisibility('designViewer')).toBe('unlisted');
    expect(service.isEnabled('designViewer')).toBeFalse();
    expect(service.isListed('designViewer')).toBeFalse();
    expect(service.isRoutable('designViewer')).toBeTrue();
    expect(service.isLocked('designViewer')).toBeFalse();

    expect(service.getVisibility('christmasGift')).toBe('disabled');
    expect(service.isEnabled('christmasGift')).toBeFalse();
    expect(service.isListed('christmasGift')).toBeFalse();
    expect(service.isRoutable('christmasGift')).toBeFalse();
    expect(service.isLocked('christmasGift')).toBeFalse();
  });

  it('validates feature keys safely', () => {
    expect(isFeatureKey('about')).toBeTrue();
    expect(isFeatureKey('nonExistentFeature')).toBeFalse();
    expect(isFeatureKey(undefined)).toBeFalse();
  });

  it('supports overriding flags cleanly via DI', () => {
    TestBed.configureTestingModule({
      providers: [provideFeatureFlags({ projects: 'enabled' })],
    });
    const service = TestBed.inject(FeatureFlagService);

    expect(service.isEnabled('projects')).toBeTrue();
    expect(service.isRoutable('projects')).toBeTrue();
    expect(service.isLocked('projects')).toBeFalse();
    expect(service.isLocked('gallery')).toBeTrue();
  });

  it('keeps enabled and locked items in the menu while hiding disabled and unlisted items', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(FeatureFlagService);
    const visibleSections = service.filterMenuSections(MENU_SECTIONS);
    const visibleRoutes = visibleSections.flatMap((section) =>
      section.items.map((item) => item.route)
    );

    expect(visibleRoutes).toContain('/about');
    expect(visibleRoutes).toContain('/settings');
    expect(visibleRoutes).toContain('/projects');
    expect(visibleRoutes).toContain('/DockerDashboard');
    expect(visibleRoutes).toContain('/LocalStorageViewer');
    expect(visibleRoutes).toContain('/ServerAnalytics');
    expect(visibleRoutes).not.toContain('/christmas-gift');
    expect(visibleRoutes).not.toContain('/norbert-gift');
    expect(visibleRoutes).not.toContain('/design-viewer');
    expect(visibleSections.every((section) => section.items.length > 0)).toBeTrue();
  });

  it('excludes disabled and unlisted items from search indexers and never indexes mock projects when locked', () => {
    TestBed.configureTestingModule({});
    const menuIndexer = TestBed.inject(MenuIndexer);
    const routesIndexer = TestBed.inject(RoutesIndexer);
    const searchService = TestBed.inject(SearchService);

    const indexedMenuRoutes = menuIndexer.index().map((item) => item.route);
    const indexedRoutes = routesIndexer.index().map((item) => item.route);

    expect(indexedMenuRoutes).toContain('/about');
    expect(indexedMenuRoutes).toContain('/projects');
    expect(indexedMenuRoutes).not.toContain('/christmas-gift');
    expect(indexedMenuRoutes).not.toContain('/norbert-gift');
    expect(indexedMenuRoutes).not.toContain('/design-viewer');

    expect(indexedRoutes).toContain('/about');
    expect(indexedRoutes).toContain('/settings');
    expect(indexedRoutes).not.toContain('/projects');
    expect(indexedRoutes).not.toContain('/christmas-gift');
    expect(indexedRoutes).not.toContain('/design-viewer');

    searchService.setQuery('E-Commercio');
    expect(searchService.searchResults().length).toBe(0);
  });

  it('renders AccessRestrictedComponent for locked routes, redirects disabled routes, and allows unlisted routes', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });

    const harness = await RouterTestingHarness.create();
    const router = TestBed.inject(Router);

    for (const lockedPath of [
      '/projects',
      '/gallery',
      '/calendar',
      '/todo',
      '/DockerDashboard',
      '/LocalStorageViewer',
      '/ServerAnalytics',
    ]) {
      const component = await harness.navigateByUrl(lockedPath, AccessRestrictedComponent);
      expect(component).toBeInstanceOf(AccessRestrictedComponent);
      expect(router.url).toBe(lockedPath);
    }

    for (const disabledPath of ['/christmas-gift', '/norbert-gift']) {
      await harness.navigateByUrl(disabledPath);
      expect(router.url).toBe('/about');
    }

    await harness.navigateByUrl('/design-viewer');
    expect(router.url).toBe('/design-viewer');
  });

  it('loads the real component when a locked feature is enabled via provideFeatureFlags', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideFeatureFlags({ projects: 'enabled' }),
        provideMockStore({ initialState: { ui: initialUiState } }),
        provideRouter(routes),
      ],
    });

    const harness = await RouterTestingHarness.create();
    const router = TestBed.inject(Router);

    const component = await harness.navigateByUrl('/projects', ProjectsComponent);
    expect(component).toBeInstanceOf(ProjectsComponent);
    expect(router.url).toBe('/projects');
  });
});

describe('TrustedUrlPipe', () => {
  let pipe: TrustedUrlPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TrustedUrlPipe] });
    pipe = TestBed.inject(TrustedUrlPipe);
  });

  it('allows http and https URLs', () => {
    expect(pipe.transform('https://example.com/design')).not.toBeNull();
    expect(pipe.transform('http://localhost:4200')).not.toBeNull();
  });

  it('blocks javascript: and data: URLs to prevent XSS', () => {
    expect(pipe.transform('javascript:alert(1)')).toBeNull();
    expect(pipe.transform('JAVASCRIPT:alert(1)')).toBeNull();
    expect(pipe.transform('data:text/html,<script>alert(1)</script>')).toBeNull();
    expect(pipe.transform(null)).toBeNull();
  });
});
