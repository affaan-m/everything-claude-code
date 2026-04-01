'use strict';

const fs = require('fs');

/**
 * Read and parse a JSON file synchronously.
 * @param {string} filePath - Absolute path to the JSON file.
 * @param {string} label - Human-readable label used in error messages.
 * @returns {*} The parsed JSON value.
 */
function readJson(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Failed to read ${label}: ${error.message}`);
  }
}

/**
 * Read and parse a JSON file, asserting the result is a plain object.
 * @param {string} filePath - Absolute path to the JSON file.
 * @param {string} label - Human-readable label used in error messages.
 * @returns {Object} The parsed JSON object.
 */
function readJsonObject(filePath, label) {
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Failed to parse ${label} at ${filePath}: ${error.message}`);
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`Invalid ${label} at ${filePath}: expected a JSON object`);
  }

  return parsed;
}

module.exports = {
  readJson,
  readJsonObject,
};
