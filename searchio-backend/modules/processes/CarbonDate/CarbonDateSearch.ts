import { SearchioResponse } from "../../../models/SearchioResponse";
import { SocketService } from "../../SocketService";
import { DOMAIN, EMAIL_ADDRESS } from "../../../assets/RegexPatterns";
import { CarbonDateProcess } from "./CarbonDateProcess";
import { ResultData } from "../../../models/ResultData";


export class CarbonDateSearch extends CarbonDateProcess {
    
    protected id = "CarbonDateSearch";
    protected name: string = "Search";
    protected pattern: RegExp = DOMAIN;
    
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
            await this.driver.get(`https://carbondate.cs.odu.edu/`);

            // Wait for element to load
            await this.waitForElement('//input[@id="input"]', 15);
            
            // Input the search term
            let input = await this.driver.findElement(this.webdriver.By.xpath('//input[@id="input"]'));
            this.driver.executeScript("arguments[0].setAttribute('value', arguments[1])", input, searchTerm);
            
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
            // Wait for result to load in
            await this.waitForElement('/html/body/div/div[2]/pre', 60);
            
            // Check result element is present
            let result = await this.driver.findElements(this.webdriver.By.xpath('/html/body/div/div[2]/pre'));
            
            // If it is present, get the results
            if (result.length > 0) {
                
                result = await result[0].getText();
                result = JSON.parse(result);
                return this.success(`Successfully retrieved carbon date results`, result);

            // Else check if an error occured and what type of error
            } else {

                let errorCheck = await this.driver.findElement(this.webdriver.By.xpath('/html/body/div/div[2]')).getText();

                if(errorCheck == 'REQUEST ERROR') {
                    
                    return this.error(`Request error when trying to carbon date`);
                
                } else if(errorCheck == 'Loading please wait...') {
                    
                    return this.error(`Request timed out when trying to carbon date`);
                
                } else {
                    
                    return this.error(`Unknown error when trying to carbon date`);
                }
            }

        } catch(err) {
            return this.error(`Error scraping carbon date results`, err);
        }
    }

    // Main function called to perform search
    public async search(searchTerm: string = this.query): Promise<SearchioResponse> {
        try{
            await this.loadSearch(searchTerm);

            let scrape = await this.scrapeResult();

            await this.pause(5000);

            let results: ResultData[] = [];

            console.log(scrape.data);

            results.push({
                name: "Estimated Creation Date",
                type: "Date",
                data: scrape.data['estimated-creation-date']
            });

            const table = {
                columns: [
                    { title: 'Source', key: 'source', type: "Text" },
                    { title: 'Link', key: 'link', type: "WebLink" },
                    { title: 'Earliest', key: 'earliest', type: "Date" },
                ],
                rows: []
            }

            let obj;
            for(let key of Object.keys(scrape.data.sources)) {

                obj = scrape.data.sources[key];

                table.rows.push({
                    source: key,
                    link: { text: "Link", url: obj['uri-m'] },
                    earliest: obj.earliest
                })
            }

            results.push({
                name: "Sources",
                type: "Table",
                data: table
            });


            return this.success(`Successfully performed search on CarbonDate`, results);

        } catch(err) {
            return this.error(`Error searching CarbonDate`, err);
        }
    }

}