# 🧠 Projekt — Backend

**Projekt Backend** is the core API powering the Projekt application — a role-based project and task management system.  
It handles **authentication**, **role-based access**, **project and task operations**, and **data validation** using Node.js, Express, and MongoDB.

---

## ⚙️ Tech Stack

- 🟢 **Node.js + Express.js** — backend server framework  
- 🍃 **MongoDB (Mongoose ODM)** — database layer  
- 🔐 **JWT Authentication** — secure login sessions (via cookies)  
- 🧱 **Role-Based Access Control (RBAC)** — Admin / PM / Developer segregation  
- ⚙️ **dotenv** — environment variable management  
- 🧩 **CORS + Cookie Parser** — secure client–server communication  
- 🔄 **Render** — deployment platform

---

## 👥 Roles

The backend defines **three roles** with unique API permissions:

- **Admin**
- **Project Manager (PM)**
- **Developer**

Each role has its own routes, controllers, and access restrictions to maintain security and workflow boundaries.

---

## 🧰 API Capabilities

### 1) 🧑‍💼 Admin

**Primary Responsibility:** Manage Project Managers, Developers, and Projects.  
**Accessible Endpoints:**
- Create and register new **Project Managers** or **Developers**.  
- Create, edit, and delete **projects**.  
- Assign a **PM** to a project at creation or update time.  
- View all projects with their statuses and assigned owners.  
- Manage user hierarchy and control the workflow foundation.

➡️ *Routes:* `/api/v1/admin/*`

---

### 2) 👨‍💼 Project Manager (PM)

**Primary Responsibility:** Manage their own projects and associated tasks.  
**Accessible Endpoints:**
- Retrieve all **projects** owned by the logged-in PM.  
- Create **tasks** under a project (assign to a Developer or self).  
- Edit tasks:
  - Update title, due date, or assignee.
  - Cannot modify a completed task or reassign an ongoing task.
- Delete tasks only if they are **pending** or **completed**.  
- Drag-and-drop Kanban workflow updates:
  - Supports status transitions:  
    `pending → ongoing → completed`  
    *(skips are disallowed for logical flow consistency).*
- Fetch assignable users (self + developers) for task assignment.  
- Monitor and refresh project statuses automatically as tasks evolve.

➡️ *Routes:* `/api/v1/pm/*`

---

### 3) 👨‍💻 Developer

**Primary Responsibility:** Execute tasks assigned to them.  
**Accessible Endpoints:**
- View all tasks assigned to the logged-in Developer.  
- Update task progress:
  - Move task status using Kanban transitions:  
    `pending → ongoing → completed`
- Edit limited task fields (title, due date) under specific conditions.  
- Cannot delete or reassign tasks.  
- Get visual and API-level updates for deadlines and project progress.

➡️ *Routes:* `/api/v1/dev/*`

---

## 🙏 Thank You

Thanks for exploring the **Projekt Backend**!  
This project reflects real-world team collaboration — where clear boundaries between Admins, PMs, and Developers make workflows scalable and secure.


---
