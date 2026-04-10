const path = require('path');

const {
  createFlatRuleOperations,
  createInstallTargetAdapter,
  createManagedScaffoldOperation,
} = require('./helpers');

module.exports = createInstallTargetAdapter({
  id: 'antigravity-project',
  target: 'antigravity',
  kind: 'project',
  rootSegments: ['.agent'],
  installStatePathSegments: ['ecc-install-state.json'],
  planOperations(input, adapter) {
    const modules = Array.isArray(input.modules)
      ? input.modules
      : (input.module ? [input.module] : []);
    const {
      repoRoot,
      projectRoot,
      homeDir,
    } = input;
    const planningInput = {
      repoRoot,
      projectRoot,
      homeDir,
    };
    const targetRoot = adapter.resolveRoot(planningInput);

    return modules.flatMap(module => {
      const paths = Array.isArray(module.paths) ? module.paths : [];
      return paths.flatMap(sourceRelativePath => {
        if (sourceRelativePath === 'rules') {
          return createFlatRuleOperations({
            moduleId: module.id,
            repoRoot,
            sourceRelativePath,
            destinationDir: path.join(targetRoot, 'rules'),
          });
        }

        if (sourceRelativePath === 'commands') {
          return [
            createManagedScaffoldOperation(
              module.id,
              sourceRelativePath,
              path.join(targetRoot, 'workflows'),
              'preserve-relative-path'
            ),
          ];
        }

        if (sourceRelativePath === 'agents') {
          return [
            createManagedScaffoldOperation(
              module.id,
              sourceRelativePath,
              path.join(targetRoot, 'skills'),
              'preserve-relative-path'
            ),
          ];
        }

        return [adapter.createScaffoldOperation(module.id, sourceRelativePath, planningInput)];
      });
    });
  },
});
