const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche l\'aide des commandes du bot.')
        .addStringOption(option =>
            option
                .setName('commande')
                .setDescription('Le nom de la commande pour obtenir de l\'aide.')
                .setRequired(false)
        ),
    usage: '/help [commande]',
    permissions: 'Aucune permission requise',

    async execute(interaction, client) {
        const commandName = interaction.options.getString('commande');

        const UnknownCommand = new EmbedBuilder()
            .setColor("#FF0000")
            .setDescription('`❌` Commande inconnue ou non trouvée.');

        // Si l'utilisateur a demandé de l'aide sur une commande spécifique
        if (commandName) {
            const command = client.commands.get(commandName);
            if (!command) {
                return interaction.reply({
                    embeds: [UnknownCommand],
                    ephemeral: true
                });
            }
            const embed = new EmbedBuilder()
                .setDescription(`# \`/${commandName}\`\n- **Description :** ${command.data.description}\n- **Utilisation :** **\`${command.usage || `/${commandName}`}\`**\n- **Permissions :** ${command.permissions}`)
                .setColor("#03e3fc")
                .setThumbnail("https://i.postimg.cc/K86SSL8j/b51a3959-0a27-4f8f-aed8-11950bdccf7c.png")
                .setFooter({ text: `🌊 BeachBots by @indeciss`, iconURL: `https://i.postimg.cc/K86SSL8j/b51a3959-0a27-4f8f-aed8-11950bdccf7c.png` });
            if (command.help) {
                embed.addFields({ name: "Détails", value: command.help });
            }
            return interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }

        // Sinon on liste toutes les commandes du bot
        let desc = '';
        client.commands.forEach(cmd => {
            desc += `> **\`/${cmd.data.name}\`** - ${cmd.data.description}\n`;
        });

        const embed = new EmbedBuilder()
            .setTitle('Liste des commandes disponibles')
            .setDescription(desc)
            .setColor("#03e3fc")
            .setThumbnail("https://i.postimg.cc/K86SSL8j/b51a3959-0a27-4f8f-aed8-11950bdccf7c.png")
            .setFooter({ text: `🌊 BeachBots by @indeciss`, iconURL: `https://i.postimg.cc/K86SSL8j/b51a3959-0a27-4f8f-aed8-11950bdccf7c.png` });

        return interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
};
