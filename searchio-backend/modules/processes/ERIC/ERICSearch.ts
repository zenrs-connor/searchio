import { SearchioResponse } from "../../../models/SearchioResponse";
import { ERICProcess } from "./ERICProcess";
import { SocketService } from "../../SocketService";
import { ANY } from "../../../assets/RegexPatterns";
import { WebLink } from "../../../models/WebLink";

// Education Resources Information Center (ERIC)

export class ERICSearch extends ERICProcess {
    
    protected id = "ERICSearch";           
    protected name: "ERIC Search";
    protected pattern: RegExp = ANY;

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
            await this.driver.get(`https://eric.ed.gov/`);

            // Input search term
            await this.driver.findElement(this.webdriver.By.xpath('//form[@id="f"]/div/input[@id="s"]')).sendKeys(searchTerm);

            // Wait for search button
            await this.pause(1500);

            // Click search button
            await this.driver.findElement(this.webdriver.By.xpath('//form[@id="f"]/div/input[2]')).click();

            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err);
        }
    }

    // Scrape a page of results
    public async scrapePage(results):Promise<SearchioResponse> {
        
        const t = this;

        try{

            for(let result of results) {
                let link = '';
                let title = '';
                let snippet = '';

                link = await result.findElement(this.webdriver.By.xpath('.//div[@class="r_t"]/a')).getAttribute('href');
                title = await result.findElement(this.webdriver.By.xpath('.//div[@class="r_t"]/a')).getText();
                snippet = await result.findElement(this.webdriver.By.xpath('.//div[@class="r_d"]')).getText();
                
                this.table.rows.push({
                    type: "Article",
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
        try {
            await this.waitForElement('//div[@id="main"]/div[@id="r"]/div[@id="rr"]/div[@id="rrw"]', 20);

            await this.flipThrough('//div[@id="r"]/div[@id="rr"]/div[@id="rrm"]/div/div/a[contains(text(),"Next Page")]', '//div[@id="r"]/div[@id="rr"]/div[@id="rrw"]/div[@class="r_i"]', this.scrapePage.bind(this), 3);

            return this.success(`Successfully scraped all pages`);

        } catch(err) {
            return this.error(`Could not scrape all pages`, err);
        }
    }

    // Main function called to perform search
    public async search(searchTerm: string = this.query): Promise<SearchioResponse> {
        try{
            await this.loadSearch(searchTerm);

            await this.scrapePages();

            await this.pause(5000);

            return this.success(`Successfully scraped ERIC for ${this.query}`, this.table);

        } catch(err) {
            return this.error(`Error scraping ERIC`, err);
        }
    }

}