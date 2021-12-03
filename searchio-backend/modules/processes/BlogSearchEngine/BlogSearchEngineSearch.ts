import { SearchioResponse } from "../../../models/SearchioResponse";
import { BlogSearchEngineProcess } from "./BlogSearchEngineProcess";
import { SocketService } from "../../SocketService";
import { ANY } from "../../../assets/RegexPatterns";
import { WebLink } from "../../../models/WebLink";

export class BlogSearchEngineSearch extends BlogSearchEngineProcess {
    
    protected id = "BlogSearchEngineSearch";           
    protected name: "BlogSearchEngine Search";
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
            await this.driver.get(`http://www.blogsearchengine.org/`);

            // Wait for cookies to load
            //await this.waitForElement('//button[@id="onetrust-accept-btn-handler"]', 20);

            // Accept cookies
            //await this.driver.findElement(this.webdriver.By.xpath('//button[@id="onetrust-accept-btn-handler"]')).click();

            // Wait for input to load
            await this.waitForElement('//input[@class="input_stl"]', 20);

            // Input search term
            await this.driver.findElement(this.webdriver.By.xpath('//input[@class="input_stl"]')).sendKeys(searchTerm);

            // Wait for search button
            await this.pause(1500);

            // Click search button
            await this.driver.findElement(this.webdriver.By.xpath('//form[@id="cse-search-box"]/div/input[5]')).click();

            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err);
        }
    }

    // Scrape a page of results
    public async scrapePage(results):Promise<SearchioResponse> {

        try{
            for(let result of results) {
                let type = 'Webpage';
                let title = '';
                let snippet = '';
                let link = '';

                title = await result.findElement(this.webdriver.By.xpath('.//a[@class="gs-title"]')).getText();
                snippet = await result.findElement(this.webdriver.By.xpath('.//div[@class="gsc-table-cell-snippet-close"]/div[@class="gs-bidi-start-align gs-snippet"]')).getText();
                link = await result.findElement(this.webdriver.By.xpath('.//a[@class="gs-title"]')).getAttribute('href');
                

                this.table.rows.push({
                    type: type,
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

    // Overwrite flipThrough as this process behaves differently
    public async flipThrough(nextXpath: string, collectElements: string, process: Function, pageLimit: number = 100): Promise<SearchioResponse> {

        let pages: number = 0;
        let results: any[] = [];

        const t = this;

        async function iterate() {
            pages++;

            if(pages > 1){
                await t.driver.switchTo().parentFrame();
            }

            await t.waitForElement('//iframe[@name="googleSearchFrame"]', 20);

            let iFrame = await t.driver.findElement(t.webdriver.By.xpath('//iframe[@name="googleSearchFrame"]'))
            await t.driver.switchTo().frame(iFrame);

            let eles = await t.driver.findElements(t.webdriver.By.xpath(collectElements));

            let proc = await process(eles);
            results = results.concat(proc.data);

            if (pages >= pageLimit){
                return;
            }

            let button = await t.driver.findElements(t.webdriver.By.xpath(`//div[@class="gsc-cursor-page"][contains(text(), "${pages+1}")]`));
    
            if(button.length > 0) {
                await t.driver.findElement(t.webdriver.By.xpath(`//div[@class="gsc-cursor-page"][contains(text(), "${pages+1}")]`)).click();
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

    // Scrape set number of pages
    public async scrapePages():Promise<SearchioResponse> {
        try {
            // Wait for results to completely load in
            await this.waitForElement('//div[@id="cse-search-results"]', 20);

            let x = await this.flipThrough('', '//div[@class="gsc-webResult gsc-result"]', this.scrapePage.bind(this), 2);
            console.log(x);

            return this.success(`Successfully scraped all pages`);

        } catch(err) {
            return this.error(`Could not scrape all pages`, err);
        }
    }

    // Main function called to perform search
    public async search(searchTerm: string = this.query): Promise<SearchioResponse> {
        try{
            await this.loadSearch(searchTerm);

            let x = await this.scrapePages();
            console.log(x)

            await this.pause(10000);

            return this.success(`Successfully scraped BlogSearchEngine for ${this.query}`, this.table);

        } catch(err) {
            return this.error(`Error searching BlogSearchEngine`, err);
        }
    }

}