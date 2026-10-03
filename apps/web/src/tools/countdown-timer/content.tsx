import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Pick a preset or set hours, minutes and seconds.", "Press Start. The remaining time also shows in the browser tab.", "Or switch to “Countdown to a date” for an event — it's remembered in this browser."],
  sections: [
    {
      heading: "Accurate in the background",
      body: <p>The timer is based on the real end time rather than counting ticks, so it stays accurate even when the tab is in the background and browsers slow down timers. Keep the tab open — closing it stops the timer.</p>,
    },
    {
      heading: "The Pomodoro technique",
      body: <p>Work for 25 minutes, take a 5-minute break, and after four rounds take a longer 15–30 minute break. Short, focused intervals make it easier to start difficult tasks and avoid fatigue.</p>,
    },
  ],
  faqs: [
    { q: "Why didn't I hear the alarm?", a: "Browsers may block sound until you've interacted with the page, and your device may be muted. The timer also turns red and updates the tab title." },
    { q: "Does it work offline?", a: "Yes, once the page has loaded." },
  ],
};

export default content;
