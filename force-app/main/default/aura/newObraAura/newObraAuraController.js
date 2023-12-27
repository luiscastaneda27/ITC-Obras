({
    init : function (component) {
        
        
        var userId = $A.get("$SObjectType.CurrentUser.Id");
       
        var action = component.get("c.getUserInfo");
        action.setParams({
            userId: userId
        });

        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                component.set("v.result", response.getReturnValue());
                
                var companyId = component.get("{!v.result.companyId}");
                var countryId = component.get("{!v.result.countryId}");
                var createRecordEvent = $A.get("e.force:createRecord");
                
                createRecordEvent.setParams({
                    "entityApiName": "Obra__c",
                    "defaultFieldValues": {
                        "Compania__c": companyId,
                        "Pais__c": countryId
                    }                    
                });
                createRecordEvent.fire();
                
            } else {
                console.error("Error al obtener información del usuario");
            }
        });
        $A.enqueueAction(action);
    }
})