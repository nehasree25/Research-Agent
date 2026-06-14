import requests
import logging

logger = logging.getLogger(__name__)

class ContextClient:
    """
    ContextClient - Service wrapper for Context.dev APIs in Python.
    Handles scraping and brand retrievals.
    """
    def __init__(self, api_key, base_url='https://api.context.dev'):
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')

    def get_headers(self):
        return {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }

    def scrape_url(self, url):
        """
        Scrapes a URL into clean Markdown.
        """
        if not self.api_key:
            raise ValueError('Context.dev API key is missing')
        try:
            logger.info(f'[ContextClient] Scraping URL: {url}')
            response = requests.get(
                f'{self.base_url}/v1/web/scrape/markdown',
                params={'url': url},
                headers=self.get_headers(),
                timeout=30
            )
            response.raise_for_status()
            
            # Support both direct text return and structured dictionary JSON schemas
            try:
                data = response.json()
                if isinstance(data, str):
                    return data
                if isinstance(data, dict):
                    if 'markdown' in data:
                        return data['markdown']
                    if 'content' in data:
                        return data['content']
                return str(data)
            except ValueError:
                return response.text
        except Exception as e:
            logger.error(f'[ContextClient] Error scraping {url}: {e}')
            raise

    def crawl_site(self, url, options=None):
        """
        Initiates a crawl.
        """
        if not self.api_key:
            raise ValueError('Context.dev API key is missing')
        if options is None:
            options = {}
        try:
            logger.info(f'[ContextClient] Crawling site: {url}')
            payload = {
                'url': url,
                'limit': options.get('limit', 10),
                **options
            }
            response = requests.post(
                f'{self.base_url}/v1/web/crawl',
                json=payload,
                headers=self.get_headers(),
                timeout=45
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f'[ContextClient] Error crawling {url}: {e}')
            raise

    def get_brand_data(self, domain):
        """
        Retrieves company details, logos, and styles.
        """
        if not self.api_key:
            raise ValueError('Context.dev API key is missing')
        try:
            logger.info(f'[ContextClient] Retrieving brand data for: {domain}')
            response = requests.get(
                f'{self.base_url}/v1/brand/retrieve',
                params={'domain': domain},
                headers=self.get_headers(),
                timeout=15
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f'[ContextClient] Error retrieving brand data for {domain}: {e}')
            # Fallback
            return {
                "domain": domain,
                "name": domain.split('.')[0],
                "logo": f"https://logo.clearbit.com/{domain}",
                "colors": ["#3b82f6", "#1e3a8a"]
            }
