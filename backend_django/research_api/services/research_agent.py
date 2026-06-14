import re
import urllib.parse
import time
import json
import logging
from ..utils.source_ranker import rank_sources
from ..utils.extract_stats import heuristic_extract
from .context_client import ContextClient

logger = logging.getLogger(__name__)

def parse_duckduckgo_links(markdown_text):
    """
    Parses and decodes DuckDuckGo links from scraped markdown content.
    """
    links = []
    # Standard Markdown link regex: [Title](URL)
    link_regex = re.compile(r'\[([^\]]+)\]\((https?://[^\s)]+)\)')
    for match in link_regex.finditer(markdown_text):
        title = match.group(1).strip()
        url = match.group(2)

        # Decode DuckDuckGo redirects if present
        if 'duckduckgo.com/l/?' in url:
            try:
                parsed_url = urllib.parse.urlparse(url)
                query_params = urllib.parse.parse_qs(parsed_url.query)
                uddg = query_params.get('uddg')
                if uddg:
                    url = urllib.parse.unquote(uddg[0])
            except Exception:
                pass

        if (
            url and
            'duckduckgo.com/' not in url and
            not any(l['url'] == url for l in links) and
            title.lower() != 'source' and
            title.lower() != 'cached'
        ):
            links.append({"title": title, "url": url})

    return links

def clean_json_response(str_data):
    if not str_data:
        return '{}'
    clean = str_data.strip()
    if clean.startswith('```json'):
        clean = clean[7:]
    if clean.endswith('```'):
        clean = clean[:-3]
    return clean.strip()

def get_system_prompt(query, context):
    return f"""You are a professional AI researcher compiling a detailed, structured, fact-checked report for the query: "{query}".
Below is the clean markdown scraped from top search results:
---
{context}
---

Your job is to read these sources, verify statements, and output a structured JSON report.
Strictly adhere to the following rules:
1. **Never hallucinate facts or statistics**. If the sources do not provide exact statistics, do not make them up. If data is an estimate, state it clearly.
2. If sources disagree, document the disagreement in the "accuracy_note" or "highlights".
3. Assign a realistic confidence score (0.0 to 1.0) based on source authority, age, and alignment.
4. Extract key statistics. Every statistic must list:
   - "label": Short metric name
   - "value": The metric value (e.g. "75 million", "24%")
   - "source": Name/domain of the source claiming it
   - "year": The year of the data (e.g. "2026")
5. Identify a timeline of relevant events or trend points if applicable.
6. Gather related images from the markdown if present (extract urls and captions).
7. List 3 follow-up questions for expanding this research.

You MUST respond with a JSON object EXACTLY conforming to this structure:
{{
  "query": "{query}",
  "answer": "Detailed answer summary summarizing the findings accurately based only on sources.",
  "confidence": 0.85,
  "accuracy_note": "A note about estimated numbers, disagreements, or limitations of the data.",
  "key_stats": [
    {{
      "label": "Metric Name",
      "value": "Metric Value",
      "source": "domain.com",
      "year": "2026"
    }}
  ],
  "highlights": [
    "Key highlight bullet point 1",
    "Key highlight bullet point 2"
  ],
  "sources": [
    {{
      "title": "Page Title",
      "url": "https://example.com/page",
      "publisher": "domain.com",
      "date": "2026-01-01",
      "summary": "Brief 1-2 sentence summary of what this source claims."
    }}
  ],
  "images": [
    {{
      "url": "https://example.com/image.jpg",
      "caption": "Image caption",
      "source": "domain.com"
    }}
  ],
  "timeline": [
    {{
      "date": "2026",
      "event": "Description of event"
    }}
  ],
  "followups": [
    "Follow-up question 1",
    "Follow-up question 2"
  ]
}}"""

