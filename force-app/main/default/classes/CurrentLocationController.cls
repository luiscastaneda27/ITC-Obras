/**
 * @description       : 
 * @author            : Diego Jacanamijoy -> diegojacanamijoy@gmail.com
 * @group             : 
 * @last modified on  : 19/04/2023
 * @last modified by  : Jeffry Mejia -> jeffry.mejia@intellectsystem.net
**/
public with sharing class CurrentLocationController {

    /**
    * @description 
    * @author Diego Jacanamijoy -> diegojacanamijoy@gmail.com | 19/04/2023 
    * @param contact 
    * @return string 
    **/
    @AuraEnabled
    public static string updateRecord(SObject record , Boolean isFirstTab){
                
            try {
                System.debug('  '+record);
                System.debug('RECORD: '+JSON.serialize(record));
                if(isFirstTab == true){
                    
                    String sObjName = ((Id)record.get('Id')).getSObjectType().getDescribe().getName();
                    String addStr;
                    // String addStr = sObjName == 'Account'? 
                    //     (record.get('BillingCity')!=null?record.get('BillingCity'): '') + '+' + 
                    //     (record.get('BillingPostalCode')!=null?record.get('BillingPostalCode'): '') + '+' + 
                    //     (record.get('BillingStreet')!=null?record.get('BillingStreet'): '')+ '+' + 
                    //     (record.get('BillingState')!=null?record.get('BillingState'): '')

                    //     :(record.get('City')!=null?record.get('City'): '') + '+' + (record.get('PostalCode')!=null?record.get('PostalCode'): '') + '+' + (record.get('Street')!=null?record.get('Street'): '')+ '+' + (record.get('State')!=null?record.get('State'): '');
                        if(sObjName == 'Account'){
                            addStr = (record.get('BillingCity')!=null?record.get('BillingCity'): '') + '+' + 
                            (record.get('BillingPostalCode')!=null?record.get('BillingPostalCode'): '') + '+' + 
                            (record.get('BillingStreet')!=null?record.get('BillingStreet'): '')+ '+' + 
                            (record.get('BillingState')!=null?record.get('BillingState'): '');
                            
                        }
                        if(sObjName == 'Lead'){
                            addStr = (record.get('City')!=null?record.get('City'): '') + '+' + 
                            (record.get('PostalCode')!=null?record.get('PostalCode'): '') + '+' + 
                            (record.get('Street')!=null?record.get('Street'): '')+ '+' + 
                            (record.get('State')!=null?record.get('State'): '');
                            
                        }
                        
                        if(sObjName == 'Obra__c'){
                            
                            System.debug('sObjName: ' + sObjName);
                            addStr = (record.get('DireccionDetallada__c'))!=null ? record.get('DireccionDetallada__c')+' ' : ''; 
                            // ( record.get('DireccionDetallada__c') != null? record.get('DireccionDetallada__c') : ''); 
                            // + '+' +
                            // (record.get('City')!=null?record.get('City'): '') + '+' + 
                            // (record.get('PostalCode')!=null?record.get('PostalCode'): '') + '+' + 
                            // (record.get('Street')!=null?record.get('Street'): '')+ '+' + 
                            // (record.get('State')!=null?record.get('State'): '');
                            
                        }
                    
                        addStr= addStr.replace(' ', '+');

                    
                    TriggerHandler.bypass('Clientes_handler');
                    CurrentLocationController.settingLatnLot(addStr, (Id)record.get('Id'));
                    TriggerHandler.clearbypass('Clientes_handler');
                    
                }else{
                    update record;

                }
                                
            } catch (Exception e) {
                system.debug('CurrentLocationController - ERROR: '+e.getMessage());
                system.debug('CurrentLocationController - ERROR: '+e.getLineNumber());
                return 'CurrentLocationController - ERROR: '+e.getMessage();
            } 
        

        
        return (String)record.get('Id');
    }

    @future(callout=true)
    public static void settingLatnLot(String strAddress, Id recID) {     
        System.debug('settingLatnLot: [' +strAddress +'] '+recID);
        String address = strAddress;
        String key= System.Label.GoogleMapsAPI;

        Http httpProtocol = new Http();
        HttpRequest request = new HttpRequest();
        String endpoint = 'https://maps.googleapis.com/maps/api/geocode/json?address='+address+'&key='+key;
        request.setEndPoint(endpoint);
        request.setMethod('GET');
        HttpResponse response = httpProtocol.send(request);
        System.debug('response: '+JSON.serialize(response.getBody()));
        // Deserialize JSON response
        Map<String, Object> jsonMap = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
        List<Object> results = (List<Object>) jsonMap.get('results');
        Map<String, Object> firstResult = (Map<String, Object>) results[0];
        Map<String, Object> geometry = (Map<String, Object>) firstResult.get('geometry');
        Map<String, Object> location = (Map<String, Object>) geometry.get('location');

        Decimal lat = (Decimal) location.get('lat');
        Decimal lng = (Decimal) location.get('lng');
        String sObjName = recID.getSObjectType().getDescribe().getName();

        // {
        //     "city": "Managua",
        //     "country": null,
        //     "countryCode": null,
        //     "geocodeAccuracy": null,
        //     "latitude": null,
        //     "longitude": null,
        //     "postalCode": "11031",
        //     "state": null,
        //     "stateCode": null,
        //     "street": null
        //   }
        
        System.debug('sObjName: ' + sObjName);
        
        System.debug('Latitude: ' + lat);
        System.debug('Longitude: ' + lng);
        
        if(sObjName == 'Account'){
            Account actualRec = [SELECT Id,  CurrentLocation__c, CurrentLocation__Latitude__s, direccionGeorreferenciada__Latitude__s, direccionGeorreferenciada__c, direccionGeorreferenciada__Longitude__s, CurrentLocation__Longitude__s FROM Account WHERE Id =: recID LIMIT 1];
            actualRec.CurrentLocation__Latitude__s=lat;
            actualRec.direccionGeorreferenciada__Latitude__s=lat;
            
            actualRec.CurrentLocation__Longitude__s=lng;
            actualRec.direccionGeorreferenciada__Longitude__s=lng;

            TriggerHandler.bypass('Clientes_handler');
            update actualRec;
            TriggerHandler.clearbypass('Clientes_handler');
            System.debug('###actualRec: '+actualRec); 

        }
        if(sObjName == 'Lead'){
            lead actualRec = [SELECT Id, CurrentLocation__c, CurrentLocation__Latitude__s, direccionGeorreferenciada__Latitude__s, direccionGeorreferenciada__c, direccionGeorreferenciada__Longitude__s, CurrentLocation__Longitude__s FROM Lead WHERE Id =: recID LIMIT 1];
            actualRec.Latitude=lat;
            actualRec.CurrentLocation__Latitude__s=lat;
            actualRec.direccionGeorreferenciada__Latitude__s=lat;
            
            actualRec.Longitude=lng;
            actualRec.CurrentLocation__Longitude__s=lng;
            actualRec.direccionGeorreferenciada__Longitude__s=lng;
            
            // TriggerHandler.bypass('Clientes_handler');
            update actualRec;
            // TriggerHandler.clearbypass('Clientes_handler');
            System.debug('###actualRec: '+actualRec); 
            

        }
        
        if(sObjName == 'Obra__c'){
            Obra__c actualRec = [SELECT Id, CurrentLocation__c, CurrentLocation__Latitude__s, direccionGeorreferenciada__Latitude__s, direccionGeorreferenciada__c, direccionGeorreferenciada__Longitude__s, CurrentLocation__Longitude__s FROM Obra__c WHERE Id =: recID LIMIT 1];
            // actualRec.Latitude=lat;
            actualRec.CurrentLocation__Latitude__s=lat;
            actualRec.direccionGeorreferenciada__Latitude__s=lat;
            
            // actualRec.Longitude=lng;
            actualRec.CurrentLocation__Longitude__s=lng;
            actualRec.direccionGeorreferenciada__Longitude__s=lng;
            
            // TriggerHandler.bypass('Clientes_handler');
            update actualRec;
            // TriggerHandler.clearbypass('Clientes_handler');
            System.debug('###actualRec: '+actualRec); 
            

        }

        System.debug('###Finish'); 
        System.debug('###Finish'); 
        System.debug('###Finish'); 
    } 
    

}