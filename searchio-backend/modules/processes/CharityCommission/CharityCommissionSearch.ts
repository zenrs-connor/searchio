import { SearchioResponse } from "../../../models/SearchioResponse";
import { CharityCommissionProcess } from "./CharityCommissionProcess";
import { SocketService } from "../../SocketService";
import { ANY } from "../../../assets/RegexPatterns";
import { WebLink } from "../../../models/WebLink";

export class CharityCommissionSearch extends CharityCommissionProcess {
    
    protected id = "CharityCommissionSearch";           
    protected name: "Charity Commission Search";
    protected pattern: RegExp = ANY;

    public table = {

        columns: [
            { title: "Charity Number", key: "charityNumber", type: "Webpage" },
            { title: "Charity Name", key: "charityName", type: "Webpage" },
            { title: "Status", key: "status", type: "Text" },
            { title: "Income", key: "income", type: "Text" },
            { title: "Reporting", key: "reporting", type: "Text" }
        ],
        rows: []
    }
    
    public charityFormat: {
        about: string,
        income?: string,
        expenditure?: string,
        employees?: string,
        trustees?: string,
        volunteers?: string,
        what?: string,
        who?: string,
        how?: string,
        where?: string,
        registration?: string,
        organisationType?: string,
        otherNames?: string,
        giftAid?: string,
        regulators?: string,
        policies?: string,
        complaintsHandling?: string,
        property?: string,
        companyNumber?: string,
        trusteesDetails?: string,
        finance?: string,
        assets?: any[],
        accounts?: string[],
        governingDocument?: string,
        charitableObjects?: string,
        areaOfBenefit?: string,
        address?: string,
        email?: string,
        phoneNumber?: string,
        website?: string

    } = {
        about: undefined
    };
    
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
            await this.driver.get(`https://register-of-charities.charitycommission.gov.uk/charity-search`);

            // Wait for cookies to load
            await this.waitForElement('//a[@class="btn btn-primary btn-cookie-consent govuk-button"]', 20);

            // Accept cookies
            await this.driver.findElement(this.webdriver.By.xpath('//a[@class="btn btn-primary btn-cookie-consent govuk-button"]')).click();

            // Wait for input to load
            await this.waitForElement('//input[@class="govuk-input"]', 20);

            // Input search term
            await this.driver.findElement(this.webdriver.By.xpath('//input[@class="govuk-input"]')).sendKeys(searchTerm);

            // Wait for search button to load
            await this.waitForElement('//button[@class="govuk-button"]', 20);

