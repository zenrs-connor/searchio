import { EmailAddressStream } from "./EmailAddressStream";

export class HunterStream extends EmailAddressStream {
    constructor() {
        super();
        this.tags.push("hunter");
        console.log(this.tags);
    }
}