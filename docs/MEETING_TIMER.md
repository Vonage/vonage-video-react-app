# Time Left and the End of a Meeting

> To return to the main README, see [README](../README.md).

## The meeting timer

In the last five minutes of a scheduled meeting, an amber timer in the toolbar shows how much time is left, next to the
leave button, for example **4 min 52 sec left** or **45 sec left**. On a phone it shows in the header at the top of the
screen instead. Everyone in the meeting sees it. The time follows the server's clock, so a wrong clock on your device
does not change it.

Before the last five minutes there is no timer. Meetings without a schedule have no end, so they never show it.

## The end-of-meeting warning

When the timer appears, a message tells everyone that the meeting is about to finish. The message shows once. Nobody
can join the meeting after its scheduled end.

## The end of the meeting

At the scheduled end, by the server's clock, every browser in the meeting leaves it the same way the leave button does
and opens the goodbye page with **This meeting has ended**. The meeting tokens expire at the same time. Meetings without
a schedule are not affected.

## Adding time

When the timer appears, it opens **Extend meeting** by itself, and selecting the timer opens it again. It lists
**+20 min**, **+40 min** and **+60 min**, each with the time the meeting would then end. Choose an option and select
**Extend**, or select **Not now** to close it.

- A meeting can be extended by 120 minutes in total. Options that would go past that limit are greyed out.
- Once the limit is reached, the timer shows a lock, the popover says so, and it no longer opens by itself.
- When anyone extends the meeting, everyone in it sees a short message with the new end time, and their timer
  follows it. Nobody is disconnected and nobody has to rejoin.
- Someone who opens the meeting link for the first time after an extension still sees the original end time, and
  cannot join after the original end.

The options are set on the server, and the 120-minute limit is fixed; see [Configuration](./CONFIGURATION.md).
