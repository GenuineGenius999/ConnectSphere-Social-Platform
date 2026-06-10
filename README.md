# ConnectSphere

A full-featured social platform with admin panel, user permissions, and MySQL database.

## Admin Panel

| Page | URL |
|------|-----|
| **Admin Dashboard** | http://localhost:3005/admin |
| **User Permissions** | http://localhost:3005/admin/users |

**Admin login (after seeding database):**
- Email: `admin@connectsphere.com`
- Password: `admin123`

## .env Configuration

Copy `.env.example` to `.env` and set these values:

```env
# MySQL with NO password (most local setups):
DATABASE_URL="mysql://root@localhost:3306/connectsphere"

# MySQL WITH password (replace YOUR_PASSWORD):
# DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/connectsphere"

# App URL — must match the port you run on (default: 3005)
NEXTAUTH_URL="http://localhost:3005"
AUTH_SECRET="any-long-random-string-here"
NEXTAUTH_SECRET="any-long-random-string-here"
```

### DATABASE_URL format explained

| Situation | What to type |
|-----------|--------------|
| No password | `mysql://root@localhost:3306/connectsphere` |
| With password `mypass` | `mysql://root:mypass@localhost:3306/connectsphere` |
| Different user | `mysql://USERNAME:PASSWORD@localhost:3306/connectsphere` |

## How to Run (Step by Step)

### 1. Prerequisites

- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **MySQL 8+** — XAMPP, WAMP, or standalone MySQL

### 2. Start MySQL

Make sure MySQL is running (XAMPP Control Panel → Start MySQL, or Windows Services).

### 3. Create the database

Open MySQL command line or phpMyAdmin and run:

```sql
CREATE DATABASE connectsphere;
```

### 4. Install dependencies

```bash
cd F:\someproducts\my-social
npm install
```

### 5. Configure `.env`

Edit `.env` — for no password use:

```env
DATABASE_URL="mysql://root@localhost:3306/connectsphere"
NEXTAUTH_URL="http://localhost:3005"
AUTH_SECRET="connectsphere-dev-secret-change-in-production"
NEXTAUTH_SECRET="connectsphere-dev-secret-change-in-production"
```

### 6. Set up database tables & seed data

```bash
npm run db:migrate
npm run db:seed
```

If migrate asks for a migration name, type: `init`

### 7. Start the app

**Development (recommended):**

```bash
npm run dev
```

Open: **http://localhost:3005**

**Production build:**

```bash
npm run build
npm run start
```

### Common mistakes

| Problem | Solution |
|---------|----------|
| `EADDRINUSE port 3000` | Use `npm run dev` (runs on port **3005**) |
| `NPM RUN DEV` error | Use lowercase: `npm run dev` |
| Database connection failed | Check MySQL is running and `DATABASE_URL` is correct |
| Admin page redirects to login | Log in with `admin@connectsphere.com` / `admin123` |
| Empty admin users list | Run `npm run db:migrate` then `npm run db:seed` |

## Admin Permissions

As **Super Admin** you can:

- Assign roles: User, Moderator, Admin, Super Admin
- Ban / unban users
- Grant verified badge
- Toggle per-user permissions:
  - Create Posts
  - Comment on Posts
  - Send Messages
  - Go Live
  - Create Groups
  - Sell on Marketplace

As **Admin** you can ban users and toggle permissions (but not change roles).

## Image Hosting (Postimages.org)

All user-uploaded images are hosted on [Postimages.org](https://postimages.org/) and stored as URLs in your MySQL database.

1. Create a free account at https://postimages.org/
2. Get your **API key** from account settings
3. Add to `.env`:
   ```env
   POSTIMAGES_API_KEY="your-api-key-here"
   ```
4. Restart the dev server

When users click **Photo** on a post, the image uploads to Postimages and the returned `i.postimg.cc` URL is saved in the database.

## Real Database Data

The platform now reads **all content from MySQL** — posts, users, messages, notifications, groups, events, marketplace, reels, and more. No more mock/template data.

Re-seed sample data anytime:
```bash
npm run db:seed
```

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@connectsphere.com | admin123 |
| User | alex@connectsphere.com | password123 |
| Moderator | sarah@example.com | password123 |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3005 |
| `npm run build` | Production build |
| `npm run start` | Start production server on port 3005 |
| `npm run db:migrate` | Apply database migrations |
| `npm run db:seed` | Seed demo + admin users |
| `npm run db:studio` | Open Prisma database GUI |

## Tech Stack

Next.js 16 · TypeScript · Tailwind CSS · Prisma · MySQL · NextAuth.js
