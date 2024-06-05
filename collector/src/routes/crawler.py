import subprocess

from fastapi import APIRouter
from fastapi.responses import PlainTextResponse

from src.crawler.crawler import playwright_main

router_crawler = APIRouter()


@router_crawler.get("/collect", summary="フィッシングページを収集する")
async def collect(url: str, target: str, gsb: bool):
    dir_path = await playwright_main(mobile="n", url=url, target=target, gsb=gsb)
    subprocess.run(["chmod", "-R", "777", f"/home/tmp/PhishData/{dir_path}"])
    return PlainTextResponse("OK", status_code=200)


@router_crawler.get("/collectAll", summary="複数のフィッシングページを収集する")
async def collect_all(urls: list[str], target: str, gsb: bool):
    for url in urls:
        dir_path = await playwright_main(mobile="n", url=url, target=target, gsb=gsb)
        subprocess.run(["chmod", "-R", "777", f"/home/tmp/PhishData/{dir_path}"])
        return PlainTextResponse("OK", status_code=200)
