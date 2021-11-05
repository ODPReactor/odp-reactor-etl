import { CreateDatasetInput, Dataset } from "../Dataset";
import { DatasetDTO } from "../DatasetDataMapper";
import { DatasetRepository } from "../DatasetRepository";

type UpdateDatasetServiceInput = {
    datasetDTO : CreateDatasetInput
}

export class UpdateDatasetService {
    datasetRepository: DatasetRepository;

    constructor() {
        this.datasetRepository = DatasetRepository.create({})
    }

    async handle({ datasetDTO } : UpdateDatasetServiceInput ) {
        const datasetToUpdate = Dataset.create(datasetDTO)
        await this.datasetRepository.update(datasetToUpdate)
        const updatedDataset = await this.datasetRepository.getById(datasetToUpdate.id)
        return updatedDataset
    }
}