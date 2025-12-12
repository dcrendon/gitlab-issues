import { parseArgs, promptSecret } from "@std/cli";

export interface Config {
  gitlabPAT: string;
  gitlabURL: string;
  outFile: string;
  timeRange: string;
  fetchMode: string;
  projectIDs: string[];
}

// const checkENV = async () => {
//   await load({ export: true });
//   const gitlabPAT = Deno.env.get("GITLAB_PAT");
//   const gitlabURL = Deno.env.get("GITLAB_URL");
//   const outFile = Deno.env.get("OUT_FILE");
//   const timeRange = Deno.env.get("TIME_RANGE");
//   const fetchMode = Deno.env.get("FETCH_MODE");
//   const projectIDs = Deno.env.get("PROJECT_IDS")?.split(",");

//   return { gitlabPAT, gitlabURL, outFile, timeRange, fetchMode, projectIDs };
// };

export const generateConfig = (): Config => {
  // const config: Config = {
  //   gitlabPAT: "",
  //   gitlabURL: "",
  //   outFile: "",
  //   timeRange: "",
  //   fetchMode: "",
  //   projectIDs: [],
  // };

  // const envConfig = await checkENV();

  // for (const key in envConfig) {
  //   if (key in config) {
  //     config[key] = envConfig[key];
  //   }
  // }

  const args = parseArgs(Deno.args, {
    string: ["gitlabPAT", "gitlabURL", "outFile", "timeRange", "fetchMode"],
    collect: ["projectIDs"],
    boolean: ["help"],
    alias: {
      help: "h",
      gitlabPAT: "pat",
      gitlabURL: "url",
      outFile: "out",
      timeRange: "range",
      fetchMode: "mode",
      projectIDs: "projects",
    },
    default: {
      outFile: "gitlab_issues.json",
      timeRange: "week",
      fetchMode: "all_contributions",
    },
  });

  if (args.help) {
    console.log(`
    Flags:
      --gitlabPAT:
          GitLab Personal Access Token - Required
          Alias: --pat
      --gitlabURL
          GitLab URL - Required
          Alias: --url
      --projectIDs
          GitLab Project IDs (comma-separated) - Required
          Alias: --projects
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
          Options: my_contributions, all_contributions
      --help,
          Show this help message.
          alias: -h
    `);
    Deno.exit(0);
  }

  if (!args.gitlabPAT) {
    const gitlabPAT = promptSecret("Enter your GitLab Personal Access Token:", {
      mask: "*",
    });
    if (!gitlabPAT) {
      console.error("GitLab Personal Access Token is required.");
      Deno.exit(1);
    }
    args.gitlabPAT = gitlabPAT;
  }

  if (!args.gitlabURL) {
    const gitlabURL = prompt(
      "Enter your GitLab URL (e.g., https://gitlab.com):",
    );
    if (!gitlabURL) {
      console.error("GitLab URL is required.");
      Deno.exit(1);
    }
    args.gitlabURL = gitlabURL;
  }

  if (!args.projectIDs) {
    const projectIDsInput = prompt(
      "Enter GitLab Project IDs (comma-separated):",
    );
    if (!projectIDsInput) {
      console.error("At least one Project ID is required.");
      Deno.exit(1);
    }
    args.projectIDs = projectIDsInput.split(",").map((id) => id.trim());
  }

  console.log("Configuration:");
  console.log(`GitLab URL: ${args.gitlabURL}`);
  console.log(`Output File: ${args.outFile}`);
  console.log(`Time Range: ${args.timeRange}`);
  console.log(`Fetch Mode: ${args.fetchMode}`);
  console.log(`Project IDs: ${args.projectIDs.join(", ")}`);

  return args as Config;
};
