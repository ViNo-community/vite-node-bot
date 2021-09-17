import { RPCResponse } from '@vite/vitejs/distSrc/utils/type';
import { SBPVoteInfo, rawToVite } from '../viteTypes'
import { viteClient } from '../index';
import { getLogger } from '../logger';
import * as vite from "@vite/vitejs";

const logger = getLogger();

const CHUNK_SIZE = 500;

module.exports = {
	name: 'votes',
	description: 'Display number of voters',
	execute(message, args) {     
        // User can pass in optional SBP Name
        let SBPName = "";
        if(args.length != 1) {
            SBPName = "";
        } else {
            // Use SBP argument
            SBPName = args[0];
            // Validate SBP
            if(!vite.utils.isValidSBPName(SBPName)) {
                message.channel.send("Invaid SBP name \"" + SBPName + "\"");
                return;
            }
        }
        // Get reward info for SBP
        showVoteList(message, SBPName)
        .catch(error => {
            let errorMsg = "Error grabbing vote info SBP:\"" + SBPName + "\" : " + error;
            message.channel.send(errorMsg);
            logger.error(errorMsg);
            console.error(errorMsg);
        });
	},
};

const getVoteList = async () => {
    const voteInfo : Array<SBPVoteInfo> = await viteClient.request('contract_getSBPVoteList');
    return voteInfo;
};

const showVoteList = async (message, SBP: string) => {

    let voteInfo : Array<SBPVoteInfo>;

    // Get rewards pending info for specified SBP
    voteInfo = await getVoteList().catch((res: RPCResponse) => {
        let errorMsg = "Could not retrieve vote info SBP:\"" + SBP + "\" : " + res.error.message;
        logger.error(errorMsg);
        console.log(errorMsg);
        throw res.error;
    });
    // Construct chat message
    let found = false;
    let chatMessage = "";
    let rank = 1;
    if(voteInfo == null) {
        chatMessage = "Could not retrieve voter information";
    } else {
        voteInfo.forEach(function (vote) {
            // If vote equals our SBP
            if(SBP != "") {
                // Return just that SBP
                if(vote.sbpName == SBP) {
                    found = true;
                    chatMessage = "**" + rank + ") Name:** " + vote.sbpName +
                    "\t**Votes:** " + rawToVite(vote.votes).toLocaleString(undefined, {minimumFractionDigits: 2})
                        // Send response to chat
                    message.channel.send(chatMessage);
                    chatMessage = "";
                    return;
                }
            } else {
                // Return all info
                chatMessage += "**" + rank + ") Name:** " + vote.sbpName +
                    "\t**Votes:** " + rawToVite(vote.votes).toLocaleString(undefined, {minimumFractionDigits: 2}) + "\n";
            }
            // Discord has a maximum message size
            // If message is >= CHUNK_SIZE then send what we have then clear the message
            if(chatMessage.length >= CHUNK_SIZE) {
                message.channel.send(chatMessage);
                chatMessage = "";
            }
            rank++;
        });
        if(SBP != "" && found == false) {
            chatMessage = "Could not find voting information for SBP \"" + SBP + "\"";
        }
        if(chatMessage.length > 0) {
            logger.info(chatMessage);
            message.channel.send(chatMessage);
        }
    }

}