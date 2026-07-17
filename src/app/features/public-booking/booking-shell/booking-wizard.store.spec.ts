import { TestBed } from '@angular/core/testing';

import { PublicService, PublicStaff } from '../../../core/models/public.model';
import { ANY_STAFF, BookingWizardStore } from './booking-wizard.store';

describe('BookingWizardStore', () => {
  let store: BookingWizardStore;

  const services: PublicService[] = [
    { id: 1, name: 'Haircut', description: '', duration_minutes: 30, price: '25.00' },
  ];
  const staff: PublicStaff[] = [
    { id: 1, name: 'Sarah Chen' },
    { id: 2, name: 'Marco Rivera' },
  ];

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    store = TestBed.inject(BookingWizardStore);
    store.initFor('demo-salon');
  });

  afterEach(() => sessionStorage.clear());

  it('starts empty for a fresh slug', () => {
    expect(store.selection().slug).toBe('demo-salon');
    expect(store.selection().selectedServiceId).toBeNull();
  });

  it('selecting a service resets any later step selections', () => {
    store.setServices(services);
    store.setStaffOptions(staff);
    store.selectStaff(1);
    store.selectDate('2026-07-20');

    store.selectService(1);

    expect(store.selection().selectedServiceId).toBe(1);
    expect(store.selection().selectedStaffId).toBeNull();
    expect(store.selection().selectedDate).toBeNull();
  });

  it('selectedService looks up the service by id', () => {
    store.setServices(services);
    store.selectService(1);
    expect(store.selectedService?.name).toBe('Haircut');
  });

  it('resolvedStaff resolves a directly-chosen staff member', () => {
    store.setStaffOptions(staff);
    store.selectStaff(2);
    expect(store.resolvedStaff?.name).toBe('Marco Rivera');
  });

  it('resolvedStaff falls back to the slot\'s staffId when "any" was chosen', () => {
    store.setStaffOptions(staff);
    store.selectStaff(ANY_STAFF);
    store.selectSlot({ startTime: '2026-07-20T09:00:00Z', staffId: 2 });
    expect(store.resolvedStaff?.name).toBe('Marco Rivera');
  });

  it('persists selections to sessionStorage and restores them for the same slug', () => {
    store.setServices(services);
    store.selectService(1);

    // Simulate a fresh page load: new store instance, same slug.
    const freshStore = TestBed.runInInjectionContext(() => new BookingWizardStore());
    freshStore.initFor('demo-salon');

    expect(freshStore.selection().selectedServiceId).toBe(1);
  });

  it('does not leak state between different business slugs', () => {
    store.selectService(1);
    store.initFor('other-salon');
    expect(store.selection().selectedServiceId).toBeNull();
  });
});
