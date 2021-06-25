import { IDataMapper } from "../IDataMapper";

export class SparqlDataMapper implements IDataMapper {

    toEntity(d: any): any {
        const binding = d
        const jsonResource : any = {};
        const variables : string[] = Array.from(binding.keys());
        variables.forEach((v) => {
            const result = binding.get(v);
            jsonResource[stripeQuestionMark(v)] = result.value; // value convert from rdf object NamedNode, Literal giving just the value
        });
        return jsonResource;
    }
    toDto(e: any): any {
        throw new Error("Method not implemented.");
    }

    async parseResults(comunicaBindings : any) {
        /*
        {
            uri:
            label:
            otherProp:
        }
        */
        let bindings = await comunicaBindings;
        const resources = bindings.map((binding : any) => {
            return this.toEntity(binding)
        });
        return resources;
    }
}

const stripeQuestionMark = (sparqlVariable : string) : string => {
    return sparqlVariable.replace("?", "");
};
