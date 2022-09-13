import { SearchioResponse } from "../../../models/SearchioResponse";
import { eToolsProcess } from "./eToolsProcess";
import { SocketService } from "../../SocketService";
import { BUSINESS } from "../../../assets/RegexPatterns";
import { WebLink } from "../../../models/WebLink";
import { ResultData } from "../../../models/ResultData";


export class eToolsSearch extends eToolsProcess {
    
    protected id = "eToolsSearch";           
    protected name: string = "eTools Search";
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
        this.initWebdriver();
        let result = await this.search();
        this.destroyWebdriver();
        return result;
    }


    // Load the search
    public async loadSearch(searchTerm: string): Promise<SearchioResponse> {
        try {
            await this.driver.get(`https://www.etools.ch/`);

            // Input search term
            await this.driver.findElement(this.webdriver.By.xpath('//input[@name="query"]')).sendKeys(searchTerm);

            // Wait for search button
            await this.pause(1500);

            // Click search button
            await this.driver.findElement(this.webdriver.By.xpath('//input[@class="submit"]')).click();

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

                link = await result.findElement(this.webdriver.By.xpath('.//a[@class="title"]')).getAttribute('href');
                title = await result.findElement(this.webdriver.By.xpath('.//a[@class="title"]')).getText();
                snippet = await result.findElement(this.webdriver.By.xpath('.//div[@class="text"]')).getText();

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

    // Re-define flipThrough from Process.ts as this process is different
    // Function to iterate through pages, perform a given processon all collected elements when also given the xpath for the next button
    public async flipThrough(nextCSS: string, collectElements: string, process: Function, pageLimit: number = 100): Promise<SearchioResponse> {

        let pages: number = 0;
        let results: any[] = [];

        const t = this;

        async function iterate() {
            pages++;

            let eles = await t.driver.findElements(t.webdriver.By.xpath(collectElements));

            let proc = await process(eles);
            results = results.concat(proc.data);

            if (pages >= pageLimit){
                return;
            }

            let button = await t.driver.findElements(t.webdriver.By.css(nextCSS));
    
            if(button.length > 0) {
                await t.driver.findElement(t.webdriver.By.css(nextCSS)).click();
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

            await this.flipThrough('[title^="Next page"]', '//td[@class="record"]', this.scrapePage.bind(this), 3);

            let results: ResultData[] = [];
            if(this.table.rows.length > 0) {
                results = [{
                    name: "eTools Search Results",
                    type: "Table",
                    data: this.table
                }]
            }


            return this.success(`Successfully scraped eTools for ${this.query}`, results);

        } catch(err) {
            return this.error(`Error scraping eTools`, err);
        }
    }

}