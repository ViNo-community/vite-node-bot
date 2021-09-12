import { RPCResponse, TokenInfo } from '@vite/vitejs/distSrc/utils/type';
import { viteClient } from '../index';


module.exports = {
	name: 'token',
	description: 'Display token information for specified token ID',
	execute(message, args) {     
        // User can pass in optional SBP Name
        let prefix = message.client.botConfig.prefix; 
        let tokenID = "";
        // User passes in address
        if(!args.length) {
            message.channel.send("Usage: " + prefix + "token <tokenID>");
            return;
        } else {
            tokenID = args[0];
        }
        console.log("Looking up token info for " + tokenID);
        // Get token info for tokenID
        showTokenInformation(message, tokenID)
        .catch(error => {
            console.error("Error while grabbing token information: " + error.message);
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
        console.log(`Could not retrieve token info for ${tokenID}}`, res);
        throw res.error;
    });

    let chatMessage = "";
    if(tokenInfo == null) {
        chatMessage = "No token information available for " + tokenID;
    } else {
        chatMessage = "**Token Name:** " + tokenInfo.tokenName +
            "\n**Token Symbol:** " + tokenInfo.tokenSymbol +
            "\n**Token ID:** " + tokenInfo.tokenId +
            "\n**Decimals:** " + tokenInfo.decimals +
            "\n**Owner:** " + tokenInfo.owner +
            "\n**Is ReIssuable:** " + tokenInfo.isReIssuable +
            "\n**Max Supply:** " + tokenInfo.maxSupply +
            "\n**Owner Burn Only:** " + tokenInfo.isOwnerBurnOnly + 
            "\n**Index:** " + tokenInfo.index;
    }
    // Send response to chat
    message.channel.send(chatMessage);

}
