const Discord = require("discord.js")
const config = require('../../config.json')

let args = {}
function postArgs(interaction) {
    for (let key of interaction.options.data) {
        args[key.name] = key.value
    }
    return args
}
module.exports = {
    data: new Discord.SlashCommandBuilder()
    .setName(`searchid`)
    .setDescription(`Look for user id`)
	.addStringOption(option => 
        option.setName('number')
            .setDescription('enter discord user id')
            .setRequired(true)
    )
    ,
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true })
        postArgs(interaction)
        const embed = new  Discord.EmbedBuilder()
            .setTitle('User ID Search')
            .setColor('#00FFFF') //bright cyan
            .setDescription('Search a user id to see if it exists on this server')
        
        try {
            const member = await guild.members.fetch(args.number)

            embed.addFields(
                {
                    name: `Entry -> ${args.number}`, value: `${member}`
                }
            )
        } 
        catch (error) {
            // console.error('Error fetching user:'.red, error);
            embed.addFields({name: `Entry -> ${args.number}`, value: "Unknown User"})
        }
        await interaction.editReply({ embeds:[embed], ephemeral: true });
    }
}