public class Opportunity_handler extends TriggerHandler {

	private list<Opportunity> newListOpportunities;
	private Map<Id, Opportunity> newMapOpportunities;
	private Map<Id, Opportunity> oldMapOpportunities;

	Id TdRIdConvConstOp = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('convenioConstructora').getRecordTypeId();
	Id TdRIdConDistOp = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('convenioDistribuidor').getRecordTypeId();
	Id TdRIdConFranOp = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('convenioFranquiciado').getRecordTypeId();
	Id TdRIdPotencialProyectoOp = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('potencialProyecto').getRecordTypeId();
	Id TdRIdVentaDirectaProyecto = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('ventaDirectaProyecto').getRecordTypeId();
	Id TdRIdVentaIndirectaProyecto = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('ventaIndirectaProyecto').getRecordTypeId();
	Id TdRIdVentaDirectaDist = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('ventaDirectaDistribuidor').getRecordTypeId();
    Id TdRIdVentaDirectaTienda = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('VentaDirectaTienda').getRecordTypeId();
	Id TdRIdEstimacion = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('Estimacion').getRecordTypeId();
    
    Id TdRIdConvConstCot = Schema.SObjectType.Quote.getRecordTypeInfosByDeveloperName().get('convenioConstructor').getRecordTypeId();
	Id TdRIdConvDistCot = Schema.SObjectType.Quote.getRecordTypeInfosByDeveloperName().get('convenioDistribuidor').getRecordTypeId();
	Id TdRIdConvFranCot = Schema.SObjectType.Quote.getRecordTypeInfosByDeveloperName().get('convenioFranquiciado').getRecordTypeId();
	

	public Opportunity_handler() {
		//Cargamos la lista de Quote con lo que viene en el contexto de trigger.new
		newListOpportunities = (list<Opportunity>) Trigger.New;

		//Cargamos el mapa de Quote con lo que viene en el contexto de trigger.newmap
		newMapOpportunities = (Map<Id, Opportunity>) Trigger.NewMap;

		//Cargamos el mapa de Quote con lo que viene en el contexto de trigger.oldmap
		oldMapOpportunities = (Map<Id, Opportunity>) Trigger.OldMap;
	}

