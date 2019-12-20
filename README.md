# Eroc
Friendly neighborhood discord bot

## Getting Started
Setup instructions for getting Eroc up & running.

### Prerequisites
You will need:
- A discord account
- Nodejs (v10.17.0)

### Installation
Clone the given repository in your location of choice.
```
git clone https://github.com/JesWu/Eroc.git
```

Make sure that discordjs is installed in your chosen directory
```
npm install discord.js
```

Ask for an auth token, or create your own discord application/bot.

Given an invitation link from discord, invite the bot to your chosen server(s).

### Testing
Simply cd into the directory with the pulled files and run the following command:
```
node bot.js
```
Doing so will execute the bot and you will now be able to interact with it via discord.

#### Commands
Eroc comes with a variety of commands.
Files poll.js and liarsdice.js implement a polling system and the game liarsdice(WIP).
The prefix for Eroc is a tilda ~.
Some commands you can execute:
```
~echo String
```
Bot will echo whatever message you type in chat.
```
~roll # #
```
The first argument will allow for the number of sides of a dice (1 - #), the second argument will allow for the number of rolls.
```
~uwuify String
```
Uwuify will make the string inserted after the command cuter.
```
~poll Question
```
Polling will create a poll(only one can be active at a time) and pull up commands used specifically for polling.
Currently only yes/no questions are supported.

## Deployment
TBD...

## Author
**Jeffrey Wu** - [JesWu](https://github.com/JesWu/)

## Built using
* [Discordjs](https://discord.js.org/#/) 
