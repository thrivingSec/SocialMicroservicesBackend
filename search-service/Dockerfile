FROM node:24-alpine
WORKDIR /use/src/app
COPY package*.json .
COPY tsconfig.json .
COPY .env .
COPY src .
RUN npm install
RUN npm run build
EXPOSE 3004
CMD [ "npm", "start" ]
