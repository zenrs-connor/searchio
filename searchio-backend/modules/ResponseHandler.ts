import { SearchioResponse } from "../models/SearchioResponse";

export function success(message: string, data: any = undefined): SearchioResponse {
    return { success: true, message: message, data: data }
}

export function error(message: string, data: any = undefined, verbose: boolean = true): SearchioResponse {

    if(verbose) console.log(`ERROR: ${message}`);
    if(verbose && data) console.log("ERROR: ", data);

    return { success: false, message: `ERROR: ${message}`, data: data }
}