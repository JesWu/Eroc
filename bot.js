
const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    content = msg.content;
    if(msg.mentions.everyone){
        msg.reply("Kys");
    }else
    if (content.charAt(0) == '!') {
      content = content.slice(1);
      switch(content){
          case 'Eric':
              msg.reply("Eroc > Eric.");
              break;
          case 'Brian':
              msg.reply("Diet Coke.");
              break;
          case 'Neil':
              msg.reply("Hey this is Neil.");
              break;
          case 'Help':
          case 'help':
              msg.channel.send("Lmao u think this has documentation?");
              break;
      }
    }
    
});

client.login(auth.token);