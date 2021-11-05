export class UrlParser {
    getHost(string : string) {
        const hostRegex = new RegExp(
            /((?<=:\/\/)((\w|\.)+)(?=(\/|:|\b)(\w|\b))|^(\w|\.)+(?!\w*:\/\/))/gm
        );
        const matches = string.match(hostRegex)
        return matches ? matches[0] : undefined
    }
    getPath(string : string) {
        const pathRegex = new RegExp(/(?<=((\w|\.)+))\/(\w|\/|\.)+/gm);
        const matches = string.match(pathRegex)
        return matches ? matches[0] : undefined
    }
}