# vite-plugin-circullar-dependency

Check circular dependency in vite project

> Suggest switching to https://github.com/threedayAAAAA/rollup-plugin-circular-dependency


## Install

`npm i vite-plugin-circullar-dependency -D`

## Use

```ts
import { defineConfig } from 'vite';
import circularDependency from 'vite-plugin-circullar-dependency';

export default defineConfig({
  circularDependency({
    exclude?: RegExp;
    include?: RegExp;
    failOnError?: boolean;
    allowAsyncCycles?: boolean;
    cwd?: string;
  })
})
```

## Inspired by

-  https://github.com/aackerman/circular-dependency-plugin
