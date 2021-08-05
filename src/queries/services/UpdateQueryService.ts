import { Query } from "../Query";
import { QueryDTO } from "../QueryDataMapper";
import { QueryRepository } from "../QueryRepository";

type UpdateQueryServiceInput = {
    queryDTO : QueryDTO
}

export class UpdateQueryService {
    queryRepository: QueryRepository;

    constructor() {
        this.queryRepository = QueryRepository.create({})
    }

    async handle({ queryDTO } : UpdateQueryServiceInput ) {
        const queryToUpdate = Query.create(queryDTO)
        await this.queryRepository.update(queryToUpdate)
        const updatedQuery = await this.queryRepository.getById(queryToUpdate.id)
        return updatedQuery
    }
}