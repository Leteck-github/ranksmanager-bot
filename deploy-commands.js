const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Assure-toi d'avoir un .env avec DISCORD_TOKEN et DISCORD_CLIENT_ID

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command.data) {
        commands.push(command.data.toJSON());
    }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log(`Déploiement de ${commands.length} commande(s) slash (globales)...`);

        await rest.put(
            Routes.applicationCommands(process.env.APP_ID),
            { body: commands }
        );

        console.log('✅ Commandes déployées ! (globales)');
    } catch (error) {
        console.error(error);
    }
})();
