import { SearchioResponse } from "../../../models/SearchioResponse";
import { SocketService } from "../../SocketService";
import { ANY } from "../../../assets/RegexPatterns";
import { InsolvencyServiceProcess } from "./InsolvencyServiceProcess";


export class InsolvencyServiceSearchIndividuals extends InsolvencyServiceProcess {
    
    protected id = "InsolvencyServiceSearchIndividuals";           
    protected name: "Insolvency Service Search Individuals";
    protected pattern: RegExp = ANY;

    public table = {

        columns: [
            { title: "Forename", key: "forename", type: "Text" },
            { title: "Surname", key: "surname", type: "Text" },
            { title: "Date of Birth", key: "dob", type: "Text" },
            { title: "Court", key: "court", type: "Text" },
            { title: "Number", key: "number", type: "Text" },
            { title: "Start Date", key: "startDate", type: "Text" },
            { title: "Type", key: "type", type: "Text" },
            { title: "Address", key: "address", type: "Text" },
            { title: "Link", key: "link", type: "Text" }
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
    public async loadSearch(searchTerm: string = this.query): Promise<SearchioResponse> {
        try {
            await this.driver.get(`https://www.insolvencydirect.bis.gov.uk/eiir/`);

            // Click the button to search by name
            await this.driver.findElement(this.webdriver.By.xpath('//form[@id="frmMaster"]/table/tbody/tr/td/input')).click();
            // Wait for element on name page to load
            await this.waitForElement('//fieldset[@id="fstSurname"]', 15);
            
            // Sort the names so we get surname and forenames
            if(searchTerm.split(' ').length > 1 ){
                let fullName = searchTerm.split(' ');
                let surname = fullName[fullName.length - 1]
                let forename = searchTerm.replace(surname, '');

                // Input the surname and forename
                await this.driver.findElement(this.webdriver.By.xpath('//fieldset[@id="fstSurname"]/table/tbody/tr/td[2]/input')).sendKeys(surname);
                await this.driver.findElement(this.webdriver.By.xpath('//fieldset[@id="fstForename"]/table/tbody/tr/td[2]/input')).sendKeys(forename);
                
                // Click search
                await this.driver.findElement(this.webdriver.By.xpath('//form[@name="NameDetails"]/table/tbody/tr/td/input')).click();
                
                return this.success(`Successfully loaded name search`);

            } else if (searchTerm.split(' ').length == 1 ) {
                
                // Input the only name given (presumed surname)
                await this.driver.findElement(this.webdriver.By.xpath('//fieldset[@id="fstSurname"]/table/tbody/tr/td[2]/input')).sendKeys(searchTerm);
                
                // Click search
                await this.driver.findElement(this.webdriver.By.xpath('//form[@name="NameDetails"]/table/tbody/tr/td/input')).click();
                
                return this.success(`Successfully loaded name search`);

            } else {
                return this.error(`Error determining forename and surname from ${searchTerm}`);
            }

        } catch(err) {
            return this.error(`Error loading search`, err);
        }
    }

    // Function to scrape individuals
    public async scrapeEntities(entities): Promise<SearchioResponse> {
        
        const t = this;

        try {
            
            console.log(`We have ${entities.length} entities on this page`);
            
            // Iterate through the entities on this page and strip out information associated with each one
            for(let entity of entities){
                
                let forename = await entity.findElement(t.webdriver.By.xpath('./td[1]')).getText();
                let surname = await entity.findElement(t.webdriver.By.xpath('./td[2]')).getText();
                let dob = await entity.findElement(t.webdriver.By.xpath('./td[3]')).getText();
                let court = await entity.findElement(t.webdriver.By.xpath('./td[4]')).getText();
                let number = await entity.findElement(t.webdriver.By.xpath('./td[5]')).getText();
                let startDate = await entity.findElement(t.webdriver.By.xpath('./td[6]')).getText();
                let type = await entity.findElement(t.webdriver.By.xpath('./td[7]')).getText();
                let address = await entity.getAttribute('onmouseover');
                let link = await entity.findElement(t.webdriver.By.xpath('./td[2]/a')).getAttribute('href');

                address = address.replace('javascript:change("<i>', '');
                address = address.replace('+ "</i>")', '');
                address = address.split('+')[5];
                address = address.replace(' "', '');
                address = address.replace('"', '');

                this.table.rows.push({
                    forename: forename,
                    surname: surname,
                    dob: dob,
                    court: court,
                    number: number,
                    startDate: startDate,
                    type: type,
                    address: address,
                    link: link
                });
                                
            }

            return this.success(`Successfully scraped entities on this page`);

        } catch(err) {
            return this.error(`Error scraping entities on this page`, err);
        }
    }


    // Function to call flipThrough and scrape Insolvency Service
    public async scrapePages(setLimit = 5): Promise<SearchioResponse> {
        try {
            // Check we have some results
            await this.waitForElement('//div[@id="mainbody"]', 15);
            
            // Check that we have results to go through
            let check = await this.driver.findElements(this.webdriver.By.xpath('//div[@id="emptysearchbox"]'));
            // If no results return error
            if(check.length > 0) {
                
                return this.error(`No results for search term`);
            
            // Else get the total number of pages we can go through
            } else {

                let currentPage = await this.driver.findElement(this.webdriver.By.xpath('//div[@id="mainbody"]/font/strong')).getText();
                let totalPages = await this.driver.findElement(this.webdriver.By.xpath('//div[@id="mainbody"]/font[2]/strong')).getText();

                // Iterate through each page until either setLimit or totalPages is met
                for(let i = 1; i <= setLimit && i <= totalPages; i++) {
                    
                    // Wait for table to load in
                    await this.waitForElement('//table[@class="DataTable"]', 15);
                    // Collect the entities
                    let entities = await this.driver.findElements(this.webdriver.By.xpath('//table[@class="DataTable"]/tbody/tr'));
                    // Caall function to scrape them
                    await this.scrapeEntities(entities);

                    // Click next button
                    await this.driver.findElement(this.webdriver.By.xpath(`//div[@id="mainbody"]/a[contains(text(), '${i+1}')]`)).click();

                }

                return this.success(`Successfully scraped Insolvency Service`);
            }

        } catch(err) {
            return this.error(`Error scraping Insolvency Service`, err);
        }
    }

    // Main function called to perform search
    public async search(searchTerm: string = this.query): Promise<SearchioResponse> {
        try{
            await this.loadSearch(searchTerm);

            await this.scrapePages();

            await this.pause(15000);

            return this.success(`Successfully performed Insolvency Service search`, this.table);

        } catch(err) {
            return this.error(`Error searching Insolvency Service`, err);
        }
    }

}