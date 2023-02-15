FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm i

EXPOSE 6064

COPY . .

ENTRYPOINT ["node", "."]
