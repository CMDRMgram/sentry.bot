const Discord = require("discord.js");
module.exports = 
{
    data: new Discord.SlashCommandBuilder()
        .setName(`alex`)
        .setDescription(`Do you play any games online with friends?`),
    // .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    permissions:0,
    async execute(interaction) {
        interaction.reply({
            content: `<@433341354970710030> Do you play any games online with friends?`
        })
    }
}