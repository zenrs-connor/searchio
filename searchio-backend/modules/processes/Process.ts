import { ProcessData } from "../../models/ProcessData";
import { SearchioResponse } from "../../models/SearchioResponse";
import { DataSourceName } from "../../types/DataSourceName";
import { ProcessCode, ProcessStatus, ProcessStatusCodeEnum } from "../../types/ProcessStatusCode";
import { ResponseEmitter } from "../ResponseEmitter";
import { SocketService } from "../SocketService";

//  Class to control each individual process held by a Stream
//  This 

export class Process extends ResponseEmitter {

    protected id: string = "Unnamed Process"                    //  ID defined in each child class
    protected query: string = "";                               //  Query that the process is acting upon
    protected source: DataSourceName = "Unnamed Source";        //  Source that this process is called from
    protected name: string = "Unnamed Process"                  //  The name of the process - should be all lowercase with words separated by spaced
    protected status: ProcessStatus = "DORMANT";                //  Status code - for reference check the StreamStatusCode.ts type
    protected code: ProcessCode = 1;                            //  Status code - for reference check the StreamStatusCode.ts type
    protected message: string = "Awaiting instruction...";      //  A message to describe the current status of this process
    protected pattern: RegExp = /^$/;

    constructor(socket: SocketService, query: string = "") {
        super(socket);
        this.query = query;
    }

    public getPattern(): RegExp { return this.pattern; }

    //  Sets the status of this process and emits its new Status
    public setStatus(code: ProcessCode | ProcessStatus, message: string = "") {

        //  Predending on the type of code provided
        if(typeof code === "number") {
            //  Update the code values
            this.code = code;
            this.status = ProcessStatusCodeEnum[code] as ProcessStatus;
        } else {
            //  Update the code values
            this.status = code;
            this.code = ProcessStatusCodeEnum[code] as ProcessCode;
        }

        //  If no message has been provided
        if(message === "") {

            //  Update message to a default value
            switch(this.status) {
                case "DORMANT":
                    this.message = "Awaiting command..."
                    break;
                case "ACTIVE":
                    this.message = "Executing process..."
                    break;
                case "COMPLETED":
                    this.message = "Process complete!"
                    break;
                case "ERROR":
                    this.message = "Error!"
                    break;
            }

        } else {
            //  Else update the message
            this.message = message;
        }

        //  Emit the updated data to the socket
        this.socket.processUpdate(this.getData());

    }

    //  Returns the current state of the Process
    public getData(): ProcessData {
        return {
            query: this.query,
            source: this.source,
            name: this.name,
            status: this.status,
            code: this.code,
            message: this.message
        }
    }


    //  Start the process
    public async execute() {


        console.log("EXECUTING!");

        this.setStatus("ACTIVE");

        try {
            let result = await this.process();
            if(result.success) {
                this.setStatus("COMPLETED", result.message);
            } else {
                this.setStatus("ERROR", result.message);
            }
        } catch(err) {
            this.setStatus("ERROR", JSON.stringify(err))
        }

    }


    //  ABSTRACT FUNCTION!
    //  This function is the meat of the whole class
    //  Each child of this class should define its singular functionality functionality
    protected async process(): Promise<SearchioResponse> {
        return this.success("Success!");
    }

} 