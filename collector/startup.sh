#!/bin/bash

# 仮想スクリーンの起動
export DISPLAY=:1
Xvfb :1 -screen 0 1920x1080x24 &

poetry run uvicorn src.app:app --host 0.0.0.0 --port 8080