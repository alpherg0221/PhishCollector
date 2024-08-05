import subprocess

from fastapi import APIRouter
from fastapi.responses import PlainTextResponse

from src.crawler.crawler import playwright_main, playwright_main_with_gsb_check

router_crawler = APIRouter()


@router_crawler.get("/collect", summary="フィッシングページを収集する")
async def collect(url: str, target: str, gsb: bool = None):
    try:
        if gsb is None:
            dir_path = await playwright_main_with_gsb_check(mobile="n", url=url, target=target)
        else:
            dir_path = await playwright_main(mobile="n", url=url, target=target, gsb=gsb)
    except FileExistsError as e:
        return PlainTextResponse("既に存在するディレクトリです", status_code=200)

    subprocess.run(["chmod", "-R", "777", f"/home/tmp/PhishData/{dir_path}"])
    return PlainTextResponse("OK", status_code=200)


@router_crawler.get("/collectAll", summary="複数のフィッシングページを収集する")
async def collect_all(urls: list[str], target: str, gsb: bool):
    for url in urls:
        dir_path = await playwright_main(mobile="n", url=url, target=target, gsb=gsb)
        subprocess.run(["chmod", "-R", "777", f"/home/tmp/PhishData/{dir_path}"])
        return PlainTextResponse("OK", status_code=200)
