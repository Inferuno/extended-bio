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

    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
    const summaryQuery = `
query {
  user(login: "Inferuno") {
    contributionsCollection(from: "${monthStart}") {
      totalCommitContributions
    }
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
      nodes {
        name
        languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
          edges {
            size
            node { name color }
          }
        }
      }
    }
  }
}
`;

    const summaryResponse = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
            "User-Agent": "extended-bio",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: summaryQuery })
    });

    const summaryData = await summaryResponse.json();

    const allLanguages = summaryData.data.user.repositories.nodes
        .map(eachRepo => eachRepo.languages.edges)
        .flat();

    const languageTotals = {};

    allLanguages.forEach(entry => {
        const name = entry.node.name;

        if (languageTotals[name] === undefined) {
            languageTotals[name] = { size: 0, color: entry.node.color };
        }

        languageTotals[name].size += entry.size;
    });

    let totalSize = 0;

    Object.values(languageTotals).forEach(lang => totalSize += lang.size);

    const sortedNames = Object.keys(languageTotals)
        .sort((nameA, nameB) => languageTotals[nameB].size - languageTotals[nameA].size);

    const topNames = sortedNames.slice(0, 3);
    const otherNames = sortedNames.slice(3);

    const language = {}
    topNames.forEach(name => {
        console.log(name)
        language[name] = {
            percentage: Math.round(languageTotals[name].size / totalSize * 100),
            color: languageTotals[name].color
        }
    })

    if (otherNames.length > 0) {
        let otherSize = 0;
        otherNames.forEach(name => otherSize += languageTotals[name].size)

        language.Other = {
            percentage: Math.round(otherSize / totalSize * 100),
            color: "#8b949e"
        }
    }


    const finishedJson = {
        fetchedAt: new Date().toISOString(),
        "commits": [...perCommitChanged],
        "summary": {
            "commitsThisMonth": summaryData.data.user.contributionsCollection.totalCommitContributions,
            "language": { ...language }
        }
    }

    return finishedJson
}