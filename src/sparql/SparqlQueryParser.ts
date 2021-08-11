export class SparqlQueryParser {
    toCountResultsQuery(query: string) : string | undefined {
        
        const lastPrefixLineIndex = getLastMatchLine(query, "PREFIX")

        if (!lastPrefixLineIndex) {
            return undefined
        }

        const queryLines = query.split("\n")

        queryLines.splice(lastPrefixLineIndex + 1, 0, "SELECT (COUNT(*) as ?count) WHERE { \n");
        queryLines.push(" \n }")
        return queryLines.join("\n")
    }
}

function getLastMatchLine (body : string, charOrString : string) {
    if (!body) return undefined
    if (!charOrString) return undefined
    var char = (typeof charOrString === 'string') ? body.lastIndexOf(charOrString) : charOrString
    var subBody = body.substring(0, char)
    if (subBody === '') return undefined
    var match = subBody.match(/\n/gi)
    if (match) return match.length + 1
    return undefined
  }