/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
/** File Name: SU_HDFC Bank to NS Generate Outward Payment Files.js
 * File ID: 
 * Date Created: 04 August 2022
 * Author: Pralhad Solanke
 * Company: Yantra Tech Innovation Lab Pvt. Ltd.
 * email: pralhad@yantrainc.com
 * Description: This script is used to create UI for data entry and fetch the data according to selected criteria .
 */
/**
 * Script Modification Log:
 * 
    -- Date -- -- Modified By -- --Requested By-- -- Description --

 *
 */

var flag_filters = false;
var PAYMENTS_CREDIT_APPLIED_ARR = {};
var VEND_AMT_ARR = {};
var ENTRYCOUNT="";
define(['N/ui/serverWidget', 'N/log', 'N/currentRecord', 'N/format', 'N/record', 'N/search', 'N/redirect', 'N/url', 'N/runtime','N/task' , "N/ui/serverWidget"], 
		function(serverWidget, log, currentRecord, format, record, search, redirect, url, runtime,task,ui) {
	function onRequest(context) {

		if (context.request.method == 'GET') {

			try{
				log.debug('onRequest:Get()','----------------------------------------- execution Starts here ------------------------------------------------------');

				//-------------------------------------- Start - get current login user details ----------------------------------------------//
				var userName ="";
				var userId ="";

				var objUser = runtime.getCurrentUser() ;

				if(_logValidation(objUser)){
					userId = objUser.id;									
					userName = objUser.name;
				}
				//-------------------------------------- Start - get current login user details -----------------------------------------------------------------//

				//-------------------------------------- Start - get Values from General Configuration Record ----------------------------------------------//

				var internalID_GC ="";
				var vendorBillSearchId = "";
				var paymentFolderId ="";
				var reversalFolderId = "";
				var clientScriptPath="";
				var defaultSubsidiary ="";
				var creditpaymentAppliedSearchId ="";
				var bankAccountId = "";
				var bankAccountNo='';

				var arrFilters_GC = new Array();					
				arrFilters_GC.push(search.createFilter({name: 'custrecord_gc_ns_short_name',operator: search.Operator.IS,values : 'HDFC'}));

				var arrColumns_GC = new Array();	
				arrColumns_GC.push(search.createColumn({name: 'internalid'}));
				arrColumns_GC.push(search.createColumn({name: 'custrecord_gc_payment_search'}));
				arrColumns_GC.push(search.createColumn({name: 'custrecord_gc_ns_payment_folder'}));
				arrColumns_GC.push(search.createColumn({name: 'custrecord_gc_ns_reversal_folder'}));
				arrColumns_GC.push(search.createColumn({name: 'custrecord_gc_ns_clientscript_path'}));
				arrColumns_GC.push(search.createColumn({name: 'custrecord_gc_ns_default_subsidiary'}));
				arrColumns_GC.push(search.createColumn({name: 'custrecord_gc_ns_creditpayment_applied'}));
				arrColumns_GC.push(search.createColumn({name: 'custrecord_gc_ns_bank_account'}));

				var objSearch_GC = search.create({type: 'customrecord_general_configuration',filters: null,columns: arrColumns_GC});
				var searchResult_GC    = objSearch_GC.run().getRange({start: 0, end: 1000});
				//log.debug('onRequest:Get()','searchResult_GC=='+searchResult_GC);
				if(_logValidation(searchResult_GC))
				{					
					for(var gc=0;gc<searchResult_GC.length;gc++){
						internalID_GC = searchResult_GC[gc].getValue({name: 'internalid'});						
						vendorBillSearchId = searchResult_GC[gc].getValue({name: 'custrecord_gc_payment_search'});						
						paymentFolderId = searchResult_GC[gc].getValue({name: 'custrecord_gc_ns_payment_folder'});						
						reversalFolderId = searchResult_GC[gc].getValue({name: 'custrecord_gc_ns_reversal_folder'});						
						clientScriptPath = searchResult_GC[gc].getValue({name: 'custrecord_gc_ns_clientscript_path'});						
						defaultSubsidiary = searchResult_GC[gc].getValue({name: 'custrecord_gc_ns_default_subsidiary'});						
						creditpaymentAppliedSearchId = searchResult_GC[gc].getValue({name: 'custrecord_gc_ns_creditpayment_applied'});												
						bankAccountId = searchResult_GC[gc].getValue({name: 'custrecord_gc_ns_bank_account'});						
					}
				}

				//-------------------------------------- End - get Values from General Configuration Record ----------------------------------------------//			

				//-------------------------------------- Start - Get values of Parameters from URL ---------------------------------------------------------//

				var dStartDateParamValue = context.request.parameters.paramStartDate;
				if (_logValidation(dStartDateParamValue)) {					
					dStartDateParamValue = format.parse({ value: dStartDateParamValue, type: format.Type.DATE })
					dStartDateParamValue = format.format({ value: dStartDateParamValue, type: format.Type.DATE })					
				}
				var dEndDateParamValue = context.request.parameters.paramEndDate;
				if (_logValidation(dEndDateParamValue)) {					
					dEndDateParamValue = format.parse({ value: dEndDateParamValue, type: format.Type.DATE })
					dEndDateParamValue = format.format({ value: dEndDateParamValue, type: format.Type.DATE })					
				}
				var dDueStartDateParamValue = context.request.parameters.paramDueStartDate;
				if (_logValidation(dDueStartDateParamValue)) {					
					dDueStartDateParamValue = format.parse({ value: dDueStartDateParamValue, type: format.Type.DATE })
					dDueStartDateParamValue = format.format({ value: dDueStartDateParamValue, type: format.Type.DATE })					
				}
				var dDueEndDateParamValue = context.request.parameters.paramDueEndDate;
				if (_logValidation(dDueEndDateParamValue)) {					
					dDueEndDateParamValue = format.parse({ value: dDueEndDateParamValue, type: format.Type.DATE })
					dDueEndDateParamValue = format.format({ value: dDueEndDateParamValue, type: format.Type.DATE })					
				}
				var vendorIdParamValue = context.request.parameters.paramVendorID;
				//log.debug('onRequest:Get()',"vendorIdParamValue=="+vendorIdParamValue);

				var subsidaryIdParamValue = context.request.parameters.paramSubsidaryID;
				//log.debug('onRequest:Get()',"subsidaryIdParamValue=="+subsidaryIdParamValue);

				var locationIdParamValue = context.request.parameters.paramLocationID;
				//log.debug('onRequest:Get()',"locationIdParamValue=="+locationIdParamValue);

				var iPaymentMethodParamSTR = context.request.parameters.payment_method_str;

				var iPaymentMethodParamValue = context.request.parameters.parampayment_method;

				var bankAccountParamValue = context.request.parameters.paramBankAccount;
				var bankAccountStringParamValue = context.request.parameters.paramBankAccountString;

				var bankAccountNoParamValue = context.request.parameters.paramBankAccountNo;

				//-------------------------------------- End - Get values of Parameters from URL ---------------------------------------------------------//

				//----------------------------------------- Start - Create UI form and add Field on the form ------------------------------------------------//
				var objForm = serverWidget.createForm({ title: 'HDFC Bank | Generate Bank File' });

				//set the client script on the suitelet form
				objForm.clientScriptModulePath = ''+clientScriptPath+'';

				//this is field container it is just like row or container in bootstrap
				objForm.addFieldGroup({id: 'custpage_bank_file_info',label: 'Primary Information'});
				objForm.addFieldGroup({id: 'custpage_date_filters',label: 'Date Criteria'});
				objForm.addFieldGroup({id: 'custpage_other_filters',label: 'Other Criteria'});
				objForm.addFieldGroup({id: 'custpage_transaction_value',label: 'Total Transaction Value'});

				var objFldUserId = objForm.addField({ id: 'custpage_userid', type: serverWidget.FieldType.TEXT, label: 'User#', container: 'custpage_bank_file_info'});			
				objFldUserId.defaultValue = userId + " " + userName;
				objFldUserId.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});

				//for ( YYYY-MM-DD HH24-MI-SS) date format 
				var objCurrentDate = new Date();
				objCurrentDate = convert_date(objCurrentDate);

				// adjust 0 before single digit date
				var date = ("0" + objCurrentDate.getDate()).slice(-2);
				// current month
				var month = ("0" + (objCurrentDate.getMonth() + 1)).slice(-2);
				// current year
				var year = objCurrentDate.getFullYear();
				// current hours
				var hours = objCurrentDate.getHours();
				// current minutes
				var minutes = objCurrentDate.getMinutes();
				// current seconds
				var seconds = objCurrentDate.getSeconds();

				if(hours < 10){hours = '0'+hours ;}
				if(minutes < 10){minutes = '0'+minutes ;}
				if(seconds < 10){seconds = '0'+seconds ;}

				// prints date & time in YYYY-MM-DD HH:MM:SS format
				//    log.debug('format date', year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);
				//var dateCreated = year + "-" + month + "-" + date + " " + hours + "-" + minutes + "-" + seconds;
				var dateCreated = year + "-" + month + "-" + date;
				//    log.debug('date created', datecreated);

				var objFldTransmissionDate = objForm.addField({ id: 'custpage_transmissiondate', type: serverWidget.FieldType.TEXT, label: 'Current Date', container: 'custpage_bank_file_info' });
				objFldTransmissionDate.defaultValue = dateCreated;			
				objFldTransmissionDate.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});

				//var objFldSubsidary = objForm.addField({ id: 'custpage_subsidary', type: serverWidget.FieldType.SELECT, label: 'Subsidary', source: 'subsidiary', container: 'custpage_bank_file_info' });
				var objFldSubsidary = objForm.addField({ id: 'custpage_subsidary', type: serverWidget.FieldType.SELECT, label: 'Subsidary', container: 'custpage_bank_file_info' });
				if(defaultSubsidiary){
					objFldSubsidary.defaultValue = defaultSubsidiary;
				}
				objFldSubsidary.isMandatory = true;
				//objFldSubsidary.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
				//objFldSubsidary.removeSelectOption({value: null});
				objFldSubsidary.addSelectOption({ value: '', text: '' });

				//------------------------------------------------------ Start - Get Subsidiaries ---------------------------------------------------------------------------------//

				var arrSubsidiaryId=[];
				var arrSubsidiary=[];
				var subsidiaryId = "";
				var subsidiaryName="";
				var customrecord_ns_hdfc_account_number_SearchObj = search.create({type: "customrecord_ns_hdfc_account_number_",
					filters:
						[
							["isinactive","is","F"]
							],
							columns:
								[				
									search.createColumn({name: "custrecord_ns_subsidiary_", label: "Subsidiary"})																			
									]
				});
				var searchResultCount = customrecord_ns_hdfc_account_number_SearchObj.runPaged().count;
				log.debug("customrecord_ns_hdfc_account_number_SearchObj result count",searchResultCount);
				customrecord_ns_hdfc_account_number_SearchObj.run().each(function(result){
					// .run().each has a limit of 4,000 results					
					subsidiaryId = result.getValue({name: "custrecord_ns_subsidiary_", label: "Subsidiary"});
					subsidiaryName = result.getText({name: "custrecord_ns_subsidiary_", label: "Subsidiary"});

					if(subsidiaryId){
						if(arrSubsidiary.indexOf(subsidiaryId)==-1){						
							arrSubsidiaryId.push({'Subsidiary_Id':subsidiaryId,'Subsidiary_Name':subsidiaryName});							
							arrSubsidiary.push(subsidiaryId);
						}
					}

					return true;
				});
				log.debug('suiteletFunction','arrSubsidiaryId=='+JSON.stringify(arrSubsidiaryId));

				if(arrSubsidiaryId){		
					for(var sb =0;sb<arrSubsidiaryId.length;sb++){
						objFldSubsidary.addSelectOption({ value: arrSubsidiaryId[sb].Subsidiary_Id, text:arrSubsidiaryId[sb].Subsidiary_Name});
					}
				}

				//-------------------------------------------------------- End - Get Subsidiaries ----------------------------------------------------------------------------//

				//if(dStartDateParamValue && dEndDateParamValue)
				{

					//var objFldBankAccount = objForm.addField({ id: 'custpage_bank_account', type: serverWidget.FieldType.SELECT, label: 'Bank Account#', source: 'account',container: 'custpage_bank_file_info' });
					var objFldBankAccount = objForm.addField({ id: 'custpage_bank_account', type: serverWidget.FieldType.SELECT, label: 'Bank Account#',container: 'custpage_bank_file_info' });
					objFldBankAccount.defaultValue = bankAccountId;
					objFldBankAccount.isMandatory = true;
					//objFldBankAccount.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});

					if(_logValidation(bankAccountParamValue) && _logValidation(bankAccountStringParamValue))
					{
						//objFldBankAccount.defaultValue = bankAccountParamValue;
						objFldBankAccount.addSelectOption({value:bankAccountParamValue,text:bankAccountStringParamValue})
					}

					/*		if(_logValidation(bankAccountId))	{
						var resultIndexSN	= 0; 
						var resultStepSN	= 1000;
						var objSearchAccount = search.create({type: "account",
							filters:
								[
									["type","anyof","Bank"], "AND", ["internalid","anyof",bankAccountId], "AND", ["isinactive","is","F"]
									],
									columns:
										[
											search.createColumn({name: "internalid"}),
											search.createColumn({name: "custrecord_bank_account_number"}),
											search.createColumn({name: "name",sort: search.Sort.ASC})
											]
						});
						do{
							var objSearchResultAccount = objSearchAccount.run().getRange({start: resultIndexSN, end: resultIndexSN + resultStepSN});

							if(objSearchResultAccount.length > 0){
								for(var s in objSearchResultAccount) {
									bankAccountNo = objSearchResultAccount[s].getValue({name: "custrecord_bank_account_number"});
								}
								// increase pointer
								resultIndexSN = resultIndexSN + resultStepSN;
							}
						} while (objSearchResultAccount.length > 0); 
					}*/

					var objFldBankAccountNo = objForm.addField({ id: 'custpage_bank_account_no', type: serverWidget.FieldType.TEXT, label: 'Bank Account No.', container: 'custpage_bank_file_info' });
					objFldBankAccountNo.defaultValue = bankAccountNo;
					objFldBankAccountNo.isMandatory = true;  
					objFldBankAccountNo.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
					if(_logValidation(bankAccountNoParamValue))
					{
						objFldBankAccountNo.defaultValue = bankAccountNoParamValue;
					}	

					var objFldBankPaymentMethod = objForm.addField({ id: 'custpage_bank_payment_method', type: serverWidget.FieldType.SELECT, label: 'Bank Payment Type#', container: 'custpage_bank_file_info' });
					objFldBankPaymentMethod.isMandatory = true;
					objFldBankPaymentMethod.addSelectOption({ value: '', text: '' });
					var PMT_JSON = get_payment_types();

					var iPaymentLimit_UPPER = 0 ;	
					var iPaymentLimit_LOWER = 0 ;	

					try{								  
						var s_PMT_DETAILS = Object.keys(PMT_JSON);	
						log.audit('SuiteletFunction','s_PMT_DETAILS**=='+s_PMT_DETAILS);
						for(var mw = 0 ;mw <s_PMT_DETAILS.length ; mw++)
						{
							try
							{
								var i_PMT_STR = PMT_JSON[s_PMT_DETAILS[mw]].pymt_method_str ; 
								log.audit('SuiteletFunction','i_PMT_STR**=='+i_PMT_STR);
								log.audit('SuiteletFunction','iPaymentMethodParamValue**=='+iPaymentMethodParamValue);
								log.audit('SuiteletFunction','s_PMT_DETAILS[mw]**=='+s_PMT_DETAILS[mw]);
								if(iPaymentMethodParamValue == s_PMT_DETAILS[mw])
								{
									iPaymentLimit = PMT_JSON[s_PMT_DETAILS[mw]].pymt_method_limit ;
									iPaymentLimit_UPPER = iPaymentLimit ;	
									iPaymentLimit_LOWER = iPaymentLimit ;	
								}						  
							}
							catch(eww){}					 
							objFldBankPaymentMethod.addSelectOption({ value: s_PMT_DETAILS[mw], text: i_PMT_STR});					   
						}			
					}
					catch(exss)
					{
						log.debug('ERROR','exss exss'+ exss);				 	
					}
				}

				var objFldStartDate = objForm.addField({ id: 'custpage_startdate', type: serverWidget.FieldType.DATE, label: 'Bill Start Date', container: 'custpage_date_filters' });
				objFldStartDate.isMandatory = true;
				var objFldEndDate = objForm.addField({ id: 'custpage_enddate', type: serverWidget.FieldType.DATE, label: 'Bill End Date', container: 'custpage_date_filters' });
				objFldEndDate.isMandatory = true;

				var objFldDueStartDate = objForm.addField({ id: 'custpage_due_startdate', type: serverWidget.FieldType.DATE, label: 'Bill Due Start Date', container: 'custpage_date_filters' });
				var objFldDueEndDate = objForm.addField({ id: 'custpage_due_enddate', type: serverWidget.FieldType.DATE, label: 'Bill Due End Date', container: 'custpage_date_filters' });

				var objFldVendorName = objForm.addField({ id: 'custpage_vendorname', type: serverWidget.FieldType.SELECT, label: 'Vendor', source: 'vendor',container: 'custpage_other_filters' });
				//objFldVendorName.addSelectOption({ value: "", text:"" });

				var objFldLocation = objForm.addField({ id: 'custpage_location', type: serverWidget.FieldType.SELECT, label: 'Location', source: 'location',container: 'custpage_other_filters' });
				//objFldLocation.addSelectOption({ value: "", text:"" });

				var objFldTotalAmount = objForm.addField({ id: 'custpage_total_transaction_value', type: serverWidget.FieldType.TEXT, label: 'Total Amount#', container: 'custpage_transaction_value' });
				objFldTotalAmount.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});

				if(_logValidation(dStartDateParamValue))
				{
					objFldStartDate.defaultValue = dStartDateParamValue;
					flag_filters = true;
				} 
				if(_logValidation(dEndDateParamValue))
				{
					objFldEndDate.defaultValue = dEndDateParamValue;
					flag_filters = true;
				}

				if(_logValidation(dDueStartDateParamValue))
				{
					objFldDueStartDate.defaultValue = dDueStartDateParamValue;
					flag_filters = true;
				} 
				if(_logValidation(dDueEndDateParamValue))
				{
					objFldDueEndDate.defaultValue = dDueEndDateParamValue;
					flag_filters = true;
				}
				if(_logValidation(vendorIdParamValue))
				{
					objFldVendorName.defaultValue = vendorIdParamValue;
					flag_filters = true;
				}
				subsidaryIdParamValue = split_data(subsidaryIdParamValue)
				if(_logValidation(subsidaryIdParamValue))
				{
					objFldSubsidary.defaultValue = subsidaryIdParamValue;
					flag_filters = true;
				}
				locationIdParamValue = split_data(locationIdParamValue)
				if(_logValidation(locationIdParamValue))
				{
					objFldLocation.defaultValue = locationIdParamValue;
					flag_filters = true;
				}
				if(_logValidation(iPaymentMethodParamValue))
				{
					objFldBankPaymentMethod.defaultValue = iPaymentMethodParamValue;
					flag_filters = true;
				}

				//--------------------------------------------------------- End - Create UI form and add Field on the form --------------------------------------------------------------------------//

				var objSublist = objForm.addSublist({ id: 'custpage_sublist', type: serverWidget.SublistType.LIST, label: 'HDFC Bank | Payment Entries' });

				objSublist.addMarkAllButtons();

				objSublist.addField({ id: 'custpage_sublist_select', type: serverWidget.FieldType.CHECKBOX, label: 'Select' });
				var objFldPaymentDate = objSublist.addField({ id: 'custpage_sublist_payment_date', type: serverWidget.FieldType.DATE, label: 'Payment Date' });
				objFldPaymentDate.updateDisplayType({displayType: serverWidget.FieldDisplayType.ENTRY});
				//objFldPaymentDate.defaultValue=convert_date(new Date());
				objFldPaymentDate.defaultValue=new Date();
				var objFldInternalIdText =  objSublist.addField({ id: 'custpage_sublist_internalidtext', type: serverWidget.FieldType.TEXT, label: 'Internal Id '});
				objFldInternalIdText.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
				var objFldInternalId = objSublist.addField({ id: 'custpage_sublist_internalid', type: serverWidget.FieldType.SELECT, label: 'Bill ', source: 'transaction' });
				objFldInternalId.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});				
				objSublist.addField({ id: 'custpage_sublist_date', type: serverWidget.FieldType.TEXT, label: 'Accounting Date' });				
				objSublist.addField({ id: 'custpage_sublist_duedate', type: serverWidget.FieldType.TEXT, label: 'Due Date ' });
				var objFldType = objSublist.addField({ id: 'custpage_sublist_transtype', type: serverWidget.FieldType.TEXT, label: 'Type' });
				objFldType.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
				var objFldDocummentNo = objSublist.addField({ id: 'custpage_sublist_documentno', type: serverWidget.FieldType.TEXTAREA, label: 'Document Number' });
				objFldDocummentNo.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
				objSublist.addField({ id: 'custpage_sublist_transactionno', type: serverWidget.FieldType.TEXTAREA, label: 'Transaction Number' });
				objSublist.addField({ id: 'custpage_sublist_vendorname', type: serverWidget.FieldType.TEXT, label:' Vendor Name' });
				var objFldAmtTobePaid=objSublist.addField({ id: 'custpage_sublist_amttobepaid', type: serverWidget.FieldType.CURRENCY, label: 'Amount To Be Paid' });
				objFldAmtTobePaid.updateDisplayType({displayType: serverWidget.FieldDisplayType.ENTRY});
				var objFldAmountDue = objSublist.addField({ id: 'custpage_sublist_amtdue', type: serverWidget.FieldType.CURRENCY, label: 'Amount Due' });
				objFldAmountDue.updateDisplayType({displayType: serverWidget.FieldDisplayType.ENTRY});
				objFldAmountDue.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
				objSublist.addField({ id: 'custpage_sublist_totalamt', type: serverWidget.FieldType.CURRENCY, label: 'Total Amount' });
				objSublist.addField({ id: 'custpage_sublist_paymentamt', type: serverWidget.FieldType.CURRENCY, label: 'Payment & Credit' });
				objSublist.addField({ id: 'custpage_sublist_tdsamt', type: serverWidget.FieldType.CURRENCY, label: 'Tax Amount' });
				objSublist.addField({ id: 'custpage_sublist_location', type: serverWidget.FieldType.TEXT, label: 'Location' });
				var objBenBbankName  =objSublist.addField({ id: 'custpage_sublist_bank_name', type: serverWidget.FieldType.TEXT, label: 'Benificiary Bank Name' });
				objBenBbankName.isMandatory = true;  
				var objBenAccountNo =objSublist.addField({ id: 'custpage_sublist_bank_acc_no', type: serverWidget.FieldType.TEXT, label: 'Benificiary Bank Account No.' });
				objBenAccountNo.isMandatory = true;  
				var objIFSCCcode = objSublist.addField({ id: 'custpage_sublist_ifsc_code', type: serverWidget.FieldType.TEXT, label: 'IFSC Code' });
				objIFSCCcode.isMandatory = true;

				/*if(iPaymentMethodParamSTR != 'HDFC')
				{
					o_ifsc_code.isMandatory = true;  
				}*/


				log.debug('onRequest:GET', ' dStartDateParamValue  -->' + dStartDateParamValue);
				log.debug('onRequest:GET', ' dEndDateParamValue  -->' + dEndDateParamValue);
				log.debug('onRequest:GET', ' subsidaryIdParamValue  -->' + subsidaryIdParamValue);
				var arrFilters = new Array();

				var arrColumns = new Array();
				arrColumns.push(search.createColumn({ name: 'internalid' }));


				if(_logValidation(dStartDateParamValue) && _logValidation(dEndDateParamValue))
				{
					arrFilters.push( search.createFilter({ name: 'trandate', operator: search.Operator.WITHIN, values: [dStartDateParamValue, dEndDateParamValue] }) );
				}
				if(_logValidation(dDueStartDateParamValue) && _logValidation(dDueEndDateParamValue)) 
				{
					arrFilters.push( search.createFilter({ name: 'duedate', operator: search.Operator.WITHIN, values: [dDueStartDateParamValue, dDueEndDateParamValue] }) );
				}
				if(_logValidation(vendorIdParamValue)) 
				{
					arrFilters.push( search.createFilter({ name: 'entity', operator: search.Operator.ANYOF, values: vendorIdParamValue }) );
				}
				if(_logValidation(subsidaryIdParamValue)) {
					arrFilters.push( search.createFilter({ name: 'subsidiary', operator: search.Operator.ANYOF, values: subsidaryIdParamValue }) );
				}
				if (_logValidation(locationIdParamValue)) {
					arrFilters.push( search.createFilter({ name: 'location', operator: search.Operator.ANYOF, values: locationIdParamValue }) );
				}

				if(vendorBillSearchId)
					var vendorbillSearchObj = search.load({ id: vendorBillSearchId });

				if (_logValidation(arrFilters)) {
					for (var flt = 0; flt < arrFilters.length; flt++) {
						vendorbillSearchObj.filters.push(arrFilters[flt]);
					}
				}

				var objSearchResult = vendorbillSearchObj.run().getRange({ start: 0, end: 1000 });
				log.debug('onRequest:GET', ' HDFC to NS Search Results  -->' + objSearchResult);
				log.debug('onRequest:GET', ' HDFC to NS flag_filters  -->' + flag_filters);

				var counter = 0;

				if(_logValidation(objSearchResult) && (flag_filters == true)) 
				{
					getPaymentsCreditAppliedData(creditpaymentAppliedSearchId,dStartDateParamValue, dEndDateParamValue ,dDueStartDateParamValue ,dDueEndDateParamValue ,vendorIdParamValue ,subsidaryIdParamValue ,locationIdParamValue);

					for(var i = 0; i < objSearchResult.length; i++) {
						// .run().each has a limit of 4,000 results

						var recordType = objSearchResult[i].getValue({name: "type"});
						var recordID = objSearchResult[i].getValue({ name: "internalid"});
						var locationName = objSearchResult[i].getText({ name: "location"});
						var recordDate = objSearchResult[i].getValue({ name: "trandate"});
						var recordDueDate = objSearchResult[i].getValue({ name: "duedate"});
						var recordDocNo = objSearchResult[i].getValue({ name: "tranid"});
						var recordTransNo=objSearchResult[i].getValue({ name: "transactionnumber"});
						var beneficiayBankName=objSearchResult[i].getValue({ name: "transactionnumber"});
						var recordTransNo=objSearchResult[i].getValue({ name: "transactionnumber"});
						//var beneficiaryBankName = objSearchResult[i].getValue({ name: "custentity_bank_account_no", join: "vendor", label: "Beneficiary Account No" });
						//var vendorName = objSearchResult[i].getValue({ name: "altname", join: "vendor"});
						//var vendorCode = objSearchResult[i].getValue({name: "formulatext",formula: "{vendor.entityid}"});
						var vendorName = objSearchResult[i].getText({ name: "entity"});
						var tdsAmount =  objSearchResult[i].getValue({ name: "taxtotal"});
						tdsAmount = Math.abs(tdsAmount);
						var recordAmount = objSearchResult[i].getValue({ name: "total"});
						if(recordType == 'VPrep'){
							recordAmount = Math.abs(recordAmount);
						}
						//var recordLocation=objSearchResult[i].getText({ name: "location"});

						var beneficiaryBankName = objSearchResult[i].getValue({ name: "custentity_bank_name", join: "vendor", label: "Bank Name" });
						var beneficiaryBankIFSCCode = objSearchResult[i].getValue({ name: "custentity_sort_code_ifsc_code", join: "vendor", label: "Bank IFSC Code" });
						var beneficiaryBankAccountNo = objSearchResult[i].getValue({ name: "custentity_bank_account_no", join: "vendor", label: "Bank Account No" });

						log.debug('onRequest:GET', ' beneficiaryBankName  -->' + beneficiaryBankName);
						log.debug('onRequest:GET', ' beneficiaryBankIFSCCode  -->' + beneficiaryBankIFSCCode);
						log.debug('onRequest:GET', ' beneficiaryBankAccountNo  -->' + beneficiaryBankAccountNo);
						log.debug('onRequest:GET', ' recordType  -->' + recordType);
						log.debug('onRequest:GET', ' recordID  -->' + recordID);
						log.debug('onRequest:GET', ' locationName  -->' + locationName);
						log.debug('onRequest:GET', ' recordDate  -->' + recordDate);
						log.debug('onRequest:GET', ' recordDueDate  -->' + recordDueDate);						
						log.debug('onRequest:GET', ' recordDocNo  -->' + recordDocNo);
						log.debug('onRequest:GET', ' recordTransNo  -->' + recordTransNo);
						log.debug('onRequest:GET', ' vendorName  -->' + vendorName);
						log.debug('onRequest:GET', ' tdsAmount  -->' + tdsAmount);
						log.debug('onRequest:GET', ' recordAmount  -->' + recordAmount);

						var paidAmount=0;
						try{
							paidAmount = PAYMENTS_CREDIT_APPLIED_ARR[recordID].payingamount ;
						}
						catch(excdd){
							paidAmount = 0 ;
						}

						if(recordType == 'VPrep')
						{
							try{
								paidAmount = VEND_AMT_ARR[recordID].vend_p_amt ;
								if(paidAmount){
									paidAmount=paidAmount.toFixed(2);
								}
							}
							catch(excdd){
								paidAmount = 0 ;
							}					
						}			 

						log.debug('onRequest:GET', ' paidAmount  -->' + paidAmount);

						var amountToBePaid = parseFloat(recordAmount) - parseFloat(paidAmount);
						if(amountToBePaid){
							amountToBePaid =amountToBePaid.toFixed(2);
						}
						log.debug('onRequest:GET', ' amountToBePaid -->' + amountToBePaid);						

						log.debug('onRequest:Get()','iPaymentLimit_LOWER=='+iPaymentLimit_LOWER);
						log.debug('onRequest:Get()','iPaymentMethodParamSTR=='+iPaymentMethodParamSTR);

						if((parseFloat(recordAmount) <= parseFloat(iPaymentLimit_LOWER)) && (iPaymentMethodParamSTR == 'NEFT') && (parseFloat(recordAmount) > 0))
						{
							if(_logValidation(recordID))	{
								objSublist.setSublistValue({ id: 'custpage_sublist_internalidtext', line: counter, value: recordID });
								objSublist.setSublistValue({ id: 'custpage_sublist_internalid', line: counter, value: recordID });
							}
							if(_logValidation(recordType)){
								objSublist.setSublistValue({ id: 'custpage_sublist_transtype', line: counter, value: recordType });
							}
							if(_logValidation(locationName)){
								objSublist.setSublistValue({ id: 'custpage_sublist_location', line: counter, value: locationName });
							}
							if(_logValidation(recordDate)){
								objSublist.setSublistValue({ id: 'custpage_sublist_date', line: counter, value: recordDate });
							}
							if(_logValidation(recordDueDate)){
								objSublist.setSublistValue({ id: 'custpage_sublist_duedate', line: counter, value: recordDueDate });
							}
							if (_logValidation(recordDocNo)){
								objSublist.setSublistValue({ id: 'custpage_sublist_documentno', line: counter, value: recordDocNo });
							}
							if(_logValidation(recordTransNo)){
								objSublist.setSublistValue({ id: 'custpage_sublist_transactionno', line: counter, value: recordTransNo });
							}
							if(_logValidation(vendorName)){
								objSublist.setSublistValue({ id: 'custpage_sublist_vendorname', line: counter, value: vendorName });
							}				
							if(_logValidation(recordAmount)){ recordAmount = recordAmount ; } else { recordAmount = 0 ; }

							if(_logValidation(amountToBePaid)){
								objSublist.setSublistValue({ id: 'custpage_sublist_amttobepaid', line: counter, value: amountToBePaid });
								objSublist.setSublistValue({ id: 'custpage_sublist_amtdue', line: counter, value: amountToBePaid });
							}
							if(paidAmount){
								objSublist.setSublistValue({ id: 'custpage_sublist_paymentamt', line: counter, value: paidAmount });
							}						
							if(tdsAmount){
								objSublist.setSublistValue({ id: 'custpage_sublist_tdsamt', line: counter, value: tdsAmount });
							}
							if(recordAmount){
								objSublist.setSublistValue({ id: 'custpage_sublist_totalamt', line: counter, value: recordAmount });
							}
							if(beneficiaryBankName){
								objSublist.setSublistValue({ id: 'custpage_sublist_bank_name', line: counter, value: beneficiaryBankName });
							}
							if(beneficiaryBankIFSCCode){
								objSublist.setSublistValue({ id: 'custpage_sublist_ifsc_code', line: counter, value: beneficiaryBankIFSCCode });
							}
							if(beneficiaryBankAccountNo){
								objSublist.setSublistValue({ id: 'custpage_sublist_bank_acc_no', line: counter, value: beneficiaryBankAccountNo });
							}
							counter++;
						}

						if(parseFloat(recordAmount) > parseFloat(iPaymentLimit_LOWER) && (iPaymentMethodParamSTR == 'RTGS')&& (parseFloat(recordAmount) > 0))
						{
							if(_logValidation(recordID))	{
								objSublist.setSublistValue({ id: 'custpage_sublist_internalidtext', line: counter, value: recordID });
								objSublist.setSublistValue({ id: 'custpage_sublist_internalid', line: counter, value: recordID });
							}
							if(_logValidation(recordType)){
								objSublist.setSublistValue({ id: 'custpage_sublist_transtype', line: counter, value: recordType });
							}
							if(_logValidation(locationName)){
								objSublist.setSublistValue({ id: 'custpage_sublist_location', line: counter, value: locationName });
							}
							if(_logValidation(recordDate)){
								objSublist.setSublistValue({ id: 'custpage_sublist_date', line: counter, value: recordDate });
							}
							if(_logValidation(recordDueDate)){
								objSublist.setSublistValue({ id: 'custpage_sublist_duedate', line: counter, value: recordDueDate });
							}
							if (_logValidation(recordDocNo)){
								objSublist.setSublistValue({ id: 'custpage_sublist_documentno', line: counter, value: recordDocNo });
							}
							if(_logValidation(recordTransNo)){
								objSublist.setSublistValue({ id: 'custpage_sublist_transactionno', line: counter, value: recordTransNo });
							}
							if(_logValidation(vendorName)){
								objSublist.setSublistValue({ id: 'custpage_sublist_vendorname', line: counter, value: vendorName });
							}				
							if(_logValidation(recordAmount)){ recordAmount = recordAmount ; } else { recordAmount = 0 ; }

							if(_logValidation(amountToBePaid)){
								objSublist.setSublistValue({ id: 'custpage_sublist_amttobepaid', line: counter, value: amountToBePaid });
								objSublist.setSublistValue({ id: 'custpage_sublist_amtdue', line: counter, value: amountToBePaid });
							}
							if(paidAmount){
								objSublist.setSublistValue({ id: 'custpage_sublist_paymentamt', line: counter, value: paidAmount });
							}						
							if(tdsAmount){
								objSublist.setSublistValue({ id: 'custpage_sublist_tdsamt', line: counter, value: tdsAmount });
							}
							if(recordAmount){
								objSublist.setSublistValue({ id: 'custpage_sublist_totalamt', line: counter, value: recordAmount });
							}
							if(beneficiaryBankName){
								objSublist.setSublistValue({ id: 'custpage_sublist_bank_name', line: counter, value: beneficiaryBankName });
							}
							if(beneficiaryBankIFSCCode){
								objSublist.setSublistValue({ id: 'custpage_sublist_ifsc_code', line: counter, value: beneficiaryBankIFSCCode });
							}
							if(beneficiaryBankAccountNo){
								objSublist.setSublistValue({ id: 'custpage_sublist_bank_acc_no', line: counter, value: beneficiaryBankAccountNo });
							}
							counter++;
						}
					}	
					objForm.addSubmitButton({ id: 'process', label: 'Proceed To Generate File', functionName: 'process()' });
				}

				objForm.addButton({ id: 'search', label: 'Apply Criteria', functionName: 'searchlist()' });
				objForm.addButton({ id: 'refresh', label: 'Reset', functionName: 'refresh()' });
				objForm.addButton({ id: 'payment_total', label: 'Payment Total', functionName: 'payment_total()' });
				objForm.addButton({id:'export_csv', label:'Export CSV', functionName:'exportCSV()'});
				
				context.response.writePage(objForm);

				log.debug('onRequest:Get()','----------------------------------------- execution Ends here ------------------------------------------------------');
			}
			catch(e){
				var errString =  'Error :' + e.name + ' : ' + e.type + ' : ' + e.message;
				log.error({ title: 'onRequest:GET()', details: errString });
			}

		} //else if (context.request.method == 'POST') {
		else {

			try{
				log.debug('onRequest:Post()','----------------------------------------- Execution Starts Here ------------------------------------------------------');

				var arrSelectedBillId = new Array();
				var AMOUNT_ID_ARR = {};
				var PAYMENT_DATE_ARR={};

				var getUserId = context.request.parameters.custpage_userid;
				log.debug('onRequest:Post()','getUserId=='+getUserId);

				var susbsidiaryId = context.request.parameters.custpage_subsidary;
				log.debug('onRequest:Post()','susbsidiaryId=='+susbsidiaryId);

				var getTransmissionDate = context.request.parameters.custpage_transmissiondate;
				log.debug('onRequest:Post()','getTransmissionDate=='+getTransmissionDate);

				var getBankAccount = context.request.parameters.custpage_bank_account;
				log.debug('onRequest:Post()','getBankAccount=='+getBankAccount);

				var getBankAccountNo = context.request.parameters.custpage_bank_account_no;
				log.debug('onRequest:Post()','getBankAccountNo=='+getBankAccountNo);

				var getBankPaymentMethod = context.request.parameters.custpage_bank_payment_method;
				log.debug('onRequest:Post()','getBankPaymentMethod=='+getBankPaymentMethod);

				var sublistLineCount = context.request.getLineCount({ group: 'custpage_sublist' });
				log.debug('onRequest:Post()','sublistLineCount=='+sublistLineCount);

				if (_logValidation(sublistLineCount)) {

					for (var k = 0; k < sublistLineCount; k++) { 

						var bCheckboxValue = context.request.getSublistValue({ group: 'custpage_sublist', name: 'custpage_sublist_select', line: k });
						log.debug('onRequest:Post()','bCheckboxValue=='+bCheckboxValue);
						var getBillId = context.request.getSublistValue({group: 'custpage_sublist',name: 'custpage_sublist_internalidtext',line: k});  
						log.debug('onRequest:Post()','getBillId=='+getBillId);
						var getAmountToBePaid = context.request.getSublistValue({group: 'custpage_sublist',name: 'custpage_sublist_amttobepaid',line: k}); 
						log.debug('onRequest:Post()','getAmountToBePaid=='+getAmountToBePaid);
						var getpaymentDate = context.request.getSublistValue({group: 'custpage_sublist',name: 'custpage_sublist_payment_date',line: k}); 
						log.debug('onRequest:Post()','getAmountToBePaid=='+getAmountToBePaid);

						if (bCheckboxValue == 'T') {
							arrSelectedBillId.push(getBillId);
							AMOUNT_ID_ARR[getBillId] = {"amount_to_be_paid" :getAmountToBePaid};
							PAYMENT_DATE_ARR[getBillId] = {"payment_date" :getpaymentDate};
						}
					}
				}
				log.debug('onRequest:Post()','arrSelectedBillId=='+arrSelectedBillId);
				log.debug('onRequest:Post()','AMOUNT_ID_ARR=='+JSON.stringify(AMOUNT_ID_ARR));

				//----------------------------------------------------------- Start - Call the Map/Reduce Script to create Bank details Custom record and bank payment file ------------------------------------------//
				var objScriptTask = task.create({ taskType: task.TaskType.MAP_REDUCE });
				objScriptTask.scriptId = 'customscript_mr_yil_hdfc_ns_outpay_file';
				objScriptTask.deploymentId = null;
				objScriptTask.params = {
						'custscript_recordid_array': arrSelectedBillId.toString(),
						'custscript_transmission_date_': getTransmissionDate,
						'custscript_user_': getUserId ,
						'custscript_account_' : getBankAccount	 ,
						'custscript_bnk_pmt_method_' : getBankPaymentMethod,
						'custscript_account__no_' : getBankAccountNo ,
						'custscript_amount_id_arr' : AMOUNT_ID_ARR ,
						'custscript_subsidiary_id_': susbsidiaryId,
						'custscript_payment_date_arr_':PAYMENT_DATE_ARR
				};
				var taskSubmitId = objScriptTask.submit();
				log.debug('onRequest:Post()','Script Scheduled ...taskSubmitId =='+taskSubmitId);
				//----------------------------------------------------------- End - Call the Map/Reduce Script to create Bank details Custom record and bank payment file ------------------------------------------//

				//Redirect to main suitelet criteria UI Page
				redirect.toSuitelet({scriptId: 'customscript_su_hdfc_ns_gen_outpaymt_fil' , deploymentId:'customdeploy_su_hdfc_ns_gen_outpaymt_fil',parameters : null});
			}
			catch(e){
				var errString =  'Error :' + e.name + ' : ' + e.type + ' : ' + e.message;
				log.error({ title: 'onRequest:POST()', details: errString });
			}
			log.debug('onRequest:Post()','----------------------------------------- Execution Ends Here ------------------------------------------------------');
		}

	}

	function get_payment_types()
	{
		var PMT_JSON = {};	
		try
		{
			var customrecord_hdfc_payment_typesSearchObj = search.create({
				type: "customrecord_hdfc_payment_types",
				filters:
					[
						["isinactive","is","F"]
						],
						columns:
							[
								search.createColumn({name: "name",sort: search.Sort.ASC,label: "Name" }),
								search.createColumn({name: "id", label: "ID"}),
								search.createColumn({name: "custrecord_hpt_payment_method", label: "Payment Method"}),
								search.createColumn({name: "custrecord_hpt_limit", label: "Limit"})
								]
			});
			var searchResultCount = customrecord_hdfc_payment_typesSearchObj.runPaged().count;
			log.debug("customrecord_hdfc_payment_typesSearchObj result count",searchResultCount);
			customrecord_hdfc_payment_typesSearchObj.run().each(function(result){

				var i_PMT_METHOD_ID  = result.getValue({name : 'custrecord_hpt_payment_method'});
				var i_PMT_METHOD_STR = result.getText({name : 'custrecord_hpt_payment_method'});
				var i_PMT_LIMIT      = result.getValue({name : 'custrecord_hpt_limit'});

				PMT_JSON[i_PMT_METHOD_ID] = {"pymt_method_id" : i_PMT_METHOD_ID , "pymt_method_str" : i_PMT_METHOD_STR, "pymt_method_limit" : i_PMT_LIMIT};
				return true;
			});
		}	
		catch(excdd)
		{
			log.debug('get_payment_types', ' Exception Caught  -->' + excdd);   
		}
		return PMT_JSON ;	

	}	

	function split_data(data_q)
	{
		var a_data_ARR = new Array();	
		if(_logValidation(data_q))
		{	 
			var i_data_TT = new Array();
			i_data_TT =  data_q.toString();

			if(_logValidation(i_data_TT))
			{
				for(var dt=0;dt<i_data_TT.length;dt++)
				{
					a_data_ARR = i_data_TT.split(',');
					break;				
				}	
			}//Data TT   
		}	  
		return a_data_ARR ;
	}
	function convert_date(d_date)
	{
		var d_date_convert = "" ;	

		if(_logValidation(d_date))
		{
			var currentTime = new Date(d_date);
			var currentOffset = currentTime.getTimezoneOffset();
			var ISTOffset = 330;   // IST offset UTC +5:30 
			d_date_convert = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);

		}	
		return d_date_convert; 
	}

	function _logValidation(value) {
		if (value != null && value != '' && value != undefined && value.toString() != 'NaN' && value != NaN) {
			return true;
		} else {
			return false;
		}
	}


	function getPaymentsCreditAppliedData(creditpaymentAppliedSearchId,dStartDateParamValue, dEndDateParamValue ,dDueStartDateParamValue ,dDueEndDateParamValue ,vendorIdParamValue ,subsidaryIdParamValue ,locationIdParamValue)
	{
		try
		{
			log.debug('getPaymentsCreditAppliedData()','----------------------------------------- Execution Starts Here ------------------------------------------------------');
			var arrFiltersApplied = new Array();

			var arrColumnsApplied = new Array();
			arrColumnsApplied.push(search.createColumn({ name: 'internalid' }));

			if(_logValidation(dStartDateParamValue) && _logValidation(dEndDateParamValue)) 
			{
				arrFiltersApplied.push( search.createFilter({ name: 'trandate', operator: search.Operator.WITHIN, values: [dStartDateParamValue, dEndDateParamValue] }) );
			}

			if(_logValidation(dDueStartDateParamValue) && _logValidation(dDueEndDateParamValue)) 
			{
				arrFiltersApplied.push( search.createFilter({ name: 'duedate', operator: search.Operator.WITHIN, values: [dDueStartDateParamValue, dDueEndDateParamValue] }) );
			}
			if(_logValidation(vendorIdParamValue)) 
			{
				arrFiltersApplied.push( search.createFilter({ name: 'entity', operator: search.Operator.ANYOF, values: vendorIdParamValue }) );
			}
			if(_logValidation(subsidaryIdParamValue)) {
				arrFiltersApplied.push( search.createFilter({ name: 'subsidiary', operator: search.Operator.ANYOF, values: subsidaryIdParamValue }) );
			}
			if (_logValidation(locationIdParamValue)) {
				arrFiltersApplied.push( search.createFilter({ name: 'location', operator: search.Operator.ANYOF, values: locationIdParamValue }) );
			}

			if(_logValidation(creditpaymentAppliedSearchId))
				var vendorbillSearchObj = search.load({ id: creditpaymentAppliedSearchId });

			if (_logValidation(arrFiltersApplied)) {
				for (var idx = 0; idx < arrFiltersApplied.length; idx++) {
					vendorbillSearchObj.filters.push(arrFiltersApplied[idx]);
				}
			}
			var objSearchResultApplied = vendorbillSearchObj.run().getRange({ start: 0, end: 1000 });

			if(_logValidation(objSearchResultApplied)) 
			{
				//	log.debug('getPaymentsCreditAppliedData', ' Vendor Credit & Payments Applied  -->' + objSearchResultApplied.length);

				for(var i = 0; i < objSearchResultApplied.length; i++) 
				{					
					var i_recordID_WXXX = objSearchResultApplied[i].getValue({name: "internalid" ,summary: "GROUP",sort: search.Sort.ASC}); 

					var i_paying_amount = objSearchResultApplied[i].getValue({name: "payingamount" ,summary: "SUM"}); 

					PAYMENTS_CREDIT_APPLIED_ARR[i_recordID_WXXX] = {"payingamount" :i_paying_amount};			

				}
			}				

		}  
		catch(excw)
		{
			log.debug('getPaymentsCreditAppliedData', ' Exception Caught  -->' + excw); 
		}	
		log.debug('getPaymentsCreditAppliedData','----------------------------------------- Execution Ends Here ------------------------------------------------------');
	}

	return {
		onRequest: onRequest
	};
});