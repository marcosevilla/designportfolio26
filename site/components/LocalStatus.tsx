"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "./Icons";

const SF_LAT = 37.7749;
const SF_LON = -122.4194;
const TIME_TICK_MS = 30_000;
const WEATHER_REFRESH_MS = 15 * 60 * 1000;

type WeatherData = {
  temp: number;
  code: number;
  isDay: boolean;
};

type Category = "clear" | "cloudy" | "rain" | "snow";

// WMO weather code → simplified category. Reference:
// https://open-meteo.com/en/docs (look for `weathercode` mapping)
function categorize(code: number): Category {
  if (code === 0 || code === 1) return "clear";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95) return "rain";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  return "cloudy"; // 2, 3, 45, 48 + fallback
}

const ICON_SIZE = 13;

function WeatherGlyph({ code, isDay }: { code: number; isDay: boolean }) {
  const cat = categorize(code);
  if (cat === "clear") {
    return isDay ? <SunIcon size={ICON_SIZE} /> : <MoonIcon size={ICON_SIZE} />;
  }
  if (cat === "rain") {
    return (
      <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 14a4 4 0 0 0 0-8 6 6 0 0 0-11.5 2 4 4 0 0 0 .5 8z" />
        <line x1="8" y1="18" x2="8" y2="21" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="16" y1="18" x2="16" y2="21" />
      </svg>
    );
  }
  if (cat === "snow") {
    return (
      <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 14a4 4 0 0 0 0-8 6 6 0 0 0-11.5 2 4 4 0 0 0 .5 8z" />
        <circle cx="8" cy="20" r="0.7" fill="currentColor" stroke="none" />
        <circle cx="12" cy="20.5" r="0.7" fill="currentColor" stroke="none" />
        <circle cx="16" cy="20" r="0.7" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  // cloudy / fog / fallback
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19a4.5 4.5 0 0 0 0-9 7 7 0 0 0-13.5 2.5 4.5 4.5 0 0 0 .5 9z" />
    </svg>
  );
}

function formatTime(now: Date): string {
  // `timeZoneName: "short"` resolves to PST in winter, PDT in summer —
  // matches macOS menu-bar behavior and stays accurate year-round.
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Los_Angeles",
    timeZoneName: "short",
  }).format(now);
}

export default function LocalStatus() {
  const [now, setNow] = useState<Date | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    setNow(new Date());
    const tick = setInterval(() => setNow(new Date()), TIME_TICK_MS);

    let cancelled = false;
    const fetchWeather = async () => {
      try {
        const url =
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${SF_LAT}&longitude=${SF_LON}` +
          `&current=temperature_2m,weather_code,is_day` +
          `&temperature_unit=fahrenheit&timezone=America/Los_Angeles`;
        const res = await fetch(url);
        if (!res.ok || cancelled) return;
        const json = await res.json();
        const c = json?.current;
        if (!c || cancelled) return;
        setWeather({
          temp: Math.round(c.temperature_2m),
          code: c.weather_code,
          isDay: c.is_day === 1,
        });
      } catch {
        // Network/parse failure — leave the time visible without weather
      }
    };
    fetchWeather();
    const wTimer = setInterval(fetchWeather, WEATHER_REFRESH_MS);

    return () => {
      cancelled = true;
      clearInterval(tick);
      clearInterval(wTimer);
    };
  }, []);

  if (!now) return null;

  return (
    <div
      className="flex items-center gap-1.5 whitespace-nowrap"
      style={{
        fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
        fontSize: "11px",
        lineHeight: "15px",
        color: "var(--color-fg-tertiary)",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {weather && (
        <>
          <WeatherGlyph code={weather.code} isDay={weather.isDay} />
          <span>{weather.temp}°F</span>
          <span aria-hidden>·</span>
        </>
      )}
      <span>{formatTime(now)}</span>
    </div>
  );
}
