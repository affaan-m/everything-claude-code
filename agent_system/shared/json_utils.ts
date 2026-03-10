'use strict';

const { cloneValue } = require('./file_utils.ts');

function tryParseJson(rawValue) {
  if (rawValue === null || typeof rawValue === 'undefined') {
    return null;
  }

  if (typeof rawValue === 'object') {
    return rawValue;
  }

  const rawText = String(rawValue).trim();
  if (!rawText) {
    return null;
  }

  const direct = parseCandidate(rawText);
  if (direct !== null) {
    return direct;
  }

  const fencedMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch) {
    const fenced = parseCandidate(fencedMatch[1].trim());
    if (fenced !== null) {
      return fenced;
    }
  }

  const firstObjectIndex = rawText.indexOf('{');
  const lastObjectIndex = rawText.lastIndexOf('}');
  if (firstObjectIndex >= 0 && lastObjectIndex > firstObjectIndex) {
    const objectCandidate = parseCandidate(rawText.slice(firstObjectIndex, lastObjectIndex + 1));
    if (objectCandidate !== null) {
      return objectCandidate;
    }
  }

  const firstArrayIndex = rawText.indexOf('[');
  const lastArrayIndex = rawText.lastIndexOf(']');
  if (firstArrayIndex >= 0 && lastArrayIndex > firstArrayIndex) {
    const arrayCandidate = parseCandidate(rawText.slice(firstArrayIndex, lastArrayIndex + 1));
    if (arrayCandidate !== null) {
      return arrayCandidate;
    }
  }

  return null;
}

function parseCandidate(candidate) {
  try {
    return JSON.parse(candidate);
  } catch (_err) {
    return null;
  }
}

function parseJsonWithFallback(rawValue, fallbackValue) {
  const parsed = tryParseJson(rawValue);
  return parsed === null ? cloneValue(fallbackValue) : parsed;
}

function safeString(value, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function safeArray(value) {
  return Array.isArray(value) ? [...value] : [];
}

module.exports = {
  parseJsonWithFallback,
  safeArray,
  safeString,
  tryParseJson
};
