const GitHubApi = require("github");
const Promise = require("bluebird");
const github = new GitHubApi({
  Promise: Promise
});

github.authenticate({
  type: "token",
  token: process.env.GITHUB_TOKEN
});

function traceScopes(res) {
  const meta = res.meta;
  console.log(`headers: ${JSON.stringify(meta)}`);
  const scopes = meta["x-oauth-scopes"];
  if (scopes) {
    console.log(`using scopes: ${scopes}`);
  }
}

module.exports = { github, traceScopes };
