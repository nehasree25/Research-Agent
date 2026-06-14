# Context Research Studio

An AI-powered research dashboard that uses Context.dev APIs to search, crawl, scrape, analyze, and synthesize information from multiple web sources into structured research reports.

![React](https://img.shields.io/badge/Frontend-React-blue)
![Django](https://img.shields.io/badge/Backend-Django%20REST%20Framework-green)
![Tailwind](https://img.shields.io/badge/UI-TailwindCSS-cyan)
![License](https://img.shields.io/badge/License-MIT-purple)

---

## Overview

Context Research Studio is a modern AI research platform designed to transform raw web information into reliable, evidence-based research reports.

Users can ask questions such as:

* How many AirPods were sold this year?
* Which company is leading humanoid robotics?
* Top smartphone sales in India 2026
* Latest AI tools used by software developers

The platform automatically:

* Understands research intent
* Discovers relevant sources
* Crawls and scrapes websites using Context.dev
* Extracts statistics and structured insights
* Verifies findings across multiple sources
* Calculates confidence scores
* Generates a professional research report

---

## Features

### AI-Powered Research

* Natural language query input
* Multi-source web research
* Automated information extraction
* Structured research reports
* Confidence scoring

### Context.dev Integration

* URL scraping
* Website crawling
* Structured data extraction
* Screenshots and media collection
* Brand and company intelligence

### Research Reports

Each report includes:

* Executive summary
* Key statistics
* Important highlights
* Source citations
* Timeline insights
* Image gallery
* Confidence score
* Suggested follow-up questions

### Premium UI

* Glassmorphism design
* Animated gradients
* Dark research-lab theme
* Framer Motion interactions
* Responsive dashboard experience

### Demo Mode

Works even without API keys.

If Context.dev credentials are unavailable, the application automatically switches to Demo Mode so the full UI can be explored.

---

## Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* Framer Motion
* Lucide React
* Recharts

### Backend

* Django
* Django REST Framework
* Python

### AI & Data Layer

* Context.dev APIs
* OpenAI (Optional)
* Gemini (Optional)

---

## Project Structure

```text
context-research-studio/

frontend/
│
├── src/
│   ├── components/
│   │   ├── SearchHero.jsx
│   │   ├── ResearchProgress.jsx
│   │   ├── AnswerCard.jsx
│   │   ├── StatsGrid.jsx
│   │   ├── SourcePanel.jsx
│   │   ├── ImageGallery.jsx
│   │   ├── Timeline.jsx
│   │   ├── FollowupQuestions.jsx
│   │   └── EmptyState.jsx
│   │
│   ├── pages/
│   │   └── Home.jsx
│   │
│   ├── App.jsx
│   └── main.jsx
│
backend/
│
├── config/
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
│
├── apps/
│   └── research/
│       ├── views.py
│       ├── serializers.py
│       ├── urls.py
│       │
│       ├── services/
│       │   ├── context_client.py
│       │   └── research_agent.py
│       │
│       └── utils/
│           ├── source_ranker.py
│           └── extract_stats.py
│
├── manage.py
└── requirements.txt
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/your-username/context-research-studio.git

cd context-research-studio
```

---

## Backend Setup

Create a virtual environment:

```bash
python -m venv venv
```

Activate:

### Windows

```bash
venv\Scripts\activate
```

### Mac/Linux

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create environment file:

```env
DEBUG=True

SECRET_KEY=your-secret-key

CONTEXT_API_KEY=

AI_API_KEY=
```

Run migrations:

```bash
python manage.py migrate
```

Start backend:

```bash
python manage.py runserver
```

Backend runs on:

```text
http://localhost:8000
```

---

## Frontend Setup

Install packages:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## API Endpoint

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

## Research Pipeline

The platform follows a multi-stage research workflow:

### 1. Query Understanding

Identify:

* Intent
* Entities
* Industry
* Timeframe

### 2. Source Discovery

Locate:

* Company websites
* Industry reports
* Research articles
* News publications

### 3. Content Collection

Using Context.dev:

* Crawl pages
* Scrape content
* Capture screenshots
* Extract metadata

### 4. Data Extraction

Extract:

* Statistics
* Dates
* Organizations
* Products
* Trends

### 5. Verification

Compare findings across sources.

Detect:

* Agreement
* Contradictions
* Missing evidence

### 6. Report Generation

Generate:

* Summary
* Highlights
* Timeline
* Confidence score
* Follow-up questions

---

## Demo Mode

If:

```env
CONTEXT_API_KEY=
```

is empty, the system automatically switches to Demo Mode.

Users can still:

* Search
* View reports
* Explore UI
* Test interactions

The report will clearly display:

> This is demo data. Connect Context.dev API for live research results.

---

## Confidence Score

Scores are calculated using:

| Factor              | Weight |
| ------------------- | ------ |
| Number of Sources   | High   |
| Source Authority    | High   |
| Data Consistency    | High   |
| Data Freshness      | Medium |
| Structured Evidence | Medium |

Confidence Range:

| Score       | Meaning              |
| ----------- | -------------------- |
| 0.90 - 1.00 | Very High Confidence |
| 0.75 - 0.89 | High Confidence      |
| 0.50 - 0.74 | Moderate Confidence  |
| Below 0.50  | Low Confidence       |

---

## Future Enhancements

* Research history
* User accounts
* Saved reports
* PDF export
* Team collaboration
* AI-generated charts
* Source credibility ranking
* Real-time monitoring
* Scheduled research jobs
* Multi-language research

---

## Design Philosophy

Context Research Studio is built around three principles:

### Transparency

Every claim should be traceable to a source.

### Accuracy

Never invent facts or statistics.

### Research First

Focus on evidence-backed answers instead of generic AI responses.

---

## License

MIT License

---

## Acknowledgements

Built with:

* Context.dev
* Django REST Framework
* React
* Tailwind CSS
* Framer Motion
* Recharts

Designed as a premium AI-powered research workspace for analysts, students, founders, developers, and researchers.
