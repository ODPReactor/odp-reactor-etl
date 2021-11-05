import { Query } from "../Query";
import { QueryRepository } from "../QueryRepository";

type DeleteQueryServiceInput = {
    queryId: string
}

export enum DeleteQueryServiceStatusEnum {
    FAILED = "failed",
    SUCCESS = "success"
}

type ServiceStatus = {
    status : DeleteQueryServiceStatusEnum,
    queries? : Query[]
}

export class DeleteQueryService {
    queryRepository: QueryRepository;

    constructor() {
        this.queryRepository = QueryRepository.create({})
    }

    async handle({ queryId } : DeleteQueryServiceInput ) : Promise<ServiceStatus> {

        await this.queryRepository.delete(queryId)

        const deletedQuery = await this.queryRepository.getById(queryId)

        if (deletedQuery) {
            return { status: DeleteQueryServiceStatusEnum.FAILED }
        }

        const newQueries = await this.queryRepository.getAll()


        return {status: DeleteQueryServiceStatusEnum.SUCCESS, queries: newQueries}
    }
}