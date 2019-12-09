
const { Client, RichEmbed } = require('discord.js');
const client = new Client();
const auth = require('./auth.json');
var gameState = false;
var players = new Array();
var Turn = {
    CurDice: 0,
    Turn: 0,
    RollFreq: null
}
var curGuess = {
    Num: 0,
    NumDice: 0,
    ID: null
};

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.author.bot) return;
    if (msg.author.id == "152656874427121666"){
        msg.react('1️⃣')
        .then(() => msg.react('9️⃣'))
        .then(() => msg.react('0️⃣'))
        .then(() => msg.react('7️⃣'))
        .catch(() => console.error('One of the emojis failed to react.'));
    }
    var drinks = msg.content.toLowerCase();
    if (drinks.includes("diet coke") || drinks.includes("dietcoke")) {
        msg.channel.send("<@152656874427121666>");
    }
    if (drinks.includes("milk tea") || drinks.includes("boba") || drinks.includes("coffee")) {
        if (drinks.includes("coffee") && drinks.includes("friendship")) {
            msg.channel.send("<@92879830365773824> ( ͡° ͜ʖ ͡°) ( ͡° ͜ʖ ͡°) ( ͡° ͜ʖ ͡°) ( ͡° ͜ʖ ͡°) ( ͡° ͜ʖ ͡°) ( ͡° ͜ʖ ͡°)");
        } else {
            msg.channel.send("<@92879830365773824>");
        }
    }
    if (msg.mentions.everyone) {
        msg.reply("Kys");
    }
    if (drinks.includes("no comment")) {
        msg.channel.send("<@178759982039171073>");
    }
    /*
    if(drinks.includes("mae")){
        msg.channel.send("alex eric neil shohei");
    }
    */
    if (drinks.includes("dicky luong")) {
        msg.channel.send("shawn zack");
    }

    //getUserFromMention(msg.content);
    console.log(msg.author.username + ": " + msg.author.id);

    var args = msg.content.split(" ");
    if (args.length == 0) return;

    var content = args[0];
    if (content.charAt(0) == '!') {
        content = content.slice(1);
        switch (content) {
            case 'uwu':
                msg.reply('owo');
                break;
            case 'owo':
                msg.reply('uwu');
                break;
            case 'bad':
            case 'Bad': 
                msg.reply("Eric");
                break;
            case 'Eric':
                msg.reply("Eroc > Eric.");
                break;
            case 'Brian':
                msg.reply("Diet Coke.");
                break;
            case 'Neil':
                msg.reply("Hey this is Neil.");
                break;
            case 'Peter':
                var embed = new RichEmbed()
                    .setTitle('Pizza bwead')
                    .setColor(0xFF0000)
                    .setImage('https://f4d5s4a5.stackpathcdn.com/wp-content/uploads/2018/05/Homemade_Pita_Bread_Sweet_Simple_Vegan-768x1151.jpg')
                    .setDescription('Real picture of pizza bwead.');
                msg.channel.send(embed);
                break;
            case 'Ed':
                msg.channel.send("Ed: koreaboo who loves friendship and boba. Also known as the guy most likely to cheat on his non existent gf.");
                break;
            case 'Viv':
            case 'Vivian':
                msg.channel.send("Eh? she's aite I guess..");
                break;
            case 'Help':
            case 'help':
                msg.channel.send("Lmao u think this has documentation?");
                break;
            case 'roll':
            case 'Roll':
                console.log(args[1]);
                console.log(args[2]);
                if (args[1] != null && !isNaN(args[1]) && args[2] != null && !isNaN(args[2])) {
                    var numRolls = parseInt(args[2], 10);
                    if(numRolls > 1000){
                        msg.channel.send("Number of rolls too large.(greater than 1000)");
                        return;
                    }
                    var results = "";
                    msg.channel.send(args[2] + " rolls : ");
                    for (var i = 0; i < numRolls; i++) {
                        if(i != 1 && i % 50 == 1){
                            msg.channel.send(results);
                            results = "";
                        }
                        results += " " + (Math.floor(Math.random() * Math.floor(parseInt(args[1], 10))) + 1);
                    }
                    msg.channel.send(results);
                } else {
                    msg.channel.send("Invalid args. Format: Diet Coke");
                }
                break;
            case 'pic':
                var mentions = msg.mentions.users;
                console.log(mentions);
                for (const [key, value] of mentions) {
                    var embed = new RichEmbed()
                        .setTitle('Image')
                        .setColor(0xFF0000)
                        .setImage(value.displayAvatarURL)
                        .setDescription(value.username);
                    msg.channel.send(embed);
                }
                break;
            case 'dice':
                if (!gameState) {
                    if (msg.mentions.everyone) {
                        msg.reply("Nice try guy");
                    } else {
                        var mentions = msg.mentions.users;
                        Turn.Turn = 0;
                        players = constructDice(mentions);
                        //gameState = true;
                        msg.channel.send("Starting game...");
                        //msg.channel.send("Rolling for turn priority...");
                        var curPlayer = rollPriority(players, msg);
                        nextTurn(players);
                    }
                } else {
                    msg.channel.send("Game already running.");
                }
                break;
            case 'peek':
                for (player of players) {
                    console.log(player.ID + " " + msg.author.id);
                    if (player.ID == msg.author.id) {
                        msg.author.send("Turn " + Turn.Turn + ": " + player.Roll);
                        msg.channel.send("DM sent!");
                        return;
                    }
                }
                msg.channel.send("You are not in the current game.");
                break;
            case 'guess':
                if (args[1] != null && !isNaN(args[1]) && args[2] != null && !isNaN(args[2])) {
                    var num = parseInt(args[2], 10);
                    var numDice = parseInt(args[1], 10);
                    if(num >= 1 && num <= 6 && numDice >= 1 && numDice <= Turn.CurDice){
                        if(curGuess.NumDice < numDice || (curGuess.NumDice == numDice && curGuess.Num < num)){
                            msg.reply("Has guessed: " + numDice + " dice for " + num);
                            curGuess = {
                                Num: num,
                                NumDice: numDice,
                                ID: msg.author.id
                            }
                        }else{
                            msg.reply("Your guess must be higher in number of dice or number.");
                        }
                    }else{
                        msg.reply("Invalid inputs/ dice amount too high.");
                    }
                    break;
                }
            case 'bs':
                if(curGuess.ID == null){
                    msg.reply("No guess currently.");
                    return;
                }
                msg.reply("Has called BS on <@" + curGuess.ID + ">'s guess of " + curGuess.NumDice + " dice for " + curGuess.Num);

                var rollStr = Turn.CurDice + " rolls for this turn | ";
                for(var i = 1; i <= Turn.RollFreq.length; i++){
                    rollStr += i + ": " + Turn.RollFreq[i - 1] + " |";
                }
                msg.channel.send(rollStr);
                if(isValidGuess(curGuess)){
                    msg.channel.send("<@" + curGuess.ID + ">'s bs was wrong :cry: -1 dice");
                    for (var i = 0; i < players.length; i++) {
                        if(players[i].ID == curGuess.ID){
                            players[i].Dice -= 1;
                        }
                    }
                }else{
                    msg.channel.send("<@" + msg.author.id + ">'s guess was wrong :cry: -1 dice");
                    for (var i = 0; i < players.length; i++) {
                        if(players[i].ID == curGuess.ID){
                            players[i].Dice -= 1;
                        }
                    }
                }
                nextTurn(players);
                break;
            case 'exit':

                gameState = false;
                players = new Array();
                Turn = {
                    CurDice: 0,
                    Turn: 0,
                    RollFreq: null
                }
                curGuess = {
                    Num: 0,
                    NumDice: 0,
                    ID: null
                };
                msg.channel.send("Game terminated.");
                break;
            case 'echo':
                msg.channel.send(msg.content.slice(6));
                break;
        }
    }

});

