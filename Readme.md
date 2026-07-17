# Slotify — Appointment Booking SaaS
### Frontend Documentation

**Stack**
- **Frontend:** Angular latest

### 2.1 Architecture

**models/:**
**services/:**
**components/<component>:**
**utils/:**

### 2.2 Data Models Used In Backend
**These models will help you create the models for angular**

```python
# users/models.py
class User(AbstractUser):
    ROLE_CHOICES = [
        ("owner", "Business Owner"),
        ("staff", "Staff Member"),
        ("customer", "Customer"),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=20, blank=True)


# businesses/models.py
class Business(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="businesses")
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)  # used for public booking URL
    timezone = models.CharField(max_length=64, default="Asia/Dubai")
    address = models.CharField(max_length=255, blank=True)
    logo = models.ImageField(upload_to="logos/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


# services/models.py
class Service(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name="services")
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    duration_minutes = models.PositiveIntegerField()
    buffer_minutes = models.PositiveIntegerField(default=0)  # gap after booking
    price = models.DecimalField(max_digits=8, decimal_places=2)
    is_active = models.BooleanField(default=True)


# staff/models.py
class StaffMember(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name="staff_members")
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    services = models.ManyToManyField(Service, related_name="staff_members")
    is_active = models.BooleanField(default=True)


class WorkingHours(models.Model):
    staff = models.ForeignKey(StaffMember, on_delete=models.CASCADE, related_name="working_hours")
    day_of_week = models.IntegerField()  # 0=Monday ... 6=Sunday
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        unique_together = ("staff", "day_of_week")


class TimeOff(models.Model):
    staff = models.ForeignKey(StaffMember, on_delete=models.CASCADE, related_name="time_off")
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    reason = models.CharField(max_length=255, blank=True)


# bookings/models.py
class Booking(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("cancelled", "Cancelled"),
        ("completed", "Completed"),
        ("no_show", "No Show"),
    ]
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name="bookings")
    service = models.ForeignKey(Service, on_delete=models.PROTECT)
    staff = models.ForeignKey(StaffMember, on_delete=models.PROTECT)
    customer_name = models.CharField(max_length=255)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=20, blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["staff", "start_time"])]
```

---

### 2.3 API Endpoints
**Use these endpoints to call APIs in angular using services**

**Auth**
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register business owner (creates User + Business) |
| POST | `/api/auth/login/` | Obtain JWT access/refresh tokens |
| POST | `/api/auth/refresh/` | Refresh access token |
| GET | `/api/auth/me/` | Current user profile |

**Business (dashboard, auth required — owner only)**
| Method | Endpoint | Description |
|---|---|---|
| GET/PATCH | `/api/business/` | View/create/update own business profile |

**Services**
| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/services/` | List / create services |
| GET/PATCH/DELETE | `/api/services/{id}/` | Retrieve / update / delete |

**Staff**
| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/staff/` | List / add staff members |
| GET/PATCH/DELETE | `/api/staff/{id}/` | Manage a staff member |
| GET/POST | `/api/staff/{id}/working-hours/` | View/set weekly working hours |
| GET/POST | `/api/staff/{id}/time-off/` | View/add time-off blocks |

**Public booking flow (no auth — customer-facing, scoped by business slug)**
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/public/{business_slug}/services/` | List active services |
| GET | `/api/public/{business_slug}/staff/?service={id}` | Staff offering a service |
| GET | `/api/public/{business_slug}/slots/?staff={id}&service={id}&date=YYYY-MM-DD` | Available time slots for a given day |
| POST | `/api/public/{business_slug}/bookings/` | Create a booking |

**Bookings (dashboard, auth required)**
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/bookings/?status=&staff=&date_from=&date_to=` | List/filter bookings |
| GET | `/api/bookings/{id}/` | Booking detail |
| PATCH | `/api/bookings/{id}/status/` | Update status (confirm/cancel/complete) |

---


### 2.4 Instructions

1. Don't use static content if there is anything which should be from backend
2. Create Readme using document and the update section if you do any updates on your own. Add Insturction of running the project locally as well.
3. Keep the code clean with good comments
4. Add the config.json to add the backend url
5. Create two enviornment files one for production and one for testing
6. Add the test cases as well covering everything and also in readme on steps to run it.
7. Create with latest angular, make standalone components and use latest things like (signals, model, etc)
8. Add the validators as well with proper messages in forms.


