import { SearchioResponse } from "../../../models/SearchioResponse";
import { DOAJProcess } from "./DOAJProcess";
import { SocketService } from "../../SocketService";
import { ANY } from "../../../assets/RegexPatterns";
import { WebLink } from "../../../models/WebLink";
import { ResultData } from "../../../models/ResultData";


export class DOAJSearch extends DOAJProcess {
    
    protected id = "DOAJSearch";           
    protected name: string = "Search";
    protected pattern: RegExp = ANY;

    public table = {

        columns: [
            { title: "Title", key: "title", type: "WebLink" },
            { title: "Authors", key: "authors", type: "Text" },
            { title: "Snippet", key: "snippet", type: "Text" }
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
    public async loadSearch(searchTerm: string): Promise<SearchioResponse> {
        try {
            await this.driver.get(`https://doaj.org/`);

            // CLick articles
            await this.driver.findElement(this.webdriver.By.xpath('//div[@class="col-xs-12 col-md-8"]/label[2]')).click();

            // Input search term
            await this.driver.findElement(this.webdriver.By.xpath('//input[@class="input-group__input"]')).sendKeys(searchTerm);

            // Wait for search button
            await this.pause(1500);

            // Click search button
            await this.driver.findElement(this.webdriver.By.xpath('//button[@class="input-group__input label"]')).click();

            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err);
        }
    }

    // Scrape a page of results
    public async scrapePage(results):Promise<SearchioResponse> {

        try{
            for(let result of results) {
                let link = '';
                let title = '';
                let snippet = '';

                link = await result.findElement(this.webdriver.By.xpath('.//h3[@class="search-results__heading"]/a')).getAttribute('href');
                title = await result.findElement(this.webdriver.By.xpath('.//h3[@class="search-results__heading"]/a')).getText();
                snippet = await result.findElement(this.webdriver.By.xpath('.//div[@class="search-results__body"]')).getText();
                let authors = await result.findElement(this.webdriver.By.xpath('.//header/ul')).getText();

                this.table.rows.push({
                    title:  { text: title, url: link } as WebLink,
                    authors: authors, 
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
            await this.waitForElement('//div[@id="cookie-consent"]/p[2]/a', 10);
            await this.pause(3000);
            await this.driver.findElement(this.webdriver.By.xpath('//div[@id="cookie-consent"]/p[2]/a')).click();

            await this.flipThrough('//a[@class="doaj-pager-next doaj-pager-next-top-pager"]', '//ol[@class="search-results"]/li', this.scrapePage.bind(this), 3);

            return this.success(`Successfully scraped all pages`);

        } catch(err) {
            return this.error(`Could not scrape all pages`, err);
        }
    }

    // Re-define flipThrough function as this process behaves differently
    public async flipThrough(nextXPath: string, collectElements: string, process: Function, pageLimit: number = 100): Promise<SearchioResponse> {

        let pages: number = 0;
        let processComplete = false;
        let results: any[] = [];

        const t = this;

        async function iterate() {
            await t.pause(2000);
            pages++;

            let eles = await t.driver.findElements(t.webdriver.By.xpath(collectElements));

            let proc = await process(eles);
            results = results.concat(proc.data);

            if (pages >= pageLimit){
                return;
            }

            let button = await t.driver.findElements(t.webdriver.By.xpath(nextXPath));
    
            if(button.length > 0) {
                await t.driver.findElement(t.webdriver.By.xpath(nextXPath)).click();
            } else {
                return;
            }

            return iterate();
        }

        try {
            let finalResponse = await iterate();

            return this.success(`Flipped though ${pages} pages`, results);

        } catch(err) {
            return this.error(`Could not flip through pages`, err);
        }
        

    }

    // Main function called to perform search
    public async search(searchTerm: string = this.query): Promise<SearchioResponse> {
        try{
            await this.loadSearch(searchTerm);

            let x = await this.scrapePages();
            await this.pause(5000);


            let results: ResultData[] = [];

            if(this.table.rows.length > 0) {
                results = [{
                    name: "Search Results",
                    type: "Table",
                    data: this.table
                }]
            }

            return this.success(`Successfully scraped DOAJ for ${this.query}`, results);

        } catch(err) {
            return this.error(`Error scraping DOAJ`, err);
        }
    }

}