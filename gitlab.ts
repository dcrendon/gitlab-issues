export const getUserID = async (
  gitlabURL: string,
  headers: Record<string, string>,
): Promise<number> => {
  const response = await fetch(`${gitlabURL}/api/v4/user`, {
    headers,
  });
  if (!response.ok) {
    console.error(`Failed to fetch user information: ${response.statusText}`);
    Deno.exit(1);
  }
  const data = await response.json();
  return data.id;
};

export const getIssues = async (
  gitlabURL: string,
  headers: Record<string, string>,
  startDate: string,
  endDate: string,
  projectID: string[],
) => {
  return [{}];
};
