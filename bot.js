const { Client, RichEmbed } = require("discord.js");
const client = new Client();
const auth = require("./auth.json");
const dice = require("./liarsdice.js");
const poll = require("./poll.js");
const ytdl = require("ytdl-core");
const ytpl = require("ytpl");
const ytsr = require("ytsr");
var streamOptions = {
  seek: new Number(0),
  volume: new Number(0.5),
  highWaterMark: new Number(1),
  bitrate: "auto"
};
var musicQueue = [];
var interval = null;
var sr = [];

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", msg => {
  if (!msg.guild) return;
  if (msg.author.bot) return;
  console.log(msg.author.username + ": " + msg.author.id);

  var authorID = msg.author.id;

  var args = msg.content.split(" ");
  if (args.length == 0) return;

  var content = args[0];
  if (content.charAt(0) == "~") {
    content = content.slice(1);
    switch (content) {
      case "search":
        var modStr = msg.content.slice(8);
        let filter;
        sr = [];
        msg.channel.send("Searching for: " + modStr);

        ytsr.getFilters(modStr, function(err, filters) {
          if (err) throw err;
          filter = filters.get("Type").find(o => o.name === "Video");
          ytsr.getFilters(filter.ref, function(err, filters) {
            if (err) throw err;
            filter = filters
              .get("Duration")
              .find(o => o.name.startsWith("Short"));
            var options = {
              limit: 5,
              nextpageRef: filter.ref
            };
            ytsr(null, options, function(err, searchResults) {
              if (err) throw err;
              for (const result of searchResults.items) {
                sr.push(result);
              }
              var searchStr = "Results: \n";
              for (var i = 0; i < sr.length; i++) {
                searchStr +=
                  i +
                  1 +
                  ". " +
                  sr[i].title +
                  " - " +
                  sr[i].author.name +
                  " (" +
                  sr[i].duration +
                  ")\n";
              }
              msg.channel.send(searchStr);
            });
          });
        });
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
        if (msg.member.voiceChannel) {
          if (!msg.member.voiceChannel.connection) {
            msg.member.voiceChannel
              .join()
              .then(connection => {
                const yt = ytdl(sr[selectNum].link, {
                  filter: "audioonly",
                  quality: "highestaudio",
                  highWaterMark: 1 << 25
                });
                var dispatcher = connection.playStream(yt, streamOptions);
                yt.on("info", info => {
                  msg.channel.send(
                    "Now playing: " + info.title + " :musical_note:"
                  );
                });
                dispatcher.on("end", function() {
                  dispatcher = null;
                  console.log("End event logged.");
                  nextSong(connection, msg);
                });
              })
              .catch(console.log);
          } else {
            musicQueue.push({ url: "" + sr[selectNum].link, info: sr[selectNum]});
            msg.reply(sr[selectNum].title + " has been added to queue.");
            return;
          }
        } else {
          msg.reply("You need to join a voice channel first!");
        }
        break;
      case "join":
        if (msg.member.voiceChannel) {
          msg.member.voiceChannel
            .join()
            .then(connection => {
              const dispatcher = connection.playFile(
                require("path").join(__dirname, "./nggyu.mp3")
              );
            })
            .catch(console.log);
        } else {
          msg.reply("You need to join a voice channel first!");
        }
        break;
      case "clearqueue":
        musicQueue = [];
        msg.channel.send("Queue cleared.");
        break;
      case "queue":
        if (musicQueue.length == 0) {
          msg.reply("No music in queue.");
        } else {
          var infoString = "";
          for (let i = 0; i < musicQueue.length; i++) {
            infoString += i + 1 + ". " + musicQueue[i].info.title + "\n";
            if (infoString.length > 1900) {
              msg.channel.send(infoString);
              infoString = "";
            }
          }
          msg.channel.send(infoString);
        }
        break;
      case "play":
        if (msg.member.voiceChannel) {
          if (!ytdl.validateURL(args[1])) {
            msg.reply("Enter a valid yt url.");
            return;
          }
          if (!msg.member.voiceChannel.connection) {
            msg.member.voiceChannel
              .join()
              .then(connection => {
                const yt = ytdl(args[1], {
                  filter: "audioonly",
                  quality: "highestaudio",
                  highWaterMark: 1 << 25
                });
                var dispatcher = connection.playStream(yt, streamOptions);
                yt.on("info", info => {
                  msg.channel.send(
                    "Now playing: " + info.title + " :musical_note:"
                  );
                });
                dispatcher.on("end", function() {
                  dispatcher = null;
                  console.log("End event logged.");
                  nextSong(connection, msg);
                });
              })
              .catch(console.log);
            if (ytpl.validateURL(args[1])) {
              ytpl(args[1]).then(playListInfo => {
                msg.channel.send(
                  "Imported " +
                    playListInfo.total_items +
                    " from playlist: " +
                    playListInfo.title
                );
                for (const item of playListInfo.items) {
                  musicQueue.push({ url: "" + item.url, info: item });
                }
                musicQueue.splice(0, 1);
              });
            }
          } else {
            if (ytpl.validateURL(args[1])) {
              console.log("Playlist Found!");
              ytpl(args[1]).then(playListInfo => {
                for (const item of playListInfo.items) {
                  musicQueue.push({ url: "" + item.url, info: item });
                }
              });
            } else {
              ytdl.getInfo(args[1]).then(info => {
                musicQueue.push({ url: "" + args[1], info: info });
              });
            }
            msg.reply("Song has been added to queue.");
            return;
          }
        } else {
          msg.reply("You need to join a voice channel first!");
        }
        break;
      case "skip":
        if (msg.member.voiceChannel) {
          msg.reply("Skipped song.");
          msg.member.voiceChannel.connection.dispatcher.end();
        } else {
          msg.reply("You need to join a voice channel first!s");
        }
        break;
      case "pause":
        if (msg.member.voiceChannel) {
          const dispatcher = msg.member.voiceChannel.connection.dispatcher;
          dispatcher.pause();
          msg.reply("Song paused.");
        } else {
          msg.reply("You need to join a voice channel first!p");
        }
        break;
      case "resume":
        if (msg.member.voiceChannel) {
          const dispatcher = msg.member.voiceChannel.connection.dispatcher;
          dispatcher.resume();
          msg.reply("Song resumed.");
        } else {
          msg.reply("You need to join a voice channel first!r");
        }
        break;
      case "volume":
        if (msg.member.voiceChannel) {
          if (isNaN(args[1]) || args[1] < 0 || args[1] > 100) {
            msg.reply("Enter a valid number (0-100)");
            return;
          }
          const dispatcher = msg.member.voiceChannel.connection.dispatcher;
          streamOptions.volume = parseInt(args[1], 10) / 10;
          dispatcher.setVolume(args[1] / 100);
        } else {
          msg.reply("wtf?");
        }
        break;
      case "leave":
        if (msg.member.voiceChannel) {
          musicQueue = [];
          msg.member.voiceChannel.leave();
          msg.reply("Left channel.");
        } else {
          msg.reply("Error: bot not in voice channel.");
        }
        break;

      case "random":
        const users = [];
        msg.guild.members.forEach(member => users.push(member.user.id));
        msg.channel.send(
          ": <@" + users[Math.floor(Math.random() * users.length)] + ">"
        );
        break;
      // case "kick":
      //   const user = msg.mentions.users.first();
      //   // If we have a user mentioned
      //   if (user) {
      //     // Now we get the member from the user
      //     const member = msg.guild.member(user);
      //     // If the member is in the guild
      //     if (member) {
      //       /**
      //        * Kick the member
      //        * Make sure you run this on a member, not a user!
      //        * There are big differences between a user and a member
      //        */
      //       member
      //         .kick("Optional reason that will display in the audit logs")
      //         .then(() => {
      //           // We let the message author know we were able to kick the person
      //           msg.reply(`Successfully kicked ${user.tag}`);
      //         })
      //         .catch(err => {
      //           // An error happened
      //           // This is generally due to the bot not being able to kick the member,
      //           // either due to missing permissions or role hierarchy
      //           msg.reply("I was unable to kick the member");
      //           // Log the error
      //           console.error(err);
      //         });
      //     } else {
      //       // The mentioned user isn't in this guild
      //       msg.reply("That user isn't in this guild!");
      //     }
      //     break;
      //   }
      case "Help":
      case "help":
        msg.channel.send(
          "~game, ~roll, ~poll, ~pic, ~peek, ~guess, ~bs, ~exit, ~uwuify, ~echo"
        );
        break;
      case "roll":
      case "Roll":
        console.log(args[1]);
        console.log(args[2]);
        if (
          args[1] != null &&
          !isNaN(args[1]) &&
          args[2] != null &&
          !isNaN(args[2])
        ) {
          var numRolls = parseInt(args[2], 10);
          if (numRolls > 1000) {
            msg.channel.send("Number of rolls too large.(greater than 1000)");
            return;
          }
          var results = "";
          msg.channel.send(args[2] + " rolls : ");
          for (var i = 0; i < numRolls; i++) {
            if (i != 1 && i % 50 == 1) {
              msg.channel.send(results);
              results = "";
            }
            results +=
              " " +
              (Math.floor(Math.random() * Math.floor(parseInt(args[1], 10))) +
                1);
          }
          msg.channel.send(results);
        } else {
          msg.channel.send("Invalid args. Format: Diet Coke");
        }
        break;
      case "pic":
        var mentions = msg.mentions.users;
        console.log(mentions);
        for (const [key, value] of mentions) {
          var embed = new RichEmbed()
            .setTitle("Image")
            .setColor(0xff0000)
            .setImage(value.displayAvatarURL)
            .setDescription(value.username);
          msg.channel.send(embed);
        }
        break;
      case "game":
        var numDice = parseInt(args[1], 10);
        var sideNum = parseInt(args[2], 10);
        msg.channel.send(dice.newGame(msg.mentions.users, numDice, sideNum));
        dice.nextTurn();
        break;
      case "peek":
        if (dice.isInGame(authorID)) {
          msg.author.send(dice.peek(authorID));
          msg.channel.send("DM sent!");
        } else {
          msg.channel.send("Sorry, you are not in the game.");
        }
        break;
      case "guess":
        if (
          args[1] != null &&
          !isNaN(args[1]) &&
          args[2] != null &&
          !isNaN(args[2])
        ) {
          var numDice = parseInt(args[1], 10);
          var sideNum = parseInt(args[2], 10);
          msg.channel.send(dice.guess(authorID, numDice, sideNum));
          return;
        }
        msg.channel.send("Invalid arguments.");
        break;
      case "bs":
        msg.channel.send(dice.bs(authorID));
        break;
      case "exit":
        msg.reply(dice.exit(authorID));
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
          var embed = new RichEmbed()
            .setTitle(poll.getQuestion())
            .setColor(0x3ff3ff)
            .setDescription("Yes: " + poll.getYes() + "\nNo: " + poll.getNo());
          interval = setInterval(function() {
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
    }
  }
});

client.login(auth.token);

function isVowel(char) {
  return (
    char == "a" || char == "e" || char == "i" || char == "o" || char == "u"
  );
}

function nextSong(connection, msg) {
  if (musicQueue.length > 0) {
    msg.channel.send("Moving to next song..");
    const yt = ytdl("" + musicQueue[0].url, {
      filter: "audioonly",
      quality: "highestaudio",
      highWaterMark: 1 << 25
    });
    var dispatcher = msg.member.voiceChannel.connection.playStream(
      yt,
      streamOptions
    );
    yt.on("info", info => {
      msg.channel.send("Now playing: " + info.title + " :musical_note:");
    });
    musicQueue.splice(0, 1);
    dispatcher.on("end", function() {
      dispatcher = null;
      nextSong(connection, msg);
    });
  } else {
    msg.member.voiceChannel.leave();
    msg.channel.send("No music in queue, leaving channel.");
  }
}
