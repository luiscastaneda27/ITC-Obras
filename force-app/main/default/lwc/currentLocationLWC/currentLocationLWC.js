import toUpdateRecord from '@salesforce/apex/CurrentLocationController.updateRecord';
import API_KEY from '@salesforce/label/c.GoogleMapsAPI';
import { CloseActionScreenEvent } from 'lightning/actions';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord } from 'lightning/uiRecordApi';
import { LightningElement, api, track, wire } from 'lwc';


import LAT_ACCOUNT_FIELD from "@salesforce/schema/Account.CurrentLocation__c";
import LNG_ACCOUNT_FIELD from "@salesforce/schema/Account.CurrentLocation__c";
import { NavigationMixin } from 'lightning/navigation';

const ACC_RECORD_FIELDS = [LAT_ACCOUNT_FIELD, LNG_ACCOUNT_FIELD];

export default class CurrentLocationLWC extends NavigationMixin(LightningElement) {

    @api recordid;
    @api recordId;
    @api objectApiName;
    @track relativeRecID 
    
  
    showButon = false;
    @api latitude;
    @api longitude;
    myLocation;
    account;
    lead;
    @api showSaveButon = false;
    isLoading = false;

    @track lstMarkers = [];
    zoomlevel = "1";

    @track isfirstTab = false;
    sobjectType;


    @track address;
    @track address2;
    @track strStreet;
    @track strCity;
    @track strState;
    @track strCountry;
    @track strPostalCode;
    @track strCountryCodes;
    @track recordData;

    @track timeoutActive = false;
    @track isfirstStart = true;
    
    connectedCallback() {
        this.relativeRecID = this.recordid!= null ?this.recordid: this.recordId;
        console.log(`relativeRecID: ${this.relativeRecID}`);

        // Obtener el nombre del objeto basado en el Id del registro
        // this.objectApiName = this.recordid.split(/-/)[0]; // Extrayendo el objeto del Id del registro

    }

    @wire(getRecord, { recordId: "$relativeRecID", layoutTypes: ["Full"], modes: ["View"] })
    objData({ error, data }) {
        if (error) {
          let message = "Unknown error";
          if (Array.isArray(error.body)) {
            message = error.body.map((e) => e.message).join(", ");
          } else if (typeof error.body.message === "string") {
            message = error.body.message;
          }
          this.dispatchEvent(
            new ShowToastEvent({
              title: "Error loading",
              message,
              variant: "error",
            }),
          );
        } else if (data) {
          this.recordData = data;
          this.objectApiName = data.apiName
        //   console.log(`APINAME:${JSON.stringify(this.recordData)}`);
          console.log(`APINAME:${this.objectApiName}`);
        }
      }

    @wire(getRecord , { recordId: "$relativeRecID", fields: ACC_RECORD_FIELDS })
    wiredRecord({ error, data }) {
        if (data) {
            console.log(`APINAME:${JSON.stringify(data)}`);
            if (data.apiName === 'Lead') {
                this.lead = data;
                this.sobjectType = 'Lead';
            } else if (data.apiName === 'Account') {
                this.account = data;
                this.sobjectType = 'Account';

            }else {
                this.sobjectType = data.apiName;
                console.log(`this.sobjectType:${this.sobjectType}`);
            }

            try {
                this.dataObj = data;
                this.latitude = data.fields.CurrentLocation__Latitude__s;
                this.longitude = data.fields.CurrentLocation__Longitude__s  ;
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

        }];
        this.zoomlevel = "10";
        // console.log(`this.lstMarkers: ${JSON.stringify(this.lstMarkers)}`);
        // console.log(`COORDS: ${latitude} ${longitude}`);
        // console.log(`this.dataObj: ${this.dataObj}`);
        // console.log(`this.objectApiName: ${this.objectApiName}`);

    }

