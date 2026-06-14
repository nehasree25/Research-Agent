import re
import urllib.parse

def heuristic_extract(markdown_text, source_url, source_title):
    """
    Heuristic/Regex-based statistics and facts extractor.
    Used when no LLM API key is available.
    """
    stats = []
    timeline = []
    highlights = []
    images = []

    if not markdown_text or not isinstance(markdown_text, str):
        return {"stats": stats, "timeline": timeline, "highlights": highlights, "images": images}

    lines = markdown_text.split('\n')
    hostname = ""
    try:
        parsed_url = urllib.parse.urlparse(source_url)
        hostname = parsed_url.hostname or ""
    except Exception:
        pass

    # 1. Extract markdown images: ![caption](url)
    image_regex = re.compile(r'!\[([^\]]*)\]\((https?://[^\s)]+)\)')
    for match in image_regex.finditer(markdown_text):
        if len(images) < 5:
            images.append({
                "url": match.group(2),
                "caption": match.group(1) or "Research image source",
                "source": hostname
            })

    # 2. Extract stats and events line by line
    stat_regex = re.compile(
        r'(?:([A-Za-z0-9\s-]{2,40}):\s*)?(\$?\d+(?:\.\d+)?\s*(?:million|billion|trillion|percent|%|units|items|sales|shipped|growth|users|developers))',
        re.IGNORECASE
    )
    year_regex = re.compile(r'\b(202\d)\b')

    for line in lines:
        trimmed = line.strip()
        if not trimmed:
            continue

        # Highlights
        if (trimmed.startswith('- ') or trimmed.startswith('* ')) and len(trimmed) > 30:
            if len(highlights) < 8:
                highlights.append(re.sub(r'^[-*]\s+', '', trimmed))

        # Statistics
        stat_match = stat_regex.search(trimmed)
        if stat_match:
            label = stat_match.group(1)
            value = stat_match.group(2)
            
            if not label:
                idx = trimmed.find(value)
                label = trimmed[max(0, idx - 40):idx].strip()
                label = re.sub(r'^[^\w]+', '', label)

            if not label:
                label = "Research Data Point"
                
            label = label[:30].strip()

            if len(stats) < 5 and not any(s['value'] == value for s in stats):
                yr_match = year_regex.search(trimmed)
                stats.append({
                    "label": label,
                    "value": value,
                    "source": hostname,
                    "year": yr_match.group(1) if yr_match else "2026"
                })

        # Timeline
        year_match = year_regex.search(trimmed)
        if year_match and 40 < len(trimmed) < 150:
            year = year_match.group(1)
            event = re.sub(r'^[-\*\d\.\s#:]+', '', trimmed)
            if len(timeline) < 8 and not any(t['event'] == event for t in timeline):
                timeline.append({
                    "date": year,
                    "event": event
                })

    return {
        "stats": stats,
        "timeline": timeline,
        "highlights": highlights,
        "images": images
    }
