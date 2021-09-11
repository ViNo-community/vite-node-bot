import { RPCResponse } from '@vite/vitejs/distSrc/utils/type';
import { SBPInfo, rawToVite } from '../viteTypes';
import { epochToDate } from "../common";
import { viteClient } from '../index';

// Grab data from .env
require('dotenv').config();

// Grab info from .env
const SBP_NAME = process.env.SBP_NAME || 'ViNo_Community_Node';

module.exports = {
	name: 'sbp',
	description: 'Display information about SBP',
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
        console.log("Looking up info for SBP: " + SBPName);
        // Get reward info for SBP
        showSBPInformation(message, SBPName)
        .catch(error => {
            console.error("Error while grabbing SBP rewards summary :" + error.message);
        });


	},
};

const getSBPInformation= async (SBP: string) => {
    const SBPInfo: SBPInfo = await viteClient.request('contract_getSBP', SBP);
    return SBPInfo;
};

const showSBPInformation = async (message, SBP: string) => {

    let SBPInfo: SBPInfo;

    // Get rewards pending info for specified SBP
    SBPInfo = await getSBPInformation(SBP).catch((res: RPCResponse) => {
        console.log(`Could not retrieve info for ${SBP} `, res);
        throw res.error;
    });

    let chatMessage = "";
    if(SBPInfo == null) {
        chatMessage = "No information for SBP " + SBP;
    } else {
        let exDate = epochToDate(SBPInfo.expirationTime);
        let revDate = SBPInfo.revokeTime == "0" ? "0" : epochToDate(SBPInfo.revokeTime);
        chatMessage = "**Name:** " + SBPInfo.name +
            "\n**Block Producing Address:** " + SBPInfo.blockProducingAddress +
            "\n**Stake Address:** " + SBPInfo.stakeAddress +
            "\n**Stake Amount:** " +  rawToVite(SBPInfo.stakeAmount).toLocaleString(undefined, {minimumFractionDigits: 2}) +
            "\n**Expiration Height:** " + SBPInfo.expirationHeight +
            "\n**Expiration Time:** " + exDate +
            "\n**Revoke Time:** " + revDate;

    }
    // Send response to chat
    message.channel.send(chatMessage);

}
