import { RPCResponse } from '@vite/vitejs/distSrc/utils/type';
import { NodeInfo } from '../viteTypes';
import { viteClient } from '../index';
import { getLogger } from '../logger';

const logger = getLogger();

module.exports = {
	name: 'peers',
    cooldown: 60000,     // Cooldown of 60s (1 min)
	description: 'Display list of peers for our node',
	execute(message, args) {     
        
        console.log(message.author.username + " called peers ");

        // Only people with Core and Dev roles can set the bot prefix
        const coreRole = message.guild.roles.cache.find(x => x.name === "Core");
        const devRole = message.guild.roles.cache.find(x => x.name === "Dev");

        // Check if roles are defined
        if(typeof coreRole === 'undefined' && typeof devRole === 'undefined') {
            let errorMsg : String = "Permission denied because Core and Dev roles are undefined";
            console.error(errorMsg);
            message.channel.send(errorMsg);
            return;
        }
        // This command spams, so only Core and/or Dev can run it
        if((typeof coreRole !== 'undefined' && ! message.member.roles.cache.has(coreRole.id))
        && (typeof devRole !== 'undefined' && ! message.member.roles.cache.has(devRole.id))) {
            let errorMsg : String = "Permission denied";
            console.error(errorMsg);
            message.channel.send(errorMsg);
            return;
        } 

        // Past checks, now actually do the command
        console.log(message.author.username + " has permission to list peers");
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
        throw res.error.message;
    });

    let chatMessage = "";
    if(nodeInfo == null) {
        chatMessage = "No information for node";
    } else {
        // Log and display peer information
        let i : number = 1;
        nodeInfo.peers.forEach(function(peer){
            chatMessage = "**Peer #" + i++ + "**" +
                "\n**Name:** " +  peer.name +
                "\n**Height:** " + peer.height +
                "\n**Address** " + peer.address +
                "\n**Time Created:** " + peer.createAt; 
             // Send response to chat
            message.channel.send(chatMessage);
        });
    }
}
