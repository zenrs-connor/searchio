import { SearchioResponse } from "../../../models/SearchioResponse";
import { SocketService } from "../../SocketService";
import { ANY } from "../../../assets/RegexPatterns";
import { WaybackMachineProcess } from "./WaybackMachineProcess";
import { urlToHttpOptions } from "url";


export class WaybackMachineSearch extends WaybackMachineProcess {
    
    protected id = "WaybackMachineSearch";
    protected name: "Wayback Machine Search";
    protected pattern: RegExp = ANY;

    public table = {

        columns: [
            { title: "Archive Date", key: "date", type: "Text" },
            { title: "URL Link", key: "link", type: "Text" }
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
        //this.destroyWebdriver();
        return result;
    }

    // Load the search
    public async loadSearch(searchTerm: string = this.query): Promise<SearchioResponse> {
        try {
            await this.driver.get(`https://web.archive.org/web/*/${searchTerm}`);
            
            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err);
        }
    }

    // Function to look at results
    public async scrapeYear(): Promise<SearchioResponse> {

        try {
            // Wait for year to load in
            await this.waitForElement('//div[@class="calendar-grid"]', 15);

            // Collect all the days that contain an archive
            let archivedDays = await this.driver.findElements(this.webdriver.By.xpath('//div[@class="calendar-day "]'));

            // Iterate through all of the days
            for(let day of archivedDays) {

                // Pause for 6 seconds
                await this.pause(6000);
                
                // String/Script used to move mouse to element
                let mouseOverScript = "if(document.createEvent){var evObj = document.createEvent('MouseEvents');evObj.initEvent('mouseover', true, false); arguments[0].dispatchEvent(evObj);} else if(document.createEventObject) { arguments[0].fireEvent('onmouseover');}";

                let complete = false;

                // While loop to hover mouse until collected links
                while(complete == false) {

                    // Hover mouse over the day to open up 'dayPopup' 
                    await this.driver.executeScript(mouseOverScript, day);

                    // Scrape the date and links for the archives that day
                    let links = await this.driver.findElements(this.webdriver.By.xpath('//ul[@class="day-tooltip-shapshot-list"]/div/div/li'));
                    let date = await this.driver.findElement(this.webdriver.By.xpath('//header[@class="day-tooltip-title"]')).getText();
                    
                    // Iterate through the links collecting the href's
                    if(links.length > 0) {
                        for(let link of links) {
                            let urlText = await link.findElement(this.webdriver.By.xpath('./a')).getText();
                            let urlLink = await link.findElement(this.webdriver.By.xpath('./a')).getAttribute('href');
                            
                            // Add the archive link and date/time to table
                            this.table.rows.push({
                                date: date + ' at ' + urlText,
                                link: urlLink
                            });
                        }
                        complete = true;
                    }
                    
                }

                // Move mouse away as can become stuck on archived day
                let away = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="month-title"]'))
                await this.driver.executeScript(mouseOverScript, away);
                

            }

            return this.success(`Successfully scraped the archive dates and links for this year`);

        } catch(err) {
            return this.error(`Error scraping this year`, err);
        }
    }

    // Function to look at results
    public async scrapeYears(): Promise<SearchioResponse> {

        try {
            await this.waitForElement('//div[@id="react-wayback-search"]', 15)

            // Collect all the years
            let years = await this.driver.findElements(this.webdriver.By.xpath('//div[@id="react-wayback-search"]/div[@class="sparkline-container container"]/div[@class="sparkline"]/div[@id="year-labels"]/span'));
            
            // Iterate through them and call the scrapeYear function
            for(let year of years) {
                let yearText = await year.getText();
                await year.click();
                await this.scrapeYear();
            }


            return this.success(`Successfully scraped all years`);

        } catch(err) {
            return this.error(`Error scraping all years`, err);
        }
    }

    // Main function called to perform search
    public async search(searchTerm: string = this.query): Promise<SearchioResponse> {
        try{
            await this.loadSearch(searchTerm);

            await this.scrapeYears();

            await this.pause(5000);

            return this.success(`Successfully performed scrape on all years`, this.table);

        } catch(err) {
            return this.error(`Error performing scrape on all years`, err);
        }
    }

}