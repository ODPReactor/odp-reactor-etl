import { QueryDTO } from "../QueryDataMapper";
import { QueryRepository } from "../QueryRepository";

type GetQueryByIdServiceInput = {
    queryId : string
}

export enum GetQueryServiceStatusEnum {
    FAILED = "failed",
    SUCCESS = "success"
}

type ServiceStatus = {
    status : GetQueryServiceStatusEnum,
    query? : QueryDTO
}

export class GetQueryByIdService {
    queryRepository: QueryRepository;

    constructor() {
        this.queryRepository = QueryRepository.create({})
    }

    async handle({ queryId} : GetQueryByIdServiceInput ) : Promise<ServiceStatus> {

        const query = await this.queryRepository.getById(queryId)

        if (!query) {
            return {
                status : GetQueryServiceStatusEnum.FAILED
            }
        } else {
            return {
                status : GetQueryServiceStatusEnum.SUCCESS,
                query: this.queryRepository.dataMapper.toDto(query)
            }
        }
    }
}