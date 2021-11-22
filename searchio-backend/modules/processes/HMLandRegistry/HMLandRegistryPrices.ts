import { SearchioResponse } from "../../../models/SearchioResponse";
import { WebElement } from "selenium-webdriver";
import { SocketService } from "../../SocketService";
import { ADDRESS } from "../../../assets/RegexPatterns";
import { HMLandRegistryProcess } from "./HMLandRegistryProcess";


export class HMLandRegistryPrices extends HMLandRegistryProcess {

    protected id = "HMLandRegistryPrices";           
    protected name: "Property Price Check";
    protected pattern: RegExp = ADDRESS;


    //  Process extends the ResponseEmitter class, so be sure to include an argument for the socket
    //  Processes also take a query on creation
    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }


    //  Overwrite of the abstract function held in Process.ts
    //  This function is what is called when the Process executes
    //  It returns a SearchioResponse containing any success or error data
    public async process(): Promise<SearchioResponse> {
        
        await this.initWebdriver();
        let result = await this.pricesSearch();
        await this.destroyWebdriver();
        return result;
    }


    // Function to load search, takes in postcode or street name
    public async loadSearch(address: string = this.query): Promise<SearchioResponse> {

        try {
            let reg = new RegExp (/[A-Z a-z]{1,2}[0-9]{1,2}[\s]*[0-9][A-Z a-z]{1,2}/)

            let postcode = reg.exec(address);

            if(postcode != null){
                let inputPostcode = postcode[0]
                console.log(`Detected Postcode: ${inputPostcode}`);
                await this.driver.get('https://search-property-information.service.gov.uk/');
                await this.waitForElement('//input[@id="search_input"]', 20);
                await this.driver.findElement(this.webdriver.By.xpath('//input[@id="search_input"]')).sendKeys(inputPostcode);
                await this.driver.findElement(this.webdriver.By.xpath('//button[@name="submit_button"]')).click();

            } else {
                console.log(`No Postcode Detected, using address: ${address}`);
                await this.driver.get('https://search-property-information.service.gov.uk/');
                await this.waitForElement('//input[@id="search_input"]', 20);
                await this.driver.findElement(this.webdriver.By.xpath('//input[@id="search_input"]')).sendKeys(address);
                await this.driver.findElement(this.webdriver.By.xpath('//button[@name="submit_button"]')).click();
            }

                        
            return this.success(`(HMLandRegistryPrices) Successfully loaded search`);
        
        } catch(err) {
            return this.error(`(HMLandRegistryPrices) Error loading search`, err)
        }
    }

    // Function to compare two string and give a score on their similarity
    public async compare(address, value): Promise<SearchioResponse> {
        try {
            address = address.toLowerCase();
            value = value.toLowerCase();
            
            var costs = new Array();
            for (var i = 0; i <= address.length; i++) {
                var lastValue = i;
                for (var j = 0; j <= value.length; j++) {
                if (i == 0)
                    costs[j] = j;
                else {
                    if (j > 0) {
                    var newValue = costs[j - 1];
                    if (address.charAt(i - 1) != value.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue),
                        costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                    }
                }
                }
                if (i > 0)
                costs[value.length] = lastValue;
            }
            return this.success(`(HMLandRegistryPrices) Successfully compared addresses`, costs[value.length]);
        } catch(err) {
            return this.error(`(HMLandRegistryPrices) Error comparing addresses`, err)
        }
    }

    // Function to find the best address match out of results
    public async findBestMatch(address: string, elements: any[]): Promise<SearchioResponse> {
        try {

            let bestMatchIndex = 0;
            let bestMatchScore = 1000;
            
            for (let i = 0; i < elements.length; i++) {
                let value = await elements[i].getText();
                let comparison = await this.compare(address, value);
                if(comparison.data < bestMatchScore) {
                    bestMatchScore = comparison.data
                    bestMatchIndex = i
                }
            }

            console.log(`\n\nBest match was address at index ${bestMatchIndex} with a score of ${bestMatchScore}`);
            let y = await elements[bestMatchIndex].getText();
            console.log(`This address was ${y}`);
            
            
            return this.success(`(HMLandRegistryPrices) Successfully found best address match`, bestMatchIndex);
        
        } catch(err) {
            return this.error(`(HMLandRegistryPrices) Error finding best address match`, err)
        }
    }

    // Function to strip information from the chosen address page
    public async stripInfo(): Promise<SearchioResponse> {
        try {

            let recordFormat: {   
                address: string, 
                description?: string,
                tenure?: string,
                price?: string

            } = {
                address: undefined
            };

            let address = await this.driver.findElement(this.webdriver.By.xpath('//dl[@class="summary-list"]/div[1]/dd/p[1]')).getText();
            let description = await this.driver.findElement(this.webdriver.By.xpath('//dl[@class="summary-list"]/div[2]/dd/p[1]')).getText();
            let tenure = await this.driver.findElement(this.webdriver.By.xpath('//dl[@class="summary-list"]/div[3]/dd')).getAttribute('innerHTML');
            let price = await this.driver.findElement(this.webdriver.By.xpath('//dl[@class="summary-list"]/div[4]/dd')).getText();

            recordFormat.address = address;
            recordFormat.description = description;
            recordFormat.tenure = tenure.split('\n')[1].trim();
            recordFormat.price = price;
            
            
            return this.success(`(HMLandRegistryPrices) Successfully stripped best address match info`, recordFormat);
        
        } catch(err) {
            return this.error(`(HMLandRegistryPrices) Error stripping best address match info`, err)
        }
    }

    // Main function to call (calls all others)
    public async pricesSearch(address: string = this.query): Promise<SearchioResponse> {

        try {
            await this.loadSearch(address);
            
            await this.waitForElement('//main[@id="main-content"]', 20);

            let numberFound = await this.driver.findElement(this.webdriver.By.xpath('//main[@id="main-content"]/div[2]/div/p[1]')).getText();


            let elements = await this.driver.findElements(this.webdriver.By.xpath('//ul[@class="govuk-list"]/li'));
            console.log(`Of ${numberFound}, we have obtained ${elements.length}`);

            let index = await this.findBestMatch(address, elements);

            await elements[index.data].findElement(this.webdriver.By.xpath('./p/a')).click();

            let check = await this.driver.findElements(this.webdriver.By.xpath('//ul[@class="govuk-list"]/li'));
            if(check.length > 0){
                return this.error(`(HMLandRegistryPrices) Error! Address was not specific enough`)
            } else {
                let info = await this.stripInfo();
                console.log(info);
                return this.success(`(HMLandRegistryPrices) Successfully completed check`, info.data);
            }

        } catch(err) {
            return this.error(`(HMLandRegistryPrices) Error completing check`, err)
        }
    }

    


 

}