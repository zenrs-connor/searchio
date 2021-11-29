import { SearchioResponse } from "../../../models/SearchioResponse";
import { YahooProcess } from "./YahooProcess";
import { SocketService } from "../../SocketService";
import { ANY } from "../../../assets/RegexPatterns";
import { WebLink } from "../../../models/WebLink";

export class YahooSearch extends YahooProcess {
    
    protected id = "YahooSearch";           
    protected name: "Yahoo Search";
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
        //this.destroyWebdriver();
        return result;
    }


    // Load the search
    public async loadSearch(searchTerm: string): Promise<SearchioResponse> {
        try {
            await this.driver.get(`https://uk.yahoo.com/`);

            // Wait for cookies to load
            await this.waitForElement('//button[@class="btn primary"]', 20);

            // Accept cookies
            await this.driver.findElement(this.webdriver.By.xpath('//button[@class="btn primary"]')).click();

            // Wait for input bar to load
            await this.waitForElement('//input[@class="_yb_3phk5"]', 20);

            // Input search term
            await this.driver.findElement(this.webdriver.By.xpath('//input[@class="_yb_3phk5"]')).sendKeys(searchTerm);

            // Wait for search button
            await this.pause(1500);

            // Click search button
            await this.driver.findElement(this.webdriver.By.xpath('//input[@class="rapid-noclick-resp _yb_blpy5"]')).click();

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

                let className = await result.findElement(this.webdriver.By.xpath('./div')).getAttribute('class');
                
                if(className == "dd algo algo-sr relsrch fst lst Sr") {
                    
                    link = await result.findElement(this.webdriver.By.xpath('.//h3[@class="title"]/a')).getAttribute('href');
                    title = await result.findElement(this.webdriver.By.xpath('.//h3[@class="title"]/a')).getText();
                    // Piece of text that needs to be removed from title
                    let remove = await result.findElement(this.webdriver.By.xpath('.//h3[@class="title"]/a/span')).getText();
                    title = title.replace(remove, '');
                    snippet = await result.findElement(this.webdriver.By.xpath('.//div[@class="compText aAbs"]/p')).getText();
                    this.table.rows.push({
                        type: "Webpage",
                        title: title,
                        link:  { text: title, url: link } as WebLink,
                        snippet: snippet 
                    });
                    await this.pause(1000);

                } else if(className == "dd algo algo-sr relsrch fst Sr") {
                    
                    link = await result.findElement(this.webdriver.By.xpath('.//h3[@class="title"]/a')).getAttribute('href');
                    title = await result.findElement(this.webdriver.By.xpath('.//h3[@class="title"]/a')).getText();
                    // Piece of text that needs to be removed from title
                    let remove = await result.findElement(this.webdriver.By.xpath('.//h3[@class="title"]/a/span')).getText();
                    title = title.replace(remove, '');
                    snippet = await result.findElement(this.webdriver.By.xpath('.//div[@class="compText aAbs"]/p')).getText();
                    this.table.rows.push({
                        type: "Webpage",
                        title: title,
                        link:  { text: title, url: link } as WebLink,
                        snippet: snippet 
                    });
                    await this.pause(1000);

                } else if(className == "dd algo algo-sr relsrch lst richAlgo") {
                    
                    link = await result.findElement(this.webdriver.By.xpath('.//h3[@class="title"]/a')).getAttribute('href');
                    title = await result.findElement(this.webdriver.By.xpath('.//h3[@class="title"]/a')).getText();
                    // Piece of text that needs to be removed from title
                    let remove = await result.findElement(this.webdriver.By.xpath('.//h3[@class="title"]/a/span')).getText();
                    title = title.replace(remove, '');
                    snippet = await result.findElement(this.webdriver.By.xpath('.//div[@class="compText aAbs"]/p')).getText();
                    this.table.rows.push({
                        type: "Webpage",
                        title: title,
                        link:  { text: title, url: link } as WebLink,
                        snippet: snippet 
                    });
                    await this.pause(1000);

                } else if(className == "dd tn-carousel v2  sys_news_auto") {
                    
                    link = await result.findElement(this.webdriver.By.xpath('.//ul[@class="compArticleList modern phoenix mb-16 nws_itm theme-trending v2"]/li/a')).getAttribute('href');
                    title = await result.findElement(this.webdriver.By.xpath('.//ul[@class="compArticleList modern phoenix mb-16 nws_itm theme-trending v2"]/li/div[@class="textWrap d-tc va-top pl-16 pr-16 ov-h"]/h4')).getText();
                    snippet = await result.findElement(this.webdriver.By.xpath('.//ul[@class="compArticleList modern phoenix mb-16 nws_itm theme-trending v2"]/li/div[@class="textWrap d-tc va-top pl-16 pr-16 ov-h"]/div[@class="subline"]/p')).getText();
                    this.table.rows.push({
                        type: "Webpage",
                        title: title,
                        link:  { text: title, url: link } as WebLink,
                        snippet: snippet 
                    });
                    await this.pause(1000);

                } else if(className == "dd tn-carousel v2  bingnews") {
                    
                    link = await result.findElement(this.webdriver.By.xpath('.//ul[@class="compArticleList modern phoenix mb-16 nws_itm theme-trending v2"]/li/a')).getAttribute('href');
                    title = await result.findElement(this.webdriver.By.xpath('.//ul[@class="compArticleList modern phoenix mb-16 nws_itm theme-trending v2"]/li/div[@class="textWrap d-tc va-top pl-16 pr-16 ov-h"]/h4')).getText();
                    snippet = await result.findElement(this.webdriver.By.xpath('.//ul[@class="compArticleList modern phoenix mb-16 nws_itm theme-trending v2"]/li/div[@class="textWrap d-tc va-top pl-16 pr-16 ov-h"]/div[@class="subline"]/p')).getText();
                    this.table.rows.push({
                        type: "Webpage",
                        title: title,
                        link:  { text: title, url: link } as WebLink,
                        snippet: snippet 
                    });
                    await this.pause(1000);

                } else if(className == "dd algo algo-sr relsrch fst richAlgo" || className == "dd algo algo-sr relsrch lst Sr" || className =="dd algo algo-sr relsrch Sr" || className == "dd algo algo-sr relsrch richAlgo") {
                    
                    link = await result.findElement(this.webdriver.By.xpath('.//h3[@class="title"]/a')).getAttribute('href');
                    title = await result.findElement(this.webdriver.By.xpath('.//h3[@class="title"]/a')).getText();
                    // Piece of text that needs to be removed from title
                    let remove = await result.findElement(this.webdriver.By.xpath('.//h3[@class="title"]/a/span')).getText();
                    title = title.replace(remove, '');
                    snippet = await result.findElement(this.webdriver.By.xpath('.//div[@class="compText aAbs"]/p')).getText();
                    this.table.rows.push({
                        type: "Webpage",
                        title: title,
                        link:  { text: title, url: link } as WebLink,
                        snippet: snippet 
                    });
                    await this.pause(1000);
                    
                } else {
                    console.log(`No interest or cannot scrape result with class name: ${className}`);
                }
        
            }

            return this.success(`Successfully scraped page of results`);

        } catch(err) {
            return this.error(`Error scraping page of results`, err)
        }
    }

    // Scrape set number of pages
    public async scrapePages():Promise<SearchioResponse> {
        try {
            // Wait for results to completely load in
            await this.waitForElement('//div[@id="results"]', 20);

            await this.flipThrough('//div[@class="compPagination"]/a[@class="next"]', '//div[@id="main"]/div/div[@id="web"]/ol[@class=" reg searchCenterMiddle"]/li', this.scrapePage.bind(this), 3);

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
            console.log(x);

            await this.pause(5000);

            return this.success(`Successfully scraped Yahoo for ${this.query}`, this.table);

        } catch(err) {
            return this.error(`Error scraping Yahoo`, err);
        }
    }

}