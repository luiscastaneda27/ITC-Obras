import toUpdateRecord from '@salesforce/apex/CurrentLocationController.updateRecord';
import { CloseActionScreenEvent } from 'lightning/actions';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord } from 'lightning/uiRecordApi';
import { LightningElement, api, track, wire } from 'lwc';

import { NavigationMixin } from 'lightning/navigation';
const LATITUDE_LEA_FIELD = 'Lead.CurrentLocation__Latitude__s';
const LONGITUDE_LEA_FIELD = 'Lead.CurrentLocation__Longitude__s';



//Fields to both, Account and Lead
const RECORD_FIELDS = [LATITUDE_LEA_FIELD, LONGITUDE_LEA_FIELD];




export default class CurrentLocationLWC extends NavigationMixin(LightningElement) {
    showButon = false;
    @api
    latitude;
    @api
    longitude;
    myLocation;
    account;
    lead;
    @api
    showSaveButon = false;
    isLoading = false;

    @track
    lstMarkers = [];
    zoomlevel = "1";

    @track isfirstTab = false;
    sobjectType;

    @api
    recordid;

    @track address;
    @track address2;
    @track strStreet;
    @track strCity;
    @track strState;
    @track strCountry;
    @track strPostalCode;
    @track strCountryCodes;


    @wire(getRecord, { recordid: '$recordid', fields: RECORD_FIELDS })
    wiredRecord({ error, data }) {
        if (data) {

            if (data.apiName === 'Lead') {
                this.lead = data;
                this.sobjectType = 'Lead';
            } else if (data.apiName === 'Account') {
                this.account = data;
                this.sobjectType = 'Account';
            }

            try {

                this.latitude = this.lead.fields.CurrentLocation__Latitude__s.value;
                this.longitude = this.lead.fields.CurrentLocation__Longitude__s.value;
                this.setLocation(this.latitude, this.longitude);
            } catch (error) {
                console.log(error)

            }
        } else if (error) {
            this.lead = undefined;
            this.account = undefined;
        }
    }


    setLocation(latitude, longitude) {

        // Add Latitude and Longitude to the markers list.
        this.lstMarkers = [{
            location: {
                Latitude: latitude,
                Longitude: longitude,

                City: (this.city === undefined) ? '' : this.city,
                Country: (this.country === undefined) ? '' : this.country,
                PostalCode: (this.postalCode === undefined) ? '' : this.postalCode,
                Street: (this.street === undefined) ? '' : this.street

            },
            // title: 'You are here'
        }];
        this.zoomlevel = "13";
        console.log("this.lstMarkers: " + JSON.stringify(this.lstMarkers));

    }

