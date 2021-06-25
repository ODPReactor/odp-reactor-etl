import { SparqlDataMapper } from "../base/repository/datamappers/SparqlDataMapper";
import { IClient } from "../base/repository/IClient";
import { IDataMapper } from "../base/repository/IDataMapper";
import { IQueryBuilder } from "../base/repository/IQueryBuilder";
import { IRepository, RepositoryInput } from "../base/repository/IRepository";
import { PatternInstanceQueryBuilder } from "./PatternInstanceQueryBuilder";



export class PatternInstanceRepository implements IRepository {

    dbClient: IClient | undefined;
    dataMapper: IDataMapper;
    queryBuilder: IQueryBuilder;


    constructor(input : RepositoryInput) {
        this.dbClient = input.dbClient || undefined
        this.dataMapper = input.dataMapper || new SparqlDataMapper()
        this.queryBuilder = input.queryBuilder || new PatternInstanceQueryBuilder()
    }


    async getMainUniqueEntitiesInBatch() {

    }
}