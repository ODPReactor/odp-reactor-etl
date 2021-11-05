export enum IndexingStatusEnum {
    COMPLETED = "completed",
    CANCELED = "canceled",
    RUNNING = "running",
    FAILED = "failed",
    PAUSED = "paused",
    NOTSTARTED = "notstarted"
}


export type IndexingStatus = {
    id?: string,
    status?: IndexingStatusEnum,
    progress?: number,
    dateTime?: string
}