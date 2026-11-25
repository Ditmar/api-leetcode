const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { test } = require('node:test');
const { JWT: testJwt } = require('../config/test.json');

// Exercise the compiled startup validator with node-config's real file/env merge.
const root = path.resolve(__dirname, '..');
const valid = {
  JWT_SECRET: 'test-only-access-key-with-at-least-32-characters',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
};

function startup(
  overrides = {},
  mode = 'production',
  code = "require('./dist/config/config.js')"
) {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (
      /^(NODE_ENV|ENV|NODE_CONFIG.*|SUPPRESS_.*|JWT_.*|DATABASE_URL|PORT|LOG_LEVEL)$/i.test(
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
  return spawnSync(process.execPath, ['-e', code], {
    cwd: root,
    env,
    encoding: 'utf8',
  });
}

test('deploy-like production starts with only JWT_SECRET and DATABASE_URL', () => {
  const result = startup();
  assert.equal(result.status, 0, result.stderr);
});

for (const deployment of ['ppd', 'prod']) {
  test(`Docker ${deployment} uses production validation and JSON logging`, () => {
    const result = startup(
      { ENV: deployment },
      'production',
      `
      const { config } = require('./dist/config/config.js');
      require('node:assert/strict').equal(config.app.nodeEnv, 'production');
      require('node:assert/strict').equal('refreshTokenSecret' in config.JWT, false);
      require('./dist/logger/index.js').default.info('startup-check');
    `
    );
    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(result.stdout.trim()).msg, 'startup-check');

    const invalid = startup({ ENV: deployment, JWT_SECRET: 'short' });
    assert.equal(invalid.status, 1);
    assert.match(invalid.stderr, /JWT_SECRET must be at least 32/);
  });
}

for (const key of Object.keys(valid)) {
  test(`production rejects missing ${key} without exposing secrets`, () => {
    const result = startup({ [key]: undefined });
    assert.equal(result.status, 1);
    assert.match(result.stderr, new RegExp(`${key} is required`));
    for (const value of Object.values(valid))
      assert.ok(!result.stderr.includes(value));
  });
}

test('production rejects the test signing key without exposing it', () => {
  const result = startup({ JWT_SECRET: testJwt.secret });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /JWT_SECRET/);
  assert.ok(!result.stderr.includes(testJwt.secret));
});

for (const value of [
  ' ',
  'short',
  'your_jwt_secret_key',
  'replace_with_a_secure_random_secret_at_least_32_chars',
]) {
  test(`production rejects JWT_SECRET value ${JSON.stringify(value)}`, () => {
    const result = startup({ JWT_SECRET: value });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /JWT_SECRET/);
    assert.ok(!result.stderr.includes(valid.JWT_SECRET));
  });
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
