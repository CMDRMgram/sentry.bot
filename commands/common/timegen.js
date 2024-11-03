const Discord = require("discord.js");
const { eventTimeValidate } = require('../../functions')

const config = require('../../config.json')

let date = new Date(Date.now() + 45000)
let diff = Math.round((new Date() - date) / 1000)
var rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })


const timeGen = {
    default: { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false },
    shortTime: { hour: '2-digit', minute: '2-digit', hour12: false },
    longTime: { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false },
    shortDate: { month: '2-digit', day: '2-digit', year: 'numeric' },
    longDate: { month: 'numeric', day: '2-digit', year: 'numeric' },
    shotDateTime: { month: 'numeric', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false },
    longDateTime: { weekday: 'short', month: 'numeric', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false },
    relativeTime: rtf.format(-diff, 'second')
}
module.exports = {
    data: new Discord.SlashCommandBuilder()
    .setName(`timegen`)
    .setDescription(`Create a discord timestamp`)
	.addStringOption(option => 
        option.setName('type')
            .setDescription('Select the timestamp type')
            .setRequired(true)
            .addChoices(
                {name: `Default: ${date.toLocaleString('en-US', { timeZone: 'UTC', ...timeGen.default })}`, value: 'a'},
                {name: `Relative Time: ${timeGen.relativeTime}`, value: 'R'},
                {name: `Short Time: ${date.toLocaleString('en-US', { timeZone: 'UTC', ...timeGen.shortTime })}`, value: 't'},
                {name: `Long Time: ${date.toLocaleString('en-US', { timeZone: 'UTC', ...timeGen.longTime })}`, value: 'T'},
                {name: `Short Date: ${date.toLocaleString('en-US', { timeZone: 'UTC', ...timeGen.shortDate })}`, value: 'd'},
                {name: `Long Date: ${date.toLocaleString('en-US', { timeZone: 'UTC', ...timeGen.longDate })}`, value: 'D'},
                {name: `Short Date/Time: ${date.toLocaleString('en-US', { timeZone: 'UTC', ...timeGen.shotDateTime })}`, value: 'f'},
                {name: `Long Date/Time: ${date.toLocaleString('en-US', { timeZone: 'UTC', ...timeGen.longDateTime })}`, value: 'F'},
            )
        )
    .addNumberOption(option => 
        option.setName('timezone')
            .setDescription('Timezone offset: Example: 0,-5,+2. Check google if you dont know.')
            .setRequired(true)
    )
    .addStringOption(option => 
        option.setName('datetime')
            .setDescription('Enter the date-time in your local time in this format only: 15/Jan 1530')
            .setRequired(true)
    )
    ,
    async execute(interaction) {
        const ephem = process.env.MODE == "PROD" ? true : false
        await interaction.deferReply({ ephemeral: ephem })
        let inputs = interaction.options._hoistedOptions
        let timeFormat = inputs.find(i => i.name === 'type').value
        let timeValue = inputs.find(i => i.name === 'datetime').value
        function capitalizeFirstLetter(input) {
            const parts = input.split(' ')
            if (parts[0].match(/^[a-zA-Z]+$/) || parts[0].match(/^\d+\/[a-zA-Z]+$/)) {
                const dayMonth = parts[0].split('/')
                dayMonth[1] = dayMonth[1].charAt(0).toUpperCase() + dayMonth[1].slice(1)
                parts[0] = dayMonth.join('/')
            }
        
            // Join the parts back into a string
            return parts.join(' ')
        }
        timeValue = capitalizeFirstLetter(timeValue)
        let timeZone = inputs.find(i => i.name === 'timezone').value
        const timestamp = eventTimeValidate(timeValue,timeZone,interaction)
        const time = timeFormat == 'a' ? `<t:${timestamp}>` : `<t:${timestamp}:${timeFormat}>`
        const time_unformatted = timeFormat == 'a' ? '```<t:' + timestamp + '>```' : '```<t:' + timestamp + ':' + timeFormat + '>```';
        const embed = new  Discord.EmbedBuilder()
            .setTitle('Custom Time')
            .setColor('#00FFFF') //bright cyan
            .setDescription('Created a discord timestamp from your chosen local time.')
            .addFields(
                {name: 'Your local time input:', value: "```"+timeValue+"```", inline: true},
                {name: 'Your local time visual', value: time, inline: true},
                {name: 'Code to paste somewhere', value: time_unformatted, inline: false},
            )
        // await interaction.guild.channels.cache.find(c => c.id === interaction.channelId).send(`${time}`)
        await interaction.editReply({ content: `Action Complete`, embeds:[embed], ephemeral: true });
    }
}