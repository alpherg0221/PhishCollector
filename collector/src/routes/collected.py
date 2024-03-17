import os

from fastapi import APIRouter
from pydantic import BaseModel

from src.server import download_path

router = APIRouter()


class PhishInfo(BaseModel):
    url: str
    date: str
    target: str
    gsb: bool


@router.get("/list", summary="収集済みフィッシングサイトのリストを返す", response_model=list[PhishInfo])
async def phish_list():
    phish_info_list = []

    # フィッシングデータがあるディレクトリ
    data_dir = "/home/collector/PhishData"

    # data_dir内のディレクトリのみを抽出 (ファイルを除外)
    files = os.listdir(data_dir)
    saved_dirs = [f for f in files if os.path.isdir(os.path.join(data_dir, f))]

    # 各ディレクトリ内のinfo.txtの内容を読み込み
    for site_dir in saved_dirs:
        with open(f"{data_dir}/{site_dir}/info.txt") as info_file:
            main = info_file.readline().replace("main:", "").replace("\n", "")
            target_url = info_file.readline().replace("target:", "").replace("\n", "")
            date = info_file.readline().replace("発見：", "").replace("\n", "")
            phish_url = info_file.readline().replace("URL：", "").replace("\n", "")
            target = info_file.readline().replace("対象：", "").replace("\n", "")
            gsb = info_file.readline().replace("GSB：", "").replace("\n", "")

            phish_info_list.append({
                "url": phish_url,
                "date": date,
                "target": target,
                "gsb": gsb == "YES"
            })

    return phish_info_list


@router.get("/download", summary="指定したフィッシングサイトをダウンロード", response_model=str)
async def phish_download(url: str = ""):
    return f"{download_path}{url}/phish.zip"
