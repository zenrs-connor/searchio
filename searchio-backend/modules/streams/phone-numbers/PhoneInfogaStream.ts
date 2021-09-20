import { PhoneNumberStream } from "./PhoneNumberStream";

export class PhoneInfogaStream extends PhoneNumberStream {
    
    constructor() { 
        super(); 
        this.tags.push("google");
    }

}