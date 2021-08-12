import { nanoid } from "nanoid";
import { PatternInstanceDTO } from "./PatternInstanceDTO";

export class PatternInstance {

    /**
     * 
     * @param id 
     * @param type pattern URI. The type of instance
     */
    constructor(public id:string, public type:string,  public data : any, public datasetId?: string ) {}

    static create(d: PatternInstanceDTO): PatternInstance {

        return new PatternInstance(d.id || nanoid(), d.type, d.data, d.datasetId)

    }

    toJSON(): PatternInstanceDTO {
        return {
            id: this.id,
            type: this.type,
            data: this.data,
            datasetId: this.datasetId
        }
    }

}