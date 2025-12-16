import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  formatISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { promptExit } from "./config.ts";

export const getDateRange = (
  timeRange: string,
): { startDate: string; endDate: string } => {
  const today = new Date();
  let startDate: Date | string = today;
  let endDate: Date | string = today;

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
      promptExit("Invalid time range specified.", 1);
  }

  startDate = formatISO(startDate);
  endDate = formatISO(endDate);

  console.log(`
Date Range:
  From: ${startDate}
  To:   ${endDate}`);

  return { startDate, endDate };
};
