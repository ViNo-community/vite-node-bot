import { RPCResponse } from '@vite/vitejs/distSrc/utils/type';
import { convertRaw } from '../common';
import { getLogger } from '../logger';
import { TokenListInfo } from '../viteTypes';
import { viteClient } from '../index';

const logger = getLogger();

module.exports = {
	name: 'tokens',
    aliases: ["search_tokens"],
	description: 'Searches for a token among token list',
	execute(message, args) {     
        let prefix = message.client.botConfig.prefix; 
        let search_string = "";
        // Grab search string
        if(args.length != 1) {
            message.channel.send("Usage: " + prefix + "tokens <search string>");
            return;
        } else {
            // Make uppercase
            search_string = args[0].toUpperCase().replace('@', '@​\u200b'); 
        }
        console.log("Searching tokens list for " + search_string);
        // Search tokens list
        searchTokens(message, search_string)
        .catch(error => {
            let errorMsg = "Error while searching tokens list for  " + search_string + " : " + error;
            message.channel.send(errorMsg);
            logger.error(errorMsg);
            console.error(errorMsg);
        });
	},
};


const getTokens = async (index: number, pageSize : number) => {
    const tokensList: TokenListInfo = await viteClient.request('contract_getTokenInfoList', index, pageSize);
    return tokensList;
};

const searchTokens = async (message, search_string : string) => {

    let tokensList : TokenListInfo;
    let pageSize = 200;
    tokensList = await getTokens(0, pageSize).catch((res: RPCResponse) => {
        let errorMsg = "Error while grabbing tokens list for index 0 page size " + pageSize + " : " + res.error.message;
        logger.error(errorMsg);
        console.log(errorMsg);
        throw res.error;
    });

    try {
        let chatMessage = "";
        if(tokensList == null) {
            chatMessage = "No tokens found for index 0 page size " + pageSize;
        } else {
            // Keep track of how many matches
            let i = 0;
            // Go thru whole token list
            //tokensList.tokenInfoList.forEach(function(tokenInfo) {
            for (let tokenInfo of tokensList.tokenInfoList) {
                // If token name or id contains search_string show it
                if(tokenInfo.tokenName.toUpperCase().includes(search_string) ||
                   tokenInfo.tokenId.toLowerCase().includes(search_string)) {
                        i++;
                        if(i >= 5) {
                            // Alert that there are too many matches to list 
                            message.channel.send("\nThere are too many matches to list...");
                            console.log("Too many matches to list for search string " + search_string);
                            // Then break 
                            break;
                        }
                        // Show match
                        let decimals : number = parseInt(tokenInfo.decimals);
                        let totalSupply = convertRaw(parseInt(tokenInfo.totalSupply),decimals);
                        let maxSupply = convertRaw(parseInt(tokenInfo.maxSupply),decimals);
                        let totalSupplyStr = totalSupply.toLocaleString(undefined, {minimumFractionDigits: 2});
                        let maxSupplyStr = maxSupply.toLocaleString(undefined, {minimumFractionDigits: 2});
                        chatMessage = "**Match #" + i + "**" +
                            "\n**Token Name:** " + tokenInfo.tokenName +
                            "\n**Token Symbol:** " + tokenInfo.tokenSymbol +
                            "\n**Token ID:** " + tokenInfo.tokenId +
                            "\n**Decimals:** " + tokenInfo.decimals +
                            "\n**Owner:** " + tokenInfo.owner +
                            "\n**Is ReIssuable:** " + tokenInfo.isReIssuable +
                            "\n**Total Supply:** " + totalSupplyStr +
                            "\n**Max Supply:** " + maxSupplyStr +
                            "\n**Owner Burn Only:** " + tokenInfo.isOwnerBurnOnly + 
                            "\n**Index:** " + tokenInfo.index;
                        message.channel.send(chatMessage);
                   }
            }
            // If no matches found
            if(i == 0) {
                search_string = search_string.replace(/@/g, "_");
                chatMessage = "No matches found for search string: " + search_string;
                message.channel.send(chatMessage);
                console.log(chatMessage);
            }
        }
    } catch(err) {
        console.error("Error while searching for token " + search_string + " : " + err);
        console.error(err.stack);
    }
}