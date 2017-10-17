const GitHubApi = require("github");
const Promise = require("bluebird");
const github = new GitHubApi({
  Promise: Promise
});

github.authenticate({
  type: "token",
  token: process.env.GITHUB_TOKEN
});

function enumerateOrgs() {
  return new Promise((resolve, reject) => {
    const orgs = [];

    function appendOrgs(err, res) {
      if (err) {
        reject(err);
        return;
      }

      for (const org of res.data) {
        orgs.push(org);
      }

      if (github.hasNextPage(res)) {
        github.getNextPage(res, function(err, res) {
          appendOrgs(err, res);
        });
      } else {
        resolve(orgs);
      }
    }

    github.users.getOrgs({ per_page: 100 }, function(err, res) {
      appendOrgs(err, res);
    });
  });
}

const orgsReposMap = new Map();

function enumerateRepositories(login) {
  return new Promise((resolve, reject) => {
    function appendToSet(login, err, res) {
      if (err) {
        reject(err);
        return;
      }

      let existing = null;
      if (orgsReposMap.has(login)) {
        existing = orgsReposMap.get(login);
      } else {
        existing = [];
      }

      for (const repo of res.data) {
        const permissions = repo.permissions;
        if (permissions.push) {
          existing.push(repo);
        }
      }

      orgsReposMap.set(login, existing);

      if (github.hasNextPage(res)) {
        github.getNextPage(res, function(err, res) {
          appendToSet(login, err, res);
        });
      } else {
        resolve();
      }
    }

    github.repos.getForOrg({ org: login, per_page: 100 }, function(err, res) {
      appendToSet(login, err, res);
    });
  });
}

enumerateOrgs()
  .then(function(orgs) {
    const promises = [];

    for (const org of orgs) {
      const orgPromise = enumerateRepositories(org.login);
      promises.push(orgPromise);
    }

    return Promise.all(promises);
  })
  .then(function() {
    for (const key of orgsReposMap.keys()) {
      const repos = orgsReposMap.get(key);
      if (repos.length) {
        console.log(`Can push to ${repos.length} public repos on the ${key} org`);
      }
    }
  });
