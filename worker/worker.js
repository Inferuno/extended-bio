import { getSteamData } from "./steam.js";
import { getGitHubData } from "./github.js";


export default {
    async fetch(request, env, ctx) {
        const path = new URL(request.url).pathname;

        let json = null;
        if (path === "/github") {
            if (JSON.parse(await env.GITHUB_CACHE.get("github")) === null) {
                await env.GITHUB_CACHE.put("github", JSON.stringify(await getGitHubData(env)));
            }
            json = JSON.parse(await env.GITHUB_CACHE.get("github"));
        } else if (path === "/steam") {
            json = await getSteamData(env);
        }

        return new Response(JSON.stringify(json), {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
        });
    },
    async scheduled(controller, env, ctx) {
        const oldData = JSON.parse(await env.GITHUB_CACHE.get("github"));
        const twelveHours = 12 * 60 * 60 * 1000;

        if (oldData !== null && Date.now() - new Date(oldData.fetchedAt) < twelveHours) {
            return;
        }
        const gitHubData = await getGitHubData(env);
        await env.GITHUB_CACHE.put("github", JSON.stringify(gitHubData));
    },
}; 