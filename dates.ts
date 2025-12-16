import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  formatISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";

export const getDateRange = (
  timeRange: string,
): { startDate: string; endDate: string } => {
  const today = new Date();
  let startDate: Date | string;
  let endDate: Date | string;

  switch (timeRange) {
    case "week": {
      startDate = startOfWeek(today);
      endDate = endOfWeek(today);
      break;
    }
    case "month":
      startDate = startOfMonth(today);
      endDate = endOfMonth(today);
      break;
    case "year":
      startDate = startOfYear(today);
      endDate = endOfYear(today);
      break;
    default:
      console.error("Invalid time range specified.");
      Deno.exit(1);
  }

  startDate = formatISO(startDate);
  endDate = formatISO(endDate);

  console.log(`Date Range: `);
  console.log(`From: ${startDate}`);
  console.log(`To: ${endDate}`);

  return { startDate, endDate };
};
