import { StreamTag } from "../../../types/StreamTag";
import { Stream } from "../Stream";

export class BusinessStream extends Stream {
    protected tags: StreamTag[] = ["business"];

    constructor(query: string) { super(query); }

    public async reformat(business: string) {
        // Code to take in comapny name and get it into the format ready to be inserted into URL

        await new Promise((resolve) => {
           business = business.replace(/\s/g, "+");
           resolve(undefined)
        });
        console.log(business);
        return(business);
    }
}