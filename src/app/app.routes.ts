import { Routes } from '@angular/router';

import { guestGuard } from './core/auth/guest.guard';
import { ownerGuard } from './core/auth/owner.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/marketing/home-page/home-page').then((m) => m.HomePage),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register-page/register-page').then((m) => m.RegisterPage),
  },
  {
    path: 'onboarding',
    canActivate: [ownerGuard],
    loadComponent: () =>
      import('./features/auth/onboarding-business-page/onboarding-business-page').then(
        (m) => m.OnboardingBusinessPage,
      ),
  },
  {
    path: 'dashboard',
    canActivate: [ownerGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard-shell/dashboard-shell').then((m) => m.DashboardShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      {
        path: 'overview',
        loadComponent: () =>
          import('./features/dashboard/overview-page/overview-page').then((m) => m.OverviewPage),
      },
      {
        path: 'business-profile',
        loadComponent: () =>
          import('./features/dashboard/business-profile-page/business-profile-page').then(
            (m) => m.BusinessProfilePage,
          ),
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./features/dashboard/services/services-list-page/services-list-page').then(
            (m) => m.ServicesListPage,
          ),
      },
      {
        path: 'staff',
        loadComponent: () =>
          import('./features/dashboard/staff/staff-list-page/staff-list-page').then(
            (m) => m.StaffListPage,
          ),
      },
      {
        path: 'staff/:staffId/availability',
        loadComponent: () =>
          import('./features/dashboard/staff/staff-availability-editor/staff-availability-editor').then(
            (m) => m.StaffAvailabilityEditor,
          ),
      },
      {
        path: 'availability',
        loadComponent: () =>
          import(
            './features/dashboard/availability/availability-calendar-page/availability-calendar-page'
          ).then((m) => m.AvailabilityCalendarPage),
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('./features/dashboard/bookings/bookings-list-page/bookings-list-page').then(
            (m) => m.BookingsListPage,
          ),
      },
    ],
  },
  {
    path: 'book/:slug',
    loadComponent: () =>
      import('./features/public-booking/booking-shell/booking-shell').then((m) => m.BookingShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'service' },
      {
        path: 'service',
        loadComponent: () =>
          import('./features/public-booking/select-service-page/select-service-page').then(
            (m) => m.SelectServicePage,
          ),
      },
      {
        path: 'staff',
        loadComponent: () =>
          import('./features/public-booking/select-staff-page/select-staff-page').then(
            (m) => m.SelectStaffPage,
          ),
      },
      {
        path: 'time',
        loadComponent: () =>
          import('./features/public-booking/select-slot-page/select-slot-page').then(
            (m) => m.SelectSlotPage,
          ),
      },
      {
        path: 'details',
        loadComponent: () =>
          import('./features/public-booking/customer-details-page/customer-details-page').then(
            (m) => m.CustomerDetailsPage,
          ),
      },
      {
        path: 'confirmation',
        loadComponent: () =>
          import('./features/public-booking/confirmation-page/confirmation-page').then(
            (m) => m.ConfirmationPage,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
