/**
 * Object implementing this interface 
 * returns query for database. Through some inputs
 */
export interface IQueryBuilder {
    getQuery(queryBuilderInput: any) : any
}