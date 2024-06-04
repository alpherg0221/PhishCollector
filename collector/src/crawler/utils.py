import os
import sys
from datetime import datetime
from typing import Final
from urllib.parse import urlparse

from playwright.async_api import Page


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
    dirname = f'../Saved/{urlparse(url).netloc}'
    # ファイル名：info.txt
    filename = f'{dirname}/info.txt'

    # ディレクトリを作成
    try:
        os.makedirs(os.path.dirname(filename), exist_ok=False)
    except FileExistsError:
        print('既に存在するディレクトリです')
        sys.exit(1)

    # info.txtに書き込み
    with open(filename, mode='w') as f:
        f.write(f'main:{main_path}\ntarget:None\n発見：{now()}\nURL：{url}\n対象：{target}\nGSB：{gsb}\n')

    return dirname


class CrawlerParams:
    USER_AGENT: Final[str] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " \
                             "Chrome/113.0.0.0 Safari/537.36"
    USER_AGENT_FIREFOX: Final[str] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/114.0"
