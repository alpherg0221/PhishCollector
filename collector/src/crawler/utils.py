import logging
import os
from datetime import datetime
from urllib.parse import urlparse

from playwright.async_api import Page


logger = logging.getLogger("uvicorn.app")


def now():
    return datetime.now().strftime('%Y/%m/%d %H:%M:%S')


async def stealth(page: Page) -> None:
    await page.add_init_script("delete Object.getPrototypeOf(navigator).webdriver")

    await page.add_init_script("""
        const elementDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
        Object.defineProperty(HTMLDivElement.prototype, 'offsetHeight', {
            ...elementDescriptor,
            get: function() {
                if (this.id === 'modernizr') {
                    return 1;
                }
                return elementDescriptor.get.apply(this);
            },
        });
        """)

    await page.add_init_script("""
    HTMLMediaElement.prototype.canPlayType = function (type) {
        return 'probably'
    };
    """)


async def make_info_file(main_path: str, target_url: str, url: str, target: str, gsb: str) -> str:
    # ディレクトリ名：クロールするURLのドメインとする
    dirname = f'/home/tmp/PhishData/{urlparse(url).netloc}'
    # ファイル名：info.txt
    filename = f'{dirname}/info.txt'

    # ディレクトリを作成
    try:
        os.makedirs(os.path.dirname(filename), exist_ok=False)
    except FileExistsError:
        logger.error(f"既に存在するディレクトリです : {dirname}")
        raise FileExistsError()

    # info.txtに書き込み
    with open(filename, mode='w') as f:
        f.write(f'main:{main_path}\ntarget:None\n発見：{now()}\nURL：{url}\n対象：{target}\nGSB：{gsb}\n')

    return dirname
