
const { Client, RichEmbed } = require('discord.js');
const client = new Client();
const auth = require('./auth.json');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.author.bot) return;
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
                    var results = "";
                    for (var i = 0; i < numRolls; i++) {
                        results += " " + (Math.floor(Math.random() * Math.floor(parseInt(args[1], 10))) + 1);
                    }
                    msg.channel.send(args[2] + " rolls : " + results);
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
        }
    }

});

client.login(auth.token);

function getUserFromMention(mention) {
    if (!mention) return;

    if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);

        if (mention.startsWith('!')) {
            mention = mention.slice(1);
        }

        console.log(client.users.get(mention));
    }
}