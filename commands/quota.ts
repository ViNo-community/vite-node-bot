import { RPCResponse } from '@vite/vitejs/distSrc/utils/type';
import { QuotaInfo, rawToVite } from '../viteTypes';
import { quotaToUT } from '../common'
import { viteClient } from '../index';
import { getLogger } from '../logger';

const logger = getLogger();

module.exports = {
	name: 'quota',
	description: 'Display quota information for specified account',
	execute(message, args) {     
        // User can pass in optional SBP Name
        let prefix = message.client.botConfig.prefix; 
        let address = "";
        // User passes in address
        if(args.length != 1) {
            message.channel.send("Usage: " + prefix + "quota <address>");
            return;
        } else {
            address = args[0];
        }
        console.log("Looking up quota for " + address);
        // Get quota info for account
        showQuotaInformation(message, address)
        .catch(error => {
            let errorMsg = "Error while grabbing quota information for " + address + " : " + error.message;
            message.channel.send(errorMsg);
            logger.error(errorMsg);
            console.error(errorMsg);
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
        let errorMsg = "Could not retrieve quota info for " + account + " : " + res.error.message;
        logger.error(errorMsg);
        console.log(errorMsg);
        throw res.error;
    });

    let chatMessage = "";
    if(quotaInfo == null) {
        chatMessage = "No quota information available for " + account;
    } else {
        chatMessage = "**Address:** " + account +
            "\n**Current Quota** " + quotaToUT(parseInt(quotaInfo.currentQuota)).toLocaleString(undefined, {minimumFractionDigits: 2}) + " UT "+
            "\n**Max Quota:** " + quotaToUT(parseInt(quotaInfo.maxQuota)).toLocaleString(undefined, {minimumFractionDigits: 2}) + " UT " +
            "\n**Stake Amount:** " +  rawToVite(quotaInfo.stakeAmount).toLocaleString(undefined, {minimumFractionDigits: 2});
    }
    // Send response to chat
    logger.info(chatMessage);
    message.channel.send(chatMessage);

}
