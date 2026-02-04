# Mondel Worker

A Cloudflare Worker API built with [Hono](https://hono.dev/) and TypeScript.

## Tech Stack

This project uses [Mondel](https://www.npmjs.com/package/mondel), a MongoDB ODM with:

- **Serverless Environment Support** - Optimized for Cloudflare Workers and edge runtimes
- **Zod-Compatible Built-in Schema Validation** - Define schemas with familiar Zod-like syntax for type-safe database operations

```typescript
// Example schema definition
import { createClient } from 'mondel';

export const connect = createClient({
  serverless: true,
  schemas: [userSchema, todoSchema],
  validation: 'strict',
});
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (included in devDependencies)
- A Cloudflare account (for deployment)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.dev.vars` file in the project root for local development secrets:

```bash
# .dev.vars (DO NOT commit this file!)

# MongoDB Connection String (use legacy format, see note below)
MONGODB_URI="mongodb://user:password@shard-00.mongodb.net:27017,shard-01.mongodb.net:27017,shard-02.mongodb.net:27017/dbname?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority"

# JWT Secret Key (use a strong random string)
JWT_SECRET="your-secret-key-here"
```

> **⚠️ Important: Use Legacy Connection String Format**
>
> Cloudflare Workers do not fully support SRV DNS lookup. You must use the **legacy connection string format** instead of the `mongodb+srv://` format.
>
> To get the legacy connection string from MongoDB Atlas:
> 1. Go to your cluster → **Connect** → **Drivers**
> 2. Select driver version **2.2.12 or later** (not 3.0+)
> 3. Copy the connection string that starts with `mongodb://` (not `mongodb+srv://`)

> **Note:** The `.dev.vars` file is automatically read by Wrangler during local development. Make sure it's listed in `.gitignore`.

### 3. Type Safety for Environment Variables

Environment variables are typed in `src/middleware/db.ts`:

```typescript
export interface Env {
  MONGODB_URI: string;
  JWT_SECRET: string;
}
```

Access them in your Hono handlers via `c.env`:

```typescript
app.get('/example', (c) => {
  const secret = c.env.JWT_SECRET;
  // ...
});
```

## Development

Start the local development server:

```bash
npm run dev
```

The API will be available at `http://localhost:8787`.

## Production Secrets

For production deployment, set secrets using Wrangler CLI:

```bash
# Set each secret individually
npx wrangler secret put MONGODB_URI
npx wrangler secret put JWT_SECRET
```

You'll be prompted to enter each secret value securely.

Alternatively, bulk upload from a file:

```bash
npx wrangler secret bulk .dev.vars
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local development server |
| `npm run deploy` | Deploy to Cloudflare Workers |
| `npm run typecheck` | Run TypeScript type checking |
| `npm test` | Run tests with Vitest |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API info and available endpoints |
| `GET` | `/health` | Health check |
| `*` | `/v1/*` | Protected API routes |

## Project Structure

```
mondel-worker/
├── src/
│   ├── index.ts          # App entry point & middleware
│   ├── db/
│   │   └── client.ts     # Database client setup
│   ├── middleware/
│   │   └── db.ts         # Database middleware & Env types
│   ├── routes/           # API route handlers
│   └── utils/
│       └── jwt.ts        # JWT utilities
├── .dev.vars             # Local environment secrets (git-ignored)
├── wrangler.jsonc        # Wrangler configuration
└── package.json
```

## License

Private
