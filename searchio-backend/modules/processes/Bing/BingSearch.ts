import { SearchioResponse } from "../../../models/SearchioResponse";
import { BingProcess } from "./BingProcess";
import { SocketService } from "../../SocketService";
import { BUSINESS } from "../../../assets/RegexPatterns";
import { WebLink } from "../../../models/WebLink";


export class BingSearch extends BingProcess {
    
    protected id = "BingSearch";           
    protected name: "Bing Search";
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
            await this.driver.get(`https://www.bing.com/`);

            // Accept cookies
            //await this.driver.findElement(this.webdriver.By.xpath('//button[@id="bnp_btn_accept"]')).click();

            // Input search term
            await this.driver.findElement(this.webdriver.By.xpath('//input[@class="sb_form_q"]')).sendKeys(searchTerm);

            // Click search button
            await this.driver.findElement(this.webdriver.By.xpath('//label[@id="search_icon"]')).click();

            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err)
        }
    }

    // Scrape a single page of results
    public async scrapePage():Promise<SearchioResponse> {
        try{
            // Normal results
            let normalResults = await this.driver.findElements(this.webdriver.By.xpath('//li[@class="b_algo"]'));
            for(let result of normalResults) {
                let title = await result.findElement(this.webdriver.By.xpath('.//div[@class="b_title"]/h2')).getText();
                let link = await result.findElement(this.webdriver.By.xpath('.//div[@class="b_title"]/h2')).getAttribute('href');
                let snippet = await result.findElements(this.webdriver.By.xpath('.//div[@class="b_caption"]/p'));
                if(snippet.length > 0){
                    snippet = await result.findElement(this.webdriver.By.xpath('.//div[@class="b_caption"]/p')).getText();
                } else {
                    snippet = "";
                }

                this.table.rows.push({
                    type: 'Webpage',
                    title: title,
                    link: { text: title, url: link } as WebLink,
                    snippet: snippet 
                });
            }

            // News results
            let newsResults = await this.driver.findElements(this.webdriver.By.xpath('//li[@class="b_ans b_mop b_nwsAnsTopItem"]'));
            for(let result of newsResults) {
                let title = await result.findElement(this.webdriver.By.xpath('.//div[@id="nws_ht"]/h2')).getText();
                let link = await result.findElement(this.webdriver.By.xpath('.//div[@id="nws_ht"]/h2/a')).getAttribute('href');

                this.table.rows.push({
                    type: "Article's",
                    title: title,
                    link:  { text: title, url: link } as WebLink,
                    snippet: '' 
                });
            }

            // Video results
            let videoResults = await this.driver.findElements(this.webdriver.By.xpath('//li[@class="b_ans b_mop b_vidAns"]'));
            for(let result of videoResults) {
                let title = await result.findElement(this.webdriver.By.xpath('.//div[@class="btitle b_title"]/h2')).getText();
                let link = await result.findElement(this.webdriver.By.xpath('.//div[@class="btitle b_title"]/h2/a')).getAttribute('href');

                this.table.rows.push({
                    type: 'Video',
                    title: title,
                    link: { text: title, url: link } as WebLink,
                    snippet: '' 
                });
            }

            // Advert results
            let advertResults = await this.driver.findElements(this.webdriver.By.xpath('//li[@class="b_ad b_adTop"]'));
            for(let result of advertResults) {
                let title = await result.findElement(this.webdriver.By.xpath('./ul/li/div/h2')).getText();
                let link = await result.findElement(this.webdriver.By.xpath('./ul/li/div/h2/a')).getAttribute('href');

                this.table.rows.push({
                    type: 'Video',
                    title: title,
                    link: { text: title, url: link } as WebLink,
                    snippet: '' 
                });
            }
            
            return this.success(`Successfully scraped page of results`);

        } catch(err) {
            return this.error(`Error scraping page of results`, err)
        }
    }

    // Main function called to scrape companies
    public async search(searchTerm: string = this.query): Promise<SearchioResponse> {
        try{
            
            await this.loadSearch(searchTerm);

            let x = await this.scrapePage();
            console.log(x);

            await this.pause(50000);

            return this.success(`Successfully scraped Bing for ${this.query}`, this.table);

        } catch(err) {
            return this.error(`Error scraping Bing`, err);
        }
    }

}