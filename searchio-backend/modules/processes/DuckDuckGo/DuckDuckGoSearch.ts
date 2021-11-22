import { SearchioResponse } from "../../../models/SearchioResponse";
import { DuckDuckGoProcess } from "./DuckDuckGoProcess";
import { SocketService } from "../../SocketService";
import { BUSINESS } from "../../../assets/RegexPatterns";
import { WebLink } from "../../../models/WebLink";


export class DuckDuckGoSearch extends DuckDuckGoProcess {
    
    protected id = "DuckDuckGoSearch";           
    protected name: "DuckDuckGo Search";
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
            await this.driver.get(`https://duckduckgo.com/`);

            // Accept cookies
            //await this.driver.findElement(this.webdriver.By.xpath('//button[@id="bnp_btn_accept"]')).click();

            // Input search term
            await this.driver.findElement(this.webdriver.By.xpath('//input[@class="js-search-input search__input--adv"]')).sendKeys(searchTerm);

            // Wait for search button to appear
            await this.pause(1500);

            // Click search button
            await this.driver.findElement(this.webdriver.By.xpath('//input[@class="search__button  js-search-button"]')).click();

            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err)
        }
    }

    // Scrape the page of results
    public async scrapePage():Promise<SearchioResponse> {
        
        try{
            let results = await this.driver.findElements(this.webdriver.By.xpath('//div[@class="result results_links_deep highlight_d result--url-above-snippet"]'));

            for(let result of results) {
                let link = '';
                let title = '';
                let snippet = '';

                link = await result.findElement(this.webdriver.By.xpath('.//h2[@class="result__title js-result-title"]/a')).getAttribute('href');
                title = await result.findElement(this.webdriver.By.xpath('.//h2[@class="result__title js-result-title"]/a')).getText();
                snippet = await result.findElement(this.webdriver.By.xpath('.//div[@class="result__snippet js-result-snippet"]')).getText();

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
    public async loadPages():Promise<SearchioResponse> {
        
        // Counts the page we are currently on
        let pages: number = 0;
        // Limit on the number of pages we want to see
        let pageLimit = 2;

        const t = this;

        async function iterate() {
            pages++;

            // Scroll to bottom so 'More results' button is in view
            await t.scrollToBottom(3);

            // If we have met the number of pages we want to see, end
            if (pages >= pageLimit){
                console.log(`Opened ${pages} pages`);
                return;
            }

            // Look for 'More Results' button
            let button = await t.driver.findElements(t.webdriver.By.xpath('//a[@class="result--more__btn btn btn--full"]'));
    
            // If button is present click it
            if(button.length > 0) {
                await t.driver.findElement(t.webdriver.By.xpath('//a[@class="result--more__btn btn btn--full"]')).click();
            // Else, end
            } else {
                return;
            }

            return iterate();
        }

        try {
            // Call the iterate function
            let finalResponse = await iterate();

            return this.success(`Loaded ${pages} pages`);

        } catch(err) {
            return this.error(`Could not load pages`, err);
        }
    }

    // Main function called to perform search
    public async search(searchTerm: string = this.query): Promise<SearchioResponse> {
        try{
            
            await this.loadSearch(searchTerm);

            await this.loadPages();

            await this.scrapePage();

            return this.success(`Successfully scraped DuckDuckGo for ${this.query}`, this.table);

        } catch(err) {
            return this.error(`Error scraping DuckDuckGo`, err);
        }
    }

}