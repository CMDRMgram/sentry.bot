const Discord = require("discord.js");
const { botIdent } = require('../../../functions');
module.exports = {
    data: new Discord.SlashCommandBuilder()
    .setName(`guardianweapons`)
    .setDescription(`Information on Guardian Weapons`),
    // .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    permissions:0,
    execute (interaction) {
        const returnEmbed = new Discord.EmbedBuilder()
        .setTitle('Guardian Weapons')
        .setColor('#FF7100')
        .setAuthor({name: botIdent().activeBot.botName,iconURL: botIdent().activeBot.icon})
        .setDescription(`Information on Guardian Weapons`)
        .addFields(
            {name: 'Gauss'                                 , value: 'Hitscan weapon that deals high armor piercing damage and kill hearts quickly. Used in class 1 and class 2 sizes', inline: false},
            {name: 'Modified Shard Cannon'                 , value: 'Space shotgun that deals high alpha damage to hull and shields, has a 5 round clip, has higher armor piercing. Primarily used in class 2 size, with class 1 being used for niche fits.', inline: false},
            {name: 'Modified Plasma Charger'               , value: 'Charge-up projectile weapon that deals high alpha damage to hull and shields, has a 20 round clip, charges up to do 17x damage over 2 seconds. Primarily used in class 2 size, with class 1 being used for niche fits.', inline: false},  
            {name: '__Purchased with Credits__'            , value: 'Guardian Plasma Charger, Guardian Shard Cannon, Guardian Gauss Cannon', inline: false},
            {name: 'Available at'                          , value: 'Any Guardian tech broker', inline: false},
            {name: 'Blueprint Unlocks'                     , value: 'Guardian Weapons require **Guardian Weapon Blueprints** to unlock, see: https://wiki.antixenoinitiative.com/en/guardianunlocks', inline: false},
            {name: '__Purchase per Module with Materials__', value: 'Modified Plasma Charger, Modified ShardCannon, Modified Gauss Cannon', inline: false},
            {name: 'Available at'                          , value: 'Prospect\'s Deep in the Mbooni system', inline: false},
            {name: 'Blueprint Materials'                   , value: 'Modified Guardian weapons require **Guardian Weapon Blueprints** with **each** purchase', inline: false},     
        )
        interaction.reply({embeds: [returnEmbed]})
    }
}
