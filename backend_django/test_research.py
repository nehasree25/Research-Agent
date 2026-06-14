import os
import sys
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

# Ensure imports can find research_api modules
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

from research_api.services.research_agent import run_research

# Load environment configs
load_dotenv(os.path.join(BASE_DIR, '.env'))
load_dotenv(os.path.join(os.path.dirname(BASE_DIR), '.env'))

def test():
    query = 'How many AirPods got sold this year?'
    config = {
        "CONTEXT_API_KEY": os.getenv('CONTEXT_API_KEY'),
        "OPENAI_API_KEY": os.getenv('OPENAI_API_KEY'),
        "GEMINI_API_KEY": os.getenv('GEMINI_API_KEY')
    }

    print("===============================================")
    print(" Testing Python Research Agent Pipeline        ")
    print(f" Target: \"{query}\"")
    print(f" Key State: CONTEXT={'Set' if config['CONTEXT_API_KEY'] else 'Missing'}, GEMINI={'Set' if config['GEMINI_API_KEY'] else 'Missing'}, OPENAI={'Set' if config['OPENAI_API_KEY'] else 'Missing'}")
    print("===============================================")

    def on_progress(stage, detail):
        print(f" * [{stage}] -> {detail}")

    try:
        report = run_research(query, config, on_progress)
        print("\n===============================================")
        print(" [OK] TEST SUCCESS! Python Report Compiled       ")
        print("===============================================")
        print(f" Query:        {report.get('query')}")
        print(f" Confidence:   {report.get('confidence')}")
        print(f" Key Stats:    {len(report.get('key_stats', []))} items")
        print(f" Sources:      {len(report.get('sources', []))} items")
        print(f" Images:       {len(report.get('images', []))} items")
        print(f" Timeline:     {len(report.get('timeline', []))} items")
        print(f" Followups:    {len(report.get('followups', []))} items")
        print(f" Answer Snippet:\n {report.get('answer')[:250]}...")
        print("===============================================")
    except Exception as error:
        print("\n===============================================")
        print(" [ERROR] TEST FAILURE! Error occurred:")
        print("===============================================")
        import traceback
        traceback.print_exc()
        print("===============================================")

if __name__ == '__main__':
    test()
