import { IDataMapper } from "odp-reactor-persistence-interface";
import { PatternDataMapper } from "../pattern/PatternDataMapper";
import { PatternDTO } from "../pattern/PatternDTO";
import { Dataset } from "./Dataset";

export type DatasetDTO = {
    id?: string,
    sparqlEndpoint: string,
    graph?: string | undefined,
    indexed: boolean,
    label: string,
    patterns?: PatternDTO[]
}

export class DatasetDataMapper implements IDataMapper<DatasetDTO, Dataset> {

    patternDataMapper: PatternDataMapper;

    constructor() {
        this.patternDataMapper = new PatternDataMapper()
    }
    
    toEntity(d: DatasetDTO, ...rest: any): Dataset {
        return Dataset.create({...d, patterns: d.patterns?.map((pDTO : PatternDTO) => { return this.patternDataMapper?.toEntity(pDTO)})})
    }
    toDto(e: Dataset): DatasetDTO {
        return e.toJSON()
    }

}