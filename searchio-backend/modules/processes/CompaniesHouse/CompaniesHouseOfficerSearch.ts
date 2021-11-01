import { SearchioResponse } from "../../../models/SearchioResponse";
import { WebElement } from "selenium-webdriver";
import { SocketService } from "../../SocketService";
import { CompaniesHouseProcess } from "./CompaniesHouseProcess";
import { NAMES } from "../../../assets/RegexPatterns";


export class CompaniesHouseOfficerSearch extends CompaniesHouseProcess {

    protected id = "CompaniesHouseOfficerSearch";           
    protected name: "Officer Check";
    protected pattern: RegExp = NAMES;

    public table = {

        columns: [
            { title: "Name", key: "officerName", type: "Text" },
            { title: "Date of Birth", key: "dateOfBirth", type: "Text" },
            { title: "Total Appointments", key: "numberOfAppointments", type: "Text" }
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
        this.initWebdriver(false);
        let result = await this.nameSearch();
        this.destroyWebdriver();
        return result;
    }



    // Function to search for prior or current officers within a company
    public async nameSearch(name: string = this.query): Promise<SearchioResponse> {
        try{
            name = name.replace(/\s+/g, '+');
            await this.driver.get(`https://find-and-update.company-information.service.gov.uk/search/officers?q=${name}`);
            let people = await this.flipThrough('//a[@id="next-page"]', '//ul[@id="results"]/li/h3/a', this.stripNamesPage.bind(this), 1);

            return this.success(`(CompaniesHouseStream) Successfully performed name search`, this.table);
        } catch(err) {
            return this.error(`(CompaniesHouseStream) Could not perform name search`, err);
        }
    }

    // Function when given links to officers will open them in new tabs ready to strip
    public async stripNamesPage(links): Promise<SearchioResponse> {
        try{
            const t = this;
            let people = await t.openKillTab(links, this.stripOfficer.bind(this));

            return this.success(`(CompaniesHouseStream) Successfully stripped a page of officers`, people.data);
        } catch(err) {
            return this.error(`(CompaniesHouseStream) Could not perform strip on page of officers`, err);
        }
    }

    // Will strip an officer page
    public async stripOfficer(): Promise<SearchioResponse> {
        try{

            const t = this;

            let rowName: string;
            let rowDOB: string;
            let rowTA: string;

            // let officerFormat: {   
            //     name: string,
            //     numberOfAppointments?: string, 
            //     DOB?: string,
            //     appointments?: any[]
            // } = {
            //     name: undefined
            // };

            // Check name element is present
            let name = await t.driver.findElements(t.webdriver.By.xpath('//h1[@id="officer-name"]'));
            if(name.length > 0) {
                name = await t.driver.findElement(t.webdriver.By.xpath('//h1[@id="officer-name"]')).getText();
                rowName = name;
            } else {
                rowName = 'Unknown';
            }

            // Check number of appointments element is present
            let numberOfAppointments = await t.driver.findElements(t.webdriver.By.xpath('//h2[@id="personal-appointments"]'));
            if(numberOfAppointments.length > 0){
                numberOfAppointments = await t.driver.findElement(t.webdriver.By.xpath('//h2[@id="personal-appointments"]')).getText();
                numberOfAppointments = numberOfAppointments.replace('Total number of appointments ', '');
                rowTA = numberOfAppointments;
            } else {
                rowTA = 'Unknown';
            }

            // Check DOB element is present
            let DOB = await t.driver.findElements(t.webdriver.By.xpath('//dd[@id="officer-date-of-birth-value"]'));
            //console.log(`DOB Length: ${DOB.length}`);
            if(DOB.length > 0) {
                DOB = await t.driver.findElement(t.webdriver.By.xpath('//dd[@id="officer-date-of-birth-value"]')).getText();
                rowDOB = DOB;
            } else {
                rowDOB = 'Unknown'
            }

            // Collect appointment divs
            let appointments = await t.driver.findElements(t.webdriver.By.xpath('//div[@class="appointments-list"]/div'));

            let appointmentsArray: any[] = [];

            // ------- !!!This functionality does work but has been temporarily removed for testing the table changeover!!! -------
            /*for(let appointment of appointments) {
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
            officerFormat.appointments = appointmentsArray;*/

            this.table.rows.push({
                officerName: rowName,
                dateOfBirth: rowDOB,
                numberOfAppointments: rowTA
            });

            return this.success(`(CompaniesHouseStream) Successfully stripped officer page`, '');
        } catch(err) {
            return this.error(`(CompaniesHouseStream) Could not strip officer`, err);
        }
    }

}