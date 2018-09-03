const http = require('http');
const express = require('express');
const app = express();
app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);
const Discord = require('discord.js');
const botconfig = require("./botconfig.json");
const ms = require("ms");
const randomPuppy = require('random-puppy');
const ytdl = require('ytdl-core');
const gifSearch = require("gif-search");
const google = require("google");
const weather = require('weather-js');
const request = require('snekfetch');
const shorten = require('isgd');
const moment = require("moment");
const m = require("moment-duration-format");
let os = require('os')
let cpuStat = require("cpu-stat")
const { version } = require("discord.js");
var osu = require('os-utils');
var cpu = require('windows-cpu')
var platform = require('platform')
var prettyMs = require('pretty-ms');

const bot = new Discord.Client({disableEveryone: true});

var servers = {};

bot.on("ready", async () => {
  console.log(`${bot.user.username} is online on ${bot.guilds.size} servers!`);
  bot.user.setActivity(`++help | ${bot.guilds.size} Guilds` , {type: "WATCHING"});
});



//tempmute
bot.on("message", async message => {
  if(message.author.bot) return;
  if(message.channel.type === "dm") return;

  let prefix = botconfig.prefix;
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);
  
     if(cmd === `${prefix}tempmute`){
      let tomute = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
      if(!tomute) return message.reply("Couldn't find user.");
      if(tomute.hasPermission("MANAGE_MESSAGES")) return message.reply("Can't mute them!");
      let muterole = message.guild.roles.find(`name`, "muted");
      if(!muterole){
        try{
          muterole = await message.guild.createRole({
            name: "muted",
            color: "RANDOM",
            permissions:[]
          })
          message.guild.channels.forEach(async (channel, id) => {
            await channel.overwritePermissions(muterole, {
              SEND_MESSAGES: false,
              ADD_REACTIONS: false
            });
          });
        }catch(e){
          console.log(e.stack);
        }
      }
      let mutetime = args[1];
      if(!mutetime) return message.reply("You didn't specify a time!");

      await(tomute.addRole(muterole.id));
      message.reply(`<@${tomute.id}> has been muted for ${ms(ms(mutetime))}`);

      setTimeout(function(){
        tomute.removeRole(muterole.id);
        message.channel.send(`<@${tomute.id}> has been unmuted!`);
      }, ms(mutetime));
    }
  //kick
    if(cmd === `${prefix}kick`){

    let kUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(!kUser) return message.channel.send("Can't find user!");
    let kReason = args.join(" ").slice(22);
    if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You Must Have Permission");
    if(kUser.hasPermission("MANAGE_MESSAGES")) return message.channel.send("That person can't be kicked!");

    let kickEmbed = new Discord.RichEmbed()
    .setDescription("~Kick~")
    .setColor("#e56b00")
    .addField("Kicked User", `${kUser} with ID ${kUser.id}`)
    .addField("Kicked By", `<@${message.author.id}> with ID ${message.author.id}`)
    .addField("Kicked In", message.channel)
    .addField("Tiime", message.createdAt)
    .addField("Reason", kReason);

    let kickChannel = message.guild.channels.find(`name`, "mod-log");
    if(!kickChannel) return message.channel.send("Can't Find mod log Pls Create A Channel modlog .");

    message.guild.member(kUser).kick(kReason);
    kickChannel.send(kickEmbed);

    return;
  }
//ban
  if(cmd === `${prefix}ban`){

    let bUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(!bUser) return message.channel.send("Can't find user!");
    let bReason = args.join(" ").slice(22);
    if(!message.member.hasPermission("MANAGE_MEMBERS")) return message.channel.send("You Must Have Permission");
    if(bUser.hasPermission("MANAGE_MESSAGES")) return message.channel.send("That person can't be kicked!");

    let banEmbed = new Discord.RichEmbed()
    .setDescription("~Ban~")
    .setColor("#bc0000")
    .addField("Banned User", `${bUser} with ID ${bUser.id}`)
    .addField("Banned By", `<@${message.author.id}> with ID ${message.author.id}`)
    .addField("Banned In", message.channel)
    .addField("Time", message.createdAt)
    .addField("Reason", bReason);

    let incidentchannel = message.guild.channels.find(`name`, "mod-log");
    if(!incidentchannel) return message.channel.send("Can't Find mod log Pls Create A Channel mod log.");

    message.guild.member(bUser).ban(bReason);
    incidentchannel.send(banEmbed);


    return;
  }
  //report
  if(cmd === `${prefix}report`){

    let rUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(!rUser) return message.channel.send("Couldn't find user.");
    let rreason = args.join(" ").slice(22);

    let reportEmbed = new Discord.RichEmbed()
    .setDescription("Reports")
    .setColor("#15f153")
    .addField("Reported User", `${rUser} with ID: ${rUser.id}`)
    .addField("Reported By", `${message.author} with ID: ${message.author.id}`)
    .addField("Channel", message.channel)
    .addField("Time", message.createdAt)
    .addField("Reason", rreason);

    let reportschannel = message.guild.channels.find(`name`, "reports");
    if(!reportschannel) return message.channel.send("Couldn't find reports channel.");


    message.delete().catch(O_o=>{});
    reportschannel.send(reportEmbed);

    return;
  }
  //serverinfo
     if(cmd === `${prefix}serverinfo`){

      let online = message.guild.members.filter(member => member.user.presence.status !== 'offline');
  let day = message.guild.createdAt.getDate()
  let month = 1 + message.guild.createdAt.getMonth()
  let year = message.guild.createdAt.getFullYear()
   let sicon = message.guild.iconURL;
   let serverembed = new Discord.RichEmbed()
   .setAuthor(message.guild.name, sicon)
   .setFooter(`Server Created • ${day}.${month}.${year}`)
   .setColor("#7289DA")
   .setThumbnail(sicon)
   .addField("ID", message.guild.id, true)
   .addField("Name", message.guild.name, true)
   .addField("Owner", message.guild.owner.user.tag, true)
   .addField("Region", message.guild.region, true)
   .addField("Channels", message.guild.channels.size, true)
   .addField("Members", message.guild.memberCount, true)
   .addField("Humans", message.guild.memberCount - message.guild.members.filter(m => m.user.bot).size, true)
   .addField("Bots", message.guild.members.filter(m => m.user.bot).size, true)
   .addField("Online", online.size, true)
   .addField("Roles", message.guild.roles.size, true);
   message.channel.send(serverembed);
    }
  //botinfo
    if(cmd === `${prefix}botinfo`){
      let gif2 = 'https://cdn.discordapp.com/emojis/473819808358596618.gif?v=1'
      let bicon = bot.user.displayAvatarURL;
      let botembed = new Discord.RichEmbed()
      .setAuthor(bot.user.username,gif2)
      .setDescription("Bot Information")
      .setColor("#15f153")
      .setThumbnail(bicon)
      .addField("Bot Name", bot.user.username)
      .addField("Created On", bot.user.createdAt)
      .addField("Guild Bot On", bot.guilds.size)
      .addField("Playing Users", bot.users.size)
      

      return message.channel.send(botembed);
    }
  //help command
    if(cmd === `${prefix}help`){

      let serverembed = new Discord.RichEmbed()
      .setDescription("Commands For LITHIUM ©")
      .setColor("#ae67fc")
      .addField("++serverinfo", 'Give Info About Your Server')
      .addField("++botinfo", 'Give Info About LITHIUM')
      .addField("++weather", 'Show Weather Of Area ++weather areaname')
      .addField("++userinfo", 'Show User AVATAR')
      .addField("++invite",'Give Bot Invite Link')
      .addField("++serverinvites",'It Shows Server Invites')
      .addField("++support", 'Give Link Of Bot Support Server')
      .addField("++createinvite",'Creates A Permanent Guild Invite')
      .addField("++kick", 'Kick A User From Server')
      .addField("++ban", 'Bans A User From Server')
      .addField("++report",'Reports A User In Server')
      .addField("++warn",'Warns A User')
      .addField("++tempmute",'Mutes A User For Limited Time Eg @user 1s')
      .addField("++googlesearch",'Search Anything On Google')
      .addField("++google",'Search Anything On Google')
      .addField("++youtube",'Search Anything On YouTube')
      .addField("++wwegif",'Shows Gif Of WWE')
      .addField("++nudes",'NSFW Command Only In Nsfw Channel')
      .addField("++nsfwgif",'Shows NSFW gif')
      .addField("++coinflip",'Fun Command')
      .addField("++stats",'To See Bot Stats')
      
      return message.channel.send(serverembed);
      }
  //userinfo
    if(cmd === `${prefix}userinfo`){

       
       let userembed = new Discord.RichEmbed()
       .setDescription('User Info')
       .setColor('03FF44')
       .setImage(message.author.avatarURL)
       .setTimestamp()

       return message.channel.send(userembed);
}
  //support server
  if(cmd === `${prefix}support`){

    let supportembed = new Discord.RichEmbed()
    .setDescription('LITHIUM © BOT Support Server Link')
    .setColor('03FF44')
    .addField('https://discord.gg/UTU7ShG')
    .setTimestamp()

    return message.channel.send(supportembed);
  }
  //invite
  if(cmd === `${prefix}invite`){

    let binvitembed = new Discord.RichEmbed()
    .setDescription('LITHIUM © BOT Invite Link')
    .setColor('RANDOM')
    .addField('https://goo.gl/54uoNf')
    .setTimestamp()

    return message.channel.send(binvitembed);
  }
  //serverinvites leaderboard
  if(cmd === `${prefix}serverinvites`){
   let invites = await message.guild.fetchInvites().catch(error => {
        return message.channel.send('Sorry, I don\'t have the proper permissions to view invites!');
    });

    invites = invites.array();

    let possibleinvites = [];
    invites.forEach(function(invites) {
        possibleinvites.push(`${invites.inviter.username} ||  ${invites.uses}`)
    })

    const embed = new Discord.RichEmbed()
        .setTitle(`**INVITELEADERBOARD**`)
        .setColor(0xCB5A5E)
        .addField('Invites', `\`\`\`${possibleinvites.join('\n')}\`\`\``)
        .setTimestamp();
    message.channel.send(embed);
}
  //guildinvite creator
  if(cmd === `${prefix}createinvite`){
      if (!message.member.hasPermission("CREATE_INSTANT_INVITE")) return;
  message.channel.createInvite({maxAge: 0}).then(invite => {
    let embed = new Discord.RichEmbed()
    .setColor(0xCB5A5E)
    .setDescription(`**Permanent Invite Link**: ${invite}`);
    message.channel.send(embed);
  });
}
  //warn
  if(cmd === `${prefix}warn`) {
    if (!message.member.hasPermission("MANAGE_MESSAGES")) return message.reply("Sorry, but you don't have permission to use this!") 
   let warnedmember = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
    if (!warnedmember) return ("Please mention a user to warn.");
     let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";
   
    
      message.delete().catch(O_o=>{});
    message.channel.send(`***${warnedmember.user.tag} was warned!***`)
   await warnedmember.send(`You have been warned in ${message.guild.name} by ${message.author.username} for: ${reason}.`)
  
  }
  //google search
  if(cmd === `${prefix}goog`){
    let google = args.join(" ");
    let link = `https://www.google.com/search?q=${google}` ;
	message.channel.send(link); 
}

//yt search
if(cmd === `${prefix}youtube`){
    let youtube = args.join(" ");
    let link = `https://www.youtube.com/results?search_query=` + youtube;
	message.channel.send(link);
}
  //coinflip
  if(cmd === `${prefix}coinflip`){
      message.channel.send(`Result: **${Math.floor(Math.random() * 2) == 0 ? "Heads" : "Tails"}**!`);
}
  //nsfw
  if (cmd === `${prefix}nudes`) {
    if (!message.channel.nsfw) return message.reply("You can use this command only on nsfw channels!");

    var subreddits = [
        'NSFW_Wallpapers',
        'SexyWallpapers',
        'HighResNSFW',
        'nsfw_hd',
        'UHDnsfw',
        'Anal',
        'Porn'
    ]
    var sub = subreddits[Math.round(Math.random() * (subreddits.length - 1))];

    randomPuppy(sub)
        .then(url => {
            const embed = new Discord.RichEmbed()
                .setColor("RANDOM")
                .setAuthor("Nudes", bot.user.avatarURL)
                .setFooter("xD")
                .setImage(url);
            message.channel.send({
                embed
            });
        })
}
  //wwe gif
  if(cmd === `${prefix}wwegif`){
    let replies = ["https://media.giphy.com/media/HbkT5F5CiRD3O/giphy.gif", "https://media.giphy.com/media/10sDMjEoL7cAOA/giphy.gif", "https://media.giphy.com/media/xT39D7ubkIUIrgX7JS/giphy.gif", "https://media.giphy.com/media/kRWFIgO75okHm/giphy.gif", "https://media.giphy.com/media/TlK63Er4gKHILXzNeA8/giphy.gif", "https://media.giphy.com/media/14smAwp2uHM3Di/giphy.gif", "https://media.giphy.com/media/VPtakcmZS6z5K/giphy.gif", "https://media.giphy.com/media/gdKAVlnm3bmKI/giphy.gif", "https://media.giphy.com/media/VgIums4vgV4iY/giphy.gif", "https://media.giphy.com/media/l4EoX23aHCEIVlcTm/giphy.gif", "https://media.giphy.com/media/xT39CTnUseDauWbrRS/giphy.gif", "https://media.giphy.com/media/roAfEu8tdNYe4/giphy.gif", "https://media.giphy.com/media/l4Ep6mu0EsZlneBs4/giphy.gif", "https://media.giphy.com/media/g9x6SOnpJ7Mxa/giphy.gif", "https://media.giphy.com/media/RptlNBj3wJMbu/giphy.gif"];

    let result = Math.floor((Math.random() * replies.length));

    let gifembed = new Discord.RichEmbed()
        .setTitle("WWE GIF")
        .setColor("#FF69B4")
        .setFooter(`Gif ${message.author.tag} `, message.author.avatarURL)
        .setImage(replies[result]);

    message.channel.send(gifembed);
}
  //play
  if(cmd === `${prefix}play`){
    if (!message.member.voiceChannel) return message.channel.send('Please connect to a voice channel.');
    if (message.guild.me.voiceChannel) return message.channel.send('Sorry, the bot is already connected to the guild.');
    if (!args[0]) return message.channel.send('Sorry, please input a url following the command.');

    let validate = await ytdl.validateURL(args[0]);
    if (!validate) return message.channel.send('Sorry, please input a **valid** url following the command.');

    let info = await ytdl.getInfo(args[0]);
    let connection = await message.member.voiceChannel.join();
    let dispatcher = await connection.playStream(ytdl(args[0], {
        filter: 'audioonly'
    }))

    message.channel.send(`Now playing: ${info.title}`);
};
  //leave
  if(cmd === `${prefix}guilds`){
  
   
 const guildArray = bot.guilds.map((guild) => {
    return `${guild.name} : ${guild.id}`
    })
  
    // And send it
    message.channel.send(`\`\`\`${guildArray.join("\n")}\`\`\``)
  }

  
  //nsfw
  if(cmd === `${prefix}nsfwgif`){
 
    if (!message.channel.nsfw) return message.reply("You can use this command only on nsfw channels!");
    
    let replies = ["https://78.media.tumblr.com/8c3df486bc2f7eb0b992019ff74c812a/tumblr_osn7f1242h1vpw5nxo1_500.gif", "https://78.media.tumblr.com/2ed7f5b5b1886a73b472d0e9f52f8b70/tumblr_o7854tvKXR1vpw5nxo1_400.gif", "https://78.media.tumblr.com/b9abb328981dc634da641b9b0f68cc40/tumblr_o4xkg71BGk1vpw5nxo1_500.gif", "https://78.media.tumblr.com/fd8e86ba904b17170f11d731e99043c2/tumblr_o4ry8qckvG1vpw5nxo1_500.gif", "https://78.media.tumblr.com/40c78b68c8ed362513d3286bf99f322f/tumblr_o4n22jlwJN1vpw5nxo1_400.gif", "https://78.media.tumblr.com/4f50555ee26b8cda1868108c57e8f2e5/tumblr_o4mmiqF2Cz1vpw5nxo1_400.gif", "https://78.media.tumblr.com/eb9a74715e65870b78535e941306307f/tumblr_o4l4ppRqat1vpw5nxo1_250.gif", "https://78.media.tumblr.com/544d5b52e112d86dc8494356118f0d15/tumblr_p9ei8wIJuf1v7dt6vo1_500.gif", "https://78.media.tumblr.com/cd7a4c688c8f5d7b05d8c092951180d1/tumblr_p91b9e2Kfh1v7dt6vo1_500.gif",
        "https://78.media.tumblr.com/5710bafd5111f8ffa3e1d631d689f12a/tumblr_p91toahaH91v7dt6vo1_400.gif"
    ];

    let result = Math.floor((Math.random() * replies.length));

    let gifembed = new Discord.RichEmbed()
        .setTitle("Here's your GIF! ")
        .setColor("#FF69B4")
        .setFooter(`Requested by ${message.author.tag} `, message.author.avatarURL)
        .setImage(replies[result]);

    message.channel.send(gifembed);
  }
  if(cmd === `${prefix}pornsearch`){
  google.resultsPerPage = 1
  google.protocol = 'https'
  var nextCounter = 0

  google(args, function (err, res) {
    if (err) console.log(err);

    for (var i = 0; i < res.links.length; ++i) {
      var link = res.links[i];
      if(!message.channel.nsfw) return message.channel.send("Pls Use In NSFW")
      message.nsfw.send(link.title + " " + link.href);
    }

    if (nextCounter < 1) {
      nextCounter += 1
      if (res.next) res.next()
    }

  })
    }
  if(cmd === `${prefix}weather`){
   weather.find({search: args.join(" "), degreeType: 'C'}, function(err, result) {
      if (err) message.channel.send(err);
      if (result === undefined || result.length === 0) {
          message.channel.send('**Please enter a location!**')
          return;
      }
      var current = result[0].current;
      var location = result[0].location;
      const embed = new Discord.RichEmbed()
          .setDescription(`**${current.skytext}**`)
          .setAuthor(`Weather for ${current.observationpoint}`)
          .setThumbnail(current.imageUrl)
          .setColor(0x00AE86)
          .addField('Timezone',`UTC${location.timezone}`, true)
          .addField('Degree Type',location.degreetype, true)
          .addField('Temperature',`${current.temperature} Degrees`, true)
          .addField('Feels Like', `${current.feelslike} Degrees`, true)
          .addField('Winds',current.winddisplay, true)
          .addField('Humidity', `${current.humidity}%`, true)
          message.channel.send({embed});
  })
  }
  if(cmd === `${prefix}repo`){



  let rUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
  if(!rUser) return message.channel.send("Couldn't find that user. Usage: !report <user> <reason>");
  let reason = args.join(" ").slice(22);

  let reportEmbed = new Discord.RichEmbed()
  .setDescription("Reports")
  .setColor("15f153")
  .addField("Reported User", `${rUser} with ID: ${rUser.id}`);

  message.channel.send(reportEmbed);
  return;
}
  if(cmd === `${prefix}lk`) {
  const status = args.join(' ');
  if (status.length === 0) {
    const embed = new Discord.RichEmbed()
      .setColor("#7289DA")
      .setDescription(':negative_squared_cross_mark: Name streaming status!');
    message.channel.send({ embed });
  }

  else if (status.length !== 0) {
   bot.user.setPresence({ game: { name: `${status}`, url: 'https://twitch.tv/twitch', type: 1 } });
  const embed = new Discord.RichEmbed()
    .setColor("#7289DA")
    .setDescription(':white_check_mark: You sucessfully changed streaming status');
  message.channel.send({ embed });
}}
  if(cmd === `${prefix}ls`){
   if (!args[0]) return message.channel.send('**Proper Usage: ++ls <URL> [title]**')
 
  // First, we need to check if they entered an optional title
  if (!args[1]) { // If the second argument in the message is undefined, run this
   
    shorten.shorten(args[0], function(res) { // This will run the shorten function and pass it 'res'
      if (res.startsWith('Error:')) return message.channel.send('**Please enter a valid URL**'); // The only possible error here would be that it's not a valid URL.
     
      message.channel.send(`**<${res}>**`); // If no error encountered, it will return with the response in the res variable
   
    })
   
  } else { // If the second argument IS defined, run this
   
    shorten.custom(args[0], args[1], function(res) { // This is sort of the same thing from earlier, although this will pass the first and second arguments to the shortener, then return 'res'
     
      // There are a few possible error messages, so we can just tell them what the shortener says
      if (res.startsWith('Error:')) return message.channel.send(`**${res}**`); // This will return the full error message
      // Make sure you return, so it doesn't run the rest of the code
     
      message.channel.send(`**<${res}>**`); // If no errors encountered, it will return the link.
     
     
    }) // We also can use <> to make sure it doesn't show an embed, now let's test it!
   
  }
 
}
  if(cmd === `${prefix}stats`){
    
 let cpuLol;
  cpuStat.usagePercent(function(err, percent, seconds) {
    if (err) {
      return console.log(err);
    }
  let gif1 = 'https://images-ext-2.discordapp.net/external/Rv8Bn9DtQ9TVO7422tLR2ZziBBRPq5x7yn3edJqHWMs/https/images-ext-2.discordapp.net/external/eXNgDXTJAj1TvbwIgq-aUyD7LwBFZVxFT78K5XTni_w/%253Fv%253D1/https/cdn.discordapp.com/emojis/456196250081951755.gif'
  const duration = moment.duration(bot.uptime).format(" D [days], H [hrs], m [mins], s [secs]");
  const embedStats = new Discord.RichEmbed()
    .setAuthor(bot.user.username, gif1)
    .setTitle("***BOT Stats***")
    .setColor("RANDOM")
    .addField("• Mem Usage", `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} / ${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`, true)
    .addField("• Uptime ", `${duration}`, true)
    .addField("• Users", `${bot.users.size.toLocaleString()}`, true)
    .addField("• Servers", `${bot.guilds.size.toLocaleString()}`, true)
    .addField("• Channels ", `${bot.channels.size.toLocaleString()}`, true)
    .addField("• Discord.js", `v${version}`, true)
    .addField("• Node", `${process.version}`, true)
    .addField("• CPU", `\`\`\`md\n${os.cpus().map(i => `${i.model}`)[0]}\`\`\``)
    .addField("• CPU usage", `\`${percent.toFixed(2)}%\``,true)
    .addField("• Arch", `\`${os.arch()}\``,true)
    .addField("• Platform", `\`\`${os.platform()}\`\``,true)
    .addField("API Latency", `${Math.round(bot.ping)}ms`)  
  message.channel.send(embedStats)
  });
};
 if(cmd === `${prefix}stat`){

 if (!message.member.voiceChannel) return message.channel.send('Please connect to a voice channel.');
 
 message.guild.me.voiceChannel.leave();
 
 await message.channel.send('**Sucessfuly Leavaed**')

}
  if(cmd === `${prefix}clear`){
    
    const user = message.mentions.users.first();
const amount = !!parseInt(message.content.split(' ')[1]) ? parseInt(message.content.split(' ')[1]) : parseInt(message.content.split(' ')[2])
if (!amount) return message.reply('Must specify an amount to delete!');
if (!amount && !user) return message.reply('Must specify a user and amount, or just an amount, of messages to purge!');
message.channel.fetchMessages({
 limit: amount,
}).then((messages) => {
 if (user) {
 const filterBy = user ? user.id : bot.user.id;
 messages = messages.filter(m => m.author.id === filterBy).array().slice(0, amount);
 }
 message.channel.bulkDelete(messages).catch(error => console.log(error.stack));
})
 message.channel.send(`Cleared ${args[0]} messages for now ok.`).then(msg => msg.delete(5000));
}
  if(cmd === `${prefix}website`){
  message.channel.send("https://jis.glitch.me/disco.html")
  message.channel.send("My Website")
  }
     });
bot.login(botconfig.token);
