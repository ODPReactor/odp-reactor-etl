import { IDataMapper } from "odp-reactor-persistence-interface";
import { Pattern } from "./Pattern";
import { PatternDTO } from "./PatternDTO";

export class PatternDataMapper implements IDataMapper<PatternDTO, Pattern> {

    toEntity(d: PatternDTO, ...rest: any): Pattern {
        return Pattern.create(d);
    }
    toDto(e: Pattern): PatternDTO {
        return e.toJSON()
    }

}