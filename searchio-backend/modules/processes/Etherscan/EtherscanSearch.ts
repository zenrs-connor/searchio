import { SearchioResponse } from "../../../models/SearchioResponse";
import { SocketService } from "../../SocketService";
import { ETHEREUM_ADDRESS } from "../../../assets/RegexPatterns";
import { EtherscanProcess } from "./EtherscanProcess";


export class EtherscanSearch extends EtherscanProcess {
    
    protected id = "EtherscanSearch";
    protected name: "Etherscan Search";
    protected pattern: RegExp = ETHEREUM_ADDRESS;
    
    
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
    public async loadSearch(searchTerm: string = this.query): Promise<SearchioResponse> {
        try {
            await this.driver.get(`https://etherscan.io/address/${searchTerm}`);
            
            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err);
        }
    }


    // Function to look at results
    public async scrapeResult(): Promise<SearchioResponse> {

        try {
            // Wait for the report to load
            await this.pause(5000);

            // Check if we have a result or not

            let check = await this.driver.findElement(this.webdriver.By.xpath("//div[@class='container py-3']/div/div/h1")).getText();
            console.log(`Check text = ${check}`)

            check = await this.driver.findElements(this.webdriver.By.xpath("//span[contains(text(), 'please check')]"));
            console.log(`We have ${check.length} hits on the note`)

            check = await this.driver.findElements(this.webdriver.By.xpath("//h1[contains(., 'Invalid Address')]"));
            console.log(`We have ${check.length} hits on the check`)


            if (check.length > 0) {
                return this.error(`Invalid wallet address`, 'Invalid wallet address');
            } else {

                let address = await this.driver.findElement(this.webdriver.By.xpath('//span[@id="mainaddress"]')).getText();
                let transactionsLink = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="tab-pane fade show active"]/div/p/a')).getAttribute('href');
                let balance = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="row mb-4"]/div/div/div[2]/div/div[2]')).getText();
                let value = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="row mb-4"]/div/div/div[2]/div[2]/div[2]')).getText();

                let walletFormat: {   
                    address: string, 
                    transactionsLink?: string,
                    balance?: string,
                    value?: string
    
                } = {
                    address: undefined
                };
    
                walletFormat.address = address;
                walletFormat.transactionsLink = transactionsLink;
                walletFormat.balance = balance;
                walletFormat.value = value;
    
                return this.success(`Successfully scraped wallet`, walletFormat);
            }

        } catch(err) {
            return this.error(`Error attempting to scrape wallet`, err);
        }
    }

    // Main function called to perform search
    public async search(searchTerm: string = this.query): Promise<SearchioResponse> {
        try{
            await this.loadSearch(searchTerm);

            let wallet = await this.scrapeResult();

            await this.pause(5000);

            return this.success(`Successfully preformed search on Ethereum wallet`, wallet.data);

        } catch(err) {
            return this.error(`Error preforming search on Ethereum wallet`, err);
        }
    }

}