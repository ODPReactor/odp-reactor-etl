import {Worker} from "bullmq" 

export type IndexCommandArgs = {
    datasetId?  : string
    worker: Worker 
}
