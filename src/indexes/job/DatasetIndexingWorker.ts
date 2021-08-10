import { Job, Worker } from "bullmq";
import config from "./config";

export class DatasetIndexingWorker {

    private worker: Worker

    constructor() {
        this.worker = new Worker(config.queueName, __dirname + "/dataset-indexing.processor.js", {
            connection: config.connection,
            concurrency: config.concurrency,
          });
          this.onComplete()
          this.onFailed()
    }

    onComplete() {
        this.worker.on("completed", (job : Job) => {
            console.log(`Completed job ${job.id} successfully`)
        })
    }

    onFailed() {
        this.worker.on("failed", (job, err) =>
         console.log(`Failed job ${job.id} with ${err}`)
        );
    }
}