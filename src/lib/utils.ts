import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// src/lib/slots.ts
// Utility function to generate time slots for a day
export function generateTimeSlots(
  open = "10:00",
  close = "16:30",
  interval = 30
): string[] {
  console.log("[generateTimeSlots] called with", { open, close, interval });
  const [oH, oM] = open.split(":").map(Number);
  const [cH, cM] = close.split(":").map(Number);

  const slots: string[] = [];
  let h = oH,
    m = oM;

  while (h < cH || (h === cH && m <= cM)) {
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    m += interval;
    if (m >= 60) {
      h += 1;
      m -= 60;
    }
  }
  return slots;
}

export function parseDuration(text?: string): number {
  if (!text) return 30;

  const cleaned = text
    .toLowerCase()
    .replace(/mins?|minutes?/g, "m")
    .replace(/hours?|hrs?/g, "h")
    .replace(/\s+/g, "");

  const hours = Number((cleaned.match(/(\d+)h/) || [])[1] || 0);
  const mins = Number((cleaned.match(/(\d+)m/) || [])[1] || 0);

  const total = hours * 60 + mins;
  return total || 30;
}
