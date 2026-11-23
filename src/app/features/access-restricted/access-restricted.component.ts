import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroLockClosed } from '@ng-icons/heroicons/outline';
import { PROFILE_INFO } from '../about-me/about-me.data';

interface RestrictedRouteData {
  featureName?: string;
}

@Component({
  selector: 'app-access-restricted',
  standalone: true,
  imports: [RouterLink, NgIconComponent],
  templateUrl: './access-restricted.component.html',
  styleUrl: './access-restricted.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ heroLockClosed })],
})
export class AccessRestrictedComponent {
  private readonly route = inject(ActivatedRoute);

  readonly linkedInUrl = PROFILE_INFO.linkedInUrl;

  get featureName(): string {
    const data = this.route.snapshot.data as RestrictedRouteData;
    return data.featureName ?? 'Restricted Section';
  }

  get routePath(): string {
    return this.route.snapshot.routeConfig?.path ?? 'restricted';
  }
}
