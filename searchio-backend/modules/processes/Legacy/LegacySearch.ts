import { SearchioResponse } from "../../../models/SearchioResponse";
import { LegacyProcess } from "./LegacyProcess";
import { SocketService } from "../../SocketService";
import { NAMES } from "../../../assets/RegexPatterns";


const request = require('request');

export class LegacySearch extends LegacyProcess {
    
    protected id = "LegacySearch";           
    protected name: "Legacy Search";
    protected pattern: RegExp = NAMES;

    public table = {

        columns: [
            { title: "Name", key: "name", type: "Text" },
            { title: "Date", key: "date", type: "Text" },
            { title: "Location", key: "location", type: "Text" }
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
        this.initWebdriver(false);
        let result = await this.search();
        this.destroyWebdriver();
        return result;
    }

    // Function to load search
    public async loadSearch(query: string): Promise<SearchioResponse> {

        try {
            query = query.replace(' ', '+');

            await this.driver.get(`https://www.legacy.com/uk/announcements/search/?q=${query}`);
            
            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err)
        }
    }

    // Function to strip death notices on a page
    public async stripPage(elements: any): Promise<SearchioResponse> {

        try {
            for(let element of elements) {
                let name = await element.findElement(this.webdriver.By.xpath('.//div[@class="result__text__name"]')).getText();
                let date = await element.findElement(this.webdriver.By.xpath('.//div[@class="result__text__dates"]')).getText();
                let location = await element.findElement(this.webdriver.By.xpath('.//div[@class="result__text px-3"]/div[3]')).getText();

                this.table.rows.push({
                    name: name,
                    date: date,
                    location: location
                });
            }

            return this.success(`Successfully stripped page`);

        } catch(err) {
            return this.error(`Error stripping page`, err)
        }
    }

    // Function to strip pages
    public async stripPages(pageLimit: number = 3): Promise<SearchioResponse> {

        try {

            await this.pause(3000)

            let cookiesButton = await this.driver.findElements(this.webdriver.By.xpath('//button[@id="onetrust-accept-btn-handler"]'));
            if(cookiesButton.length > 0) {
                await this.driver.findElement(this.webdriver.By.xpath('//button[@id="onetrust-accept-btn-handler"]')).click();
            }

            let elements = await this.driver.findElements(this.webdriver.By.xpath('//div[@class="flex-grow"]/a'));
            await this.stripPage(elements);


            let nextButton = await this.driver.findElements(this.webdriver.By.xpath('//a[@class="pagination__button button button--secondary"]'));
            // Check if there is more than one page
            if(nextButton.length > 0) {
                await this.driver.findElement(this.webdriver.By.xpath('//a[@class="pagination__button button button--secondary"]')).click();

                // Start iterating through the pages
                for(let pageNo = 1; pageNo < pageLimit; pageNo++) {
                    // Collect the death notices
                    let elements = await this.driver.findElements(this.webdriver.By.xpath('//div[@class="flex-grow"]/a'));
                    // Strip them (this is the function where they are added to the table)
                    await this.stripPage(elements);

                    // Start looking for the next button
                    nextButton = await this.driver.findElements(this.webdriver.By.xpath('//a[@class="pagination__button button button--secondary"]'));
                    // If there is only one it will be the prev button
                    if(nextButton.length == 1) {
                        break;
                    // If there is two click the second one
                    } else if(nextButton.length == 2) {
                        await nextButton[1].click();
                    // Else something has gone wrong
                    } else {
                        break;
                    }
                }

                return this.success(`Successfully stripped all pages`);
            // If there is no next page button (just one page of results)
            } else {

                return this.success(`Successfully stripped all pages`);

            }

        } catch(err) {
            return this.error(`Error stripping all pages`, err)
        }
    }


    // Main function to call (calls all others)
    public async search(query: string = this.query): Promise<SearchioResponse> {
        
        try {
            await this.loadSearch(query);

            await this.stripPages();

            return this.success(`Successfully completed searched for ${this.query}`, this.table);

        } catch(err) {
            console.log(err)
            return this.error(`Error completing search for ${this.query}`, err);
        }
    }

}