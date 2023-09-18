FROM node:18-alpine

EXPOSE 8080
WORKDIR /app

COPY dist/**/* .

RUN ls -al

ENTRYPOINT ["npm", "run", "start:prod"]
