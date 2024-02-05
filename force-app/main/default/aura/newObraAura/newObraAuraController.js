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
                console.log(response.getReturnValue());
                
                var companyId = component.get("{!v.result[0].companyId}");
                var countryId = component.get("{!v.result[0].countryId}");
                var gestorId = component.get("{!v.result[0].gestorId}");
                var createRecordEvent = $A.get("e.force:createRecord");
                
                createRecordEvent.setParams({
                    "entityApiName": "Obra__c",
                    "defaultFieldValues": {
                        "Compania__c": companyId,
                        "Pais__c": countryId,
                        "UsuarioValidador__c":gestorId
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