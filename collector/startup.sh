#!/bin/bash

poetry run uvicorn src.app:app --host 0.0.0.0 --port 8080 --reload