import { Query } from "../Query";
import { QueryDTO } from "../QueryDataMapper";
import { QueryRepository } from "../QueryRepository";

type CreateQueryServiceInput = {
    queryDTO : QueryDTO
}

export class CreateQueryService {
    queryRepository: QueryRepository;

    constructor() {
        this.queryRepository = QueryRepository.create({})
    }

    async handle({ queryDTO } : CreateQueryServiceInput ) {
        const newQuery = Query.create(queryDTO)
        await this.queryRepository.create(newQuery)
        const createdQuery = await this.queryRepository.getById(newQuery.id)
        return createdQuery
    }
}