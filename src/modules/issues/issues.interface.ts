export interface IIssue {
     title: string;
     description: string;
     type: "bug" | "feature_request";
}


export interface IIssueQuery {
     sort?: "newest" | "oldest";
     type?: string;
     status?: string;
}

export interface IUpdateIssue {
     title?: string;
     description?: string;
     type?: string;
     status?: "open" | "in_progress" | "resolved";
}