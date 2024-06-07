FROM node:22-bullseye-slim

RUN adduser client
USER client
WORKDIR /home/client

COPY ./src ./src
COPY ./package.json ./package.json
COPY ./tsconfig.json ./tsconfig.json
COPY ./tsconfig.node.json ./tsconfig.node.json
COPY ./vite.config.ts ./vite.config.ts

RUN npm install
RUN npm run build

COPY ./startup.sh /tmp/startup.sh
ENTRYPOINT ["/bin/bash", "/tmp/startup.sh"]