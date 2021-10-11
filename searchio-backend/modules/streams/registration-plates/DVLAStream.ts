import { REGISTRATION_PLATE } from "../../../assets/RegexPatterns";
import { PatternProcessPair } from "../../../models/PatternProcessPair";
import { SearchioResponse } from "../../../models/SearchioResponse";
import { DataSourceName } from "../../../types/DataSourceName";
import { ProcessCode, ProcessStatus, ProcessStatusCodeEnum } from "../../../types/ProcessStatusCode";
import { error, success } from "../../ResponseHandler";
import { SocketService } from "../../SocketService";
import { ScraperStream } from "../ScraperStream";

export class DVLAStream extends ScraperStream {

    //  Unique identifier for this data source
    protected id: DataSourceName = "DVLA";

    //  Object containin the processes utilised by this stream
    //  Each process is indexed with a "process name", which concisely describes the process
    //  Each property of the object is a Process interface (see models/Process)
    protected processes: any = {
        
        "vehicle details": { 
            source: this.id,
            query: this.query,
            name: "vehicle details", 
            code: ProcessStatusCodeEnum.DORMANT as ProcessCode, 
            status: "DORMANT" as ProcessStatus, 
            message: `Awaiting command...`
        }
    };

    //  Object containing the valid patterns for each process used by this stream
    protected patterns: PatternProcessPair[] = [
        { pattern: REGISTRATION_PLATE, process: this.scrapeVehicleDetails.bind(this) }
    ]

    /*
    *       The Stream/ScraperStream classes have been altered to take a SocketService in the contructor.
    */


    constructor(query: string, socket: SocketService) {
        super(query, socket);
        this.tags.push("dvla");
    }


    public async loadVehicleDetails(reg: string): Promise<SearchioResponse> {

        try {
            await this.driver.get('https://vehicleenquiry.service.gov.uk/');

            await this.waitForElement('//div[@class="govuk-form-group"]/input', 20);
            await this.driver.findElement(this.webdriver.By.xpath('//div[@class="govuk-form-group"]/input')).sendKeys(reg);
            await this.driver.findElement(this.webdriver.By.xpath('//button[@id="submit_vrn_button"]')).click();
            
            await this.waitForElement('//input[@id="yes-vehicle-confirm"]', 20);
            await this.driver.findElement(this.webdriver.By.xpath('//input[@id="yes-vehicle-confirm"]')).click();
            await this.driver.findElement(this.webdriver.By.xpath('//button[@id="capture_confirm_button"]')).click();

            return success(`(DVLAStream) Successfully entered vehicle details`);
        } catch(err) {
            return error(`(DVLAStream) Error entering vehicle details`, err);
        }
    }

