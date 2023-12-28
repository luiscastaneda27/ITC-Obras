@isTest
public with sharing class CurrentLocationController_Test {
   

    @isTest
    static void test_meth01() {


        

        compania__c cmp = new compania__c(
            Name = 'EC',
            telefono__c = '123',
            codigoCompania__c = '00008'
        );
        insert cmp;
        tipoUDC__c typeUdc = new tipoUDC__c(
            Name = 'Name',
            codigoUDC__c = '01/11',
            ambitoUDC__c = 'Clientes',
            compania__c = cmp.id,
            corporativa__c = false,
            CurrencyIsoCode = 'USD'
        );
        insert typeUdc;

        udcDetallada__c regComercial = new udcDetallada__c(
            //CompanyCode__c = '00008',
            tipoUDC__c = typeUdc.id,
            codigoUDC__c = '01/11',
            codigoItemUDC__c = 'ZA',
            Name = 'ZONA ATLANTICA'
        );
        insert regComercial;

        //Id rtID = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Business').getRecordTypeId();

        tipoUDC__c tIdFiscal = new tipoUDC__c(
            Name = 'Tipo de identificación fiscal',
            codigoUDC__c = 'H00/TA',
            ambitoUDC__c = 'Clientes',
            compania__c = cmp.id,
            corporativa__c = false,
            CurrencyIsoCode = 'USD'
        );
        insert tIdFiscal;
        udcDetallada__c idFiscal = new udcDetallada__c(
            tipoUDC__c = tIdFiscal.id,
            codigoUDC__c = 'H00/TA',
            codigoItemUDC__c = 'J',
            Name = 'J-Jurídica'

        );
        insert idFiscal;

        Account accData = new Account(
            FirstName = 'Jorge', 
            LastName = 'ramos',
            PersonMobilePhone = '123123123',
            //numeroIdentificacionFiscal__c= '0992379847000',
            tipoIdentificacionFiscal__c = idFiscal.id,
            companias__c = cmp.id,
            //RecordTypeId = rtID,
            direccionGeorreferenciada__Latitude__s = -2.1594112,
            direccionGeorreferenciada__Longitude__s = -79.9309824
        );
        insert accData;

        accData.FirstName = 'Juan';
        //accData.direccionGeorreferenciada__c = '{ "latitude": -2.6594112, "longitude": -79.6309824 }';
        System.debug('AccDATA_S: ');
        System.debug('AccDATA: '+accData);
        System.debug('AccDATA_E: ');

        
        Lead ldData = new Lead(
            FirstName = 'Juan', 
            LastName = 'ramos',
            compania__c = cmp.id, 
            Email = 'test@gmail.com', 
            correoBienvenida__c = 'test@gmail.com', 
            numeroIdentificacionFiscal__c= '3108221717000',
            Status = 'En proceso', 
            //RecordTypeId = rtID,
            direccionGeorreferenciada__Latitude__s = -2.53942342,
            direccionGeorreferenciada__Longitude__s = -79.9423824,
            //razonSocialJuridico__c = 'RazonPrueba',
            regionComercial__c = regComercial.id,
            MobilePhone = '123123123',
            LeadSource = 'WEB',
            Salutation = 'Mrs.'
        );
        insert ldData;

        ldData.MobilePhone = '123456';
        //accData.direccionGeorreferenciada__c = '{ "latitude": -2.6594112, "longitude": -79.6309824 }';
        System.debug('LdDATA_S: ');
        System.debug('LdDATA: '+ldData);
        System.debug('LdDATA_E: ');

        SObject nullObj;
        String body = '{"results":[{"address_components":[{"long_name":"Hugo Chavez","short_name":"Hugo Chavez","types":["establishment","point_of_interest","transit_station"]},{"long_name":"Managua","short_name":"Managua","types":["locality","political"]},{"long_name":"Managua","short_name":"Managua","types":["administrative_area_level_2","political"]},{"long_name":"Managua","short_name":"MN","types":["administrative_area_level_1","political"]},{"long_name":"Nicaragua","short_name":"NI","types":["country","political"]}],"formatted_address":"Hugo Chavez, Managua, Nicaragua","geometry":{"location":{"lat":12.1485341,"lng":-86.20307029999999},"location_type":"GEOMETRIC_CENTER","viewport":{"northeast":{"lat":12.1498585802915,"lng":-86.20172351970849},"southwest":{"lat":12.1471606197085,"lng":-86.20442148029151}}},"partial_match":true,"place_id":"ChIJw3eW1ST8c48R749rcfOD1F8","plus_code":{"compound_code":"4QXW+CQ Managua, Nicaragua","global_code":"764M4QXW+CQ"},"types":["establishment","point_of_interest","transit_station"]}],"status":"OK"}'; 
        HttpMockFactory mock = new HttpMockFactory(200, 'OK', body, new Map<String,String>());
        Test.setMock(HttpCalloutMock.class, mock);

        Test.startTest();
        String resultAcc1 =CurrentLocationController.updateRecord(accData,false);
        String resultAcc2 =CurrentLocationController.updateRecord(accData,true);
        String resultld1 =CurrentLocationController.updateRecord(ldData,false);
        String resultld2 =CurrentLocationController.updateRecord(ldData,true);
        String resultObj = CurrentLocationController.updateRecord( nullObj, false);

        Test.stopTest();
        // // Verify the results
        System.assertEquals( resultAcc1 ,accData.Id );
        System.assertEquals(resultld1, ldData.Id);
    }
}