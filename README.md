# 🌐 ConnectSphere

> A full-featured modern social media platform built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, **Prisma**, **MySQL**, and **NextAuth.js**.

<p align="center">
  <img src="https://i.postimg.cc/Y0CY3dsR/Screenshot-3.png" alt="ConnectSphere Banner" width="100%">
</p>

<p align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38BDF8?logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?logo=mysql)
![License](https://img.shields.io/badge/License-MIT-green)

</p>

---

# ✨ Features

- 🔐 Authentication with NextAuth
- 👤 User Profiles
- 📝 Create, Edit & Delete Posts
- ❤️ Like & Comment System
- 💬 Real-time Messaging
- 📸 Image Upload via Postimages
- 👥 Groups
- 🛒 Marketplace
- 🎥 Reels
- 📅 Events
- 🔔 Notifications
- 🛡️ Admin Dashboard
- 👑 Role & Permission Management
- ✅ Verified Users
- 🚫 Ban / Unban Users

---

# 📸 Screenshots

## 🏠 Home Feed

<img src="https://i.postimg.cc/Dz1ryJG5/Screenshot-1.png" width="100%">

---

## 💬 Chat System

<img src="https://i.postimg.cc/fyRmK8rH/Screenshot-2.png" width="100%">

---

## 🌐 Main Dashboard

<img src="https://i.postimg.cc/Y0CY3dsR/Screenshot-3.png" width="100%">

---

## 👥 Community

<img src="https://i.postimg.cc/3RB2msnN/Screenshot-4.png" width="100%">

---

## 🛡️ Admin Panel

<img src="https://i.postimg.cc/3R7gy8Ck/Screenshot-5.png" width="100%">

---

# 🛠 Tech Stack

| Frontend | Backend | Database | Authentication |
|----------|----------|-----------|---------------|
| Next.js 16 | Prisma ORM | MySQL | NextAuth.js |
| TypeScript | Node.js | | |
| Tailwind CSS | | | |

---

# ⚙️ Installation

```bash
git clone https://github.com/yourusername/connectsphere.git

cd connectsphere

npm install
```

Create `.env`

```env
DATABASE_URL="mysql://root@localhost:3306/connectsphere"

NEXTAUTH_URL="http://localhost:3005"

AUTH_SECRET="your-secret"

NEXTAUTH_SECRET="your-secret"

POSTIMAGES_API_KEY="your-api-key"
```

Run database

```bash
npm run db:migrate
npm run db:seed
```

Start development

```bash
npm run dev
```

Open

```
http://localhost:3005
```

---

# 👤 Demo Accounts

| Role | Email | Password |
|------|------|----------|
| 👑 Super Admin | admin@connectsphere.com | admin123 |
| 🛡️ Moderator | sarah@example.com | password123 |
| 👤 User | alex@connectsphere.com | password123 |

---

# 🛡️ Admin Panel

| Page | URL |
|------|-----|
| Dashboard | http://localhost:3005/admin |
| Users | http://localhost:3005/admin/users |

Super Admin can:

- Manage Roles
- Ban / Unban Users
- Grant Verified Badge
- Manage Permissions
- Moderate Platform

---

# 📜 Available Scripts

```bash
npm run dev

npm run build

npm run start

npm run db:migrate

npm run db:seed

npm run db:studio
```

---

# ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!

---

# 📄 License

MIT License
