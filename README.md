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

### 🔍 Revolutionary Hybrid Search Engine
Our search system combines **three powerful technologies** to deliver unmatched accuracy:

#### 🎯 Triple-Layer Search Architecture:
1. **Fuzzy Search (Fuse.js)** - Handles typos and variations (40% weight)
2. **Semantic Search (OpenAI Embeddings)** - Understands meaning and context (60% weight)
3. **BM25 Ranking** - Advanced keyword matching for precise results

#### ✨ Key Capabilities:
- **AI Query Expansion** - Automatically finds synonyms and related terms using GPT-4
- **Bilingual Intelligence** - Seamless Arabic/English search with normalization
- **Advanced Filters** - Status, Domain, Date Range, Source File, Client
- **Real-time Translation** - Instant query and result translation
- **Atlas Search Toggle** - Switch to MongoDB Atlas Search for optimized performance

#### 🚀 Search Modes:
- **Standard Mode**: Hybrid scoring (Fuzzy + Semantic + BM25)
- **AI Enhanced Mode**: Query expansion with GPT-4 for broader results
- **Atlas Search Mode**: MongoDB native vector search for speed

### 📥 Bulk Import
- Download a pre-formatted Excel template
- Guided 3-step workflow (Download → Fill → Upload)
- Strict validation with error highlighting
- Duplicate detection (in-file and in-database)
- Supports bilingual questions (English & Arabic)

### 🤖 Intelligent Answer Matching System
Upload Excel files with questions and get AI-powered matches using our **4-stage matching pipeline**:

#### 🔄 Matching Algorithm:
1. **Exact Match** - Instant detection of identical questions (100% accuracy)
2. **Fuzzy Search** - Finds similar questions with synonym expansion (Top 50 candidates)
3. **Semantic Reranking** - OpenAI embeddings for deep understanding
4. **Hybrid Scoring** - Dynamic weights (Semantic 60% + Fuzzy 30% + BM25 10%)

#### 📊 Match Confidence Levels:
- **🟢 High (≥85%)**: Auto-apply recommended - Excellent match
- **🟡 Medium (≥70%)**: Review recommended - Good match
- **🟠 Low (≥50%)**: Manual decision required - Weak match  
- **🔴 Needs Review (<60%)**: No reliable match + AI suggestion provided

#### ⚡ Performance Features:
- **Early Stopping**: Stops at 95% similarity to save time
- **Batch Processing**: Optimized for files up to 300 questions
- **Preview Mode**: Review matches before downloading
- **AI Suggestions**: GPT-4 generates answers for low/no matches
- **Color-Coded Excel**: Visual feedback (Green/Yellow/Orange/Red)

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

### Frontend
| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | Next.js 16 (App Router) | Server-side rendering & routing |
| **UI Library** | React 19 with Compiler | High-performance UI |
| **Styling** | TailwindCSS 4 | Modern, responsive design |
| **Language** | TypeScript 5 | Type-safe development |
| **Icons** | Lucide React | Beautiful icon system |

### Backend & Database
| Category | Technology | Purpose |
|----------|------------|---------|
| **Database** | MongoDB 7 | Document storage |
| **Search Engine** | MongoDB Atlas Search | Vector & text search |
| **Runtime** | Node.js 18+ | Server execution |

### AI & Machine Learning
| Category | Technology | Purpose |
|----------|------------|---------|
| **LLM** | OpenAI GPT-4o-mini | Text generation & analysis |
| **Embeddings** | text-embedding-3-small | Semantic vectors (1536 dimensions) |
| **Fuzzy Search** | Fuse.js 7.0 | Typo-tolerant matching |
| **BM25 Ranker** | Custom implementation | Keyword relevance scoring |
| **NLP** | Natural.js | Text processing |
| **Cache** | LRU Cache (custom) | Embedding caching |

### Utilities & Tools
| Category | Technology | Purpose |
|----------|------------|---------|
| **Excel Processing** | SheetJS (xlsx) | Import/Export functionality |
| **Arabic Processing** | Custom stemmer & normalizer | RTL support |
| **Deployment** | Docker, Vercel | Production hosting |

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

## 📚 Documentation

For detailed technical information, please refer to:

- **[Complete Analysis](docs/ANALYSIS.md)** - Comprehensive project analysis
  - Architecture deep-dive
  - Strengths & weaknesses
  - Testing strategies
  - Performance optimization recommendations
  
- **[OpenAI Ideas](docs/OPENAI_IDEAS.md)** - Creative AI enhancements
  - Top 5 priority features
  - Implementation roadmap
  - Cost analysis

---

## 📄 License

This project is proprietary software developed for internal use.

---

<div align="center">

**Built with ❤️ by the Security Team**

</div>
