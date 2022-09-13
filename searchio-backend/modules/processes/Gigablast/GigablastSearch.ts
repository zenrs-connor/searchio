import { SearchioResponse } from "../../../models/SearchioResponse";
import { GigablastProcess } from "./GigablastProcess";
import { SocketService } from "../../SocketService";
import { BUSINESS } from "../../../assets/RegexPatterns";
import { WebLink } from "../../../models/WebLink";
import { ResultData } from "../../../models/ResultData";


export class GigablastSearch extends GigablastProcess {
    
    protected id = "GigablastSearch";           
    protected name: string = "Search";
    protected pattern: RegExp = BUSINESS;

    public table = {

        columns: [
            { title: "Title", key: "title", type: "Text" },
            { title: "Snippet", key: "snippet", type: "Text" },
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
        this.initWebdriver(false);
        let result = await this.search();
        this.destroyWebdriver();
        return result;
    }


    // Load the search
    public async loadSearch(searchTerm: string): Promise<SearchioResponse> {
        try {
            await this.driver.get(`http://gigablast.com/index.html`);

            // Input search term
            await this.driver.findElement(this.webdriver.By.xpath('//input[@id="q"]')).sendKeys(searchTerm);

            // Wait for search button
            await this.pause(1500);

            // Click search button
            await this.driver.findElement(this.webdriver.By.xpath('//div[@id="themaindiv"]/div')).click();

            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err);
        }
    }

    // Scrape a page of results
    public async scrapePage():Promise<SearchioResponse> {
        
        const t = this;

        try{
           
            await this.waitForElement('//table[@class="result"]', 30);
            let results = await t.driver.findElements(t.webdriver.By.xpath('//table[@class="result"]'));

            for(let result of results) {
                let link = '';
                let title = '';
                let snippet = '';

                link = await result.findElement(this.webdriver.By.xpath('.//table[@class="image"]/tbody/tr/td/a[@class="title"]')).getAttribute('href');
                title = await result.findElement(this.webdriver.By.xpath('.//table[@class="image"]/tbody/tr/td/a[@class="title"]')).getText();
                snippet = await result.findElement(this.webdriver.By.xpath('.//table[@class="image"]/tbody/tr/td/font[@class="summary"]')).getText();
                snippet = snippet.replace(/[\u2197]/g,'');
                snippet = snippet.replace(/\s\s+/g, ' ');
                console.log(snippet);

                this.table.rows.push({
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
            // Check we haven't been blocked
            let check = await this.driver.findElements(this.webdriver.By.xpath('//input[@name="qid"]'));
            if(check.length > 0) {
                return this.error(`Error! Rate limit has been met`);
            
            } else {
            
                // First page needs to be scraped seperately
                await this.scrapePage();

                await this.driver.findElement(this.webdriver.By.xpath('//div[@id="box"]/center/a')).click();
                
                // Scrape extra pages. Reduce total number of pages by one
                await this.flipThrough('//div[@id="box"]/center/a[2]', '//table[@class="result"]', this.scrapePage.bind(this), 2);

                return this.success(`Successfully scraped all pages`);
            }

        } catch(err) {
            return this.error(`Could not scrape all pages`, err);
        }
    }

    // Main function called to perform search
    public async search(searchTerm: string = this.query): Promise<SearchioResponse> {
        try{
            
            await this.loadSearch(searchTerm);

            // Wait for results to appear
            await this.waitForElement('//div[@id="box"]', 30);

            await this.scrapePages();

            let results: ResultData[] = [];

            if(this.table.rows.length > 0) {
                results = [{
                    name: `References to ${this.query}`,
                    type: "Table",
                    data: this.table
                }]
            }

            return this.success(`Successfully scraped Gigablast for ${this.query}`, results);

        } catch(err) {
            return this.error(`Error scraping Gigablast`, err);
        }
    }

}