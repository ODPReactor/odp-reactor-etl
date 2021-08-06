import { DatasetDTO } from "../DatasetDataMapper";
import { DatasetRepository } from "../DatasetRepository";

type GetDatasetByIdServiceInput = {
    datasetId : string
}

export enum GetDatasetServiceStatusEnum {
    FAILED = "failed",
    SUCCESS = "success"
}

type ServiceStatus = {
    status : GetDatasetServiceStatusEnum,
    dataset? : DatasetDTO
}

export class GetDatasetByIdService {
    datasetRepository: DatasetRepository;

    constructor() {
        this.datasetRepository = DatasetRepository.create({})
    }

    async handle({ datasetId} : GetDatasetByIdServiceInput ) : Promise<ServiceStatus> {

        const dataset = await this.datasetRepository.getById(datasetId)

        if (!dataset) {
            return {
                status : GetDatasetServiceStatusEnum.FAILED
            }
        } else {
            return {
                status : GetDatasetServiceStatusEnum.SUCCESS,
                dataset: this.datasetRepository.dataMapper.toDto(dataset)
            }
        }
    }
}