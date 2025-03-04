# PNPM Workspace build for Mythica Sites

We use pnpm workspaces to manage npm package dependencies shared between our sites. https://pnpm.io/workspaces

In order to install dependencies:
1- run `pnpm install` from this root directory.
2- run `cd libs/houdini-ui && pnpm run build && cd ../..`
3- you can now run the sites with `pnpm run dev` from their respective directories

