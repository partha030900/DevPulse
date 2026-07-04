import type { JwtPayload } from "jsonwebtoken";
import { pool } from "../../db";
import type { IIssueQuery, IIssue, IUpdateIssue } from "./issues.interface"


const createIssueIntoDB = async (reporter_id: number, issueData: IIssue) => {
     const { title, description, type } = issueData
     if (!title || !description || !type) {
          throw new Error(" Title, description, type must be required ")
     }
     if (description.trim().length < 20) {
          throw new Error("Description must be at least 20 characters");
     }
     if (type !== "bug" && type !== "feature_request") {
          throw new Error("Type must be either 'bug' or 'feature_request'");
     }
     try {
          const result = await pool.query(
               `
    INSERT INTO issues (title, description, type, reporter_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id, title, description, type, status, reporter_id, created_at, updated_at;
    `,
               [title, description, type, reporter_id]
          );

          return result;
     } catch (error: any) {
          throw new Error("Error creating issue");
     }
}


const getAllIssuesFromDB = async (query: IIssueQuery) => {

     const { sort = "newest", type, status } = query;

     let sql = `SELECT * FROM issues`;
     const values: (string | number)[] = [];
     const conditions: string[] = [];

     if (type) {
          values.push(type);
          conditions.push(`type = $${values.length}`);
     }

     if (status) {
          values.push(status);
          conditions.push(`status = $${values.length}`);
     }

     if (conditions.length > 0) {
          sql += ` WHERE ${conditions.join(" AND ")}`;
     }

     sql += sort === "oldest"
          ? ` ORDER BY created_at ASC`
          : ` ORDER BY created_at DESC`;

     const issueResult = await pool.query(sql, values);
     const issues = issueResult.rows;

     if (issues.length === 0) {
          return [];
     }

     
     const reporterIds = [...new Set(issues.map(issue => issue.reporter_id))];

     
     const placeholders = reporterIds
          .map((_, index) => `$${index + 1}`)
          .join(", ");

     const reporterResult = await pool.query(
          `SELECT id, name, role FROM users WHERE id IN (${placeholders})`,
          reporterIds
     );

     

     const reporterMap: Record<number, { id: number; name: string; role: string }> = {};

     reporterResult.rows.forEach((user) => {
          reporterMap[user.id] = user;
     });

     

     const formattedIssues = issues.map((issue) => {

          const { reporter_id, ...issueData } = issue;

          return {
               ...issueData,
               reporter: reporterMap[reporter_id]
          };

     });

     return formattedIssues;
};

const getSingleIssueFromDB = async (issueId: number) => {

     const issueResult = await pool.query(
          `SELECT * FROM issues 
     WHERE id = $1`,
          [issueId]
     );

     const issue = issueResult.rows[0];

     if (!issue) {
          throw new Error("Issue not found!");
     }

     const userResult = await pool.query(
          `SELECT id, name, role FROM users WHERE id = $1`,
          [issue.reporter_id]
     );

     const user = userResult.rows[0];


     const { reporter_id, ...restOfIssue } = issue;

     const formattedIssue = {
          ...restOfIssue,
          reporter: user || null,
     };

     return formattedIssue;
};


const updateIssueInDB = async (
     issueId: number,
     user: JwtPayload,
     payload: IUpdateIssue
) => {

     const { title, description, type, status } = payload;

     const issueResult = await pool.query(
          `SELECT id, status, reporter_id FROM issues WHERE id = $1`,
          [issueId]
     );

     const issue = issueResult.rows[0];

     if (!issue) {
          throw new Error("Issue not found!");
     }

     
     if (user.role === "contributor") {

          if (issue.reporter_id !== user.id) {
               throw new Error("You can only update your own issues!");
          }

          if (issue.status !== "open") {
               throw new Error("You can only update issues when the status is open!");
          }

          
          if (status) {
               throw new Error("Only maintainers can update status.");
          }
     }

     
     if (description && description.trim().length < 20) {
          throw new Error("Description must be at least 20 characters.");
     }

     
     if (type && type !== "bug" && type !== "feature_request") {
          throw new Error("Type must be either 'bug' or 'feature_request'.");
     }

     
     if (
          status &&
          status !== "open" &&
          status !== "in_progress" &&
          status !== "resolved"
     ) {
          throw new Error("Invalid status.");
     }

     const updateResult = await pool.query(
          `
          UPDATE issues
          SET
               title = COALESCE($1, title),
               description = COALESCE($2, description),
               type = COALESCE($3, type),
               status = COALESCE($4, status),
               updated_at = NOW()
          WHERE id = $5
          RETURNING *;
          `,
          [
               title ?? null,
               description ?? null,
               type ?? null,
               status ?? null,
               issueId
          ]
     );

     return updateResult.rows[0];
};

const deleteIssueFromDB = async (issueId: number) => {
     const issueCheck = await pool.query(
          `SELECT id FROM issues WHERE id = $1`,
          [issueId]
     );

     if (issueCheck.rows.length === 0) {
          throw new Error("Issue not found!");

     }

     await pool.query(
          `DELETE FROM issues WHERE id = $1`,
          [issueId]
     );

     return true;
};

export const issuesService = {

     createIssueIntoDB,
     getAllIssuesFromDB,
     getSingleIssueFromDB,
     updateIssueInDB,
     deleteIssueFromDB
} 