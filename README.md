# Bitezone

Bitezone is a full-stack food ordering web application built with the MERN stack. Customers can sign up, browse the menu and place orders, while administrators manage products and orders from a dedicated dashboard.

- **Frontend:** deployed on Vercel
- **Backend:** containerized with Docker, deployed on Microsoft Azure

> Live demo: `<add your Vercel URL here>`

---

## Features

**Customer side**
- Landing page with sign up / login navigation
- User registration and login
- Forgot-password flow with a reset link sent by email
- Menu browsing and order placement

**Admin side**
- Admin login
- Dashboard overview
- Product management
- Order management

---

## Tech Stack

| Layer      | Technology                              |
| ---------- | --------------------------------------- |
| Frontend   | React / Next.js                         |
| Backend    | Node.js, Express.js                     |
| Database   | MongoDB                                 |
| Email      | Nodemailer with Gmail SMTP (App Password) |
| DevOps     | Docker, Docker Compose                  |
| Hosting    | Vercel (frontend), Azure (backend)      |

---

## Project Structure

```
bitezone/
├── backend/            # Express API, Dockerfile, .env (not committed)
├── frontend/           # React / Next.js client
├── docker-compose.yml
└── README.md
```

> Adjust folder names above if your repository layout differs.

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- Docker and Docker Compose
- A MongoDB database (local container or MongoDB Atlas)
- A Gmail account with 2-Step Verification enabled (required to create an App Password)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

### 2. Configure environment variables

Create `backend/.env` using `backend/.env.example` as a template:

```env
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-16-character-app-password
CLIENT_URL_PUBLIC=http://localhost:3000
```

Add any other variables your backend already uses (for example the database connection string and JWT secret).

Notes:
- `EMAIL_PASS` must be a Gmail **App Password**, not your normal Gmail password.
- Write the App Password without spaces.
- Do not use quotes or spaces around `=`.

### 3. Run with Docker

```bash
docker compose down
docker compose up --build
```

The frontend runs on `http://localhost:3000`. The backend port depends on your configuration.

### 4. Run without Docker (optional)

```bash
# Backend
cd backend
npm install
npm start

# Frontend (in a second terminal)
cd frontend
npm install
npm run dev
```

---

## Environment Variables

| Variable             | Description                                                  |
| -------------------- | ------------------------------------------------------------ |
| `EMAIL_USER`         | Gmail address used to send password reset emails             |
| `EMAIL_PASS`         | Gmail App Password for the account above                     |
| `CLIENT_URL_PUBLIC`  | Public frontend URL, used to build the password reset link   |

---

## Deployment

**Frontend (Vercel):** import the repository in Vercel, set the root directory to the frontend folder, and set the API base URL environment variable to the deployed backend URL.

**Backend (Azure):** build the Docker image, push it to Azure Container Registry, and run it on Azure Container Apps. Secrets such as `EMAIL_PASS` are stored as Azure secrets rather than in the image or repository.

---

## Security

- `.env` files are excluded through `.gitignore` and are never committed.
- Email credentials use a Gmail App Password, which can be revoked at any time from the Google Account settings.

---

## Author

**Eisha**
Software Engineering student, University of Management and Technology (UMT), Lahore

---

## License

This project is for educational and portfolio purposes.
