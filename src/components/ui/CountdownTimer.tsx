
"use client";

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  endTime: string; // ISO string or parsable date string
  onEnd?: () => void;
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ endTime, onEnd, className }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(endTime) - +new Date();
    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMilliseconds: 0,
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        totalMilliseconds: difference,
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Initial calculation for client side, ensuring it's up-to-date immediately
    setTimeLeft(calculateTimeLeft());

    const intervalId = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.totalMilliseconds <= 0) {
        if (onEnd) {
          onEnd();
        }
        clearInterval(intervalId); // Stop timer when time is up
      }
    }, 1000);

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [endTime, onEnd]); // Rerun effect if endTime or onEnd changes

  if (!isClient) {
    // To avoid hydration mismatch, render a placeholder or null on the server.
    return (
      <div className={cn("flex items-center text-muted-foreground", className)}>
        <Clock className="w-4 h-4 mr-2" />
        <span>Loading...</span>
      </div>
    );
  }

  const timeIsUp = timeLeft.totalMilliseconds <= 0;
  // Check if under an hour: days and hours are 0, and it's not yet ended
  const isUnderAnHour = !timeIsUp && timeLeft.days === 0 && timeLeft.hours === 0;

  let timerText;
  if (timeIsUp) {
    timerText = "Ended";
  } else {
    const parts = [];
    if (timeLeft.days > 0) {
      parts.push(`${timeLeft.days}d`);
    }
    // Show hours if days > 0 or if hours > 0 (even if days are 0)
    if (timeLeft.hours > 0 || timeLeft.days > 0) {
      parts.push(`${timeLeft.hours}h`);
    }
    // Always show minutes and seconds if time is not up
    parts.push(`${timeLeft.minutes}m`);
    parts.push(`${timeLeft.seconds}s`);
    timerText = parts.join(' : ');
  }

  return (
    <div
      className={cn(
        "flex items-center",
        timeIsUp ? "text-red-500 font-semibold" // Red if ended
        : isUnderAnHour ? "text-red-500 font-semibold" // Red if under an hour and not ended
        : "text-foreground", // Default color otherwise
        className
      )}
    >
      <Clock className="w-4 h-4 mr-2" />
      {timerText}
    </div>
  );
};
