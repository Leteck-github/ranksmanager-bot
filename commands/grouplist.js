const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const GROUPS_FILE = path.resolve('./ranksGroup.json');

// 🟢 METS ICI L’ID DU ROLE AUTORISÉ
const AUTHORIZED_ROLE_IDS = ["1379856356361633812"];

function readGroups() {
    if (!fs.existsSync(GROUPS_FILE)) return [];
    try {
        const raw = fs.readFileSync(GROUPS_FILE, 'utf-8').trim();
        if (!raw) return [];
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('grouplist')
        .setDescription('Affiche la liste des groupes, leurs rôles et rôles staff.'),

    async execute(interaction) {
        // Vérification : aucun rôle configuré
        if (!AUTHORIZED_ROLE_IDS.length) {
            const embed = new EmbedBuilder()
                .setColor(0xffcc00)
                .setTitle('Rôle non configuré')
                .setDescription('Aucun rôle autorisé n\'a été configuré pour cette commande.\nMerci à un administrateur de renseigner au moins un ID dans `AUTHORIZED_ROLE_IDS` dans le code.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Vérification des rôles autorisés
        const memberRoles = interaction.member.roles.cache;
        const isAuthorized = AUTHORIZED_ROLE_IDS.some(roleId => memberRoles.has(roleId));
        if (!isAuthorized) {
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('Accès refusé')
                .setDescription('Vous n\'avez pas la permission d\'utiliser cette commande.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const groups = readGroups();

        if (!groups.length) {
            const embed = new EmbedBuilder()
                .setColor(0xffcc00)
                .setDescription('Aucun groupe trouvé dans le fichier.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Affichage
        let desc = '';
        for (const group of groups) {
            const roles = (group.roles || []).map(rid => `<@&${rid}>`).join(', ') || 'Aucun';
            const staff = (group.StaffRoles || []).map(rid => `<@&${rid}>`).join(', ') || 'Aucun';
            desc += `**${group.name}**\n• Rôles : ${roles}\n• Rôles Staff : ${staff}\n\n`;
        }
        if (desc.length > 4096) desc = desc.slice(0, 4090) + '...';

        const embed = new EmbedBuilder()
            .setTitle('Liste des groupes')
            .setColor(0x5865f2)
            .setDescription(desc);

        return interaction.reply({ embeds: [embed], ephemeral: false });
    }
};