    async handleClick(event) {
        console.log(`Direccion: ${this.address}`);

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
        console.log(`Direccion: ${this.address}`);

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

        console.log(`isfirstTab: ${this.isfirstTab}`);
        this.toUpdateRecord();
    }
    addressInputChange(event) {
        // console.log(`Value: field a fake??: ${event.detail.value}`);
        // console.log(`Detail: field a fake??: ${JSON.stringify(event.detail)}`);
        this.address2 = event.detail.value;
        // console.log(`field a fake??: ${this.address}`);
        this.address2 = event.target.value;
        // console.log(`field a fake??: ${this.address}`);

        const fields = event.target;
        
        // console.log(`fields: field a fake??: ${JSON.stringify(fields)}`);
        // console.log(`fields.street: field a fake??: ${fields.street}`);
        // console.log(`fields.city: field a fake??: ${fields.city}`);
        // console.log(`fields.province: field a fake??: ${fields.province}`);
        // console.log(`fields.postalCode: field a fake??: ${fields.postalCode}`);
        // console.log(`fields.country: field a fake??: ${fields.country}`);

        
        this.street = fields.street;
        this.city = fields.city;
        this.province = fields.province;
        this.postalCode = fields.postalCode;
        this.country = fields.country;
        
        let dir = `${fields.street}+${fields.city}+${fields.postalCode}+${fields.province}+${fields.country}`;
        dir = dir.replace(/ /g, '+');
        dir = dir.replace(/\bnull\b/g, '');
        dir = dir.replace(/^\++|\++$/g, '');
        dir = dir.replace(/\++/g, '+');
        
        this.address  =  dir;
            
            try {

                if(this.isfirstStart){
                    this.isfirstStart = false;
                    this.timeoutActive = true;
                    this.fetchMapData();
                }
                else if (!this.timeoutActive) {
                    this.timeoutActive = true;
                    this.timeout = setTimeout(() => {
                        this.fetchMapData();
                        // console.log('Se ejecuta después de 2 segundos de inactividad o al terminar de escribir.');
                    }, 2000);
                }

                // console.log("addressInputChange UPDATED: ");
            } catch (error) {
                
                // console.log("addressInputChange NO_UPDATED?: ");
                throw new Error(`VALIDATION: ${Json.stringify(error)}` );
            }

        // }
        
        // this.dirIterator = (i > 2) ? 0 : (i + 1);

        // // this.setLocation(undefined, undefined);
        // console.log("addressInputChange?: ");
    }

