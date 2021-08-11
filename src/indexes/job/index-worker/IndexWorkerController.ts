// control what the Indexing worker should do with datasets being elaborated

import { ICommand } from "./ICommand";
import { IndexCommandArgs } from "./IndexCommandArgs";

export class IndexWorkerController {


    constructor(private startCommand: ICommand<IndexCommandArgs>, 
                private cancelCommand : ICommand<IndexCommandArgs>,
                private pauseCommand : ICommand<IndexCommandArgs>
                ) {}

    setDataset(datasetId : string) {
        this.startCommand.args.datasetId = datasetId
        this.cancelCommand.args.datasetId = datasetId
        this.pauseCommand.args.datasetId = datasetId
    }

    async index() {
        return await this.startCommand.execute()
    }

    async cancel() {
        return await this.startCommand.execute()
    }

    async pause() {
        return await this.pauseCommand.execute()
    }

}