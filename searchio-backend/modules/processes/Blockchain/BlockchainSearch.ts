import { SearchioResponse } from "../../../models/SearchioResponse";
import { SocketService } from "../../SocketService";
import { BITCOIN_ADDRESS } from "../../../assets/RegexPatterns";
import { BlockchainProcess } from "./BlockchainProcess";


export class BlockchainSearch extends BlockchainProcess {
    
    protected id = "BlockchainSearch";
    protected name: "Blockchain Search";
    protected pattern: RegExp = BITCOIN_ADDRESS;
    
    
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
    public async loadSearch(searchTerm: string = this.query): Promise<SearchioResponse> {
        try {
            await this.driver.get(`https://www.blockchain.com/btc/address/${searchTerm}`);
            
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
            let check = await this.driver.findElements(this.webdriver.By.xpath('//h1[@class="Text__TitleLarge-sc-1fwf07x-20 cAZNbr"]'));
            if (check.length > 0) {
                return this.error(`Invalid wallet address`, 'Invalid wallet address');
            } else {

                let address = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="hnfgic-0 enzKJw"]/div/div[2]/div/span')).getText();
                let transactions = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="hnfgic-0 enzKJw"]/div[3]/div[2]/span')).getText();
                let recieved = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="hnfgic-0 enzKJw"]/div[4]/div[2]/span')).getText();
                let sent = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="hnfgic-0 enzKJw"]/div[5]/div[2]/span')).getText();
                let balance = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="hnfgic-0 enzKJw"]/div[6]/div[2]/span')).getText();

                let walletFormat: {   
                    address: string, 
                    transactions?: string,
                    recieved?: string,
                    sent?: string,
                    balance?: string
    
                } = {
                    address: undefined
                };
    
                walletFormat.address = address;
                walletFormat.transactions = transactions;
                walletFormat.recieved = recieved;
                walletFormat.sent = sent;
                walletFormat.balance = balance;
    
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

            return this.success(`Successfully preformed search on blockchain wallet`, wallet.data);

        } catch(err) {
            return this.error(`Error preforming search on blockchain wallet`, err);
        }
    }

}