    async handleClick(event) {
        console.log('Direccion: ' + this.address);

        this.isLoading = true;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {

                // Get the Latitude and Longitude from Geolocation API
                this.latitude = position.coords.latitude;
                this.longitude = position.coords.longitude;


                this.setLocation(position.coords.latitude, position.coords.longitude);
                this.isLoading = false;
                this.showSaveButon = false;
                // console.log('Direccion: ' + this.address);
            });
        }
        console.log('Direccion: ' + this.address);

    }

    

    async handlefirstTabButtonClick(event) {
        this.isLoading = true;
        this.isfirstTab = true;
        
        /*if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {

                // Get the Latitude and Longitude from Geolocation API
                this.latitude = position.coords.latitude;
                this.longitude = position.coords.longitude;


                this.setLocation(position.coords.latitude, position.coords.longitude);
                this.isLoading = false;
                // console.log('Direccion: ' + this.address);
                this.toUpdateRecord();
            });
        }*/

        //this.setLocation(undefined, undefined);
        this.toUpdateRecord();

    }

    handleSecondTabButtonClick() {
        this.isLoading = true;
        this.isfirstTab = false;

        console.log("isfirstTab: " + this.isfirstTab);
        this.toUpdateRecord();
    }
    addressInputChange(event) {
        this.address2 = event.detail.value;
        console.log("field a fake??: " + this.address);
        this.address2 = event.target.value;
        console.log("field a fake??: " + this.address);

        const fields = event.target;
        this.street = fields.street;
        this.city = fields.city;
        this.province = fields.province;
        this.postalCode = fields.postalCode;
        this.country = fields.country;


        this.setLocation(undefined, undefined);
        console.log("addressInputChange?: ");
    }

    async toUpdateRecord() {
        // console.log("BF.strCountryCodes: " + this.strCountryCodes);
        await this.getCountryCode(this.country);
        // let record;

        // console.log("AF.strCountryCodes: " + this.strCountryCodes);


        const record = {
            sobjectType: this.sobjectType,
            Id: this.recordid,

            City: (this.city === undefined && this.isfirstTab == false) ? null : this.city,
            Country: (this.country === undefined && this.isfirstTab == false) ? null : this.country,
            PostalCode: (this.postalCode === undefined && this.isfirstTab == false) ? null : this.postalCode,
            Street: (this.street === undefined && this.isfirstTab == false) ? null : this.street,
            State: (this.strState === undefined && this.isfirstTab == false) ? null : this.strState,
            DireccionDetallada__c: ((this.street === undefined && this.isfirstTab == false) ? '' : this.street) +' '+ 
                                ((this.city === undefined && this.isfirstTab == false) ? '' : this.city) + ' '+
                                ((this.country === undefined && this.isfirstTab == false) ? '' : this.country),

            Direccion_2_0__Street__s: (this.street === undefined && this.isfirstTab == false) ? null : this.street,
            Direccion_2_0__City__s: (this.city === undefined && this.isfirstTab == false) ? null : this.city,
            Direccion_2_0__CountryCode__s: (this.strCountryCodes === undefined && this.isfirstTab == false) ? null : this.strCountryCodes,
            Direccion_2_0__StateCode__s: (this.strState === undefined && this.isfirstTab == false) ? null : this.strState,
            Direccion_2_0__PostalCode__s: (this.postalCode === undefined && this.isfirstTab == false) ? null : this.postalCode,
            Direccion_2_0__Latitude__s: parseFloat(this.latitude),
            Direccion_2_0__Longitude__s: parseFloat(this.longitude),

            CurrentLocation__Latitude__s: parseFloat(this.latitude),
            CurrentLocation__Longitude__s: parseFloat(this.longitude),

            direccionGeorreferenciada__Latitude__s: parseFloat(this.latitude),
            direccionGeorreferenciada__Longitude__s: parseFloat(this.longitude)


        };
        // console.log('1record: ' + JSON.stringify(record));


        toUpdateRecord({ record: record, isFirstTab: this.isfirstTab })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Ubicación actualizada',
                        variant: 'success'
                    })
                );
                // console.log('2record: ' + JSON.stringify(record));
                if (this.isfirstTab == true) {
                    this.isfirstTab = false;
                    toUpdateRecord({ record: record, isFirstTab: this.isfirstTab })
                        .then(() => {
                            this.isLoading = false;
                            this.dispatchEvent(
                                new ShowToastEvent({
                                    title: 'Success',
                                    message: 'Ubicación actualizada',
                                    variant: 'success'
                                })
                            );
                            this.navigateToViewLeadPage(this.recordid);

                            // Display fresh data in the form
                            // return refreshApex(this.contact);
                        })
                        .catch(error => {
                            this.isLoading = false;
                            this.dispatchEvent(
                                new ShowToastEvent({
                                    title: 'Error actualizando ubicación',
                                    message: error.body.message,
                                    variant: 'error'
                                })
                            );
                        });
                } else {
                    this.isLoading = false;
                    this.navigateToViewLeadPage(this.recordid);
                }
                // Display fresh data in the form
                // return refreshApex(this.contact);
            })
            .catch(error => {
                this.isLoading = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error actualizando ubicación',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
    }

    //Se separo en 2 handleChange para utilizar el event.target.value y corregir el undefine en el setLocation 13/06/2023
    handleChangeLatitude(event) {

        console.log('latitude value: ' + JSON.stringify(event.target.value));
        this.latitude = event.target.value;
        this.setLocation(this.latitude, this.longitude);

    }

    handleChangeLongitude(event) {

        console.log('longitude value: ' + JSON.stringify(event.target.value));
        this.longitude = event.target.value;
        this.setLocation(this.latitude, this.longitude);

    }

    handleClickBtn() {

        this.showButon = false;
    }

    handleClose() {

        this.showButon = true;
    }

    cancelar() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }


    // Navigate to View Lead Page
    navigateToViewLeadPage(leadId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: leadId,
                objectApiName: this.sobjectType,
                actionName: 'view'
            },
        });
    }

    handleMarkerSelect(event) {
        console.log({ event })
        console.log(JSON.stringify(event))
    }
    selectedMarkerValue(event) {
        console.log({ event })
        console.log(JSON.stringify(event))

    }

    getCountryCode(countryName) {
        // const countryCodes = this.countryCodesList;
        const countryCodes = [
            {
                "countryCode": "AD",
                "countryName": "Andorra"
            },
            {
                "countryCode": "AE",
                "countryName": "United Arab Emirates"
            },
            {
                "countryCode": "AF",
                "countryName": "Afghanistan"
            },
            {
                "countryCode": "AG",
                "countryName": "Antigua and Barbuda"
            },
            {
                "countryCode": "AI",
                "countryName": "Anguilla"
            },
            {
                "countryCode": "AL",
                "countryName": "Albania"
            },
            {
                "countryCode": "AM",
                "countryName": "Armenia"
            },
            {
                "countryCode": "AO",
                "countryName": "Angola"
            },
            {
                "countryCode": "AQ",
                "countryName": "Antarctica"
            },
            {
                "countryCode": "AR",
                "countryName": "Argentina"
            },
            {
                "countryCode": "AS",
                "countryName": "American Samoa"
            },
            {
                "countryCode": "AT",
                "countryName": "Austria"
            },
            {
                "countryCode": "AU",
                "countryName": "Australia"
            },
            {
                "countryCode": "AW",
                "countryName": "Aruba"
            },
            {
                "countryCode": "AX",
                "countryName": "Åland"
            },
            {
                "countryCode": "AZ",
                "countryName": "Azerbaijan"
            },
            {
                "countryCode": "BA",
                "countryName": "Bosnia and Herzegovina"
            },
            {
                "countryCode": "BB",
                "countryName": "Barbados"
            },
            {
                "countryCode": "BD",
                "countryName": "Bangladesh"
            },
            {
                "countryCode": "BE",
                "countryName": "Belgium"
            },
            {
                "countryCode": "BF",
                "countryName": "Burkina Faso"
            },
            {
                "countryCode": "BG",
                "countryName": "Bulgaria"
            },
            {
                "countryCode": "BH",
                "countryName": "Bahrain"
            },
            {
                "countryCode": "BI",
                "countryName": "Burundi"
            },
            {
                "countryCode": "BJ",
                "countryName": "Benin"
            },
            {
                "countryCode": "BL",
                "countryName": "Saint Barthélemy"
            },
            {
                "countryCode": "BM",
                "countryName": "Bermuda"
            },
            {
                "countryCode": "BN",
                "countryName": "Brunei"
            },
            {
                "countryCode": "BO",
                "countryName": "Bolivia"
            },
            {
                "countryCode": "BQ",
                "countryName": "Bonaire"
            },
            {
                "countryCode": "BR",
                "countryName": "Brazil"
            },
            {
                "countryCode": "BS",
                "countryName": "Bahamas"
            },
            {
                "countryCode": "BT",
                "countryName": "Bhutan"
            },
            {
                "countryCode": "BV",
                "countryName": "Bouvet Island"
            },
            {
                "countryCode": "BW",
                "countryName": "Botswana"
            },
            {
                "countryCode": "BY",
                "countryName": "Belarus"
            },
            {
                "countryCode": "BZ",
                "countryName": "Belize"
            },
            {
                "countryCode": "CA",
                "countryName": "Canada"
            },
            {
                "countryCode": "CC",
                "countryName": "Cocos [Keeling] Islands"
            },
            {
                "countryCode": "CD",
                "countryName": "Democratic Republic of the Congo"
            },
            {
                "countryCode": "CF",
                "countryName": "Central African Republic"
            },
            {
                "countryCode": "CG",
                "countryName": "Republic of the Congo"
            },
            {
                "countryCode": "CH",
                "countryName": "Switzerland"
            },
            {
                "countryCode": "CI",
                "countryName": "Ivory Coast"
            },
            {
                "countryCode": "CK",
                "countryName": "Cook Islands"
            },
            {
                "countryCode": "CL",
                "countryName": "Chile"
            },
            {
                "countryCode": "CM",
                "countryName": "Cameroon"
            },
            {
                "countryCode": "CN",
                "countryName": "China"
            },
            {
                "countryCode": "CO",
                "countryName": "Colombia"
            },
            {
                "countryCode": "CR",
                "countryName": "Costa Rica"
            },
            {
                "countryCode": "CU",
                "countryName": "Cuba"
            },
            {
                "countryCode": "CV",
                "countryName": "Cape Verde"
            },
            {
                "countryCode": "CW",
                "countryName": "Curacao"
            },
            {
                "countryCode": "CX",
                "countryName": "Christmas Island"
            },
            {
                "countryCode": "CY",
                "countryName": "Cyprus"
            },
            {
                "countryCode": "CZ",
                "countryName": "Czech Republic"
            },
            {
                "countryCode": "DE",
                "countryName": "Germany"
            },
            {
                "countryCode": "DJ",
                "countryName": "Djibouti"
            },
            {
                "countryCode": "DK",
                "countryName": "Denmark"
            },
            {
                "countryCode": "DM",
                "countryName": "Dominica"
            },
            {
                "countryCode": "DO",
                "countryName": "Dominican Republic"
            },
            {
                "countryCode": "DZ",
                "countryName": "Algeria"
            },
            {
                "countryCode": "EC",
                "countryName": "Ecuador"
            },
            {
                "countryCode": "EE",
                "countryName": "Estonia"
            },
            {
                "countryCode": "EG",
                "countryName": "Egypt"
            },
            {
                "countryCode": "EH",
                "countryName": "Western Sahara"
            },
            {
                "countryCode": "ER",
                "countryName": "Eritrea"
            },
            {
                "countryCode": "ES",
                "countryName": "Spain"
            },
            {
                "countryCode": "ET",
                "countryName": "Ethiopia"
            },
            {
                "countryCode": "FI",
                "countryName": "Finland"
            },
            {
                "countryCode": "FJ",
                "countryName": "Fiji"
            },
            {
                "countryCode": "FK",
                "countryName": "Falkland Islands"
            },
            {
                "countryCode": "FM",
                "countryName": "Micronesia"
            },
            {
                "countryCode": "FO",
                "countryName": "Faroe Islands"
            },
            {
                "countryCode": "FR",
                "countryName": "France"
            },
            {
                "countryCode": "GA",
                "countryName": "Gabon"
            },
            {
                "countryCode": "GB",
                "countryName": "United Kingdom"
            },
            {
                "countryCode": "GD",
                "countryName": "Grenada"
            },
            {
                "countryCode": "GE",
                "countryName": "Georgia"
            },
            {
                "countryCode": "GF",
                "countryName": "French Guiana"
            },
            {
                "countryCode": "GG",
                "countryName": "Guernsey"
            },
            {
                "countryCode": "GH",
                "countryName": "Ghana"
            },
            {
                "countryCode": "GI",
                "countryName": "Gibraltar"
            },
            {
                "countryCode": "GL",
                "countryName": "Greenland"
            },
            {
                "countryCode": "GM",
                "countryName": "Gambia"
            },
            {
                "countryCode": "GN",
                "countryName": "Guinea"
            },
            {
                "countryCode": "GP",
                "countryName": "Guadeloupe"
            },
            {
                "countryCode": "GQ",
                "countryName": "Equatorial Guinea"
            },
            {
                "countryCode": "GR",
                "countryName": "Greece"
            },
            {
                "countryCode": "GS",
                "countryName": "South Georgia and the South Sandwich Islands"
            },
            {
                "countryCode": "GT",
                "countryName": "Guatemala"
            },
            {
                "countryCode": "GU",
                "countryName": "Guam"
            },
            {
                "countryCode": "GW",
                "countryName": "Guinea-Bissau"
            },
            {
                "countryCode": "GY",
                "countryName": "Guyana"
            },
            {
                "countryCode": "HK",
                "countryName": "Hong Kong"
            },
            {
                "countryCode": "HM",
                "countryName": "Heard Island and McDonald Islands"
            },
            {
                "countryCode": "HN",
                "countryName": "Honduras"
            },
            {
                "countryCode": "HR",
                "countryName": "Croatia"
            },
            {
                "countryCode": "HT",
                "countryName": "Haiti"
            },
            {
                "countryCode": "HU",
                "countryName": "Hungary"
            },
            {
                "countryCode": "ID",
                "countryName": "Indonesia"
            },
            {
                "countryCode": "IE",
                "countryName": "Ireland"
            },
            {
                "countryCode": "IL",
                "countryName": "Israel"
            },
            {
                "countryCode": "IM",
                "countryName": "Isle of Man"
            },
            {
                "countryCode": "IN",
                "countryName": "India"
            },
            {
                "countryCode": "IO",
                "countryName": "British Indian Ocean Territory"
            },
            {
                "countryCode": "IQ",
                "countryName": "Iraq"
            },
            {
                "countryCode": "IR",
                "countryName": "Iran"
            },
            {
                "countryCode": "IS",
                "countryName": "Iceland"
            },
            {
                "countryCode": "IT",
                "countryName": "Italy"
            },
            {
                "countryCode": "JE",
                "countryName": "Jersey"
            },
            {
                "countryCode": "JM",
                "countryName": "Jamaica"
            },
            {
                "countryCode": "JO",
                "countryName": "Jordan"
            },
            {
                "countryCode": "JP",
                "countryName": "Japan"
            },
            {
                "countryCode": "KE",
                "countryName": "Kenya"
            },
            {
                "countryCode": "KG",
                "countryName": "Kyrgyzstan"
            },
            {
                "countryCode": "KH",
                "countryName": "Cambodia"
            },
            {
                "countryCode": "KI",
                "countryName": "Kiribati"
            },
            {
                "countryCode": "KM",
                "countryName": "Comoros"
            },
            {
                "countryCode": "KN",
                "countryName": "Saint Kitts and Nevis"
            },
            {
                "countryCode": "KP",
                "countryName": "North Korea"
            },
            {
                "countryCode": "KR",
                "countryName": "South Korea"
            },
            {
                "countryCode": "KW",
                "countryName": "Kuwait"
            },
            {
                "countryCode": "KY",
                "countryName": "Cayman Islands"
            },
            {
                "countryCode": "KZ",
                "countryName": "Kazakhstan"
            },
            {
                "countryCode": "LA",
                "countryName": "Laos"
            },
            {
                "countryCode": "LB",
                "countryName": "Lebanon"
            },
            {
                "countryCode": "LC",
                "countryName": "Saint Lucia"
            },
            {
                "countryCode": "LI",
                "countryName": "Liechtenstein"
            },
            {
                "countryCode": "LK",
                "countryName": "Sri Lanka"
            },
            {
                "countryCode": "LR",
                "countryName": "Liberia"
            },
            {
                "countryCode": "LS",
                "countryName": "Lesotho"
            },
            {
                "countryCode": "LT",
                "countryName": "Lithuania"
            },
            {
                "countryCode": "LU",
                "countryName": "Luxembourg"
            },
            {
                "countryCode": "LV",
                "countryName": "Latvia"
            },
            {
                "countryCode": "LY",
                "countryName": "Libya"
            },
            {
                "countryCode": "MA",
                "countryName": "Morocco"
            },
            {
                "countryCode": "MC",
                "countryName": "Monaco"
            },
            {
                "countryCode": "MD",
                "countryName": "Moldova"
            },
            {
                "countryCode": "ME",
                "countryName": "Montenegro"
            },
            {
                "countryCode": "MF",
                "countryName": "Saint Martin"
            },
            {
                "countryCode": "MG",
                "countryName": "Madagascar"
            },
            {
                "countryCode": "MH",
                "countryName": "Marshall Islands"
            },
            {
                "countryCode": "MK",
                "countryName": "Macedonia"
            },
            {
                "countryCode": "ML",
                "countryName": "Mali"
            },
            {
                "countryCode": "MM",
                "countryName": "Myanmar [Burma]"
            },
            {
                "countryCode": "MN",
                "countryName": "Mongolia"
            },
            {
                "countryCode": "MO",
                "countryName": "Macao"
            },
            {
                "countryCode": "MP",
                "countryName": "Northern Mariana Islands"
            },
            {
                "countryCode": "MQ",
                "countryName": "Martinique"
            },
            {
                "countryCode": "MR",
                "countryName": "Mauritania"
            },
            {
                "countryCode": "MS",
                "countryName": "Montserrat"
            },
            {
                "countryCode": "MT",
                "countryName": "Malta"
            },
            {
                "countryCode": "MU",
                "countryName": "Mauritius"
            },
            {
                "countryCode": "MV",
                "countryName": "Maldives"
            },
            {
                "countryCode": "MW",
                "countryName": "Malawi"
            },
            {
                "countryCode": "MX",
                "countryName": "Mexico"
            },
            {
                "countryCode": "MY",
                "countryName": "Malaysia"
            },
            {
                "countryCode": "MZ",
                "countryName": "Mozambique"
            },
            {
                "countryCode": "NA",
                "countryName": "Namibia"
            },
            {
                "countryCode": "NC",
                "countryName": "New Caledonia"
            },
            {
                "countryCode": "NE",
                "countryName": "Niger"
            },
            {
                "countryCode": "NF",
                "countryName": "Norfolk Island"
            },
            {
                "countryCode": "NG",
                "countryName": "Nigeria"
            },
            {
                "countryCode": "NI",
                "countryName": "Nicaragua"
            },
            {
                "countryCode": "NL",
                "countryName": "Netherlands"
            },
            {
                "countryCode": "NO",
                "countryName": "Norway"
            },
            {
                "countryCode": "NP",
                "countryName": "Nepal"
            },
            {
                "countryCode": "NR",
                "countryName": "Nauru"
            },
            {
                "countryCode": "NU",
                "countryName": "Niue"
            },
            {
                "countryCode": "NZ",
                "countryName": "New Zealand"
            },
            {
                "countryCode": "OM",
                "countryName": "Oman"
            },
            {
                "countryCode": "PA",
                "countryName": "Panama"
            },
            {
                "countryCode": "PE",
                "countryName": "Peru"
            },
            {
                "countryCode": "PF",
                "countryName": "French Polynesia"
            },
            {
                "countryCode": "PG",
                "countryName": "Papua New Guinea"
            },
            {
                "countryCode": "PH",
                "countryName": "Philippines"
            },
            {
                "countryCode": "PK",
                "countryName": "Pakistan"
            },
            {
                "countryCode": "PL",
                "countryName": "Poland"
            },
            {
                "countryCode": "PM",
                "countryName": "Saint Pierre and Miquelon"
            },
            {
                "countryCode": "PN",
                "countryName": "Pitcairn Islands"
            },
            {
                "countryCode": "PR",
                "countryName": "Puerto Rico"
            },
            {
                "countryCode": "PS",
                "countryName": "Palestine"
            },
            {
                "countryCode": "PT",
                "countryName": "Portugal"
            },
            {
                "countryCode": "PW",
                "countryName": "Palau"
            },
            {
                "countryCode": "PY",
                "countryName": "Paraguay"
            },
            {
                "countryCode": "QA",
                "countryName": "Qatar"
            },
            {
                "countryCode": "RE",
                "countryName": "Réunion"
            },
            {
                "countryCode": "RO",
                "countryName": "Romania"
            },
            {
                "countryCode": "RS",
                "countryName": "Serbia"
            },
            {
                "countryCode": "RU",
                "countryName": "Russia"
            },
            {
                "countryCode": "RW",
                "countryName": "Rwanda"
            },
            {
                "countryCode": "SA",
                "countryName": "Saudi Arabia"
            },
            {
                "countryCode": "SB",
                "countryName": "Solomon Islands"
            },
            {
                "countryCode": "SC",
                "countryName": "Seychelles"
            },
            {
                "countryCode": "SD",
                "countryName": "Sudan"
            },
            {
                "countryCode": "SE",
                "countryName": "Sweden"
            },
            {
                "countryCode": "SG",
                "countryName": "Singapore"
            },
            {
                "countryCode": "SH",
                "countryName": "Saint Helena"
            },
            {
                "countryCode": "SI",
                "countryName": "Slovenia"
            },
            {
                "countryCode": "SJ",
                "countryName": "Svalbard and Jan Mayen"
            },
            {
                "countryCode": "SK",
                "countryName": "Slovakia"
            },
            {
                "countryCode": "SL",
                "countryName": "Sierra Leone"
            },
            {
                "countryCode": "SM",
                "countryName": "San Marino"
            },
            {
                "countryCode": "SN",
                "countryName": "Senegal"
            },
            {
                "countryCode": "SO",
                "countryName": "Somalia"
            },
            {
                "countryCode": "SR",
                "countryName": "Suriname"
            },
            {
                "countryCode": "SS",
                "countryName": "South Sudan"
            },
            {
                "countryCode": "ST",
                "countryName": "São Tomé and Príncipe"
            },
            {
                "countryCode": "SV",
                "countryName": "El Salvador"
            },
            {
                "countryCode": "SX",
                "countryName": "Sint Maarten"
            },
            {
                "countryCode": "SY",
                "countryName": "Syria"
            },
            {
                "countryCode": "SZ",
                "countryName": "Swaziland"
            },
            {
                "countryCode": "TC",
                "countryName": "Turks and Caicos Islands"
            },
            {
                "countryCode": "TD",
                "countryName": "Chad"
            },
            {
                "countryCode": "TF",
                "countryName": "French Southern Territories"
            },
            {
                "countryCode": "TG",
                "countryName": "Togo"
            },
            {
                "countryCode": "TH",
                "countryName": "Thailand"
            },
            {
                "countryCode": "TJ",
                "countryName": "Tajikistan"
            },
            {
                "countryCode": "TK",
                "countryName": "Tokelau"
            },
            {
                "countryCode": "TL",
                "countryName": "East Timor"
            },
            {
                "countryCode": "TM",
                "countryName": "Turkmenistan"
            },
            {
                "countryCode": "TN",
                "countryName": "Tunisia"
            },
            {
                "countryCode": "TO",
                "countryName": "Tonga"
            },
            {
                "countryCode": "TR",
                "countryName": "Turkey"
            },
            {
                "countryCode": "TT",
                "countryName": "Trinidad and Tobago"
            },
            {
                "countryCode": "TV",
                "countryName": "Tuvalu"
            },
            {
                "countryCode": "TW",
                "countryName": "Taiwan"
            },
            {
                "countryCode": "TZ",
                "countryName": "Tanzania"
            },
            {
                "countryCode": "UA",
                "countryName": "Ukraine"
            },
            {
                "countryCode": "UG",
                "countryName": "Uganda"
            },
            {
                "countryCode": "UM",
                "countryName": "U.S. Minor Outlying Islands"
            },
            {
                "countryCode": "US",
                "countryName": "United States"
            },
            {
                "countryCode": "UY",
                "countryName": "Uruguay"
            },
            {
                "countryCode": "UZ",
                "countryName": "Uzbekistan"
            },
            {
                "countryCode": "VA",
                "countryName": "Vatican City"
            },
            {
                "countryCode": "VC",
                "countryName": "Saint Vincent and the Grenadines"
            },
            {
                "countryCode": "VE",
                "countryName": "Venezuela"
            },
            {
                "countryCode": "VG",
                "countryName": "British Virgin Islands"
            },
            {
                "countryCode": "VI",
                "countryName": "U.S. Virgin Islands"
            },
            {
                "countryCode": "VN",
                "countryName": "Vietnam"
            },
            {
                "countryCode": "VU",
                "countryName": "Vanuatu"
            },
            {
                "countryCode": "WF",
                "countryName": "Wallis and Futuna"
            },
            {
                "countryCode": "WS",
                "countryName": "Samoa"
            },
            {
                "countryCode": "XK",
                "countryName": "Kosovo"
            },
            {
                "countryCode": "YE",
                "countryName": "Yemen"
            },
            {
                "countryCode": "YT",
                "countryName": "Mayotte"
            },
            {
                "countryCode": "ZA",
                "countryName": "South Africa"
            },
            {
                "countryCode": "ZM",
                "countryName": "Zambia"
            },
            {
                "countryCode": "ZW",
                "countryName": "Zimbabwe"
            }
        ];
        
        // console.log('countryName_ ' + countryName);
        // console.log('countryName_ ' + countryName);
        // console.log('this.country ' + this.country);
        // console.log('countryCodes ' + countryCodes);
        try {
            if (countryName != undefined) {
                const filterText = (countryName).toLowerCase();
                if (filterText.legth != 0 || filterText != undefined || filterText != '') {
                    try {
                        const country = countryCodes.find(obj => obj.countryName === countryName);
                        this.strCountryCodes = country ? country.countryCode : null;
                        // console.log("this.strCountryCodes: " + this.strCountryCodes);
                    } catch (error) {
                        console.log("error onfilter: "+error.message)
                        console.log("error onfilter: "+JSON.stringify(error))
                    }
                    
                }
            }

        } catch (error) {
            console.log("error JSON: "+JSON.stringify(error))
            
        }

    }

}