client.login(auth.token);

function getUserFromMention(mention) {
    if (!mention) return; var mentions = msg.mentions.users;

    if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);

        if (mention.startsWith('!')) {
            mention = mention.slice(1);
        }

        console.log(client.users.get(mention));
    }
}


function constructDice(mentions) {
    var players = new Array();
    for (const [key, value] of mentions) {
        var player = { Name: value.username, ID: value.id, Dice: 3, Roll: "" };
        players.push(player);
    }
    return players;
}

function rollPriority(players, msg) {
    var max = 0;
    var firstPlayers = new Array();
    var rollStr = "";
    for (player of players) {
        var roll = (Math.floor(Math.random() * Math.floor(parseInt(12, 10))) + 1);
        if (max < roll) {
            max = roll;
            firstPlayers = [];
            firstPlayers.push(player);
        } else if (max == roll) {
            firstPlayers.push(player);
        }
        rollStr += player.Name + " rolled " + roll + "\n";
    }
    msg.channel.send(rollStr);
    while (firstPlayers.length > 1) {
        msg.channel.send("Tie detected! rerolling...");
        rollStr = "";
        for (player of firstPlayers) {
            max = 0;
            var roll = (Math.floor(Math.random() * Math.floor(parseInt(12, 10))) + 1);
            if (max < roll) {
                max = roll;
                firstPlayers = [];
                firstPlayers.push(player);
            } else if (max == roll) {
                firstPlayers.push(player);
            }
            rollStr += player.Name + " rolled " + roll + "\n";
        }
        msg.channel.send(rollStr);
    }
    msg.channel.send("<@" + firstPlayers[0].ID + ">" + " goes first with a roll of: " + max);
    return firstPlayers[0];
}

function nextTurn(players) {
    Turn.CurDice = 0;
    Turn.RollFreq = new Array(6);
    Turn.RollFreq.fill(0);
    curGuess = {
        Num: 0,
        NumDice: 0,
        ID: null
    };
    for (player of players) {
        player.Roll = "";
        for (var i = 0; i < player.Dice; i++) {
            var roll = (Math.floor(Math.random() * Math.floor(parseInt(6, 10))) + 1);
            if (roll == 1) {
                for (var j = 0; j < Turn.RollFreq.length; j++) {
                    Turn.RollFreq[j] += 1;
                }
            } else {
                Turn.RollFreq[roll - 1] += 1;
            }
            player.Roll += roll + " ";
        }
        Turn.CurDice += player.Dice;
    }
    Turn.Turn++;
    console.log(Turn.CurDice + " " + Turn.RollFreq);
}

function isValidGuess(guess) {
    console.log(guess.NumDice + " " + Turn.RollFreq[guess.Num - 1] + " " + guess.Num)
    if(guess.NumDice > Turn.RollFreq[guess.Num - 1]){
        return false;
    }
    return true;
} 