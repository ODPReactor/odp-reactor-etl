import { IRepository, IClient, IQueryBuilder, IDataMapper, SparqlClient, SparqlDataMapper } from "odp-reactor-persistence-interface";
import { PatternInstanceQueryBuilder } from "./PatternInstanceQueryBuilder";

type RepositoryInput = {
    dbClient?: SparqlClient | IClient
    dataMapper?: SparqlDataMapper 
    queryBuilder?: IQueryBuilder
}

export class PatternInstanceRepository implements IRepository {

    dbClient: SparqlClient | IClient;
    dataMapper: SparqlDataMapper 
    queryBuilder: IQueryBuilder;


    constructor(input : RepositoryInput) {
        this.dbClient = input.dbClient || new SparqlClient()
        this.dataMapper = input.dataMapper || new SparqlDataMapper()
        this.queryBuilder = input.queryBuilder || new PatternInstanceQueryBuilder()
    }


    async getMainUniqueEntitiesInBatch() {

    }
}