import type { NextFunction, Request, Response } from "express"
import sendResponse from "../utils/sendResponse";
import jwt from "jsonwebtoken";
import config from "../config";
import type { JwtPayload } from "jsonwebtoken";
import { pool } from "../db";
import type { ROLES } from "../types";

const auth = (...roles: ROLES[]) => {

     return async (req: Request, res: Response, next: NextFunction) => {

          try {

               const token = req.headers.authorization;
               if (!token) {
                    return sendResponse(res, {
                         statusCode: 401,
                         success: false,
                         message: "Unauthorized access",
                    })

               }

               const decoded = jwt.verify(token as string, config.secret as string) as JwtPayload;
               const userData = await pool.query(
                    `
               SELECT * FROM users WHERE email=$1  
                    `, [decoded.email]
               )

               const user = userData.rows[0];
               if (!user) {
                    return sendResponse(res, {
                         statusCode: 401,
                         success: false,
                         message: " Unauthorized access",
                    })
               }

               if (roles.length && !roles.includes(user.role)) {
                    return sendResponse(res, {
                         statusCode: 403,
                         success: false,
                         message: "Forbidden access!!",
                    })
               }

               req.user = decoded;

               next();


          } catch (error) {
            next(error)

          }


     }

}



export default auth;