//import { Stream } from "../Stream";
import { SearchioResponse } from "../../models/SearchioResponse";
import { error, success } from "../ResponseHandler";
import { ScraperStream } from "./ScraperStream";
import { WebElement } from "selenium-webdriver";
import { SocketService } from "../SocketService";

//const request = require('request');

const COMPANIESHOUSE_API_KEY = '585a186b-ba2c-4978-be95-17e5ffbb773f';

export class CompaniesHouseStream extends ScraperStream {

    constructor(query: string, socket: SocketService) {
        super(query, socket);
        this.tags.push("companies-house");
    }


    // Function to strip companies out of search
    public async companySearch(company: string): Promise<SearchioResponse> {

        company = company.replace(/\s+/g, '+');
        let links: any[] = [];

        try {
            await this.loadSearchEngine();
            await this.naviagteTo(`https://find-and-update.company-information.service.gov.uk/search?q=${company}`);

            let res = await this.collectLinks("//ul[@id='results']/li/h3/a");

            if(res.success) {

                links = (res.data as WebElement[]);

            } else {
                return success(`(CompaniesHouseScraperStream) Successfully performed company search but no results`);
            }
            
            return success(`(CompaniesHouseScraperStream) Successfully performed company search`, links);
        } catch(err) {
            return error(`(CompaniesHouseScraperStream) Error performing company search`, err)
        }
    }

    // Function to strip a single companies overview 
    public async stripCompanyOverview(): Promise<SearchioResponse> {
        
        try {
            //await this.driver.get('https://find-and-update.company-information.service.gov.uk/company/12870867');
            //await this.driver.get('https://find-and-update.company-information.service.gov.uk/company/04899059');
            //await this.driver.get('https://find-and-update.company-information.service.gov.uk/company/08467644');
            //await this.driver.get('https://find-and-update.company-information.service.gov.uk/company/11146456');

            let companyNumber = await this.driver.findElement(this.webdriver.By.xpath("//p[@id='company-number']/strong")).getText();
            let companyName = await this.driver.findElement(this.webdriver.By.xpath("//p[@class='heading-xlarge']")).getText();
            let companyAddress = await this.driver.findElement(this.webdriver.By.xpath("//div[@id='content-container']/dl/dd")).getText();
            let status = await this.driver.findElement(this.webdriver.By.xpath("//dd[@id='company-status']")).getText();
            let companyType = await this.driver.findElement(this.webdriver.By.xpath("//dd[@id='company-type']")).getText();
            let creationDate = await this.driver.findElement(this.webdriver.By.xpath("//dd[@id='company-creation-date']")).getText();
            let companyAccounts = await this.driver.findElement(this.webdriver.By.xpath("//div[@id='content-container']/div[5]/div/p")).getText();
            let companyStatement = await this.driver.findElement(this.webdriver.By.xpath("//div[@id='content-container']/div[5]/div[2]/p")).getText();
            
            let naturesOfBusinessList: any[] = [];
            let naturesOfBusiness = await this.driver.findElements(this.webdriver.By.xpath("//div[@id='content-container']/ul/li"));
            for (let natureOfBusiness of naturesOfBusiness) {

                let nature = await natureOfBusiness.findElement(this.webdriver.By.xpath("./span")).getText();
                naturesOfBusinessList.push(nature);
            }

            
            let previousNamesList: any[] = [];
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

                    previousNamesList.push(previousNamesFormat);
                }
            }

            let overviewFormat: {   
                companyNumber: number, 
                companyName: string,
                companyAddress?: string, 
                status?: string,
                companyType?: string,
                creationDate?: Date,
                companyAccounts?: string,
                companyStatement?: string,
                naturesOfBusiness?: any[],
                previousNames?: any[]
            } = {
                companyNumber: undefined,
                companyName: undefined
            };

            overviewFormat.companyNumber = companyNumber;
            overviewFormat.companyName = companyName;
            overviewFormat.companyAddress = companyAddress;
            overviewFormat.status = status;
            overviewFormat.companyType = companyType;
            overviewFormat.creationDate = new Date(creationDate);
            overviewFormat.companyAccounts = companyAccounts.replace(/\n/g, " ");
            overviewFormat.companyStatement = companyStatement.replace(/\n/g, " ");
            overviewFormat.naturesOfBusiness = naturesOfBusinessList;
            overviewFormat.previousNames = previousNamesList;

