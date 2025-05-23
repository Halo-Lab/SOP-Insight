# SOPInsight Server

All code generated by Ai in Cursor IDE.

Backend API for SOPInsight - a system for analyzing call transcripts for compliance with SOPs (Standard Operating Procedures).

## Project Structure

```
server/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middlewares/    # Middleware functions
│   ├── routes/         # API routes
│   ├── services/       # Business logic services
│   ├── utils/          # Helper utilities
│   ├── app.js          # Express app setup
│   └── server.js       # Entry point
├── sentry.js           # Sentry export
├── sentry-init.js      # Sentry initialization
└── package.json        # Dependencies and scripts
```

## Running the Project

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /auth/signup` - Register a new user
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user data

### SOP

- `POST /sop` - Create a new SOP
- `GET /sop` - Get all user's SOPs
- `PUT /sop/:id` - Update an SOP
- `DELETE /sop/:id` - Delete an SOP
- `GET /sop/default-sops` - Get default SOPs for a role

### Analysis

- `POST /analyze` - Analyze transcripts against SOPs
- `POST /analyze/stream` - Stream analysis of transcripts

### Roles

- `GET /roles` - Get all roles
- `POST /users/role` - Update user's role

### Sentry

- `GET /test-sentry/test` - Test Sentry integration

## Database Setup

### Creating Tables

To create the necessary tables in your Supabase database, execute the following SQL scripts:

1. First create the base tables (users, roles, sops, default_sops)
2. Then create the analysis history table by running the SQL script in `server/seed/analysis_history_table.sql`

### Security Policies

Make sure Row Level Security (RLS) is enabled for all tables and appropriate access policies are created.
