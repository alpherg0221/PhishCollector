FROM python:3.12.1-slim-bullseye

RUN adduser collector
WORKDIR /home/collector

RUN pip install --upgrade pip
RUN pip install  fastapi "uvicorn[standard]"

CMD ["uvicorn", "src.app:app", "--host", "0.0.0.0", "--port", "8080", "--reload"]