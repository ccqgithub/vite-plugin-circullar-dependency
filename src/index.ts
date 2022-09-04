import path from 'path';
import { Plugin } from 'vite';
import { ModuleInfo } from 'rollup';

export const circularDependencyPlugin = (
  options: {
    exclude?: RegExp;
    include?: RegExp;
    failOnError?: boolean;
    allowAsyncCycles?: boolean;
    cwd?: string;
  } = {}
) => {
  const {
    exclude = new RegExp('$^'),
    include = new RegExp('.*'),
    failOnError = false,
    allowAsyncCycles = false,
    cwd = process.cwd()
  } = options;
  const modules: ModuleInfo[] = [];
  const modulesObj: Record<string, ModuleInfo> = {};

  const isCyclic = (
    initModule: ModuleInfo,
    curModule: ModuleInfo,
    seenModules: Record<string, boolean>,
    list: string[]
  ): string[] => {
    const id = path.relative(cwd, curModule.id);

    // mark read
    seenModules[curModule.id] = true;

    // deps
    const deps = [...curModule.importedIds];
    if (!allowAsyncCycles) {
      deps.push(...curModule.dynamicallyImportedIds);
    }

    for (const depId of deps) {
      const dep = modulesObj[depId];

      // self dependency
      if (dep.id === curModule.id) continue;

      // circular
      if (dep.id in seenModules) {
        // oter id circular
        if (dep.id !== initModule.id) {
          return [];
        }

        return [...list, id, path.relative(cwd, dep.id)];
      }

      const arr = isCyclic(initModule, modulesObj[depId], seenModules, [
        ...list,
        path.relative(cwd, curModule.id)
      ]);

      if (arr.length) return arr;
    }

    return [];
  };

  const plugin: Plugin = {
    name: 'vite-plugin-circular-dependency',
    moduleParsed: (moduleInfo) => {
      modules.push(moduleInfo);
      modulesObj[moduleInfo.id] = moduleInfo;
    },
    generateBundle: () => {
      for (const module of modules) {
        const id = path.relative(cwd, module.id);

        const shouldSkip = exclude.test(id) || !include.test(id);

        // skip the module if it matches the exclude pattern
        if (shouldSkip) {
          continue;
        }

        const list = isCyclic(module, module, {}, []);

        // have circular dependency
        if (list.length) {
          const messate = `\n\x1B[31mHave circular dependency: ${list.join(
            ' -> '
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

export default circularDependencyPlugin;
