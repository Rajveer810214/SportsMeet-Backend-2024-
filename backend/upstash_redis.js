const { Redis } = require('@upstash/redis');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create the Upstash Redis instance
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

(async () => {
  try {
    // Set a key-value pair in Redis
    await redis.set('foo', 'bar');

    // Retrieve the value
    
    const value = await redis.get('foo');
    console.log('Value:', value); // Should print "bar"
  } catch (error) {
    console.error('Error:', error);
  }
})();
