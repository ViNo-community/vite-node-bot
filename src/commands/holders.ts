import { RPCResponse, TokenInfo } from '@vite/vitejs/distSrc/utils/type';
import * as vite from "@vite/vitejs"
import { AccountInfo, BalanceInfo} from '../viteTypes';
import { viteClient } from '../index';
import { getLogger } from '../logger';
import { convertRaw } from '../common';
import fetch from 'node-fetch';
import { MessageAttachment } from 'discord.js';

const logger = getLogger();
const fs = require('fs');

module.exports = {
	name: 'holders',
  aliases: ["hold"],
	description: 'Display holders data for specified tokenID',
	execute(message, args) {    
        let prefix = message.client.botConfig.prefix; 
        let tti = "";
        // User passes in address
        if(args.length != 1) {
            message.channel.send("Usage: " + prefix + "holders <tti>");
            return;
        } 
        tti = args[0].replace('@', '@​\u200b');
        // Construct url
        const url = "https://vitescan.io/vs-api/token?tokenId=" + tti;
        console.log("Looking up price info for " + tti + " with " + url);
        // Fetch URL. Print output
        fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
            return response.json();
        })
        .then(json => {
            // Parse data from JSON
            if(!('data' in json)) {
                throw new Error("json has no data object : " + JSON.stringify(json));
            }
            let data = json.data;
            if(!('holderCount' in data)) {
                throw new Error("json.data has no holderCount object : " + JSON.stringify(json));
            }
            // Construct file contents
            // Add # of token holders
            var content = "Token: " + tti + " Holders: " + data.holderCount + "\n";
            // Add headers
            content += "Address,Balance,Percentage,Transaction Count\n";
            // Output each account data as CSV string
            for(var i = 0; i < data.accountsResults.length; i++) {
                let account = data.accountsResults[i];
                content += [account.address,account.balance,account.percentage,account.txnCount].join(',') + "\n";
            }
            console.log("CSV data for token holders: " + content);
            // Construct temp file name
            const now = Date.now();
            const fileName = "temp/holders" + now + ".csv";
            console.log("Writing temp data to " + fileName);
            // Write content to temp file
            fs.writeFile(fileName, content, err => {
                if (err) {
                    console.error(err)
                    return
                }
                const file = new MessageAttachment(fileName); 
                message.channel.send(file); 
                //file written successfully
            })
        }) 
        .catch(function (error) {
          console.log(error);
        })
	},
};

const getAccountInformation= async (address: string) => {
    const accountInfo: AccountInfo = await viteClient.request('ledger_getAccountInfoByAddress', address);
    return accountInfo;
};

const showPriceInformation = async (message, address: string) => {

    let accountInfo: AccountInfo;
    let balanceInfoMap : ReadonlyMap<String, BalanceInfo>;

    // Get account info for address
    accountInfo = await getAccountInformation(address).catch((res: RPCResponse) => {
        let errorMsg = "Could not retrieve account balances for " + address;
        logger.error(errorMsg);
        console.log(errorMsg, res);
        throw res.error.message;
    });

    try {
        let chatMessage = "";
        if(accountInfo == null) {
            chatMessage = "No information for account " + address;
        } else {
            chatMessage = "**Address:** " + accountInfo.address + "\n"
            balanceInfoMap = accountInfo.balanceInfoMap;
            for(const tokenID in balanceInfoMap) {
                let balanceInfo : BalanceInfo = balanceInfoMap[tokenID];
                let tokenInfo : TokenInfo = balanceInfo.tokenInfo;
                let decimals = parseInt(tokenInfo.decimals);
                let balance = parseFloat(balanceInfo.balance);
                let readableBalance = convertRaw(balance, decimals);
                chatMessage += "**" + tokenInfo.tokenSymbol + ":** " + 
                    readableBalance.toLocaleString(undefined, {minimumFractionDigits: 2}) + "\n";
            }
        }
        // Send response to chat
        logger.info(chatMessage);
        message.channel.send(chatMessage);
    } catch(err) {
        console.error("Error displaying balance info for " + address + " : " + err);
        console.error(err.stack);
    }

}
