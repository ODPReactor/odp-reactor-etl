import { nanoid } from "nanoid";
import { PatternInstanceDTO } from "./PatternInstanceDTO";

type CreatePatternInstanceInput = {
    id? : string,
    type: string,
    data: any,
    patternId : string,
    datasetId? : string
};

export class PatternInstance {

    /**
     * 
     * @param id 
     * @param type pattern URI. The type of instance
     */
    constructor(public id:string, public type:string,  public data : any, public patternId : string,  public datasetId?: string ) {}

    static create(d: CreatePatternInstanceInput): PatternInstance {

        return new PatternInstance(d.id || nanoid(), d.type, d.data, d.patternId, d.datasetId)

    }

    toJSON(): PatternInstanceDTO {
        return {
            id: this.id,
            type: this.type,
            data: this.data,
            patternId: this.patternId,
            datasetId: this.datasetId
        }
    }

}