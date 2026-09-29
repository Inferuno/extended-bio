import { getSteamData } from "./steam.js";
import { getGitHubData } from "./github.js";


export default {
    async fetch(request, env, ctx) {
        const path = new URL(request.url).pathname;

        let json = null;
        if (path === "/github") {
            json = await getGitHubData(env);
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
}; 