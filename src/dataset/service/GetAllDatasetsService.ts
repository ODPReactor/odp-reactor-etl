import { DatasetRepository } from "../DatasetRepository";

export class GetAllDatasetsService {
    datasetRepository: DatasetRepository;

    constructor() {
        this.datasetRepository = DatasetRepository.create({})
    }

    async handle() {
        const datasets = await this.datasetRepository.getAll()
        return datasets.map(dataset => {
            return this.datasetRepository.dataMapper.toDto(dataset)
        })
    }
}