import urllib.parse

def rank_sources(sources, query=""):
    """
    Ranks and filters search result URLs.
    Filters out search engines, social media, and ad networks.
    Scores pages based on domain credibility and relevance markers.
    """
    if not isinstance(sources, list):
        return []
        
    blacklist_domains = [
        'duckduckgo.com',
        'google.com',
        'bing.com',
        'yahoo.com',
        'yandex.ru',
        'yandex.com',
        'facebook.com',
        'twitter.com',
        'instagram.com',
        'linkedin.com',
        'pinterest.com',
        'tiktok.com',
        'doubleclick.net',
        'adsystem.com',
        'adnxs.com'
    ]
    
    query_keywords = [k.lower() for k in query.split() if len(k) > 2]
    
    ranked = []
    for source in sources:
        title = source.get('title', '')
        url = source.get('url', '')
        
        try:
            parsed_url = urllib.parse.urlparse(url)
            hostname = parsed_url.hostname.lower() if parsed_url.hostname else ""
        except Exception:
            continue
            
        # Check blacklist
        if any(domain in hostname for domain in blacklist_domains):
            continue
            
        score = 0
        
        # Keyword match
        for keyword in query_keywords:
            if keyword in title.lower():
                score += 10
            if keyword in url.lower():
                score += 5
                
        # Domain authority scoring
        if 'wikipedia.org' in hostname:
            score += 15
        elif any(news in hostname for news in ['reuters.com', 'bloomberg.com', 'cnbc.com']):
            score += 12
        elif any(tech in hostname for tech in ['techcrunch.com', 'theverge.com', 'wired.com']):
            score += 10
        elif any(gov in hostname for gov in ['.gov', '.edu', '.org']):
            score += 8
            
        # Deep links vs homepage
        path_parts = [p for p in parsed_url.path.split('/') if p]
        if len(path_parts) > 0:
            score += 3
        else:
            score -= 5
            
        ranked_source = dict(source)
        ranked_source['score'] = score
        ranked.append(ranked_source)
        
    ranked.sort(key=lambda x: x['score'], reverse=True)
    return ranked
