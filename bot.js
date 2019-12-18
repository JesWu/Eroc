const { Client, RichEmbed } = require("discord.js");
const client = new Client();
const auth = require("./auth.json");
const dice = require("./liarsdice.js");
const poll = require("./poll.js");

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", msg => {
  if (msg.author.bot) return;
  console.log(msg.author.username + ": " + msg.author.id);

  var authorID = msg.author.id;

  var args = msg.content.split(" ");
  if (args.length == 0) return;

  var content = args[0];
  if (content.charAt(0) == "!") {
    content = content.slice(1);
    switch (content) {
      case "Help":
      case "help":
        msg.channel.send(
          "!game, !roll, !pic, !peek, !guess, !bs, !exit, !uwuify, !echo"
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
            "Your poll has been created. Please vote using !y for yes and !n for no. !pollresults for poll results. !closepoll to close poll."
          );
          var embed = new RichEmbed()
            .setTitle(poll.getQuestion())
            .setColor(0x3ff3ff)
            .setDescription("Yes: " + poll.getYes() + "\nNo: " + poll.getNo());
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
          if(poll.getYes() == poll.getNo()){
            resultStr = "Equal Yes & No.";
          }else if(poll.getYes() > poll.getNo()){
            resultStr = "Result is: Yes";
          }else{
            resultStr = "Result is: No";
          }

          var embed = new RichEmbed()
            .setTitle(poll.getQuestion())
            .setColor(0xff0000)
            .setDescription("Yes: " + poll.getYes() + "\nNo: " + poll.getNo() + "\n" + resultStr);
          msg.channel.send(embed);
          poll.closePoll(authorID);
          return;
        }
        msg.reply("Error: do not own poll.");
        break;
    }
  }
});

client.login(auth.token);

function isVowel(char){
  return (char == 'a' || char == 'e' || char == 'i' || char == 'o' || char == 'u');
}
