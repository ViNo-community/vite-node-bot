import { RPCResponse, TokenInfo } from '@vite/vitejs/distSrc/utils/type';
import { convertRaw } from '../common';
import { viteClient } from '../index';
import { getLogger } from '../logger';

const logger = getLogger();

module.exports = {
	name: 'token',
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
        }
        // Get token info for tokenID
        showTokenInformation(message, tokenID)
        .catch(error => {
            let errorMsg = "Error while grabbing token information for \"" + tokenID + "\" :" + error.message;
            logger.error(errorMsg);
            console.error(errorMsg);
            message.channel.send(errorMsg);
        });
	},
};


const getTokenInformation = async (tokenID: string) => {
    const tokenInfo: TokenInfo = await viteClient.request('contract_getTokenInfoById', tokenID);
    return tokenInfo;
};

const showTokenInformation = async (message, tokenID: string) => {

    let tokenInfo: TokenInfo;

    // Get token info for specified tokenID
    tokenInfo = await getTokenInformation(tokenID).catch((res: RPCResponse) => {
        let errorMsg = "Could not retrieve token info for \"" + tokenID + "\" : " + res.error.message;
        logger.error(errorMsg);
        console.log(errorMsg);
        throw res.error;
    });

    let chatMessage = "";
    if(tokenInfo == null) {
        chatMessage = "No token information available for " + tokenID;
    } else {

        let decimals : number = parseInt(tokenInfo.decimals);
        let totalSupply = convertRaw(parseInt(tokenInfo.totalSupply),decimals);
        let maxSupply = convertRaw(parseInt(tokenInfo.maxSupply),decimals);
        let totalSupplyStr = totalSupply.toLocaleString(undefined, {minimumFractionDigits: 2});
        let maxSupplyStr = maxSupply.toLocaleString(undefined, {minimumFractionDigits: 2});
        chatMessage = "**Token Name:** " + tokenInfo.tokenName +
            "\n**Token Symbol:** " + tokenInfo.tokenSymbol +
            "\n**Token ID:** " + tokenInfo.tokenId +
            "\n**Decimals:** " + tokenInfo.decimals +
            "\n**Owner:** " + tokenInfo.owner +
            "\n**Is ReIssuable:** " + tokenInfo.isReIssuable +
            "\n**Total Supply:** " + totalSupplyStr +
            "\n**Max Supply:** " + maxSupplyStr +
            "\n**Owner Burn Only:** " + tokenInfo.isOwnerBurnOnly + 
            "\n**Index:** " + tokenInfo.index;
    }
    // Send response to chat
    logger.info(chatMessage);
    message.channel.send(chatMessage);
}
