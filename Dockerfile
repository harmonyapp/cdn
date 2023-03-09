FROM node:18.15-alpine

WORKDIR /app

COPY package*.json ./

RUN npm i

EXPOSE 6064

COPY . .

ENTRYPOINT ["node", "."]
