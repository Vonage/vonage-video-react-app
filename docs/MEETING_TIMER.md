# Time Left and the End of a Meeting

> To return to the main README, see [README](../README.md).

## The meeting timer

In the last five minutes of a scheduled meeting, an amber timer in the toolbar shows how much time is left, next to the
leave button, for example **4 min 52 sec left** or **45 sec left**. On a phone it shows in the header at the top of the
screen instead. Everyone in the meeting sees it. The time follows the server's clock, so a wrong clock on your device
does not change it.

Before the last five minutes there is no timer. Meetings without a schedule have no end, so they never show it.

## The end-of-meeting warning

When the timer appears, a message tells anonymous users that the meeting is about to finish. People who can extend the meeting
see the **Meeting ending** dialog instead (see [Adding time](#adding-time)). Either shows once. Nobody can join the
meeting after its scheduled end.

## The end of the meeting

At the scheduled end, by the server's clock, every browser in the meeting leaves it the same way the leave button does
and opens the goodbye page with **This meeting has ended**. The meeting tokens expire at the same time. Meetings without
a schedule are not affected.

## Adding time

Only signed-in people can extend a meeting. Where sign-in is turned off, everyone can.

- When the timer appears, the **Meeting ending** dialog says **The current meeting is about to end.** Select **Got it**
  to close it, or **Extend** to choose **20 min**, **40 min** or **60 min** and then **Confirm**. **Cancel** goes back.
- At any time during the meeting, **Settings** > **Meeting** shows **Ongoing meeting**: a bar from the start time to
  the end time, filled up to now, and the time left. **Extend** there offers the same choices.
- A meeting can be extended by 120 minutes in total. Choices that would go past that limit are greyed out. Once the
  limit is reached, the dialog and the tab say **This meeting cannot be extended further.**
- Anonymous users see the bar and **Sign in to extend this meeting.** Meetings without a schedule have no **Meeting** tab.
- When anyone extends the meeting, everyone in it sees a short message with the new end time, and their timer and the
  end of the meeting follow it. Nobody is disconnected and nobody has to rejoin.
- Someone who opens the meeting link for the first time after an extension still sees the original end time, and
  cannot join after the original end.

The choices are set on the server, and the 120-minute limit is fixed; see [Configuration](./CONFIGURATION.md).
