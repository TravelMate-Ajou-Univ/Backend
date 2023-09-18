FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json .
RUN npm ci

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY . .

RUN npm run build

EXPOSE 8080
ENTRYPOINT ["npm", "run", "start:prod"]
