import config from "../../config";
import { pool } from "../../db";
import type { ILogin, IUser } from "./auth.interface";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
const createUserIntoDB = async (payload: IUser) => {

     const { name, email, password, role } = payload
     if (!name || !email || !password) {
          throw new Error(" Name, email, password must be provided") 
     }
     const hashPassword = await bcrypt.hash(password, 10)
     const result = await pool.query(`
          
          INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,COALESCE($4,'contributor')) RETURNING *
          `, [name, email, hashPassword, role])
     delete result.rows[0].password;
     return result;
}

const checkUserInDB = async (payload: ILogin) => {

     const { email, password } = payload
     if (!email || !password) {
          throw new Error(" Email & password  must be provided")
     }

     const userData = await pool.query(`
          SELECT * FROM users WHERE email=$1 
          `, [email])

     if (userData.rows.length === 0) {
          throw new Error("Invalid Credentials!")
     }

     const user = userData.rows[0]
     const isPasswordValid = await bcrypt.compare(password, user.password)
     if (!isPasswordValid) {
          throw new Error("Password not valid")
     }
     const jwtpayload = {
          id: user.id,
          name: user.name,
          role: user.role,
          email: user.email,
     };

     const token = jwt.sign(jwtpayload, config.secret as string, { expiresIn: "1d" });

     const { password: _, ...safeUser } = user;

     return { token , user: safeUser };

}

export const authService = {
     createUserIntoDB,
     checkUserInDB
}