### 2.5 Design Reference
*https://www.figma.com/make/4ZwQo52ZCofH2KLwRDARHZ/Design-BookEase-SaaS-App?t=4WyE4IzX9B5bsrdg-1*
Use this to create a complete angular application. Few things
- Replace Bookease with Slotify
- There are some pages which doesn't have options to go back so make a clean and complete process
- Leave the process which are not covered with API endpoints

---

## 3. Frontend Implementation

This section documents the actual build: how to run it, how it's organized, and what
was changed or assumed relative to the instructions above.

### 3.1 Stack

- Angular 21 (standalone components, signals, `input()`/`model()`, functional guards
  and interceptors, zoneless change detection — no `zone.js`)
- Tailwind CSS v4 (`@tailwindcss/postcss`, theme tokens in `src/styles.css`)
- Karma + Jasmine for unit tests (Angular's traditional test runner; the newer
  Vitest-based `@angular/build:unit-test` builder that `ng new` now defaults to
  was swapped back out — see 3.5)

### 3.2 Running locally

Requires Node `^20.19.0 || ^22.12.0 || >=24.0.0` and the Django backend from
section 2 running somewhere reachable (defaults below assume `http://127.0.0.1:8000`).

```bash
npm install

# Point the app at your backend — see 3.3, no rebuild needed to change this later
# edit public/config.json: { "apiBaseUrl": "http://127.0.0.1:8000/api" }

npm start            # ng serve, http://localhost:4200
npm run build        # production build → dist/slotify
npm run watch        # development build, rebuilds on change
```

### 3.3 Environments & runtime config

Per instructions 4–5, there are two environment files plus a runtime config file,
each with a different job:

- `src/environments/environment.ts` — used for production builds. Just carries
  `production: true` and `configUrl: '/config.json'`.
- `src/environments/environment.development.ts` — used by `ng serve` / `ng build -c
  development`. Same shape, `production: false`.
- `public/config.json` — the actual backend URL (`apiBaseUrl`), fetched once at
  bootstrap by `ConfigService` via `provideAppInitializer` before anything else
  runs. Because it's a plain static file (not compiled into the bundle), ops can
  repoint the deployed app at a different backend by editing this one file on the
  server — no rebuild required.

### 3.4 Project structure

```
src/app/
  core/
    config/       ConfigService (runtime config.json loader)
    auth/         AuthService, guards (auth/owner/guest), JWT interceptor, token storage
    models/       TypeScript interfaces matching the backend's serializers exactly
  services/       One service per backend resource (business, services, staff,
                  bookings, public-booking) + a staff-schedule helper that derives
                  "on duty" status from working-hours + time-off
  utils/          validators, date/time helpers, ICS file builder, avatar initials/color
  components/     Shared presentational UI: button, modal, toast, confirm dialog,
                  status badge, avatar, spinner, empty state, stepper, field error
  features/
    marketing/    Public home page
    auth/         Login, register, post-register business onboarding (skippable)
    dashboard/    Sidebar shell + overview/services/staff/availability/bookings/settings
    public-booking/  No-auth booking wizard (routed steps) + its wizard store
```

### 3.5 Updates / deviations from the brief

Kept here so the "why" behind non-obvious choices isn't lost. Ordered roughly by
how surprising each one is.

- **Figma reference was unreachable.** `figma.com/make/...` links are interactive,
  JS-rendered prototypes that can't be scraped by a fetch. The user exported 13
  screenshots of the actual BookEase design instead, which is what every page here
  is based on (rebranded to Slotify).
- **Marketing fluff and fabricated content were removed**, per "don't use static
  content if it should be from backend" and explicit follow-up feedback: fake usage
  stats, testimonials, pricing tiers, star ratings, a "Pro plan" badge, a
  notifications bell, "Continue with Google", "Forgot password?", and a Blog/Docs
  footer — none of these have a backing endpoint or page.
- **Login authenticates with `username`, not email.** The design's login/register
  forms show "Email address," but `POST /api/auth/login/` is SimpleJWT's default
  `{username, password}`. The register form collects both a `username` and an
  `email` (the backend requires both, separately) instead of splitting a "Full
  name" field the User model doesn't have.
