import { SandboxedJob } from 'bullmq';
import { DatasetIndexingJob } from './DatasetIndexingJob';

module.exports = async (job: SandboxedJob<DatasetIndexingJob>) => {
    // Do something with job

    console.log("Job in charge: ", job.data)

};