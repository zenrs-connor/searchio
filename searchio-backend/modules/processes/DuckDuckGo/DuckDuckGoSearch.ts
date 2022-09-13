import { SearchioResponse } from "../../../models/SearchioResponse";
import { DuckDuckGoProcess } from "./DuckDuckGoProcess";
import { SocketService } from "../../SocketService";
import { ANY, BUSINESS } from "../../../assets/RegexPatterns";
import { WebLink } from "../../../models/WebLink";
import { ResultData } from "../../../models/ResultData";


export class DuckDuckGoSearch extends DuckDuckGoProcess {
    
    protected id = "DuckDuckGoSearch";           
    protected name: string = "Search";
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
            await this.driver.get(`https://duckduckgo.com/`);

            // Accept cookies
            //await this.driver.findElement(this.webdriver.By.xpath('//button[@id="bnp_btn_accept"]')).click();

            let searchbar = await this.driver.findElements(this.webdriver.By.xpath('//input[@class="js-search-input search__input--adv"]'))

            if(searchbar.length === 0) {
                searchbar = await this.driver.findElements(this.webdriver.By.id('searchbox_input'));
            }

            if(searchbar.length === 0 ){
                return this.error(`No searchbar found...`)
            }

            searchbar = searchbar[0];



            let searchbutton = await this.driver.findElements(this.webdriver.By.xpath('//input[@class="search__button  js-search-button"]'));
            if(searchbutton.length === 0) {
                searchbutton = await this.driver.findElements(this.webdriver.By.className('searchbox_searchButton__F5Bwq iconButton_button__6x_9C')); 
            }
            if(searchbutton.length === 0 ){
                return this.error(`No search button found...`)
            }
            searchbutton = searchbutton[0];


            // Input search term
            await searchbar.sendKeys(searchTerm);
            // Wait for search button to appear
            await this.pause(1500);
            // Click search button
            await searchbutton.click();

            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err)
        }
    }

    // Scrape the page of results
    public async scrapePage():Promise<SearchioResponse> {
        
        try{
            let results = await this.driver.findElements(this.webdriver.By.className("yQDlj3B5DI5YO8c8Ulio CpkrTDP54mqzpuCSn1Fa SKlplDuh9FjtDprgoMxk"));

            for(let result of results) {


                let link = '';
                let title = '';
                let snippet = '';


                let links = await result.findElements(this.webdriver.By.className('eVNpHGjtxRBq_gLOfGDr LQNqh2U1kzYxREs65IJu'));//.getAttribute('href');
            
                if(links.length > 0) {

                    link = links[0].getAttribute('href');
                    title = await result.findElement(this.webdriver.By.xpath('.//h2[@class="LnpumSThxEWMIsDdAT17 CXMyPcQ6nDv47DKFeywM"]/a')).getText();
                    snippet = await result.findElement(this.webdriver.By.xpath('.//div[@class="OgdwYG6KE2qthn9XQWFC"]')).getText();

                    this.table.rows.push({
                        title: { text: title, url: link } as WebLink,
                        snippet: snippet
                    })
                }

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

            await this.pause(5000);

            let results: ResultData[] = [];

            console.log(this.table);

            if(this.table.rows.length > 0) {
                results = [{
                    name: "Search Results",
                    type: "Table",
                    data: this.table
                }]
            }

            return this.success(`Successfully scraped DuckDuckGo for ${this.query}`, results);

        } catch(err) {
            return this.error(`Error scraping DuckDuckGo`, err);
        }
    }

}