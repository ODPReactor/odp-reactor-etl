import { IDataMapper } from "odp-reactor-persistence-interface";
import { PatternInstance } from "./PatternInstance";
import { PatternInstanceDTO } from "./PatternInstanceDTO";

export class PatternInstanceDataMapper implements IDataMapper<PatternInstanceDTO, PatternInstance> {


    toEntity(d: PatternInstanceDTO, ...rest: any): PatternInstance {

        return PatternInstance.create(d)

    }
    toDto(e: PatternInstance): PatternInstanceDTO {
        return e.toJSON()
    }

}