            return success(`(CompaniesHouseScraperStream) Successfully collected company overview`, overviewFormat);
        } catch(err) {
            return error(`(CompaniesHouseScraperStream) Error collecting company overview`, err)
        }
    }

    // Function to strip a single companies filing history
    public async stripCompanyFilings(): Promise<SearchioResponse> {
        
        let companyFilings: any[] = []; 

        try {
            //await this.driver.get('https://find-and-update.company-information.service.gov.uk/company/12870867/filing-history');
            let filings = await this.driver.findElements(this.webdriver.By.xpath("//table[@id='fhTable']/tbody/tr"));
            filings.shift();

            for(let filing of filings) {
                
                let filingFormat: {date: Date, desc?: string, docs?:string} = {
                    date: undefined
                };

                let date = await filing.findElement(this.webdriver.By.xpath(".//td[@class='nowrap']")).getText();
                let desc = await filing.findElement(this.webdriver.By.xpath(".//td[not(@id) and not(@class)]")).getText();
                let docs = await filing.findElement(this.webdriver.By.xpath(".//a[@class='download']")).getAttribute("href");
                
                
                filingFormat.date = new Date(date) ;
                filingFormat.desc = desc;
                filingFormat.docs = docs;

                // DATES NEED TO BE ALTERED BY TIMZONE

                companyFilings.push(filingFormat);

            }

            return success(`(CompaniesHouseScraperStream) Successfully collected company filings`, companyFilings);

        } catch(err) {
            return error(`(CompaniesHouseScraperStream) Error collecting company filings`, err);
        }
    }

    // Function to strip a single companies people
    public async stripCompanyPeople(): Promise<SearchioResponse> {
        
        let companyPeople: any[] = []; 

        try {
            await this.driver.get('https://find-and-update.company-information.service.gov.uk/company/04398417/officers');
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

                // DATES NEED TO BE ALTERED BY TIMEZONE

                console.log(peopleFormat);
                companyPeople.push(peopleFormat);

            }

            return success(`(CompaniesHouseScraperStream) Successfully collected company people`, companyPeople);
        
        } catch(err) {
            console.log(err);
            return error(`(CompaniesHouseScraperStream) Error collecting company people`, err);
        }
    }

    // Function to strip a single companies charges
    public async stripCompanyCharge(): Promise<SearchioResponse> {
        
        try {
            //await this.driver.get('https://find-and-update.company-information.service.gov.uk/company/04398417/charges/prM5dfrWQs2SqUKZ2-BVJROkLDs');
            //await this.driver.get('https://find-and-update.company-information.service.gov.uk/company/04398417/charges/aqJjwB6CGHQ7GRcKQhROQbVcBO0');
            //await this.driver.get('https://find-and-update.company-information.service.gov.uk/company/04398417/charges/UUjZCXtQpOezNOj113owswseLiQ');
            //await this.driver.get('https://find-and-update.company-information.service.gov.uk/company/04398417/charges/yED3yhP_BvZvZhnDlVdmpXPK3Jk');

                
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

            return success(`(CompaniesHouseScraperStream) Successfully collected a company charge`, chargeFormat);
        
        } catch(err) {
            return error(`(CompaniesHouseScraperStream) Error collecting a company charge`, err);
        }
    }

    // Function to iterate through all company charges and call stripCompanyCharge
    public async stripCompanyCharges(): Promise<SearchioResponse> {
        let companyChargesList: any[] = [];
        
        try {
            let charges = await this.driver.findElements(this.webdriver.By.xpath("//div[@id='mortgage-content']/div/h2/a"));

            let result  = await this.openKillTab(charges, this.stripCompanyCharge.bind(this));
            companyChargesList = result.data;

            return success(`(CompaniesHouseScraperStream) Successfully stripped all company charges`, companyChargesList);
        } catch(err) {
            console.log(err)
            return error(`(CompaniesHouseScraperStream) Error stripping company charges`, err);
        }
    }

    // Function to determine current tab and strip information
    public async stripCompanyInformation(companyIdentifier: string): Promise<SearchioResponse> {
        let companyInformation: any[];
        
        try {
            await this.driver.get(`https://find-and-update.company-information.service.gov.uk/company/${companyIdentifier}`);

            const tabFunctions = {
                "Company": this.stripCompanyOverview.bind(this),
                "Filing history": this.stripCompanyFilings.bind(this),
                "People": this.stripCompanyPeople.bind(this),
                "Charges": this.stripCompanyCharges.bind(this)
            }

            let links = await (await this.collectLinks("//div[@class='section-tabs js-tabs']/ul/li")).data;

            for(let link of links) {
                let text = await link.getText();
                text = text.split(/\r?\n/)[0];

                if(tabFunctions[text]) {
                    console.log(text);
                    link = await link.findElement(this.webdriver.By.xpath('./h1/a | ./a'));
                    let res = await this.openKillTab([link], tabFunctions[text]);
                    console.log(`CH result`);
                    console.log(res);
                    companyInformation.push(res.data[0]);
                    
                } else {
                    console.log(` (CompaniesHouseStream) Do not currently have ability to handle information on ${text} tab`);
                }
            }
            
            console.log("\n\n---------COMPANY INFORMATION---------");
            console.log(companyInformation[0]);

            return success(`(CompaniesHouseStream) Successfully stripped company information`, companyInformation[0]);

        } catch(err) {
            console.log(err);
            return error(`(CompaniesHouseStream) Could not strip company information`, err);
        }
    }

    // Function to search for prior or current officers within a company
    public async nameSearch(name: string = this.query): Promise<SearchioResponse> {
        try{
            name = name.replace(/\s+/g, '+');
            await this.driver.get(`https://find-and-update.company-information.service.gov.uk/search/officers?q=${name}`);
            let people = await this.flipThrough('//a[@id="next-page"]', '//ul[@id="results"]/li/h3/a', this.stripNamesPage.bind(this), 1);
            console.log(people.data[7]);

            return success(`(CompaniesHouseStream) Successfully performed name search`, people.data);
        } catch(err) {
            return error(`(CompaniesHouseStream) Could not perform name search`, err);
        }
    }

    public async stripNamesPage(links): Promise<SearchioResponse> {
        try{
            const t = this;
            let people = await t.openKillTab(links, this.stripOfficer.bind(this));

            return success(`(CompaniesHouseStream) Successfully stripped a page of officers`, people.data);
        } catch(err) {
            return error(`(CompaniesHouseStream) Could not perform strip on page of officers`, err);
        }
    }

    public async stripOfficer(): Promise<SearchioResponse> {
        try{

            const t = this;

            let officerFormat: {   
                name: string,
                numberOfAppointments?: string, 
                DOB?: string,
                appointments?: any[]
            } = {
                name: undefined
            };

            // Check name element is present
            let name = await t.driver.findElements(t.webdriver.By.xpath('//h1[@id="officer-name"]'));
            if(name.length > 0) {
                name = await t.driver.findElement(t.webdriver.By.xpath('//h1[@id="officer-name"]')).getText();
                officerFormat.name = name;
            }

            // Check number of appointments element is present
            let numberOfAppointments = await t.driver.findElements(t.webdriver.By.xpath('//h2[@id="personal-appointments"]'));
            if(numberOfAppointments.length > 0){
                numberOfAppointments = await t.driver.findElement(t.webdriver.By.xpath('//h2[@id="personal-appointments"]')).getText();
                officerFormat.numberOfAppointments = numberOfAppointments;
            }

            // Check DOB element is present
            let DOB = await t.driver.findElements(t.webdriver.By.xpath('//dd[@id="officer-date-of-birth-value"]'));
            //console.log(`DOB Length: ${DOB.length}`);
            if(DOB.length > 0) {
                DOB = await t.driver.findElement(t.webdriver.By.xpath('//dd[@id="officer-date-of-birth-value"]')).getText();
                officerFormat.DOB = DOB;
            }

            // Collect appointment divs
            let appointments = await t.driver.findElements(t.webdriver.By.xpath('//div[@class="appointments-list"]/div'));

            let appointmentsArray: any[] = [];

            for(let appointment of appointments) {
                let appointmentFormat: {
                    companyName: string,
                    companyStatus?: string,
                    address?: string,
                    role?: string,
                    roleStatus?: string,
                    appointed?: Date,
                    resigned?: Date,
                    nationality?: string,
                    country?: string,
                    occupation?: string
                } = {
                    companyName: undefined
                }

                let companyName = await appointment.findElements(t.webdriver.By.xpath('./h2/a'));
                if(companyName.length > 0) {
                    companyName = await appointment.findElement(t.webdriver.By.xpath('./h2/a')).getText();
                    appointmentFormat.companyName = companyName;
                }

                let elements = await appointment.findElements(t.webdriver.By.tagName('dl'));
                for(let element of elements) {
                    let title = await element.findElements(t.webdriver.By.xpath('./dt'));
                    let text = await element.findElements(t.webdriver.By.xpath('./dd'));
                    if(title.length> 0 && text.length > 0) {
                        title = await element.findElement(t.webdriver.By.xpath('./dt')).getText();
                        text = await element.findElement(t.webdriver.By.xpath('./dd')).getText();
                        if(title == "Company status") {
                            appointmentFormat.companyStatus = text;
                        } else if(title == "Correspondence address") {
                            appointmentFormat.address = text;
                        } else if(title == "Role ACTIVE") {
                            appointmentFormat.role = text;
                            appointmentFormat.roleStatus = title;
                        } else if(title == "Role RESIGNED") {
                            appointmentFormat.role = text;
                            appointmentFormat.roleStatus = title;
                        } else if(title == "Appointed on") {
                            appointmentFormat.appointed = new Date(text);
                        } else if(title == "Resigned on") {
                            appointmentFormat.resigned = new Date(text);
                        } else if(title == "Nationality") {
                            appointmentFormat.nationality = text;
                        } else if(title == "Country of residence") {
                            appointmentFormat.country = text;
                        } else if(title == "Occupation") {
                            appointmentFormat.occupation = text;
                        } else if(title == "other") {
                            console.log('---------other---------');
                        } 
                        
                    }
                }
                appointmentsArray.push(appointmentFormat);

            }
            officerFormat.appointments = appointmentsArray;

            return success(`(CompaniesHouseStream) Successfully stripped officer page`, officerFormat);
        } catch(err) {
            return error(`(CompaniesHouseStream) Could not strip officer`, err);
        }
    }

}
