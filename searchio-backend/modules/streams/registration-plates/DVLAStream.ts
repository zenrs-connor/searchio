import { SearchioResponse } from "../../../models/SearchioResponse";
import { error, success } from "../../ResponseHandler";
import { ScraperStream } from "../ScraperStream";

export class DVLAStream extends ScraperStream {
    constructor(query: string) {
        super(query);
        this.tags.push("dvla");
        console.log(this.tags);
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
            console.log(err);
            return error(`(DVLAStream) Error entering vehicle details`, err);
        }
    }

    public async scrapeVehicleDetails(reg: string): Promise<SearchioResponse> {
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

            let vehicleMake = await this.driver.findElement(this.webdriver.By.xpath('//div[@id="make"]/dd')).getText();
            carFormat.vehicleMake = vehicleMake;

            
            let taxStatus = await this.driver.findElement(this.webdriver.By.xpath('//main[@class="govuk-main-wrapper"]/div[2]/div/div/h2')).getText();
            if(taxStatus == "✓ Taxed") {
                carFormat.taxStatus = "Taxed";
            } else if (taxStatus == "✗ Untaxed") {
                carFormat.taxStatus = "Untaxed";
            } else {
                carFormat.taxStatus = "Unknown";
            }

            let taxDue = await this.driver.findElement(this.webdriver.By.xpath('//main[@class="govuk-main-wrapper"]/div[2]/div/div/div/strong[2]')).getText();
            carFormat.taxDue = new Date(taxDue);

            let motStatus = await this.driver.findElement(this.webdriver.By.xpath('//main[@class="govuk-main-wrapper"]/div[2]/div[2]/div/h2')).getText();
            if(motStatus == "✓ MOT") {
                carFormat.motStatus = "Valid MOT";
            } else if (motStatus == "✗ MOT") {
                carFormat.motStatus = "Invalid MOT";
            } else {
                carFormat.motStatus = "Unknown";
            }

            let motDue = await this.driver.findElement(this.webdriver.By.xpath('//main[@class="govuk-main-wrapper"]/div[2]/div[2]/div/div/strong[2]')).getText();
            carFormat.motDue = new Date(motDue);

            let firstRegistration = await this.driver.findElement(this.webdriver.By.xpath('//div[@id="date_of_first_registration"]/dd')).getText();
            carFormat.firstRegistration = new Date(firstRegistration);

            let yearOfManufacture = await this.driver.findElement(this.webdriver.By.xpath('//div[@id="year_of_manufacture"]/dd')).getText();
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
            carFormat.lastV5C = new Date(lastV5C);

            // DATES NEED TO BE CHANGED WRT TIMEZONES

            console.log(carFormat)

            return success(`(DVLAStream) Successfully scraped vehicle details`, carFormat);
        } catch(err) {
            console.log(err);
            return error(`(DVLAStream) Error scraping vehicle details`, err);
        }
    }
}