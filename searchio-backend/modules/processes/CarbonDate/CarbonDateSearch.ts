import { SearchioResponse } from "../../../models/SearchioResponse";
import { SocketService } from "../../SocketService";
import { EMAIL_ADDRESS } from "../../../assets/RegexPatterns";
import { CarbonDateProcess } from "./CarbonDateProcess";


export class CarbonDateSearch extends CarbonDateProcess {
    
    protected id = "CarbonDateSearch";
    protected name: "Carbon Date Search";
    protected pattern: RegExp = EMAIL_ADDRESS;
    
    
    //  Process extends the ResponseEmitter class, so be sure to include an argument for the socket
    //  Processes also take a query on creation
    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }


    //  Overwrite of the abstract function held in Process.ts
    //  This function is what is called when the Process executes
    //  It returns a SearchioResponse containing any success or error data
    public async process(): Promise<SearchioResponse> {
        this.initWebdriver(false);
        let result = await this.search();
        this.destroyWebdriver();
        return result;
    }

    // Load the search
    public async loadSearch(searchTerm: string = this.query): Promise<SearchioResponse> {
        try {
            await this.driver.get(`https://carbondate.cs.odu.edu/`);

            // Wait for element to load
            await this.waitForElement('//input[@id="input"]', 15);
            
            // Input the search term
            await this.driver.findElement(this.webdriver.By.xpath('//input[@id="input"]')).sendKeys(searchTerm);
            
            // Click search
            await this.driver.findElement(this.webdriver.By.xpath('//button[@id="submit"]')).click();
            
            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err);
        }
    }

    // Function to look at results
    public async scrapeResult(): Promise<SearchioResponse> {

        try {

            
            
            return this.success(`Successfully retrieved carbon date results`);

        } catch(err) {
            return this.error(`Error scraping carbon date results`, err);
        }
    }

    // Main function called to perform search
    public async search(searchTerm: string = this.query): Promise<SearchioResponse> {
        try{
            await this.loadSearch(searchTerm);

            await this.scrapeResult();

            await this.pause(5000);

            return this.success(`Successfully performed search on CarbonDate`);

        } catch(err) {
            return this.error(`Error searching CarbonDate`, err);
        }
    }

}