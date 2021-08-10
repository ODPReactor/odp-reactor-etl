export default {
    queueName: process.env.QUEUE_NAME || "datasets",
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY || "1"),
    connection: {
      host: process.env.REDIS_QUEUE_HOST,
      port: parseInt(process.env.REDIS_QUEUE_PORT || "6379"),
    },
    limiter: {
      max: parseInt(process.env.MAX_LIMIT || "1"),
      duration: parseInt(process.env.DURATION_LIMIT || "1000")
    }
  };
  