import { generateConfig } from "./config.ts";
import { getDateRange } from "./dates.ts";
import { gitlabIssues } from "./gitlab.ts";

const main = async () => {
  const config = await generateConfig();

  const headers = {
    "PRIVATE-TOKEN": config.gitlabPAT,
  };

  const { startDate, endDate } = getDateRange(config.timeRange);

  const issues = await gitlabIssues(
    config.gitlabURL,
    headers,
    startDate,
    endDate,
    config.fetchMode,
  );

  await Deno.writeTextFile(
    config.outFile,
    JSON.stringify(issues, null, 2),
  );
  console.log(`\nIssue data written to ${config.outFile}`);

  prompt("\nPress Enter to close...");
  Deno.exit(0);
};

if (import.meta.main) {
  main();
}
