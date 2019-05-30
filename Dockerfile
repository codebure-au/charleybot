FROM node:alpine 

WORKDIR /usr/src/app

RUN apk --update add imagemagick && rm -rf /var/cache/apk/*

COPY ./package.json .

COPY ./yarn.lock .

RUN yarn install

COPY . .

RUN yarn prepare

EXPOSE 3000

CMD ["yarn", "start"]