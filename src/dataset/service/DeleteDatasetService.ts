import { Dataset } from "../Dataset";
import { DatasetRepository } from "../DatasetRepository";

type DeleteDatasetServiceInput = {
    id: string
}

export enum DeleteDatasetServiceStatusEnum {
    FAILED = "failed",
    SUCCESS = "success"
}

type ServiceStatus = {
    status : DeleteDatasetServiceStatusEnum,
    datasets? : Dataset[]
}

export class DeleteDatasetService {
    datasetRepository: DatasetRepository;

    constructor() {
        this.datasetRepository = DatasetRepository.create({})
    }

    async handle({ id } : DeleteDatasetServiceInput ) : Promise<ServiceStatus> {

        await this.datasetRepository.delete(id)

        const deletedDataset = await this.datasetRepository.getById(id)

        if (deletedDataset) {
            return { status: DeleteDatasetServiceStatusEnum.FAILED }
        }

        const newDatasets = await this.datasetRepository.getAll()


        return {status: DeleteDatasetServiceStatusEnum.SUCCESS, datasets: newDatasets}
    }
}