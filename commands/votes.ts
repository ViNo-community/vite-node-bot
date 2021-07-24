import { HTTP_RPC } from '@vite/vitejs-http';
import { ViteAPI } from '@vite/vitejs';
import { RPCResponse } from '@vite/vitejs/distSrc/utils/type';
import { SBPVoteInfo, RewardPendingInfo, rawToVite } from '../viteTypes'

// Grab data from .env
require('dotenv').config();

// Grab files from .env
const RPC_NET = process.env.RPC_NET;
const SBP_NAME = process.env.SBP_NAME || 'ViNo_Community_Node';
const CHUNK_SIZE = 500;
// Set up HTTP RPC client and ViteClient
const httpProvider = new HTTP_RPC(RPC_NET);
let viteClient = new ViteAPI(httpProvider, () => {
    console.log('Vite client successfully connected: ');
});

module.exports = {
	name: 'votes',
	description: 'Display number of voters',
	execute(message, args) {     
        // User can pass in optional SBP Name
        let SBPName = "";
        if(!args.length) {
            SBPName = "";
        } else {
            // Use SBP argument
            SBPName = args[0];
        }
        // Get reward info for SBP
        showVoteList(message, SBPName)
        .catch(error => {
            console.error("Error while grabbing SBP rewards summary :" + error.message);
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
        console.log(`Could not retrieve rewards pending info for ${SBP}}`, res);
        throw res.error;
    });
    // Construct chat message
    let found = false;
    let chatMessage = "";
    if(voteInfo == null) {
        chatMessage = "Could not retrieve voter information";
    } else {
        voteInfo.forEach(function (vote) {
            // If vote equals our SBP
            if(SBP != "") {
                // Return just that SBP
                if(vote.sbpName == SBP) {
                    found = true;
                    chatMessage = "**Name:** " + vote.sbpName +
                    "\t**Votes:** " + rawToVite(vote.votes).toFixed(2)
                        // Send response to chat
                    message.channel.send(chatMessage);
                    chatMessage = "";
                    return;
                }
            } else {
                // Return all info
                chatMessage += "**Name:** " + vote.sbpName +
                    "\t**Votes:** " + rawToVite(vote.votes).toFixed(2) + "\n";
            }
            // Discord has a maximum message size
            // If message is >= CHUNK_SIZE then send what we have then clear the message
            if(chatMessage.length >= CHUNK_SIZE) {
                message.channel.send(chatMessage);
                chatMessage = "";
            }
        });
        if(SBP != "" && found == false) {
            chatMessage = "Could not find voting information for SBP \"" + SBP + "\"";
        }
        if(chatMessage.length > 0) message.channel.send(chatMessage);
    }


}
