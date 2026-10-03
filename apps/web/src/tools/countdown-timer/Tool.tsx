"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox, Input } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { useStoredState } from "@/hooks/use-stored-state";
import { cn } from "@/lib/cn";

const PRESETS = [
  { label: "1 min", s: 60 },
  { label: "5 min", s: 300 },
  { label: "10 min", s: 600 },
  { label: "Pomodoro 25", s: 1500 },
  { label: "Break 5", s: 300 },
  { label: "1 hour", s: 3600 },
];

function fmt(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return d ? `${d}d ${p(h)}:${p(m)}:${p(s)}` : h ? `${h}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`;
}

function beep() {
  try {
    const ctx = new AudioContext();
    [0, 0.35, 0.7].forEach((t) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.25);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + 0.3);
    });
  } catch {
    // Audio unavailable; the visual alert still shows.
  }
}

export default function CountdownTimer() {
  const [mode, setMode] = useState<"timer" | "date">("timer");
  const [h, setH] = useState(0);
  const [m, setM] = useState(25);
  const [s, setS] = useState(0);
  const [running, setRunning] = useState(false);
  const [endAt, setEndAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(25 * 60 * 1000);
  const [done, setDone] = useState(false);
  const [sound, setSound] = useState(true);
  const [target, setTarget] = useStoredState("countdown-target", { at: "", label: "" });
  const [now, setNow] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);

  // Tick using absolute time so the timer stays accurate in background tabs.
  useEffect(() => {
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (running && endAt) {
        const left = endAt - t;
        setRemaining(left);
        if (left <= 0) {
          setRunning(false);
          setEndAt(null);
          setDone(true);
          if (sound) beep();
          document.title = "⏰ Time's up";
        } else {
          document.title = `${fmt(left)} · Timer`;
        }
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [running, endAt, sound]);

  useEffect(() => {
    const original = document.title;
    return () => {
      document.title = original;
    };
  }, []);

  const setDuration = (secs: number) => {
    setRunning(false);
    setEndAt(null);
    setDone(false);
    setH(Math.floor(secs / 3600));
    setM(Math.floor((secs % 3600) / 60));
    setS(secs % 60);
    setRemaining(secs * 1000);
  };

  const total = (h * 3600 + m * 60 + s) * 1000;

  const targetMs = target.at ? new Date(target.at).getTime() : NaN;
  const dateLeft = Number.isFinite(targetMs) && now !== null ? targetMs - now : null;

  return (
    <div ref={box} className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6 [&:fullscreen]:justify-center [&:fullscreen]:bg-bg">
      <Segmented label="Mode" value={mode} onChange={setMode} options={[{ value: "timer", label: "Timer" }, { value: "date", label: "Countdown to a date" }]} />
      {mode === "timer" ? (
        <>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button key={p.label} type="button" onClick={() => setDuration(p.s)} className="h-9 rounded-full border border-border px-3 text-sm hover:bg-surface-2">{p.label}</button>
            ))}
          </div>
          {!running && !endAt && (
            <div className="flex flex-wrap items-end gap-3">
              {([["Hours", h, setH, 99], ["Minutes", m, setM, 59], ["Seconds", s, setS, 59]] as const).map(([label, v, set, max]) => (
                <label key={label} className="flex flex-col gap-1 text-sm font-medium">
                  {label}
                  <Input type="number" min={0} max={max} value={v} onChange={(e) => { const x = Math.min(max, Math.max(0, Number(e.target.value) || 0)); set(x); setRemaining(((label === "Hours" ? x : h) * 3600 + (label === "Minutes" ? x : m) * 60 + (label === "Seconds" ? x : s)) * 1000); setDone(false); }} className="w-24 text-center tabular-nums" />
                </label>
              ))}
            </div>
          )}
          <p className={cn("text-center font-mono text-6xl font-semibold tabular-nums tracking-tight sm:text-8xl", done && "text-danger")} role="timer" aria-live="off">
            {fmt(remaining)}
          </p>
          {done && <p className="text-center text-lg font-medium text-danger" role="alert">Time&apos;s up!</p>}
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-3" aria-hidden>
            <div className="h-full rounded-full bg-brand transition-[width] duration-200" style={{ width: `${total ? Math.max(0, Math.min(100, (remaining / total) * 100)) : 0}%` }} />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {running ? (
              <Button size="lg" variant="secondary" onClick={() => { setRunning(false); setEndAt(null); }}><Pause aria-hidden /> Pause</Button>
            ) : (
              <Button size="lg" disabled={remaining <= 0 && total <= 0} onClick={() => { const base = remaining > 0 && !done ? remaining : total; setRemaining(base); setEndAt(Date.now() + base); setRunning(true); setDone(false); }}><Play aria-hidden /> {remaining < total && remaining > 0 && !done ? "Resume" : "Start"}</Button>
            )}
            <Button size="lg" variant="ghost" onClick={() => setDuration(h * 3600 + m * 60 + s)}><RotateCcw aria-hidden /> Reset</Button>
            <Button size="lg" variant="ghost" onClick={() => box.current?.requestFullscreen?.()} aria-label="Full screen"><Maximize2 aria-hidden /></Button>
          </div>
          <Checkbox label="Play a sound when time is up" checked={sound} onChange={(e) => setSound(e.target.checked)} className="justify-center" />
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium">Event name<Input value={target.label} onChange={(e) => setTarget({ ...target, label: e.target.value })} placeholder="e.g. Diwali, exam, launch" maxLength={60} /></label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">Date and time<Input type="datetime-local" value={target.at} onChange={(e) => setTarget({ ...target, at: e.target.value })} /></label>
          </div>
          {dateLeft !== null ? (
            <div className="text-center" aria-live="off">
              {target.label && <p className="text-lg font-medium text-muted">{dateLeft >= 0 ? `Until ${target.label}` : `Since ${target.label}`}</p>}
              <p className="font-mono text-5xl font-semibold tabular-nums tracking-tight sm:text-7xl">{fmt(Math.abs(dateLeft))}</p>
              <p className="mt-2 text-sm text-muted">{new Date(targetMs).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })}</p>
            </div>
          ) : (
            <p className="text-center text-muted">Choose a date and time to start the countdown. It&apos;s remembered in this browser.</p>
          )}
          <div className="flex justify-center"><Button variant="ghost" onClick={() => box.current?.requestFullscreen?.()}><Maximize2 aria-hidden /> Full screen</Button></div>
        </>
      )}
    </div>
  );
}