	public override void beforeInsert()
	{

		Set<String> setProyectos = new Set<String>();
		Set<String> setPaises = new Set<String>();
		Set<String> setCompanias = new Set<String>();
		Set<String> setCompaniasConv = new Set<String>();
		Set<string> setBodegas = new set<String>();
		Set<String> setCuentas = new Set<String>();
		Map<String,Proyectos__c> mapPotencialesCreados = new Map<String,Proyectos__c>();
		map<String,String> mapListaPrecios = new map<String,String>();	
		Map<String,Account> mapCuentas = new Map<String,Account>();

		for(Opportunity op:newListOpportunities)
		{			
			if(op.RecordTypeId == TdRIdPotencialProyectoOp)
			{
				System.debug('oportunidad - potencial de proyecto');
				setProyectos.add(op.proyectoRelacionado__c);
				setCompaniasConv.add(op.compania__c);
			}
						
			if(op.RecordTypeId == TdRIdConvConstOp||op.RecordTypeId == TdRIdConDistOp||op.RecordTypeId == TdRIdConFranOp)
			{
				System.debug('Op es un convenio');
				
				setProyectos.add(op.proyectoRelacionado__c);
				setCompaniasConv.add(op.compania__c);
			}

			if(op.RecordTypeId==TdRIdVentaDirectaProyecto ||op.RecordTypeId== TdRIdEstimacion || op.RecordTypeId==TdRIdVentaIndirectaProyecto || op.RecordTypeId==TdRIdVentaDirectaDist || op.RecordTypeId==TdRIdVentaDirectaTienda)
			{
				setPaises.add(op.pais__c);
				setCompanias.add(op.compania__c);
				setBodegas.add(op.bodegaDeDespacho__c);
				setCuentas.add(op.AccountId);
			}
		}
		Map<String,String> mapCompaniasConv = new Map<String,String>();
		if(!setCompaniasConv.isEmpty())
		{
			for(compania__c com:[select id,codigoCompania__c from compania__c where id in:setCompaniasConv])
			{
				mapCompaniasConv.put(com.Id,com.codigoCompania__c);
			}
		}
		Map<String,String> mapCuentasConv = new Map<String,String>();
		if(!mapCompaniasConv.values().isEmpty())
		{
			for(account acc:[select id,companias__c,companias__r.codigoCompania__c from Account where (Name like 'PROYECTO CR' or Name like 'PROYECTO EC' or Name like 'PROYECTO PA') and companias__c in:mapCompaniasConv.keySet() and activo__c = 'No'])
			{
				mapCuentasConv.put(acc.companias__c,acc.Id);
			}
		}

		if(!mapCuentasConv.values().isEmpty())
		{
			for(Opportunity op:newListOpportunities)
			{
				if(mapCuentasConv.containsKey(op.compania__c) && (op.RecordTypeId == TdRIdConvConstOp||op.RecordTypeId == TdRIdConDistOp||op.RecordTypeId == TdRIdConFranOp || op.RecordTypeId == TdRIdPotencialProyectoOp))
				{
					op.AccountId = mapCuentasConv.get(op.compania__c);
				}		
			}		
		}

		if(!setPaises.isEmpty()&&!setCompanias.isEmpty()&&!setBodegas.isEmpty())
		{
			for(Pricebook2 pb2:[select id,pais__c,compania__c,bodega__c from Pricebook2 where pais__c in:setPaises and compania__c in:setCompanias and bodega__c in:setBodegas AND aplicaParaProyecto__c = false])
			{
				mapListaPrecios.put(pb2.pais__c+'-'+pb2.compania__c+'-'+pb2.bodega__c,pb2.Id);
			}
		}
		System.debug('lista de precios oportunidad ' + mapListaPrecios);

		if(!setCuentas.isEmpty())
		{
			for(account acc:[select id,CurrencyIsoCode from account where id in: setCuentas])
			{
				mapCuentas.put(acc.Id,acc);
			}
		}

		//Busco la lista de precios que tiene asignado el proyecto
		if(!setProyectos.isEmpty())
		{
			for(Proyectos__c pro:[select id, potencialProyectoCreada__c,listaPreciosReferencial__c,pais__c,CurrencyIsoCode from Proyectos__c where id in:setProyectos])
			{
				mapPotencialesCreados.put(pro.Id,pro);
			}		
		}

		for(Opportunity op:newListOpportunities){
			
			if(op.RecordTypeId == TdRIdPotencialProyectoOp&&mapPotencialesCreados.containsKey(op.proyectoRelacionado__c))
			{
				System.debug('Asignación de datos relacionados a proyecto');
				
				if(mapPotencialesCreados.get(op.proyectoRelacionado__c).potencialProyectoCreada__c)
				{
					System.debug('potencial de proyecto ya creado');
					op.addError('El potencial del proyecto ya ha sido creado');
				}		
				
				//Asignación de lista de precios referencial de acuerdo a la que está asignada en el Proyecto
				op.Pricebook2Id = mapPotencialesCreados.get(op.proyectoRelacionado__c).listaPreciosReferencial__c;
				op.pais__c = mapPotencialesCreados.get(op.proyectoRelacionado__c).pais__c;
				op.CurrencyIsoCode = mapPotencialesCreados.get(op.proyectoRelacionado__c).CurrencyIsoCode;
			}			
			
			if(op.RecordTypeId == TdRIdConvConstOp||op.RecordTypeId == TdRIdConDistOp||op.RecordTypeId == TdRIdConFranOp)
			{				
				op.StageName = 'Cotización';

				//Asignación de lista de precios referencial de acuerdo a la que está asignada en el proyecto
				op.Pricebook2Id = mapPotencialesCreados.get(op.proyectoRelacionado__c).listaPreciosReferencial__c;
				
				//Asignación de país de acuerdo al que está asignado en el proyecto
				op.pais__c = mapPotencialesCreados.get(op.proyectoRelacionado__c).pais__c;

				//Asignación de moneda
				op.CurrencyIsoCode = mapPotencialesCreados.get(op.proyectoRelacionado__c).CurrencyIsoCode;

			}
            System.debug('Debug 1: '+ JSOn.serialize(mapListaPrecios));
            System.debug('Debug 2: '+ op.pais__c+'-'+op.compania__c+'-'+op.bodegaDeDespacho__c);
            System.debug('Debug 3: '+ mapListaPrecios.containsKey(op.pais__c+'-'+op.compania__c+'-'+op.bodegaDeDespacho__c));
			if((op.RecordTypeId==TdRIdVentaDirectaProyecto ||op.RecordTypeId==TdRIdEstimacion|| op.RecordTypeId==TdRIdVentaIndirectaProyecto || op.RecordTypeId==TdRIdVentaDirectaDist || op.RecordTypeId==TdRIdVentaDirectaTienda )&&!mapListaPrecios.values().isEmpty()&&mapListaPrecios.containsKey(op.pais__c+'-'+op.compania__c+'-'+op.bodegaDeDespacho__c))
			{
                op.Pricebook2Id = mapListaPrecios.get(op.pais__c+'-'+op.compania__c+'-'+op.bodegaDeDespacho__c);
				op.CurrencyIsoCode = mapCuentas.get(op.AccountId).CurrencyIsoCode;
			}
		}
	}	
	
