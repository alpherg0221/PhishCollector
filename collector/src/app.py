import asyncio
import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, Request
from fastapi.responses import PlainTextResponse, Response
from fastapi.middleware.cors import CORSMiddleware

from playwright.async_api import async_playwright

from src.routes.crawler import router_crawler
from src.routes.collected import router_collected
from src.utils.chrome_options import playwright_args, playwright_ignore_args

logger = logging.getLogger("uvicorn.app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"{datetime.now().strftime('%Y/%m/%d %H:%M:%S')} Started GSB List Download")

    # GSB listの読み込み
    if not os.path.exists("/home/collector/profile/Safe Browsing"):
        # エラーが出る場合はProfileディレクトリを削除
        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch_persistent_context(
                user_data_dir="/home/collector/profile",
                channel="chrome",
                headless=False,
                ignore_default_args=playwright_ignore_args(),
                args=playwright_args(),
                ignore_https_errors=True,
                java_script_enabled=True,
                locale="ja",
            )
            page = await browser.new_page()
            await page.goto("chrome://safe-browsing/#tab-db-manager")
            await asyncio.sleep(120)

    logger.info(f"{datetime.now().strftime('%Y/%m/%d %H:%M:%S')} Completed GSB List Download")

    yield


app = FastAPI(root_path="/PhishCollector/api", lifespan=lifespan)

app.include_router(router_collected, prefix="/collected", tags=["api_collected"])
app.include_router(router_crawler, prefix="/crawler", tags=["api_crawler"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/status", tags=["status"])
async def status():
    return PlainTextResponse("RUNNING", status_code=200)


@app.exception_handler(Exception)
async def exception_handler(req: Request, e: Exception):
    return Response(
        headers={"access-control-allow-origin": "*"},
        status_code=500,
    )
