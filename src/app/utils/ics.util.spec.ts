import { buildIcsFile } from './ics.util';

describe('buildIcsFile', () => {
  it('produces a valid VCALENDAR block with the event fields', () => {
    const ics = buildIcsFile({
      title: 'Haircut — Slotify',
      description: 'Bring a reference photo',
      location: '1234 Oak Street',
      start: '2026-07-20T09:00:00Z',
      end: '2026-07-20T09:30:00Z',
    });

    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('END:VCALENDAR');
    expect(ics).toContain('SUMMARY:Haircut — Slotify');
    expect(ics).toContain('DESCRIPTION:Bring a reference photo');
    expect(ics).toContain('LOCATION:1234 Oak Street');
    expect(ics).toContain('DTSTART:20260720T090000Z');
    expect(ics).toContain('DTEND:20260720T093000Z');
  });

  it('omits DESCRIPTION/LOCATION lines when not provided', () => {
    const ics = buildIcsFile({
      title: 'Haircut',
      start: '2026-07-20T09:00:00Z',
      end: '2026-07-20T09:30:00Z',
    });
    expect(ics).not.toContain('DESCRIPTION:');
    expect(ics).not.toContain('LOCATION:');
  });
});
