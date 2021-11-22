import { SearchioResponse } from "../../../models/SearchioResponse";
import { WebElement } from "selenium-webdriver";
import { SocketService } from "../../SocketService";
import { ADDRESS } from "../../../assets/RegexPatterns";
import { StreetCheckProcess } from "./StreetCheckProcess";
import { ResultData } from "../../../models/ResultData";


export class StreetCheckSearch extends StreetCheckProcess {

    protected id = "StreetCheckSearch";           
    protected name: string = "Property Check";
    protected pattern: RegExp = ADDRESS;

    //  Build the array of Results from the response
    public data: ResultData[] = [];


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
        let result = await this.search();
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
                await this.driver.get(`https://www.streetcheck.co.uk/postcode/${inputPostcode}`);
                
            } else {

                await this.driver.get('https://www.streetcheck.co.uk/');
                await this.waitForElement('//div[@id="searchboxes"]', 20);
                await this.driver.findElement(this.webdriver.By.xpath('//div[@id="searchboxes"]/div[2]/input')).sendKeys(address);
                await this.driver.findElement(this.webdriver.By.xpath('//input[@id="searchbutton"]')).click();
                await this.waitForElement('//p[@id="searchcount"]', 20);


                // Collect resulting addresses
                let addresses = await this.driver.findElements(this.webdriver.By.xpath('//ul[@id="searchresults"]/li/a'));

                // Find the best match
                let bestMatchIndex = await this.findBestMatch(address, addresses);
                // Get its href, as clicking it will open ads in an iframe
                let page = await addresses[bestMatchIndex.data].getAttribute('href');
                await this.driver.get(page);
            }

            return this.success(`Successfully loaded search`);
        
        } catch(err) {
            return this.error(`Error loading search`, err)
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

            //console.log(`Best match was address at index ${bestMatchIndex} with a score of ${bestMatchScore}`);
            let y = await elements[bestMatchIndex].getText();
            //console.log(`This address was ${y}`);
            
            
            return this.success(`Successfully found best address match`, bestMatchIndex);
        
        } catch(err) {
            return this.error(`Error finding best address match`, err)
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
            return this.success(`Successfully compared addresses`, costs[value.length]);
        } catch(err) {
            return this.error(`Error comparing addresses`, err)
        }
    }

    // Function to scrape housing types table
    public async housingTypeTable(housingTable: any): Promise<SearchioResponse> {
        try {

            let table = {
                columns: [
                    { title: "Housing Type", key: "housingType", type: "Text" },
                    { title: "Count", key: "number", type: "Number" }
                ],
                rows: []
            }

            let trs = await housingTable.findElements(this.webdriver.By.xpath('./tbody/tr'));

            for(let tr of trs){
                let type = await tr.findElement(this.webdriver.By.xpath('./td[1]')).getText();
                let text = await tr.findElement(this.webdriver.By.xpath('./td[2]')).getText();
                table.rows.push({
                    housingType: type,
                    number: text
                });
            }

            this.data.push({ name: "Housing Types", type: "Table", data: table });
            
            return this.success(`Successfully stripped housing types table`);
        } catch(err) {
            return this.error(`Error stripping housing types table`, err)
        }
    }

    // Function to scrape housing tenure table
    public async housingTenureTable(housingTable: any): Promise<SearchioResponse> {
        try {

            let table = {
                columns: [
                    { title: "Housing Tenure", key: "housingTenure", type: "Text" },
                    { title: "Count", key: "number", type: "Number" }
                ],
                rows: []
            }

            let trs = await housingTable.findElements(this.webdriver.By.xpath('./tbody/tr'));

            for(let tr of trs) {
                let type = await tr.findElement(this.webdriver.By.xpath('./td[1]')).getText();
                let text = await tr.findElement(this.webdriver.By.xpath('./td[2]')).getText();
                table.rows.push({
                    housingTenure: type,
                    number: text
                });
            }
            
            this.data.push({ name: "Housing Tenure", type: "Table", data: table });
            
            return this.success(`Successfully stripped housing tenure table`);
        } catch(err) {
            return this.error(`Error stripping housing tenure table`, err)
        }
    }

    // Function to scrape housing occupancy table
    public async housingOccupancyTable(housingTable: any): Promise<SearchioResponse> {
        try {

            let table = {
                columns: [
                    { title: "Housing Occupancy", key: "housingOccupancy", type: "Text" },
                    { title: "Count", key: "number", type: "Number" }
                ],
                rows: []
            }

            let trs = await housingTable.findElements(this.webdriver.By.xpath('./tbody/tr'));

            for(let tr of trs) {
                let type = await tr.findElement(this.webdriver.By.xpath('./td[1]')).getText();
                let text = await tr.findElement(this.webdriver.By.xpath('./td[2]')).getText();
                table.rows.push({
                    housingOccupancy: type,
                    number: text
                });
            }

            this.data.push({ name: "Housing Occupancy", type: "Table", data: table });
            
            return this.success(`Successfully stripped housing occupancy table`);
        } catch(err) {
            return this.error(`Error stripping housing occupancy table`, err)
        }
    }

    // Function to scrape social grade table
    public async peopleSocialGradeTable(peopleTable: any): Promise<SearchioResponse> {
        try {

            let table = {
                columns: [
                    { title: "Social Grade", key: "socialGrade", type: "Text" },
                    { title: "Count", key: "number", type: "Number" }
                ],
                rows: []
            }

            let trs = await peopleTable.findElements(this.webdriver.By.xpath('./tbody/tr'));

            for(let tr of trs) {
                let type = await tr.findElement(this.webdriver.By.xpath('./td[1]')).getText();
                let text = await tr.findElement(this.webdriver.By.xpath('./td[2]')).getText();
                table.rows.push({
                    socialGrade: type,
                    number: text
                });
            }

            this.data.push({ name: "Social Grade", type: "Table", data: table });
            
            return this.success(`Successfully stripped social grade table`);
        } catch(err) {
            return this.error(`Error stripping social grade table`, err)
        }
    }

    // Function to scrape gender table
    public async peopleGenderTable(peopleTable: any): Promise<SearchioResponse> {
        try {

            let table = {
                columns: [
                    { title: "Gender", key: "gender", type: "Text" },
                    { title: "Count", key: "number", type: "Number" }
                ],
                rows: []
            }

            let trs = await peopleTable.findElements(this.webdriver.By.xpath('./tbody/tr'));

            for(let tr of trs) {
                let type = await tr.findElement(this.webdriver.By.xpath('./td[1]')).getText();
                let text = await tr.findElement(this.webdriver.By.xpath('./td[2]')).getText();
                table.rows.push({
                    gender: type,
                    number: text
                });
            }

            this.data.push({ name: "Gender", type: "Table", data: table });
            
            return this.success(`Successfully stripped gender table`);
        } catch(err) {
            return this.error(`Error stripping gender table`, err)
        }
    }

    // Function to scrape age groups table
    public async peopleAgeGroupsTable(peopleTable: any): Promise<SearchioResponse> {
        try {

            let table = {
                columns: [
                    { title: "Age Group", key: "ageGroup", type: "Text" },
                    { title: "Count", key: "number", type: "Number" }
                ],
                rows: []
            }

            let trs = await peopleTable.findElements(this.webdriver.By.xpath('./tbody/tr'));

            for(let tr of trs) {
                let type = await tr.findElement(this.webdriver.By.xpath('./td[1]')).getText();
                let text = await tr.findElement(this.webdriver.By.xpath('./td[2]')).getText();
                table.rows.push({
                    ageGroup: type,
                    number: text
                });
            }

            this.data.push({ name: "Age Groups", type: "Table", data: table });
            
            return this.success(`Successfully stripped age groups table`);
        } catch(err) {
            return this.error(`Error stripping age groups table`, err)
        }
    }

    // Function to scrape relationship status table
    public async peopleRelationshipStatusTable(peopleTable: any): Promise<SearchioResponse> {
        try {

            let table = {
                columns: [
                    { title: "Relationship Status", key: "relationshipStatus", type: "Text" },
                    { title: "Count", key: "number", type: "Number" }
                ],
                rows: []
            }

            let trs = await peopleTable.findElements(this.webdriver.By.xpath('./tbody/tr'));

            for(let tr of trs) {
                let type = await tr.findElement(this.webdriver.By.xpath('./td[1]')).getText();
                let text = await tr.findElement(this.webdriver.By.xpath('./td[2]')).getText();
                table.rows.push({
                    relationshipStatus: type,
                    number: text
                });
            }

            this.data.push({ name: "Relationship Status", type: "Table", data: table });
            
            return this.success(`Successfully stripped relationship status table`);
        } catch(err) {
            return this.error(`Error stripping relationship status table`, err)
        }
    }

    // Function to scrape health table
    public async peopleHealthTable(peopleTable: any): Promise<SearchioResponse> {
        try {

            let table = {
                columns: [
                    { title: "Health", key: "health", type: "Text" },
                    { title: "Count", key: "number", type: "Number" }
                ],
                rows: []
            }

            let trs = await peopleTable.findElements(this.webdriver.By.xpath('./tbody/tr'));

            for(let tr of trs) {
                let type = await tr.findElement(this.webdriver.By.xpath('./td[1]')).getText();
                let text = await tr.findElement(this.webdriver.By.xpath('./td[2]')).getText();
                table.rows.push({
                    health: type,
                    number: text
                });
            }

            this.data.push({ name: "Health", type: "Table", data: table });
            
            return this.success(`Successfully stripped health table`);
        } catch(err) {
            return this.error(`Error stripping health table`, err)
        }
    }

    // Function to scrape education table
    public async peopleEducationTable(peopleTable: any): Promise<SearchioResponse> {
        try {

            let table = {
                columns: [
                    { title: "Educations and Qualifications", key: "education", type: "Text" },
                    { title: "Count", key: "number", type: "Number" }
                ],
                rows: []
            }

            let trs = await peopleTable.findElements(this.webdriver.By.xpath('./tbody/tr'));

            for(let tr of trs) {
                let type = await tr.findElement(this.webdriver.By.xpath('./td[1]')).getText();
                let text = await tr.findElement(this.webdriver.By.xpath('./td[2]')).getText();
                table.rows.push({
                    education: type,
                    number: text
                });
            }

            this.data.push({ name: "Education and Qualification", type: "Table", data: table });
            
            return this.success(`Successfully stripped education table`);
        } catch(err) {
            return this.error(`Error stripping education table`, err);
        }
    }

    // Function to scrape Welsh language table
    public async cultureWelshLanguageTable(cultureTable: any): Promise<SearchioResponse> {
        try {

            let table = {
                columns: [
                    { title: "Welsh Language", key: "welshLanguage", type: "Text" },
                    { title: "Count", key: "number", type: "Number" }
                ],
                rows: []
            }

            let trs = await cultureTable.findElements(this.webdriver.By.xpath('./tbody/tr'));

            for(let tr of trs) {
                let type = await tr.findElement(this.webdriver.By.xpath('./td[1]')).getText();
                let text = await tr.findElement(this.webdriver.By.xpath('./td[2]')).getText();
                table.rows.push({
                    welshLanguage: type,
                    number: text
                });
            }

            this.data.push({ name: "Welsh Language", type: "Table", data: table });
            
            return this.success(`Successfully stripped Welsh language table`);
        } catch(err) {
            return this.error(`Error stripping Welsh language table`, err)
        }
    }

    // Function to scrape ethnic group table
    public async cultureEthnicTable(cultureTable: any): Promise<SearchioResponse> {
        try {

            let table = {
                columns: [
                    { title: "Ethnic Group", key: "ethnicGroup", type: "Text" },
                    { title: "Count", key: "number", type: "Number" }
                ],
                rows: []
            }

            let trs = await cultureTable.findElements(this.webdriver.By.xpath('./tbody/tr'));

            for(let tr of trs) {
                let type = await tr.findElement(this.webdriver.By.xpath('./td[1]')).getText();
                let text = await tr.findElement(this.webdriver.By.xpath('./td[2]')).getText();
                table.rows.push({
                    ethnicGroup: type,
                    number: text
                });
            }

            this.data.push({ name: "Ethnic Group", type: "Table", data: table });
            
            return this.success(`Successfully stripped ethnic group table`);
        } catch(err) {
            return this.error(`Error stripping ethnic group table`, err);
        }
    }

    // Function to scrape birth country table
    public async cultureBirthCountryTable(cultureTable: any): Promise<SearchioResponse> {
        try {

            let table = {
                columns: [
                    { title: "Country of Birth", key: "birthCountry", type: "Text" },
                    { title: "Count", key: "number", type: "Number" }
                ],
                rows: []
            }

            let trs = await cultureTable.findElements(this.webdriver.By.xpath('./tbody/tr'));

            for(let tr of trs) {
                let type = await tr.findElement(this.webdriver.By.xpath('./td[1]')).getText();
                let text = await tr.findElement(this.webdriver.By.xpath('./td[2]')).getText();
                table.rows.push({
                    birthCountry: type,
                    number: text
                });
            }

            this.data.push({ name: "Birth Country", type: "Table", data: table });
            
            return this.success(`Successfully stripped birth country table`);
        } catch(err) {
            return this.error(`Error stripping birth country table`, err);
        }
    }

    // Function to scrape passports held table
    public async culturePassportsTable(cultureTable: any): Promise<SearchioResponse> {
        try {

            let table = {
                columns: [
                    { title: "Passport(s) Held", key: "passportsHeld", type: "Text" },
                    { title: "Count", key: "number", type: "Number" }
                ],
                rows: []
            }

            let trs = await cultureTable.findElements(this.webdriver.By.xpath('./tbody/tr'));

            for(let tr of trs) {
                let type = await tr.findElement(this.webdriver.By.xpath('./td[1]')).getText();
                let text = await tr.findElement(this.webdriver.By.xpath('./td[2]')).getText();
                table.rows.push({
                    passportsHeld: type,
                    number: text
                });
            }

            this.data.push({ name: "Passport Held", type: "Table", data: table });
            
            return this.success(`Successfully stripped passports held table`);
        } catch(err) {
            return this.error(`Error stripping passports held table`, err);
        }
    }

    // Function to scrape religion table
    public async cultureReligionTable(cultureTable: any): Promise<SearchioResponse> {
        try {

            let table = {
                columns: [
                    { title: "Religion", key: "religion", type: "Text" },
                    { title: "Count", key: "number", type: "Number" }
                ],
                rows: []
            }

            let trs = await cultureTable.findElements(this.webdriver.By.xpath('./tbody/tr'));

            for(let tr of trs) {
                let type = await tr.findElement(this.webdriver.By.xpath('./td[1]')).getText();
                let text = await tr.findElement(this.webdriver.By.xpath('./td[2]')).getText();
                table.rows.push({
                    religion: type,
                    number: text
                });
            }

            this.data.push({ name: "Religion", type: "Table", data: table });
            
            return this.success(`Successfully stripped religion table`);
        } catch(err) {
            return this.error(`Error stripping religion table`, err);
        }
    }

    // Function to scrape economic activity table
    public async employmentEconomicActivityTable(employmentTable: any): Promise<SearchioResponse> {
        try {

            let table = {
                columns: [
                    { title: "Economic Activity", key: "economicActivity", type: "Text" },
                    { title: "Count", key: "number", type: "Number" }
                ],
                rows: []
            }

            let trs = await employmentTable.findElements(this.webdriver.By.xpath('./tbody/tr'));

            for(let tr of trs) {
                let type = await tr.findElement(this.webdriver.By.xpath('./td[1]')).getText();
                let text = await tr.findElement(this.webdriver.By.xpath('./td[2]')).getText();
                table.rows.push({
                    economicActivity: type,
                    number: text
                });
            }

            this.data.push({ name: "Economic Activity", type: "Table", data: table });
            
            return this.success(`Successfully stripped economic activity table`);
        } catch(err) {
            return this.error(`Error stripping economic activity table`, err);
        }
    }

    public getDistance(str: string) {

        let val = str.split(' ')[0];
        let unit = str.split(' ')[1];

        if(unit === 'miles') {
            return parseFloat(val);
        } else {
            return parseFloat(val) / 1760
        }


    }

    // Function to scrape employment industry table
    public async employmentIndustryTable(employmentTable: any): Promise<SearchioResponse> {
        try {

            let table = {
                columns: [
                    { title: "Employment Industry", key: "employmentIndustry", type: "Text" },
                    { title: "Count", key: "number", type: "Number" }
                ],
                rows: []
            }

            let trs = await employmentTable.findElements(this.webdriver.By.xpath('./tbody/tr'));

            for(let tr of trs) {
                let type = await tr.findElement(this.webdriver.By.xpath('./td[1]')).getText();
                let text = await tr.findElement(this.webdriver.By.xpath('./td[2]')).getText();
                table.rows.push({
                    employmentIndustry: type,
                    number: text
                });
            }

            this.data.push({ name: "Employment Industry", type: "Table", data: table });
            
            return this.success(`Successfully stripped employment industry table`);
        } catch(err) {
            return this.error(`Error stripping employment industry table`, err);
        }
    }

    // Function to scrape nearby railway table
    public async nearbyRailwayTable(nearbyTable: any): Promise<SearchioResponse> {
        try {

            let table = {
                columns: [
                    { title: "Railway Stations", key: "railwayStation", type: "Text" },
                    { title: "Distance (miles)", key: "distance", type: "Number" }
                ],
                rows: []
            }

            let trs = await nearbyTable.findElements(this.webdriver.By.xpath('./tbody/tr'));

            for(let tr of trs) {
                let type = await tr.findElement(this.webdriver.By.xpath('./td[1]')).getText();
                let text = await tr.findElement(this.webdriver.By.xpath('./td[2]')).getText();
                table.rows.push({
                    railwayStation: type,
                    distance: this.getDistance(text)
                });
            }



            this.data.push({ name: "Railway Stations", type: "Table", data: table });
            
            return this.success(`Successfully stripped nearby railway station table`);
        } catch(err) {
            return this.error(`Error stripping nearby railway station table`, err);
        }
    }

    // Function to scrape nearby primary schools table
    public async nearbyPrimaryTable(nearbyTable: any): Promise<SearchioResponse> {
        try {

            let table = {
                columns: [
                    { title: "Primary Schools", key: "primary", type: "Text" },
                    { title: "Distance (miles)", key: "distance", type: "Number" }
                ],
                rows: []
            }

            let trs = await nearbyTable.findElements(this.webdriver.By.xpath('./tbody/tr'));

            for(let tr of trs) {
                let type = await tr.findElement(this.webdriver.By.xpath('./td[1]')).getText();
                let text = await tr.findElement(this.webdriver.By.xpath('./td[2]')).getText();
                table.rows.push({
                    primary: type,
                    distance: this.getDistance(text)
                });
            }

            this.data.push({ name: "Primary Schools", type: "Table", data: table });
            
            return this.success(`Successfully stripped nearby primary schools table`);
        } catch(err) {
            return this.error(`Error stripping nearby primary schools table`, err);
        }
    }

    // Function to scrape nearby secondary schools table
    public async nearbySecondaryTable(nearbyTable: any): Promise<SearchioResponse> {
        try {

            let table = {
                columns: [
                    { title: "Secondary Schools", key: "secondary", type: "Text" },
                    { title: "Distance (miles)", key: "distance", type: "Number" }
                ],
                rows: []
            }

            let trs = await nearbyTable.findElements(this.webdriver.By.xpath('./tbody/tr'));

            for(let tr of trs) {
                let type = await tr.findElement(this.webdriver.By.xpath('./td[1]')).getText();
                let text = await tr.findElement(this.webdriver.By.xpath('./td[2]')).getText();
                table.rows.push({
                    secondary: type,
                    distance: this.getDistance(text)
                });
            }

            this.data.push({ name: "Secondary Schools", type: "Table", data: table });
            
            return this.success(`Successfully stripped nearby secondary schools table`);
        } catch(err) {
            return this.error(`Error stripping nearby secondary schools table`, err);
        }
    }

    // Function to scrape nearby doctor table
    public async nearbyDoctorTable(nearbyTable: any): Promise<SearchioResponse> {
        try {

            let table = {
                columns: [
                    { title: "Doctor Surgeries", key: "doctorSurgeries", type: "Text" },
                    { title: "Distance (miles)", key: "distance", type: "Number" }
                ],
                rows: []
            }

            let trs = await nearbyTable.findElements(this.webdriver.By.xpath('./tbody/tr'));

            for(let tr of trs) {
                let type = await tr.findElement(this.webdriver.By.xpath('./td[1]')).getText();
                let text = await tr.findElement(this.webdriver.By.xpath('./td[2]')).getText();
                table.rows.push({
                    doctorSurgeries: type,
                    distance: this.getDistance(text)
                });
            }

            this.data.push({ name: "Doctor Surgeries", type: "Table", data: table });
            
            return this.success(`Successfully stripped nearby doctor surgeries table`);
        } catch(err) {
            return this.error(`Error stripping nearby doctor surgeries table`, err);
        }
    }

    // Function to scrape nearby hospitals table
    public async nearbyHospitalTable(nearbyTable: any): Promise<SearchioResponse> {
        try {

            let table = {
                columns: [
                    { title: "Hospitals", key: "hospitals", type: "Text" },
                    { title: "Distance (miles)", key: "distance", type: "Number" }
                ],
                rows: []
            }

            let trs = await nearbyTable.findElements(this.webdriver.By.xpath('./tbody/tr'));

            for(let tr of trs) {
                let type = await tr.findElement(this.webdriver.By.xpath('./td[1]')).getText();
                let text = await tr.findElement(this.webdriver.By.xpath('./td[2]')).getText();
                table.rows.push({
                    hospitals: type,
                    distance: this.getDistance(text)
                });
            }

            this.data.push({ name: "Hospitals", type: "Table", data: table });
            
            return this.success(`Successfully stripped nearby hospitals table`);
        } catch(err) {
            return this.error(`Error stripping nearby hospitals table`, err);
        }
    }

    // Function to find and strip all tables
    public async stripTables(): Promise<SearchioResponse> {
        try {
            let tables = await this.driver.findElements(this.webdriver.By.xpath('//div[@class="tab-pane suppressUntilActive active"]//table[@class="table table-striped table-hover"]'));
            for(let table of tables) {
                // Check for thead (all the tables we want are the ones with thead)
                let tableHead = await table.findElements(this.webdriver.By.xpath('./thead'));
                if(tableHead.length > 0) {
                    tableHead = await table.findElement(this.webdriver.By.xpath('./thead')).getText();

                    if(tableHead == 'Housing Types'){
                        await this.housingTypeTable(table);
                    } else if(tableHead == 'Housing Tenure') {
                        await this.housingTenureTable(table);
                    } else if(tableHead == 'Housing Occupancy') {
                        await this.housingOccupancyTable(table);
                    } else if(tableHead == 'Social Grade') {
                        await this.peopleSocialGradeTable(table);
                    } else if(tableHead == 'Gender') {
                        await this.peopleGenderTable(table);
                    } else if(tableHead == 'Age Groups') {
                        await this.peopleAgeGroupsTable(table);
                    } else if(tableHead == 'Relationship Status') {
                        await this.peopleRelationshipStatusTable(table);
                    } else if(tableHead == 'Health') {
                        await this.peopleHealthTable(table);
                    } else if(tableHead == 'Highest Qualification Level Achieved') {
                        await this.peopleEducationTable(table);
                    } else if(tableHead == 'Welsh Language') {
                        await this.cultureWelshLanguageTable(table);
                    } else if(tableHead == 'Ethnic Group') {
                        await this.cultureEthnicTable(table);
                    } else if(tableHead == 'Country of Birth') {
                        await this.cultureBirthCountryTable(table);
                    } else if(tableHead == 'Passport(s) Held') {
                        await this.culturePassportsTable(table);
                    } else if(tableHead == 'Religion') {
                        await this.cultureReligionTable(table);
                    } else if(tableHead == 'Economic Activity') {
                        await this.employmentEconomicActivityTable(table);
                    } else if(tableHead == 'Employment Industry') {
                        await this.employmentIndustryTable(table);
                    } else if(tableHead == 'Name Approximate Distance*') {

                        let href = await table.findElement(this.webdriver.By.xpath('./tbody/tr/td[1]/a')).getAttribute('href');
                        if(href.includes('railwaystation')) {
                            await this.nearbyRailwayTable(table);
                        } else if (href.includes('primary')) {
                            await this.nearbyPrimaryTable(table);
                        } else if (href.includes('secondary')) {
                            await this.nearbySecondaryTable(table);
                        } else if (href.includes('gppractice')) {
                            await this.nearbyDoctorTable(table);
                        } else if (href.includes('hospital')) {
                            await this.nearbyHospitalTable(table);
                        } else {
                            console.log(`WE CANNOT HANDLE NEARBY TABLE WITH EXAMPLE HREF: ${href}`);
                        }

                    } else {
                        console.log(`WE CANNOT HANDLE TABLE WITH HEADING: ${tableHead}`);
                    }
                }
            }

            return this.success(`Successfully stripped information`);
        } catch(err) {
            return this.error(`Error stripping tables`, err)
        }
    }

    // Function to strip basic inforamtion and information inn tabs Housing, People, Culture and Employment
    public async stripInfo(): Promise<SearchioResponse> {

        try {

            // Check the basic information is present
            let check = await this.driver.findElements(this.webdriver.By.xpath('//div[@id="summary"]/div[2]//table[@class="table table-striped table-hover"]'));
            
            
            if(check.length > 0) {

                // Get the address
                let address = await this.driver.findElements(this.webdriver.By.xpath('//div[@id="main_inner"]/div[2]/div/h1'));
                if(address.length > 0) {
                    address = await this.driver.findElement(this.webdriver.By.xpath('//div[@id="main_inner"]/div[2]/div/h1')).getText();
                    address = address.replace('Area Information for ', '');
                    this.data.push({ name: "Address", type: "Text", data: address });
                } else {
                    address = await this.driver.getCurrentUrl();
                    address = address.replace('https://www.streetcheck.co.uk/postcode/', '').toUpperCase();
                    this.data.push({ name: "Address", type: "Text", data: address });
                }

                // Collect the rows of basic information
                let tableRows = await this.driver.findElements(this.webdriver.By.xpath('//div[@id="summary"]/div[2]//table[@class="table table-striped table-hover"]/tbody/tr'));

                // Iterate through each row and strip out information
                for(let row of tableRows){
                    let rowTitle = await row.findElement(this.webdriver.By.xpath('./td')).getText();
                    let rowValue = await row.findElement(this.webdriver.By.xpath('./td[2]')).getText();
                    if(rowTitle == 'Area Type') {
                        this.data.push({ name: "Area Type", type: "Text", data: rowValue });
                    } else if(rowTitle == 'Local Authority') {
                        this.data.push({ name: "Local Authority", type: "Text", data: rowValue });
                    } else if(rowTitle == 'Ward') {
                        this.data.push({ name: "Ward", type: "Text", data: rowValue });
                    } else if(rowTitle == 'UK Parliamentary Constituency') {
                        this.data.push({ name: "UK Parliamentary Constituency", type: "Text", data: rowValue });
                    } else if(rowTitle == 'Country') {
                        this.data.push({ name: "Country", type: "Text", data: rowValue });
                    } else {
                        console.log(`ERR: Cannot handle row ${rowTitle}`)
                    }
                }
            
                // Iterate through the tabs
                let tabs = await this.driver.findElements(this.webdriver.By.xpath('//ul[@class="nav tab-menu nav-tabs"]/li'));
                let topics = ["Housing", "People", "Culture", "Employment", "Nearby"]

                for(let tab of tabs){
                    let tabText = await tab.getText();
                    // Check if its a tab we want
                    let test = topics.some(el => tabText.includes(el));
                    if(test == true) {
                        // Click the tab
                        await tab.click();
                        // Strip the tables
                        await this.stripTables();
                    }
                }

                return this.success(`Successfully stripped information`);

            } else {
                return this.error(`Error stripping summary table`)
            }
        
        } catch(err) {

            console.log(err);

            return this.error(`Error stripping information`, err)
        }
    }

    // Function to strip out crime statistics
    public async stripCrime(): Promise<SearchioResponse> {

        try {

            
            let currentURL = await this.driver.getCurrentUrl();
            let newURL = currentURL.replace('postcode', 'crime');
            await this.driver.get(newURL);



            let table = {
                columns: [
                    { title: "Crime Type", key: "crimes", type: "Text" },
                    { title: "Count", key: "number", type: "Number" }
                ],
                rows: []
            }
            
            let crimes = await this.driver.findElements(this.webdriver.By.xpath('//ul[@class="nav tab-menu nav-tabs"]/li'));
            for(let crime of crimes) {
                let crimeText = await crime.getText();
                crimeText = crimeText.split(/[()]+/);
                let crimeNumber = crimeText[1].trim();
                crimeText = crimeText[0].trim();

                table.rows.push({
                    crimes: crimeText,
                    number: crimeNumber
                });

            }

            let eles = await this.driver.findElements(this.webdriver.By.xpath('//p//strong'));
            
            /*let i = 0;
            for(let e of eles) {
                console.log(String(i) + " " + await e.getText())
                i++;
            }*/

            let date =  await eles[3].getText();

            if(table.rows.length > 0) this.data.push({ name: `Crime Statistics (${date})`, type: "Table", data: table });

            return this.success(`Successfully stripped crime stats`);

        } catch(err) {
            return this.error(`Error stripping crime stats`, err)
        }
    }

    // Main function to call (calls all others)
    public async search(address: string = this.query): Promise<SearchioResponse> {

        try {

            // Load the search
            await this.loadSearch(address);
            

            // Strip all the tables in Housing, People, Culture and Employment
            await this.stripInfo();


            // Go to the seperate webpage for crime statistics
            await this.stripCrime();
    

            return this.success(`Successfully completed search for ${this.query}`, this.data);
        
        } catch(err) {
            return this.error(`Error completing search`, err)
        }
    }

}