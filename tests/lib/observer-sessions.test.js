const assert = require('node:assert/strict');
const os = require('os');
const path = require('path');
const test = require('node:test');

const MODULE_PATH = require.resolve('../../scripts/lib/observer-sessions');

function loadFresh() {
  delete require.cache[MODULE_PATH];
  return require(MODULE_PATH);
}

function withEnv(overrides, fn) {
  const snapshot = {};
  for (const key of Object.keys(overrides)) {
    snapshot[key] = process.env[key];
    if (overrides[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = overrides[key];
    }
  }
  try {
    return fn();
  } finally {
    for (const key of Object.keys(snapshot)) {
      if (snapshot[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = snapshot[key];
      }
    }
  }
}

test('getHomunculusDir honors absolute CLV2_HOMUNCULUS_DIR override', () => {
  const { getHomunculusDir } = loadFresh();
  withEnv({ CLV2_HOMUNCULUS_DIR: '/tmp/ecc-override', XDG_DATA_HOME: undefined }, () => {
    assert.equal(getHomunculusDir(), '/tmp/ecc-override');
  });
});

test('getHomunculusDir falls back when CLV2_HOMUNCULUS_DIR is relative', () => {
  const { getHomunculusDir } = loadFresh();
  withEnv({ CLV2_HOMUNCULUS_DIR: 'relative/subdir', XDG_DATA_HOME: undefined }, () => {
    const expected = path.join(os.homedir(), '.local', 'share', 'ecc-homunculus');
    assert.equal(getHomunculusDir(), expected, 'relative override must fall through so observer data never lands under cwd');
  });
});

test('getHomunculusDir honors absolute XDG_DATA_HOME', () => {
  const { getHomunculusDir } = loadFresh();
  withEnv({ CLV2_HOMUNCULUS_DIR: undefined, XDG_DATA_HOME: '/var/ecc-xdg' }, () => {
    assert.equal(getHomunculusDir(), path.join('/var/ecc-xdg', 'ecc-homunculus'));
  });
});

test('getHomunculusDir falls back when XDG_DATA_HOME is relative', () => {
  const { getHomunculusDir } = loadFresh();
  withEnv({ CLV2_HOMUNCULUS_DIR: undefined, XDG_DATA_HOME: 'not/absolute' }, () => {
    const expected = path.join(os.homedir(), '.local', 'share', 'ecc-homunculus');
    assert.equal(getHomunculusDir(), expected, 'relative XDG_DATA_HOME must be ignored per XDG Base Directory spec');
  });
});

test('getHomunculusDir defaults to ~/.local/share/ecc-homunculus', () => {
  const { getHomunculusDir } = loadFresh();
  withEnv({ CLV2_HOMUNCULUS_DIR: undefined, XDG_DATA_HOME: undefined }, () => {
    assert.equal(getHomunculusDir(), path.join(os.homedir(), '.local', 'share', 'ecc-homunculus'));
  });
});