            // Click search button
            await this.driver.findElement(this.webdriver.By.xpath('//button[@class="govuk-button"]')).click();

            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err);
        }
    }

    // Function called to actually scrape and store all charities in table
    public async scrapePage(results):Promise<SearchioResponse> {

        try{

            const t = this;

            for(let result of results) {

                let charityNumber = '';
                let charityName = '';
                let status = '';
                let income = '';
                let reporting = '';

                let link = await result.findElement(t.webdriver.By.xpath('.//td[@class="table-cell govuk-table__cell first"]/a')).getAttribute('href');
                charityNumber = await result.findElement(t.webdriver.By.xpath('.//td[@class="table-cell govuk-table__cell first"]/a')).getText();
                charityName = await result.findElement(t.webdriver.By.xpath('.//td[2]/a')).getText();
                status = await result.findElement(t.webdriver.By.xpath('.//td[3]')).getText();
                income = await result.findElement(t.webdriver.By.xpath('.//td[4]')).getText();
                reporting = await result.findElement(t.webdriver.By.xpath('.//td[5]')).getText();
                

                this.table.rows.push({
                    charityNumber: { text: charityNumber, url: link } as WebLink,
                    charityName: { text: charityName, url: link } as WebLink,
                    status: status,
                    income: income,
                    reporting: reporting
                });
            }

            return this.success(`Successfully scraped page of results`);

        } catch(err) {
            return this.error(`Error scraping page of results`, err)
        }
    }

    // Scrape the table of all charities that appeared in the search for given search term
    public async scrapeCharities():Promise<SearchioResponse> {

        try {
            await this.waitForElement('//ul[@class="pagination"]', 15);
            await this.flipThrough('//span[@title="Next Page"]/..', '//tbody[@class="table-data"]/tr[@class=" govuk-table__row  "]', this.scrapePage.bind(this), 2);
            
            return this.success(`Successfully scraped charities`);

        } catch(err) {
            return this.error(`Could not scrape charities`, err);
        }

    }

    // Function to scrape overview of a charity
    public async scrapeOverview():Promise<SearchioResponse> {

        const t = this;

        try {
            await t.waitForElement('//div[@class="col-md-12 col-md-9 col-xl-10 onereg__body"]', 20);

            let check = await t.driver.findElements(t.webdriver.By.xpath('//p[contains(text(), "activities is not available")]'));

            if(check.length > 0) {

                this.charityFormat.about = 'Not available';
                this.charityFormat.income = 'Not available';
                this.charityFormat.expenditure = 'Not available';
                this.charityFormat.employees = 'Not available';
                this.charityFormat.trustees = 'Not available';
                this.charityFormat.volunteers = 'Not available';

            } else {

                let about = await t.driver.findElement(t.webdriver.By.xpath('//div[@class="col-md-12 col-md-9 col-xl-10 onereg__body"]/div/div/p')).getText();
                let income = await t.driver.findElement(t.webdriver.By.xpath('//div[contains(text(), "Total income:")]')).getText();
                let expenditure = await t.driver.findElement(t.webdriver.By.xpath('//div[contains(text(), "Total expenditure:")]')).getText();

                this.charityFormat.about = about;
                this.charityFormat.income = income;
                this.charityFormat.expenditure = expenditure;
                
                let employees = await t.driver.findElements(t.webdriver.By.xpath('//strong[contains(text(), "Employee(s)")]'));
                if(employees.length > 0) {
                    employees = await t.driver.findElement(t.webdriver.By.xpath('//strong[contains(text(), "Employee(s)")]')).getText();
                } else {
                    employees = 'No information on employees'
                }

                let trustees = await t.driver.findElements(t.webdriver.By.xpath('//strong[contains(text(), "Trustee(s)")]'));
                if(trustees.length > 0) {
                    trustees = await t.driver.findElement(t.webdriver.By.xpath('//strong[contains(text(), "Trustee(s)")]')).getText();
                } else {
                    trustees = 'No infomration on trustees'
                }

                let volunteers = await t.driver.findElements(t.webdriver.By.xpath('//strong[contains(text(), "Volunteer(s)")]'));
                if(volunteers.length > 0) {
                    volunteers = await t.driver.findElement(t.webdriver.By.xpath('//strong[contains(text(), "Volunteer(s)")]')).getText();
                } else {
                    volunteers = 'No information on volunteers'
                }

                this.charityFormat.employees = employees;
                this.charityFormat.trustees = trustees;
                this.charityFormat.volunteers = volunteers;
            }
            
            return this.success(`Successfully scraped charity overview`);

        } catch(err) {
            return this.error(`Could not scrape charity overview`, err);
        }

    }

    // Function to scrape what, who, how and where of a charity
    public async scrapeWWHW():Promise<SearchioResponse> {

        const t = this;

        try {
            await t.waitForElement('//div[@class="col-md-12 col-md-9 col-xl-10 onereg__body"]', 20);

            // What the charity does
            let what = await t.driver.findElement(t.webdriver.By.xpath('//div[@class="col-md-12 col-md-9 col-xl-10 onereg__body"]/div[1]/div[2]')).getText();
            // Who the charity helps
            let who = await t.driver.findElement(t.webdriver.By.xpath('//div[@class="col-md-12 col-md-9 col-xl-10 onereg__body"]/div[2]/div[2]')).getText();
            // How the charity helps
            let how = await t.driver.findElement(t.webdriver.By.xpath('//div[@class="col-md-12 col-md-9 col-xl-10 onereg__body"]/div[3]/div[2]')).getText();
            // Where the charity operates
            let where = await t.driver.findElement(t.webdriver.By.xpath('//div[@class="col-md-12 col-md-9 col-xl-10 onereg__body"]/div[4]/div[2]')).getText();

            this.charityFormat.what = what.split('\n');
            this.charityFormat.who = who.split('\n');
            this.charityFormat.how = how.split('\n');
            this.charityFormat.where = where.split('\n');
            
            return this.success(`Successfully scraped charity who, what, how and where`);

        } catch(err) {
            return this.error(`Could not scrape charity who, what, how and where`, err);
        }

    }

    // Function to scrape governance of a charity
    public async scrapeGovernance():Promise<SearchioResponse> {


        const t = this;

        try {
            await t.waitForElement('//div[@class="col-md-12 col-md-9 col-xl-10 onereg__body"]', 20);

            let entries = await t.driver.findElements(t.webdriver.By.xpath('//div[@class="col-md-12 col-md-9 col-xl-10 onereg__body"]/div'));

            for(let entry of entries) {
                let title = await entry.findElement(t.webdriver.By.xpath('./div')).getText();
                let desc = await entry.findElement(t.webdriver.By.xpath('./div[2]')).getText();

                if(title == 'Registration history:') {
                    this.charityFormat.registration = desc;
                } else if (title == 'Organisation type:') {
                    this.charityFormat.organisationType = desc;
                } else if (title == 'Other names:') {
                    this.charityFormat.otherNames = desc;
                } else if (title == 'Gift aid:') {
                    this.charityFormat.giftAid = desc;
                } else if (title == 'Other regulators:') {
                    this.charityFormat.regulators = desc;
                } else if (title == 'Policies:') {
                    this.charityFormat.policies = desc;
                } else if (title == 'Land and property:') {
                    this.charityFormat.property = desc;
                } else if (title == 'Company number:') {
                    this.charityFormat.companyNumber = desc;
                } else {
                    console.log(`Within Governance tab we cannot handle ${title}`);
                }
            }
            
            return this.success(`Successfully scraped charity governance`);

        } catch(err) {
            return this.error(`Could not scrape charity governance`, err);
        }

    }

    // Function to scrape trustees of a charity
    public async scrapeTrustees():Promise<SearchioResponse> {

        const t = this;

        try {

            //let table = await t.driver.findElement(this.webdriver.By.xpath('//thead[@class="govuk-table__head"]'));
            //let rows = await table.findElements(this.webdriver.By.xpath('//tr[position() > 1]'));
            //console.log(`We have ${rows.length} rows?`);


            // This function is quite difficult and needs to be revisited
            // Tables can vary quite a lot so a link will be provided for the time being

            let trusteesLink = await t.driver.getCurrentUrl();
            this.charityFormat.trusteesDetails = trusteesLink;

            
            
            return this.success(`Successfully scraped charity trustees`);

        } catch(err) {
            return this.error(`Could not scrape charity trustees`, err);
        }

    }

    // Function to scrape financial history of a charity
    public async scrapeFinance():Promise<SearchioResponse> {

        const t = this;

        try {
            // This function is quite difficult and needs to be revisited
            // Tables can vary quite a lot so a link will be provided for the time being

            let check = await t.driver.findElements(t.webdriver.By.xpath('//div[contains(text(), "This charity was registered recently")]'));

            if(check.length > 0) {

                this.charityFormat.finance = 'This charity was registered recently. It does not have to provide information until 10 months after its first financial period.';

            } else {
                let financeLink = await t.driver.getCurrentUrl();
                this.charityFormat.finance = financeLink;
            }
            
            
            return this.success(`Successfully scraped charity finance`);

        } catch(err) {
            return this.error(`Could not scrape charity finance`, err);
        }

    }

    // Function to scrape assets and liabilities of a charity
    public async scrapeAssets():Promise<SearchioResponse> {

        const t = this;

        try {

            let tempHold = [];

            let rows = await t.driver.findElements(t.webdriver.By.xpath('//table[@class="govuk-table "]/tbody/tr'));
            for(let row of rows) {
                let asset = await row.findElement(t.webdriver.By.xpath('./th')).getText();
                let entries = await row.findElements(t.webdriver.By.xpath('./td'));
                let latestEntry = await row.findElement(t.webdriver.By.xpath(`./td[${entries.length}]`)).getText();

                // Push the asset and its latest details into the assets list
                let input = {}
                input[asset] = latestEntry;
                tempHold.push(input);
            }

            this.charityFormat.assets = tempHold;
            return this.success(`Successfully scraped charity assets`);

        } catch(err) {
            return this.error(`Could not scrape charity assets`, err);
        }

    }

    // Function to scrape accounts and returns of a charity
    public async scrapeAccounts():Promise<SearchioResponse> {

        const t = this;

        try {

            let tempHold = [];
            
            let check = await t.driver.findElements(t.webdriver.By.xpath('//div[contains(text(), "This is a newly registered charity")]'));

            if(check.length > 0) {
                tempHold.push('This is a newly registered charity - accounts and annual return not required yet. The charity does not need to update its information until 10 months after its first financial period ends.');
            } else {
                let links = await t.driver.findElements(t.webdriver.By.xpath('//a[@class="govuk-link accounts-download-link"]'));
                for(let link of links) {
                    let text = await link.getAttribute('href');
                    tempHold.push(text);
                }
            }
            
            this.charityFormat.accounts = tempHold;
            return this.success(`Successfully scraped charity accounts`);

        } catch(err) {
            return this.error(`Could not scrape charity accounts`, err);
        }

    }

    // Function to scrape governing document of a charity
    public async scrapeGoverning():Promise<SearchioResponse> {

        const t = this;    
        
        try {
            let entries = await t.driver.findElements(t.webdriver.By.xpath('//div[@class="col-md-12 col-md-9 col-xl-10 onereg__body"]/div/div'));

            for(let entry of entries){
                let title = await entry.findElement(t.webdriver.By.xpath('./div/h3')).getText();
                let text = await entry.findElement(t.webdriver.By.xpath('./div/p')).getText();

                if(title == 'Governing document') {
                    this.charityFormat.governingDocument = text;
                } else if (title == 'Charitable objects') {
                    this.charityFormat.charitableObjects = text;
                } else if (title == 'Area of benefit') {
                    this.charityFormat.areaOfBenefit = text;
                } else {
                    console.log(`We cannot handle ${title} in Governing tab`);
                }
            }
            
            return this.success(`Successfully scraped charity governing`);

        } catch(err) {
            return this.error(`Could not scrape charity governing`, err);
        }

    }

    // Function to scrape contact information of a charity
    public async scrapeContact():Promise<SearchioResponse> {

        const t = this;

        try {
            let entries = await t.driver.findElements(t.webdriver.By.xpath('//dl[@class="govuk-summary-list govuk-summary-list--no-border"]/div'));

            for(let entry of entries) {
                let title = await entry.findElement(t.webdriver.By.xpath('./dt')).getText();
                let text = await entry.findElement(t.webdriver.By.xpath('./dd')).getText();

                if(title == 'Address:') {
                    this.charityFormat.address = text;
                } else if (title == 'Phone:') {
                    this.charityFormat.phoneNumber = text;
                } else if (title == 'Email:') {
                    this.charityFormat.email = text;
                } else if (title == 'Website:') {
                    this.charityFormat.website = text;
                } else {
                    console.log(`We cannot handle ${title} in Contact information tab`);
                }
            }

            return this.success(`Successfully scraped charity contact`);

        } catch(err) {
            return this.error(`Could not scrape charity contact`, err);
        }

    }

    // When given a specific charity number, will do a more in depth scrape of the information available on an individual charity
    public async scrapeCharity():Promise<SearchioResponse> {

        try {
            // Wait for results to search
            await this.waitForElement('//tbody[@class="table-data"]', 20);
            
            // Check a link is present
            let results = await this.driver.findElements(this.webdriver.By.xpath('//tbody[@class="table-data"]/tr[@class=" govuk-table__row  "]'));
            if(results.length > 0) {
                // Click the first link
                await this.driver.findElement(this.webdriver.By.xpath('//tbody[@class="table-data"]/tr[@class=" govuk-table__row  "]/td/a')).click();
                
                // Wait for chairty page to load
                await this.waitForElement('//div[@class="container-fluid onereg__container"]', 20);
                console.log('We found a charity that matches the number provided');

                let pages = await this.driver.findElements(this.webdriver.By.xpath('//ul[@class="govuk-list"]/li/a'));
                for(let page of pages){
                    let text = await page.getText();
                    if(text == 'Charity overview'){
                        await this.openKillTab(page, this.scrapeOverview.bind(this));
                    } else if(text == 'What, who, how, where') {
                        await this.openKillTab(page, this.scrapeWWHW.bind(this));
                    } else if(text == 'Governance') {
                        await this.openKillTab(page, this.scrapeGovernance.bind(this));
                    } else if(text == 'Trustees') {
                        await this.openKillTab(page, this.scrapeTrustees.bind(this));
                    } else if(text == 'Financial history') {
                        await this.openKillTab(page, this.scrapeFinance.bind(this));
                    } else if(text == 'Assets and liabilities') {
                        await this.openKillTab(page, this.scrapeAssets.bind(this));
                    } else if(text == 'Accounts and annual returns') {
                        await this.openKillTab(page, this.scrapeAccounts.bind(this));
                    } else if(text == 'Governing document') {
                        await this.openKillTab(page, this.scrapeGoverning.bind(this));
                    } else if(text == 'Contact information') {
                        await this.openKillTab(page, this.scrapeContact.bind(this));
                    } else {
                        console.log(`We do not have a function for the page relating to ${text} `);
                    }
                }

                return this.success(`Successfully scraped charity`);
            } else {
                return this.error(`We could not find a charity that matches the number provided`);
            }

        } catch(err) {
            return this.error(`Could not scrape charity`, err);
        }

    }

    // Re-define function that takes in link and opens it in a new tab iteratively to perform a process
    public async openKillTab(link: any, process: any): Promise<SearchioResponse> {

        try {

            // Opening link in new tab
            await link.sendKeys(this.webdriver.Key.CONTROL + this.webdriver.Key.RETURN);
            
            await this.pause(2000);

            // Switching tabs
            let tabs = await this.driver.getAllWindowHandles();
            await this.driver.switchTo().window(tabs[tabs.length - 1]);
            
            // Performing process
            await process();

            
            await this.pause(1500);
            
            // Killing tab
            await this.driver.close();
            await this.pause(2000);
            await this.driver.switchTo().window(tabs[tabs.length - 2]);
            
            return this.success(`Successfully opened link and opened/killed tab`);
        } catch(err) {
            return this.error(`Could not open link in new tab`, err);
        }
    }





    // Main function called to perform search
    public async search(searchTerm: string = this.query): Promise<SearchioResponse> {
        try{
            await this.loadSearch();

            if(/^[0-9]{4,}$/.test(searchTerm) == true){
                await this.scrapeCharity();
                await this.pause(10000);
                return this.success(`Successfully scraped Charity Commission`, this.charityFormat);

            } else {
                await this.scrapeCharities();
                await this.pause(10000);
                return this.success(`Successfully scraped Charity Commission`, this.table);
            }

        } catch(err) {
            return this.error(`Error searching Charity Commission`, err);
        }
    }

}