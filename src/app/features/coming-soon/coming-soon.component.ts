import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FeatureFlagService } from '../../core/features/feature-flag.service';

interface ComingSoonData {
  featureName?: string;
  subtitle?: string;
  statusNote?: string;
}

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './coming-soon.component.html',
  styleUrl: './coming-soon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComingSoonComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly featureFlags = inject(FeatureFlagService);

  readonly showProjectsLink = this.featureFlags.isRoutable('projects');

  private get data(): ComingSoonData {
    return this.route.snapshot.data as ComingSoonData;
  }

  get featureName(): string {
    return this.data.featureName ?? 'Planned Feature';
  }

  get subtitle(): string {
    return this.data.subtitle ?? 'This page is planned for a future update.';
  }

  get statusNote(): string {
    return this.data.statusNote ?? '';
  }
}
