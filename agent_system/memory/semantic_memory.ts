'use strict';

const path = require('path');
const {
  dedupeStrings,
  ensureDir,
  readJson,
  textMatchScore,
  writeJson
} = require('../shared/file_utils.ts');

class SemanticMemory {
  constructor(options) {
    const normalizedOptions = options || {};
    this.cwd = path.resolve(normalizedOptions.cwd || process.cwd());
    this.directory = path.resolve(this.cwd, normalizedOptions.directory || 'agent_memory/semantic');
    this.filePath = path.join(this.directory, 'semantic_memory.json');
    ensureDir(this.directory);
  }

  loadAll() {
    return readJson(this.filePath, []);
  }

  appendInsights(sourceEpisodeId, insights) {
    const existingInsights = this.loadAll();
    const normalizedInsights = (Array.isArray(insights) ? insights : [])
      .filter(Boolean)
      .map((insight) => ({
        topic: String(insight.topic || 'general').trim(),
        fact: String(insight.fact || '').trim(),
        tags: dedupeStrings(insight.tags || []),
        sourceEpisodeId: sourceEpisodeId || null,
        createdAt: new Date().toISOString()
      }))
      .filter((insight) => insight.fact.length > 0);

    const nextInsights = dedupeInsights([...existingInsights, ...normalizedInsights]);
    writeJson(this.filePath, nextInsights);
    return normalizedInsights;
  }

  search(query, limit) {
    const normalizedLimit = Number.isInteger(limit) ? limit : 5;
    return this.loadAll()
      .map((insight) => ({
        ...insight,
        score: textMatchScore(query, `${insight.topic} ${insight.fact}`, insight.tags)
      }))
      .filter((insight) => insight.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, normalizedLimit);
  }
}

function dedupeInsights(insights) {
  const seenKeys = new Set();
  return insights.filter((insight) => {
    const key = `${insight.topic}::${insight.fact}`;
    if (seenKeys.has(key)) {
      return false;
    }

    seenKeys.add(key);
    return true;
  });
}

module.exports = {
  SemanticMemory
};
