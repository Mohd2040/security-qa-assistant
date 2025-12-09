# 🛡️ Security Q&A Intelligence Hub

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss)

**Empowering security teams with AI-driven insights**

[Features](#-features) • [Quick Start](#-quick-start) • [API Overview](#-api-overview) • [Screenshots](#-screenshots)

</div>

---

## 📋 Overview

**Security Q&A Intelligence Hub** is an enterprise-grade knowledge management system designed specifically for security and compliance teams. It enables organizations to:

- 🔍 **Search** through security controls and Q&A using advanced semantic search
- 📥 **Import** bulk security questions/controls from Excel files with validation
- 🤖 **Match** new questions to existing answers using AI-powered similarity
- 🌐 **Translate** between English and Arabic with one click
- ✏️ **Manage** your security knowledge base with a premium UI

---

## ✨ Features

### 🔍 Semantic Search
- AI-powered deep search across your security knowledge base
- Filter by status (Applied, Not Applied, Not Applicable, Unknown)
- Filter by domain (Application, Network, Database, Cloud)
- Instant translation toggle for bilingual search results

### 📥 Bulk Import
- Download a pre-formatted Excel template
- Guided 3-step workflow (Download → Fill → Upload)
- Strict validation with error highlighting
- Duplicate detection (in-file and in-database)
- Supports bilingual questions (English & Arabic)

### 🤖 Smart Answer Matching
- Upload new questions and auto-match to existing answers
- Configurable similarity threshold
- Preview matches before downloading results
- Confidence levels: High, Medium, Low, None

### ✏️ Inline Editing
- Edit questions directly from search results
- Update status, domain, and explanations
- Support for English and Arabic question text

### 🌐 Bilingual Support
- Arabic and English UI
- RTL/LTR text handling
- One-click translation for search queries and results

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB instance (local or cloud)
- (Optional) Ollama for AI features

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/security-qa-assistant.git
cd security-qa-assistant

# Install dependencies
npm install

# Configure environment
cp env.docker.example .env.local
# Edit .env.local with your MongoDB URI and Ollama settings

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

### Docker Deployment

```bash
docker-compose up -d
```

---

## 📡 API Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/qa/search` | POST | Semantic search across Q&A |
| `/api/qa/update` | POST | Update a Q&A entry |
| `/api/qa/translate` | POST | Translate text (EN ↔ AR) |
| `/api/admin/qa/import` | POST | Bulk import from Excel |
| `/api/admin/qa/template` | GET | Download import template |
| `/api/admin/qa/match-answers` | POST | AI-powered answer matching |

---

## 📸 Screenshots

### Home Page
Modern dashboard with quick access to all features.

### Search Page
Advanced semantic search with inline editing and translation.

### Bulk Import
Guided workflow with validation and duplicate detection.

### Smart Matching
AI-powered answer matching with confidence scores.

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Frontend** | React 19, TailwindCSS 4 |
| **Database** | MongoDB 7 |
| **AI/ML** | Ollama (embeddings, translation, generation) |
| **Language** | TypeScript 5 |
| **File Handling** | SheetJS (xlsx) |
| **Icons** | Lucide React |

---

## 📁 Project Structure

```
security-qa-assistant/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Home page
│   ├── search/             # Search page
│   ├── admin/              # Admin pages
│   │   ├── import/         # Bulk import
│   │   ├── match-answers/  # Smart matching
│   │   └── qa/             # Q&A management
│   └── api/                # API routes
├── components/             # Reusable UI components
├── lib/                    # Utilities (MongoDB, AI, types)
└── public/                 # Static assets
```

---

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `OLLAMA_HOST` | Ollama API endpoint | ⚪ Optional |
| `AI_ENABLED` | Enable AI features (true/false) | ⚪ Optional |

---

## 📄 License

This project is proprietary software developed for internal use.

---

<div align="center">

**Built with ❤️ by the Security Team**

</div>
