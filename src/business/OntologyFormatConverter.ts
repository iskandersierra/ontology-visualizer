import { IOntologyFormatConverter, OntologyFileFormat } from "./OntologyFileFormat";
import { IN3Reader, IN3Writer } from "./IN3Serialization";

export class OntologyFormatConverter implements IOntologyFormatConverter {
    constructor(
        private reader: IN3Reader,
        private writer: IN3Writer) {

        if (!reader) {
            throw new Error('reader not specified');
        }

        if (!writer) {
            throw new Error('writer not specified');
        }
    }

    public async convertOntology(
        content: string,
        baseUri: string,
        sourceFormat: OntologyFileFormat,
        targetFormat: OntologyFileFormat)
        : Promise<string | undefined> {
            
        const [quads, prefixes] = await this.reader.read(content, baseUri, sourceFormat);

        return await this.writer.write(quads, prefixes, targetFormat);
    }
}
