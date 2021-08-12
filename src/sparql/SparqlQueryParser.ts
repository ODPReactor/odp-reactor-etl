export class SparqlQueryParser {
    toCountResultsQuery(query: string) : string | undefined {

        const selectCountClauseOpen = "SELECT (COUNT(*) as ?count) WHERE { \n"
        const selectCountClauseClose = " \n }"
      
        const lastPrefixLineIndex = getLastMatchLine(query, "PREFIX")

        if (!lastPrefixLineIndex) {
            // no prefixes query
            return selectCountClauseOpen + query + selectCountClauseClose
        }

        // prefixes query
        const queryLines = query.split("\n")
        queryLines.splice(lastPrefixLineIndex + 1, 0, selectCountClauseOpen);
        queryLines.push(selectCountClauseClose)
        return queryLines.join("\n")
    }

    toLimitOffsetQuery(query: string, offset: number, limit: number) : string {
        return query + ` LIMIT ${limit} OFFSET ${offset}`
    }
}

function getLastMatchLine (body : string, charOrString : string) {
    var char = (typeof charOrString === 'string') ? body.lastIndexOf(charOrString) : charOrString
    var subBody = body.substring(0, char)
    if (subBody === '') return undefined
    var match = subBody.match(/\n/gi)
    if (match) return match.length + 1
    return undefined
  }