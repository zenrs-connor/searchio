import { SearchioResponse } from "../../../models/SearchioResponse";
import { LiveuamapProcess } from "./LiveuamapProcess";
import { SocketService } from "../../SocketService";
import { ANY } from "../../../assets/RegexPatterns";
import { WebLink } from "../../../models/WebLink";

export class LiveuamapSearch extends LiveuamapProcess {
    
    protected id = "LiveuamapSearch";           
    protected name: "Liveuamap Search";
    protected pattern: RegExp = ANY;

    public table = {

        columns: [
            { title: "Type", key: "type", type: "Text" },
            { title: "Title", key: "title", type: "Text" },
            { title: "Link", key: "link", type: "WebPage" },
            { title: "Location", key: "location", type: "WebPage" },
            { title: "Coordinates", key: "coordinates", type: "Text" },
            { title: "Source", key: "source", type: "Text" }
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

    // Load the search
    public async loadSearch(): Promise<SearchioResponse> {
        try {
            await this.driver.get(`https://europe.liveuamap.com/`);

            // Wait for cookies to load
            await this.waitForElement('//div[@class="sovrn-connect-ad"]/div[@class="closeButton"]', 20);

            // Accept cookies
            await this.driver.findElement(this.webdriver.By.xpath('//div[@class="sovrn-connect-ad"]/div[@class="closeButton"]')).click();

            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err);
        }
    }

    // Scrape each page of info
    public async scrapePage(results):Promise<SearchioResponse> {

        try{
            for(let result of results) {
                
                await this.driver.get(result);
                await this.waitForElement('//div[@class="popup-info"]', 15);

                let type = 'Event';
                let title = '';
                let link = '';
                let location = '';
                let coordinates = '';
                let source = '';

                title = await this.driver.findElement(this.webdriver.By.xpath('.//div[@class="popup-text"]/h2')).getText();
                link = result;
                location = await this.driver.findElement(this.webdriver.By.xpath('.//div[@class="tagas"]/strong')).getText();
                coordinates = await this.driver.findElement(this.webdriver.By.xpath('.//div[@class="marker-time"]/a')).getText();
                source = await this.driver.findElement(this.webdriver.By.xpath('.//a[@class="source-link"]')).getAttribute('href');
                

                this.table.rows.push({
                    type: type,
                    title: title,
                    link:  { text: title, url: link } as WebLink,
                    location: location,
                    coordinates: coordinates,
                    source: source
                });

                // Pause to help with rate limit
                await this.pause(4000);

            }

            return this.success(`Successfully scraped page of results`);

        } catch(err) {
            return this.error(`Error scraping page of results`, err)
        }
    }

    // Function to iterate through pages and collect links to reports so they can be scraped later
    public async scrapePages(pageLimit: number = 2):Promise<SearchioResponse> {
            
        let pages = 0;
        let results = [];
        const t = this;

        // Async func to iterate through pages
        async function iterate() {
            pages++;

            // Give it 3 seconds for the previous //div[@id="feedler"] to go and wait for new one to load in
            await t.pause(3000);
            await t.waitForElement('//div[@id="feedler"]/div', 20);

            // Collect the reports
            let reports = await t.driver.findElements(t.webdriver.By.xpath('//div[@id="feedler"]/div'));

            // Get the links stored in their data-link attribute
            for(let report of reports) {
                let dataLink = await report.getAttribute("data-link");
                // Some of the divs are adverts etc.
                if(dataLink == "" || dataLink == null) {
                    
                // Get the links from reports we do want and add them to an array
                } else {
                    results.push(dataLink);
                }
            }

            // Check page limit hasn't been met
            if (pages >= pageLimit){
                return;
            }

            // Check we can find the next page button
            let button = await t.driver.findElements(t.webdriver.By.xpath('//div[@id="feedler"]/div[@class="nextpage"]'));
            if(button.length > 0) {
                // Get next button and scroll it into view so isnt intercepted error
                t.driver.manage().window().maximize();
                let scrollElement = await t.driver.findElement(t.webdriver.By.xpath('//div[@id="feedler"]/div[@class="nextpage"]'));
                await t.driver.executeScript('arguments[0].scrollIntoView(true);', scrollElement);
                // Click next page
                await t.driver.findElement(t.webdriver.By.xpath('//div[@id="feedler"]/div[@class="nextpage"]')).click();
            } else {
                return;
            }

            return iterate();
        }


        try {
            // Start the iteration through pages, collectting links
            await iterate();

            // Then call function to visit each page and scrape info
            await this.scrapePage(results);

            return this.success(`Flipped though ${pages} pages`);

        } catch(err) {
            return this.error(`Could not flip through pages`, err);
        }

    }

    // Main function called to perform search
    public async search(searchTerm: string = this.query): Promise<SearchioResponse> {
        try{
            await this.loadSearch();

            await this.scrapePages();

            await this.pause(10000);

            return this.success(`Successfully scraped Liveuamap`, this.table);

        } catch(err) {
            return this.error(`Error searching Liveuamap`, err);
        }
    }

}