	public override void afterInsert() {		

		Set<String> setProyectoRelacionado = new Set<String>();
		Set<String> setOpsConvenioConstructorasPR = new Set<String>();
		Set<String> setOpsConvenioDistribuidoresPR = new Set<String>();
		Set<String> setOpsConvenioFranquiciadosPR = new Set<String>();		

		Map<String,String> mapProyectoPotencial = new Map<String,String>();
		Map<String,Proyectos__c> mapProyectosInfo = new Map<String,Proyectos__c>();
		Map<String,Opportunity> mapOpsConstructoras = new Map<String,Opportunity>();
		Map<String,Opportunity> mapOpsDistribuidores = new Map<String,Opportunity>();
		Map<String,Opportunity> mapOpsFranquiciados = new Map<String,Opportunity>();
		
		List<Quote> lstCotizaciones = new List<Quote>();
		List<QuoteLineItem> listCotLineas = new List<QuoteLineItem>();

		System.debug('Oportunidades en after insert ' + newListOpportunities);

		System.debug('IDS tdR CONVENIOS ');
		System.debug('tdR TdRIdConvConstOp ' + TdRIdConvConstOp);
		System.debug('tdR TdRIdConDistOp ' + TdRIdConDistOp);
		System.debug('tdR TdRIdConFranOp ' + TdRIdConFranOp);		

		for(Opportunity op:newListOpportunities)
		{
			if(op.RecordTypeId == TdRIdConvConstOp||op.RecordTypeId == TdRIdConDistOp||op.RecordTypeId == TdRIdConFranOp)
			{
				setProyectoRelacionado.add(op.proyectoRelacionado__c);
			}
		}

		if(!setProyectoRelacionado.isEmpty())
		{
			for(Proyectos__c pro:[select id,potencialProyecto__c,CurrencyIsoCode from Proyectos__c where id in:setProyectoRelacionado])
			{
				mapProyectoPotencial.put(pro.Id,pro.potencialProyecto__c);//llave: Id de proyecto - contenido: Id potencial de proyecto
				mapProyectosInfo.put(pro.Id,pro);
			}
		}
		
		for(Opportunity op:newListOpportunities)
		{
			if(op.RecordTypeId == TdRIdConvConstOp||op.RecordTypeId == TdRIdConDistOp||op.RecordTypeId == TdRIdConFranOp)
			{

				Quote newQuote = new Quote();
				newQuote.OpportunityId = op.Id;
				newQuote.Name = 'Cotización - ' + op.Name;
				newQuote.Status = 'En proceso';
				newQuote.Pricebook2Id = op.Pricebook2Id;
				newQuote.proyectoRelacionado__c = op.proyectoRelacionado__c;
				newQuote.RecordTypeId = op.RecordTypeId == TdRIdConvConstOp?TdRIdConvConstCot:(op.RecordTypeId == TdRIdConDistOp?TdRIdConvDistCot:TdRIdConvFranCot);
				newQuote.potencialProyecto__c = mapProyectoPotencial.get(op.proyectoRelacionado__c);
				newQuote.ExpirationDate = System.today()+8;
				newQuote.CurrencyIsoCode = mapProyectosInfo.get(op.proyectoRelacionado__c).CurrencyIsoCode;
				lstCotizaciones.add(newQuote);								
			}
		}

		for(Opportunity op:newListOpportunities)
		{
			//Convenios con constructoras
			if(op.RecordTypeId == TdRIdConvConstOp)
			{
				System.debug('constructora 1');
				setOpsConvenioConstructorasPR.add(mapProyectoPotencial.get(op.proyectoRelacionado__c));//Id potencial de proyecto				
			}
			//Convenios con distribuidores solicitados
			if(op.RecordTypeId == TdRIdConDistOp)
			{
				System.debug('distribuidor 1');
				setOpsConvenioDistribuidoresPR.add(mapProyectoPotencial.get(op.proyectoRelacionado__c));//Id potencial de proyecto				
			}
			//Convenios con franquicias
			if(op.RecordTypeId == TdRIdConFranOp)
			{
				System.debug('franquiciado 1');
				setOpsConvenioFranquiciadosPR.add(mapProyectoPotencial.get(op.proyectoRelacionado__c));//Id potencial de proyecto				
			}
		}

		Map<String,List<OpportunityLineItem>> mapOppIdOli ;

		if(!setOpsConvenioConstructorasPR.isEmpty()||!setOpsConvenioDistribuidoresPR.isEmpty()||!setOpsConvenioFranquiciadosPR.isEmpty())
		{
			
			mapOppIdOli = new Map<String,List<OpportunityLineItem>>();

			for(Opportunity PotRel:[SELECT 	Id,	proyectoRelacionado__c,Pricebook2Id, (SELECT CurrencyIsoCode,Id,ListPrice,Name,PriceBookEntry.Product2Id,PricebookEntryId,Product2Id,ProductCode,Quantity,SortOrder,TotalPrice,UnitPrice,etapaConstructiva__c,pesoPorPresentacion__c,productosSinConsumir__c FROM OpportunityLineItems where productosSinConsumir__c>0) FROM Opportunity where RecordTypeId=:TdRIdPotencialProyectoOp and (Id in:setOpsConvenioConstructorasPR or Id in:setOpsConvenioDistribuidoresPR or Id in:setOpsConvenioFranquiciadosPR)])
			{

				if(!PotRel.OpportunityLineItems.isEmpty())
				{
					System.debug('potencial de proyecto tiene productos');

					if(!mapOppIdOli.containsKey(PotRel.proyectoRelacionado__c))
						mapOppIdOli.put(PotRel.proyectoRelacionado__c, new List<OpportunityLineItem>());

					if(mapOppIdOli.containsKey(PotRel.proyectoRelacionado__c))
						mapOppIdOli.get(PotRel.proyectoRelacionado__c).addAll(PotRel.OpportunityLineItems);
				}
			}
		}
		if(!lstCotizaciones.isEmpty())
		{
			System.debug('Se insertará la cotización del convenio');
			Set<String> setSucessQuotes = new Set<String>();

			//Necesito que entre al trigger
			//TriggerHandler.bypass('Cotizaciones_handler');
				Database.SaveResult[] insertResults = Database.insert(lstCotizaciones,false);
			//TriggerHandler.clearBypass('Cotizaciones_handler');

			for(Integer i=0;i<insertResults.size();i++)
			{
				if (insertResults.get(i).isSuccess())
				{
					insertResults.get(i).getId();
					setSucessQuotes.add(lstCotizaciones.get(i).Id);

				}else if (!insertResults.get(i).isSuccess()){
					// DML operation failed
					Database.Error error = insertResults.get(i).getErrors().get(0);
					String failedDML = error.getMessage();
					lstCotizaciones.get(i);//failed record from the list
					system.debug('Failed ID'+lstCotizaciones.get(i).Id);
				 }
			}
			System.debug('cotizaciones exitosas ' + setSucessQuotes);
			if(!mapOppIdOli.values().isEmpty()&&!setSucessQuotes.isEmpty())
			{				
				System.debug('creación de items de cotización');
				listCotLineas = new List<QuoteLineItem>();

				for(Quote q:lstCotizaciones)
				{
					if(mapOppIdOli.containsKey(q.proyectoRelacionado__c)&&!mapOppIdOli.get(q.proyectoRelacionado__c).isEmpty()&&setSucessQuotes.contains(q.Id)){
						System.debug('Procesar información de las líneas de cotización para las que se crearon');

						for(OpportunityLineItem opLine:mapOppIdOli.get(q.proyectoRelacionado__c)){
							QuoteLineItem qli = new QuoteLineItem();
							qli.quoteId = q.Id;
							qli.UnitPrice = opLine.UnitPrice;
							qli.Product2Id = opLine.PriceBookEntry.Product2Id;
							qli.Quantity = opLine.productosSinConsumir__c;//opLine.Quantity;
							qli.PriceBookentryid = opLine.PriceBookentryId;							
							qli.etapaConstructiva__c = opLine.etapaConstructiva__c;
							listCotLineas.add(qli);
						}	
					}
				}
				if(!listCotLineas.isEmpty())
				{
					TriggerHandler.bypass('Cotizaciones_handler');
					TriggerHandler.bypass('ProductoCotizacion_handler');
						insert listCotLineas;
					TriggerHandler.clearBypass('ProductoCotizacion_handler');
					TriggerHandler.clearBypass('Cotizaciones_handler');
				}			
			}
		}
	}

