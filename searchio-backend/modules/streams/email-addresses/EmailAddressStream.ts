import { StreamTag } from "../../../types/StreamTag";
import { Stream } from "../Stream";

export class EmailAddressStream extends Stream {
    protected tags: StreamTag[] = ["email-address"];

    constructor() { super(); }

}