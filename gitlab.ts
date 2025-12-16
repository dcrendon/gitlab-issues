import { GitlabIssue } from "./types.ts";

const getPaginatedResults = async (
  gitlabURL: string,
  headers: Record<string, string>,
  params: { [key: string]: string | number } = {},
) => {
  let page = 1;
  const perPage = 100;
  const allIssues = [];

  while (true) {
    params["page"] = page;
    params["per_page"] = perPage;
    try {
      const url = new URL(gitlabURL);

      const searchParams = new URLSearchParams();
      Object.keys(params).forEach((key) => {
        searchParams.append(key, String(params[key]));
      });
      url.search = searchParams.toString();

      const response = await fetch(url.toString(), {
        headers,
      });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch paginated results: ${response.statusText}`,
        );
      }
      const data = await response.json();
      if (data.length === 0) {
        break;
      }
      allIssues.push(...data);
      page++;
    } catch (error) {
      console.error(`${error}`);
      break;
    }
  }

  return allIssues;
};

const getUserID = async (
  gitlabURL: string,
  headers: Record<string, string>,
): Promise<number> => {
  console.log("Fetching user information...");

  const response = await fetch(`${gitlabURL}/api/v4/user`, {
    headers,
  });
  if (!response.ok) {
    console.error(`Failed to fetch user information: ${response.statusText}`);
    Deno.exit(1);
  }
  const data = await response.json();

  console.log(`User ID fetched: ${data.id}`);

  return data.id;
};

const getProjects = async (
  gitlabURL: string,
  headers: Record<string, string>,
  userID: number,
) => {
  console.log("Fetching projects...");

  // const projectsURL = `${gitlabURL}/api/v4/projects`;
  // const projects = await getPaginatedResults(projectsURL, headers);

  const projectsURL = `${gitlabURL}/api/v4/users/${userID}/contributed_projects`;
  const projects = await getPaginatedResults(projectsURL, headers);

  console.log(`Fetched ${projects.length} projects.`);

  return projects;
};

export const gitlabIssues = async (
  gitlabURL: string,
  headers: Record<string, string>,
  startDate: string,
  endDate: string,
  fetchMode: string,
) => {
  const issuesToProcess = new Map<number, GitlabIssue>();
  const finalIssues = [];
  const userID = await getUserID(gitlabURL, headers);
  const projects = await getProjects(gitlabURL, headers, userID);
  const params = {
    scope: "all",
  };

  for (const project of projects) {
    const projectID = project.id;
    const projectURL = `${gitlabURL}/api/v4/projects/${projectID}/issues`;

    if (fetchMode === "my_issues") {
      const baseParams = {
        ...params,
        created_after: startDate,
        created_before: endDate,
      };
      const assignedParams = { ...baseParams, assignee_id: userID };
      const createdParams = { ...baseParams, author_id: userID };
      const assignedIssues: GitlabIssue[] = await getPaginatedResults(
        projectURL,
        headers,
        assignedParams,
      );
      const createdIssues: GitlabIssue[] = await getPaginatedResults(
        projectURL,
        headers,
        createdParams,
      );
      const combinedIssues = [...assignedIssues, ...createdIssues];

      for (const issue of combinedIssues) {
        issuesToProcess.set(issue.id, issue);
      }
    } else if (fetchMode === "all_contributions") {
      const baseParams = {
        ...params,
        updated_after: startDate,
        updated_before: endDate,
      };
      const issues = await getPaginatedResults(
        projectURL,
        headers,
        baseParams,
      );
      for (const issue of issues) {
        issuesToProcess.set(issue.id, issue);
      }
    } else {
      console.error(`Invalid fetch mode: ${fetchMode}`);
      Deno.exit(1);
    }
  }

  if (!issuesToProcess.size) {
    console.log("No issues found to process. Exiting.");
    Deno.exit(0);
  }

  // Fetch notes for each issue and filter based on fetchMode
  for (const [_id, issue] of issuesToProcess.entries()) {
    const projectID = issue.project_id;
    const issueIID = issue.iid;

    const notesURL =
      `${gitlabURL}/api/v4/projects/${projectID}/issues/${issueIID}/notes`;
    const notesParams = {
      sort: "asc",
      order_by: "created_at",
    };
    const notes = await getPaginatedResults(
      notesURL,
      headers,
      notesParams,
    );
    issue.notes = notes;

    if (fetchMode === "my_issues") {
      finalIssues.push(issue);
    } else if (fetchMode === "all_contributions") {
      let isContributor = false;
      if (issue.author && issue.author.id === userID) {
        isContributor = true;
      }
      if (issue.assignees) {
        for (const assignee of issue.assignees) {
          if (assignee.id === userID) {
            isContributor = true;
            break;
          }
        }
      }
      for (const note of notes) {
        if (note.author && note.author.id === userID) {
          isContributor = true;
          break;
        }
      }
      if (isContributor) {
        finalIssues.push(issue);
      }
    }
  }

  return finalIssues;
};
