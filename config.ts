import { parseArgs, promptSecret } from "@std/cli";
import { load } from "@std/dotenv";
import { Config } from "./types.ts";

export const promptExit = (message: string | null, exitCode: number): never => {
  if (message) {
    console.log(message);
  }
  prompt("\nPress Enter to close...");
  Deno.exit(exitCode);
};

const checkENV = async (): Promise<Partial<Config>> => {
  await load({ export: true });
  const gitlabPAT = Deno.env.get("GITLAB_PAT");
  const gitlabURL = Deno.env.get("GITLAB_URL");
  const outFile = Deno.env.get("OUT_FILE");
  const timeRange = Deno.env.get("TIME_RANGE");
  const fetchMode = Deno.env.get("FETCH_MODE");
  // const projectIDs = Deno.env.get("PROJECT_IDS")?.split(",");
  const envParams: Partial<Config> = {
    gitlabPAT,
    gitlabURL,
    outFile,
    timeRange,
    fetchMode,
    // projectIDs,
  };
  return envParams;
};

const printHelp = () => {
  console.log(`
    Flags:
      --gitlabPAT:
          GitLab Personal Access Token - Required
          Alias: --pat
      --gitlabURL
          GitLab URL - Required
          Alias: --url
      --outFile,
          Output file name
          Alias: --out
          Default: gitlab_issues.json
      --timeRange,
          Time range for issues
          Alias: --range
          Default: week
          Options: week, month, year
      --fetchMode,
          Fetch mode for issues
          Alias: --mode
          Default: all_contributions
          Options: my_issues, all_contributions
      --help,
          Show this help message.
          alias: -h
  `);
  promptExit(null, 0);
};

export const generateConfig = async (): Promise<Config> => {
  const envConfig = await checkENV();

  const args = parseArgs(Deno.args, {
    string: ["gitlabPAT", "gitlabURL", "outFile", "timeRange", "fetchMode"],
    // collect: ["projectIDs"],
    boolean: ["help"],
    alias: {
      help: "h",
      gitlabPAT: "pat",
      gitlabURL: "url",
      outFile: "out",
      timeRange: "range",
      fetchMode: "mode",
      // projectIDs: "projects",
    },
  });

  if (args.help) {
    printHelp();
  }

  const combinedConfig: Partial<Config> = {
    gitlabPAT: args.gitlabPAT ?? envConfig.gitlabPAT,
    gitlabURL: args.gitlabURL ?? envConfig.gitlabURL,
    outFile: args.outFile ?? envConfig.outFile ?? "gitlab_issues.json",
    timeRange: args.timeRange ?? envConfig.timeRange ?? "week",
    fetchMode: args.fetchMode ?? envConfig.fetchMode ?? "all_contributions",
    // projectIDs: (args.projectIDs as string[]) ?? envConfig.projectIDs,
  };

  if (!combinedConfig.gitlabPAT) {
    const gitlabPAT = promptSecret("Enter your GitLab Personal Access Token:", {
      mask: "*",
    });
    if (!gitlabPAT) {
      promptExit("GitLab Personal Access Token is required.", 1);
    }
    combinedConfig.gitlabPAT = gitlabPAT as string;
  }

  if (!combinedConfig.gitlabURL) {
    const gitlabURL = prompt(
      "Enter your GitLab URL (e.g., https://gitlab.com):",
    );
    if (!gitlabURL) {
      promptExit("GitLab URL is required.", 1);
    }
    combinedConfig.gitlabURL = gitlabURL as string;
  }

  // if (!combinedConfig.projectIDs) {
  //   const projectIDsInput = prompt(
  //     "Enter GitLab Project IDs (comma-separated):",
  //   );
  //   if (!projectIDsInput) {
  //     console.error("At least one Project ID is required.");
  //     Deno.exit(1);
  //   }
  //   combinedConfig.projectIDs = projectIDsInput.split(",").map((id) =>
  //     id.trim()
  //   );
  // }

  const finalConfig: Config = combinedConfig as Config;

  console.log(`
Configuration:
  - GitLab URL: ${finalConfig.gitlabURL}
  - Output File: ${finalConfig.outFile}
  - Time Range: ${finalConfig.timeRange}
  - Fetch Mode: ${finalConfig.fetchMode}`);

  return finalConfig;
};
