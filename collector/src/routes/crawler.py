from fastapi import APIRouter

from src.crawler.crawler import playwright_main

router_crawler = APIRouter()


@router_crawler.get("/collect", summary="フィッシングページを収集する")
async def collect(url: str, target: str, gsb: bool):
    await playwright_main(mobile="n", url=url, target=target, gsb=gsb)


@router_crawler.get("/collectAll", summary="複数のフィッシングページを収集する")
async def collect_all(urls: list[str], target: str, gsb: bool):
    for url in urls:
        await playwright_main(mobile="n", url=url, target=target, gsb=gsb)
