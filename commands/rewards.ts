import { HTTP_RPC } from '@vite/vitejs-http';
import { ViteAPI } from '@vite/vitejs';
import { RPCResponse } from '@vite/vitejs/distSrc/utils/type';
import { RewardPendingInfo, rawToVite } from '../viteTypes'


// Grab files from .env
const RPC_NET = process.env.RPC_NET;
const SBP_NAME = process.env.SBP_NAME || 'ViNo_Community_Node';

const httpProvider = new HTTP_RPC(RPC_NET);
const viteClient = new ViteAPI(httpProvider, () => {
    console.log('Vite client successfully connected: ');
});

module.exports = {
	name: 'rewards',
	description: 'Display information about unclaimed rewards',
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
        console.log("Looking up rewards pending info for SBP: " + SBPName);
        // Get reward info for SBP
        showRewardsPending(message, SBPName)
        .catch(error => {
            console.error("Error while grabbing SBP rewards summary :" + error.message);
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
        console.log(`Could not retrieve rewards pending info for ${SBP}}`, res);
        throw res.error;
    });

    console.log(rewards);
    message.channel.send(rewards);

}
