public class NewObraController {
    @AuraEnabled
    public static String getUserInfo(String userId) {
        User userCompany = [SELECT codigoCompania__c FROM User WHERE Id = :userId LIMIT 1];
        compania__c companyId = [SELECT Id FROM compania__c WHERE codigoCompania__c =: userCompany.codigoCompania__c];
        return companyId.Id;
    }
}