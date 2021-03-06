import { HTTP_RPC } from '@vite/vitejs-http';
import { WS_RPC } from '@vite/vitejs-ws';
import { getLogger } from '../logger';
import { viteClient } from '../index';

const logger = getLogger();

module.exports = {
	name: 'mode',
    aliases: ["m"],
	description: 'Set which network to connect to',
	execute(message, args) {
        const fs = require('fs');                   // Loads the Filesystem library
        const oldConfig = require('../../config.json');   // Loads bot config file
        if(!args.length) {
            const mode  = oldConfig.network;
            // No new prefix. Output usage
            message.channel.send("Currently in " + mode);
            return;
        }

        // Read in new mode
        const newMode = args[0].toUpperCase();
        if(! (newMode == "TESTNET" || newMode == "MAINNET")) {
            message.channel.send("Invalid network");
            message.channel.send("Usage: " + oldConfig.prefix + "mode [TESTNET | MAINNET]");
            return;
        }

        // Create new config
        var newConfig = {
            token: oldConfig.token,
            prefix: oldConfig.prefix,
            mainNode: oldConfig.mainNode,
            testNode: oldConfig.testNode,
            network: newMode,
            SBP: oldConfig.SBP,
            clinetID: oldConfig.clientID,
            permissions: oldConfig.permissions
        };

        try {
            // Write new config 
            fs.writeFileSync("config.json", JSON.stringify(newConfig, null, 2), function(err, result) {
                if (err) throw err;
            });
        } catch(e) {
            let errorMsg = "Error writing new config.json: " + e;
            logger.error(errorMsg);
            logger.error(e.stack);
            console.error(errorMsg);
            console.error(e.stack);
            message.channel.send("Could not set new command prefix: " + e);
        }

        try {
            // Reload config
            console.log("Setting new mode to " + newMode);
            // Reload config.json here
            delete require.cache[require.resolve('../../config.json')]   // Delete cache
            var config = require("../../config.json");
            var viteNode : string = "";

            // Check if MAINNET or TESTNET
            if(newMode == "MAINNET") {
                viteNode = config.mainNode;
            } else if(newMode == "TESTNET") {
                viteNode = config.testNode;
            } else {
                console.log("Invalid network specified: " + newMode + ". Please set network in config.json to either MAINNET or TESTNET");
                return;
            }
            console.log("Changing mode to " + newMode + ". Using " + viteNode);

            // Determine whether to set up HTTP or WS
            var provider;
            if(viteNode.startsWith("http")) {
                console.log("Loading " + newMode + "  with http node " + viteNode);
                provider = new HTTP_RPC(viteNode);
            } else if(viteNode.startsWith("ws")) {
                console.log("Loading " + newMode + "  with ws node " + viteNode);
                provider = new WS_RPC(viteNode);
            } else {
                console.log("Invalid protocol for node: " + viteNode + ". Please add https:// or wss://");
                return;
            }

            // Re-establish connection for viteClient
            viteClient.setProvider(provider, () => {
                let infoMsg = "Vite client successfully reconnected to " + newMode;
                logger.info(infoMsg);
                console.log(infoMsg);
            }, true);

            // Reload bot
            message.channel.send("Switching to " + newMode)
            .then(msg => message.client.destroy())
            .then(() => message.client.botConfig = config)
            .then(() => message.client.login(config.token)
            .then(() => { 
                let statusMessage = "say " + message.client.botConfig.prefix + "help | Online";
                // Set the client user's presence
                message.client.user.setPresence({ activity: { name: statusMessage}, status: "online" })
                .catch(console.error);
            }));
        } catch(e) {
            console.error("Error reloading bot: " + e);
            console.error(e.stack);
            message.channel.send("Could not reload bot with new config.json: " + e);
        }
	},
};