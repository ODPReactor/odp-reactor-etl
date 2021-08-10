export type DatasetIndexingJob = {
    datasetId: string,
    operation: DatasetIndexingJobOperations
}


export enum DatasetIndexingJobOperations {
    PAUSE = "pause",
    INDEX = "index",
    CANCEL = "cancel"
}