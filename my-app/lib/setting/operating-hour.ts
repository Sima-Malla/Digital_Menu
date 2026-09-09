import { prisma } from "../prisma";

export type DaySchedule = {
  dayOfWeek: number; // 0=Sun..6=Sat
  day: string;
  open: string;
  close: string;
  isOpen: boolean;
};

export type SpecialHourEntry = {
  id: string;
  name: string;
  date: string;
  status: "LIMITED" | "CLOSED" | "EXTENDED";
  hours: string;
};

export type OperatingHoursData = {
  timezone: string;
  weeklySchedule: DaySchedule[];
  specialHours: SpecialHourEntry[];
};

// UI order is Monday..Sunday; DB dayOfWeek matches JS getDay() (0=Sunday)
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DAY_NAMES: Record<number, string> = {
  0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday",
  4: "Thursday", 5: "Friday", 6: "Saturday",
};

export async function getOperatingHoursData(businessId: bigint): Promise<OperatingHoursData> {
  const [business, hoursRows, specialRows] = await Promise.all([
    prisma.business.findUnique({ where: { id: businessId }, select: { timezone: true } }),
    prisma.businessHours.findMany({ where: { businessId } }),
    prisma.specialHours.findMany({ where: { businessId }, orderBy: { createdAt: "asc" } }),
  ]);

  const rowByDay = new Map(hoursRows.map((r) => [r.dayOfWeek, r]));

  const weeklySchedule: DaySchedule[] = DISPLAY_ORDER.map((dayOfWeek) => {
    const row = rowByDay.get(dayOfWeek);
    return {
      dayOfWeek,
      day: DAY_NAMES[dayOfWeek],
      open: row?.openTime ?? "",
      close: row?.closeTime ?? "",
      isOpen: row?.isOpen ?? true, // sensible default for a day never configured yet
    };
  });

  const specialHours: SpecialHourEntry[] = specialRows.map((r) => ({
    id: r.id.toString(),
    name: r.name,
    date: r.date,
    status: r.status as "LIMITED" | "CLOSED" | "EXTENDED",
    hours: r.hours ?? "--",
  }));

  return {
    timezone: business?.timezone ?? "America/New_York",
    weeklySchedule,
    specialHours,
  };
}