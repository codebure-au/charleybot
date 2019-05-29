FROM node:alpine 

WORKDIR /usr/src/app

COPY . .

RUN yarn install

RUN apk --update add imagemagick && \
  rm -rf /var/cache/apk/*

EXPOSE 3000

CMD ["npm", "start"]