	public override void afterUpdate() {		

		Map<String,Decimal> mapMontoConvenio = new Map<String,Decimal>();
		List<Proyectos__c> lstProyectos = new List<Proyectos__c>();
		Set<String> setCotizaciones = new Set<String>();

		for(Opportunity op:newListOpportunities)
		{
			if(op.SyncedQuoteId!=null && op.SyncedQuoteId!= oldMapOpportunities.get(op.Id).SyncedQuoteId && (op.RecordTypeId == TdRIdConvConstOp||op.RecordTypeId == TdRIdConDistOp||op.RecordTypeId == TdRIdConFranOp))
			{
				setCotizaciones.add(op.SyncedQuoteId);
				
			}
		}

		if(!setCotizaciones.isEmpty())
		{
			for(Quote q:[select id, GrandTotal,proyectoRelacionado__c from quote where id IN: setCotizaciones])
			{
				mapMontoConvenio.put(q.proyectoRelacionado__c,q.GrandTotal);
			}
		}

		System.debug('mapMontoConvenio ' + mapMontoConvenio);

		if (!mapMontoConvenio.values().isEmpty()) 
		{
			for (Proyectos__c pro :[SELECT AN8__c, Id, Name, montoProductosConvenios__c,(SELECT Constructora__c, CreatedById, CreatedDate, CurrencyIsoCode, Id, Name, Proyectos__c, an8HijoProyectoRelacionado__c, contactoRelacionadoProyecto__c,contactoRelacionadoProyecto__r.Email FROM Constructoras__r where contactoRelacionadoProyecto__r.Email != null) FROM Proyectos__c where Id in :mapMontoConvenio.keySet()]) 
			{
				pro.montoProductosConvenios__c = (pro.montoProductosConvenios__c!=null?pro.montoProductosConvenios__c:0) + mapMontoConvenio.get(pro.Id);
				lstProyectos.add(pro);
			}
		}
		System.debug('lstProyectos ' + lstProyectos);

		if(!lstProyectos.isEmpty())
		{
			TriggerHandler.bypass('Proyectos_handler');			
				Database.update(lstProyectos,false);
			TriggerHandler.clearbypass('Proyectos_handler');			
		}

	}
}