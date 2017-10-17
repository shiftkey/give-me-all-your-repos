# Give Me All Of Your (Public) Repositories

This is a quick demo for how to find all public repositories a user has push
permissions to, without going and using `/user/repos`.

To test this out, create a personal access token with the `org:read` and `public_repo` scopes, and then run this sample.

To test the old way, using `/user/repos`:

```sh
GITHUB_TOKEN=[your-token-here] npm run old-way
```

To test the new way, by enumerating organizations:

```sh
GITHUB_TOKEN=[your-token-here] npm run new-way
```

## How does this work?

The old way, using `/user/repos`, will run through a list of all repositories you have access to. This includes repositories you own, repositories you have access to as a collaborator, and repositories you have ownership of under an organization.

The new way uses `/user/orgs` and works back from there:

 - which organizations is the user a member of?
 - which public repositories belong to this organization?
 - gather up a list of all repositories in this organization which are `permissions.push: true`

