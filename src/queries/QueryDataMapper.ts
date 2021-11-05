import { IDataMapper } from "odp-reactor-persistence-interface";
import { Query } from "./Query";

export type QueryDTO = {
    id?: string
    string: string
    patternUri: string
    patternLabel: string
}

export class QueryDataMapper implements IDataMapper<QueryDTO, Query> {
    
    toEntity(d: QueryDTO, ...rest: any): Query {
        return Query.create(d)
    }
    toDto(e: Query): QueryDTO {
        return e.toJSON()
    }

}