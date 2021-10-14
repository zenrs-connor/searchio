import { REGISTRATION_PLATE } from "../../../assets/RegexPatterns";
import { SearchioResponse } from "../../../models/SearchioResponse";
import { DataSourceName } from "../../../types/DataSourceName";
import { ProcessStatusCodeEnum } from "../../../types/ProcessStatusCode";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";
import * as MD5 from "md5";
import { ProcessResult } from "../../../models/ProcessResult";
import { ResultData } from "../../../models/ResultData";

export class DVLAVehicleCheck extends Process {


    protected id = "DVLAVehicleCheck";                   
    protected source: DataSourceName = "DVLA";      
    protected name: "Vehicle Check";                 
    protected pattern: RegExp = REGISTRATION_PLATE;        
    
    

    //  Process extends the ResponseEmitter class, so bve sure to include an argument for the socket
    //  Processes also take a query on creation
    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }

    //  Overwrite of the abstract function held in Process.ts
    //  This function is what is called when the Process executes
    //  It returns a SearchioResponse containing any success or error data
    protected async process(): Promise<SearchioResponse> {
        await this.loadVehicleDetails();
        return await this.scrapeVehicleDetails();
    }

    /*
    
    ADDITIONAL FUNCTIONS 
    
    */

    public async loadVehicleDetails(reg: string = this.query): Promise<SearchioResponse> {
        try {
            await this.driver.get('https://vehicleenquiry.service.gov.uk/');
            await this.waitForElement('//div[@class="govuk-form-group"]/input', 20);
            await this.driver.findElement(this.webdriver.By.xpath('//div[@class="govuk-form-group"]/input')).sendKeys(reg);
            await this.driver.findElement(this.webdriver.By.xpath('//button[@id="submit_vrn_button"]')).click();
            await this.waitForElement('//input[@id="yes-vehicle-confirm"]', 20);
            await this.driver.findElement(this.webdriver.By.xpath('//input[@id="yes-vehicle-confirm"]')).click();
            await this.driver.findElement(this.webdriver.By.xpath('//button[@id="capture_confirm_button"]')).click();
            return this.success(`Successfully entered vehicle details`);
        } catch(err) {
            console.log(err);
            return this.error(`Error entering vehicle details`, err);
        }
    }

    private async scrapeVehicleDetails(reg: string = this.query): Promise<SearchioResponse> {

        this.setStatus("ACTIVE", `Loading vehicle details...`)

        try {
            

            await this.loadVehicleDetails(reg);

            this.setStatus("ACTIVE", `Scraping vehicle details...`)

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


            let vehicleMake = await this.driver.findElements(this.webdriver.By.xpath('//div[@id="make"]/dd'));
            if(vehicleMake.length > 0) {
                carFormat.vehicleMake = await vehicleMake[0].getText();
            } else { this.error(`Could not find "vehicle make" element.`) }

            //

            let taxStatus = await this.driver.findElements(this.webdriver.By.xpath('//main[@class="govuk-main-wrapper"]/div[2]/div/div/h2'));
            if(taxStatus.length > 0) {
                if(await taxStatus[0].getText() == "✓ Taxed") {
                    carFormat.taxStatus = "Taxed";
                } else if (await taxStatus[0].getText() == "✗ Untaxed") {
                    carFormat.taxStatus = "Untaxed";
                } else {
                    carFormat.taxStatus = "Unknown";
                }
            } else { this.error(`Could not find "taxt status" element.`) }

            //

            let taxDue = await this.driver.findElements(this.webdriver.By.xpath('//main[@class="govuk-main-wrapper"]/div[2]/div/div/div/strong[2]'));
            if(taxDue.length > 0) {
                carFormat.taxDue = new Date(await taxDue[0].getText());
            } else { this.error(`Could not find "tax due" element.`) }

            //

            let motStatus = await this.driver.findElements(this.webdriver.By.xpath('//main[@class="govuk-main-wrapper"]/div[2]/div[2]/div/h2'));

            if(motStatus.length > 0) {
                if(await motStatus[0].getText() == "✓ MOT") {
                    carFormat.motStatus = "Valid MOT";
                } else if (await motStatus[0].getText() == "✗ MOT") {
                    carFormat.motStatus = "Invalid MOT";
                } else {
                    carFormat.motStatus = "Unknown";
                }
            } else { this.error(`Could not find "MOT status" element.`) }

            //
            
            let motDue = await this.driver.findElements(this.webdriver.By.xpath('//main[@class="govuk-main-wrapper"]/div[2]/div[2]/div/div/strong[2]'));
            if(motDue.length > 0) {
                carFormat.motDue = new Date(await motDue[0].gettext());
            } else { this.error(`Could not find "MOT due" element.`) }

            //

            let firstRegistration = await this.driver.findElements(this.webdriver.By.xpath('//div[@id="date_of_first_registration"]/dd'));

            if(firstRegistration.length > 0) {
                carFormat.firstRegistration = new Date(await firstRegistration[0].getText());
            } else { this.error(`Could not find "first registration" element.`) }

            //
            
            let yearOfManufacture = await this.driver.findElements(this.webdriver.By.xpath('//div[@id="year_of_manufacture"]/dd'));
            if(yearOfManufacture.length > 0) {
                carFormat.yearofManufacture = new Date(await yearOfManufacture[0].getText());
            } else { this.error(`Could not find "year of manufacture" element.`) }

            //

            let cylinderCapacity = await this.driver.findElements(this.webdriver.By.xpath('//div[@id="engine_capacity"]/dd'));
            if(cylinderCapacity.length > 0) {
                carFormat.cylinderCapacity = await cylinderCapacity[0].getText();
            } else { this.error(`Could not find "cylinder capacity" element.`); }

            //

            let co2Emissions = await this.driver.findElements(this.webdriver.By.xpath('//div[@id="co2_emissions"]/dd'));
            if(co2Emissions.length > 0) {
                carFormat.co2Emissions = await co2Emissions[0].getText();
            } else { this.error(`Could not find "co2 emissions" element.`); }

            //

            let fuelType = await this.driver.findElements(this.webdriver.By.xpath('//div[@id="fuel_type"]/dd'));
            if(fuelType.length > 0) {
                carFormat.fuelType = await fuelType[0].getText();
            } else { this.error(`Could not find "fuel type" element.`); }

            //

            let euroStatus = await this.driver.findElements(this.webdriver.By.xpath('//div[@id="euro_status"]/dd'));
            if(euroStatus.length > 0) {
                carFormat.euroStatus = await euroStatus[0].getText();
            } else { this.error(`Could not find "euro status" element.`); }

            //

            let realDrivingEmissions = await this.driver.findElements(this.webdriver.By.xpath('//div[@id="real_driving_emissions"]/dd'));
            if(realDrivingEmissions.length > 0) {
                carFormat.realDrivingEmissions = await realDrivingEmissions[0].getText();
            } else { this.error(`Could not find "real driving emissions" element.`); }

            //

            let exportMarker = await this.driver.findElements(this.webdriver.By.xpath('//div[@id="marked_for_export"]/dd'));
            if(exportMarker.length > 0) {
                carFormat.exportMarker = await exportMarker[0].getText();
            } else { this.error(`Could not find "export marker" element.`); }

            //

            let vehicleStatus = await this.driver.findElements(this.webdriver.By.xpath('//div[@id="vehicleStatus"]/dd'));
            if(vehicleStatus.length > 0) {
                carFormat.vehicleStatus = await vehicleStatus[0].getText();
            } else { this.error(`Could not find "vehicle status" element.`); }
            
            //

            let vehicleColour = await this.driver.findElements(this.webdriver.By.xpath('//div[@id="colour"]/dd'));
            if(vehicleColour.length > 0) {
                carFormat.vehicleColour = await vehicleColour[0].getText();
            } else { this.error(`Could not find "vehicle colour" element.`); }
            
            //

            let vehicleTypeApproval = await this.driver.findElements(this.webdriver.By.xpath('//div[@id="type_approval"]/dd'));
            if(vehicleTypeApproval.length > 0) {
                carFormat.vehicleTypeApproval = await vehicleTypeApproval[0].getText();
            } else { this.error(`Could not find "vehicle type approval" element.`); }
            
            //

            let wheelplan = await this.driver.findElements(this.webdriver.By.xpath('//div[@id="wheelPlan"]/dd'));
            if(wheelplan.length > 0) {
                carFormat.wheelplan = await wheelplan[0].getText();
            } else { this.error(`Could not find "wheelplan" element.`); }

            //

            let revenueWeight = await this.driver.findElements(this.webdriver.By.xpath('//div[@id="revenue_weight"]/dd'));
            if(revenueWeight.length > 0) {
                carFormat.revenueWeight = await revenueWeight[0].getText();
            } else { this.error(`Could not find "revenue weight" element.`); }
            
            //

            let lastV5C = await this.driver.findElements(this.webdriver.By.xpath('//div[@id="date_of_last_v5c_issued"]/dd'));
            if(lastV5C.length > 0) {
                carFormat.lastV5C = new Date(await lastV5C[0].getText());
            } else { this.error(`Could not find "last V5C" element.`); }
            

            //  Build the array of Results from the response
            const data: ResultData[] = [];

            /*
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
            */

            if(carFormat.registrationPlate) data.push({ name: "Registration Plate", type: "Text", data: carFormat.registrationPlate });
            if(carFormat.vehicleMake) data.push({ name: "Vehicle Make", type: "Text", data: carFormat.vehicleMake });
            if(carFormat.taxStatus) data.push({ name: "Tax Status", type: "Text", data: carFormat.taxStatus });
            if(carFormat.taxDue) data.push({ name: "Tax Due", type: "Date", data: carFormat.taxDue });
            if(carFormat.motStatus) data.push({ name: "MOT Status", type: "Text", data: carFormat.motStatus });
            if(carFormat.motDue) data.push({ name: "MOT Due", type: "Date", data: carFormat.motDue });
            if(carFormat.firstRegistration) data.push({ name: "First Registration", type: "Date", data: carFormat.firstRegistration });
            if(carFormat.yearofManufacture) data.push({ name: "Year of Manufacture", type: "Date", data: carFormat.yearofManufacture });
            if(carFormat.cylinderCapacity) data.push({ name: "Cylinder Capacity", type: "Text", data: carFormat.cylinderCapacity });
            if(carFormat.co2Emissions) data.push({ name: "CO2 Emmisions", type: "Text", data: carFormat.co2Emissions });
            if(carFormat.fuelType) data.push({ name: "Fuel Type", type: "Text", data: carFormat.fuelType });
            if(carFormat.euroStatus) data.push({ name: "Euro Status", type: "Text", data: carFormat.euroStatus });
            if(carFormat.realDrivingEmissions) data.push({ name: "Real Driving Emissions", type: "Text", data: carFormat.realDrivingEmissions });
            if(carFormat.exportMarker) data.push({ name: "Export marker", type: "Text", data: carFormat.exportMarker });
            if(carFormat.vehicleStatus) data.push({ name: "Vehicle Status", type: "Text", data: carFormat.vehicleStatus });
            if(carFormat.vehicleColour) data.push({ name: "Vehicle Colour", type: "Text", data: carFormat.vehicleColour });
            if(carFormat.vehicleTypeApproval) data.push({ name: "Vehicle Type Approval", type: "Text", data: carFormat.vehicleTypeApproval });
            if(carFormat.wheelplan) data.push({ name: "Wheelplan", type: "Text", data: carFormat.wheelplan });
            if(carFormat.revenueWeight) data.push({ name: "Revenue Weight", type: "Text", data: carFormat.revenueWeight });
            if(carFormat.lastV5C) data.push({ name: "Last V5C", type: "Date", data: carFormat.lastV5C });



            //  Build the ProcessResult object
            const result: any = {
                source: this.source,
                process: this.name,
                data: data
            }
            
            result.hash = MD5(result);
            result.query = this.query;

            //  Emit the result of this process
            this.socket.result(result as ProcessResult);

            this.setStatus("COMPLETED", `Got ${data} data.`);

            return this.success(`Successfully scraped vehicle details`, carFormat);
        } catch(err) {

            console.log(err);
            this.setStatus("ERROR");
            return this.error(`Could not scrape vehicle details`, err);
        }
    }



}