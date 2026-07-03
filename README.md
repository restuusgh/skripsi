# Palm Oil Distribution Information System with AI

A web-based information system for managing palm oil distribution, built with a full-stack JavaScript architecture. The system supports distribution data management, stock monitoring, report generation, and demand forecasting powered by an Artificial Neural Network implemented with Brain.js.

---

## Preview

| Dashboard | AI Prediction |
|-----------|----------------|
| ![Dashboard](docs/dashboard.png) | ![AI Prediction](docs/prediction.png) |

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [AI Workflow](#ai-workflow)
- [Prediction Parameters](#prediction-parameters)
- [Neural Network Design](#neural-network-design)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Research Background](#research-background)
- [Author](#author)
- [License](#license)

---

## Features

### Product Management
- Product data management
- Stock level tracking
- Minimum stock threshold alerts

### Distribution Management
- Distribution record creation
- Distribution history tracking
- Destination management
- Vehicle management
- Delivery status tracking

### Dashboard
- Total distribution overview
- Real-time stock levels
- Product statistics
- Distribution activity summary
- General monitoring overview

### AI Prediction

Powered by a Brain.js neural network, providing:

- Distribution demand forecasting
- Stock level forecasting
- Historical trend analysis
- Prediction history logging
- Automatic input generation from database records

Supported commodities:
- Crude Palm Oil (CPO)
- Cooking Oil

Prediction horizons:
- One month ahead
- Two months ahead

### Reports
- Distribution reports
- Stock reports
- Export-ready output formats

### User Management
- Admin role
- Management role

---

## Tech Stack

**Frontend**
- React
- Vite
- Tailwind CSS
- Framer Motion
- Recharts
- Lucide React

**Backend**
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL

**Artificial Intelligence**
- Brain.js
- Neural Network

---

## Project Structure

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

## Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/your-repository.git
cd your-repository
```

Install dependencies:

```bash
pnpm install
```

---

## Environment Variables

Create a `.env` file in the project root:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/skripsi_db"
```

---

## Database Setup

Generate the Prisma client:

```bash
pnpm --filter @skripsi/db db:generate
```

Run database migrations:

```bash
pnpm --filter @skripsi/db db:migrate
```

Seed the database:

```bash
pnpm --filter @skripsi/db db:seed
```

---

## Running the Application

Run all services together:

```bash
pnpm dev
```

Or run each service individually:

Frontend:

```bash
pnpm --filter web dev
```

Backend API:

```bash
pnpm --filter api dev
```

AI Service:

```bash
pnpm --filter ai dev
```

---

## AI Workflow

```
Historical Distribution Data
            |
            v
    Brain.js Neural Network
         Training
            |
            v
  Distribution Prediction
            |
            v
      Stock Prediction
```

---

## Prediction Parameters

**Distribution Prediction**
- Current stock
- Previous month demand
- Distribution area
- Season
- Product type
- Prediction period

**Stock Prediction**
- Current stock
- Estimated production
- Previous demand
- Product price

---

## Neural Network Design

This project uses a Brain.js neural network for forecasting.

**Input Variables**
- Stock
- Demand
- Area
- Season

**Output Variables**
- Distribution prediction
- Future stock prediction

---

## Database Schema

Core tables include:

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

## API Reference

### Prediction Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/prediksi/konteks` | Retrieve prediction context data |
| POST | `/api/prediksi/kebutuhan` | Submit demand prediction request |
| POST | `/api/prediksi/stok` | Submit stock prediction request |
| GET | `/api/prediksi/tren` | Retrieve historical trend data |
| GET | `/api/prediksi/riwayat` | Retrieve prediction history |

---

## Screenshots

Add screenshots to the `docs/` directory and reference them below:

- `docs/dashboard.png` — Dashboard overview
- `docs/prediction.png` — AI Prediction interface
- `docs/distribution.png` — Distribution management view

---

## Research Background

This system was developed as an undergraduate thesis (skripsi) project.

**Title:**
Design and Development of a Web-Based Palm Oil Distribution Information System with Monitoring Features, Activity Recording, and Artificial Intelligence Using JavaScript and the Waterfall Method.

---

## Author

**Restu Singgih P.**
Informatics Engineering
Universitas Islam Nusantara

---

## License

This project was developed for academic purposes. It is open for forking and educational use.

---

## Repository Notes

This repository was created as part of an undergraduate thesis project in Informatics Engineering. It demonstrates the design and implementation of a web-based Palm Oil Distribution Information System integrated with Artificial Intelligence (Brain.js Neural Network) for distribution and stock forecasting.

Intended use cases:

- Academic research and study reference
- Full-stack JavaScript development reference
- AI integration reference using Brain.js
- Software engineering portfolio demonstration

The project may continue to evolve during the course of the research. Feedback and suggestions are welcome.