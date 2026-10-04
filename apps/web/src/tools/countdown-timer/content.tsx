import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Pick a preset or set hours, minutes and seconds.", "Press Start. The remaining time also shows in the browser tab.", "Or switch to “Countdown to a date” for an event — it's remembered in this browser."],
  sections: [
    {
      heading: "Accurate in the background",
      body: <p>The timer is based on the real end time rather than counting ticks, so it stays accurate even when the tab is in the background and browsers slow down timers. Keep the tab open — closing it stops the timer.</p>,
    },
    {
      heading: "Presets and alerts",
      body: (
        <p>
          One click starts 1, 5 or 10 minutes, a 25-minute Pomodoro, a 5-minute break or an hour. You can also type up to hours, minutes and seconds yourself. When time is up the timer plays a short
          tone (turn off “Play a sound when time is up” for quiet rooms), the display changes colour, and the browser tab title changes to “⏰ Time&apos;s up”, so you notice even when working in
          another tab.
        </p>
      ),
    },
    {
      heading: "Counting down to a date",
      body: (
        <p>
          Switch to <strong>Countdown to a date</strong> to see the days, hours and minutes left until an exam, a trip, a launch or a tax deadline. The date is remembered in this browser, so the
          countdown is still there when you come back tomorrow.
        </p>
      ),
    },
    {
      heading: "The Pomodoro technique",
      body: <p>Work for 25 minutes, take a 5-minute break, and after four rounds take a longer 15–30 minute break. Short, focused intervals make it easier to start difficult tasks and avoid fatigue.</p>,
    },
  ],
  faqs: [
    { q: "Why didn't I hear the alarm?", a: "Browsers may block sound until you've interacted with the page, and your device may be muted. The timer also turns red and updates the tab title." },
    { q: "Does it work offline?", a: "Yes, once the page has loaded." },
    { q: "Can I use it for presentations or exams?", a: "Yes. Make the browser full screen to show a large timer to a room. Keep the tab open: closing it stops the timer." },
    { q: "Is anything stored?", a: "Only the date you count down to, saved in this browser so it's there next time. Nothing is sent to a server." },
  ],
};

export default content;
