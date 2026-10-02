# QueueLess (OueueLess)

**QueueLess** is a web-based digital queue and token management system designed to eliminate physical waiting lines. Customers can join service queues remotely, receive unique digital tokens, monitor their real-time queue position and estimated wait times, and get served seamlessly.

---

## 👥 Team & Responsibilities

### 🎨 Frontend Team
- **Sujit**
- **Aniket**
- **Biswajit**

*Tech Stack & Focus:* React.js, Redux, Tailwind CSS, React Router  
*Responsibilities & Initial Architecture:*
1. Full Project Setup & React Router Integration
2. Tailwind CSS Integration
3. Authentication & Account Management Pages:
   - Login (with Google OAuth)
   - Registration
   - Change Password
   - Forgot Password
4. Customer Panel, Staff Dashboard, and Admin Panel UI

### ⚙️ Backend Team
- **Kushal**
- **Arpita**
- **Debo**
- **Samprity**

*Tech Stack & Focus:* Python, FastAPI, PostgreSQL, REST APIs, Bcrypt, JWT  
*Responsibilities & Initial Architecture:*
1. Full Project Setup & Database Integration
2. API Router Architecture
3. CRUD APIs (`User`, `Shop`)
4. Security & Authentication APIs (**Bcrypt & JWT Required**):
   - Login (with Google OAuth support)
   - Registration
   - Change Password
   - Forgot Password
5. Transaction-safe Token Logic, Queue Lifecycle & Role-Based Access Control

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+), React.js, Redux, **Tailwind CSS**, **React Router** |
| **Backend** | Python, FastAPI, **PostgreSQL** |
| **Authentication & Security** | **JWT**, **Bcrypt**, **Google OAuth (Login with Google)** |
| **API Architecture** | RESTful APIs |

---

## 📋 Initial Implementation Roadmap & Workflows

### 🎨 Frontend Workflow
```
[ SETUP FULL PROJECT ]
          │
          ▼
 [ TAILWIND INTEGRATE ]
          │
          ▼
       [ ROUTER ]
          │
          ▼
       [ PAGES ]
  ├── 1. Login (with Google)
  ├── 2. Registration
  ├── 3. Change Password
  └── 4. Forgot Password
```

### ⚙️ Backend Workflow
```
[ SETUP FULL PROJECT ]
          │
          ▼
    [ DB INTEGRATE ]
          │
          ▼
       [ ROUTER ]
          │
          ▼
 [ APIs: CRUD (USER, SHOP) ]
  ├── 1. Login (with Google) -> [ Bcrypt & JWT MUST ]
  ├── 2. Registration
  ├── 3. Change Password
  └── 4. Forgot Password
```

---

## 🚀 Main System Modules

### 1. 👤 Customer Panel
- **User Authentication:** Registration, Login with Email/Phone or Google, Password Hashing, Profile Management, Change/Forgot Password.
- **Service & Shop Browsing:** View shops, available services, queue lengths, operating hours, and counter availability.
- **Token Operations:** 
  - Join Queue & Generate Unique Digital Token (e.g., `DL-105`, `E-128`).
  - Track real-time position, tokens ahead, counter assignment, and estimated wait time.
  - Token Cancellation (eligible active tokens only) & Token History.
- **Customer Feedback:** Submit ratings (1–5 stars) and reviews post-service completion.

### 2. 📋 Staff Panel
- **Staff Authentication & Workstation:** Role-validated login, assigned counter & service status display.
- **Queue Management:**
  - View live waiting queue.
  - **Call Next Token:** Triggers notification & counter assignment (`CALLED`).
  - **Start Service:** Begins service timer (`SERVING`).
  - **Complete Service:** Marks token as `COMPLETED` and logs service duration.
  - **Skip / Recall Token:** Handle absent customers (`SKIPPED`) or repeat calls (`RECALLED`).
  - **Pause / Resume:** Operational control for counter breaks or technical issues.

### 3. 🛡️ Admin Panel
- **System Monitoring Dashboard:** Overview of total customers, staff, active counters, queues, and daily token metrics.
- **Resource Management:** 
  - **Customer & Shop Management:** View, search, filter, CRUD operations for Users and Shops.
  - **Staff Management:** Add/edit staff, assign services/counters, track activity.
  - **Service & Counter Management:** Configure operating hours, token prefixes, queue capacity rules.
- **Analytics & Audit:** Token history audit trail, queue performance reports, and visual charts.

---

## 🔄 Core Business Workflow

```
[ ADMIN ]
  ├── Create Shop & Service
  ├── Create Counter
  ├── Create Staff
  └── Assign Staff → Counter
        │
        ▼
[ CUSTOMER ]
  ├── Register / Login (with Google OAuth)
  ├── Select Service / Shop
  ├── Join Queue
  └── Receive Digital Token (WAITING)
        │
        ▼
[ STAFF ]
  ├── Call Token (CALLED)
  ├── Start Service (SERVING)
  └── Complete Service (COMPLETED)
        │
        ▼
[ CUSTOMER ]
  └── View Completion & Submit Feedback
```

---

## 🔒 Security & Business Rules Highlights

- **BR-01:** A customer cannot hold more than one active token at a time.
- **BR-05:** Transaction-safe token generation (prevents duplicate token numbers).
- **BR-09:** Only assigned, active staff members can operate a counter.
- **BR-12:** Strict backend role-based access control (`/customer/*`, `/staff/*`, `/admin/*`).
- **Security Standards:** Hashed passwords with **Bcrypt**, JWT tokens for authentication, Google OAuth integration, parameterized SQL queries against SQL injection.

---

## 📁 Repository Structure

```
OueueLess/
├── backend/          # Python + FastAPI backend application
├── frontend/         # React.js + Tailwind CSS frontend application
├── Documentation/    # Feature specifications and project assets
├── .gitignore        # Git ignore configuration
└── README.md         # Project documentation
```