FROM node:16.18.0

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN apt-get update && apt-get install -y redis-server

EXPOSE 4001
EXPOSE 6379

CMD service redis-server start && node index.js
