export interface Config {
  gitlabPAT: string;
  gitlabURL: string;
  outFile: string;
  timeRange: string;
  fetchMode: string;
  startDate?: string;
  endDate?: string;
  //   projectIDs: string[];
}

interface GitlabUser {
  id: number;
  username?: string;
  name?: string;
}

export interface GitlabIssue {
  id: number;
  iid: number;
  project_id: number;
  author: GitlabUser;
  assignees?: GitlabUser[];
  created_at: string;
  updated_at: string;
  notes?: any[];
  [key: string]: any;
}
