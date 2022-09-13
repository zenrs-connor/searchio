import { SearchioResponse } from "../../../models/SearchioResponse";
import { SocketService } from "../../SocketService";
import { NAMES } from "../../../assets/RegexPatterns";
import { BarredPoliceListProcess } from "./BarredPoliceListProcess";
import { ResultData } from "../../../models/ResultData";


export class BarredPoliceListSearch extends BarredPoliceListProcess {
    
    protected id = "BarredPoliceListSearch";
    protected name: string = "Officer Search";
    protected pattern: RegExp = NAMES;

    public table = {

        columns: [
            { title: "Name", key: "name", type: "Text" },
            { title: "Force", key: "force", type: "Text" },
            { title: "Type", key: "type", type: "Text" },
            { title: "Rank", key: "rank", type: "Text" },
            { title: "Date of Finding", key: "date", type: "Text" },
            { title: "Reasoning", key: "reasoning", type: "Text" },
            { title: "Link", key: "link", type: "Text" }
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
            await this.driver.get(`https://www.college.police.uk/ethics/barred-list/search-the-barred-list`);

            // Wait for element on name page to load
            await this.waitForElement('//input[@id="edit-search-api-fulltext"]', 15);
            
            // Input the search term
            await this.driver.findElement(this.webdriver.By.xpath('//input[@id="edit-search-api-fulltext"]')).sendKeys(searchTerm);
            
            // Click search
            await this.driver.findElement(this.webdriver.By.xpath('//input[@id="edit-submit-barred-list-search-api"]')).click();
            
            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err);
        }
    }

    // Function to scrape results
    public async scrapeTable(): Promise<SearchioResponse> {

        try {

            // Check if there are any results
            let tableRows = await this.driver.findElements(this.webdriver.By.xpath('//div[@class="view-content"]/table/tbody/tr'));


            
            // If we have more than one result
            if(tableRows.length > 1) {
                // Iterate through each result and just get the name and link
                for(let tableRow of tableRows){
                    let name = tableRow.findElement(this.webdriver.By.xpath('./td')).getText();
                    let link = tableRow.findElement(this.webdriver.By.xpath('./td/a')).getAttribute('href');

                    this.table.rows.push({
                        name: name,
                        link: link
                    });
                }
                return this.success(`Successfully scraped partial of multiple results`);

            // If we have just one result
            } else if (tableRows.length == 1) {
                
                // Get name and link
                let name = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="view-content"]/table/tbody/tr/td')).getText();
                let link = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="view-content"]/table/tbody/tr/td/a')).getAttribute('href');
                
                console.log(name, link);

                // Click the one result so that we can get more info
                await this.driver.findElement(this.webdriver.By.xpath('//div[@class="view-content"]/table/tbody/tr/td/a')).click();
                this.pause(3000);
                await this.waitForElement('//article[@class="node node--type-dismissal node--view-mode-full"]', 15);
            
                // Get the extra details
                let force = await this.driver.findElement(this.webdriver.By.xpath('//article[@class="node node--type-dismissal node--view-mode-full"]/div[@class="col10"]/table/tbody/tr[4]/td')).getText();
                let type = await this.driver.findElement(this.webdriver.By.xpath('//article[@class="node node--type-dismissal node--view-mode-full"]/div[@class="col10"]/table/tbody/tr[5]/td')).getText();
                let rank = await this.driver.findElement(this.webdriver.By.xpath('//article[@class="node node--type-dismissal node--view-mode-full"]/div[@class="col10"]/table/tbody/tr[6]/td')).getText();
                let date = await this.driver.findElement(this.webdriver.By.xpath('//article[@class="node node--type-dismissal node--view-mode-full"]/div[@class="col10"]/table/tbody/tr[7]/td')).getText();
                let reasoning = await this.driver.findElement(this.webdriver.By.xpath('//article[@class="node node--type-dismissal node--view-mode-full"]/div[@class="col10"]/table/tbody/tr[8]/td')).getText();

                this.table.rows.push({
                    name: name,
                    force: force,
                    type: type,
                    rank: rank,
                    date: date,
                    reasoning: reasoning,
                    link: link
                });
                
                console.log(this.table);

                return this.success(`Successfully scraped the only result in detail`);

            // Else something has gone wrong
            } else {
                return this.error(`Error has occured scraping the table of results`);
            }

        } catch(err) {
            return this.error(`Error scraping entities on this page`, err);
        }
    }

    // Function to look at results
    public async scrapeResults(): Promise<SearchioResponse> {

        try {
            await this.waitForElement('//div[@class="views-element-container"]', 15);
            
            // Check if there are any results
            let check = await this.driver.findElements(this.webdriver.By.xpath('//div[@class="view-empty"]'));

            if(check.length > 0){
                return this.success(`There were no results matching the search term`);
            } else {
                await this.scrapeTable();

                return this.success(`Successfully scraped the results`);
            }

        } catch(err) {
            return this.error(`Error scraping entities on this page`, err);
        }
    }

    // Main function called to perform search
    public async search(searchTerm: string = this.query): Promise<SearchioResponse> {
        try{
            await this.loadSearch(searchTerm);

            await this.scrapeResults();

            console.log("TABLE");
            console.log(this.table);

            let results: ResultData[] = [
                { name: "Results", type: "Table", data: this.table }
            ]

            await this.pause(15000);

            return this.success(`Successfully performed search on Barred Police List`, results);

        } catch(err) {
            return this.error(`Error searching Barred Police List`, err);
        }
    }

}