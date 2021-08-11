import { ICommand } from "./ICommand";
import { IndexCommandArgs } from "./IndexCommandArgs";

export class StartIndexingCommand implements ICommand<IndexCommandArgs>{

    public args: IndexCommandArgs;

    constructor(args : IndexCommandArgs) {
        this.args = args
    }


    async execute(): Promise<any> {
        console.log("I launch indexing command")
        return await this.args.worker.isRunning()
    }
    
}