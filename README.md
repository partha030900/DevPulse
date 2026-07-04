# DevPulse – Internal Tech Issue & Feature Tracker API

## Live URL

**Backend API:**
https://devpulse-partha00.vercel.app?_vercel_share=zEfQK96WKkFnc9EAmkvqXh2SY5ObCo9m


---

## Project Overview

DevPulse is a RESTful backend API developed using **Node.js**, **Express.js**, **TypeScript**, and **PostgreSQL (NeonDB)**. It allows internal teams to report, manage, and track software issues and feature requests with secure authentication and role-based authorization.

---

## Features

* User Registration
* User Login with JWT Authentication
* Password Hashing using bcryptjs
* Role-Based Authorization (Contributor & Maintainer)
* Create a New Issue
* Retrieve All Issues
* Retrieve a Single Issue
* Update Existing Issues
* Delete Issues (Maintainer Only)
* Filter Issues by Type and Status
* Sort Issues by Newest or Oldest
* Global Error Handling
* Standardized API Response Structure

---

## Tech Stack

* Node.js
* Express.js
* TypeScript
* PostgreSQL (NeonDB)
* JWT (jsonwebtoken)
* bcryptjs
* pg
* dotenv
* CORS
* tsup

---

## Setup Instructions


### Navigate into the project

```bash
cd YOUR_REPOSITORY
```

###  Install dependencies

```bash
npm install
```

### Create a `.env` file

```env
PORT=5000
DATABASE_URL=YOUR_NEON_DATABASE_URL
JWT_SECRET=YOUR_SECRET_KEY
```

###  Run the development server

```bash
npm run dev
```

###  Build the project

```bash
npm run build
```

###  Start the production server

```bash
npm start
```

---

## API Endpoints

### Authentication

| Method | Endpoint             | Description                 |
| ------ | -------------------- | --------------------------- |
| POST   | `/api/auth/signup` |  Signup a new user         |
| POST   | `/api/auth/login`    | Login and receive JWT token |

### Issues

| Method | Endpoint          | Description             |
| ------ | ----------------- | ----------------------- |
| POST   | `/api/issues`     | Create a new issue      |
| GET    | `/api/issues`     | Retrieve all issues     |
| GET    | `/api/issues/:id` | Retrieve a single issue |
| PATCH  | `/api/issues/:id` | Update an issue         |
| DELETE | `/api/issues/:id` | Delete an issue         |

### Query Parameters

| Parameter | Values                      | Default |
| --------- | --------------------------- | ------- |
| sort      | newest, oldest              | newest  |
| type      | bug, feature_request        | —       |
| status    | open, in_progress, resolved | —       |

---

## Database Schema Summary

### Users Table

| Field      | Type                     |
| ---------- | ------------------------ |
| id         | SERIAL PRIMARY KEY       |
| name       | VARCHAR(20)              |
| email      | VARCHAR(30) UNIQUE       |
| password   | TEXT                     |
| role       | contributor / maintainer |
| created_at | TIMESTAMP                |
| updated_at | TIMESTAMP                |

### Issues Table

| Field       | Type                          |
| ----------- | ----------------------------- |
| id          | SERIAL PRIMARY KEY            |
| title       | VARCHAR(150)                  |
| description | TEXT                          |
| type        | bug / feature_request         |
| status      | open / in_progress / resolved |
| reporter_id | INTEGER                       |
| created_at  | TIMESTAMP                     |
| updated_at  | TIMESTAMP                     |

---

## Authentication

Protected routes require a JWT token in the request header.

Example:

```
Authorization: <your_jwt_token>
```
