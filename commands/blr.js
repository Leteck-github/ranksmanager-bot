const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const BLR_FILE = path.resolve('./blr.json');
const OWNER_FILE = path.resolve('./config.json');

// 🟢 METS ICI L’ID DU ROLE AUTORISÉ
const AUTHORIZED_ROLE_ID = ''; // <= Exemple : '123456789012345678'

function readBLR() {
    if (!fs.existsSync(BLR_FILE)) return [];
    try {
        const raw = fs.readFileSync(BLR_FILE, 'utf-8').trim();
        if (!raw) return [];
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}
function saveBLR(list) {
    fs.writeFileSync(BLR_FILE, JSON.stringify(list, null, 2));
}
function readOwner() {
    if (!fs.existsSync(OWNER_FILE)) return null;
    try {
        const raw = fs.readFileSync(OWNER_FILE, 'utf-8').trim();
        if (!raw) return null;
        const data = JSON.parse(raw);
        return data.owner;
    } catch {
        return null;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blr')
        .setDescription('Gérer la blacklist rank (BLR)')
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Ajouter un membre à la BLR')
                .addUserOption(opt =>
                    opt.setName('utilisateur')
                        .setDescription('Utilisateur à blacklister')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName('remove')
                .setDescription('Retirer un membre de la BLR')
                .addUserOption(opt =>
                    opt.setName('utilisateur')
                        .setDescription('Utilisateur à retirer de la blacklist')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('Afficher la liste BLR')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        // ----- SECURITÉ ROLE -----
        if (!AUTHORIZED_ROLE_ID) {
            const embed = new EmbedBuilder()
                .setColor(0xffcc00)
                .setTitle('Rôle non configuré')
                .setDescription("Aucun rôle autorisé n'a été configuré pour cette commande. Merci de le configurer dans le code **`blr.js` (`Ligne 12`**).");
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        if (!interaction.member.roles.cache.has(AUTHORIZED_ROLE_ID)) {
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('Accès refusé')
                .setDescription("Seul le rôle autorisé peut utiliser cette commande.");
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // ----- LOGIQUE DE LA COMMANDE -----
        const sub = interaction.options.getSubcommand();
        let blr = readBLR();
        const ownerId = readOwner();
        const botId = interaction.client.user.id;

        if (sub === 'add') {
            const user = interaction.options.getUser('utilisateur');
            if (user.id === botId) {
                const embed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setDescription("``❌`` Le bot ne peut pas être ajouté à la BLR.");
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
            if (ownerId && user.id === ownerId) {
                const embed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setDescription("``❌`` L'owner ne peut pas être ajouté à la BLR.");
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
            if (blr.includes(user.id)) {
                const embed = new EmbedBuilder()
                    .setColor(0xffcc00)
                    .setDescription(`\`❌\` <@${user.id}> est déjà dans la BLR.`);
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
            blr.push(user.id);
            saveBLR(blr);
            const embed = new EmbedBuilder()
                .setColor(0x3cc249)
                .setDescription(`\`✅\` <@${user.id}> ajouté à la BLR.`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (sub === 'remove') {
            const user = interaction.options.getUser('utilisateur');
            if (!blr.includes(user.id)) {
                const embed = new EmbedBuilder()
                    .setColor(0xffcc00)
                    .setDescription(`\`❌\` <@${user.id}> n'est pas dans la BLR.`);
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
            blr = blr.filter(id => id !== user.id);
            saveBLR(blr);
            const embed = new EmbedBuilder()
                .setColor(0x3cc249)
                .setDescription(`\`✅\` <@${user.id}> retiré de la BLR.`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (sub === 'list') {
            const filtered = blr.filter(id => id !== botId && id !== ownerId);
            if (!filtered.length) {
                const embed = new EmbedBuilder()
                    .setColor(0x5865f2)
                    .setDescription("Aucun membre dans la BLR.");
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
            const embed = new EmbedBuilder()
                .setTitle('Liste BLR')
                .setDescription(filtered.map(id => `- <@${id}> - \`${id}\``).join('\n'))
                .setColor(0xff0000);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
