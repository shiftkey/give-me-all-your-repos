# Give Me All Of Your (Public) Repositories

This is a quick demo for how to find all public repositories a user has push
permissions to, without going and using `/user/repos`.

To test this out, create a personal access token with the `org:read` and `public_repo` scopes, and then run this sample using:

```sh
GITHUB_TOKEN=[your-token-here] node index.js
```

## How does this work?

Put simply, it goes through these steps:

 - which organizations is the user a member of?
 - which public repositories are associated with this organization?
 - gather up a list of all repositories in this organization which are `permissions.push: true`

