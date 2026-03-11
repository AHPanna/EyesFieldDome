import asyncio
import random
from typing import Optional
from playwright.async_api import async_playwright
# Removed playwright_stealth as it's buggy in Python 3.12
from app.config import settings

class BaseScraper:
    def __init__(self, use_proxy: bool = False):
        self.use_proxy = use_proxy
        self.proxies = [
            # Example proxies - in production, these would come from a provider or config
            "http://proxy1.example.com:8080",
            "http://proxy2.example.com:8080",
        ]

    async def get_browser_context(self, playwright):
        proxy = None
        if self.use_proxy and self.proxies:
            proxy_url = random.choice(self.proxies)
            proxy = {"server": proxy_url}

        browser = await playwright.chromium.launch(
            headless=True, # Set to False for debugging
            args=["--no-sandbox", "--disable-setuid-sandbox"]
        )
        
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 720},
            proxy=proxy
        )
        return browser, context

    async def scrape_url(self, url: str):
        async with async_playwright() as p:
            browser, context = await self.get_browser_context(p)
            page = await context.new_page()
            
            # Apply manual stealth (property overrides)
            await page.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined
                });
                Object.defineProperty(navigator, 'plugins', {
                    get: () => [1, 2, 3, 4, 5]
                });
                Object.defineProperty(navigator, 'languages', {
                    get: () => ['fr-FR', 'fr', 'en-US', 'en']
                });
            """)
            
            try:
                # Random delay to mimic human behavior
                await asyncio.sleep(random.uniform(1, 3))
                
                await page.goto(url, wait_until="networkidle", timeout=60000)
                
                # Further processing logic would go here
                content = await page.content()
                return content
            except Exception as e:
                print(f"Scraping failed for {url}: {e}")
                return None
            finally:
                await browser.close()
