'use strict';

const fs = require('fs');

const { writeInstallState } = require('../install-state');

function applyInstallPlan(plan) {
  for (const operation of plan.operations) {
    fs.mkdirSync(require('path').dirname(operation.destinationPath), { recursive: true });
    fs.copyFileSync(operation.sourcePath, operation.destinationPath);
  }

  writeInstallState(plan.installStatePath, plan.statePreview);

  return {
    ...plan,
    applied: true,
  };
}

module.exports = {
  applyInstallPlan,
};
