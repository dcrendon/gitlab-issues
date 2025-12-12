import { generateConfig } from "./config.ts";
import { getDateRange } from "./dates.ts";
import { getIssues, getUserID } from "./gitlab.ts";

const main = async () => {
  const config = generateConfig();

  const headers = {
    "PRIVATE-TOKEN": config.gitlabPAT!,
  };

  const userID = await getUserID(config.gitlabURL!, headers);
  console.log(`Authenticated as User ID: ${userID}`);

  const { startDate, endDate } = getDateRange(config.timeRange!);

  const issues = await getIssues(
    config.gitlabURL,
    headers,
    startDate,
    endDate,
    config.projectIDs,
  );
  console.log(issues);
};

if (import.meta.main) {
  main();
}
