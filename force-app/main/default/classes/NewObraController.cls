public class NewObraController {  
    @AuraEnabled
	public static Map<String, String> getUserInfo(String userId) {
    Map<String, String> result = new Map<String, String>();
    User userCompany = [SELECT codigoCompania__c FROM User WHERE Id = :userId LIMIT 1];
    compania__c companyId = [SELECT Id, pais__c FROM compania__c WHERE codigoCompania__c =: userCompany.codigoCompania__c];
    result.put('companyId', companyId.Id);
    result.put('countryId', companyId.pais__c);
    return result;
}
}