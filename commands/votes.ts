import { HTTP_RPC } from '@vite/vitejs-http';
import { ViteAPI } from '@vite/vitejs';
import { RPCResponse } from '@vite/vitejs/distSrc/utils/type';
import { SBPVoteInfo, RewardPendingInfo, rawToVite } from '../viteTypes'

// Grab data from .env
require('dotenv').config();

// Grab files from .env
const RPC_NET = process.env.RPC_NET;
const SBP_NAME = process.env.SBP_NAME || 'ViNo_Community_Node';
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
            // Use SBP in .env
            SBPName = SBP_NAME;
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

    console.log("Looking for " + SBP);
    let chatMessage = "";
    if(voteInfo == null) {
        chatMessage = "Could not retrieve voter information";
    } else {
        voteInfo.forEach(function (vote) {
            console.log(vote);
            // If vote equals our SBP
            if(vote.SBPName == SBP) {
                chatMessage = "**Name:** " + SBP +
                "\n**Voters:** " + vote.votes;
                    // Send response to chat
                message.channel.send(chatMessage);
                return;
            }
        });
    }


}
