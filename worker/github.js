export async function getGitHubData(env) {
    const searchResponse = await fetch("https://api.github.com/search/commits?q=author:Inferuno&sort=author-date&order=desc&per_page=10", {
        headers: {
            "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
            "User-Agent": "extended-bio"
        }
    });
    const searchData = await searchResponse.json();

    const realCommits = searchData.items.filter(commit => commit.parents.length === 1);
    const latestCommits = realCommits
        .slice(0, 4);
    const commits = latestCommits.map(item => ({ repo: item.repository.name, commitTitle: item.commit.message.split("\n")[0], commitTime: item.commit.author.date, commitId: item.sha }));

    async function getCommitStats(commit) {
        const lineCountResponse = await fetch(`https://api.github.com/repos/Inferuno/${commit.repo}/commits/${commit.commitId}`, {
            headers: {
                "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
                "User-Agent": "extended-bio"
            }
        });
        const lineCountData = await lineCountResponse.json();

        return {
            ...commit,
            linesAdded: lineCountData.stats.additions,
            linesRemoved: lineCountData.stats.deletions
        };
    }

    const perCommitChanged = await Promise.all(commits.map(commit => getCommitStats(commit)))
    return {
        fetchedAt: new Date().toISOString(),
        "commits": [...perCommitChanged],
        "summary": {
            "commitsThisMonth": 23,
            "language": {
                "js": {
                    "percentage": 49,
                    "color": "#f1e05a"
                },
                "css": {
                    "percentage": 42,
                    "color": "#663399"
                },
                "html": {
                    "percentage": 9,
                    "color": "#e34c26"
                }
            }
        }
    }
}