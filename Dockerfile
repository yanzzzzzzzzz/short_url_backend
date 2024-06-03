FROM node:16.18.0

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN if [ ! -f .env ]; then echo "SECRET=$(openssl rand -hex 16)" > .env; fi

RUN apt-get update && apt-get install -y redis-server

EXPOSE 4001
EXPOSE 6379

CMD service redis-server start && npm run docker
