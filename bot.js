const { Client, MessageEmbed } = require("discord.js");
const client = new Client();
const auth = require("./auth.json");
const prefix = "!";
const commands = ["play", "pause", "resume", "queue", "skip", "volume", "leave", "echo", "uwuify", "pic"];
const poll = require("./poll.js");
const ytdl = require("ytdl-core-discord");
const ytsr = require('ytsr');

var musicQueue = [];
var interval = null;

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async msg => {
  //if the message is not from a guild ignore it
  if (!msg.guild) return;
  //if the message comes from a bot ignore it
  if (msg.author.bot) return;

  //console.log(msg.author.username + ": " + msg.author.id);

  var authorID = msg.author.id;

  var args = msg.content.split(" ");
  if (args.length == 0) return;

  var content = args[0];
  if (content.charAt(0) == prefix) {
    content = content.slice(1);
    switch (content) {
      case "join":
        if (msg.member.voice.channel) {
          const connection = await msg.member.voice.channel.join();
          const dispatcher = connection.play(require("path").join(__dirname, './nggyu.mp3'));
        } else {
          msg.reply("You need to join a voice channel first!");
        }
        break;
      case "play":
        //if the member is in a voice channel
        if (msg.member.voice.channel) {
          //if the url is not valid tell them to enter a valid url.
          if (!ytdl.validateURL(args[1])) {
            msg.reply("Enter a valid yt url.");
            return;
          }

          if (musicQueue.length == 0 && msg.guild.voice == undefined || msg.guild.voice.connection == null) {
            const connection = await msg.member.voice.channel.join();
            const dispatcher = connection.play(await ytdl(args[1]), { type: 'opus' });

            msg.channel.send(
              "Now playing: " + (await ytdl.getInfo(args[1])).videoDetails.title + " :musical_note:"
            );

            dispatcher.on('finish', () => {
              nextSong(connection, msg);
            });

          } else {
            //formatting for music queue
            let title = (await ytdl.getInfo(args[1])).videoDetails.title;
            msg.reply(title + " has been added to the queue.");
            let lengthInt = (await ytdl.getInfo(args[1])).videoDetails.lengthSeconds;
            let lengthStr = "" + Math.floor(lengthInt / 60) + ":";
            if (lengthInt % 60 == 0) {
              lengthStr += "00";
            } else if (lengthInt % 60 < 10) {
              lengthStr += "0" + lengthInt % 60;
            } else {
              lengthStr += lengthInt % 60;
            }
            musicQueue.push({ url: "" + (await ytdl.getInfo(args[1])).videoDetails.video_url, title: title, length: lengthStr });
            //console.log(musicQueue);
          }
        } else {
          msg.reply("You need to join a voice channel first!");
        }
        break;
      case "skip":
        if (msg.member.voice.channel) {
          msg.guild.voice.connection.dispatcher.end();
        } else {
          msg.reply("You need to join a voice channel first!");
        }
        break;
      case "pause":
        if (msg.member.voice.channel) {
          msg.guild.voice.connection.dispatcher.pause();
          msg.reply("Song paused.");
        } else {
          msg.reply("You need to join a voice channel first!");
        }
        break;
      case "resume":
        if (msg.member.voice.channel) {
          msg.guild.voice.connection.dispatcher.resume();
          msg.reply("Song resumed.");
        } else {
          msg.reply("You need to join a voice channel first!");
        }
        break;
      case "volume":
        if (msg.member.voice.channel) {
          if (isNaN(args[1]) || args[1] < 0 || args[1] > 100) {
            msg.reply("Enter a valid number (0-100)");
            return;
          }
          msg.guild.voice.connection.dispatcher.setVolume(args[1] / 100);
          msg.reply("Volume set to:" + args[1]);
        } else {
          msg.reply("you are not in a voice channel!");
        }
        break;
      case "queue":
        if (msg.member.voice.channel) {
          if (musicQueue.length == 0) {
            msg.channel.send("No music in queue.");
            return;
          }
          let queueStr = "Music in Queue:\n"
          for (var i = 0; i < musicQueue.length; i++) {
            queueStr += (i + 1) + ". " + musicQueue[i].title + " " + musicQueue[i].length + "\n";
          }
          console.log(queueStr);
          msg.channel.send(queueStr);
        }
        break;
      case "leave":
        if (msg.member.voice.channel) {
          musicQueue = [];
          msg.member.voice.channel.leave();
          msg.reply("Left channel.");
        } else {
          msg.reply("Error: bot not in voice channel.");
        }
        break;
      case "search":
        var modStr = msg.content.slice(8);
        let searchStr = "Results: \n```";
        sr = [];
        msg.channel.send("Searching for: " + modStr);

        const filters1 = await ytsr.getFilters(modStr);
        const filter1 = filters1.get('Type').get('Video');
        const searchResults = await ytsr(filter1.url, { pages: 1 });
        for (var i = 0; i < searchResults.items.length; i++) {
          sr.push(searchResults.items[i]);
          searchStr += (i + 1) + `. ${searchResults.items[i].title} ${searchResults.items[i].duration}\n`;
        }
        searchStr += "```";
        msg.reply(searchStr);
        //console.log(sr);
        break;
      case "select":
        if (isNaN(args[1])) {
          msg.reply("Please enter a number.");
          return;
        }
        if (sr.length == 0) {
          msg.reply("No search to select from.");
          return;
        }
        var selectNum = parseInt(args[1], 10) - 1;
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
      case "Help":
      case "help":
        var helpStr = "Commands:\n```";
        for (command of commands) {
          helpStr += `${prefix}` + command + " ";
        }
        helpStr += "```";
        msg.reply(helpStr);
        break;
      case "pic":
        var mentions = msg.mentions.users;
        console.log(mentions);
        for (const [key, value] of mentions) {
          var embed = new MessageEmbed()
            .setTitle(value.username)
            .setColor(0xff0000)
            .setImage(value.displayAvatarURL());
          msg.channel.send(embed);
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
      case "poll":
        var question = msg.content.slice(6);
        if (question.length == 0) {
          msg.reply("Please enter a question.");
          return;
        }
        if (!poll.isPoll()) {
          poll.createPoll(authorID, question);
          msg.reply(
            "Your poll has been created. Please vote using ~y for yes and ~n for no. ~pollresults for poll results. ~closepoll to close poll. Poll will close automatically in 60 seconds."
          );
          var embed = new MessageEmbed()
            .setTitle(poll.getQuestion())
            .setColor(0x3ff3ff)
            .setDescription("Yes: " + poll.getYes() + "\nNo: " + poll.getNo());
          interval = setInterval(function () {
            msg.reply("Poll closed.");
            var resultStr = "";
            if (poll.getYes() == poll.getNo()) {
              resultStr = "Equal Yes & No.";
            } else if (poll.getYes() > poll.getNo()) {
              resultStr = "Result is: Yes";
            } else {
              resultStr = "Result is: No";
            }

            var embed = new RichEmbed()
              .setTitle(poll.getQuestion())
              .setColor(0xff0000)
              .setDescription(
                "Yes: " +
                poll.getYes() +
                "\nNo: " +
                poll.getNo() +
                "\n" +
                resultStr
              );
            msg.channel.send(embed);
            poll.closePoll(authorID);
            clearInterval(interval);
            return;
          }, 60000);
          msg.channel.send(embed);
        } else {
          msg.reply("Error: a poll may be currently running.");
        }
        break;
      case "y":
        if (!poll.isPoll()) {
          msg.reply("No current poll.");
          return;
        }
        if (!poll.hasVoted(authorID)) {
          poll.voteYes(authorID);
          msg.reply("Successfully voted.");
        } else {
          msg.reply("Error: you may have voted already.");
        }
        break;
      case "n":
        if (!poll.isPoll()) {
          msg.reply("No current poll.");
          return;
        }
        if (!poll.hasVoted(authorID)) {
          poll.voteNo(authorID);
          msg.reply("Successfully voted.");
        } else {
          msg.reply("Error: you may have voted already.");
        }
        break;
      case "pollresults":
        if (poll.isPoll()) {
          var embed = new RichEmbed()
            .setTitle(poll.getQuestion())
            .setColor(0x3ff3ff)
            .setDescription("Yes: " + poll.getYes() + "\nNo: " + poll.getNo());
          msg.channel.send(embed);
        } else {
          msg.reply("Error: a poll may not be running.");
        }
        break;
      case "closepoll":
        if (!poll.isPoll()) {
          msg.reply("No current poll.");
          return;
        }
        if (poll.isOwner(authorID)) {
          msg.reply("Poll closed.");
          var resultStr = "";
          if (poll.getYes() == poll.getNo()) {
            resultStr = "Equal Yes & No.";
          } else if (poll.getYes() > poll.getNo()) {
            resultStr = "Result is: Yes";
          } else {
            resultStr = "Result is: No";
          }

          var embed = new RichEmbed()
            .setTitle(poll.getQuestion())
            .setColor(0xff0000)
            .setDescription(
              "Yes: " +
              poll.getYes() +
              "\nNo: " +
              poll.getNo() +
              "\n" +
              resultStr
            );
          msg.channel.send(embed);
          poll.closePoll(authorID);
          clearInterval(interval);
          return;
        }
        msg.reply("Error: do not own poll.");
        break;
      case "debug":
        console.log(msg.guild.voice.connection);
    }
  }
});

client.login(auth.token);

function isVowel(char) {
  return (
    char == "a" || char == "e" || char == "i" || char == "o" || char == "u"
  );
}

async function nextSong(connection, msg) {
  if (musicQueue.length > 0) {
    msg.channel.send("Song Ended! Moving to next song..");
    const dispatcher = connection.play(await ytdl(musicQueue[0].url), { type: 'opus' });
    msg.channel.send(
      "Now playing: " + (await ytdl.getInfo(musicQueue[0].url)).videoDetails.title + " :musical_note:"
    );

    musicQueue.shift();

    dispatcher.on('finish', function () {
      nextSong(connection, msg);
    });

  } else {
    musicQueue = [];
    msg.member.voice.channel.leave();
    msg.channel.send("No music in queue, leaving channel.");
  }
}