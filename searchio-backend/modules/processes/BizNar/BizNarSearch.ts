import { SearchioResponse } from "../../../models/SearchioResponse";
import { BizNarProcess } from "./BizNarProcess";
import { SocketService } from "../../SocketService";
import { ANY } from "../../../assets/RegexPatterns";
import { WebLink } from "../../../models/WebLink";
import { ResultData } from "../../../models/ResultData";

export class BizNarSearch extends BizNarProcess {
    
    protected id = "BizNarSearch";           
    protected name: string ="Search";
    protected pattern: RegExp = ANY;

    public table = {

        columns: [
            { title: "Title", key: "title", type: "WebLink" },
            { title: "Snippet", key: "snippet", type: "Text" },
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
            await this.driver.get(`https://biznar.com/biznar/desktop/en/search.html`);

            // Wait for input to bar to load
            await this.waitForElement('//div[@class="input-group"]/input[@class="form-control"]', 20);

            // Input search term
            await this.driver.findElement(this.webdriver.By.xpath('//div[@class="input-group"]/input[@class="form-control"]')).sendKeys(searchTerm);

            // Wait for search button
            await this.pause(1500);

            // Click search button
            await this.driver.findElement(this.webdriver.By.xpath('//div[@class="input-group-btn"]/button[@id="simple-search-submit"]')).click();

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

                link = await result.findElement(this.webdriver.By.xpath('.//a[@class="result-title"]')).getAttribute('href');
                title = await result.findElement(this.webdriver.By.xpath('.//a[@class="result-title"]')).getText();
                snippet = await result.findElement(this.webdriver.By.xpath('.//div[@class="result-snippet"]')).getText();
                
                this.table.rows.push({
                    title:  { text: title, url: link } as WebLink,
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
            await this.waitForElement('//div[@id="mid-col"]', 20);
            let x = await this.flipThrough('', '//div[@id="mid-col"]//div[@class="tab-pane active"]//div[@class="result even" or @class="result odd"]', this.scrapePage.bind(this), 5);

            return this.success(`Successfully scraped all pages`);

        } catch(err) {
            return this.error(`Could not scrape all pages`, err);
        }
    }

    // Re-define flipThrough function as different
    public async flipThrough(nextXPath: string, collectElements: string, process: Function, pageLimit: number = 100): Promise<SearchioResponse> {

        let pages: number = 0;
        let results: any[] = [];

        const t = this;

        async function iterate() {
            pages++;

            await t.waitForElement('//div[@id="mid-col"]//div[@class="tab-pane active"]', 30);

            let eles = await t.driver.findElements(t.webdriver.By.xpath(collectElements));

            let proc = await process(eles);
            results = results.concat(proc.data);

            if (pages >= pageLimit){
                return;
            }

            let top = await t.driver.findElement(t.webdriver.By.xpath('//div[@id="mid-col"]//div[@id="result-list-controls"]'));
            let buttons = await top.findElements(t.webdriver.By.xpath('.//ul[@class="pagination"]//li'));
            let button = await top.findElements(t.webdriver.By.xpath(`.//ul[@class="pagination"]//li[${buttons.length - 1}]/a`));
    
            if(button.length > 0) {
                let buttonClass = await t.driver.findElement(t.webdriver.By.xpath(`.//ul[@class="pagination"]//li[${buttons.length - 1}]/a`)).getAttribute('class');
                if(buttonClass == 'disabled') {
                    return
                } else {
                    await t.driver.findElement(t.webdriver.By.xpath(`.//ul[@class="pagination"]//li[${buttons.length - 1}]/a`)).click();
                }
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

            await this.scrapePages();

            let results: ResultData[] = [];
            if(this.table.rows.length > 0) {
                results = [{
                    name: "Search Results",
                    type: "Table",
                    data: this.table
                }]
            }

            return this.success(`Successfully scraped BizNar for ${this.query}`, results);

        } catch(err) {
            return this.error(`Error scraping BizNar`, err);
        }
    }

}