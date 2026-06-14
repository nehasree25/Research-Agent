import json
import time
import os
import queue
import threading
import logging
from django.http import StreamingHttpResponse, JsonResponse
from django.conf import settings
from django.utils import timezone
from django.views import View
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .services.research_agent import run_research

logger = logging.getLogger(__name__)

# Rich mock reports for demo queries
DEMO_REPORTS = {
  "airpods": {
    "query": "How many AirPods got sold this year?",
    "answer": "This is demo data. Connect Context.dev API for live results.\n\nIn 2026, Apple is projected to sell approximately 82 million AirPods units globally, representing a modest 3.5% year-over-year growth. Wearables, Home, and Accessories revenue reached an estimated $41.2 billion. While Apple doesn't disclose exact unit figures, market trackers show a strong push for the AirPods Pro 3 and updated Entry-level AirPods 4 with Active Noise Cancellation.",
    "confidence": 0.82,
    "accuracy_note": "Apple does not publish unit sales. This estimate is compiled from Canalys, IDC reports, and Apple wearables segment revenue data.",
    "key_stats": [
      { "label": "Projected Shipments", "value": "82.4M units", "source": "Canalys Estimate", "year": "2026" },
      { "label": "Wearables Revenue Est.", "value": "$41.2B", "source": "Bloomberg", "year": "2026" },
      { "label": "Market Share", "value": "31.4%", "source": "IDC", "year": "2026" },
      { "label": "Avg. Selling Price", "value": "$165", "source": "Counterpoint", "year": "2026" }
    ],
    "highlights": [
      "AirPods 4 with ANC became the fastest-selling entry-tier wearables in Apple history.",
      "Growth is driven by replacement cycles for users who bought AirPods Pro in 2022/2023.",
      "Increased competition from Sony, Bose, and sub-$50 ANC earbuds in Asian markets."
    ],
    "sources": [
      { "title": "Global TWS Wearables Shipments Q1 2026", "url": "https://canalys.com/newsroom/tws-wearables-market-2026", "publisher": "canalys.com", "date": "2026-04-12", "summary": "Canalys report tracking TWS audio market share showing Apple's continuous lead in premium earbud sales." },
      { "title": "Apple Wearables Segment Analysis 2026", "url": "https://bloomberg.com/news/apple-wearables-analysis", "publisher": "bloomberg.com", "date": "2026-05-01", "summary": "Financial breakdown of Apple's wearables segment outlining AirPods revenue estimation." }
    ],
    "images": [
      { "url": "https://logo.clearbit.com/apple.com", "caption": "Apple Brand Asset", "source": "apple.com" }
    ],
    "timeline": [
      { "date": "2020", "event": "AirPods Max launched, establishing Apple in over-ear headphones." },
      { "date": "2022", "event": "AirPods Pro 2 released with H2 chip." },
      { "date": "2024", "event": "AirPods 4 series introduced, adding ANC to open-ear models." },
      { "date": "2026", "event": "AirPods Pro 3 with hearing health diagnostics projected for fall release." }
    ],
    "followups": [
      "Compare AirPods sales with Samsung Galaxy Buds",
      "What is Apple wearables revenue breakdown?",
      "AirPods Pro 3 rumored features and release date"
    ]
  },
  "robotaxi": {
    "query": "Latest Tesla robotaxi updates",
    "answer": "This is demo data. Connect Context.dev API for live results.\n\nTesla has deployed its first pilot of the 'Cybercab' robotaxi fleet in Austin, Texas and Los Angeles, California. The autonomous taxi fleet runs on Full Self-Driving (FSD) Supervised v12.9+, showing a significant drop in critical disengagements. Tesla expects regulatory approval for fully driverless commercial rides by late 2026, aiming for a cost-per-mile of $0.30.",
    "confidence": 0.89,
    "accuracy_note": "Data represents Tesla's official announcements alongside safety reports filed with California and Texas DMVs.",
    "key_stats": [
      { "label": "Active Test Vehicles", "value": "350 units", "source": "Texas DMV", "year": "2026" },
      { "label": "Target Cost Per Mile", "value": "$0.30", "source": "Tesla Investor Relations", "year": "2026" },
      { "label": "FSD v12.9 Miles Driven", "value": "3.2B miles", "source": "Tesla Autopilot Safety", "year": "2026" },
      { "label": "Critical Disengagement Rate", "value": "1 per 450k mi", "source": "Independent Audits", "year": "2026" }
    ],
    "highlights": [
      "Autonomous Cybercab ride-sharing app launched in beta for Tesla employees in California.",
      "The vehicle features no steering wheel or pedals, relying entirely on Vision-only FSD.",
      "Inductive wireless charging is standard; the Cybercab lacks a traditional charging port."
    ],
    "sources": [
      { "title": "Tesla Q1 2026 Earnings & Robotaxi Update", "url": "https://tesla.com/investor-relations/q1-2026", "publisher": "tesla.com", "date": "2026-04-20", "summary": "Tesla's official financial report outlining timeline for Cybercab assembly and FSD progress." },
      { "title": "California autonomous driving safety reports 2026", "url": "https://dmv.ca.gov/autonomous-safety-reports", "publisher": "dmv.ca.gov", "date": "2026-05-10", "summary": "Government filings indicating miles driven and safety stats of Tesla's autonomous testing fleet." }
    ],
    "images": [
      { "url": "https://logo.clearbit.com/tesla.com", "caption": "Tesla Brand Asset", "source": "tesla.com" }
    ],
    "timeline": [
      { "date": "2024", "event": "Cybercab prototype unveiled at Warner Bros studios." },
      { "date": "2025", "event": "Vision-only end-to-end neural network FSD v12 rolled out widely." },
      { "date": "2026", "event": "Employee beta testing of Tesla Autonomous network begins in CA." }
    ],
    "followups": [
      "Compare Tesla Cybercab with Waymo's current coverage",
      "What is the pricing model for buying a Tesla Cybercab?",
      "Tesla FSD v12.9 disengagement statistics"
    ]
  },
  "ai_tools": {
    "query": "Top 5 AI coding tools in 2026",
    "answer": "This is demo data. Connect Context.dev API for live results.\n\nIn 2026, the developer tooling landscape is dominated by context-aware IDE agents. The top 5 AI coding tools are: 1. GitHub Copilot Workspace (complete repository agent), 2. Cursor (popular editor with Composer mode), 3. Antigravity IDE (DeepMind's agentic engineering assistant), 4. Windsurf (flow-based coding), and 5. Supermaven (ultra-low latency tab-completion). These tools represent a shift from single line completion to full-stack autonomous coding agents.",
    "confidence": 0.94,
    "accuracy_note": "Rankings sourced from Stack Overflow Developer Survey 2026 and GitHub State of the Octoverse reports.",
    "key_stats": [
      { "label": "Developer Adoption", "value": "92.3%", "source": "Stack Overflow Survey", "year": "2026" },
      { "label": "Cursor Market Share", "value": "38%", "source": "DevTools Index", "year": "2026" },
      { "label": "Avg Productivity Boost", "value": "42%", "source": "GitHub Octoverse", "year": "2026" },
      { "label": "Agentic Code Commits", "value": "28% of total", "source": "GitLab Insights", "year": "2026" }
    ],
    "highlights": [
      "Developer focus has shifted from simple line completion to repository-wide multi-file refactoring.",
      "Context window sizes for IDEs now regularly exceed 2 million tokens.",
      "Security compliance verification is automatically built into agent pipelines."
    ],
    "sources": [
      { "title": "Stack Overflow Developer Survey 2026", "url": "https://survey.stackoverflow.co/2026/", "publisher": "stackoverflow.com", "date": "2026-05-15", "summary": "Comprehensive survey details on developer tool usage, highlighting AI integration trends." },
      { "title": "GitHub State of the Octoverse 2026", "url": "https://github.com/octoverse/2026", "publisher": "github.com", "date": "2026-01-20", "summary": "Analysis of repository commits and pull requests showing AI agent participation levels." }
    ],
    "images": [
      { "url": "https://logo.clearbit.com/github.com", "caption": "GitHub Brand Asset", "source": "github.com" }
    ],
    "timeline": [
      { "date": "2022", "event": "GitHub Copilot launched as a commercial code autocomplete tool." },
      { "date": "2024", "event": "Cursor Editor goes viral with inline Composer and multi-file edits." },
      { "date": "2025", "event": "Vibe coding becomes a recognized trend as developer tools auto-complete whole features." },
      { "date": "2026", "event": "Antigravity IDE and next-gen agent systems write production-ready code with minimal feedback." }
    ],
    "followups": [
      "Compare Cursor vs GitHub Copilot Workspace features",
      "Open-source coding models comparison (Llama-3.3-coder vs Qwen-coder)",
      "How to set up local coding LLMs for privacy compliance"
    ]
  },
  "humanoid_robots": {
    "query": "Which company is leading humanoid robots?",
    "answer": "This is demo data. Connect Context.dev API for live results.\n\nFigure AI (in partnership with OpenAI) and Tesla (with Optimus Gen 3) are leading the humanoid robotics race. Figure AI has deployed robots in BMW automotive factories for logistics tasks, while Tesla has started integrating Optimus inside its own Gigafactories for battery cell sorting. Boston Dynamics (with the electric Atlas) and Agility Robotics (Digit) remain strong contenders with commercial warehousing deals.",
    "confidence": 0.91,
    "accuracy_note": "Data gathered from recent pilot deployments, robotics conferences, and manufacturer press releases.",
    "key_stats": [
      { "label": "Optimus deployed", "value": "1,200 units", "source": "Tesla Gigafactory Texas", "year": "2026" },
      { "label": "Figure AI Funding", "value": "$1.4B", "source": "TechCrunch", "year": "2026" },
      { "label": "Atlas Electric Payload", "value": "25 kg", "source": "Boston Dynamics", "year": "2026" },
      { "label": "Digit Operating Cost", "value": "$3.50 / hour", "source": "Agility Robotics", "year": "2026" }
    ],
    "highlights": [
      "Figure AI robots utilize GPT-5 level visual-textual reasoning to communicate verbally while working.",
      "Tesla Optimus Gen 3 features tactile finger sensors and runs on the same FSD computer used in Tesla cars.",
      "Standardization of humanoid hands (typically 16-22 degrees of freedom) allows for fine manipulation."
    ],
    "sources": [
      { "title": "Figure 02 Factory Deployment Case Study", "url": "https://figure.ai/bmw-deployment", "publisher": "figure.ai", "date": "2026-03-11", "summary": "Detailed breakdown of Figure 02 robots performing logistics and chassis assembly at BMW manufacturing facilities." },
      { "title": "Boston Dynamics Electric Atlas Capabilities", "url": "https://bostondynamics.com/atlas-electric-release", "publisher": "bostondynamics.com", "date": "2025-10-18", "summary": "Technical specs showing transition from hydraulic systems to pure electric joint actuators." }
    ],
    "images": [
      { "url": "https://logo.clearbit.com/figure.ai", "caption": "Figure AI Brand Asset", "source": "figure.ai" }
    ],
    "timeline": [
      { "date": "2022", "event": "Tesla shows early Bumblebee robot prototype on stage." },
      { "date": "2024", "event": "Figure AI raises $675M from Microsoft, OpenAI, and Nvidia; releases Figure 01 video." },
      { "date": "2025", "event": "Boston Dynamics retires hydraulic Atlas in favor of an all-electric design." },
      { "date": "2026", "event": "Tesla begins selling Optimus robots in low volumes to external factory partners." }
    ],
    "followups": [
      "What are the payload specifications of Figure 02?",
      "How does Agility Robotics Digit handle warehouse logistics?",
      "Timeline of Tesla Optimus development from Gen 1 to Gen 3"
    ]
  }
}

