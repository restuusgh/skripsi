# 🌴 Palm Oil Distribution Information System with AI

An intelligent web-based **Palm Oil Distribution Information System** built using **Full Stack JavaScript**.  
This project helps manage distribution data, monitor stock, generate reports, and predict future distribution demand using **Artificial Neural Network (Brain.js)**.

---

## 📸 Preview

> Add your screenshots here

| Dashboard | AI Prediction |
|-----------|---------------|
| ![](docs/dashboard.png) | ![](docs/prediction.png) |

---

# ✨ Features

## 📦 Product Management

- Manage products
- Product stock management
- Minimum stock monitoring

---

## 🚚 Distribution Management

- Create distribution records
- Distribution history
- Destination management
- Vehicle management
- Delivery status tracking

---

## 📊 Dashboard

- Total distribution
- Current stock
- Product statistics
- Distribution activity
- Monitoring overview

---

## 🤖 AI Prediction

Powered by **Brain.js Neural Network**

Features:

- Distribution prediction
- Stock prediction
- Historical trend analysis
- Prediction history
- Database-based automatic input

Supports prediction for:

- Crude Palm Oil (CPO)
- Cooking Oil

Prediction period:

- 1 Month Ahead
- 2 Months Ahead

---

## 📈 Reports

- Distribution reports
- Stock reports
- Export-ready reports

---

## 👥 User Management

- Admin
- Management

---

# 🛠 Tech Stack

## Frontend

- React
- Vite
- TailwindCSS
- Framer Motion
- Recharts
- Lucide React

---

## Backend

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL

---

## Artificial Intelligence

- Brain.js
- Neural Network

---

# 📁 Project Structure

```
skripsi/
│
├── apps/
│   ├── api/
│   └── web/
│
├── packages/
│   ├── ai/
│   └── db/
│
├── pnpm-workspace.yaml
│
└── package.json
```

---

# 🚀 Installation

Clone repository

```bash
git clone https://github.com/yourusername/your-repository.git

cd your-repository
```

Install dependencies

```bash
pnpm install
```

---

# ⚙ Environment Variables

Create `.env`

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/skripsi_db"
```

---

# 🗄 Database

Generate Prisma Client

```bash
pnpm --filter @skripsi/db db:generate
```

Run Migration

```bash
pnpm --filter @skripsi/db db:migrate
```

Seed Database

```bash
pnpm --filter @skripsi/db db:seed
```

---

# ▶ Running Development

Run everything

```bash
pnpm dev
```

or individually

Frontend

```bash
pnpm --filter web dev
```

Backend API

```bash
pnpm --filter api dev
```

AI Server

```bash
pnpm --filter ai dev
```

---

# 🤖 AI Workflow

```
Historical Distribution Data
          │
          ▼
      Brain.js
 Neural Network Training
          │
          ▼
 Distribution Prediction
          │
          ▼
 Stock Prediction
```

---

# 📊 AI Prediction Parameters

Distribution Prediction

- Current Stock
- Previous Month Demand
- Distribution Area
- Season
- Product Type
- Prediction Period

Stock Prediction

- Current Stock
- Estimated Production
- Previous Demand
- Product Price

---

# 🧠 Neural Network

This project uses **Brain.js Neural Network** for prediction.

Input Variables

- Stock
- Demand
- Area
- Season

Output

- Distribution Prediction
- Future Stock Prediction

---

# 🗃 Database

Main Tables

- Users
- Products
- Stock
- Distribution
- Distribution Details
- Vehicles
- Distribution Destinations
- Prediction
- Prediction Results
- Activity Logs
- Notifications
- Reports

---

# 📌 API

## Prediction

```
GET /api/prediksi/konteks

POST /api/prediksi/kebutuhan

POST /api/prediksi/stok

GET /api/prediksi/tren

GET /api/prediksi/riwayat
```

---

# 📸 Screenshots

## Dashboard

Add image here

```
docs/dashboard.png
```

---

## AI Prediction

Add image here

```
docs/prediction.png
```

---

## Distribution

Add image here

```
docs/distribution.png
```

---

# 📖 Research

This system was developed as an undergraduate thesis project.

Title:

**Design and Development of a Web-Based Palm Oil Distribution Information System with Monitoring Features, Activity Recording, Artificial Intelligence Using JavaScript, and the Waterfall Method**

---

# 👨‍💻 Author

**Restu Singgih p**

Informatics Engineering

Universitas Islam Nusantara

---

# 📜 License

This project is developed for academic purposes.

Feel free to fork and learn from the project.

---

# 📌 Repository Information

This repository was created as part of an undergraduate thesis (Skripsi) project in Informatics Engineering.

The project demonstrates the design and implementation of a **Web-Based Palm Oil Distribution Information System** integrated with **Artificial Intelligence (Brain.js Neural Network)** for distribution and stock prediction.

This repository is intended for:

- Academic research and learning purposes.
- Full Stack JavaScript development reference.
- Artificial Intelligence integration using Brain.js.
- Portfolio and demonstration of software engineering skills.

Some parts of this project may continue to evolve during the research process. Contributions, suggestions, and constructive feedback are always welcome.

---

⭐ If you find this project useful, don't forget to give it a star on GitHub!