- **No first/last name on the authenticated user.** `GET /api/auth/me/` returns
  `{id, username, email, role, phone}` — no name fields. The dashboard greets by
  username. (The nested `StaffMember.user` object is a *different* shape that does
  include `first_name`/`last_name` — used for staff cards.)
- **Bookings are flat, not nested.** `Booking` carries `service`/`staff` as ids
  plus `service_name`/`staff_name` strings, not nested `Service`/`StaffMember`
  objects. Price/duration for a booking are looked up from a separately-fetched
  services map where needed (e.g. dashboard revenue, booking rows).
- **`PATCH /bookings/{id}/status/` returns only `{id, status}`**, not the full
  booking — the frontend merges that into its local copy instead of replacing it.
- **Public slots endpoint returns `{date, staff, service, slots: string[]}`** — a
  flat list of ISO start times, not objects with start/end. End time isn't needed
  client-side since the public booking-create endpoint only takes `start_time` and
  the backend computes the rest from the service's duration.
- **No "get business by slug" endpoint exists.** The public booking pages show only
  the slug in the header, not a business name/address, since there's nowhere to
  fetch that from without authenticating.
- **Staff creation payload uses `services` (ids) and requires `username`,
  `first_name`, `last_name`, `email`, `password`** — matching the real
  `StaffMemberRequest` schema (confirmed against the backend's OpenAPI schema at
  `/api/schema/` and by exercising the running API directly). `StaffMember.services`
  is a bare `number[]`, so pages needing a service's name cross-reference the
  services list fetched alongside it.
- **The "Working days / start–end time" step from the post-register screen was
  dropped from onboarding.** `Business` has no working-hours fields — that concept
  belongs to `StaffMember.WorkingHours` (per-staff), which lives on each staff
  card's "Availability" page instead. Onboarding only asks for what `Business`
  actually has: name, timezone, address — and it's skippable, fixing the original
  design's forced one-way gate after registration.
- **The public booking wizard is real routed steps** (`/book/:slug/service`,
  `/staff`, `/time`, `/details`, `/confirmation`), backed by a `BookingWizardStore`
  that mirrors state to `sessionStorage` per slug. This is what makes both the
  in-page back arrow *and* the browser's native back button move between steps
  without losing what's already been picked — the thing the original design's
  flow was missing.
- **"Any available" staff is real**, not decorative: it queries every eligible
  staff member's slots for the chosen date and offers the earliest per time slot,
  resolving to a concrete staff id only once the customer picks a time.
- **Times/dates are formatted with an explicit `en-US` locale**, not the browser
  default — otherwise the exact same code renders `1:00 PM` on one machine and
  `13:00` on another depending on OS locale, which doesn't match the design.
- **Switched off the `ng new` default test builder.** Angular 21 scaffolds new
  apps onto `@angular/build:unit-test` (Vitest) by default now; this project uses
  Karma + Jasmine instead per the stack decision, so the CLI generator's usual
  zero-config path was manually reassembled (`karma.conf` inline defaults, jasmine
  packages, `angular.json` test target pointed at `@angular-devkit/build-angular:karma`).
- **Angular CLI 21.x, not 22.x.** 22 hard-requires Node ≥24.15/26; 21 is the newest
  version that runs on this machine's Node without forcing an upgrade.

### 3.6 Testing

```bash
npm test                                          # interactive Karma run
ng test --watch=false --browsers=ChromeHeadless   # single run, CI-friendly
ng test --watch=false --code-coverage             # single run + coverage report in coverage/
```

Coverage focuses on logic worth protecting rather than every template: validators,
date/time and staff-scheduling utilities, `ConfigService`, `AuthService` (login/
register/refresh/session-restore), all three route guards, the JWT interceptor's
attach/refresh/retry behavior, every data service (request shape, response
unwrapping), the booking wizard's state store (including sessionStorage persistence
and per-slug isolation), and the login/register forms' validation.

All of the above was additionally exercised end-to-end against a live instance of
the Django backend (register → onboarding → dashboard → services/staff/
availability/bookings, and the full public booking flow including back-navigation
and the "Add to calendar" `.ics` download) — not just unit-tested in isolation.
