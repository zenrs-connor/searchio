import { ResultDataTypeName } from "../types/ResultDataTypeName";

export interface ResultDataType {
    id: ResultDataTypeName;           //  A name from a specified list of result types, such as "WebPage", "Location", "IPAddress"
    keys: string[];               //  An aray of keys to be expected by this result type, for example in the case of "WebPage": ["title", "snippet", "url"]
    description: string;          //  A breif description of this data type to be used in hovercards
}