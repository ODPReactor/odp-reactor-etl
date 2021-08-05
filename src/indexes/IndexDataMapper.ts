import { IDataMapper } from "odp-reactor-persistence-interface";
import { Index } from "./Index";

export type IndexDTO = {
    sparqlEndpoint: string,
    graph: string
    indexName?: string
}

export class IndexDataMapper implements IDataMapper<IndexDTO, Index> {

    toDto(e: Index): IndexDTO {
        return e.toJSON()
    }

    toEntity(d: IndexDTO): Index {
        return  Index.create(d)
    }  
} 