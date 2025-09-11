"use client";
import { useEffect, useState } from "react";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
export default function Clock({
  className = "",
}: {
  className?: string;
}) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);
  if (!now) return <span className={className} />;
  const day = weekdays[now.getDay()];
  const date = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  return (
    <span className={className} suppressHydrationWarning>
      {`${day} ${date} – ${time}`}
    </span>
  );
}

