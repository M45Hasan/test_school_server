# 🎓 Test School Assessment Platform

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Render](https://img.shields.io/badge/Deployed%20on-Render-46b3e6)

A secure digital competency assessment system with automated certification and proctoring features.

## 🌟 Features

- **3-Stage Progressive Testing** (A1 to C2 levels)
- JWT Authentication with OTP verification
- Automated certificate generation
- Role-based access control (Student/Admin/Supervisor)
- Anti-cheating measures:
  - Test timeouts
  - Step 1 retake prevention


## Live & Documentation 

https://test-school-server.onrender.com/

https://documenter.getpostman.com/view/27898219/2sB3BEmVHz

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x
- MongoDB Atlas or local instance


### Database 
<img width="1577" height="1965" alt="db" src="https://github.com/user-attachments/assets/0433fdfd-fb4c-4009-b072-c82622053ae0" />


### Installation
```bash
git clone https://github.com/M45Hasan/test-school-server.git
cd test-school-server
npm install
cp .env.example .env
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/test-school
BASE_URL=redis://localhost:8080

# Authentication
git clone https://github.com/M45Hasan/test-school-server.git
cd test-school-server
npm install
cp .env.example .env
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/test-school
REDIS_URL=redis://localhost:6379

# Authentication
JWT_REFRESH_SECRET=your_random_secret_key_here
JWT_SECRET=


# Email/SMS
MAIL_PASSWORD=
EMAIL=

# App Config
PORT=8080
NODE_ENV=development

# Development
npm run start:dev

# Production
npm start
npm run build
