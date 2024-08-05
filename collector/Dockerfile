FROM python:3.12.1-slim-bullseye

RUN apt update
RUN apt install -y p7zip-full curl xvfb dbus-x11

RUN curl -O https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN apt install ./google-chrome-stable_current_amd64.deb -y

RUN adduser collector
WORKDIR /home/collector

RUN curl -sSL https://install.python-poetry.org | POETRY_HOME=/etc/poetry python3 -
ENV PATH=$PATH:/etc/poetry/bin
RUN poetry config virtualenvs.in-project true

COPY ./src ./src
COPY ./pyproject.toml ./pyproject.toml
RUN poetry install --no-root

COPY ./font/notosansjp/NotoSansJP-VariableFont_wght.ttf /usr/share/fonts/notosansjp
RUN fc-cache -fv

COPY ./startup.sh /tmp/startup.sh
ENTRYPOINT ["/bin/bash", "/tmp/startup.sh"]