


import type { Application, Request, Response } from "express";
import express from 'express';
import cors from "cors";
import { authRouter } from "./modules/auth/auth.route";
import { issuesRouter } from "./modules/issues/issues.route";
import globalErrorHandler from "./middleware/globalErrorHandler";


const app: Application = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use( cors({
     origin: "https://devpulse-partha00.vercel.app"}));

app.use("/api/auth", authRouter);
app.use("/api/issues", issuesRouter);

app.get('/', (req: Request, res: Response) => {
     res.status(200).json({
          message: "DevPulse - Internal Tech Issue & Feature Tracker",
          author: "Next Level WebDev"
     })
});
 app.use(globalErrorHandler);


export default app;
