'use strict';

const fs = require('fs');
const path = require('path');
const {
  ensureDir,
  readJson,
  textMatchScore,
  writeJson
} = require('../shared/file_utils.ts');

class EpisodicMemory {
  constructor(options) {
    const normalizedOptions = options || {};
    this.cwd = path.resolve(normalizedOptions.cwd || process.cwd());
    this.directory = path.resolve(this.cwd, normalizedOptions.directory || 'agent_memory/episodic');
    ensureDir(this.directory);
  }

  saveEpisode(episode) {
    const runId = episode && episode.runId ? episode.runId : `episode-${Date.now()}`;
    const filePath = path.join(this.directory, `${runId}.json`);
    writeJson(filePath, episode);
    return filePath;
  }

  loadEpisode(selector) {
    const normalizedSelector = selector || 'latest';
    const fileEntries = this.listEpisodeFiles();

    if (fileEntries.length === 0) {
      return null;
    }

    if (normalizedSelector === 'latest') {
      return readJson(fileEntries[0].filePath, null);
    }

    const matchedEntry = fileEntries.find((entry) =>
      entry.runId === normalizedSelector || entry.fileName === normalizedSelector || entry.fileName === `${normalizedSelector}.json`
    );

    return matchedEntry ? readJson(matchedEntry.filePath, null) : null;
  }

  listEpisodes() {
    return this.listEpisodeFiles()
      .map((entry) => ({
        ...entry,
        episode: readJson(entry.filePath, null)
      }))
      .filter((entry) => entry.episode);
  }

  search(query, limit) {
    const normalizedLimit = Number.isInteger(limit) ? limit : 5;

    return this.listEpisodes()
      .map((entry) => ({
        ...entry.episode,
        score: textMatchScore(query, buildEpisodeSearchText(entry.episode))
      }))
      .filter((episode) => episode.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, normalizedLimit);
  }

  listEpisodeFiles() {
    const fileNames = fs.existsSync(this.directory)
      ? fs.readdirSync(this.directory).filter((fileName) => fileName.endsWith('.json'))
      : [];

    return fileNames
      .map((fileName) => {
        const filePath = path.join(this.directory, fileName);
        const stats = fs.statSync(filePath);
        return {
          fileName,
          filePath,
          runId: path.basename(fileName, '.json'),
          modifiedAt: stats.mtimeMs
        };
      })
      .sort((left, right) => right.modifiedAt - left.modifiedAt);
  }
}

function buildEpisodeSearchText(episode) {
  return [
    episode.goal,
    episode.status,
    episode.plan && episode.plan.summary,
    episode.evaluation && episode.evaluation.status,
    episode.reflection && episode.reflection.summary
  ].filter(Boolean).join(' ');
}

module.exports = {
  EpisodicMemory
};
