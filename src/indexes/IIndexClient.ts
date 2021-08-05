export type IndexDataInput = {
    index: string,
    data: any
}

export type DeleteIndexInput = {
    index: string
}

export interface IIndexClient<D> {
    
    indexData({
        index,
        data
    }:  IndexDataInput) : Promise<void>

    deleteIndex({
        index
    } : DeleteIndexInput) : Promise<void>

    searchDocuments(index : string, query : any) : Promise<D>

    deleteDocuments(index: string, query : any) : Promise<void>
}