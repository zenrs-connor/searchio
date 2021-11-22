import { SearchioResponse } from "../../../models/SearchioResponse";
import { RoyalMailProcess } from "./RoyalMailProcess";
import { SocketService } from "../../SocketService";
import { POSTCODE } from "../../../assets/RegexPatterns";


export class RoyalMailSearch extends RoyalMailProcess {
    
    protected id = "RoyalMail";           
    protected name: "Royal Mail Address Search";
    protected pattern: RegExp = POSTCODE;

    public table = {

        columns: [
            { title: "Address", key: "address", type: "Text" },
            { title: "Postcode", key: "postcode", type: "Text" }
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


    // Load search
    public async loadSearch(postcode: string): Promise<SearchioResponse> {
        try {

            // Load page
            await this.driver.get(`https://www.royalmail.com/find-a-postcode`);

            // Accept cookies
            await this.driver.findElement(this.webdriver.By.xpath('//button[@id="consent_prompt_submit"]')).click();


            // Find input field and enter postcode letter by letter
            for(let letter of postcode){
                await this.driver.findElement(this.webdriver.By.xpath('//div[@class="address-lookup__field form-item-rml-postcode-finder-postal-code js-form-item form-item js-form-type-textfield form-type-textfield js-form-item-rml-postcode-finder-postal-code"]/input')).sendKeys(letter);
            }

            // Wait a second then click ENTER
            await this.pause(1000);
            await this.driver.findElement(this.webdriver.By.xpath('//div[@class="address-lookup__field form-item-rml-postcode-finder-postal-code js-form-item form-item js-form-type-textfield form-type-textfield js-form-item-rml-postcode-finder-postal-code"]/input')).sendKeys(this.webdriver.Key.ENTER);
            
            // Wait for addresses to load in
            await this.pause(4000);

            return this.success(`Succesfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err)
        }
    }

    // Retrieve addresses from the autocomplete
    public async scrapeAddresses(postcode: any): Promise<SearchioResponse> {
        
        try{
            let addresses = await this.driver.findElements(this.webdriver.By.xpath('//div[@class="pcaautocomplete pcatext"]/div[2]/div'));
            for(let address of addresses) {
                let addressText = await address.getAttribute('title');

                this.table.rows.push({
                    address: addressText,
                    postcode: postcode
                });
            }
            

            return this.success(`Successfully scraped addresses`);

        } catch(err) {
            return this.error(`Error scraping addresses`, err);
        }
    }

    // Main function called to do a complete of addresses in a postcode
    public async search(postcode: string = this.query): Promise<SearchioResponse> {
        try{
            
            await this.loadSearch(postcode);
            
            await this.scrapeAddresses(postcode);

            return this.success(`Successfully retrieved addresses for ${this.query}`, this.table);

        } catch(err) {
            return this.error(`Error getting addresses for ${this.query}`, err);
        }
    }

}