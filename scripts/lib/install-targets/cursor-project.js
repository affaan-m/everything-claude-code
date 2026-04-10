const path = require('path');

const {
  createFlatRuleOperations,
  createInstallTargetAdapter,
} = require('./helpers');

module.exports = createInstallTargetAdapter({
  id: 'cursor-project',
  target: 'cursor',
  kind: 'project',
  rootSegments: ['.cursor'],
  installStatePathSegments: ['ecc-install-state.json'],
  nativeRootRelativePath: '.cursor',
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

        return [adapter.createScaffoldOperation(module.id, sourceRelativePath, planningInput)];
      });
    });
  },
});
