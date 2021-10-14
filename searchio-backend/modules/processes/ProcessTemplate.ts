import { SearchioResponse } from "../../models/SearchioResponse";
import { DataSourceName } from "../../types/DataSourceName";
import { SocketService } from "../SocketService";
import { Process } from "./Process";


/*
    This class serves as an example of what needs to be done to create a new Process
    Each process performs only one function, which should be contained in process() 
*/



//  Export a new class (the filename should be the same as this) which extends the Process superclass
export class TemplateProcess extends Process {

    /* 
        Variables that require definition 
    */

    protected id = "TemplateProcess";                   //  The ID of a Process should be the same as the class name
    protected source: DataSourceName = "Unknown";       //  Define which source this process calls upon
    protected name: "Template Process";                 //  Provide a user-readble name for this process.
    protected pattern: RegExp = /^$/;                   //  Assign a valid regex pattern to match against potential queries

    //  Process extends the ResponseEmitter class, so bve sure to include an argument for the socket
    //  Processes also take a query on creation
    constructor(socket: SocketService, query: string) {
        super(socket);
    }

    //  Overwrite of the abstract function held in Process.ts
    //  This function is what is called when the Process executes
    //  It returns a SearchioResponse containing any success or error data
    protected async process(): Promise<SearchioResponse> {

        //  Remember to use proper error handling
        try {

            //  Feel free to update the status of the process, but remember that these messages will be user-facing.
            this.setStatus("ACTIVE", `Scraping thing...`)

            //  Perform the process
            await this.scrapeThing();
            
            //  Feel free to update the status of the process, but remember that these messages will be user-facing.
            this.setStatus("ACTIVE", `Scraped thing, rejigging format... `)

            let results = await this.rejigFormat();

            this.setStatus("COMPLETED");

            // On a success, return a SerchioResponse using this.success
            return this.success("Completed process!", results);

        } catch(err) {

            this.setStatus("ERROR");

            //  In the event of a non-SearchioResponse error, format its contents and retrun a this.error
            return this.error("Unknown Error!", err)
        }

    }


    /*
    
    ADDITIONAL FUNCTIONS 
    
    */

    private async scrapeThing() {}
    private async rejigFormat() {}


}