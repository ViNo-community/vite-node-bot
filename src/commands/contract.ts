
import { RPCResponse} from '@vite/vitejs/distSrc/utils/type';
import * as vite from "@vite/vitejs"
import { ContractInfo } from '../viteTypes';
import { viteClient } from '../index';
import { getLogger } from '../logger';

const logger = getLogger();

const CHUNK_SIZE = 500;

module.exports = {
	name: 'contract',
    aliases: ["c"],
	description: 'Display smart contract information for specified address',
	execute(message, args) {     
        // User can pass in optional SBP Name
        let prefix = message.client.botConfig.prefix; 
        let address = "";
        // User passes in address
        if(args.length != 1) {
            message.channel.send("Usage: " + prefix + "contract <address>");
            return;
        } else {
            address = args[0];
            if(vite.wallet.isValidAddress(address) == vite.wallet.AddressType.Illegal) {
                let errorMsg : string = "Invalid address";
                message.channel.send(errorMsg);
                logger.error(errorMsg);
                return;
            }
        }
        // Get contract info for address
        showContractInformation(message, address)
        .catch(error => {
            let errorMsg = "Error grabbing smart contract information at " + address + " : " + error;
            message.channel.send(errorMsg);
            logger.error(errorMsg);
            console.error(errorMsg);
        });
	},
};

const getContractInformation = async (address: string) => {
    const contractInfo: ContractInfo = await viteClient.request('contract_getContractInfo', address);
    return contractInfo;
};

const showContractInformation = async (message, address: string) => {

    let contractInfo: ContractInfo;

    // Get smart contract info on specified address
    contractInfo = await getContractInformation(address).catch((res: RPCResponse) => {
        let errorMsg = "Error grabbing smart contract information at " + address + " : " + res.error.message;
        logger.error(errorMsg);
        console.error(errorMsg);
        throw res.error.message;
    });

    let chatMessage = "";
    if(contractInfo == null) {
        chatMessage = "No smart contract information available for " + address;
        // Send response to chat
        logger.info(chatMessage);
        message.channel.send(chatMessage);
        return;
    }

    // Construct chat message
    chatMessage = "**Address:** " + address +
        "\n**GID:** " + contractInfo.GID +
        "\n**Random Degree:** " + contractInfo.randomDegree +
        "\n**Response Latency:** " + contractInfo.responseLatency +
        "\n**Quota Multiplier:** " + contractInfo.quotaMultiplier;
    // Send response to chat
    logger.info(chatMessage)
    message.channel.send(chatMessage);
    // Send code part of message
    chatMessage = "\n**Code:** " + contractInfo.code;
    // Message may be too large for DISCORD to handle, so split into CHUNK_SIZE sized 
    // chunks and send it to Discord one chunk at a time
    var chunks = chunkString(chatMessage, CHUNK_SIZE);
    for (const chunk of chunks) { // You can use `let` instead of `const` if you like
        // Send response to chat
        logger.info(chunk);
        message.channel.send(chunk);
    }
}

// Split str up into size sized chunks
function chunkString(str, size) {
    const numChunks = Math.ceil(str.length / size)
    const chunks = new Array(numChunks)
  
    for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
      chunks[i] = str.substr(o, size)
    }
  
    return chunks
  }
