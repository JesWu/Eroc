# Eroc
Basic Discord bot

## Getting Started
Setup instructions for getting Eroc up & running.

### Prerequisites
You will need:
- A discord account
- Nodejs
- mongodb(if you wish to use the currency system.)

### Installation
Clone the given repository in your location of choice.
```
git clone https://github.com/JesWu/Eroc.git
```

Make sure that discordjs is installed in your chosen directory
```
npm install discord.js
```

run ```npm install``` to install additional dependencies

Create a file called ```config.json```

Paste in it:
```
{
    "prefix": "!",
    "token": "",
    "uri": "",
    "currency": "🌟"
}
```
Prefix denotes the command prefix used for intializing commands through discord text channels

Token is where to paste the discord authorization token

uri is used for mongodb

currency is the emoji utilized for currency.

Ask for an auth token, or create your own discord application/bot.

Given an invitation link from discord, invite the bot to your chosen server(s).

### Testing
Simply cd into the directory with the pulled files and run the following command:
```
node bot.js
```
Doing so will execute the bot and you will now be able to interact with it via discord.

#### Commands
Eroc comes with a variety of commands, listed in the commands directory.
Some commands you can execute:
```
!play <youtube url>
```
bot will play music or search for a term if necessary
```
!server
```
bot will display various information about the current server.
```
!playing
```
bot will display information about the currently playing video
```
!help
```
bot will send user a private message listing all current commands.

## Deployment
Currently Eroc is deployed on a raspberry pi, running on 3 small servers.

## Author
**Jeffrey Wu** - [JesWu](https://github.com/JesWu/)

## Built using
* [Discordjs](https://discord.js.org/#/) 
