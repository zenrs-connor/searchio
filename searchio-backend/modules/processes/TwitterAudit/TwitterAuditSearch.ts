import { SearchioResponse } from "../../../models/SearchioResponse";
import { SocketService } from "../../SocketService";
import { ANY } from "../../../assets/RegexPatterns";
import { TwitterAuditProcess } from "./TwitterAuditProcess";
import { urlToHttpOptions } from "url";


export class TwitterAuditSearch extends TwitterAuditProcess {
    
    protected id = "TwitterAuditSearch";
    protected name: "Twitter Audit Search";
    protected pattern: RegExp = ANY;
    
    
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
            await this.driver.get(`https://twitteraudit.com/${searchTerm}`);
            
            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err);
        }
    }


    // Function to look at results
    public async scrapeAudit(): Promise<SearchioResponse> {

        try {
            // Wait for the report to load
            await this.waitForElement('//div[@class="display--flex  flex-wrap--wrap  flex-justify-content--center  grid--100  margin--bottom-huge"]', 15);

            // If a result did appear
            let check = await this.driver.findElements(this.webdriver.By.xpath('//div[@class="display--flex  flex-wrap--wrap  flex-justify-content--center  grid--100  margin--bottom-huge"]'));
            if (check.length > 0) {

                let auditFormat: {   
                    numberReal: string, 
                    numberFake?: string,
                    lastAuditText?: string,
                    lastAuditDate?: Date
    
                } = {
                    numberReal: undefined
                };
                
                let numberReal = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="pie-data  display--flex  flex-wrap--wrap  flex-align-content--center  flex-align-items--center  grid--grow  margin--left-smaller"]/p/span[@class="real number"]')).getText();
                let numberFake = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="pie-data  display--flex  flex-wrap--wrap  flex-align-content--center  flex-align-items--center  grid--grow  margin--left-smaller"]/p[2]/span[@class="fake number"]')).getText();

                let lastAuditText = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="display--flex  flex-align-items--center  grid--100"]/p[@class="text--right  grid--grow"]/span')).getText();
                let lastAuditDate = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="display--flex  flex-align-items--center  grid--100"]/p[@class="text--right  grid--grow"]/span')).getAttribute('title');

                auditFormat.numberReal = numberReal;
                auditFormat.numberFake = numberFake;
                auditFormat.lastAuditText = lastAuditText;
                auditFormat.lastAuditDate = lastAuditDate;

                return this.success(`Successfully scraped audit`, auditFormat);
            } else {
                return this.error(`Error finding the audit for account`);
            }


        } catch(err) {
            return this.error(`Error attempting to scrape audit`, err);
        }
    }

    // Main function called to perform search
    public async search(searchTerm: string = this.query): Promise<SearchioResponse> {
        try{
            await this.loadSearch(searchTerm);

            let audit = await this.scrapeAudit();

            await this.pause(5000);

            return this.success(`Successfully preformed search on Twitter Audit`, audit.data);

        } catch(err) {
            return this.error(`Error preforming search on Twitter Audit`, err);
        }
    }

}