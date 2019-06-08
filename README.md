# charleybot
charleybot is a discord bot that will generate "it's always sunny in philadelphia" title cards on command

## add charleybot to your server
https://discordapp.com/api/oauth2/authorize?client_id=583576611077750805&permissions=67177472&scope=bot

## commands
`!sunny <message>` - this will generate an iasip title card with the message contained

## build your own charleybot
* clone this repo
* `cp src/config.sample.ts src/config.ts`
* get a discord bot token and put it in `src/config.ts`
* `docker-compose build`
* `docker-compose up -d`