'use strict';

function createModelProvider(config, options) {
  const providerId = getProviderId(config, options);

  if (providerId === 'claude') {
    const { ClaudeProvider } = require('../../model_providers/claude_provider.ts');
    return new ClaudeProvider({
      model: getModelName(config, options)
    });
  }

  if (providerId === 'openai') {
    const { OpenAIProvider } = require('../../model_providers/openai_provider.ts');
    return new OpenAIProvider({
      model: getModelName(config, options)
    });
  }

  if (providerId === 'local') {
    const { LocalProvider } = require('../../model_providers/local_provider.ts');
    return new LocalProvider({
      model: getModelName(config, options)
    });
  }

  const { MockModelProvider } = require('../../model_providers/mock_provider.ts');
  return new MockModelProvider({
    model: getModelName(config, options)
  });
}

function getProviderId(config, options) {
  if (options && options.providerId) {
    return options.providerId;
  }

  if (process.env.AGENT_MODEL_PROVIDER) {
    return process.env.AGENT_MODEL_PROVIDER;
  }

  return (config && config.model && config.model.provider) || 'mock';
}

function getModelName(config, options) {
  if (options && options.modelName) {
    return options.modelName;
  }

  if (process.env.AGENT_MODEL_NAME) {
    return process.env.AGENT_MODEL_NAME;
  }

  return (config && config.model && config.model.name) || 'mock-agent-team';
}

module.exports = {
  createModelProvider
};
