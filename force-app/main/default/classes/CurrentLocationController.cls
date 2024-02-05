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
                                
                update record;
                                
            } catch (Exception e) {
                system.debug('CurrentLocationController - ERROR: '+e.getMessage());
                system.debug('CurrentLocationController - ERROR: '+e.getLineNumber());
                return 'CurrentLocationController - ERROR: '+e.getMessage();
            } 
        

        
        return (String)record.get('Id');
    }

    

}