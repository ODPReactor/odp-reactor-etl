import { Queue, QueueOptions } from "bullmq";
import { DatasetIndexingJob, DatasetIndexingJobOperations } from "./DatasetIndexingJob";
import config from "./config";

export class DatasetIndexer {
    private queue: Queue

    private jobName: string = "index"

    constructor(queueOpts: QueueOptions) {
        this.queue = new Queue<DatasetIndexingJob>(config.queueName, queueOpts)
    }

    async index(datasetId : string) {

        const job : DatasetIndexingJob = {
            datasetId: datasetId,
            operation: DatasetIndexingJobOperations.INDEX
        }

        await this.queue.add(this.jobName, job)
    }

    async pause(datasetId : string) {

        const job : DatasetIndexingJob = {
            datasetId: datasetId,
            operation: DatasetIndexingJobOperations.PAUSE
        }

        await this.queue.add(this.jobName, job)
    }

    async delete(datasetId : string) {
        const job : DatasetIndexingJob = {
            datasetId: datasetId,
            operation: DatasetIndexingJobOperations.CANCEL
        }
        await this.queue.add(this.jobName, job)
    }

    close() {
        return this.queue.close();
    }

}