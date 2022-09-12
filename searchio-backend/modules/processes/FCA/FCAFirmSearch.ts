import { SearchioResponse } from "../../../models/SearchioResponse";
import { FCAProcess } from "./FCAProcess";
import { SocketService } from "../../SocketService";
import { BUSINESS } from "../../../assets/RegexPatterns";
import { ResultData } from "../../../models/ResultData";


export class FCAFirmSearch extends FCAProcess {
    
    protected id = "FCAFirmSearch";           
    protected name: string = "Firm Search";
    protected pattern: RegExp = BUSINESS;

    public table = {

        columns: [
            { title: "Firm Name", key: "firmName", type: "Text" },
            { title: "Reference Number", key: "refNumber", type: "Text" },
            { title: "Previous Names", key: "prevNames", type: "Text" },
            { title: "Address", key: "address", type: "Text" }
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
    public async loadSearch(searchTerm: string = this.query): Promise<SearchioResponse> {
        try {

            // Get search term ready to be inputted into URL
            searchTerm = searchTerm.replace(' ', '%20')
            await this.driver.get(`https://register.fca.org.uk/s/search?q=${searchTerm}&type=Companies`);

            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err);
        }
    }

    // Function to scrape company
    public async scrapeFirms(firms): Promise<SearchioResponse> {
        
        const t = this;

        try {
            
            for(let firm of firms){
                let firmName = await firm.findElement(t.webdriver.By.xpath('.//h2[@class="text-display-1 text--bold"]/a')).getText();
                let refNumber = await firm.findElement(t.webdriver.By.xpath('.//div[@class="text-medium slds-text-color_weak"]')).getText();

                let prevNamesElements = await firm.findElements(t.webdriver.By.xpath('.//div[@class="details-list"]/div/p'));
                let prevNames = [];
                for(let i=1; i < prevNamesElements.length; i++) {
                    let prevName = await prevNamesElements[i].getText();
                    prevNames.push(prevName);
                }

                let address = await firm.findElement(t.webdriver.By.xpath('.//div[@class="result-card_content"]/div/div/div[@class="slds-media__body"]')).getText();

                this.table.rows.push({
                    firmName: firmName,
                    refNumber: refNumber,
                    prevNames: prevNames,
                    address: address.replace('\n', ', ')
                });
                
                
            }
            

            return this.success(`Successfully scraped companies`);

        } catch(err) {
            return this.error(`Error scraping companies`, err);
        }
    }

    // Re-define function as behaves differently
    public async flipThrough(nextXPath: string, collectElements: string, process: Function, pageLimit: number = 100): Promise<SearchioResponse> {

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

            let button = await t.driver.findElements(t.webdriver.By.xpath(nextXPath));
    
            if(button.length > 0) {
                let buttonCheck = await t.driver.findElement(t.webdriver.By.xpath(nextXPath)).isEnabled();
                if(buttonCheck == true) {
                    await t.driver.findElement(t.webdriver.By.xpath(nextXPath)).click();
                    await t.pause(2500);
                    await t.waitForElement('//ol[@class="results stack stack--direct stack--x-small"]', 15);
                } else {
                    return
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

    // Function to call flipThrough and scrape companies
    public async scrapePages(): Promise<SearchioResponse> {
        try {

            // Wait for next button to appear
            await this.waitForElement('//button[@id="-pagination-next-btn"]', 15);
            
            await this.flipThrough('//button[@id="-pagination-next-btn"]', '//ol[@class="results stack stack--direct stack--x-small"]/li', this.scrapeFirms.bind(this), 3);

            return this.success(`Successfully scraped companies`);

        } catch(err) {
            return this.error(`Error scraping companies`, err);
        }
    }

    // Main function called to perform search
    public async search(searchTerm: string = this.query): Promise<SearchioResponse> {
        try{
            await this.loadSearch(searchTerm);

            await this.scrapePages();

            await this.pause(15000);

            let results: ResultData[] = [];
            if(this.table.rows.length > 0) {
                results = [{
                    name: "Search Results",
                    type: "Table",
                    data: this.table
                }]
            }

            return this.success(`Successfully performed FCA firm search`, results);

        } catch(err) {
            return this.error(`Error searching FCA`, err);
        }
    }

}