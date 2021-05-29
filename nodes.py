import discord
from discord.ext import commands
from common import Common

class NodesCog(commands.Cog, name="Nodes"):

    def __init__(self, bot):
        self.bot = bot

    @commands.command(name='address', aliases=['addr','node_address','nodeaddress'], help="Displays node address")
    async def address(self,ctx):
        value = await Common.get_value(ctx,'nanoNodeAccount')
        response = f"Node address is {value}"
        await ctx.send(response)

    @commands.command(name='version', aliases=['ver'], help="Displays node version")
    async def version(self,ctx):
        value = await Common.get_value(ctx,'version')
        response = f"Node version is {value}"
        await ctx.send(response)

    @commands.command(name='num_peers', aliases=['numpeers','peers'], help="Displays number of peers")
    async def num_peers(self,ctx):
        value = await Common.get_value(ctx,'numPeers')
        response = f"{value} peers"
        await ctx.send(response)

    @commands.command(name='uptime', aliases=['up','nodeuptime','node_uptime'], help="Displays node uptime")
    async def uptime(self,ctx):
        value = await Common.get_value(ctx,'nodeUptimeStartup')
        time = int(value)
        # Break down into days, hours, minutes, seconds
        day = time // (24 * 3600)
        time = time % (24 * 3600)
        hours = time // 3600
        time %= 3600
        minutes = time // 60
        time %= 60
        seconds = time
        response = f"Node uptime is {day} days, {hours} hours, {minutes} minutes, and {seconds} seconds"
        await ctx.send(response)

def setup(bot):
    bot.add_cog(NodesCog(bot))