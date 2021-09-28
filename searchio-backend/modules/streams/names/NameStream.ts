import { StreamTag } from "../../../types/StreamTag";
import { Stream } from "../Stream";

export class NameStream extends Stream {
    protected tags: StreamTag[] = ["name"];

    constructor(query: string) { super(query); }

    public reformatName(name: string) {
        // Code to reformat the name into different variations
    }
}