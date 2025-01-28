const Discord = require("discord.js");
const { botIdent } = require('../../../functions');
module.exports = {
    data: new Discord.SlashCommandBuilder()
    .setName(`preengineered`)
    .setDescription(`Where to purchase pre-engineered weapons and modules`),
    // .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    permissions:0,
    execute (interaction) {
        const returnEmbed = new Discord.EmbedBuilder()
        .setTitle('Pre-Engineered Modules')
        .setURL('https://wiki.antixenoinitiative.com/en/weapons')
        .setAuthor({name: botIdent().activeBot.botName,iconURL: botIdent().activeBot.icon})
        .setDescription(`It should be noted that **all pre-engineered modules require materials for each purchase**. Unlock costs for these can be found on Inara's crafting section.`)
        .addFields(
            {name: "Modified Guardian Weapons, Azimuth EAXMC", value: "Available at **Prospect's Deep**, a planetary port found in the **Mbooni** system. You will need a permit to access Mbooni, which can be earned through raising standings to Allied with Azimuth Biotech. You may need to visit the `Glorious Prospect` in `LHS 1163`."},
            {name: "Sirius AX Missile Rack, Sirius Heat Sinks", value: "Can be found at Sirius Tech Brokers (see image below)."},
            {name: "Azimuth EAXMC", value: "Can only be found at Rescue Ships (`Rescue Ship Hutner` in `Luyten's Star` and `Rescue Ship Cornwallis` in `V886 Centauri`)."},
            {name: "Frame Shift Drive (SCO)", value: "Can be found at Human Tech Brokers (see image below)."},   
        )
        .setImage('https://wiki.antixenoinitiative.com/img/techbrokers.png')
        interaction.reply({embeds: [returnEmbed.setTimestamp()]})
    }
}
