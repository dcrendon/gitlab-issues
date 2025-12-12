// const getUserID = async (
//   gitlabURL: string,
//   headers: Record<string, string>,
// ): Promise<number> => {
//   const response = await fetch(`${gitlabURL}/api/v4/user`, {
//     headers,
//   });
//   if (!response.ok) {
//     console.error(`Failed to fetch user information: ${response.statusText}`);
//     Deno.exit(1);
//   }
//   const data = await response.json();
//   return data.id;
// };

// const getProjects = async (
//   gitlabURL: string,
//   headers: Record<string, string>,
//   userID: number,
// ) => {
//   const response = await fetch(`${gitlabURL}/api/v4/users/${userID}/projects`, {
//     headers,
//   });
//   if (!response.ok) {
//     console.error(`Failed to fetch projects: ${response.statusText}`);
//     Deno.exit(1);
//   }
//   const data = await response.json();
//   return data;
// };

const getIssues = async (
  gitlabURL: string,
  headers: Record<string, string>,
  startDate: string,
  endDate: string,
) => {
  const response = await fetch(
    `${gitlabURL}/api/v4/issues?created_after=${startDate}&created_before=${endDate}`,
    {
      headers,
    },
  );
  if (!response.ok) {
    console.error(`Failed to fetch issues: ${response.statusText}`);
    Deno.exit(1);
  }
  const data = await response.json();
  return data;
};

export const gitlabIssues = async (
  gitlabURL: string,
  headers: Record<string, string>,
  startDate: string,
  endDate: string,
) => {
  // TODO: Implement fetching issues for specific projects for all contributions mode
  // const userID = await getUserID(gitlabURL, headers);
  // const projects = await getProjects(gitlabURL, headers, userID);
  const issues = await getIssues(gitlabURL, headers, startDate, endDate);
  return issues;
};
