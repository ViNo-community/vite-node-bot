import { HTTP_RPC } from '@vite/vitejs-http';
import { ViteAPI } from '@vite/vitejs';
import { RPCResponse } from '@vite/vitejs/distSrc/utils/type';
import { QuotaInfo, rawToVite } from '../viteTypes';

// Grab data from .env
require('dotenv').config();

// Grab info from .env
const RPC_NET = process.env.RPC_NET;

const httpProvider = new HTTP_RPC(RPC_NET);
let viteClient = new ViteAPI(httpProvider, () => {
    console.log('Vite client successfully connected: ');
});

module.exports = {
	name: 'quota',
	description: 'Display quota information for specified account',
	execute(message, args) {     
        // User can pass in optional SBP Name
        let prefix = message.client.botConfig.prefix; 
        let address = "";
        // User passes in address
        if(!args.length) {
            message.channel.send("Usage: " + prefix + "quota <address>");
            return;
        } else {
            address = args[0];
        }
        console.log("Looking up quota for " + address);
        // Get quota info for account
        showQuotaInformation(message, address)
        .catch(error => {
            console.error("Error while grabbing SBP rewards summary :" + error.message);
        });


	},
};

const getQuotaInformation = async (account: string) => {
    const quotaInfo: QuotaInfo = await viteClient.request('contract_getQuotaByAccount', account);
    return quotaInfo;
};

const showQuotaInformation = async (message, account: string) => {

    let quotaInfo: QuotaInfo;

    // Get quote info for specified account
    quotaInfo = await getQuotaInformation(account).catch((res: RPCResponse) => {
        console.log(`Could not retrieve quota info for ${account} `, res);
        throw res.error;
    });

    let chatMessage = "";
    if(quotaInfo == null) {
        chatMessage = "No quota information available for " + account;
    } else {
        chatMessage = "**Address:** " + account +
            "\n**Current Quota** " + parseInt(quotaInfo.currentQuota).toLocaleString(undefined, {minimumFractionDigits: 2}) +
            "\n**Max Quota:** " + parseInt(quotaInfo.maxQuota).toLocaleString(undefined, {minimumFractionDigits: 2}) +
            "\n**Stake Amount:** " +  rawToVite(quotaInfo.stakeAmount).toLocaleString(undefined, {minimumFractionDigits: 2});
    }
    // Send response to chat
    message.channel.send(chatMessage);

}
