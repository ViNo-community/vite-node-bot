
import { RPCResponse} from '@vite/vitejs/distSrc/utils/type';
import { ContractInfo } from '../viteTypes';
import { viteClient } from '../index';
import { getLogger } from '../logger';

const logger = getLogger();

module.exports = {
	name: 'contract',
	description: 'Display smart contract information for specified address',
	execute(message, args) {     
        // User can pass in optional SBP Name
        let prefix = message.client.botConfig.prefix; 
        let address = "";
        // User passes in address
        if(!args.length) {
            message.channel.send("Usage: " + prefix + "contract <address>");
            return;
        } else {
            address = args[0];
        }
        // Get contract info for address
        showContractInformation(message, address)
        .catch(error => {
            console.error("Error while grabbing smart contract information: " + error.message);
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
        console.log(`Could not retrieve smart contract info for ${address}}`, res);
        throw res.error;
    });

    let chatMessage = "";
    if(contractInfo == null) {
        chatMessage = "No smart contract information available for " + address;
    } else {
        chatMessage = "**Address:** " + address +
            "\n**Code:** " + contractInfo.code +
            "\n**GID:** " + contractInfo.GID +
            "\n**Random Degree:** " + contractInfo.randomDegree +
            "\n**Response Latency:** " + contractInfo.responseLatency +
            "\n**Quota Multiplier:** " + contractInfo.quotaMultiplier
    }
    // Send response to chat
    message.channel.send(chatMessage);

}
