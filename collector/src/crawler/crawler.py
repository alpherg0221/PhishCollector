import asyncio
import logging
import os
import re
from io import BytesIO
from urllib.parse import urlparse, unquote

from PIL import Image

from playwright.async_api import async_playwright, Response
from playwright_stealth import stealth_async
from playwright._impl._errors import Error

from src.crawler.utils import make_info_file, stealth
from src.utils.chrome_options import playwright_ignore_args, playwright_args

locale = "ja"
mobile_ua = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36"


logger = logging.getLogger("uvicorn.app")


async def playwright_main_with_gsb_check(mobile: str, url: str, target: str) -> str | None:
    # GSB確認処理
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
        try:
            await page.goto(url)
        except Error:
            pass
        finally:
            await asyncio.sleep(1)
            screenshot = await page.screenshot(type="png", full_page=True)
            image = Image.open(BytesIO(screenshot))

            size = image.size
            all_pixels = size[0] * size[1]
            red_pixels = sorted(image.getcolors(size[0] * size[1]), reverse=True)[0][0]
            gsb = red_pixels / all_pixels > 0.8

        return await playwright_main(mobile, url, target, gsb)


async def playwright_main(mobile: str, url: str, target: str, gsb: bool) -> str | None:
    async with async_playwright() as playwright:
        # 実際のchromeを使用、Headlessモードで起動、navigator.webdriver=falseに設定
        browser = await playwright.chromium.launch(
            channel="chrome",
            headless=True,
            args=["--disable-blink-features=AutomationControlled"],
        )
        # androidのUserAgentを使う場合の場合分け
        if mobile == "y":
            context = await browser.new_context(
                ignore_https_errors=True,
                java_script_enabled=True,
                locale=locale,
                user_agent=mobile_ua,
            )
        else:
            context = await browser.new_context(
                ignore_https_errors=True,
                java_script_enabled=True,
                locale=locale,
            )

        # 新しいページを開く
        page = await context.new_page()

        # 検知回避策
        await stealth_async(page)
        await stealth(page)

        # URLに移動
        await page.goto(url)
        # ページ全体が読み込まれるまで待つ
        await page.wait_for_load_state()
        # input:not([type="hidden"])に一致する要素が1個以上出現するまで待つ
        await page.wait_for_function("() => document.querySelectorAll('input:not([type=\"hidden\"])').length > 0")
        # 1秒待つ
        await page.wait_for_timeout(1000)

        parsed = urlparse(page.url)
        # URLがパスのみの場合, index.htmlを追加
        if page.url.endswith("/"):
            new_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}index.html"
        # URLが.htmlで終わらない場合, .htmlを追加
        elif not page.url.endswith(".html"):
            new_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}.html"
        else:
            new_url = page.url

        # 保存ディレクトリとinfo.txtを作成
        saved_dirname = await make_info_file(
            main_path=f".{urlparse(new_url).path}",
            target_url="",
            url=page.url,
            target=target,
            gsb="YES" if gsb else "NO"
        )

        # ページを閉じる
        await page.close()
        # 新しいページを作成
        page = await context.new_page()
        # リソースを保存するイベントハンドラを設定
        page.on("response", lambda res: save_resources(res, saved_dirname))
        # URLに移動
        await page.goto(url)
        # ページ全体が読み込まれるまで待つ
        await page.wait_for_load_state()
        # input:not([type="hidden"])に一致する要素が1個以上出現するまで待つ
        await page.wait_for_function("() => document.querySelectorAll('input:not([type=\"hidden\"])').length > 0")
        # 1秒待つ
        await page.wait_for_timeout(1000)

        # スクリーンショットを保存
        await page.screenshot(path=f'{saved_dirname}/snapshot.png', full_page=True)

        # メインページを保存
        page_content = await page.content()
        depth = urlparse(page.url).path.count("/") - 1
        await save_main_page(page_content, f"{saved_dirname}{urlparse(new_url).path}", depth)

        return urlparse(page.url).netloc


# リソース保存用の関数
async def save_resources(res: Response, dirname: str) -> None:
    # URLの最後が / なら保存しないで終了
    if res.url.endswith("/"):
        filename = f"{dirname}{urlparse(unquote(res.url)).path}resource"
        os.makedirs(os.path.dirname(filename), exist_ok=True)
    else:
        filename = f"{dirname}{urlparse(unquote(res.url)).path}"
        os.makedirs(os.path.dirname(filename), exist_ok=True)

    with open(filename, "wb") as f:
        f.write(await res.body())

    # logger.info(f"{res.url}\n\t\t\t-> {filename}")


# メインページ保存用の関数
async def save_main_page(content: str, filename: str, depth: int) -> None:
    # パスの書き換え
    add_path = "../" * depth if depth >= 1 else "./"
    # // を https:// に変換
    content = re.sub('src="//', 'src="https://', content)
    content = re.sub('href="//', 'href="https://', content)
    # /path を ./path に変換
    content = re.sub('src="/(.+?)"', f'src="{add_path}\\1"', content)
    content = re.sub('href="/(.+?)"', f'href="{add_path}\\1"', content)

    # 内容を保存
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, "w") as f:
        f.write(content)

    logger.info(f"Main Page : {filename}")
