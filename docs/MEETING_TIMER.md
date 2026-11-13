# Time Left and the End of a Meeting

> To return to the main README, see [README](../README.md).

## The meeting timer

In the last five minutes of a scheduled meeting, an amber timer in the toolbar shows how much time is left, next to the
leave button, for example **4 min 52 sec left** or **45 sec left**. On a phone it shows in the header at the top of the
screen instead. Everyone in the meeting sees it. The time follows the server's clock, so a wrong clock on your device
does not change it.

Before the last five minutes there is no timer. Meetings without a schedule have no end, so they never show it.

## The end-of-meeting warning

When the timer appears, a message tells everyone that the meeting is about to finish. The room owns the warning, so remounting the timer or changing the language does not repeat it. Nobody
can join the meeting after its scheduled end.

## The end of the meeting

At the scheduled end, by the server's clock, every browser in the meeting leaves it the same way the leave button does
and opens the goodbye page with **This meeting has ended**. The meeting tokens expire at the same time. Meetings without
a schedule are not affected.

The goodbye page reads the schedule from its URL session key and hides re-entry once the meeting has ended, including
when the page is reopened later. Session content remains available there.

Departure depends on each browser executing the client code. Token expiry prevents later connections; it does not
terminate an established connection. Server-enforced termination through the VCR scheduler is tracked separately in
[VIDSOL-1723](https://jira.vonage.com/browse/VIDSOL-1723).
