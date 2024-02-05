public class NewObraController {  
    @AuraEnabled
	public static List<GetInfo> getUserInfo(String userId) {
    List<GetInfo> result = new List<GetInfo>();
    User userCompany = [SELECT codigoCompania__c, ManagerId FROM User WHERE Id = :userId LIMIT 1];
    compania__c companyId = [SELECT Id, pais__c FROM compania__c WHERE codigoCompania__c =: userCompany.codigoCompania__c];
    GetInfo item = new GetInfo();
    item.companyId = companyId.Id;
    item.countryId = companyId.pais__c;
    item.gestorId = (userCompany.ManagerId != NULL ? userCompany.ManagerId : userCompany.Id);
    result.add(item);
    return result;
	}
    
    public class GetInfo{
        @AuraEnabled 
        public string companyId {get; set;}
        @AuraEnabled 
        public string countryId {get; set;}
        @AuraEnabled 
        public string gestorId {get; set;}
        
    }
}