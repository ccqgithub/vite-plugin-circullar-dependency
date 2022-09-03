import path from "path";
const circularDependencyPlugin = (options = {}) => {
  const {
    exclude = new RegExp("$^"),
    include = new RegExp(".*"),
    failOnError = false,
    allowAsyncCycles = false,
    cwd = process.cwd()
  } = options;
  const modules = [];
  const modulesObj = {};
  const isCyclic = (initModule, curModule, seenModules, list) => {
    const id = path.relative(cwd, curModule.id);
    seenModules[curModule.id] = true;
    const deps = [...curModule.importedIds];
    if (!allowAsyncCycles) {
      deps.push(...curModule.dynamicallyImportedIds);
    }
    for (const depId of deps) {
      const dep = modulesObj[depId];
      if (dep.id === curModule.id)
        continue;
      if (dep.id in seenModules) {
        if (dep.id !== initModule.id) {
          continue;
        }
        return [...list, id, path.relative(cwd, dep.id)];
      }
      return isCyclic(initModule, modulesObj[depId], seenModules, [
        ...list,
        path.relative(cwd, curModule.id)
      ]);
    }
    return [];
  };
  const plugin = {
    name: "vite-plugin-circular-dependency",
    moduleParsed: (moduleInfo) => {
      modules.push(moduleInfo);
      modulesObj[moduleInfo.id] = moduleInfo;
    },
    generateBundle: () => {
      for (const module of modules) {
        const id = path.relative(cwd, module.id);
        const shouldSkip = exclude.test(id) || !include.test(id);
        if (shouldSkip) {
          continue;
        }
        const list = isCyclic(module, module, {}, []);
        if (list.length) {
          const messate = `
\x1B[31mHave circular dependency: ${list.join(
            " -> "
          )} \x1B[39m`;
          if (failOnError) {
            throw new Error(messate);
          } else {
            console.error(messate);
          }
          break;
        }
      }
    }
  };
  return plugin;
};
export {
  circularDependencyPlugin,
  circularDependencyPlugin as default
};
