export interface ICommand<TArgs> {
    args: TArgs
    execute() : Promise<void>
}