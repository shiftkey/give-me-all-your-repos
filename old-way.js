const GitHubApi = require("github");
const Promise = require("bluebird");
const github = new GitHubApi({
  Promise: Promise
});

github.authenticate({
  type: "token",
  token: process.env.GITHUB_TOKEN
});

const orgsReposMap = new Map();

function enumerateRepositories() {
  return new Promise((resolve, reject) => {
    function appendToSet(err, res) {
      if (err) {
        reject(err);
        return;
      }

      for (const repo of res.data) {
        const login = repo.owner.login;

        // skip repository if owner is not an organization
        if (repo.owner.type === "User") {
          continue;
        }

        // skip repository if you don't have push permissions
        const permissions = repo.permissions;
        if (!permissions.push) {
          continue;
        }

        let existing = null;
        if (orgsReposMap.has(login)) {
          existing = orgsReposMap.get(login);
        } else {
          existing = [];
        }

        existing.push(repo);
        orgsReposMap.set(login, existing);
      }

      if (github.hasNextPage(res)) {
        github.getNextPage(res, function(err, res) {
          appendToSet(err, res);
        });
      } else {
        resolve();
      }
    }

    github.repos.getAll({ per_page: 100, visibility: "public" }, function(err, res) {
      appendToSet(err, res);
    });
  });
}

enumerateRepositories().then(function() {
  for (const key of orgsReposMap.keys()) {
    const repos = orgsReposMap.get(key);
    if (repos.length) {
      console.log(`Can push to ${repos.length} public repos on the ${key} org`);
      repos.forEach(function(repo) {
        console.log(` - ${repo.name}`);
      });
    }
  }
});
