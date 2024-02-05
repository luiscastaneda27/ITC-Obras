@isTest
public class NewObraController_Test {

    @isTest
    static void testGetUserInfo() {
        tipoUDC__c tipoUDCPais = new tipoUDC__c();
        tipoUDCPais.Name= 'País';
        tipoUDCPais.codigoUDC__c = '01/06';
        tipoUDCPais.ambitoUDC__c = 'Clientes';
        tipoUDCPais.corporativa__c = true;
        tipoUDCPais.idexternoTipoUDC__c = '01/06';
        insert tipoUDCPais;
        
        list<udcDetallada__c> lstUDCDetalladasPaises = new list<udcDetallada__c>();
        udcDetallada__c udcDetalladaPaisEC = new udcDetallada__c();
        udcDetalladaPaisEC.codigoItemUDC__c = 'EC';
        udcDetalladaPaisEC.Name='EC-ECUADOR';
        udcDetalladaPaisEC.tipoUDC__c = tipoUDCPais.id;
        udcDetalladaPaisEC.idExternoUDCDetallada__c = tipoUDCPais.codigoUDC__c+'-'+'EC';
        lstUDCDetalladasPaises.add(udcDetalladaPaisEC);
        insert lstUDCDetalladasPaises;
        
        compania__c testCompany = new compania__c(
            Name = 'Compañia Test',
            codigoCompania__c ='00002',
			pais__c = udcDetalladaPaisEC.Id,
            porcentajeImpuesto__c = 5
        );
        insert testCompany;
        
        User testUser = [Select Id, codigoCompania__c, profileId from User Where Id = :UserInfo.getUserId()];
        testUser.codigoCompania__c = '00002';
        update testUser;  

        // Asignar la compañía al usuario de prueba
        testUser.codigoCompania__c = testCompany.codigoCompania__c;
        update testUser;

        // Llamar al método de controlador para obtener información del usuario
        List<NewObraController.GetInfo> result = NewObraController.getUserInfo(testUser.Id);

        // Verificar que la información del usuario se haya obtenido correctamente
        System.assertEquals(1, result.size());
        NewObraController.GetInfo userInfo = result[0];
        System.assertEquals(testCompany.Id, userInfo.companyId);
        System.assertEquals(testCompany.pais__c, userInfo.countryId);
    }
}