import { RPCResponse } from '@vite/vitejs/distSrc/utils/type';
import * as vite from "@vite/vitejs"
import { StakeListInfo } from '../viteTypes';
import { viteClient } from '../index';
import { getLogger } from '../logger';
import { convertRawToVite, epochToDate } from '../common';

const logger = getLogger();

module.exports = {
	name: 'stake',
	description: 'Display staking records for this account',
	execute(message, args) {    
        let prefix = message.client.botConfig.prefix; 
        let address = "";
        let index = 0;
        let pageSize = 0;
        const logger = getLogger();
        // Grab address and block height from user input
        if(args.length != 3) {
            message.channel.send("Usage: " + prefix + "stake <address> <index> <pageSize>");
            return;
        } else {
            address = args[0];
            if(vite.wallet.isValidAddress(address) == vite.wallet.AddressType.Illegal) {
                let errorMsg : string = "Invalid address \"" + address + "\"";
                message.channel.send(errorMsg);
                logger.error(errorMsg);
                return;
            }
            index = parseInt(args[1]);
            if(index < 0) {
                message.channel.send("Invalid index. Must be greater than 0")
                return;
            }
            if(isNaN(index)) {
                message.channel.send("Invalid index. Must be integer")
                return;
            }
            pageSize = parseInt(args[2])
            if(pageSize < 0) {
                message.channel.send("Invalid page size. Must be greater than 0")
                return;
            }
            if(isNaN(pageSize)) {
                message.channel.send("Invalid page size. Must be integer")
                return;
            }
        }
        console.log("Looking up stake list for " + address + " at index " + index);
        // Get account info for address
        showStakeList(message, address, index, pageSize)
        .catch(error => {
            let errorMsg = "Error while grabbing stake list for " + address + " index  " + index + " : " + error;
            message.channel.send(errorMsg);
            logger.error(errorMsg);
            console.error(errorMsg);
        });
	},
};

const getStakeList = async (address: string, index: number, pageSize : number) => {
    const stakeList: StakeListInfo = await viteClient.request('contract_getStakeList', address, index, pageSize);
    return stakeList;
};

const showStakeList = async (message, address: string, index : number, pageSize : number) => {

    let stakeList : StakeListInfo;
  
    stakeList = await getStakeList(address, index, pageSize).catch((res: RPCResponse) => {
        let errorMsg = "Error while grabbing stake list for " + address + " index " + index + " : " + res.error.message;
        logger.error(errorMsg);
        console.log(errorMsg);
        throw res.error;
    });

    try {
        let chatMessage = "";
        if(stakeList == null) {
            chatMessage = "No information for stake list for account " + address + " at index " + index;
        } else {
            // Log and display node information
            let amountTotalInVite = convertRawToVite(parseInt(stakeList.totalStakeAmount));
            chatMessage = "**Total Stake Amount:** " + amountTotalInVite.toLocaleString(undefined, {minimumFractionDigits: 2})  +
                "\n**Total Staking Records:** " + stakeList.totalStakeCount;
            // Send response to chat
            logger.info(chatMessage);
            message.channel.send(chatMessage);
            // Log and display peer information
            let i : number = 1;
            stakeList.stakeList.forEach(function(stake){
                let amountInVite = convertRawToVite(parseInt(stake.stakeAmount));
                let expireDate = epochToDate(stake.expirationTime);
                chatMessage = "**Stake Record #" + i++ + "**" +
                    "\n**Address:** " +  stake.stakeAddress +
                    "\n**Amount:** " + amountInVite.toLocaleString(undefined, {minimumFractionDigits: 2})  +
                    "\n**Expiration Height:** " + stake.expirationHeight +
                    "\n**Expiration Time:** " + expireDate +
                    "\n**Beneficiary:** " + stake.beneficiary +
                    "\n**Delegated:** " + stake.isDelegated +
                    "\n**Delegated Address:** " + stake.delegatedAddress +
                    "\n**Business ID:** " + stake.bid;
                // Send response to chat
                logger.info(chatMessage);
                message.channel.send(chatMessage);
            });
        }
    } catch(err) {
        console.error("Error displaying account info for " + address + " : " + err);
        console.error(err.stack);
    }

}
