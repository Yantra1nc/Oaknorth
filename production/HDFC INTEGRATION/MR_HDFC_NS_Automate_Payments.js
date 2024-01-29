/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
//GetInputData : 10000 Units
//Map : 1000 Units
//Reduce : 5000 Units
//Summary : 10000 Units

define(['N/record', 'N/search', 'N/runtime', 'N/email', 'N/format', 'N/file', 'N/task', 'N/sftp', 'N/encode','N/config'],

		function(record, search, runtime, email, format, file, task, sftp, encode,config){

	function getInputData(context){
		var return_val = {};
		try
		{
			var arrTemp = [];
			var MODULE_FOLDER = 93228;
			var message_txt = "";
			var sucessString = "";
			var s_success_flag = "";

			var JSON_FL = {};

			//--------------------------------------------Start -  Connection to SFTP ------------------------------------------------------------ //
			var o_contextOBJ = runtime.getCurrentScript();
			log.debug('getInputData', ' Context OBJ --> ' + o_contextOBJ);

			var fileId = o_contextOBJ.getParameter({name: 'custscript_file_ns_x'});
			log.debug('getInputData',' fileId --> '+fileId);	

			var file_status = o_contextOBJ.getParameter({name: 'custscript_file_ns_status'});
			log.debug('getInputData',' file_status --> '+file_status);

			var fileContent = ""; 

			var fileContent = file.load(parseInt(fileId)).getContents().split("\n");		
			log.debug('getInputData',' fileContent --> '+fileContent);

			if(_logValidation(fileContent))
			{
				for(var t_q = 0 ; t_q < fileContent.length ; t_q++)
				{
					if(_logValidation(fileContent[t_q]))
					{
						JSON_FL[t_q]={"file_content":fileContent[t_q]};	
					}
				}
			}

		}//TRY
		catch(ex)
		{
			log.debug("ERROR",'Exception '+ex);	
		}//CATCH
		return JSON_FL;		
	}	
	function map(context) 
	{
		try
		{
			log.debug("---Map-----");

			var o_contextOBJ = runtime.getCurrentScript();
			var fileId = o_contextOBJ.getParameter({name: 'custscript_file_ns_x'});
			log.debug('map',' fileId --> '+fileId);

			var file_status_X = o_contextOBJ.getParameter({name: 'custscript_file_ns_status'});
			log.debug('map',' file_status_X --> '+file_status_X);		   

			var key = context.key
			log.debug("map", 'key -->'+key);

			var value = JSON.parse(context.value);
			log.debug("map", 'Value -->'+value);

			log.debug("map", 'Value String -->'+JSON.stringify(value));

			if(_logValidation(value))
			{
				try {

					var a_result_GP = get_global_parameters();
					var i_SFTP_user_name_GP        = a_result_GP['sftp_user_name_gp'];	
					var i_password_guid_GP         = a_result_GP['password_guid_gp'];					
					var i_SFTP_server_URL_GP       = a_result_GP['sftp_server_url_gp'];
					var i_SFTP_host_key_GP         = a_result_GP['sftp_host_key_gp']; 		 		  			 		   
					var i_SFTP_host_key_type_GP    = a_result_GP['sftp_host_key_type_gp'];
					var i_SFTP_directory 		     = a_result_GP['i_SFTP_directory_GP'];
					var i_SFTP_port 				 = a_result_GP['i_SFTP_port_GP'];
					// var hdfc_folder_id 			 = a_result_GP['hdfc_folder_id'];


					log.debug('map',' SFTP Host-Key --> '+i_SFTP_host_key_GP);	
					log.debug('map',' SFTP URL --> '+i_SFTP_server_URL_GP);	
					log.debug('map',' SFTP User Name --> '+i_SFTP_user_name_GP);	
					log.debug('map',' SFTP Password Guid --> '+i_password_guid_GP);	
					log.debug('map',' SFTP i_SFTP_host_key_type_GP  --> '+i_SFTP_host_key_type_GP);	
					log.debug('map',' SFTP i_SFTP_directory  --> '+i_SFTP_directory);	
					log.debug('map',' SFTP i_SFTP_port  --> '+i_SFTP_port);    



				}
				catch (excsw) {
					log.debug("map() ERROR EXCEPTION", 'excsw -->' + excsw);
				}

				value = value.file_content;
				log.debug("map", 'Value AZZZ -->'+value);

				if(value) 
				{
					var configRecObj	= config.load({type: config.Type.USER_PREFERENCES});
					var dateFormatValue	= configRecObj.getValue({fieldId: 'DATEFORMAT'});
					log.debug("map",'dateFormatValue=='+dateFormatValue);

					var fileContent = value.toString().split("\n");
					log.debug("map",'fileContent=='+fileContent);
					log.debug("map","fileContent.length=="+fileContent.length);

					for(var k = 0; k < fileContent.length; k++) {

						var Loadresult = fileContent[k].split(",");	
						log.debug("map","Loadresult=="+Loadresult);

						var reversalTransactionType = Loadresult[0];
						log.debug("map","reversalTransactionType=="+reversalTransactionType);
						var reversalBeneficiaryCode = Loadresult[1];
						log.debug("map","reversalBeneficiaryCode=="+reversalBeneficiaryCode);
						var reversalBeneficiaryName = Loadresult[2];
						log.debug("map","reversalBeneficiaryName=="+reversalBeneficiaryName);
						var reversalInstrumentAmount = Loadresult[3];
						log.debug("map","reversalInstrumentAmount=="+reversalInstrumentAmount);
						var reversalChequeNo = Loadresult[4];
						log.debug("map","reversalChequeNo=="+reversalChequeNo);
						var chequeTransactionDateReversal = Loadresult[5];
						log.debug("map","chequeTransactionDateReversal=="+chequeTransactionDateReversal);
						var Bene_Name_BankStatement = Loadresult[6];
						log.debug("map","Bene_Name_BankStatement=="+Bene_Name_BankStatement);						
						var reversalUniqueCustRefNo = Loadresult[7];
						log.debug("map","reversalUniqueCustRefNo=="+reversalUniqueCustRefNo);
						var reversalPaymentDetails2 = Loadresult[8];
						log.debug("map","reversalPaymentDetails2=="+reversalPaymentDetails2);						
						var reversalBeneficiaryAccountNo = Loadresult[9];
						log.debug("map","reversalBeneficiaryAccountNo=="+reversalBeneficiaryAccountNo);
						var reversalBankRefNo = Loadresult[10];
						log.debug("map","reversalBankRefNo=="+reversalBankRefNo);
						var reversalTransactionStatus = Loadresult[11];
						log.debug("map","reversalTransactionStatus=="+reversalTransactionStatus);
						var reversalRejectReason = Loadresult[12];
						log.debug("map","reversalRejectReason=="+reversalRejectReason);
						var reversalIFSCCode = Loadresult[13];						
						log.debug("map","reversalIFSCCode=="+reversalIFSCCode);
						var reversalMICRCode = Loadresult[14];
						log.debug("map","reversalMICRCode=="+reversalMICRCode);
						var reversalRTGSUTRNo = Loadresult[15];
						log.debug("map","reversalRTGSUTRNo=="+reversalRTGSUTRNo);

						if(reversalRTGSUTRNo){
							reversalRTGSUTRNo = reversalRTGSUTRNo;
						}
						else if(!reversalRTGSUTRNo && reversalBankRefNo){
							reversalRTGSUTRNo = reversalBankRefNo
						}

						if(file_status_X == "REJECT")
						{
							var reversalUniqueCustRefNo = Loadresult[7];
							var reject_reason = Loadresult[12];							
						}

						log.debug("execute","reversalUniqueCustRefNo -->"+ reversalUniqueCustRefNo);
						log.debug("execute","reject_reason -->"+ reject_reason);


						log.debug("execute","reversalRTGSUTRNo -->"+ reversalRTGSUTRNo);
						log.debug("execute","reversalTransactionStatus -->"+ reversalTransactionStatus);
						log.debug("execute","reversalUniqueCustRefNo -->"+ reversalUniqueCustRefNo);

						var resultArray = getFileUniqueRefNumber(reversalUniqueCustRefNo)
						log.debug("execute","resultArray=="+resultArray);

						if(resultArray) 
						{
							var vb_id = resultArray[0];
							var paymentMethod = resultArray[1] ;
							var bankDetailsRecordId = resultArray[2] ;
							var pymt_amount = resultArray[3] ;
							var tran_type = resultArray[4] ;
							var bankAccountId = resultArray[5];
							var bankIntegrationLogId = resultArray[6];

							var netAmountReversal = pymt_amount ;

							log.debug("execute","tran_type=="+tran_type);

							log.debug("execute","vb_id=="+vb_id);
							log.debug("execute","paymentMethod=="+paymentMethod);
							log.debug("execute","bankDetailsRecordId=="+bankDetailsRecordId);
							log.debug("execute","netAmountReversal=="+netAmountReversal);

							if(tran_type == 'Vendor Prepayment')
							{
								var record_type = 'vendorprepayment'
							}
							if(tran_type == 'Expense Report')
							{
								var record_type = 'expensereport'
							}
							if(tran_type == 'Vendor Bill')
							{
								var record_type = 'vendorbill'
							}

							if(_logValidation(vb_id))
							{										
								try {
									var i_VP_submitID ="";

									var objVBRecord = record.load({ type: record_type, id: vb_id, });

									var i_location = objVBRecord.getValue('location');
									var i_class = objVBRecord.getValue('class');
									var i_department = objVBRecord.getValue('department');
									var vbMemo = objVBRecord.getValue('memo');

									if(_logValidation(reversalRTGSUTRNo) && reversalTransactionStatus == 'E'  && (record_type!= 'vendorprepayment')&&(file_status_X != "REJECT")) 
									{
										try {

											var objVendPaymentRecord = record.transform({ fromType: record_type, fromId: vb_id, toType: "vendorpayment", isDynamic: true, });

											if(vbMemo){
												objVendPaymentRecord.setValue("memo", vbMemo);
											}
											if(_logValidation(i_department)) {
												objVendPaymentRecord.setValue("department", i_department);
											}															
											if(_logValidation(i_class)) {
												objVendPaymentRecord.setValue("class", i_class);
											}
											if(_logValidation(i_location)) {
												objVendPaymentRecord.setValue("location", i_location);
											}
											if(reversalBeneficiaryAccountNo){
												objVendPaymentRecord.setValue("account", bankAccountId);
											}
											objVendPaymentRecord.setValue("approvalstatus", 2);////2-Approved//set Default
											/*if(reversalChequeNo){
												objVendPaymentRecord.setValue("custbody16",reversalChequeNo);
											}*/

											if(chequeTransactionDateReversal){
												/*var fomatted_parsedDate = format.format({value:chequeTransactionDateReversal, type: format.Type.DATE});
												log.debug('TestLog','fomatted_parsedDate==' + fomatted_parsedDate );
												var parsedDate = format.parse({value:chequeTransactionDateReversal, type: format.Type.DATE});
												log.debug('TestLog','parsedDate==' + parsedDate );*/

												var formatedDate = getDateFormat(chequeTransactionDateReversal,dateFormatValue);
												log.debug('TestLog','formatedDate==' + formatedDate )
												var DateValue= format.parse({value:formatedDate, type: format.Type.DATE})
												log.debug('TestLog','DateValue==' + DateValue )

												objVendPaymentRecord.setValue("trandate", DateValue);
											}											
											if(reversalRTGSUTRNo){															
												objVendPaymentRecord.setValue("custbody16", reversalRTGSUTRNo);	
												objVendPaymentRecord.setValue("custbody_hdfc_utr_number", reversalRTGSUTRNo);
											}

											if(reversalTransactionType){
												var paymentMethodId = getPaymentMethodId(reversalTransactionType)
												if(paymentMethodId){
													objVendPaymentRecord.setValue("custbody_mop", paymentMethodId);
												}
											}

											var applyLineCount = objVendPaymentRecord.getLineCount({ sublistId: 'apply' });
											log.debug('applyLineCount' + applyLineCount + 'recordId' + vb_id);

											var amountToAdjust =0;
											if(netAmountReversal && netAmountReversal>0){
												amountToAdjust = netAmountReversal;
											}
											else{
												amountToAdjust=0;
											}

											for(var j = 0; j < applyLineCount; j++) {

												objVendPaymentRecord.selectLine({ sublistId: 'apply', line: j });

												var depositAmt = objVendPaymentRecord.getCurrentSublistValue({ sublistId: 'apply', fieldId: 'amount', });
												log.debug("execute","depositAmt=="+depositAmt);
												if(Number(depositAmt) >= Number(amountToAdjust)) {
													objVendPaymentRecord.setCurrentSublistValue({ sublistId: 'apply', fieldId: 'apply', value: true, });
													objVendPaymentRecord.setCurrentSublistValue({ sublistId: 'apply', fieldId: 'amount', value: amountToAdjust, });
												}
												if(Number(depositAmt) < Number(amountToAdjust)) {
													objVendPaymentRecord.setCurrentSublistValue({ sublistId: 'apply', fieldId: 'apply', value: true, });
													objVendPaymentRecord.setCurrentSublistValue({ sublistId: 'apply', fieldId: 'amount', value: depositAmt, });
												}
												objVendPaymentRecord.commitLine({sublistId:'apply'});
												amountToAdjust = Number(amountToAdjust) - Number(depositAmt);
												//log.audit('amountToAdjust',amountToAdjust)
												if(amountToAdjust <= 0) {
													break;
												}
											}
											i_VP_submitID = objVendPaymentRecord.save({ enableSourcing: false, ignoreMandatoryFields: true });
											log.audit('execute', 'i_VP_submitID-->' + i_VP_submitID);
										}
										catch (excww) {
											log.error('execute', 'Exception Caught in Vendor Payment Creation -->' + excww);
											i_VP_submitID = "";
										}
									}

									if(_logValidation(i_VP_submitID) && (reversalTransactionStatus == 'E')) 
									{
										var is_payment_done = true;
										var file_status = 1;
									}
									else if((reversalTransactionStatus == 'E') && (record_type == 'vendorprepayment'))
									{
										var is_payment_done = true;
										var file_status = 1;
										var i_VP_submitID = vb_id ;
									}
									else {
										var is_payment_done = false
										var file_status = 3;
									}


									if(i_VP_submitID && (file_status_X != "REJECT")) 
									{

										var bankDetailsSubmitID = record.submitFields({type: "customrecord_hdfc_bank_details",id: bankDetailsRecordId,values: {custrecord_hbd_utr_number: reversalRTGSUTRNo,
											custrecord_hbd_vendor_payment:i_VP_submitID},
											options: {enableSourcing: true,ignoreMandatoryFields: true}
										});
										log.debug('execute', ' bankDetailsSubmitID -->' + bankDetailsSubmitID);

										try {
											//var i_logs_id = get_logs_id(vb_id);
											var i_logs_id = bankIntegrationLogId;
											log.debug('execute', ' i_logs_id -->' + i_logs_id);

											if(_logValidation(i_logs_id)) {
												var  bankIntegrationLogSubmitID = record.submitFields({ type: "customrecord_bank_integration_logs", id: i_logs_id, 
													values: { 
														custrecord_bil_reversal_file: fileId, 
														custrecord_bil_status: file_status, 
													},
													options: { enableSourcing: true, ignoreMandatoryFields: true }
												});
												log.debug('execute', ' bankIntegrationLogSubmitID -->' + bankIntegrationLogSubmitID);
											}
										}
										catch (exwqnh) {
											log.error('execute','Exception Caught ... -->' + exwqnh);
										}
									}   
									if((file_status_X == "REJECT"))
									{  

										var bankDetailsSubmitID = record.submitFields({type: "customrecord_hdfc_bank_details",id: bankDetailsRecordId,values: {custrecord_hbd_rejection_reason: reject_reason,},
											options: {enableSourcing: true,ignoreMandatoryFields: true}
										});
										log.debug('execute', ' bankDetailsSubmitID -->' + bankDetailsSubmitID);

										try {
											//var i_logs_id = get_logs_id(vb_id);
											var i_logs_id = bankIntegrationLogId;
											log.debug('execute', ' i_logs_id -->' + i_logs_id);

											if(_logValidation(i_logs_id)) {
												var  bankIntegrationLogSubmitID = record.submitFields({ type: "customrecord_bank_integration_logs", id: i_logs_id, 
													values: { 
														custrecord_bil_reversal_file: fileId, 
														custrecord_bil_status: file_status, 
													},
													options: { enableSourcing: true, ignoreMandatoryFields: true }
												});
												log.debug('execute', ' bankIntegrationLogSubmitID -->' + bankIntegrationLogSubmitID);
											}
										}
										catch (exwqnh) {
											log.error('execute','Exception Caught ... -->' + exwqnh);
										}


									}										

									var objVBRecordSubmitId = record.submitFields({type: record_type,id: vb_id,values: {custbody_hdfc_bank_payment_hold: false,custbody_hdfc_utr_number:reversalRTGSUTRNo},
										options: {enableSourcing: false,	ignoreMandatoryFields: true}
									});
									log.debug('execute', 'objVBRecordSubmitId -->' + objVBRecordSubmitId);
								}
								catch (ex213) {
									log.error('execute', 'Exception Caught in Bill  -->' + ex213);
								}

							}
						}
					}
				}	   
			}

		}
		catch(ex)
		{
			log.debug('map error: ', ex.message);	
		}
		context.write(key,value);  
	}
	function reduce(context)
	{    
		try
		{				
			context.write({key:context.key,value:context.values});     
		}
		catch(ex)
		{
			log.error('reduce error: ', ex.message);	
		}    	
	}		
	function summarize(summary) {

		var type = summary.toString();
		log.debug(type + ' Usage Consumed', summary.usage);
		log.debug(type + ' Concurrency Number ', summary.concurrency);
		log.debug(type + ' Number of Yields', summary.yields);

		summary.output.iterator().each(function(key, value)
				{			  	
			return true;
				});


	}
	function _logValidation(value)
	{
		if(value!=null && value!= 'undefined' && value!=undefined && value!='' && value!='NaN' && value!=' '&& value!="0000-00-00")
		{
			return true;
		}	 
		else	  
		{
			return false;
		}
	}
	function get_while(a_search_results_P)
	{
		if(_logValidation(a_search_results_P)) 
		{
			if(a_search_results_P.length>=1000)
			{
				return true
			}
		}
		else
		{
			return false
		}		
	}
	function remove_duplicates(arr) 
	{
		var seen = {};
		var ret_arr = [];
		for(var i = 0; i < arr.length; i++) 
		{
			if(!(arr[i] in seen))
			{
				ret_arr.push(arr[i]);
				seen[arr[i]] = true; 		   
			}
		}
		return ret_arr;
	}
	function get_global_parameters()
	{
		var a_result = {};

		var a_filters_GP = new Array();	
		a_filters_GP.push(search.createFilter({name: 'name',operator: search.Operator.IS,values : 'Netsuite to HDFC Outward Payment Process'}));	

		var a_columns_GP = new Array();
		a_columns_GP.push(search.createColumn({name: 'internalid'}));
		a_columns_GP.push(search.createColumn({name: 'custrecord_sftp_url'}));
		a_columns_GP.push(search.createColumn({name: 'custrecord_sftp_port_'}));
		a_columns_GP.push(search.createColumn({name: 'custrecord_sftp_host_key_'}));
		a_columns_GP.push(search.createColumn({name: 'custrecord_sftp_file_name'}));
		a_columns_GP.push(search.createColumn({name: 'custrecord_sftp_host_key_type_'}));
		a_columns_GP.push(search.createColumn({name: 'custrecord_sftp_password_'}));
		a_columns_GP.push(search.createColumn({name: 'custrecord_sftp_password_guid_reversal_'}));
		a_columns_GP.push(search.createColumn({name: 'custrecord_sftp_username_'}));
		a_columns_GP.push(search.createColumn({name: 'custrecord_sftp_input_folder_path'}));
		a_columns_GP.push(search.createColumn({name: 'custrecord_sftp_output_folder_path'}));

		var a_search_results_GP_OBJ = search.create({type: 'customrecord_sftp_configuration',filters: a_filters_GP,columns: a_columns_GP});
		var a_search_results_GP    = a_search_results_GP_OBJ.run().getRange({start: 0, end: 1000});

		if(_logValidation(a_search_results_GP))
		{

			var i_SFTP_user_name_GP = a_search_results_GP[0].getValue({name: 'custrecord_sftp_username_'});
			var i_password_guid_GP = a_search_results_GP[0].getValue({name: 'custrecord_sftp_password_guid_reversal_'});
			var i_SFTP_server_URL_GP = a_search_results_GP[0].getValue({name: 'custrecord_sftp_url'});
			var i_SFTP_host_key_GP = a_search_results_GP[0].getValue({name: 'custrecord_sftp_host_key_'});		
			var i_SFTP_host_key_type_GP = a_search_results_GP[0].getValue({name: 'custrecord_sftp_host_key_type_'});
			var i_SFTP_directory_GP = a_search_results_GP[0].getValue({name: 'custrecord_sftp_output_folder_path'});
			var i_SFTP_port_GP = a_search_results_GP[0].getValue({name: 'custrecord_sftp_port_'});	

			a_result['sftp_user_name_gp'] = i_SFTP_user_name_GP;
			a_result['password_guid_gp'] = i_password_guid_GP;
			a_result['sftp_server_url_gp'] = i_SFTP_server_URL_GP;		 
			a_result['sftp_host_key_gp'] = i_SFTP_host_key_GP;
			a_result['sftp_host_key_type_gp'] = i_SFTP_host_key_type_GP;	
			a_result['i_SFTP_directory_GP'] = i_SFTP_directory_GP;	
			a_result['i_SFTP_port_GP'] = i_SFTP_port_GP;

		}//Search Results		
		return a_result;
	}//Global Parameters

	function get_logs_id(i_bill_id) 
	{
		var return_z = "";
		try {
			if(_logValidation(i_bill_id)) {
				var o_logs_SS = search.create({
					type: "customrecord_bank_integration_logs",
					filters: [
					          ["custrecord_bil_transaction", "anyof", i_bill_id]
					          ],
					          columns: [
					                    search.createColumn({ name: "name", sort: search.Sort.ASC }),
					                    "internalid"
					                    ]
				});
				var s_count = o_logs_SS.runPaged().count;
				log.debug("s_count", s_count);
				o_logs_SS.run().each(function(result) {
					// .run().each has a limit of 4,000 results
					var i_in_id = result.getValue({ name: 'internalid' });
					log.debug('i_in_id -->' + i_in_id);
					return_z = i_in_id;
					return true;
				});
			}
		}
		catch (excsww) {
			log.error('get_logs_id', 'Exception Caught in logs id  -->' + excsww);
		}
		return return_z;
	}
	function getFileUniqueRefNumber(reversalUniqueCustRefNo) {
		if(!reversalUniqueCustRefNo)
			return null;

		var billId = '';		
		var pymtMethod = '';		
		var rcInteralId = '';
		var pmt_amount = '';
		var tran_type = '';
		var debitAccount="";
		var bankIntegrationLogId="";
		try {

			log.debug('getFileUniqueRefNumber','reversalUniqueCustRefNo=='+reversalUniqueCustRefNo)
			if(reversalUniqueCustRefNo){
				var customrecord_seh_bank_detail_SearchObj = search.create({
					type: "customrecord_hdfc_bank_details",
					filters: [
					          ["custrecord_hbd_primary_key", "is", reversalUniqueCustRefNo]
					          ],
					          columns: [
					                    search.createColumn({ name: "custrecord_hbd_transaction", label: "Transaction #" }),						
					                    search.createColumn({ name: "custrecord_hbd_payment_method", label: "PAYMENT METHOD" }),
					                    search.createColumn({ name: "internalid", label: "Internal ID" }),	
					                    search.createColumn({ name: "custrecord_hbd_payment_amount"}),
					                    search.createColumn({ name: "custrecord_tran_type"}),
					                    search.createColumn({ name: "custrecord_hbd_debit_account_"}),
					                    search.createColumn({ name: "custrecord_hbd_bank_logs"})
					                    ]
				});
				if(customrecord_seh_bank_detail_SearchObj) {
					var custResults = customrecord_seh_bank_detail_SearchObj.run() .getRange({ start: 0, end: 10 });
					if(custResults) {

						var custResult = custResults[0];
						if(custResult) {
							billId = custResult.getValue({ name: "custrecord_hbd_transaction", label: "Transaction #" });						
							pymtMethod = custResult.getValue({ name: "custrecord_hbd_payment_method", label: "PAYMENT METHOD" });
							rcInteralId = custResult.getValue({ name: "internalid", label: "Internal ID" });
							pmt_amount = custResult.getValue({ name: "custrecord_hbd_payment_amount" });
							tran_type = custResult.getValue({ name: "custrecord_tran_type" });
							debitAccount = custResult.getValue({ name: "custrecord_hbd_debit_account_" });
							bankIntegrationLogId = custResult.getValue({ name: "custrecord_hbd_bank_logs" });
						}
					}
				}
			}
			return [billId, pymtMethod, rcInteralId,pmt_amount , tran_type,debitAccount,bankIntegrationLogId];
		}
		catch (ex2) {
			log.error('Error checking existing Department record', ex2.message);
			return '';
		}
	}
	function is_file_created(s_file_name)
	{
		var i_file_id = "";   
		if(_logValidation(s_file_name))
		{
			var folderSearchObj = search.create({type: "folder",
				filters:
					[
					 ["file.name","is",s_file_name]
					 ],
					 columns:
						 [
						  "internalid",
						  search.createColumn({ name: "folder", join: "file" }),
						  search.createColumn({ name: "internalid", join: "file" }),
						  search.createColumn({ name: "name", join: "file" }),
						  search.createColumn({ name: "modified", join: "file" })
						  ]
			});
			var searchResultCount = folderSearchObj.runPaged().count;
			log.debug("folderSearchObj result count",searchResultCount);
			folderSearchObj.run().each(function(result){
				// .run().each has a limit of 4,000 results
				i_file_id = result.getValue({name: "internalid",join: "file"});
				return true;
			});			
		}  
		return i_file_id;  
	}
//	Dynamic Date Format
	function getDateFormat(vbBodyFldVal,dateFormatValue){

		try{

			if(vbBodyFldVal && dateFormatValue){

				var m	 			= [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
				var mm 				= [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

				var formatedfdate = format.parse({value : vbBodyFldVal,type : format.Type.DATE});
				//log.debug('formatedfdate',formatedfdate);

				var date = vbBodyFldVal.split("/");

				//log.debug('date 1',date[0]);
				//log.debug('date 2',date[1]);
				//log.debug('date 3',date[2]);


				var firstDay		= date[0];
				var months 			= date[1];
				var years			= date[2];				
				var monsText		= m[months-1];
				var monthsText		= mm[months-1];

				//log.debug({title: "months", details:months });
				//log.debug({title: "years", details:years });
				//log.debug({title: "firstDay", details:firstDay });
				//log.debug({title: "monsText", details:monsText });
				//log.debug({title: "monthsText", details:monthsText });
				//log.debug({title: "dateFormatValue", details:dateFormatValue });

				if(dateFormatValue == "M/D/YYYY" || dateFormatValue == "MM/DD/YYYY") {
					var Date	= months+"/"+firstDay+"/"+years;

				}
				else if(dateFormatValue == "D/M/YYYY") {
					var Date	= firstDay+"/"+months+"/"+years;
				}
				else if(dateFormatValue == "D-Mon-YYYY") {
					var Date	= firstDay+"-"+monsText+"-"+years;
				}
				else if(dateFormatValue == "D.M.YYYY") {
					var Date	= firstDay+"."+months+"."+years;
				}
				else if(dateFormatValue == "D-MONTH-YYYY" || dateFormatValue == "DD-MONTH-YYYY") {
					var Date	= firstDay+"-"+monthsText+"-"+years;
				}
				else if(dateFormatValue == "D MONTH, YYYY" || dateFormatValue == "DD MONTH, YYYY") {
					var Date	= firstDay+" "+monthsText+", "+years;
				}
				else if(dateFormatValue == "YYYY/M/D" || dateFormatValue == "YYYY/MM/DD") {
					var Date	= years+"/"+months+"/"+firstDay;
				}
				else if(dateFormatValue == "YYYY-M-D" || dateFormatValue == "YYYY-MM-DD") {
					var Date	= years+"-"+months+"-"+firstDay;
				}
				else if(dateFormatValue == "DD/MM/YYYY") {
					var Date	= firstDay+"/"+months+"/"+years;
				}
				else if(dateFormatValue == "DD-Mon-YYYY") {
					var Date	= firstDay+"-"+monsText+"-"+years;
				}
				else if(dateFormatValue == "DD.MM.YYYY") {
					var Date	= firstDay+"."+months+"."+years;
				}
				else if(dateFormatValue == "DD-MONTH-YYYY") {
					var Date	= firstDay+"."+months+"."+years;
				}

				log.debug('Date',Date);
				return Date;
			}
		}
		catch(e){
			log.debug('getDateFormat e',e.message);
		}
	}

	function getPaymentMethodId(pMethodShort){

		var PaymentMethodName="";
		if(pMethodShort=="N"){
			PaymentMethodName="NEFT";
		}
		else if(pMethodShort=="R"){
			PaymentMethodName="RTGS";
		}
		else if(pMethodShort=="I"){
			PaymentMethodName="IFT(HDFC)";
		}

		var pMethodId="";

		var customlistcustomlist_mopSearchObj = search.create({type: "customlistcustomlist_mop",
			filters:
				[
				 ["name","is",PaymentMethodName], "AND",["isinactive","is","F"]
				 ],
				 columns:
					 [
					  search.createColumn({name: "internalid", label: "Internal ID"})
					  ]
		});
		var searchResultCount = customlistcustomlist_mopSearchObj.runPaged().count;
		//log.debug("customlistcustomlist_mopSearchObj result count",searchResultCount);
		customlistcustomlist_mopSearchObj.run().each(function(result){
			// .run().each has a limit of 4,000 results
			pMethodId = result.getValue({name: "internalid", label: "Internal ID"});
			return true;
		});
		return pMethodId;
	}

	return {
		getInputData: getInputData,
		map: map,
		// reduce: reduce,
		summarize: summarize
	};

});