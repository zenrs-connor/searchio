import { SearchioResponse } from "../../../models/SearchioResponse";
import { WebElement } from "selenium-webdriver";
import { SocketService } from "../../SocketService";
import { CompaniesHouseProcess } from "./CompaniesHouseProcess";
import { BUSINESS } from "../../../assets/RegexPatterns";
import { ResultData } from "../../../models/ResultData";


export class CompaniesHouseCompanySearch extends CompaniesHouseProcess {

    protected id = "CompaniesHouseCompanySearch";           
    protected name: string = "Company Check";
    protected pattern: RegExp = BUSINESS;



    //  Process extends the ResponseEmitter class, so be sure to include an argument for the socket
    //  Processes also take a query on creation
    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }


    //  Overwrite of the abstract function held in Process.ts
    //  This function is what is called when the Process executes
    //  It returns a SearchioResponse containing any success or error data
    protected async process(): Promise<SearchioResponse> {
        
        await this.initWebdriver();
        let result = await this.stripCompanyInformation();
        await this.destroyWebdriver();
        return result;
    }


    // Function to strip companies out of search
    public async companySearch(company: string): Promise<SearchioResponse> {

        // Prepare company name for URL
        company = company.replace(/\s+/g, '+');
        let links: any[] = [];

        try {

            await this.naviagteTo(`https://find-and-update.company-information.service.gov.uk/search?q=${company}`);

            let res = await this.collectLinks("//ul[@id='results']/li/h3/a");

            if(res.success) {

                links = (res.data as WebElement[]);

            } else {
                return this.success(`(CompaniesHouseScraperStream) Successfully performed company search but no results`);
            }
            
            return this.success(`(CompaniesHouseScraperStream) Successfully performed company search`, links);
        } catch(err) {
            return this.error(`(CompaniesHouseScraperStream) Error performing company search`, err)
        }
    }

    // Function to strip a single companies overview 
    public async stripCompanyOverview(): Promise<SearchioResponse> {
        
        try {

            let companyNumber = await this.driver.findElement(this.webdriver.By.xpath("//p[@id='company-number']/strong")).getText();
            let companyName = await this.driver.findElement(this.webdriver.By.xpath("//p[@class='heading-xlarge']")).getText();
            let companyAddress = await this.driver.findElement(this.webdriver.By.xpath("//div[@id='content-container']/dl/dd")).getText();
            let status = await this.driver.findElement(this.webdriver.By.xpath("//dd[@id='company-status']")).getText();
            let companyType = await this.driver.findElement(this.webdriver.By.xpath("//dd[@id='company-type']")).getText();
            let creationDate = await this.driver.findElement(this.webdriver.By.xpath("//dd[@id='company-creation-date']")).getText();
            let companyAccounts = await this.driver.findElement(this.webdriver.By.xpath("//div[@id='content-container']/div[5]/div/p")).getText();
            let companyStatement = await this.driver.findElement(this.webdriver.By.xpath("//div[@id='content-container']/div[5]/div[2]/p")).getText();
            


            let naturesOfBusinessStr = ''
            let naturesOfBusiness = await this.driver.findElements(this.webdriver.By.xpath("//div[@id='content-container']/ul/li"));
            for (let natureOfBusiness of naturesOfBusiness) {
                let nature = await natureOfBusiness.findElement(this.webdriver.By.xpath("./span")).getText();
                naturesOfBusinessStr += nature + ', ';
            }

            if(naturesOfBusinessStr.length > 0) {
                naturesOfBusinessStr = naturesOfBusinessStr.substr(0, naturesOfBusinessStr.length - 2);
            }

            
            let previousNamesStr: string = '';
            let previousNames = await this.driver.findElements(this.webdriver.By.xpath("//table[@id='previousNameTable']/tbody/tr"));
            if(previousNames.length > 0) {
                previousNames.shift();
                
                for(let previousName of previousNames) {
                    let previousNamesFormat: {name: string, period?: string} = {
                        name: undefined
                    };

                    let name = await previousName.findElement(this.webdriver.By.xpath("./td")).getText();
                    let period = await previousName.findElement(this.webdriver.By.xpath("./td[2]")).getText();

                    previousNamesFormat.name = name;
                    previousNamesFormat.period = period;

                    previousNamesStr += `${name} (${period}), `
                }
            }

            if(previousNamesStr.length > 0) {
                previousNamesStr = previousNamesStr.substr(0, previousNamesStr.length - 2);
            }
    

            let results: ResultData[] = [];

            results.push({ name: 'Company Name', type: 'Text', data: companyName })
            results.push({ name: 'Company Number', type: 'Number', data: companyNumber })
            results.push({ name: 'Company Address', type: 'Text', data: companyAddress })
            results.push({ name: 'Company Status', type: 'Text', data: status })
            results.push({ name: 'Company Type', type: 'Text', data: companyType })
            results.push({ name: 'Creation Date', type: 'Date', data: new Date(creationDate) })
            results.push({ name: 'Company Accounts', type: 'Text', data: companyAccounts.replace(/\n/g, " ") })
            results.push({ name: 'Company Statments', type: 'Text', data: companyStatement.replace(/\n/g, " ") })
            results.push({ name: 'Natures of Business', type: 'Text', data: naturesOfBusinessStr })
            results.push({ name: 'Previous Names', type: 'Text', data: previousNamesStr })

            return this.success(`(CompaniesHouseScraperStream) Successfully collected company overview`, results);
        } catch(err) {
            return this.error(`(CompaniesHouseScraperStream) Error collecting company overview`, err)
        }
    }

    // Function to strip a single companies filing history
    public async stripCompanyFilings(): Promise<SearchioResponse> {
        
        let companyFilings: any[] = []; 

        try {
            let filings = await this.driver.findElements(this.webdriver.By.xpath("//table[@id='fhTable']/tbody/tr"));
            filings.shift();

            const table = {
                columns: [
                    { key: "date", title: "Date Filed", type: "Date", width: '100px'},
                    { key: "description", title: "Description", type: "Text"},
                    { key: "documents", title: "Documents", type: "Text"},
                ],
                rows: []
            }


            for(let filing of filings) {
                
                let date = await filing.findElement(this.webdriver.By.xpath(".//td[@class='nowrap']")).getText();
                let desc = await filing.findElement(this.webdriver.By.xpath(".//td[not(@id) and not(@class)]")).getText();
                let docs = await filing.findElement(this.webdriver.By.xpath(".//a[@class='download']")).getAttribute("href");
                
            
                table.rows.push({
                    date: date,
                    description: desc,
                    documents: docs
                })

            }

            const result: ResultData = {
                name: 'Company Filings',
                type: 'Table',
                data: table
            }

            return this.success(`(CompaniesHouseScraperStream) Successfully collected company filings`, [result]);

        } catch(err) {
            return this.error(`(CompaniesHouseScraperStream) Error collecting company filings`, err);
        }
    }

    // Function to strip a single companies people
    public async stripCompanyPeople(): Promise<SearchioResponse> {
        
        let companyPeople: any[] = []; 

        const table: any = {
            columns: [
                { title: "Name", key: "name", type: "Text"},
                { title: "Address", key: "address", type: "Text"},
                { title: "Role", key: "role", type: "Text"},
                { title: "Role Status", key: "roleStatus", type: "Text"},
                { title: "Date of Birth", key: "dob", type: "Date", width: "100px"},
                { title: "Date Appointed", key: "appointed", type: "Date", width: "100px"},
                { title: "Date Resigned", key: "resigned", type: "Date", width: "100px"},
                { title: "Nationality", key: "nationality", type: "Text"},
                { title: "Residence", key: "residence", type: "Text"},
                { title: "Occupation", key: "occupation", type: "Text"},
            ],
            rows: []
        }


        try {
            let appointments = await this.driver.findElements(this.webdriver.By.xpath("//div[@class='appointments-list']/div"));

            for(let person of appointments) {
                
                let peopleFormat: {
                    name: string,
                    address?: string,
                    role?: string,
                    roleStatus?: string,
                    DOB?: Date,
                    appointedDate?: Date,
                    resignedDate?: Date,
                    nationality?: string,
                    residence?: string,
                    occupation?: string
                } = {
                    name: undefined
                };

                let name = await person.findElement(this.webdriver.By.xpath("./h2/span")).getText();
                peopleFormat.name = name;

                let address = await person.findElement(this.webdriver.By.xpath("./dl")).getText();
                peopleFormat.address = address.replace(/\n/g, ": ");

                // Some of these elements do not always appear (checks in place)

                let dlElements = await person.findElements(this.webdriver.By.xpath(".//dl[@class='column-quarter']"));


                for(let dl of dlElements) {
                    let key = await dl.findElement(this.webdriver.By.xpath("./dt")).getText();

                    if(key == "Role ACTIVE") {
                        let role = await dl.findElement(this.webdriver.By.xpath("./dd")).getText();
                        peopleFormat.role = role;
                        peopleFormat.roleStatus = "ACTIVE";

                    } else if (key == "Role RESIGNED") {
                        let role = await dl.findElement(this.webdriver.By.xpath("./dd")).getText();
                        peopleFormat.role = role;
                        peopleFormat.roleStatus = "RESIGNED";

                    } else if (key == "Date of birth") {
                        let DOB = await dl.findElement(this.webdriver.By.xpath("./dd")).getText();
                        peopleFormat.DOB = DOB;

                    } else if (key == "Appointed on") {
                        let appointedDate = await dl.findElement(this.webdriver.By.xpath("./dd")).getText();
                        peopleFormat.appointedDate = new Date(appointedDate);

                    } else if (key == "Resigned on") {
                        let resignedDate = await dl.findElement(this.webdriver.By.xpath("./dd")).getText();
                        peopleFormat.resignedDate = new Date(resignedDate);

                    } else if (key == "Nationality") {
                        let nationality = await dl.findElement(this.webdriver.By.xpath("./dd")).getText();
                        peopleFormat.nationality = nationality;

                    } else if (key == "Country of residence") {
                        let residence = await dl.findElement(this.webdriver.By.xpath("./dd")).getText();
                        peopleFormat.residence = residence;

                    } else if (key == "Occupation") {
                        let occupation = await dl.findElement(this.webdriver.By.xpath("./dd")).getText();
                        peopleFormat.occupation = occupation;
                    }
                }


                table.rows.push({
                    name: name,
                    address: address,
                    role: peopleFormat.role,
                    roleStatus: peopleFormat.roleStatus,
                    dob: peopleFormat.DOB,
                    appointed: peopleFormat.appointedDate,
                    resigned: peopleFormat.resignedDate,
                    nationality: peopleFormat.nationality,
                    residence: peopleFormat.residence,
                    occupation: peopleFormat.occupation
                });

            }

            let result: ResultData = {
                name: 'People',
                type: "Table",
                data: table
            }

            return this.success(`(CompaniesHouseScraperStream) Successfully collected company people`, [result]);
        
        } catch(err) {
            return this.error(`(CompaniesHouseScraperStream) Error collecting company people`, err);
        }
    }

    // Function to strip a single companies charges
    public async stripCompanyCharge(): Promise<SearchioResponse> {
        
        try {
                
            let chargeFormat: {
                title: string,
                createdDate?: Date,
                deliveredDate?: Date,
                status?: string,
                transactionFiled?: string,
                docs?: string,
                personsEntitled?: string,
                mortageParticulars?: string,
                amountSecured?: string,
                fixedCharge?: string,
                floatingCharge?: string,
                floatingChargeCovers?: string,
                nativePledge?: string
            } = {
                title: undefined
            };

            let title = await this.driver.findElement(this.webdriver.By.xpath("//h2[@id='mortgage-heading']/..")).getText();
            chargeFormat.title = title.replace(/\n+/g, ' ');

            let createdDate = await this.driver.findElement(this.webdriver.By.xpath("//div[@id='content-container']/div[3]/dl/dd")).getText();
            chargeFormat.createdDate = new Date(createdDate);

            let deliveredDate = await this.driver.findElement(this.webdriver.By.xpath("//div[@id='content-container']/div[3]/dl[2]/dd")).getText();
            chargeFormat.deliveredDate = new Date(deliveredDate);

            let status = await this.driver.findElement(this.webdriver.By.xpath("//div[@id='content-container']/div[3]/dl[3]/dd")).getText();
            chargeFormat.status = status;

            let transactionFiled = await this.driver.findElement(this.webdriver.By.xpath("//div[@id='content-container']/div[4]/dl/dd/span")).getText();
            chargeFormat.transactionFiled = transactionFiled;

            let docs = await this.driver.findElements(this.webdriver.By.xpath("//div[@id='content-container']/div[4]/dl/ul/a"));
            if(docs.length > 0) {
                docs = await this.driver.findElement(this.webdriver.By.xpath("//div[@id='content-container']/div[4]/dl/ul/a")).getAttribute('href');
                chargeFormat.docs = docs;
            }

            let personsEntitled = await this.driver.findElement(this.webdriver.By.xpath("//ul[@id='persons-entitled']")).getText();
            chargeFormat.personsEntitled = personsEntitled;

            let mortageParticulars = await this.driver.findElements(this.webdriver.By.xpath("//span[@id='mortgage-particulars']"));
            if(mortageParticulars.length > 0) {
                mortageParticulars = await this.driver.findElement(this.webdriver.By.xpath("//span[@id='mortgage-particulars']")).getText();
                chargeFormat.mortageParticulars = mortageParticulars;
            }

            let amountSecured = await this.driver.findElements(this.webdriver.By.xpath("//p[@id='mortgage-amount-secured']"));
            if(amountSecured.length > 0) {
                amountSecured = await this.driver.findElement(this.webdriver.By.xpath("//p[@id='mortgage-amount-secured']")).getText();
                chargeFormat.amountSecured = amountSecured;
            }

            let fixedCharge = await this.driver.findElements(this.webdriver.By.xpath("//span[@id='contains-fixed-charge']"));
            if(fixedCharge.length > 0) {
                fixedCharge = await this.driver.findElement(this.webdriver.By.xpath("//span[@id='contains-fixed-charge']")).getText();
                chargeFormat.fixedCharge = fixedCharge;
            }

            let floatingCharge = await this.driver.findElements(this.webdriver.By.xpath("//span[@id='contains-floating-charge']"));
            if(floatingCharge.length > 0) {
                floatingCharge = await this.driver.findElement(this.webdriver.By.xpath("//span[@id='contains-floating-charge']")).getText();
                chargeFormat.floatingCharge = floatingCharge;
            }

            let floatingChargeCovers = await this.driver.findElements(this.webdriver.By.xpath("//span[@id='floating-charge-covers-all']"));
            if(floatingChargeCovers.length > 0) {
                floatingChargeCovers = await this.driver.findElement(this.webdriver.By.xpath("//span[@id='floating-charge-covers-all']")).getText();
                chargeFormat.floatingChargeCovers = floatingChargeCovers;
            }

            let nativePledge = await this.driver.findElements(this.webdriver.By.xpath("//span[@id='contains-negative-pledge']"));
            if(nativePledge.length > 0) {
                nativePledge = await this.driver.findElement(this.webdriver.By.xpath("//span[@id='contains-negative-pledge']")).getText();
                chargeFormat.nativePledge = nativePledge;
            }

            // DATES NEED TO BE ALTERED BY TIMZONE

            return this.success(`(CompaniesHouseScraperStream) Successfully collected a company charge`, chargeFormat);
        
        } catch(err) {
            return this.error(`(CompaniesHouseScraperStream) Error collecting a company charge`, err);
        }
    }

    // Function to iterate through all company charges and call stripCompanyCharge
    public async stripCompanyCharges(): Promise<SearchioResponse> {
        let companyChargesList: any[] = [];
        


        try {
            let charges = await this.driver.findElements(this.webdriver.By.xpath("//div[@id='mortgage-content']/div/h2/a"));

            let result  = await this.openKillTab(charges, this.stripCompanyCharge.bind(this));

            console.log(result);
            companyChargesList = result.data;

            return this.success(`(CompaniesHouseScraperStream) Successfully stripped all company charges`, []);
        } catch(err) {
            return this.error(`(CompaniesHouseScraperStream) Error stripping company charges`, err);
        }
    }

    // Function to determine current tab and strip information
    public async stripCompanyInformation(companyIdentifier: string = this.query): Promise<SearchioResponse> {

        
        let results: ResultData[] = [];

        
        try {
            await this.driver.get(`https://find-and-update.company-information.service.gov.uk/company/${companyIdentifier}`);

            // Function to be performed depending on tab title
            const tabFunctions = {
                "Company": this.stripCompanyOverview.bind(this),
                "Filing history": this.stripCompanyFilings.bind(this),
                "People": this.stripCompanyPeople.bind(this),
                //"Charges": this.stripCompanyCharges.bind(this)
            }

            // Collect the links of tabs
            let links = await (await this.collectLinks("//div[@class='section-tabs js-tabs']/ul/li")).data;

            // Iterate through the links
            for(let link of links) {
                let text = await link.getText();
                text = text.split(/\r?\n/)[0];

                // Check that we have made a function to handle it
                if(tabFunctions[text]) {

                    link = await link.findElement(this.webdriver.By.xpath('./h1/a | ./a'));
                    // Open the link in a new tab
                    let res = await this.openKillTab([link], tabFunctions[text]);

                    if(res.success) {

                        for(let r of res.data) {
                            results = results.concat(r);
                        }

                    }

                    
                } else {
                    console.log(` (CompaniesHouseStream) Do not currently have ability to handle information on ${text} tab`);
                }
            }
        

            return this.success(`(CompaniesHouseStream) Successfully stripped company information`, results);

        } catch(err) {
            return this.error(`(CompaniesHouseStream) Could not strip company information`, err);
        }
    }

}