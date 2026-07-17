import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonComponent } from '../../../components/button/button';

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, ButtonComponent],
  templateUrl: './home-page.html',
})
export class HomePage {
  protected readonly currentYear = new Date().getFullYear();

  protected readonly features: FeatureCard[] = [
    {
      icon: '📅',
      title: 'Smart scheduling',
      description: 'Real-time availability per staff member, so double-bookings never happen.',
    },
    {
      icon: '👥',
      title: 'Staff management',
      description: 'Set each team member’s working hours, time off, and the services they offer.',
    },
    {
      icon: '🔗',
      title: 'A booking page for your business',
      description: 'Share one link and customers book themselves in, no account required.',
    },
    {
      icon: '📋',
      title: 'One dashboard for every booking',
      description: 'Track, filter, and update booking status as customers come and go.',
    },
  ];
}
