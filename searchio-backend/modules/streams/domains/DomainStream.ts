import { StreamTag } from "../../../types/StreamTag";
import { Stream } from "../Stream";


export class DomainStream extends Stream {

    protected tags: StreamTag[] = ["domain"];

    protected domain: string;

    constructor(url: string) { super(url); }

    public async extractDomain(url: string) {
        // Mobile Phone Formats
        let domainPattern: RegExp = /^(?:.*:\/\/)?(?:www\.)?([^:\/]*).*$/;

        await new Promise((resolve) => {
            this.domain = url.match(domainPattern)[1];
            console.log("DOMAIN EXTRACTED: " + this.domain);
            resolve(undefined);
        });
        return(this.domain);
    }

}