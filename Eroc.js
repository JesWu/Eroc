const fs = require('fs');
const Discord = require("discord.js");

const { prefix, uri, token } = require("./config.json");

const { MongoClient } = require('mongodb');
const mclient = new MongoClient(uri, { useUnifiedTopology: true });

const client = new Discord.Client();
client.commands = new Discord.Collection();

//create a discord collection of data for each server the bot is running on.
client.guildData = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.guilds.cache.forEach(guild => {
    client.guildData.set(guild.id, { musicQueue: [], playing: '' })
  });
  client.user.setPresence({ activity: { name: 'E' }, status: 'dnd' })
    .catch(console.error);
  try {
    mclient.connect();
  } catch (e) {
    console.error(e);
  }
});

client.on("message", async message => {
  //if the message does not contain the prefix or is a bot message ignore it
  if (message.author.bot) return;

  const result = await mclient.db("erocdb").collection("users")
    .findOne({ _id: message.author.id });
  if (!result) {
    await mclient.db("erocdb").collection("users").insertOne({ _id: message.author.id, name: message.author.username, currency: 0});
  }

  if (Math.random() < .1) {
    const result = await mclient.db("erocdb").collection("users")
      .findOne({ _id: message.author.id });

    await mclient.db("erocdb").collection("users")
      .updateOne({ _id: message.author.id }, { $set: { currency: (result.currency + 1) }});
  }

  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName)
    || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  //handle cooldowns
  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  //handle guild only commands
  if (command.guildOnly && message.channel.type === 'dm') {
    return message.reply('I can\'t execute that command inside DMs!');
  }

  //handle arguments.
  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;

    if (command.usage) {
      reply += `\nThe proper usage of the command is: \`${prefix}${command.name} ${command.usage}\``;
    }

    return message.channel.send(reply);
  }

  try {
    command.execute(message, args, mclient);
  } catch (error) {
    console.error(error);
    message.reply("Error executing command.");
  }
  //console.log(msg.author.username + ": " + msg.author.id);

  /*
  switch (command) {
    case "select":
      if (isNaN(args[0])) {
        msg.reply("Please enter a number.");
        return;
      }
      if (sr.length == 0) {
        msg.reply("No search to select from.");
        return;
      }
      var selectNum = parseInt(args[0], 10) - 1;
      if (selectNum >= sr.length || selectNum < 0) {
        msg.reply("Enter a valid number.");
        return;
      }
      if (msg.member.voice.channel) {
        if (musicQueue.length == 0 && msg.guild.voice == undefined || msg.guild.voice.connection == null) {
          const connection = await msg.member.voice.channel.join();
          const dispatcher = connection.play(await ytdl(sr[selectNum].url), { type: 'opus' });

          msg.channel.send(
            "Now playing: " + (await ytdl.getInfo(sr[selectNum].url)).videoDetails.title + " :musical_note:"
          );

          dispatcher.on('finish', () => {
            nextSong(connection, msg);
          });

        } else {
          msg.reply(sr[selectNum].title + " has been added to the queue.");
          musicQueue.push({ url: "" + sr[selectNum].url, title: "" + sr[selectNum].title, length: sr[selectNum].duration });
          //console.log(musicQueue);
        }
        sr = [];
      } else {
        msg.reply("You aren't in a voice channel.")
      }
      break;
    case "echo":
      msg.channel.send(msg.content.slice(6));
      msg.delete(0);
      break;
    case "uwuify":
      var modStr = msg.content.slice(8);
      var newStr = "";
      for (var i = 0; i < modStr.length; i++) {
        if (modStr.charAt(i) == "r" || modStr.charAt(i) == "l") {
          newStr += "w";
        } else if (modStr.charAt(i) == "R" || modStr.charAt(i) == "L") {
          newStr += "W";
        } else if (
          modStr.charAt(i) == "N" ||
          (modStr.charAt(i) == "n" && isVowel(modStr.charAt(i + 1)))
        ) {
          newStr += modStr.charAt(i);
          newStr += "y";
        } else {
          newStr += modStr.charAt(i);
        }
      }
      msg.channel.send(newStr);
      msg.delete(0);
      break;
  }
  */
});

client.login(token);

function isVowel(char) {
  return (
    char == "a" || char == "e" || char == "i" || char == "o" || char == "u"
  );
}