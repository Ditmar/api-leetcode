const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { test } = require('node:test');

// Exercise the compiled startup validator with node-config's real file/env merge.
const root = path.resolve(__dirname, '..');
const valid = {
  JWT_SECRET: 'test-only-access-key-with-at-least-32-characters',
  JWT_REFRESH_TOKEN_SECRET: 'test-only-refresh-key-with-at-least-32-characters',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
};

function startup(overrides = {}, mode = 'production') {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (
      /^(NODE_ENV|NODE_CONFIG.*|SUPPRESS_.*|JWT_.*|DATABASE_URL|PORT|LOG_LEVEL)$/i.test(
        key
      )
    ) {
      delete env[key];
    }
  }
  Object.assign(env, valid, { NODE_ENV: mode }, overrides);
  for (const key of Object.keys(env)) {
    if (env[key] === undefined) delete env[key];
  }
  return spawnSync(
    process.execPath,
    ['-e', "require('./dist/config/config.js')"],
    {
      cwd: root,
      env,
      encoding: 'utf8',
    }
  );
}

test('production accepts explicitly configured credentials', () => {
  const result = startup();
  assert.equal(result.status, 0, result.stderr);
});

for (const key of Object.keys(valid)) {
  test(`production rejects missing ${key} without exposing secrets`, () => {
    const result = startup({ [key]: undefined });
    assert.equal(result.status, 1);
    assert.match(result.stderr, new RegExp(`${key} is required`));
    for (const value of Object.values(valid))
      assert.ok(!result.stderr.includes(value));
  });
}

for (const key of ['JWT_SECRET', 'JWT_REFRESH_TOKEN_SECRET']) {
  for (const value of [
    ' ',
    'short',
    'your_jwt_secret_key',
    'replace_with_a_secure_random_secret_at_least_32_chars',
  ]) {
    test(`production rejects ${key} value ${JSON.stringify(value)}`, () => {
      const result = startup({ [key]: value });
      assert.equal(result.status, 1);
      assert.match(result.stderr, new RegExp(key));
      assert.ok(!result.stderr.includes(valid.JWT_SECRET));
    });
  }
}

test('development keeps its local database default with explicit JWT secrets', () => {
  const result = startup({ DATABASE_URL: undefined }, 'development');
  assert.equal(result.status, 0, result.stderr);
});

test('development fails early when the signing secret is missing', () => {
  const result = startup({ JWT_SECRET: undefined }, 'development');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /JWT_SECRET is required/);
});

test('test mode works with the fake test configuration only', () => {
  const result = startup(
    Object.fromEntries(Object.keys(valid).map(key => [key, undefined])),
    'test'
  );
  assert.equal(result.status, 0, result.stderr);
});
