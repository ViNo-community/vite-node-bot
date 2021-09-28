import { RPCResponse } from '@vite/vitejs/distSrc/utils/type';
import { NodeInfo } from '../viteTypes';
import { viteClient } from '../index';
import { getLogger } from '../logger';

const logger = getLogger();

module.exports = {
	name: 'node',
	description: 'Display information about current node',
	execute(message, args) {     
        console.log("Looking up info for node")
        // Get node info
        showNodeInformation(message)
        .catch(error => {
            let errorMsg = "Error while grabbing node summary : " + error;
            message.channel.send(errorMsg);
            logger.error(errorMsg);
            console.error(errorMsg);
        });

	},
};

const getNodeInformation = async () => {
    const nodeInfo: NodeInfo = await viteClient.request('net_nodeInfo');
    return nodeInfo;
};

const showNodeInformation = async (message) => {

    let nodeInfo: NodeInfo;

    // Get node info
    nodeInfo = await getNodeInformation().catch((res: RPCResponse) => {
        let errorMsg = "Could not retrieve node info : " + res.error.message;
        logger.error(errorMsg);
        console.log(errorMsg);
        throw res.error;
    });

    let chatMessage = "";
    if(nodeInfo == null) {
        chatMessage = "No information for node";
    } else {
        // Log and display node information
        chatMessage = "**Name:** " + nodeInfo.name +
            "\n**ID:** " + nodeInfo.id +
            "\n**Net ID** " + nodeInfo.netId +
            "\n**Peer Count:** " + nodeInfo.peerCount 
        // Send response to chat
        logger.info(chatMessage);
        message.channel.send(chatMessage);
        // Log and display peer information
        let i : number = 1;
        nodeInfo.peers.forEach(function(peer){
            chatMessage = "**Peer #" + i++ + "**" +
                "\n**Name:** " +  peer.name +
                "\n**Height:** " + peer.height +
                "\n**Address** " + peer.address +
                "\n**Time Created:** " + peer.createAt; 
             // Send response to chat
            logger.info(chatMessage);
            message.channel.send(chatMessage);
        });
    }
}
