FROM python:3.12.1-slim-bullseye

RUN apt update
RUN apt install -y p7zip-full curl

RUN curl -O https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN apt install ./google-chrome-stable_current_amd64.deb -y

RUN adduser collector
USER collector
WORKDIR /home/collector

RUN curl -sSL https://install.python-poetry.org | python3 -
ENV PATH=$PATH:/home/collector/.local/bin
RUN poetry config virtualenvs.in-project true

COPY ./src ./src
COPY ./pyproject.toml ./pyproject.toml
RUN poetry install --no-root

COPY ./startup.sh /tmp/startup.sh
ENTRYPOINT ["/bin/bash", "/tmp/startup.sh"]