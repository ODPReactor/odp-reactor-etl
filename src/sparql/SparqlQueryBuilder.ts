export class ODPRSparqlQueryBuilder {

    defaultODPReactorNamespace : string = "https://odp-reactor/ns/"

    addPrefixes() {
        return`
            PREFIX odpr: <${process.env.ODP_REACTOR_NAMESPACE || this.defaultODPReactorNamespace}>
        `
    }
}