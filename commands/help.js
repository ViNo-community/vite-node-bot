
const Discord = require('discord.js');  

module.exports = {
    name: 'help',
    description: 'List all of my commands or info about a specific command.',
    aliases: ['commands'],
    usage: '[command name]',
    cooldown: 5,
    execute(message, args) {
        if (!args.length) {

            prefix = message.client.botConfig.prefix;

            const embed = new Discord.MessageEmbed()
               .setTitle('Here\'s a list of all my commands:')
               .addFields(
                  { name: '**Commands:**', value: message.client.commands.map(command => command.name).join(', ') },
                  { name: '\u200B', value: `For help on a specific command send: \`${prefix}help [command name]\``}
               )
   
            return message.channel.send({embed: embed})
               .catch(error => {
                  console.error(`Could not send help DM to ${message.channel.tag}.\n`, error);
               });
         }
    }
};