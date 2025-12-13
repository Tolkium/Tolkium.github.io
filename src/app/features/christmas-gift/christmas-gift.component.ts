import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroGift, heroXMark, heroCpuChip, heroSparkles } from '@ng-icons/heroicons/outline';

interface Milestone {
  label: string;
  cost: number;
  completed: boolean;
  icon?: string;
}

@Component({
  selector: 'app-christmas-gift',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [provideIcons({ heroGift, heroXMark, heroCpuChip, heroSparkles })],
  templateUrl: './christmas-gift.component.html',
  styleUrls: ['./christmas-gift.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChristmasGiftComponent {
  // Product Details
  productName = 'GIGABYTE GeForce RTX 5070 Ti WINDFORCE OC SFF 16G';
  productPrice = 802.90;
  productImage = 'https://image.alza.cz/products/EGr57tw1/EGr57tw1.jpg?width=2000&height=2000';

  // Funding State (Mock Data for visualization)
  currentAmount = 521.88; // roughly 65%
  get progressPercentage(): number {
    return Math.min(100, Math.max(0, (this.currentAmount / this.productPrice) * 100));
  }

  // Specifications
  specs = [
    { label: 'Architecture', value: 'NVIDIA Blackwell (GB203-300-A1)' },
    { label: 'CUDA Cores', value: '8,960' },
    { label: 'Memory', value: '16 GB GDDR7 (256-bit)' },
    { label: 'Boost Clock', value: '2497 MHz (Factory OC)' },
    { label: 'Bandwidth', value: '896 GB/s' },
    { label: 'Dimensions', value: '304 x 126 x 50 mm' },
    { label: 'Cooling', value: 'Windforce 3X (SFF-Ready)' },
    { label: 'Power', value: '300W TGP (1x 16-pin)' }
  ];

  // Milestones (Circuit Path Nodes)
  milestones: Milestone[] = [
    { label: 'PCB Design', cost: 50, completed: true },
    { label: 'Capacitors', cost: 100, completed: true },
    { label: 'Power Stages', cost: 150, completed: true },
    { label: 'GPU Core Etching', cost: 200, completed: true },
    { label: 'VRAM Soldering', cost: 250, completed: true },
    { label: 'Heatspreader', cost: 300, completed: true },
    { label: 'Thermal Paste', cost: 350, completed: true },
    { label: 'Heatsink', cost: 400, completed: true },
    { label: 'Fans', cost: 450, completed: true },
    { label: 'Backplate', cost: 500, completed: true }, // Current level approx
    { label: 'RGB Lighting', cost: 550, completed: false },
    { label: 'Packaging', cost: 600, completed: false },
    { label: 'Shipping', cost: 650, completed: false },
    { label: 'Customs', cost: 720, completed: false },
    { label: 'Delivery', cost: 802.90, completed: false }
  ];

  // Modal State
  isModalOpen = signal(false);

  openModal() {
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  // Helper to determine if a specific milestone should be "lit up"
  isMilestoneActive(milestone: Milestone): boolean {
    return this.currentAmount >= milestone.cost;
  }
}
