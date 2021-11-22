import { SearchioResponse } from "../../../models/SearchioResponse";
import { AskProcess } from "./AskProcess";
import { SocketService } from "../../SocketService";
import { BUSINESS } from "../../../assets/RegexPatterns";
import { WebLink } from "../../../models/WebLink";


export class AskSearch extends AskProcess {
    
    protected id = "AskSearch";           
    protected name: "Ask Search";
    protected pattern: RegExp = BUSINESS;

    public table = {

        columns: [
            { title: "Type", key: "type", type: "Text" },
            { title: "Title", key: "title", type: "Text" },
            { title: "Snippet", key: "snippet", type: "Text" },
            { title: "Link", key: "link", type: "WebPage" }
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
    public async loadSearch(searchTerm: string): Promise<SearchioResponse> {
        try {
            await this.driver.get(`https://uk.ask.com/?qo=logo`);

            // Accept cookies
            //await this.driver.findElement(this.webdriver.By.xpath('//button[@id="bnp_btn_accept"]')).click();

            // Input search term
            await this.driver.findElement(this.webdriver.By.xpath('//input[@class="PartialSearchBox-input js-PartialSearchBox-input "]')).sendKeys(searchTerm);

            // Wait a second for search button to become visible
            await this.pause(1000);

            // Click search button
            await this.driver.findElement(this.webdriver.By.xpath('//button[@class="PartialSearchBox-button js-PartialSearchBox-button rounded-border"]')).click();

            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err)
        }
    }

    // Scrape a single page of results
    public async scrapePage(results):Promise<SearchioResponse> {
        
        const t = this;
        
        try{
            await this.pause(3000);
            results = await t.driver.findElements(t.webdriver.By.xpath('//div[@class="PartialSearchResults-item"]'));

            for(let result of results) {
                let link = '';
                let title = '';
                let snippet = '';

                link = await result.findElement(t.webdriver.By.xpath('.//div[@class="PartialSearchResults-item-title"]/a')).getAttribute('href');
                title = await result.findElement(t.webdriver.By.xpath('.//div[@class="PartialSearchResults-item-title"]')).getText();
                snippet = await result.findElement(t.webdriver.By.xpath('.//div[@class="PartialSearchResults-item-details"]')).getText();

                this.table.rows.push({
                    type: "Webpage",
                    title: title,
                    link:  { text: title, url: link } as WebLink,
                    snippet: snippet 
                });
            }
            
            return this.success(`Successfully scraped page of results`);

        } catch(err) {
            return this.error(`Error scraping page of results`, err)
        }
    }

    // Scrape set number of pages
    public async scrapePages():Promise<SearchioResponse> {
        try{
            // Normal results
            await this.flipThrough('//li[@class="PartialWebPagination-next"]/a', '//div[@class="PartialSearchResults-item"]', this.scrapePage.bind(this), 2);
            
            return this.success(`Successfully scraped set number of pages`);

        } catch(err) {
            return this.error(`Error scraping set number of pages`, err)
        }
    }

    // Main function called to scrape Ask results
    public async search(searchTerm: string = this.query): Promise<SearchioResponse> {
        try{
            
            // Call function to load search
            await this.loadSearch(searchTerm);

            // Wait for results to load in
            await this.pause(5000);

            // Call function to scrape pages
            await this.scrapePages();

            return this.success(`Successfully scraped Ask for ${this.query}`, this.table);

        } catch(err) {
            return this.error(`Error scraping Ask`, err);
        }
    }

}