const AD = require('../dist');
const config = require('./importConfig');

const baseConfig = {
  baseDN: config.baseDN
};

test('throws with no config', () => {
  expect(() => new AD()).toThrow('Configuration is required.');
});

test('throws on missing url', () => {
  let cfg = Object.assign({}, baseConfig, {
    user: config.user,
    pass: config.pass
  });

  expect(() => new AD(cfg)).toThrow(
    'The following configuration is required: {url, user, pass}.'
  );
});

test('throws on incomplete url', () => {
  let cfg = Object.assign({}, baseConfig, {
    url: '127.0.0.1',
    user: config.user,
    pass: config.pass
  });

  expect(() => new AD(cfg)).toThrow(
    'You must specify the protocol in the url, such as ldaps://127.0.0.1.'
  );
});

test('throws on missing user', () => {
  let cfg = Object.assign({}, baseConfig, {
    url: config.url,
    pass: config.pass
  });

  expect(() => new AD(cfg)).toThrow(
    'The following configuration is required: {url, user, pass}.'
  );
});

test('throws on incomplete user', () => {
  let cfg = Object.assign({}, baseConfig, {
    url: config.url,
    user: 'mock',
    pass: config.pass
  });

  expect(() => new AD(cfg)).toThrow(
    'The user must include the fully qualified domain name, such as joe@acme.co.'
  );
});

test('throws on missing pass', () => {
  let cfg = Object.assign({}, baseConfig, {
    url: config.url,
    user: config.user
  });

  expect(() => new AD(cfg)).toThrow(
    'The following configuration is required: {url, user, pass}.'
  );
});

test("doesn't throw an error with correct config", () => {
  let cfg = Object.assign({}, baseConfig, {
    url: config.url,
    user: config.user,
    pass: config.pass
  });

  expect(() => new AD(cfg)).not.toThrow();
});
