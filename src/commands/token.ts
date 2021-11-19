import { RPCResponse, TokenInfo } from '@vite/vitejs/distSrc/utils/type';
import * as vite from "@vite/vitejs";
import { convertRaw, printTokenInformation } from '../common';
import { getLogger } from '../logger';
import { getTokenInformation } from '../vite_functions';

const logger = getLogger();

module.exports = {
	name: 'token',
    aliases: ["tti"],
	description: 'Display token information for specified token ID',
	execute(message, args) {     
        // User can pass in optional SBP Name
        let prefix = message.client.botConfig.prefix; 
        let tokenID = "";
        // User passes in address
        if(args.length != 1) {
            message.channel.send("Usage: " + prefix + "token <tokenID>");
            return;
        } else {
            tokenID = args[0];
            // Don't allow @ in them
            if(tokenID.includes("@")) {
                message.channel.send("Invalid tokenID.");
                return;
            }
        }
        // Validate token ID
        if(!vite.utils.isValidTokenId(tokenID)) {
            message.channel.send("Invaid token ID \"" + tokenID + "\"");
            return;
        }
        // Get token info for tokenID
        showTokenInformation(message, tokenID)
        .catch(error => {
            let errorMsg = "Error while grabbing token information for \"" + tokenID + "\" :" + error;
            logger.error(errorMsg);
            console.error(errorMsg);
            message.channel.send(errorMsg);
        });
	},
};

const showTokenInformation = async (message, tokenID: string) => {

    let tokenInfo: TokenInfo;

    // Get token info for specified tokenID
    tokenInfo = await getTokenInformation(tokenID).catch((res: RPCResponse) => {
        let errorMsg = "Could not retrieve token info for \"" + tokenID + "\" : " + res.error.message;
        logger.error(errorMsg);
        console.log(errorMsg);
        throw res.error.message;
    });
    // Print token info if it exists
    let chatMessage = "";
    if(tokenInfo == null) {
        chatMessage = "No token information available for " + tokenID;
    } else {
        // Show match
        chatMessage = await printTokenInformation(tokenInfo).catch((res: RPCResponse) => {
            let errorMsg = "Error while grabbing token information for " + tokenID + " : " + res.error.message;
            logger.error(errorMsg);
            console.log(errorMsg);
            throw res.error.message;
        });   
    }
    // Send response to chat
    logger.info(chatMessage);
    message.channel.send(chatMessage);
}
