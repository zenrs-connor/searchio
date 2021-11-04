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


    public table = {

        columns: [
            { title: "Name", key: "personName", type: "Text" },
            { title: "Role", key: "personRole", type: "Text" },
            { title: "Role Status", key: "roleStatus", type: "Text" },
            { title: "Link", key: "personLink", type: "Text" },
            { title: "Company Jurisdiction", key: "companyJurisdiction", type: "Text" },
            { title: "Company Status", key: "companyStatus", type: "Text" },
            { title: "Company Name", key: "companyName", type: "Text" },
            { title: "Company Number", key: "companyNumber", type: "Text" },
            { title: "Company Start Date", key: "startDate", type: "Text" },
            { title: "Company End Date", key: "endDate", type: "Text" },
            { title: "Link", key: "companyLink", type: "Text" },
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
    protected async process(): Promise<SearchioResponse> {
        this.initWebdriver();
        let result = await this.nameSearch();
        this.destroyWebdriver();
        return result;
    }


    // Function to scrape page of people resulting from a name search
    public async scrapePeople(people: any[]): Promise<SearchioResponse> {
        try {

            for(let person of people) {
                                
                    let rowName: string
                    let rowRole: string
                    let rowRoleStatus: string
                    let rowPersonLink: string
                    let rowCompanyJurisdiction: string
                    let rowCompanyStatus: string
                    let rowCompanyName: string
                    let rowCompanyNumber: string
                    let rowCompanyStart: string
                    let rowCompanyEnd: string
                    let rowCompanyLink: string
                
                let name = await person.findElement(this.webdriver.By.xpath('./a')).getText();
                rowName = name;
                
                let roleStatus = await person.findElement(this.webdriver.By.xpath('./a')).getAttribute('class');
                if(roleStatus == "officer") {
                    roleStatus = "Active";
                    rowRoleStatus = roleStatus;
                } else if (roleStatus == "officer inactive") {
                    roleStatus = "Inactive"
                    rowRoleStatus = roleStatus;
                } else {
                    rowRoleStatus = `Unknown role status: ${roleStatus})`;
                }

                let personLink = await person.findElement(this.webdriver.By.xpath('./a')).getAttribute('href');
                rowPersonLink = personLink;

                let companyJurisdiction = await person.findElement(this.webdriver.By.xpath('./a[2]')).getAttribute('class');
                companyJurisdiction = companyJurisdiction.replace("jurisdiction_filter ","").toUpperCase();
                rowCompanyJurisdiction = companyJurisdiction;

                let companyStatus = await person.findElement(this.webdriver.By.xpath('./a[3]')).getAttribute('class');
                if(companyStatus.includes("inactive")) {
                    companyStatus = "Inactive";
                    rowCompanyStatus = companyStatus;
                } else {
                    companyStatus = "Active";
                    rowCompanyStatus = companyStatus;
                }

                let companyName = await person.findElement(this.webdriver.By.xpath('./a[3]')).getText();
                rowCompanyName = companyName;

                let companyNumber = await person.findElement(this.webdriver.By.xpath('./a[3]')).getAttribute('title');
                companyNumber = companyNumber.split(" ");
                companyNumber = companyNumber[companyNumber.length - 1].replace(')', '');
                rowCompanyNumber = companyNumber;

                let startDate = await person.findElements(this.webdriver.By.xpath('.//span[@class="start_date"]'));
                if(startDate.length > 0){
                    startDate = await person.findElement(this.webdriver.By.xpath('.//span[@class="start_date"]')).getText();
                    rowCompanyStart = startDate;
                } else {
                    startDate = "Not available";
                    rowCompanyStart = startDate;
                }
                
                let endDate = await person.findElements(this.webdriver.By.xpath('.//span[@class="end_date"]'));
                if(endDate.length > 0){
                    endDate = await person.findElement(this.webdriver.By.xpath('.//span[@class="end_date"]')).getText();
                    rowCompanyEnd = endDate;
                } else {
                    endDate = "Not available";
                    rowCompanyEnd = endDate;
                }

                let role = await person.getText()
                role = role.split(",")[0];
                if(role.includes("agent")) {
                    role = "Agent";
                    rowRole = role;
                } else if(role.includes("secretary")) {
                    role = "Secretary";
                    rowRole = role;
                } else if(role.includes("president")) {
                    role = "President";
                    rowRole = role;
                } else if(role.includes("vice president")) {
                    role = "Vice President";
                    rowRole = role;
                } else if(role.includes("incorporator")) {
                    role = "Incorporator";
                    rowRole = role;
                } else if(role.includes("director")) {
                    role = "Director";
                    rowRole = role;
                } else if(role.includes("treasurer")) {
                    role = "Treasurer";
                    rowRole = role;
                } else if(role.includes("ceo")) {
                    role = "CEO";
                    rowRole = role;
                } else if(role.includes("chief executive officer")) {
                    role = "CEO";
                    rowRole = role;
                } else if(role.includes("incorporator")) {
                    role = "Incorporator";
                    rowRole = role;
                } else if(role.includes("manager")) {
                    role = "Manager";
                    rowRole = role;
                } else if(role.includes("member")) {
                    role = "Member";
                    rowRole = role;
                } else if(role.includes("govenor")) {
                    role = "Governor";
                    rowRole = role;
                } else if(role.includes("cfo")) {
                    role = "CFO";
                    rowRole = role;
                } else if(role.includes("organizer")) {
                    role = "Organizer";
                    rowRole = role;
                } else {
                    let link = await person.findElement(this.webdriver.By.xpath("./a")).getAttribute('href');
                    role = `Unknown (${link})`;
                    rowRole = role;
                }

                let companyLink = await person.findElement(this.webdriver.By.xpath('./a[3]')).getAttribute('href');
                rowCompanyLink = companyLink;

                this.table.rows.push({
                    personName: rowName,
                    personRole: rowRole,
                    roleStatus: rowRoleStatus,
                    personLink: rowPersonLink,
                    companyJurisdiction: rowCompanyJurisdiction,
                    companyStatus: rowCompanyStatus,
                    companyName: rowCompanyName,
                    companyNumber: rowCompanyNumber,
                    startDate: rowCompanyStart,
                    endDate: rowCompanyEnd,
                    companyLink: rowCompanyLink
                });

            }

            return this.success(`(OpenCorporatesScraperStream) Successfully scraped a company`, '');

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

            return this.success(`(OpenCorporatesScraperStream) Successfully scraped a company`, this.table);

        } catch(err) {
            return this.error(`(OpenCorporatesScraperStream) Error scraping a company`, err);
        }
    }
}