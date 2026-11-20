import { renderHook } from '@testing-library/react';
import { expect, it } from 'vitest';
import useScheduleTabTitle from './useScheduleTabTitle';

it.each([
  {
    meetingName: undefined,
    countdownTitle: '1:05',
    tickingTitle: '1:04',
    startedTitle: '● Started',
  },
  {
    meetingName: 'Design review',
    countdownTitle: '1:05 · Design review',
    tickingTitle: '1:04 · Design review',
    startedTitle: '● Started · Design review',
  },
])(
  'updates and restores the schedule tab title for $meetingName',
  ({ meetingName, countdownTitle, tickingTitle, startedTitle }) => {
    document.title = 'Original tab title';
    const scheduleWindow = { startsAtMs: 100_000, endsAtMs: 200_000 };
    const { rerender, unmount } = renderHook(
      (props: Parameters<typeof useScheduleTabTitle>[0]) => useScheduleTabTitle(props),
      {
        initialProps: {
          meetingName,
          scheduleStatus: { ...scheduleWindow, kind: 'withinFiveMinutes', secondsLeft: 65 },
        },
      }
    );

    expect(document.title).toBe(countdownTitle);

    rerender({
      meetingName,
      scheduleStatus: { ...scheduleWindow, kind: 'withinFiveMinutes', secondsLeft: 64 },
    });
    expect(document.title).toBe(tickingTitle);

    rerender({ meetingName, scheduleStatus: { ...scheduleWindow, kind: 'started' } });
    expect(document.title).toBe(startedTitle);

    rerender({ meetingName, scheduleStatus: { ...scheduleWindow, kind: 'ended' } });
    expect(document.title).toBe('Original tab title');

    rerender({ meetingName, scheduleStatus: { ...scheduleWindow, kind: 'started' } });
    unmount();
    expect(document.title).toBe('Original tab title');
  }
);
