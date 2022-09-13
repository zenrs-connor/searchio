import { SearchioResponse } from "../../../models/SearchioResponse";
import { SocketService } from "../../SocketService";
import { NAMES } from "../../../assets/RegexPatterns";
import { CheckUsernamesProcess } from "./CheckUsernamesProcess";
import { ResultData } from "../../../models/ResultData";
import { WebLink } from "../../../models/WebLink";


export class CheckUsernamesSearch extends CheckUsernamesProcess {
    
    protected id = "CheckUsernamesSearch";
    protected name: string =  "Search";
    protected pattern: RegExp = NAMES;

    public table = {

        columns: [
            { title: "Website", key: "website", type: "Text" },
            { title: "Link", key: "link", type: "WebLink" }
        ],
        rows: []
    }
    
    
    //  Process extends the ResponseEmitter class, so be sure to include an argument for the socket
    //  Processes also take a query on creation
    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }


    //  Overwrite of the abstract function held in Process.ts
    //  This function is what is called when the Process executes
    //  It returns a SearchioResponse containing any success or error data
    public async process(): Promise<SearchioResponse> {
        this.initWebdriver();
        let result = await this.search();
        this.destroyWebdriver();
        return result;
    }

    // Load the search
    public async loadSearch(searchTerm: string = this.query): Promise<SearchioResponse> {
        try {
            await this.driver.get(`https://checkusernames.com/`);

            // Wait for element on name page to load
            await this.waitForElement('//input[@id="username"]', 15);
            
            // Input the search term
            await this.driver.findElement(this.webdriver.By.xpath('//input[@id="username"]')).sendKeys(searchTerm);
            
            // Click search
            await this.driver.findElement(this.webdriver.By.xpath('//input[@id="checker"]')).click();
            
            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err);
        }
    }

    // Wait for results
    public async waitForResults(): Promise<SearchioResponse> {

        try {
            await this.waitForElement('//div[@id="content"]', 15);
            
            // Loop until we have processed all resources
            return new Promise(async resolve => {
                let iterations = 0;
                let seconds = 150;
                
                const interval = setInterval( async () => {

                    iterations++;

                    let processing = await this.driver.findElements(this.webdriver.By.xpath('//img[starts-with(@alt,"Processing ...")]'));

                    if (processing.length == 0) {
                        clearInterval(interval);
                        resolve(undefined);
                        return this.success(`Successfully waited and recieved all results of resources`);
                    }


                    if(iterations >= seconds) {
                        clearInterval(interval);
                        resolve(undefined);
                        return this.error(`Error waiting for results from resources`);
                    }
                }, 1000);
                
            });
    
        } catch(err) {
            return this.error(`Error scraping entities on this page`, err);
        }
    }

    // Function to look at results
    public async scrapeResults(): Promise<SearchioResponse> {

        try {
            await this.waitForResults();

            // Check if there are any results
            let results = await this.driver.findElements(this.webdriver.By.xpath('//ul[@class="socialsite"]/li'));
            
            for(let result of results) {
                
                let status = await result.findElement(this.webdriver.By.xpath('.//span[@class="inner"]/span')).getAttribute('class');
                // If this resource has username available (not interested)
                if(status == "popup") {

                // If this resource does not have username available (interested), capture resource name and link
                } else if(status == "notavailable popup") {
                    
                    let site = await result.getText();
                    let siteChild = await result.findElement(this.webdriver.By.xpath('.//span[@class="inner"]')).getText();
                    site = site.replace(siteChild, '');
                    let link = await result.findElement(this.webdriver.By.xpath('.//span[@class="inner"]/span/a')).getAttribute('href');

                    this.table.rows.push({
                        website: site,
                        link: { text: link, url: link } as WebLink
                    });


                // Error has occured
                } else if(status == "error") {

                } else {
                    return this.error(`Error scraping entities on this page`);
                }
            }
            


            return this.success(`Successfully waited and recieved all results of resources`);

        } catch(err) {
            return this.error(`Error scraping entities on this page`, err);
        }
    }

    // Main function called to perform search
    public async search(searchTerm: string = this.query): Promise<SearchioResponse> {
        try{
            await this.loadSearch(searchTerm);

            await this.scrapeResults();

            await this.pause(15000);

            let results: ResultData[] = [{
                name: `Instances of Username ${ this.query }`,
                type: "Table",
                data: this.table
            }];

            

            return this.success(`Successfully performed search on WhatsMyName`, results);

        } catch(err) {
            return this.error(`Error searching WhatsMyName`, err);
        }
    }

}