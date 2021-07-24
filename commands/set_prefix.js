
const config = require('../config.json');   // Loads bot config file
const fs = require('fs');                   // Loads the Filesystem library

module.exports = {
	name: 'set_prefix',
	description: 'Set the bot prefix',
	execute(message, args) {
        
        prefix = message.client.botConfig.prefix;
        if(!args.length) {
            // No new prefix. Output usage
            message.channel.send("Usage: " + prefix + "set_prefix <new_prefix>");
        } else {
            // Read in new prefix
            newPrefix = args[0];
            // Create new config
            newConfig = {
                token: config.token,
                prefix: newPrefix,
            };
            try {
                // Write new config 
                fs.writeFile("config.json", JSON.stringify(newConfig, null, 2), function(err, result) {
                    if (err) throw err;
                });
                // Reload config
                console.log("Setting new prefix to " + newPrefix);

                // Output change
		        message.channel.send("Set new command prefix to \"" + newPrefix + "\"");
            } catch(e) {
                console.error("Error writing new config.json: " + e);
                console.error(e.stack);
                message.channel.send("Could not set new command prefix: " + e);
            }

            //message.client.destroy();
            //message.client.login();

        }
	},
};