import { SearchioResponse } from "../../../models/SearchioResponse";
import { SocketService } from "../../SocketService";
import { EMAIL_ADDRESS } from "../../../assets/RegexPatterns";
import { EmailRepProcess } from "./EmailRepProcess";


export class EmailRepSearch extends EmailRepProcess {
    
    protected id = "EmailRepSearch";
    protected name: "EmailRep Search";
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
        //this.destroyWebdriver();
        return result;
    }

    // Load the search
    public async loadSearch(searchTerm: string = this.query): Promise<SearchioResponse> {
        try {
            await this.driver.get(`https://emailrep.io/`);

            // Wait for element to load
            await this.waitForElement('//input[@id="search-input"]', 15);
            
            // Input the search term
            await this.driver.findElement(this.webdriver.By.xpath('//input[@id="search-input"]')).sendKeys(searchTerm);
            
            // Click search
            await this.driver.findElement(this.webdriver.By.xpath('//span[@class="input-group-btn"]/button')).click();
            
            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err);
        }
    }

    // Function to look at results
    public async scrapeResult(): Promise<SearchioResponse> {

        try {

            // Wait for result to load in
            await this.waitForElement('//div[@id="result"]', 15)

            
            let reputation = await this.driver.findElement(this.webdriver.By.xpath('//div[@id="result"]/h1[@id="reputation"]')).getText();
            let explainer = await this.driver.findElement(this.webdriver.By.xpath('//div[@id="result"]/div[@id="explainer"]')).getText();

            let emailReputationFormat: {   
                reputation: string, 
                explainer?: string

            } = {
                reputation: undefined
            };

            emailReputationFormat.reputation = reputation;
            emailReputationFormat.explainer = explainer;
            
            return this.success(`Successfully retrieved reputation for email`, emailReputationFormat);

        } catch(err) {
            return this.error(`Error scraping reputation on this page`, err);
        }
    }

    // Main function called to perform search
    public async search(searchTerm: string = this.query): Promise<SearchioResponse> {
        try{
            await this.loadSearch(searchTerm);

            let scrape = await this.scrapeResult();

            await this.pause(5000);

            console.log(scrape);

            return this.success(`Successfully performed search on EmailRep`, scrape.data);

        } catch(err) {
            return this.error(`Error searching EmailRep`, err);
        }
    }

}