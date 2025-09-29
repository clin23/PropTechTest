import type { PropertyEvent } from "../../../../../types/property";

export function sortPropertyEvents(events: PropertyEvent[] | undefined): PropertyEvent[] {
  if (!events?.length) {
    return [];
  }

  return events
    .slice()
    .sort((a, b) => {
      const aTime = new Date(a.date ?? "").getTime();
      const bTime = new Date(b.date ?? "").getTime();

      if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
      if (Number.isNaN(aTime)) return 1;
      if (Number.isNaN(bTime)) return -1;

      return aTime - bTime;
    });
}
