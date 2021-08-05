import { Dataset } from "../Dataset";
import { DatasetDTO } from "../DatasetDataMapper";
import { DatasetRepository } from "../DatasetRepository";

type CreateDatasetServiceInput = {
    datasetDTO : DatasetDTO
}

export class CreateDatasetService {
    datasetRepository: DatasetRepository;

    constructor() {
        this.datasetRepository = DatasetRepository.create({})
    }

    async handle({ datasetDTO } : CreateDatasetServiceInput ) {
        const newDataset = Dataset.create({...datasetDTO, patterns: undefined})
        await this.datasetRepository.create(newDataset)
        const createdDataset = await this.datasetRepository.getById(newDataset.id)
        return createdDataset
    }
}