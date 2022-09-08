import { SearchioResponse } from "../../../models/SearchioResponse";
import { WebElement } from "selenium-webdriver";
import { SocketService } from "../../SocketService";
import { CompaniesHouseProcess } from "./CompaniesHouseProcess";
import { BUSINESS } from "../../../assets/RegexPatterns";
import { ResultData } from "../../../models/ResultData";


export class CompaniesHouseCompaniesSearch extends CompaniesHouseProcess {

    protected id = "CompaniesHouseCompaniesSearch";           
    protected name: string = "Companies Search";
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
        this.initWebdriver();
        let result = await this.companiesSearch();
        this.destroyWebdriver();
        return result;
    }


    // Function to strip companies out of search
    public async companiesSearch(company: string = this.query): Promise<SearchioResponse> {

        // Prepare company name for URL
        company = company.replace(/\s+/g, '+');
        let links: any[] = [];

        try {

            await this.naviagteTo(`https://find-and-update.company-information.service.gov.uk/search/companies?q=${company}`);

            //let companies = await this.flipThrough('//a[@id="next-page"]', '//ul[@id="results"]/li/h3/a', this.stripCompaniesPage.bind(this), 1);
            let companies = await this.driver.findElements(this.webdriver.By.xpath('//ul[@id="results"]/li'));
            
            if(companies.length === 0) return this.success(`No matching companies found.`)

            let results = await this.stripCompaniesPage(companies);

            if(results.success) {
                return this.success(`Successfully performed companies search`, results.data);
            } else {
                return results;
            }
            
        } catch(err) {
            return this.error(`Error performing companies search`, err)
        }
    }


    public async stripCompaniesPage(companies): Promise<SearchioResponse> {
        try {
            const t = this;
            
            const table = {

                columns: [
                    { title: "Company Name", key: "companyName", type: "Text" },
                    { title: "Previous Names", key: "previousNames", type: "Text" },
                    { title: "Company Number", key: "companyNumber", type: "Text" },
                    { title: "Notable Date", key: "notableDate", type: "Text" },
                    { title: "Address", key: "address", type: "Text" }
                ],
                rows: []
            }

            for(let company of companies) {
                let rowName;
                let rowNumber;
                let rowDate;
                let rowPreviousNames;
                let rowAddress;


                let name = await company.findElement(this.webdriver.By.xpath('./h3/a')).getText();
                rowName = name;

                let prevNames = await company.findElements(this.webdriver.By.xpath('.//p[@class="meta crumbtrail inset"]/span'));
                if (prevNames.length > 0) {
                    prevNames = await company.findElement(this.webdriver.By.xpath('.//p[@class="meta crumbtrail inset"]/span')).getText();
                    rowPreviousNames = prevNames;
                } else {
                    rowPreviousNames = 'No other previous names found';
                }

                let numberDate = await company.findElements(this.webdriver.By.xpath('.//p[@class="meta crumbtrail"]'));
                if (numberDate.length > 0) {
                    numberDate = await company.findElement(this.webdriver.By.xpath('.//p[@class="meta crumbtrail"]')).getText();
                    numberDate = numberDate.split('-');
                    if (numberDate.length == 2) {
                        let number = numberDate[0].trim();
                        let date = numberDate[1].trim();
                        rowNumber =  number;
                        rowDate = date;
                    } else {
                        let number = numberDate[0].trim();
                        rowNumber = number;
                        rowDate = 'No notable date found';
                    }
                } else {
                    rowNumber = 'No company number found';
                    rowDate = 'No notable date found';
                }

                let address = await company.findElements(this.webdriver.By.xpath('./p'));
                if (address.length > 0 && address.length == 2) {
                    address = await company.findElement(this.webdriver.By.xpath('./p[2]')).getText();
                    rowAddress = address
                } else if (address.length > 0 && address.length == 3) {
                    address = await company.findElement(this.webdriver.By.xpath('./p[3]')).getText();
                    rowAddress = address
                } else {
                    rowAddress = 'No address found'
                }

                table.rows.push({
                    companyName: rowName,
                    previousNames: rowPreviousNames,
                    companyNumber: rowNumber,
                    notableDate: rowDate,
                    address: rowAddress
                });
            }

            if(table.rows.length === 0) return this.success(`Found no matching companies.`, []);


            let result: ResultData = {
                name: "Companies",
                type: "Table",
                data: table
            }

            return this.success(`Successfully performed companies search`, [result]);
        } catch(err) {

            console.log(err);

            return this.error(`Error performing companies search`, err)
        }
    }
   


}