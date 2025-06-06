const { generateUserAgent } = require('@imaginerlabs/user-agent-generator');

const INDEX_URL = 'https://muchong.com/f-430-1-threadtype-11';

const UA_POOL_SIZE = 100;

const UA_POOL = generateUserAgent({
  browser: 'chrome',
  device: 'mac',
  count: UA_POOL_SIZE,
});

export { INDEX_URL, UA_POOL };
