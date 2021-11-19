import { RPCResponse } from '@vite/vitejs/distSrc/utils/type';
import { RewardPendingInfo, rawToVite } from '../viteTypes';
import * as vite from "@vite/vitejs";
import { viteClient } from '../index';
import { getLogger } from '../logger';

const Config = require('../../config.json');   // Grab client_id and permissions from config.json

const logger = getLogger();

// Get SBP from config.json or default to ViNo
const SBP_NAME = Config.SBP || 'ViNo_Community_Node';

module.exports = {
	name: 'rewards',
    aliases: ["r"],
	description: 'Display information about unclaimed rewards',
	execute(message, args) {     
        // User can pass in optional SBP Name
        let SBPName = "";
        if(args.length != 1) {
            // Use SBP in .env
            SBPName = SBP_NAME;
        } else {
            // Use SBP argument
            SBPName = args[0];
            // Validate SBP
            if(!vite.utils.isValidSBPName(SBPName)) {
                message.channel.send("Invaid SBP name");
                return;
            }
        }
        // Get reward info for SBP
        showRewardsPending(message, SBPName)
        .catch(error => {
            let errorMsg = "Error while grabbing SBP rewards summary for \"" + SBPName + "\" : " + error;
            message.channel.send(errorMsg);
            logger.error(errorMsg);
            console.error(errorMsg);
        });
	},
};

const getRewardsPendingBySBP = async (SBP: string) => {
    const rewardsPending: RewardPendingInfo = await viteClient.request('contract_getSBPRewardPendingWithdrawal', SBP);
    return rewardsPending;
};

const showRewardsPending = async (message, SBP: string) => {

    let rewards: RewardPendingInfo;

    // Get rewards pending info for specified SBP
    rewards = await getRewardsPendingBySBP(SBP).catch((res: RPCResponse) => {
        let errorMsg = "Could not retrieve rewards pending info for \"" + SBP + "\" : " + res.error.message;
        logger.error(errorMsg);
        console.log(errorMsg);
        throw res.error.message;
    });

    let chatMessage = "";
    if(rewards == null) {
        chatMessage = "No information for SBP " + SBP;
    } else {
        chatMessage = "**Name:** " + SBP +
            "\n**Block Producing Reward:** " + 
            rawToVite(rewards.blockProducingReward).toLocaleString(undefined, {minimumFractionDigits: 2}) +
            "\n**Voting Reward:** " + 
            rawToVite(rewards.votingReward).toLocaleString(undefined, {minimumFractionDigits: 2}) +
            "\n**Total Reward:** " + 
            rawToVite(rewards.totalReward).toLocaleString(undefined, {minimumFractionDigits: 2}) +
            "\n**Withdrawn:** " + rewards.allRewardWithdrawed;
    }
    // Send response to chat
    logger.info(chatMessage);
    message.channel.send(chatMessage);
}
