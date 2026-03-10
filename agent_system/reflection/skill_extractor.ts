'use strict';

class SkillExtractor {
  constructor(options) {
    const normalizedOptions = options || {};
    this.skillLibrary = normalizedOptions.skillLibrary;
  }

  extract(reflection) {
    if (!reflection || !reflection.skillCandidate) {
      return null;
    }

    return this.skillLibrary.storeSkill(reflection.skillCandidate);
  }
}

module.exports = {
  SkillExtractor
};
