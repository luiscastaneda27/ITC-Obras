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
                component.set("v.companyId", response.getReturnValue());
                
                var companyId = component.get("v.companyId");
                var createRecordEvent = $A.get("e.force:createRecord");
                
                createRecordEvent.setParams({
                    "entityApiName": "Obra__c",
                    "defaultFieldValues": {
                        "Compania__c": companyId
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