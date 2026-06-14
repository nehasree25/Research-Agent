# 🚀 Context Research Studio

An AI-powered research dashboard that uses Context.dev APIs to search, crawl, scrape, analyze, and synthesize information from multiple web sources into structured research reports.

---

## 📖 Overview

Context Research Studio is a modern research platform designed to transform raw web information into reliable, evidence-based research reports.

Users can ask questions such as:

- How many AirPods were sold this year?
- Which company is leading humanoid robotics?
- Top smartphone sales in India 2026
- Latest AI tools used by software developers

The platform automatically:

- Understands research intent
- Discovers relevant sources
- Crawls and scrapes websites using Context.dev
- Extracts statistics and structured insights
- Verifies findings across multiple sources
- Calculates confidence scores
- Generates professional research reports

---

## ✨ Features

### Intelligent Research Engine

- Natural language query input
- Multi-source web research
- Automated information extraction
- Structured research reports
- Confidence scoring

### Context.dev Integration

- URL scraping
- Website crawling
- Structured data extraction
- Screenshots and media collection
- Brand and company intelligence

### Research Reports

Each report includes:

- Executive summary
- Key statistics
- Important highlights
- Source citations
- Timeline insights
- Image gallery
- Confidence score
- Suggested follow-up questions

### Premium UI

- Glassmorphism design
- Animated gradients
- Dark research-lab theme
- Framer Motion interactions
- Responsive dashboard experience

### Demo Mode

Works even without API keys.

If Context.dev credentials are unavailable, the application automatically switches to Demo Mode so the full UI can be explored.

---

## 🛠 Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React
- Recharts

### Backend

- Django
- Django REST Framework
- Python

### Data Layer

- Context.dev APIs
- Multi-source web research
- Structured data extraction
- Source verification engine

---

## 📂 Project Structure

```text
research-agent/

├── backend_django/
│
│   ├── backend_django/
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   │
│   ├── research_api/
│   │   ├── __init__.py
│   │   ├── views.py
│   │   │
│   │   ├── services/
│   │   │   ├── context_client.py
│   │   │   └── research_agent.py
│   │   │
│   │   └── utils/
│   │       ├── extract_stats.py
│   │       └── source_ranker.py
│   │
│   ├── .env
│   ├── .env.example
│   ├── db.sqlite3
│   ├── manage.py
│   ├── requirements.txt
│   └── test_research.py
│
└── frontend/
    │
    ├── public/
    │   ├── favicon.svg
    │   └── icons.svg
    │
    ├── src/
    │   ├── assets/
    │   │   ├── hero.png
    │   │   ├── react.svg
    │   │   └── vite.svg
    │   │
    │   ├── components/
    │   │   ├── AnswerCard.jsx
    │   │   ├── EmptyState.jsx
    │   │   ├── FollowupQuestions.jsx
    │   │   ├── ImageGallery.jsx
    │   │   ├── ResearchProgress.jsx
    │   │   ├── SearchHero.jsx
    │   │   └── SourcePanel.jsx
    │   │
    │   ├── App.jsx
    │   ├── App.css
    │   ├── index.css
    │   └── main.jsx
    │
    ├── index.html
    ├── eslint.config.js
    ├── package.json
    └── .gitignore
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/your-username/research-agent.git

cd research-agent
```

---

## Backend Setup

Create a virtual environment:

```bash
python -m venv venv
```

Activate the environment:

### Windows

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file:

```env
DEBUG=True

SECRET_KEY=your-secret-key

CONTEXT_API_KEY=
```

Run migrations:

```bash
python manage.py migrate
```

Start the backend:

```bash
python manage.py runserver
```

Backend URL:

```text
http://localhost:8000
```

---

## Frontend Setup

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

## 🔍 API Endpoint

### Research Query

**POST**

```http
/api/research/
```

Request:

```json
{
  "query": "How many AirPods got sold this year?"
}
```

Example Response:

```json
{
  "query": "How many AirPods got sold this year?",
  "answer": "Estimated sales are approximately XX million units based on analyst shipment reports.",
  "confidence": 0.78,
  "accuracy_note": "Apple does not publicly disclose exact AirPods unit sales.",
  "key_stats": [],
  "highlights": [],
  "sources": [],
  "images": [],
  "timeline": [],
  "followups": []
}
```

---

## 📊 Research Pipeline

The platform follows a multi-stage research workflow:

### 1. Query Understanding

Identify:

- Intent
- Entities
- Industry
- Timeframe

### 2. Source Discovery

Locate:

- Company websites
- Industry reports
- Research articles
- News publications

### 3. Content Collection

Using Context.dev:

- Crawl pages
- Scrape content
- Capture screenshots
- Extract metadata

### 4. Data Extraction

Extract:

- Statistics
- Dates
- Organizations
- Products
- Trends

### 5. Verification

Compare findings across sources.

Detect:

- Agreement
- Contradictions
- Missing evidence

### 6. Report Generation

Generate:

- Summary
- Highlights
- Timeline
- Confidence score
- Follow-up questions

---

## 🎯 Demo Mode

If:

```env
CONTEXT_API_KEY=your_context_api_key (from context.dev)
```

is empty, the system automatically switches to Demo Mode.

Users can still:

- Search
- View reports
- Explore the interface
- Test functionality

The report will clearly display:

> This is demo data. Connect Context.dev API for live research results.

---

## 🔐 Accuracy Principles

- Never invent facts
- Never invent statistics
- Always provide source references
- Display confidence scores
- Highlight source disagreements
- Separate verified data from inferred estimates

---

## 📜 License

MIT License

---

##  Acknowledgements

Built with:

- Context.dev
- Django REST Framework
- React
- Tailwind CSS
- Framer Motion
- Recharts

Designed as a premium research workspace for analysts, students, founders, developers, and researchers.
