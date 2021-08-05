import { UrlParser } from './UrlParser';

const urlParser = new UrlParser();
describe('UrlParser extract information from a url:', () => {
    test('It should return host localhost from: https://localhost:8080/sparql', () => {
        const url = 'https://localhost:8080/sparql';
        const host = urlParser.getHost(url);
        expect(host).toBe('localhost');
    });
    test('It should return host dati.beniculturali.it from: dati.beniculturali.it/sparql', () => {
        const url = 'dati.beniculturali.it/sparql';
        const host = urlParser.getHost(url);
        expect(host).toBe('dati.beniculturali.it');
    });
    test('It should return path /public/sparql from: dati.beniculturali.it/public/sparql', () => {
        const url = 'dati.beniculturali.it/public/sparql';
        const path = urlParser.getPath(url);
        expect(path).toBe('/public/sparql');
    });
    test('It should return path /public/endpoints/sparql from: http://dati.beniculturali.it:4000/public/endpoints/sparql', () => {
        const url = 'http://dati.beniculturali.it:4000/public/endpoints/sparql';
        const path = urlParser.getPath(url);
        expect(path).toBe('/public/endpoints/sparql');
    });
});