def run_research(query, config, on_progress):
    context_api_key = config.get('CONTEXT_API_KEY')
    openai_api_key = config.get('OPENAI_API_KEY')
    gemini_api_key = config.get('GEMINI_API_KEY')

    context_client = ContextClient(context_api_key)

    # 1. Understanding query
    on_progress('Understanding query', 'Analyzing intent and building search parameters...')
    time.sleep(0.8)

    # 2. Finding relevant sources
    on_progress('Finding relevant sources', 'Searching the web via DuckDuckGo and Context.dev...')
    ddg_url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
    
    try:
        search_results_markdown = context_client.scrape_url(ddg_url)
    except Exception as e:
        logger.error(f'[ResearchAgent] Failed to fetch search results from DuckDuckGo: {e}')
        raise RuntimeError('Failed to fetch web search results using Context.dev. Please check your CONTEXT_API_KEY.')

    raw_links = parse_duckduckgo_links(search_results_markdown)
    logger.info(f'[ResearchAgent] Found {len(raw_links)} raw links')

    ranked_sources = rank_sources(raw_links, query)
    target_sources = ranked_sources[:3]  # Take top 3 sources

    if not target_sources:
        on_progress('Verifying across sources', 'No relevant sources discovered. Attempting secondary crawl...')
        raise RuntimeError('No reliable sources found for the given query. Please refine your query.')

    on_progress(
        'Finding relevant sources',
        f"Identified {len(target_sources)} primary source candidates: {', '.join(urllib.parse.urlparse(s['url']).hostname for s in target_sources)}"
    )
    time.sleep(1.0)

    # 3. Scraping clean content
    on_progress('Scraping clean content', 'Retrieving and formatting web pages into clean markdown...')
    scraped_contents = []

    for i, source in enumerate(target_sources):
        host = urllib.parse.urlparse(source['url']).hostname or "web"
        on_progress('Scraping clean content', f"Scraping [{i + 1}/{len(target_sources)}]: {host}...")

        try:
            markdown = context_client.scrape_url(source['url'])
            scraped_contents.append({
                "title": source['title'],
                "url": source['url'],
                "publisher": host,
                "markdown": markdown
            })
        except Exception as e:
            logger.error(f"[ResearchAgent] Failed to scrape {source['url']}: {e}")

    if not scraped_contents:
        raise RuntimeError('Failed to scrape contents from any of the discovered source URLs.')

    on_progress('Extracting numbers', 'Processing text and isolating statistical declarations...')
    time.sleep(1.0)

    # 4. Verifying across sources & Brand logos
    on_progress('Verifying across sources', 'Cross-referencing claims and loading publisher assets...')
    
    brand_assets = []
    for item in scraped_contents:
        try:
            brand = context_client.get_brand_data(item['publisher'])
            if brand and brand.get('logo'):
                brand_assets.append({
                    "url": brand['logo'],
                    "caption": f"{brand.get('name') or item['publisher']} Logo",
                    "source": item['publisher']
                })
        except Exception:
            pass

    # 5. Generating report
    on_progress('Generating report', 'Synthesizing report, timeline, and suggestions...')

    # Assemble full context for the LLM
    full_scraped_text = "\n\n".join(
        f"--- SOURCE {index + 1}: {s['title']} ({s['url']}) ---\n{s['markdown'][:10000]}"
        for index, s in enumerate(scraped_contents)
    )

    report = None

    # Let's check for AI configuration (Gemini first)
    if gemini_api_key:
        try:
            logger.info('[ResearchAgent] Using Gemini API for report generation')
            import google.generativeai as genai
            genai.configure(api_key=gemini_api_key)
            model = genai.GenerativeModel(
                'gemini-1.5-flash',
                generation_config={"response_mime_type": "application/json"}
            )
            
            prompt = get_system_prompt(query, full_scraped_text)
            response = model.generate_content(prompt)
            responseText = response.text
            report = json.loads(clean_json_response(responseText))
        except Exception as err:
            logger.error(f'[ResearchAgent] Gemini API extraction failed, trying OpenAI... {err}')

    # Fallback to OpenAI if Gemini was not used or failed
    if not report and openai_api_key:
        try:
            logger.info('[ResearchAgent] Using OpenAI API for report generation')
            from openai import OpenAI
            client = OpenAI(api_key=openai_api_key)
            
            prompt = get_system_prompt(query, full_scraped_text)
            completion = client.chat.completions.create(
                model='gpt-4o-mini',
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            report = json.loads(clean_json_response(completion.choices[0].message.content))
        except Exception as err:
            logger.error(f'[ResearchAgent] OpenAI API extraction failed: {err}')

    # Heuristic parsing fallback
    if not report:
        logger.info('[ResearchAgent] Using heuristics/regex for report generation')
        combined_stats = []
        combined_timeline = []
        combined_highlights = []
        combined_images = list(brand_assets)

        for s in scraped_contents:
            h_ext = heuristic_extract(s['markdown'], s['url'], s['title'])
            combined_stats.extend(h_ext['stats'])
            combined_timeline.extend(h_ext['timeline'])
            combined_highlights.extend(h_ext['highlights'])
            combined_images.extend(h_ext['images'])

        # Deduplicate list elements
        unique_timeline = []
        seen_events = set()
        for t in combined_timeline:
            if t['event'] not in seen_events:
                unique_timeline.append(t)
                seen_events.add(t['event'])
        unique_timeline.sort(key=lambda x: x['date'])
        unique_timeline = unique_timeline[:6]

        unique_stats = []
        seen_values = set()
        for s in combined_stats:
            if s['value'] not in seen_values:
                unique_stats.append(s)
                seen_values.add(s['value'])
        unique_stats = unique_stats[:4]

        unique_highlights = list(dict.fromkeys(combined_highlights))[:6]
        
        unique_images = []
        seen_urls = set()
        for img in combined_images:
            if img['url'] not in seen_urls:
                unique_images.append(img)
                seen_urls.add(img['url'])
        unique_images = unique_images[:6]

        # Formulate quick heuristic answer summary
        first_paragraph = ""
        for line in scraped_contents[0]['markdown'].split('\n'):
            line_stripped = line.strip()
            if len(line_stripped) > 100 and not line_stripped.startswith('#') and not line_stripped.startswith('-'):
                first_paragraph = line_stripped[:300]
                break
        
        if not first_paragraph:
            first_paragraph = "Based on the scraped sources, data was retrieved but detailed analysis requires an AI API Key."

        report = {
            "query": query,
            "answer": f"Estimated Answer: {first_paragraph}...\n\n(Note: This summary was generated using heuristic keyword extraction. For human-grade syntheses, please configure your OpenAI or Gemini API Key in the server .env)",
            "confidence": 0.6,
            "accuracy_note": "Heuristic Extraction: Results compiled from pattern-matching heuristics on source pages. Factual accuracy is moderate.",
            "key_stats": unique_stats,
            "highlights": unique_highlights if unique_highlights else [
                f"Scraped source {scraped_contents[0]['publisher']} successfully.",
                "Found matching references for query components."
            ],
            "sources": [
                {
                    "title": s['title'],
                    "url": s['url'],
                    "publisher": s['publisher'],
                    "date": "2026",
                    "summary": re.sub(r'[#\-\*]+', '', s['markdown'][:200]).strip() + "..."
                } for s in scraped_contents
            ],
            "images": unique_images,
            "timeline": unique_timeline,
            "followups": [
                f"Learn more about {query}",
                f"Latest updates on {query}",
                f"Check specifications for {query}"
            ]
        }

    # Prepend brand logos to image array
    if brand_assets and 'images' in report:
        for asset in brand_assets:
            if not any(img['url'] == asset['url'] for img in report['images']):
                report['images'].insert(0, asset)

    on_progress('Generating report', 'Finalizing output schema...')
    time.sleep(0.5)

    return report
