FROM node:16-alpine

WORKDIR /usr/src/app

RUN apk --update add imagemagick && rm -rf /var/cache/apk/*

COPY ./package.json .

COPY ./yarn.lock .

RUN yarn install

COPY . .

RUN yarn build

EXPOSE 3000

CMD ["node", "./build/index.js"]