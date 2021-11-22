import { SearchioResponse } from "../../../models/SearchioResponse";
import { OpenCorporatesProcess } from "./OpenCorporatesProcess";
import { SocketService } from "../../SocketService";
import { BUSINESS } from "../../../assets/RegexPatterns";
import { ResultData } from "../../../models/ResultData";


const request = require('request');

export class OpenCorporatesCompaniesSearch extends OpenCorporatesProcess {
    
    protected id = "OpenCorporatesCompaniesSearch";           
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
        let result = await this.scrapeCompanies();
        this.destroyWebdriver();
        return result;
    }
    


    // Main function called to scrape companies
    public async scrapeCompanies(countryCode: string = 'GB', query: string = this.query): Promise<SearchioResponse> {
        try{
            await this.driver.get(`https://opencorporates.com/companies/${countryCode}?q=${query}&utf8=%E2%9C%93`);

            //let companies = await this.flipThrough('//li[@class="next next_page "]/a', '//div[@id="results"]/ul/li', this.stripCompanies.bind(this), 1);
            let companies = await this.driver.findElements(this.webdriver.By.xpath('//div[@id="results"]/ul/li'));
            console.log(`We have ${companies.length} companies that match the search term ${this.query}`);

            let table = await this.stripInfo(companies);

            return this.success(`Completed`, table.data);

        } catch(err) {
            return this.error(`Error scraping companies`, err)
        }
    }

    

    public async stripInfo(companies): Promise<SearchioResponse> {
        try{
            
            const table = {

                columns: [
                    { title: "Company Name", key: "companyName", type: "Text" },
                    { title: "Company Number", key: "companyNumber", type: "Text" },
                    { title: "Company Status", key: "companyStatus", type: "Text" },
                    { title: "Start Date", key: "startDate", type: "Text" },
                    { title: "End Date", key: "endDate", type: "Text" },
                    { title: "Address", key: "address", type: "Text" }
                ],
                rows: []
            }

            for(let company of companies) {
                let rowName;
                let rowNumber;
                let rowStatus;
                let rowStart;
                let rowEnd;
                let rowAddress;

                let name = await company.findElement(this.webdriver.By.xpath('./a[2]')).getText();
                rowName = name;

                let number = await company.findElement(this.webdriver.By.xpath('./a[2]')).getAttribute('title');
                number = number.split(',');
                number = number[number.length - 1];
                number = number.substring(1, number.length - 1);
                rowNumber = number;

                let status = await company.findElements(this.webdriver.By.xpath('.//span[@class="status label"]'));
                let activeCheck = await company.findElement(this.webdriver.By.xpath('./a[2]')).getAttribute('class');
                if (status.length > 0) {
                    status = await company.findElement(this.webdriver.By.xpath('.//span[@class="status label"]')).getText();
                    rowStatus = status;
                } else if (activeCheck == 'company_search_result active') {
                    rowStatus = 'Active';
                } else {
                    rowStatus = 'Unknown';
                }

                let startDate = await company.findElements(this.webdriver.By.xpath('.//span[@class="start_date"]'));
                if (startDate.length > 0) {
                    startDate = await company.findElement(this.webdriver.By.xpath('.//span[@class="start_date"]')).getText();
                    rowStart = startDate;
                } else {
                    rowStart = 'Unknown';
                }

                let endDate = await company.findElements(this.webdriver.By.xpath('.//span[@class="end_date"]'));
                if (endDate.length > 0) {
                    endDate = await company.findElement(this.webdriver.By.xpath('.//span[@class="end_date"]')).getText();
                    rowEnd = endDate;
                } else {
                    rowEnd = 'Unknown';
                }

                let address = await company.findElements(this.webdriver.By.xpath('.//span[@class="address"]'));
                if (address.length > 0) {
                    address = await company.findElement(this.webdriver.By.xpath('.//span[@class="address"]')).getText();
                    rowAddress = address;
                } else {
                    rowAddress = 'Unknown';
                }


                table.rows.push({
                    companyName: rowName,
                    companyNumber: rowNumber,
                    companyStatus: rowStatus,
                    startDate: rowStart,
                    endDate: rowEnd,
                    address: rowAddress
                });
            }

            if(table.rows.length === 0) return this.success(`No results found`, []);


            const results: ResultData[] = [
                { name: "Companies", type: "Table", data: table }
            ]

            return this.success(`Successfully performed companies search`, results);
        } catch(err) {
            return this.error(`Error scraping companies`, err)
        }
    }

}