import { SearchioResponse } from "../../../models/SearchioResponse";
import { Console } from "console";
import { copyFile } from "fs";
import { OpenCorporatesProcess } from "./OpenCorporatesProcess";
import { SocketService } from "../../SocketService";
import { NAMES } from "../../../assets/RegexPatterns";


const request = require('request');

export class OpenCorporatesOfficerSearch extends OpenCorporatesProcess {
    
    protected id = "OpenCorporatesOfficerSearch";           
    protected name: "Officer Check";
    protected pattern: RegExp = NAMES;
    
    
    //  Process extends the ResponseEmitter class, so be sure to include an argument for the socket
    //  Processes also take a query on creation
    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }


    //  Overwrite of the abstract function held in Process.ts
    //  This function is what is called when the Process executes
    //  It returns a SearchioResponse containing any success or error data
    protected async process(): Promise<SearchioResponse> {
        this.initWebdriver();
        let result = await this.nameSearch();
        this.destroyWebdriver();
        return result;
    }



    /*


        ----- API FUNCTIONALITY -----


    */

    public async officerSearch(name: string) {
        let response;

        await new Promise((resolve) => {

            this.reformat(name).then(name => {
                let url = `https://api.opencorporates.com/v0.4/officers/search?q=${name}`;

                request(url, async (err, res, body) => {

                    console.log(body);
                    response = body;

                    if(err) {
                        response = { success: false, error: err };
                    }
                    resolve(undefined);
                });
            });
        });

        return response;
    }


    /*


        ----- SCRAPER FUNCTIONALITY -----


    */

    // Function to scrape page of people resulting from a name search
    public async scrapePeople(people: any[]): Promise<SearchioResponse> {
        try {
            let peopleArray: any[] = [];

            for(let person of people) {
                
                let personFormat: {
                    name: string,
                    role?: string,
                    roleStatus?: string,
                    personLink?: string,
                    companyJurisdiction?: string,
                    companyStatus?: string,
                    companyName?: string,
                    companyNumber?: string,
                    companyStart?: string,
                    companyEnd?: string,
                    companyLink?: string
                } = {
                    name: undefined
                };


                let name = await person.findElement(this.webdriver.By.xpath('./a')).getText();
                personFormat.name = name;
                
                let roleStatus = await person.findElement(this.webdriver.By.xpath('./a')).getAttribute('class');
                if(roleStatus == "officer") {
                    roleStatus = "Active";
                    personFormat.roleStatus = roleStatus;
                } else if (roleStatus == "officer inactive") {
                    roleStatus = "Inactive"
                    personFormat.roleStatus = roleStatus;
                } else {
                    personFormat.roleStatus = `(OpenCorporatesStream could not handle person with role status: ${roleStatus})`;
                }

                let personLink = await person.findElement(this.webdriver.By.xpath('./a')).getAttribute('href');
                personFormat.personLink = personLink;

                let companyJurisdiction = await person.findElement(this.webdriver.By.xpath('./a[2]')).getAttribute('class');
                companyJurisdiction = companyJurisdiction.replace("jurisdiction_filter ","").toUpperCase();
                personFormat.companyJurisdiction = companyJurisdiction;

                let companyStatus = await person.findElement(this.webdriver.By.xpath('./a[3]')).getAttribute('class');
                if(companyStatus.includes("inactive")) {
                    companyStatus = "Inactive";
                    personFormat.companyStatus = companyStatus;
                } else {
                    companyStatus = "Active";
                    personFormat.companyStatus = companyStatus;
                }

                let companyName = await person.findElement(this.webdriver.By.xpath('./a[3]')).getText();
                personFormat.companyName = companyName;

                let companyNumber = await person.findElement(this.webdriver.By.xpath('./a[3]')).getAttribute('title');
                companyNumber = companyNumber.split(" ");
                companyNumber = companyNumber[companyNumber.length - 1].replace(')', '');
                personFormat.companyNumber = companyNumber;

                let startDate = await person.findElements(this.webdriver.By.xpath('.//span[@class="start_date"]'));
                if(startDate.length > 0){
                    startDate = await person.findElement(this.webdriver.By.xpath('.//span[@class="start_date"]')).getText();
                    personFormat.companyStart = startDate;
                } else {
                    startDate = "Not available";
                    personFormat.companyStart = startDate;
                }
                
                let endDate = await person.findElements(this.webdriver.By.xpath('.//span[@class="end_date"]'));
                if(endDate.length > 0){
                    endDate = await person.findElement(this.webdriver.By.xpath('.//span[@class="end_date"]')).getText();
                    personFormat.companyEnd = endDate;
                } else {
                    endDate = "Not available";
                    personFormat.companyEnd = endDate;
                }

                let role = await person.getText()
                role = role.split(",")[0];
                if(role.includes("agent")) {
                    role = "Agent";
                    personFormat.role = role;
                } else if(role.includes("secretary")) {
                    role = "Secretary";
                    personFormat.role = role;
                } else if(role.includes("president")) {
                    role = "President";
                    personFormat.role = role;
                } else if(role.includes("vice president")) {
                    role = "Vice President";
                    personFormat.role = role;
                } else if(role.includes("incorporator")) {
                    role = "Incorporator";
                    personFormat.role = role;
                } else if(role.includes("director")) {
                    role = "Director";
                    personFormat.role = role;
                } else if(role.includes("treasurer")) {
                    role = "Treasurer";
                    personFormat.role = role;
                } else if(role.includes("ceo")) {
                    role = "CEO";
                    personFormat.role = role;
                } else if(role.includes("chief executive officer")) {
                    role = "CEO";
                    personFormat.role = role;
                } else if(role.includes("incorporator")) {
                    role = "Incorporator";
                    personFormat.role = role;
                } else if(role.includes("manager")) {
                    role = "Manager";
                    personFormat.role = role;
                } else if(role.includes("member")) {
                    role = "Member";
                    personFormat.role = role;
                } else if(role.includes("govenor")) {
                    role = "Governor";
                    personFormat.role = role;
                } else if(role.includes("cfo")) {
                    role = "CFO";
                    personFormat.role = role;
                } else if(role.includes("organizer")) {
                    role = "Organizer";
                    personFormat.role = role;
                } else {
                    let link = await person.findElement(this.webdriver.By.xpath("./a")).getAttribute('href');
                    role = `Unknown (${link})`;
                    personFormat.role = role;
                }

                let companyLink = await person.findElement(this.webdriver.By.xpath('./a[3]')).getAttribute('href');
                personFormat.companyLink = companyLink;

                peopleArray.push(personFormat);

            }

            return this.success(`(OpenCorporatesScraperStream) Successfully scraped a company`, peopleArray);

        } catch(err) {
            return this.error(`(OpenCorporatesScraperStream) Error scraping a company`, err);
        }
    }

    // Function to search for current or prior officers within a company
    public async nameSearch(name: string = this.query): Promise<SearchioResponse> {
        try {
            name = name.replace(/\s+/g, '+');
            await this.driver.get(`https://opencorporates.com/officers?jurisdiction_code=&q=${name}&utf8=%E2%9C%93`);
            let people = await this.flipThrough('//li[@class="next next_page "]/a', '//ul[@class="officers unstyled"]/li', this.scrapePeople.bind(this), 25);

            return this.success(`(OpenCorporatesScraperStream) Successfully scraped a company`);

        } catch(err) {
            return this.error(`(OpenCorporatesScraperStream) Error scraping a company`, err);
        }
    }
}