def get_demo_key(query):
    q = query.lower()
    if 'airpod' in q or 'apple earbud' in q:
        return 'airpods'
    if 'robotaxi' in q or 'cybercab' in q or 'tesla taxi' in q:
        return 'robotaxi'
    if 'ai coding' in q or 'coding tools' in q or 'copilot' in q or 'cursor' in q:
        return 'ai_tools'
    if 'humanoid' in q or 'robot' in q or 'optimus' in q or 'figure' in q:
        return 'humanoid_robots'
    return None

class ResearchAPIView(APIView):
    """
    Standard POST view to execute search query synchronously.
    """
    def post(self, request):
        query = request.data.get('query')
        if not query:
            return Response({"error": "Query parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

        context_key = os.getenv('CONTEXT_API_KEY')
        demo_key = get_demo_key(query)

        # Serve demo data if API key is missing or is placeholder, and matching query is found
        if (not context_key or context_key.startswith('your_')) and demo_key:
            logger.info(f"[ResearchAPIView] Serving mock report for: {query}")
            return Response(DEMO_REPORTS[demo_key])

        # Serve AirPods fallback if no key at all
        if not context_key:
            fallback = dict(DEMO_REPORTS['airpods'])
            fallback['query'] = query
            fallback['answer'] = f"This is a fallback report because CONTEXT_API_KEY is not configured.\n\nQuery received: \"{query}\".\n\nPlease add a valid CONTEXT_API_KEY to your server settings to execute live scrapes!"
            return Response(fallback)

        try:
            config = {
                "CONTEXT_API_KEY": os.getenv('CONTEXT_API_KEY'),
                "OPENAI_API_KEY": os.getenv('OPENAI_API_KEY'),
                "GEMINI_API_KEY": os.getenv('GEMINI_API_KEY'),
            }
            report = run_research(query, config, lambda stage, detail: logger.info(f"Progress -> {stage}: {detail}"))
            return Response(report)
        except Exception as e:
            logger.error(f"[ResearchAPIView] Error: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ResearchStreamView(View):
    """
    Progressive SSE GET stream.
    """
    def get(self, request):
        query = request.GET.get('query')
        if not query:
            return JsonResponse({"error": "Query parameter is required"}, status=400)

        context_key = os.getenv('CONTEXT_API_KEY')
        demo_key = get_demo_key(query)

        def make_sse_message(event, data):
            return f"event: {event}\ndata: {json.dumps(data)}\n\n"

        # 1. Yield Mock SSE Stream
        if (not context_key or context_key.startswith('your_')) and demo_key:
            def mock_generator():
                demo_steps = [
                    { "stage": "Understanding query", "detail": "Analyzing intent and building search parameters..." },
                    { "stage": "Finding relevant sources", "detail": "Searching the web via DuckDuckGo and Context.dev..." },
                    { "stage": "Scraping clean content", "detail": "Retrieving and formatting web pages into clean markdown..." },
                    { "stage": "Extracting numbers", "detail": "Processing text and isolating statistical declarations..." },
                    { "stage": "Verifying across sources", "detail": "Cross-referencing claims and loading publisher assets..." },
                    { "stage": "Generating report", "detail": "Finalizing output schema..." }
                ]
                for step in demo_steps:
                    yield make_sse_message("progress", step)
                    time.sleep(0.6)
                yield make_sse_message("complete", DEMO_REPORTS[demo_key])

            return StreamingHttpResponse(mock_generator(), content_type="text/event-stream")

        # 2. Yield Fallback SSE if no key
        if not context_key:
            def fallback_generator():
                yield make_sse_message("progress", { "stage": "Understanding query", "detail": "Analyzing intent..." })
                time.sleep(0.4)
                yield make_sse_message("progress", { "stage": "Finding relevant sources", "detail": "No API Key found. Fetching local mock..." })
                time.sleep(0.4)
                yield make_sse_message("progress", { "stage": "Generating report", "detail": "Formatting preview..." })
                time.sleep(0.4)

                fallback = dict(DEMO_REPORTS['airpods'])
                fallback['query'] = query
                fallback['answer'] = f"This is a fallback report because CONTEXT_API_KEY is not configured.\n\nQuery received: \"{query}\".\n\nPlease add a valid CONTEXT_API_KEY to your server settings to execute live scrapes!"
                yield make_sse_message("complete", fallback)

            return StreamingHttpResponse(fallback_generator(), content_type="text/event-stream")

        # 3. Live agent executing in a queue-consumer thread model
        def live_generator():
            q = queue.Queue()

            def on_progress(stage, detail):
                q.put(("progress", { "stage": stage, "detail": detail }))

            def worker():
                try:
                    config = {
                        "CONTEXT_API_KEY": os.getenv('CONTEXT_API_KEY'),
                        "OPENAI_API_KEY": os.getenv('OPENAI_API_KEY'),
                        "GEMINI_API_KEY": os.getenv('GEMINI_API_KEY'),
                    }
                    report = run_research(query, config, on_progress)
                    q.put(("complete", report))
                except Exception as e:
                    q.put(("error", { "message": str(e) }))

            thread = threading.Thread(target=worker)
            thread.daemon = True
            thread.start()

            while thread.is_alive() or not q.empty():
                try:
                    event_type, data = q.get(timeout=0.2)
                    yield make_sse_message(event_type, data)
                    q.task_done()
                except queue.Empty:
                    continue

        return StreamingHttpResponse(live_generator(), content_type="text/event-stream")


class HealthCheckView(APIView):
    """
    Simple view checking API key configuration and responsiveness.
    """
    def get(self, request):
        return Response({
            "status": "ok",
            "timestamp": timezone.now().isoformat(),
            "api_key_status": "Configured" if os.getenv('CONTEXT_API_KEY') else "Missing"
        })

