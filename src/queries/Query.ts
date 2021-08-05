import { nanoid } from "nanoid"

type CreateQueryInput = {
    id?: string
    string: string
    patternUri: string
    patternLabel: string
}

export class Query {
    id: string
    string: string
    patternUri: string
    patternLabel: string

    constructor(id : string, string : string, patternUri : string, patternLabel : string) {
        this.id = id
        this.string = string
        this.patternUri = patternUri
        this.patternLabel = patternLabel
    }

    static create({
        id,
        string,
        patternUri,
        patternLabel
    } : CreateQueryInput) {
        return new Query(id || nanoid(), string, patternUri, patternLabel)
    }

    toJSON() {
        return {
            id: this.id,
            string: this.string,
            patternUri: this.patternUri,
            patternLabel: this.patternLabel
        }
    }
}