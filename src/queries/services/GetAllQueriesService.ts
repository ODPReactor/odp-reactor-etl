import { QueryRepository } from "../QueryRepository";

export class GetAllQueriesService {
    queryRepository: QueryRepository;

    constructor() {
        this.queryRepository = QueryRepository.create({})
    }

    async handle() {
        const queries = await this.queryRepository.getAll()
        return queries.map(query => {
            return this.queryRepository.dataMapper.toDto(query)
        })
    }
}