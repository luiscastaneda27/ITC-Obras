@isTest
private class Opportunity_handler_Test {

    @testSetup
    static void testmakeDate() {
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
        
        compania__c c = new compania__c(
            Name = 'Compañia Test',
            codigoCompania__c ='00002',
			pais__c = udcDetalladaPaisEC.Id,
            porcentajeImpuesto__c = 5
        );
        insert c;
        
        bodega__c b = new bodega__c (
            Name ='Test bodega',
            codigoBodega__c ='2CR1',
            CurrencyIsoCode = 'USD'
        );
        insert b;
        
        //gestionCredito__c ObjGestionCredito = new gestionCredito__c();
        //ObjGestionCredito.requiereOrdenCompra__c = 'Si';
        //insert ObjGestionCredito;
        
         Account a = new Account(
            Name = 'PROYECTO CR',
            codigoCliente__c = 16020688,
            pais__c = udcDetalladaPaisEC.Id,
            bodega__c = b.Id,
            companias__c = c.Id,
            correoBienvenida__c = 'test@gmail.com',
            creadoJD__c = true,
             activo__c = 'No'
             //gestionCreditoActiva__c = ObjGestionCredito.Id
        );
        insert a;
        
        Account a2 = new Account(
            Name = 'PROYECTO CR',
            codigoCliente__c = 16020688,
            pais__c = udcDetalladaPaisEC.Id,
            bodega__c = b.Id,
            companias__c = c.Id,
            correoBienvenida__c = 'test@gmail.com',
            creadoJD__c = true,
             activo__c = 'Si'
             //gestionCreditoActiva__c = ObjGestionCredito.Id
        );
        insert a2;

        
        Id recordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('potencialProyecto').getRecordTypeId();
        Opportunity op = new Opportunity(
            StageName = 'Análisis',
            CloseDate = system.today().addDays(30),
            Name = 'Potencial de proyecto',
            recordTypeId = recordTypeId,
            compania__c = c.Id,
            AccountId = a.Id,
            pais__c = udcDetalladaPaisEC.Id,
            bodegaDeDespacho__c = b.Id
        );
        insert op; 
        
        Id recordTypeId2 = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('Estimacion').getRecordTypeId();
        Opportunity op2 = new Opportunity(
            StageName = 'Análisis',
            CloseDate = system.today().addDays(30),
            Name = 'Estimacion Obras',
            recordTypeId = recordTypeId2,
            compania__c = c.Id,
            AccountId = a2.Id,
            pais__c = udcDetalladaPaisEC.Id,
            bodegaDeDespacho__c = b.Id
        );
        insert op2; 

        tipoUDC__c tu = new tipoUDC__c(
            Name = 'UDC pais test',
            CurrencyIsoCode = 'USD',
            compania__c = c.id,
            codigoUDC__c ='00/UM',
            ambitoUDC__c = 'Productos'
        );
        insert tu;
        
		udcDetallada__c trans = new udcDetallada__c(
            codigoUDC__c = '00/UM',
            codigoItemUDC__c = 'FE',
            Name = 'Medida transaccional test',
            tipoUDC__c = tu.Id
        );
        insert trans;
        
        Product2 p  = new Product2(
            Name = 'Producto de prueba',
            ProductCode = 'P0166',
            IsActive = true,
            CurrencyISOCode = 'USD',
            pesoPorPresentacion__c = 12,
            unidadDeMedidaTransaccional__c = trans.id,
            unidadDeMedidaDePeso__c = trans.id,
            unidadDeMedidaDeVolumen__c = trans.id,
            compania__c = c.id, 
            bodega__c = b.id,
            leadFabricacionDias__c = 2,
            pais__c = udcDetalladaPaisEC.id,
            fechaDeNacimientoProducto__c = date.valueOf('2020-01-01')
        );
        insert p;
        
        
        Id pricebookId = Test.getStandardPricebookId();
		system.debug('pricebookId: '+pricebookId);
        PricebookEntry pbE = new PricebookEntry(
            Pricebook2Id = pricebookId,
            Product2Id = p.Id,
            UnitPrice = 10000, 
            IsActive = true
        );
        insert pbE; 
        
        Pricebook2 pbCustom = new Pricebook2(
            pais__c = udcDetalladaPaisEC.Id,
            bodega__c = b.Id, 
            compania__c = c.Id,
            Name = 'Pricebook personalizada test',
            IsActive = true,
            aplicaParaProyecto__c = false
        );
        insert pbCustom;
        
        PricebookEntry pbECustom = new PricebookEntry(
            Pricebook2Id = pbCustom.Id,
            Product2Id = p.Id,
            UnitPrice = 10000, 
            IsActive = true
        );
        insert pbECustom;

        tipoUDC__c tu3 = new tipoUDC__c(
            Name = 'UDC pais test',
            CurrencyIsoCode = 'USD',
            compania__c = c.id,
            codigoUDC__c ='H00/TA',
            ambitoUDC__c = 'Clientes'
        );
        insert tu3;
        
        udcDetallada__c fiscal = new udcDetallada__c(
            codigoUDC__c = 'H00/TA',
            codigoItemUDC__c = 'FU',
            tipoUDC__c = tu3.Id,
            Name = 'Identificacion Fiscal'
        );
        insert fiscal; 

        Proyectos__c proyecto = new Proyectos__c(
            Name = 'Proyecto de prueba',
            etapaDelProyecto__c = 'En Proceso',
            tipoObraEdificacion__c = 'Residencial',
            tipoIdentificacionFiscal__c = fiscal.id,
            metrosCuadrados__c =  13,
            numeroIdentificacionFiscal__c = '2122',
            compania__c = c.Id, 
            bodega__c = b.Id, 
            //pais__c = ud.Id,
            potencialProyecto__c = op.Id,
            cantidadCasas__c = 1,
            fechaFinEstimada__c =  System.today()+1,
            listaPreciosReferencial__c = pbCustom.Id
        );
        insert proyecto;
        
        op.proyectoRelacionado__c = proyecto.Id;
        update op;
        
        Id recordTypeId3 = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('convenioDistribuidor').getRecordTypeId();
        Opportunity op3 = new Opportunity(
            StageName = 'Análisis',
            CloseDate = system.today().addDays(30),
            Name = 'Estimacion Obras',
            recordTypeId = recordTypeId3,
            compania__c = c.Id,
            pais__c = udcDetalladaPaisEC.Id,
            bodegaDeDespacho__c = b.Id,
            proyectoRelacionado__c = proyecto.Id
        );
        insert op3; 
        
        Id recordTypeId4 = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('convenioConstructora').getRecordTypeId();
        Opportunity op4 = new Opportunity(
            StageName = 'Análisis',
            CloseDate = system.today().addDays(30),
            Name = 'Estimacion Obras',
            recordTypeId = recordTypeId4,
            compania__c = c.Id,
            pais__c = udcDetalladaPaisEC.Id,
            bodegaDeDespacho__c = b.Id,
            proyectoRelacionado__c = proyecto.Id
        );
        insert op4; 
        
        Id recordTypeId5 = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('convenioFranquiciado').getRecordTypeId();
        Opportunity op5 = new Opportunity(
            StageName = 'Análisis',
            CloseDate = system.today().addDays(30),
            Name = 'Estimacion Obras',
            recordTypeId = recordTypeId5,
            compania__c = c.Id,
            pais__c = udcDetalladaPaisEC.Id,
            bodegaDeDespacho__c = b.Id,
            proyectoRelacionado__c = proyecto.Id
        );
        insert op5; 
    }
    @isTest
    private static void ejectutarCreacionOportunidad(){
        Opportunity oportunidad = [Select id, StageName from Opportunity LIMIT 1];
     
         oportunidad.StageName = 'En proceso';
		 update oportunidad; 
        
    }
}