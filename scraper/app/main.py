import os
import asyncio
import logging
import threading
from logging.handlers import RotatingFileHandler
from fastapi import FastAPI
import uvicorn
from prometheus_client import make_asgi_app
from app.scraper.service import scraper_service

# Ensure logs directory exists
os.makedirs("logs", exist_ok=True)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(),
        RotatingFileHandler("logs/scraper.log", maxBytes=10*1024*1024, backupCount=5)
    ]
)

logger = logging.getLogger("scraper_main")

# FastAPI app for Actuator & Metrics
app = FastAPI(title="RDV Scraper Actuator")

# Mount Prometheus metrics at /metrics
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

@app.get("/health")
def health():
    """
    Health check for the scraper service.
    """
    return {
        "status": "UP",
        "service": "rdv_scraper",
        "details": {
            "scraper_loop_running": scraper_service._is_running if hasattr(scraper_service, "_is_running") else "unknown"
        }
    }

@app.get("/info")
def info():
    return {
        "service": "rdv_scraper",
        "description": "Scraper service for RDV Prefecture",
        "version": "1.0.0"
    }

async def run_scraper():
    logger.info("Starting RDV Scraper Loop...")
    await scraper_service.start_loop()

async def main():
    logger.info("Starting RDV Scraper Service with Actuator on port 9091...")
    
    # Run the actuator/metrics server on port 9091
    # We run it in a separate task
    config = uvicorn.Config(app, host="0.0.0.0", port=9091, log_level="warning")
    server = uvicorn.Server(config)
    
    # Run both the server and the scraper loop
    await asyncio.gather(
        server.serve(),
        run_scraper()
    )

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Scraper service stopped by user.")
    except Exception as e:
        logger.error(f"Scraper service crashed: {e}")
