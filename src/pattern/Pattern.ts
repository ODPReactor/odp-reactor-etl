import { nanoid } from "nanoid"

export type PatternCreateInput = {
    id?: string,
    uri: string,
    label: string
}

export class Pattern {
    label: string
    uri: string
    id: string

    constructor(id: string, uri:string, label: string){
        this.id = id
        this.uri = uri,
        this.label = label
    }
    static create({
        uri,
        label,
        id
    }:PatternCreateInput) {
        return new Pattern(id || nanoid().toLowerCase(), uri, label)
    }
    toJSON() {
        return {
            id: this.id,
            uri: this.uri,
            label: this.label
        }
    }
}