    public async scrapeVehicleDetails(reg: string = this.query): Promise<SearchioResponse> {

        //  Set a name constant for this process
        const PROCESS_NAME = "vehicle details"

        //  Set status of this process to ACTIVE
        this.setProcessStatus(PROCESS_NAME, ProcessStatusCodeEnum.ACTIVE as ProcessCode, `Fetching vehicle details ${reg}...`);

        try {

            await this.loadVehicleDetails(reg);

            await this.waitForElement('//main[@class="govuk-main-wrapper"]/div[2]/div/div/h2', 20);

            let carFormat: {   
                registrationPlate: string, 
                vehicleMake?: string,
                taxStatus?: string, 
                taxDue?: Date,
                motStatus?: string,
                motDue?: Date,
                firstRegistration?: Date,
                yearofManufacture?: Date,
                cylinderCapacity?: string,
                co2Emissions?: string,
                fuelType?: string,
                euroStatus?: string,
                realDrivingEmissions?: string,
                exportMarker?: string,
                vehicleStatus?: string,
                vehicleColour?: string,
                vehicleTypeApproval?: string,
                wheelplan?: string,
                revenueWeight?: string,
                lastV5C?: Date
            } = {
                registrationPlate: undefined
            };

            carFormat.registrationPlate = reg;


            //  Find the vehicle make

            let vehicleMake = await this.driver.findElements(this.webdriver.By.xpath('//div[@id="make"]/dd'));
            
            if(vehicleMake.length > 0) {
                carFormat.vehicleMake = vehicleMake[0].getText();
            } else {
                this.error(`Could not find "vehicle make" element...`);
            }

            //  Find the tax status
            
            let taxStatus = await this.driver.findElements(this.webdriver.By.xpath('//main[@class="govuk-main-wrapper"]/div[2]/div/div/h2'));
            
            if(taxStatus.length > 0) {
                if(taxStatus[0].getText() == "✓ Taxed") {
                    carFormat.taxStatus = "Taxed";
                } else if (taxStatus[0].getText() == "✗ Untaxed") {
                    carFormat.taxStatus = "Untaxed";
                } else {
                    carFormat.taxStatus = "Unknown";
                }
            } else {
                this.error(`Could not find "tax status" element...`);
            }

            //  Find the tax due date
            

            let taxDue = await this.driver.findElements(this.webdriver.By.xpath('//main[@class="govuk-main-wrapper"]/div[2]/div/div/div/strong[2]'));
            
            if(taxDue.length > 0) {
                carFormat.taxDue = new Date(taxDue[0].getText());
            } else {
                this.error(`Could not find "tax due" element...`);
            }

            //  Find the MOT status

            let motStatus = await this.driver.findElements(this.webdriver.By.xpath('//main[@class="govuk-main-wrapper"]/div[2]/div[2]/div/h2'));
            
            if(motStatus.length > 0) {
                if(motStatus[0].getText() == "✓ MOT") {
                    carFormat.motStatus = "Valid MOT";
                } else if (motStatus[0].getText() == "✗ MOT") {
                    carFormat.motStatus = "Invalid MOT";
                } else {
                    carFormat.motStatus = "Unknown";
                }
            } else {
                this.error(`Could not find "MOT status" element...`);
            }
            
            //  Find the MOT due date
            
            let motDue = await this.driver.findElements(this.webdriver.By.xpath('//main[@class="govuk-main-wrapper"]/div[2]/div[2]/div/div/strong[2]'));
            
            if(taxDue.length > 0) {
                carFormat.motDue = new Date(motDue[0].getText());
            } else {
                this.error(`Could not find "tax due" element...`);
            }
    
            // Find the first registration plate of this vehicle

            let firstRegistration = await this.driver.findElements(this.webdriver.By.xpath('//div[@id="date_of_first_registration"]/dd'));

            if(firstRegistration.length > 0) {
                carFormat.firstRegistration = new Date(firstRegistration[0].getText());
            } else {
                this.error(`Could not find "first registration" element...`);
            }

            

            /*let yearOfManufacture = await this.driver.findElement(this.webdriver.By.xpath('//div[@id="year_of_manufacture"]/dd')).getText();
            carFormat.yearofManufacture = new Date(yearOfManufacture);

            let cylinderCapacity = await this.driver.findElement(this.webdriver.By.xpath('//div[@id="engine_capacity"]/dd')).getText();
            carFormat.cylinderCapacity = cylinderCapacity;

            let co2Emissions = await this.driver.findElement(this.webdriver.By.xpath('//div[@id="co2_emissions"]/dd')).getText();
            carFormat.co2Emissions = co2Emissions;

            let fuelType = await this.driver.findElement(this.webdriver.By.xpath('//div[@id="fuel_type"]/dd')).getText();
            carFormat.fuelType = fuelType;

            let euroStatus = await this.driver.findElement(this.webdriver.By.xpath('//div[@id="euro_status"]/dd')).getText();
            carFormat.euroStatus = euroStatus;

            let realDrivingEmissions = await this.driver.findElement(this.webdriver.By.xpath('//div[@id="real_driving_emissions"]/dd')).getText();
            carFormat.realDrivingEmissions = realDrivingEmissions;

            let exportMarker = await this.driver.findElement(this.webdriver.By.xpath('//div[@id="marked_for_export"]/dd')).getText();
            carFormat.exportMarker = exportMarker;

            let vehicleStatus = await this.driver.findElement(this.webdriver.By.xpath('//div[@id="vehicleStatus"]/dd')).getText();
            carFormat.vehicleStatus = vehicleStatus;

            let vehicleColour = await this.driver.findElement(this.webdriver.By.xpath('//div[@id="colour"]/dd')).getText();
            carFormat.vehicleColour = vehicleColour;

            let vehicleTypeApproval = await this.driver.findElement(this.webdriver.By.xpath('//div[@id="type_approval"]/dd')).getText();
            carFormat.vehicleTypeApproval = vehicleTypeApproval;

            let wheelplan = await this.driver.findElement(this.webdriver.By.xpath('//div[@id="wheelPlan"]/dd')).getText();
            carFormat.wheelplan = wheelplan;

            let revenueWeight = await this.driver.findElement(this.webdriver.By.xpath('//div[@id="revenue_weight"]/dd')).getText();
            carFormat.revenueWeight = revenueWeight;

            let lastV5C = await this.driver.findElement(this.webdriver.By.xpath('//div[@id="date_of_last_v5c_issued"]/dd')).getText();
            carFormat.lastV5C = new Date(lastV5C);*/

            // DATES NEED TO BE CHANGED WRT TIMEZONES

            console.log(carFormat);

            this.setProcessStatus(PROCESS_NAME, ProcessStatusCodeEnum.COMPLETED as ProcessCode, `Completed!`);
            return this.success(`Successfully scraped vehicle details`, carFormat);
        } catch(err) {
            
            this.setProcessStatus(PROCESS_NAME, ProcessStatusCodeEnum.ERROR as ProcessCode, `Error!`);
            return this.error(`Error scraping vehicle details`, err);
        }
    }
}