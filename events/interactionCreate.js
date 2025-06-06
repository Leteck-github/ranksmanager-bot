module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        try {
            // Slash commands (ex: /help, /creategroup)
            if (interaction.isChatInputCommand()) {
                const command = client.commands.get(interaction.commandName);
                if (!command) return;
                try {
                    await command.execute(interaction, client);
                } catch (error) {
                    console.error(error);
                    if (!interaction.replied && !interaction.deferred) {
                        try {
                            await interaction.reply({
                                content: '❌ Erreur lors de l\'exécution de la commande.',
                                ephemeral: true
                            });
                        } catch (err) {}
                    }
                }
                return;
            }

            // Composants (boutons, menus, etc.) : ici, gestion "avancée"
            if (
                interaction.isButton() ||
                interaction.isStringSelectMenu() ||
                interaction.isUserSelectMenu() ||
                interaction.isRoleSelectMenu() ||
                interaction.isMentionableSelectMenu() ||
                interaction.isChannelSelectMenu()
            ) {
                // Si la commande utilise executeComponent (par ex: rankConfig)
                const [cmdName] = interaction.customId.split('_');
                const command = client.commands.get(cmdName.toLowerCase());
                if (command && typeof command.executeComponent === "function") {
                    try {
                        await command.executeComponent(interaction, client);
                    } catch (err) {
                        console.error(err);
                        if (!interaction.replied && !interaction.deferred) {
                            try {
                                await interaction.reply({
                                    content: '❌ Erreur lors de l\'interaction.',
                                    ephemeral: true
                                });
                            } catch {}
                        }
                    }
                } else {
                    // Pour toutes les autres interactions "non gérées", on ne fait rien ici
                    // Les collectors dans la commande (ex: creategroup) prennent la main
                }
                return;
            }
        } catch (err) {
            // Crash catch-all (évite de faire planter le bot sur une interaction "Unknown" ou autre)
            if (err.code && String(err.code).includes('10062')) return; // Unknown interaction
            console.error('Crash interactionCreate!', err);
        }
    }
};
