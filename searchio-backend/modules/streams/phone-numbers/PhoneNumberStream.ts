import { StreamTag } from "../../../types/StreamTag";
import { Stream } from "../Stream";

export class PhoneNumberStream extends Stream {
    protected tags: StreamTag[] = ["phone-number"];
    
    constructor() { super(); }

    public reformatNumber(number: string) {
        // CODE TO REFORMAT PHONE NUMBERS INTO ALL POSSIBLE FORMATS (LOCAL, DOMESTIC AND INTERNATIONAL)
    }
}