    async toUpdateRecord() {
        // console.log("BF.strCountryCodes: " + this.strCountryCodes);
        await this.getCountryCode(this.country);
        // let record;

        // console.log("AF.strCountryCodes: " + this.strCountryCodes);

        // console.log(`this.sobjectType: ${this.sobjectType}`);
        // console.log(`this.dataObj: ${this.dataObj}`);
        
        let record = {
            sobjectType: this.sobjectType,
            Id: this.relativeRecID,

            City: (this.city === undefined && this.isfirstTab == false) ? null : this.city,
            Country: (this.country === undefined && this.isfirstTab == false) ? null : this.country,
            PostalCode: (this.postalCode === undefined && this.isfirstTab == false) ? null : this.postalCode,
            Street: (this.street === undefined && this.isfirstTab == false) ? null : this.street,
            State: (this.strState === undefined && this.isfirstTab == false) ? null : this.strState,
            direccionDetallada__c: ((this.street === undefined && this.isfirstTab == false) ? '' : this.street) +' '+ 
                                ((this.postalCode === undefined && this.isfirstTab == false) ? '' : this.postalCode) +' '+
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
        // console.log(`1record: ${JSON.stringify(record)}`);


        toUpdateRecord({ record: record, isFirstTab: this.isfirstTab })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Ubicación actualizada',
                        variant: 'success'
                    })
                );
                    this.isLoading = false;
                    this.navigateToViewLeadPage(this.relativeRecID);
            
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

        // console.log(`latitude value: ${JSON.stringify(event.target.value)}`);
        this.latitude = event.target.value;
        this.setLocation(this.latitude, this.longitude);

    }

    handleChangeLongitude(event) {

        // console.log(`longitude value: ${JSON.stringify(event.target.value)}`);
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
    navigateToViewLeadPage(recId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recId,
                objectApiName: this.sobjectType,
                actionName: 'view'
            },
        });
    }

    handleMarkerSelect(event) {
        console.log({ event })
        // console.log(`handleMarkerSelect: ${JSON.stringify(event)}`)
    }
    selectedMarkerValue(event) {
        console.log({ event })
        // console.log(`selectedMarkerValue: ${JSON.stringify(event)}`)

    }
    getCountryCode(countryName) {
    
    // biome-ignore lint/complexity/useLiteralKeys: <explanation>
    const countryCodes = {"Andorra": "AD",
        "United Arab Emirates": "AE",
        "Afghanistan": "AF",
        "Antigua and Barbuda": "AG",
        "Anguilla": "AI",
        "Albania": "AL",
        "Armenia": "AM",
        "Angola": "AO",
        "Antarctica": "AQ",
        "Argentina": "AR",
        "American Samoa": "AS",
        "Austria": "AT",
        "Australia": "AU",
        "Aruba": "AW",
        "Åland": "AX",
        "Azerbaijan": "AZ",
        "Bosnia and Herzegovina": "BA",
        "Barbados": "BB",
        "Bangladesh": "BD",
        "Belgium": "BE",
        "Burkina Faso": "BF",
        "Bulgaria": "BG",
        "Bahrain": "BH",
        "Burundi": "BI",
        "Benin": "BJ",
        "Saint Barthélemy": "BL",
        "Bermuda": "BM",
        "Brunei": "BN",
        "Bolivia": "BO",
        "Bonaire": "BQ",
        "Brazil": "BR",
        "Bahamas": "BS",
        "Bhutan": "BT",
        "Bouvet Island": "BV",
        "Botswana": "BW",
        "Belarus": "BY",
        "Belize": "BZ",
        "Canada": "CA",
        "Cocos [Keeling] Islands": "CC",
        "Democratic Republic of the Congo": "CD",
        "Central African Republic": "CF",
        "Republic of the Congo": "CG",
        "Switzerland": "CH",
        "Ivory Coast": "CI",
        "Cook Islands": "CK",
        "Chile": "CL",
        "Cameroon": "CM",
        "China": "CN",
        "Colombia": "CO",
        "Costa Rica": "CR",
        "Cuba": "CU",
        "Cape Verde": "CV",
        "Curacao": "CW",
        "Christmas Island": "CX",
        "Cyprus": "CY",
        "Czech Republic": "CZ",
        "Germany": "DE",
        "Djibouti": "DJ",
        "Denmark": "DK",
        "Dominica": "DM",
        "Dominican Republic": "DO",
        "Algeria": "DZ",
        "Ecuador": "EC",
        "Estonia": "EE",
        "Egypt": "EG",
        "Western Sahara": "EH",
        "Eritrea": "ER",
        "Spain": "ES",
        "Ethiopia": "ET",
        "Finland": "FI",
        "Fiji": "FJ",
        "Falkland Islands": "FK",
        "Micronesia": "FM",
        "Faroe Islands": "FO",
        "France": "FR",
        "Gabon": "GA",
        "United Kingdom": "GB",
        "Grenada": "GD",
        "Georgia": "GE",
        "French Guiana": "GF",
        "Guernsey": "GG",
        "Ghana": "GH",
        "Gibraltar": "GI",
        "Greenland": "GL",
        "Gambia": "GM",
        "Guinea": "GN",
        "Guadeloupe": "GP",
        "Equatorial Guinea": "GQ",
        "Greece": "GR",
        "South Georgia and the South Sandwich Islands": "GS",
        "Guatemala": "GT",
        "Guam": "GU",
        "Guinea-Bissau": "GW",
        "Guyana": "GY",
        "Hong Kong": "HK",
        "Heard Island and McDonald Islands": "HM",
        "Honduras": "HN",
        "Croatia": "HR",
        "Haiti": "HT",
        "Hungary": "HU",
        "Indonesia": "ID",
        "Ireland": "IE",
        "Israel": "IL",
        "Isle of Man": "IM",
        "India": "IN",
        "British Indian Ocean Territory": "IO",
        "Iraq": "IQ",
        "Iran": "IR",
        "Iceland": "IS",
        "Italy": "IT",
        "Jersey": "JE",
        "Jamaica": "JM",
        "Jordan": "JO",
        "Japan": "JP",
        "Kenya": "KE",
        "Kyrgyzstan": "KG",
        "Cambodia": "KH",
        "Kiribati": "KI",
        "Comoros": "KM",
        "Saint Kitts and Nevis": "KN",
        "North Korea": "KP",
        "South Korea": "KR",
        "Kuwait": "KW",
        "Cayman Islands": "KY",
        "Kazakhstan": "KZ",
        "Laos": "LA",
        "Lebanon": "LB",
        "Saint Lucia": "LC",
        "Liechtenstein": "LI",
        "Sri Lanka": "LK",
        "Liberia": "LR",
        "Lesotho": "LS",
        "Lithuania": "LT",
        "Luxembourg": "LU",
        "Latvia": "LV",
        "Libya": "LY",
        "Morocco": "MA",
        "Monaco": "MC",
        "Moldova": "MD",
        "Montenegro": "ME",
        "Saint Martin": "MF",
        "Madagascar": "MG",
        "Marshall Islands": "MH",
        "Macedonia": "MK",
        "Mali": "ML",
        "Myanmar [Burma]": "MM",
        "Mongolia": "MN",
        "Macao": "MO",
        "Northern Mariana Islands": "MP",
        "Martinique": "MQ",
        "Mauritania": "MR",
        "Montserrat": "MS",
        "Malta": "MT",
        "Mauritius": "MU",
        "Maldives": "MV",
        "Malawi": "MW",
        "Mexico": "MX",
        "Malaysia": "MY",
        "Mozambique": "MZ",
        "Namibia": "NA",
        "New Caledonia": "NC",
        "Niger": "NE",
        "Norfolk Island": "NF",
        "Nigeria": "NG",
        "Nicaragua": "NI",
        "Netherlands": "NL",
        "Norway": "NO",
        "Nepal": "NP",
        "Nauru": "NR",
        "Niue": "NU",
        "New Zealand": "NZ",
        "Oman": "OM",
        "Panama": "PA",
        "Peru": "PE",
        "French Polynesia": "PF",
        "Papua New Guinea": "PG",
        "Philippines": "PH",
        "Pakistan": "PK",
        "Poland": "PL",
        "Saint Pierre and Miquelon": "PM",
        "Pitcairn Islands": "PN",
        "Puerto Rico": "PR",
        "Palestine": "PS",
        "Portugal": "PT",
        "Palau": "PW",
        "Paraguay": "PY",
        "Qatar": "QA",
        "Réunion": "RE",
        "Romania": "RO",
        "Serbia": "RS",
        "Russia": "RU",
        "Rwanda": "RW",
        "Saudi Arabia": "SA",
        "Solomon Islands": "SB",
        "Seychelles": "SC",
        "Sudan": "SD",
        "Sweden": "SE",
        "Singapore": "SG",
        "Saint Helena": "SH",
        "Slovenia": "SI",
        "Svalbard and Jan Mayen": "SJ",
        "Slovakia": "SK",
        "Sierra Leone": "SL",
        "San Marino": "SM",
        "Senegal": "SN",
        "Somalia": "SO",
        "Suriname": "SR",
        "South Sudan": "SS",
        "São Tomé and Príncipe": "ST",
        "El Salvador": "SV",
        "Sint Maarten": "SX",
        "Syria": "SY",
        "Swaziland": "SZ",
        "Turks and Caicos Islands": "TC",
        "Chad": "TD",
        "French Southern Territories": "TF",
        "Togo": "TG",
        "Thailand": "TH",
        "Tajikistan": "TJ",
        "Tokelau": "TK",
        "Timor-Leste": "TL",
        "Turkmenistan": "TM",
        "Tunisia": "TN",
        "Tonga": "TO",
        "Turkey": "TR",
        "Trinidad and Tobago": "TT",
        "Tuvalu": "TV",
        "Taiwan": "TW",
        "Tanzania": "TZ",
        "Ukraine": "UA",
        "Uganda": "UG",
        "U.S. Minor Outlying Islands": "UM",
        "United States": "US",
        "Uruguay": "UY",
        "Uzbekistan": "UZ",
        "Vatican City": "VA",
        "Saint Vincent and the Grenadines": "VC",
        "Venezuela": "VE",
        "British Virgin Islands": "VG",
        "U.S. Virgin Islands": "VI",
        "Vietnam": "VN",
        "Vanuatu": "VU",
        "Wallis and Futuna": "WF",
        "Samoa": "WS",
        "Kosovo": "XK",
        "Yemen": "YE",
        "Mayotte": "YT",
        "South Africa": "ZA",
        "Zambia": "ZM",
        "Zimbabwe": "ZW"
    };
    
        // console.log(`countryName1: ${countryName}` );
        // console.log(`countryCode1: ${countryCodes[countryName]}` );
        this.strCountryCodes = countryCodes[(countryName)];
        
    }

    fetchMapData() {
        let addString = this.address;

        if(addString.length > 3 & addString!= null || addString != undefined ){
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${addString}&key=${API_KEY}`;

            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    // Maneja la respuesta de la API de Google Maps
                    this.mapData = data;
                    // console.log('Datos del mapa:', this.mapData);
                    // console.log('Datos del mapa:', JSON.stringify(this.mapData));
                    // console.log('this.sobjectType,:', this.sobjectType,);
                    this.latitude = data.results[0].geometry.location.lat;
                    this.longitude = data.results[0].geometry.location.lng;
                    // console.log('Datos del mapalatitude:', this.latitude);
                    // console.log('Datos del mapalongitude:', this.longitude);
                    this.setLocation(this.latitude, this.longitude);
                    this.timeoutActive = false;
                })
                .catch(error => {
                    // Maneja errores si los hay
                    console.error('Hubo un problema con la solicitud fetch:', error.message);
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error actualizando ubicación',
                            message: error.message,
                            variant: 'error'
                        })
                    );
                    this.timeoutActive = false;
            });
        }
    }

}