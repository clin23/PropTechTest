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
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const day = weekdays[now.getDay()];
  const date = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  return <span className={className}>{`${day} ${date} – ${time}`}</span>;
}

