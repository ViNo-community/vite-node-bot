import { RPCResponse } from '@vite/vitejs/distSrc/utils/type';
import { convertRaw } from '../common';
import { getLogger } from '../logger';
import { TokenListInfo } from '../viteTypes';
import { viteClient } from '../index';

const logger = getLogger();

module.exports = {
	name: 'token_list',
	description: 'Display tokens list',
	execute(message, args) {     
        let prefix = message.client.botConfig.prefix; 
        let index = 0;
        let pageSize = 0;
        // Grab address and block height from user input
        if(args.length != 2) {
            message.channel.send("Usage: " + prefix + "tokens <starting index> <number to show>");
            return;
        } else {
            index = parseInt(args[0]);
            if(index < 0) {
                message.channel.send("Invalid index. Must be greater than 0")
                return;
            }
            if(isNaN(index)) {
                message.channel.send("Invalid index. Must be integer")
                return;
            }
            pageSize = parseInt(args[1])
            if(pageSize < 0) {
                message.channel.send("Invalid page size. Must be greater than 0")
                return;
            } else if(pageSize > 5) {
                message.channel.send("Maximum of 5 at a time.")
                return;
            }
            if(isNaN(pageSize)) {
                message.channel.send("Invalid page size. Must be integer")
                return;
            }
        }
        console.log("Looking up tokens list start at index "  + index + " page size " + pageSize);
        // Get tokens list
        showTokens(message, index, pageSize)
        .catch(error => {
            let errorMsg = "Error while grabbing tokens list starting at index  " + index + " page size " + pageSize + " : " + error;
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

const showTokens = async (message, index : number, pageSize : number) => {

    let tokensList : TokenListInfo;
  
    tokensList = await getTokens(index, pageSize).catch((res: RPCResponse) => {
        let errorMsg = "Error while grabbing tokens list for index " + index + " page size " + pageSize + " : " + res.error.message;
        logger.error(errorMsg);
        console.log(errorMsg);
        throw res.error;
    });

    try {
        let chatMessage = "";
        if(tokensList == null) {
            chatMessage = "No information for tokens list for index " + index + " page size " + pageSize;
        } else {
            // Log and display total token count
            chatMessage = "**Total Token Count:** " + tokensList.totalCount + "\n";
            // Send response to chat
            logger.info(chatMessage);
            message.channel.send(chatMessage);
            // Show each token summary
            let i : number = (index + 1);
            tokensList.tokenInfoList.forEach(function(tokenInfo) {
                let decimals : number = parseInt(tokenInfo.decimals);
                let totalSupply = convertRaw(parseInt(tokenInfo.totalSupply),decimals);
                let maxSupply = convertRaw(parseInt(tokenInfo.maxSupply),decimals);
                let totalSupplyStr = totalSupply.toLocaleString(undefined, {minimumFractionDigits: 2});
                let maxSupplyStr = maxSupply.toLocaleString(undefined, {minimumFractionDigits: 2});
                chatMessage = "**Token #" + i++ + "**" +
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
            });
        }
    } catch(err) {
        console.error("Error while grabbing tokens list for index " + index + " page size " + pageSize + " : " + err);
        console.error(err.stack);
    }
}