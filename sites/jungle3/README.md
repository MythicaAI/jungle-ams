# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

## Usage of environment variables

External variables are exposed using a combination of Vite's [env and mode](https://vite.dev/guide/env-and-mode), the vite-plugin-runtime-env and environment variables from the containing environment.

There are three modes we expect the site to run in:

- local debug
- local containerized (via docker-compose, inv web-start)
- k8s containerized (via api/web-front and it's deployment)

In local debug the .env.debug file should be referenced

  `vite dev -m debug`

In containerized mode the environment variables are defined in the docker-compose file.

In K8s mode the environment variables are defined in the deployment.yaml


Here's the process:

1. Build container is built using vite and the content is placed in /dist/<site-name>
2. Init container is created using a --from=build which copies only the dist files 
3. At runtime the init container does an `envsubst` on the vite variables to allow the current environment to generate a working index.html for the site.


