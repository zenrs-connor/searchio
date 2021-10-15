import { SearchioResponse } from "../../../models/SearchioResponse";
import { WebElement } from "selenium-webdriver";
import { SocketService } from "../../SocketService";
import { PhoneInfogaProcess } from "./PhoneInfogaProcess";
import { PHONE_NUMBER } from "../../../assets/RegexPatterns";
import { NumberFormats } from "../../../models/NumberFormats";



export class PhoneInfogaSearch extends PhoneInfogaProcess {


    protected id = "PhoneInfogaSearch";           
    protected name: "Phone Number Search";
    protected pattern: RegExp = PHONE_NUMBER;
    


    //  Process extends the ResponseEmitter class, so be sure to include an argument for the socket
    //  Processes also take a query on creation
    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }



    //  Overwrite of the abstract function held in Process.ts
    //  This function is what is called when the Process executes
    //  It returns a SearchioResponse containing any success or error data
    protected async process(): Promise<SearchioResponse> {
        this.initWebdriver();
        let result = await this.search();
        this.destroyWebdriver();
        return result;
    }



    protected orIntextOne: string = "%22+OR+intext%3A%22%2B";
    protected orIntextTwo: string = "%22+OR+intext%3A%22";
    protected endQuotation: string = "%22";



    public async search(number: string = this.query): Promise<SearchioResponse> {
        try {
            let result: {
                socialMediaDorks: string[],
                footprintDorks?: string[],
                temporaryDorks?: string[]
            } = {
                socialMediaDorks: undefined
            }


            let numbers = await this.reformatNumber(number);
            let social = await this.generateSocialMediaDorks(numbers);
            result.socialMediaDorks = social;
            let footprint = await this.generateFootprintDorks(numbers)
            result.footprintDorks = footprint;
            let temp = await this.generateTemporaryDorks(numbers);
            result.temporaryDorks = temp;

            return this.success(`(PhoneInfogaSearch) Successfully completed number search`, result);

        } catch(err) {
            return this.success(`(PhoneInfogaSearch) Error completing number search`, err);
        }

    }

    public async generateSocialMediaDorks(numbers: NumberFormats): Promise<SearchioResponse> {
        let socialMediaDorks: string[] = [];
        try {
            let sites: String[] = [
                "https://www.google.com/search?q=site%3Afacebook.com+intext%3A%22",
                "https://www.google.com/search?q=site%3Atwitter.com+intext%3A%22",
                "https://www.google.com/search?q=site%3Alinkedin.com+intext%3A%22",
                "https://www.google.com/search?q=site%3Ainstagram.com+intext%3A%22",
                "https://www.google.com/search?q=site%3Avk.com+intext%3A%22"
            ]
            for(let i = 0; i< sites.length; i++){
                let site = sites[i];
                let link: string = site + numbers.international.slice(1,) + this.orIntextOne + numbers.international.slice(1,) + this.orIntextTwo + numbers.local + this.endQuotation;
                socialMediaDorks.push(link);
            }

            return this.success(`(PhoneInfogaSearch) Successfully completed generateSocialMediaDorks`, socialMediaDorks);

        } catch(err) {
            return this.error(`(PhoneInfogaSearch) Error completing generateSocialMediaDorks`, err);
        }
    }

    public async generateFootprintDorks(numbers: NumberFormats): Promise<SearchioResponse> {
        let footprintDorks: string[] = [];
        try {
            let sites: String[] = [
                "https://www.google.com/search?q=site%3Async.me+intext%3A%22",
                "https://www.google.com/search?q=site%3Apastebin.com+intext%3A%22",
                "https://www.google.com/search?q=site%3Alocatefamily.com+intext%3A%22",
                "https://www.google.com/search?q=site%3Awho-called.co.uk+intext%3A%22",
                "https://www.google.com/search?q=site%3Aspytox.com+intext%3A%22"
            ]
            for(let i = 0; i< sites.length; i++){
                let site = sites[i];
                let link: string = site + numbers.international.slice(1,) + this.orIntextOne + numbers.international.slice(1,) + this.orIntextTwo + numbers.local + this.endQuotation;
                footprintDorks.push(link);
            }
            
            return this.success(`(PhoneInfogaSearch) Successfully completed generateFootprintDorks`, footprintDorks);

        } catch(err) {
            return this.error(`(PhoneInfogaSearch) Error completing generateFootprintDorks`, err);
        }
        return(undefined);
    }

    public async generateTemporaryDorks(numbers: NumberFormats): Promise<SearchioResponse> {
        let temporaryDorks: string[] = [];
        try {

            let sites: String[] = [
                "https://www.google.com/search?q=site%3Areceive-sms-now.com+intext%3A%22",
                "https://www.google.com/search?q=site%3Agetfreesmsnumber.com+intext%3A%22",
                "https://www.google.com/search?q=site%3Asellaite.com+intext%3A%22",
                "https://www.google.com/search?q=site%3Areceive-sms-online.info+intext%3A%22",
                "https://www.google.com/search?q=site%3Areceive-a-sms.com+intext%3A%22",
                "https://www.google.com/search?q=site%3Asms-receive.net+intext%3A%22"
            ]
            for(let i = 0; i< sites.length; i++){
                let site = sites[i];
                let link: string = site + numbers.international.slice(1,) + this.orIntextOne + numbers.international.slice(1,) + this.orIntextTwo + numbers.local + this.endQuotation;
                temporaryDorks.push(link);
            }

            return this.success(`(PhoneInfogaSearch) Successfully completed generateTemporaryDorks`, temporaryDorks);
        
        } catch(err) {
            return this.error(`(PhoneInfogaSearch) Error completing generateTemporaryDorks`, err);
        }
    }
}