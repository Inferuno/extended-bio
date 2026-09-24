export default {
    async fetch(request, env, ctx) {
        const gamesResponse = await fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${env.STEAM_KEY}&steamid=76561199814835994&include_appinfo=1&include_played_free_games=1`);
        const gamesData = await gamesResponse.json();

        const games = gamesData.response.games;
        const topGames = games
            .sort((gameA, gameB) => gameB.playtime_forever - gameA.playtime_forever)
            .slice(0, 10);

        async function getRarestAchievements(appid) {
            const achievementsResponse = await fetch(`https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${env.STEAM_KEY}&steamid=76561199814835994&appid=${appid}&l=english`);
            const achievementsData = await achievementsResponse.json();

            const unlockedAll = achievementsData.playerstats.achievements;
            if (unlockedAll === undefined) return [];
            const unlocked = unlockedAll
                .filter(achievement => achievement.achieved);

            const achievementRarityResponse = await fetch(`https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/?gameid=${appid}`);
            const achievementRarityData = await achievementRarityResponse.json();

            const achievementIconResponse = await fetch(`https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${env.STEAM_KEY}&appid=${appid}`);
            const achievementIconData = await achievementIconResponse.json();

            const achievementRarities = achievementRarityData.achievementpercentages.achievements;

            let achievementIcons = [];
            const gameSchema = achievementIconData.game;
            if (gameSchema !== undefined
                && gameSchema.availableGameStats !== undefined
                && gameSchema.availableGameStats.achievements !== undefined) {
                achievementIcons = gameSchema.availableGameStats.achievements;
            }

            const unlockedWithRarity = unlocked.map(achievement => {
                const rarityEntry = achievementRarities.find(entry => entry.name === achievement.apiname);
                return { ...achievement, rarity: Number(rarityEntry.percent) };
            });

            const rarestWithIcon = unlockedWithRarity.map(achievement => {
                const iconEntry = achievementIcons.find(entry => entry.name === achievement.apiname);
                let imgUrl = null;
                if (iconEntry !== undefined) imgUrl = iconEntry.icon;
                return { ...achievement, imgUrl: imgUrl };
            });

            const rarestUnlocked = rarestWithIcon
                .sort((achievementA, achievementB) => achievementA.rarity - achievementB.rarity)
                .slice(0, 6);

            return rarestUnlocked;
        }

        const perGameAch = await Promise.all(topGames.map(game => getRarestAchievements(game.appid)));
        const rarestUnlockedAchievements = perGameAch.flat();
        const sortedRarestUnlockedAch = rarestUnlockedAchievements
            .sort((achievementA, achievementB) => achievementA.rarity - achievementB.rarity)
            .slice(0, 6);

        const trimmedAchievements = sortedRarestUnlockedAch.map(achievement => ({
            achievements: {
                name: achievement.name,
                rarity: achievement.rarity,
                imageUrl: achievement.imgUrl
            }
        }));

        return new Response(JSON.stringify(trimmedAchievements), {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
        });
    },
}; 