/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
/** File Name: MR_HDFC_NS_Outaward_Payment_File_Process.js
 * File ID: 
 * Date Created: 04 August 2022
 * Author: Pralhad Solanke
 * Company: Yantra Tech Innovation Lab Pvt. Ltd.
 * email: pralhad@yantrainc.com
 * Description: This script is used to create Custom records and Payment File.
 */
/**
 * Script Modification Log:
 * 
		       -- Date --            -- Modified By --              --Requested By--                           -- Description --

 *
 */
//GetInputData : 10000 Units
//Map : 1000 Units
//Reduce : 5000 Units
//Summary : 10000 Units

var bftInternalId="";
var bftRecordIdentifier="";
var bftPaymentIndicator="";
var bftUniqueCustRefNo ="";
var bftVendorBeneficiaryCode="";
var bftBeneficiaryName ="";
var bftInstrumentRefNo ="";
var bftInstrumentAmount=""
	var bftPaymentDate="";
var bftCheckNumber="";
var bftDebitAccountNo ="";
var bftBeneficiaryBankAccountNo="";
var bftBeneficiaryBankIFSCCode="";
var bftBeneficiaryBankName="";
var bftBeneficiaryBankBranchName="";
var bftBeneficiaryAddr1="";
var bftBeneficiaryAddr2="";
var bftBeneficiaryAddr3="";
var bftBeneficiaryAddr4="";
var bftBeneficiaryAddr5="";
var bftBeneficiaryCity="";
var bftBeneficiaryZip ="";
var bftDebitNarration="";
var bftPrintLocation="";
var bftPayableLocation="";
var bftEmailId="";
var bftTransactionType="";
var bftMICRNo="";
var bftPaymentDetails1="";
var bftPaymentDetails2="";
var bftPaymentDetails3="";
var bftPaymentDetails4="";
var bftPaymentDetails5="";
var bftPaymentDetails6="";
var bftPaymentDetails7="";
var arrTransactionNo =new Array();


define(['N/record', 'N/search', 'N/runtime', 'N/email','N/format','N/file','N/task','N/sftp','N/xml','N/config'],

		function(record, search, runtime, email,format,file,task,sftp,xml,config){

	function getInputData(context){
		var returnValue = {};

		var arrReturnValues =[];
		var arrBankLogRecord =[];
		var objReturnTempValue =[];		
		var objReturnValue = [];

		try{
			log.debug('getInputData','----------------------------------------- Execution Starts Here ------------------------------------------------------');

			var objScript = runtime.getCurrentScript();

			//-------------------------------------------------- Start - Get values of parameters ---------------------------------------------------------------//
			var ID_ARR = objScript.getParameter({name: 'custscript_recordid_array'});
			var USER_ID = objScript.getParameter({name: 'custscript_user_'});
			var TRANSMISSION_DATE = objScript.getParameter({name: 'custscript_transmission_date_'});
			var BANKACCOUNT = objScript.getParameter({name: 'custscript_account_'});
			var BANK_PAYMENT_METHOD = objScript.getParameter({name: 'custscript_bnk_pmt_method_'});
			var BANK_ACCOUNT_NO = objScript.getParameter({name: 'custscript_account__no_'});
			var AMOUNT_ID_ARRAY = objScript.getParameter({name: 'custscript_amount_id_arr'});
			var subsidiaryId = objScript.getParameter({name: 'custscript_subsidiary_id_'});
			var PAYMENT_DATE_ARR = objScript.getParameter({name: 'custscript_payment_date_arr_'});

			log.debug('getInputData',' ID_ARR  --> '+ID_ARR);
			log.debug('getInputData',' USER_ID  --> '+USER_ID);
			log.debug('getInputData',' TRANSMISSION_DATE  --> '+TRANSMISSION_DATE);
			log.debug('getInputData',' BANKACCOUNT  --> '+BANKACCOUNT);
			log.debug('getInputData',' BANK_PAYMENT_METHOD  --> '+BANK_PAYMENT_METHOD);
			log.debug('getInputData',' BANK_ACCOUNT_NO  --> '+BANK_ACCOUNT_NO);
			log.debug('getInputData',' AMOUNT_ID_ARRAY  --> '+AMOUNT_ID_ARRAY);
			log.debug('getInputData',' PAYMENT_DATE_ARR  --> '+PAYMENT_DATE_ARR);

			AMOUNT_ID_ARRAY = JSON.parse(AMOUNT_ID_ARRAY);
			PAYMENT_DATE_ARR = JSON.parse(PAYMENT_DATE_ARR);

			//-------------------------------------------------- End - Get values of parameters ---------------------------------------------------------------//

			//-------------------------------------- Start - get Values from General Configuration Record ----------------------------------------------//

			var internalID_GC ="";
			var vendorBillSearchId = "";
			var paymentFolderId ="";
			var reversalFolderId = "";
			var clientScriptPath="";
			var defaultSubsidiary ="";
			var creditpaymentAppliedSearchId ="";
			var bankAccountId = "";
			var file_initial_counter = "";

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
			arrColumns_GC.push(search.createColumn({name: 'custrecord_gc_ns_file_initial_counter'}));

			var objSearch_GC = search.create({type: 'customrecord_general_configuration',filters: null,columns: arrColumns_GC});
			var searchResult_GC    = objSearch_GC.run().getRange({start: 0, end: 1000});
			log.debug('getInputData','searchResult_GC=='+searchResult_GC);
			if(_logValidation(searchResult_GC))
			{
				//log.debug('getInputData','searchResult_GC length=='+searchResult_GC.length);
				for(var gc=0;gc<searchResult_GC.length;gc++){
					internalID_GC = searchResult_GC[gc].getValue({name: 'internalid'});
					//log.debug('getInputData','internalID_GC=='+internalID_GC);
					vendorBillSearchId = searchResult_GC[gc].getValue({name: 'custrecord_gc_payment_search'});
					//log.debug('getInputData','vendorBillSearchId=='+vendorBillSearchId);
					paymentFolderId = searchResult_GC[gc].getValue({name: 'custrecord_gc_ns_payment_folder'});
					//log.debug('getInputData','paymentFolderId=='+paymentFolderId);
					reversalFolderId = searchResult_GC[gc].getValue({name: 'custrecord_gc_ns_reversal_folder'});
					//log.debug('getInputData','reversalFolderId=='+reversalFolderId);
					clientScriptPath = searchResult_GC[gc].getValue({name: 'custrecord_gc_ns_clientscript_path'});
					//	log.debug('getInputData','clientScriptPath=='+clientScriptPath);
					defaultSubsidiary = searchResult_GC[gc].getValue({name: 'custrecord_gc_ns_default_subsidiary'});
					//log.debug('getInputData','defaultSubsidiary=='+defaultSubsidiary);
					creditpaymentAppliedSearchId = searchResult_GC[gc].getValue({name: 'custrecord_gc_ns_creditpayment_applied'});
					//log.debug('getInputData','creditpaymentAppliedSearchId=='+creditpaymentAppliedSearchId);						
					bankAccountId = searchResult_GC[gc].getValue({name: 'custrecord_gc_ns_bank_account'});
					//log.debug('getInputData','bankAccountId=='+bankAccountId);
					file_initial_counter = searchResult_GC[gc].getValue({name: 'custrecord_gc_ns_file_initial_counter'});			
					//log.debug('getInputData','file_initial_counter=='+file_initial_counter);
				}
			}

			//-------------------------------------- End - get Values from General Configuration Record ----------------------------------------------//			


			//-------------------------------------------------- Start - Get values from SFTP Configuration Custom Record ---------------------------------------------------------------//
			var arrFiltersSFTP = new Array();	
			arrFiltersSFTP.push(search.createFilter({name: 'name',operator: search.Operator.IS,values : 'Netsuite to HDFC Outward Payment Process'}));	

			var arrColumnsSFTP = new Array();
			arrColumnsSFTP.push(search.createColumn({name: 'internalid'}));
			arrColumnsSFTP.push(search.createColumn({name: 'custrecord_sftp_url'}));
			arrColumnsSFTP.push(search.createColumn({name: 'custrecord_sftp_port_'}));
			arrColumnsSFTP.push(search.createColumn({name: 'custrecord_sftp_host_key_'}));
			arrColumnsSFTP.push(search.createColumn({name: 'custrecord_sftp_file_name'}));
			arrColumnsSFTP.push(search.createColumn({name: 'custrecord_sftp_host_key_type_'}));
			arrColumnsSFTP.push(search.createColumn({name: 'custrecord_sftp_password_'}));
			arrColumnsSFTP.push(search.createColumn({name: 'custrecord_sftp_password_guid_'}));
			arrColumnsSFTP.push(search.createColumn({name: 'custrecord_sftp_username_'}));
			arrColumnsSFTP.push(search.createColumn({name: 'custrecord_sftp_input_folder_path'}));
			arrColumnsSFTP.push(search.createColumn({name: 'custrecord_sftp_output_folder_path'}));

			var objSearchSFTPConfig = search.create({type: 'customrecord_sftp_configuration',filters: arrFiltersSFTP,columns: arrColumnsSFTP});
			var searchResultsSFTPConfig    = objSearchSFTPConfig.run().getRange({start: 0, end: 1000});
			log.debug('TEst','searchResultsSFTPConfig=='+searchResultsSFTPConfig);

			if(_logValidation(searchResultsSFTPConfig))
			{
				for(var sf=0;sf<searchResultsSFTPConfig.length;sf++){
					var sftpInternalId = searchResultsSFTPConfig[sf].getValue({name: 'internalid'});
					var sftpURL = searchResultsSFTPConfig[sf].getValue({name: 'custrecord_sftp_url'});
					var sftpPort = searchResultsSFTPConfig[sf].getValue({name: 'custrecord_sftp_port_'});
					var sftpHostKey = searchResultsSFTPConfig[sf].getValue({name: 'custrecord_sftp_host_key_'});
					var sftpFileName = searchResultsSFTPConfig[sf].getValue({name: 'custrecord_sftp_file_name'});
					var sftpHostKeyType = searchResultsSFTPConfig[sf].getValue({name: 'custrecord_sftp_host_key_type_'});
					var sftpPassword = searchResultsSFTPConfig[sf].getValue({name: 'custrecord_sftp_password_'});
					var sftpPasswordGuid = searchResultsSFTPConfig[sf].getValue({name: 'custrecord_sftp_password_guid_'});
					var sftpUsername = searchResultsSFTPConfig[sf].getValue({name: 'custrecord_sftp_username_'});
					var sftpInputFolderPath = searchResultsSFTPConfig[sf].getValue({name: 'custrecord_sftp_input_folder_path'});
					var sftpOutputFolderPath = searchResultsSFTPConfig[sf].getValue({name: 'custrecord_sftp_output_folder_path'});
				}
			}
			//-------------------------------------------------- End - Get values from SFTP Configuration Custom Record ---------------------------------------------------------------//

			//-------------------------------------------------- Start - Get values from Bank File Template Custom Record ---------------------------------------------------------------//
			var arrFiltersBFT = new Array();	
			//arrFiltersBFT.push(search.createFilter({name: 'name',operator: search.Operator.IS,values : 'NS <> HDFC Outward Payments'}));	

			var arrColumnsBFT = new Array();
			arrColumnsBFT.push(search.createColumn({name: 'internalid'}));
			//arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_record_identifier'}));
			//arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_payment_indicator'}));
			arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_transaction_type'}));
			arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_unique_cust_ref_no'}));
			arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_beneficiary_code'}));
			arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_name_of_beneficiary'}));
			arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_instruction_reference_num'}));
			arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_instrument_amount'}));
			arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_payment_date'}));
			arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_cheque_number'}));
			//arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_debit_account_no'}));
			arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_micr_number'}));
			arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_payment_details_1'}));
			arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_payment_details_2'}));
			arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_payment_details_3'}));
			arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_payment_details_4'}));
			arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_payment_details_5'}));
			arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_payment_details_6'}));
			arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_payment_details_7'}));
			arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_beneficiary_bank_ac_no'}));
			arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_beneficiary_bank_ifsc_cod'}));
			arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_beneficiary_bank_name'}));
			arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_bene_bank_branch_name'}));
			arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_beneficiary_mailing_add_1'}));
			arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_beneficiary_mailing_add_2'}));
			arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_beneficiary_mailing_add_3'}));
			arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_beneficiary_mailing_add_4'}));
			arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_beneficiary_mailing_add_5'}));
			//arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_beneficiary_city'}));
			//arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_beneficiary_zip'}));
			//arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_debit_narration'}));
			arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_print_location'}));
			//arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_payable_location'}));
			arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_drawee_location'}));
			arrColumnsBFT.push(search.createColumn({name: 'custrecord_bft_email_id'}));

			var objSearchBFT = search.create({type: 'customrecord_bank_file_templates',filters: arrFiltersBFT,columns: arrColumnsBFT});
			var searchResultsBFT    = objSearchBFT.run().getRange({start: 0, end: 1000});
			log.debug('TEst','searchResultsBFT=='+searchResultsBFT);

			if(_logValidation(searchResultsBFT))
			{
				for(var b=0;b<searchResultsBFT.length;b++){
					bftInternalId = searchResultsBFT[b].getValue({name: 'internalid'});
					//bftRecordIdentifier = searchResultsBFT[b].getValue({name: 'custrecord_bft_record_identifier'});
					//bftPaymentIndicator = searchResultsBFT[b].getValue({name: 'custrecord_bft_payment_indicator'});
					bftTransactionType = searchResultsBFT[b].getValue({name: 'custrecord_bft_transaction_type'});					
					bftUniqueCustRefNo = searchResultsBFT[b].getValue({name: 'custrecord_bft_unique_cust_ref_no'});
					bftVendorBeneficiaryCode = searchResultsBFT[b].getValue({name: 'custrecord_bft_beneficiary_code'});
					bftBeneficiaryName = searchResultsBFT[b].getValue({name: 'custrecord_bft_name_of_beneficiary'});
					bftInstrumentRefNo = searchResultsBFT[b].getValue({name: 'custrecord_bft_instruction_reference_num'});
					bftInstrumentAmount = searchResultsBFT[b].getValue({name: 'custrecord_bft_instrument_amount'});					
					bftPaymentDate = searchResultsBFT[b].getValue({name: 'custrecord_bft_payment_date'});
					bftCheckNumber = searchResultsBFT[b].getValue({name: 'custrecord_bft_cheque_number'});
					//bftDebitAccountNo = searchResultsBFT[b].getValue({name: 'custrecord_bft_debit_account_no'});
					bftMICRNo = searchResultsBFT[b].getValue({name: 'custrecord_bft_micr_number'});
					bftPaymentDetails1 = searchResultsBFT[b].getValue({name: 'custrecord_bft_payment_details_1'});
					bftPaymentDetails2 = searchResultsBFT[b].getValue({name: 'custrecord_bft_payment_details_2'});
					bftPaymentDetails3 = searchResultsBFT[b].getValue({name: 'custrecord_bft_payment_details_3'})					
					bftPaymentDetails4 = searchResultsBFT[b].getValue({name: 'custrecord_bft_payment_details_4'});
					bftPaymentDetails5 = searchResultsBFT[b].getValue({name: 'custrecord_bft_payment_details_5'});
					bftPaymentDetails6 = searchResultsBFT[b].getValue({name: 'custrecord_bft_payment_details_6'});
					bftPaymentDetails7 = searchResultsBFT[b].getValue({name: 'custrecord_bft_payment_details_7'});
					bftBeneficiaryBankAccountNo = searchResultsBFT[b].getValue({name: 'custrecord_bft_beneficiary_bank_ac_no'});
					bftBeneficiaryBankIFSCCode = searchResultsBFT[b].getValue({name: 'custrecord_bft_beneficiary_bank_ifsc_cod'});
					bftBeneficiaryBankName = searchResultsBFT[b].getValue({name: 'custrecord_bft_beneficiary_bank_name'});
					bftBeneficiaryBankBranchName = searchResultsBFT[b].getValue({name: 'custrecord_bft_bene_bank_branch_name'});					
					bftBeneficiaryAddr1 = searchResultsBFT[b].getValue({name: 'custrecord_bft_beneficiary_mailing_add_1'});
					bftBeneficiaryAddr2 = searchResultsBFT[b].getValue({name: 'custrecord_bft_beneficiary_mailing_add_2'});
					bftBeneficiaryAddr3 = searchResultsBFT[b].getValue({name: 'custrecord_bft_beneficiary_mailing_add_3'});
					bftBeneficiaryAddr4 = searchResultsBFT[b].getValue({name: 'custrecord_bft_beneficiary_mailing_add_4'});
					bftBeneficiaryAddr5 = searchResultsBFT[b].getValue({name: 'custrecord_bft_beneficiary_mailing_add_5'});
					//bftBeneficiaryCity = searchResultsBFT[b].getValue({name: 'custrecord_bft_beneficiary_city'});
					//bftBeneficiaryZip = searchResultsBFT[b].getValue({name: 'custrecord_bft_beneficiary_zip'});
					//bftDebitNarration = searchResultsBFT[b].getValue({name: 'custrecord_bft_debit_narration'});
					bftPrintLocation = searchResultsBFT[b].getValue({name: 'custrecord_bft_print_location'});
					//bftPayableLocation = searchResultsBFT[b].getValue({name: 'custrecord_bft_payable_location'});
					bftPayableLocation = searchResultsBFT[b].getValue({name: 'custrecord_bft_drawee_location'});

					bftEmailId = searchResultsBFT[b].getValue({name: 'custrecord_bft_email_id'});

				}
			}
			//-------------------------------------------------- End - Get values from Bank File Template Custom Record ---------------------------------------------------------------//

			//-----------------------------------------------------------Start - Get Value for file sequence -------------------------------------------------------//
			/*var i_payment_file_sequence="";
				var objFldFileAutoNumbering ="";

				objFldFileAutoNumbering = search.lookupFields({type:'customrecord_file_auto_numbering',id:1,columns:['custrecord_f_an_date','custrecord_f_an_incremental_number']});

				if(objFldFileAutoNumbering){
					i_payment_file_sequence = objFldFileAutoNumbering.custrecord_f_an_incremental_number;

					if(i_payment_file_sequence.length==1){
						i_payment_file_sequence = '00'+i_payment_file_sequence;
					}
					else if(i_payment_file_sequence.length==2){
						i_payment_file_sequence = '0'+i_payment_file_sequence;
					}
					else if(i_payment_file_sequence.length==3){
						i_payment_file_sequence = i_payment_file_sequence;
					}
				}*/

			//-----------------------------------------------------------End - Get Value for file sequence -------------------------------------------------------//

			var objCurrentDateValue = new Date();
			log.debug('getInputData','objCurrentDateValue=='+objCurrentDateValue);
			var objCurrentDate = convertDate(objCurrentDateValue)
			log.debug('getInputData','objCurrentDate=='+objCurrentDate);
			var getCurrentTime       = objCurrentDate.getTime();
			log.debug('getInputData','getCurrentTime=='+getCurrentTime);
			var getCurrentDay        = objCurrentDate.getDate(); 
			log.debug('getInputData','getCurrentDay=='+getCurrentDay);
			var getCurrentMonth      = objCurrentDate.getMonth()+ 1;
			log.debug('getInputData','getCurrentMonth=='+getCurrentMonth);
			var getCurrentYear       = objCurrentDate.getFullYear();
			log.debug('getInputData','getCurrentYear=='+getCurrentYear);
			var getCurrentDateTime       = objCurrentDate.getHours()+'-'+objCurrentDate.getMinutes()+'-'+objCurrentDate.getSeconds();

			//---------------------------------------------- Start - Get Values from Search and create Payment file ---------------------------------------------------------------------//


			var todayDateConverted     = convert_date(objCurrentDate);
			log.debug('getInputData','todayDateConverted=='+todayDateConverted);
			log.debug('getInputData','bftPaymentDate=='+bftPaymentDate);
			var currentDateValueAppended = append_zero_in_date(todayDateConverted , bftPaymentDate);
			log.debug('getInputData','currentDateValueAppended=='+currentDateValueAppended);
			var currentDateTimeStampValue       = todayDateConverted.getTime();
			log.debug('getInputData','currentDateTimeStampValue=='+currentDateTimeStampValue);

			var currentDay="";
			var currentMonth ="";

			if(getCurrentDay && getCurrentDay<10){
				currentDay = '0'+getCurrentDay;
			}
			else{
				currentDay = getCurrentDay
			}
			if(getCurrentMonth && getCurrentMonth<10){
				currentMonth = '0'+getCurrentMonth;
			}
			else{
				currentMonth = getCurrentMonth
			}

			///-------------------------------------------------------------Start- Get Client Code and Domain Code ---------------------------//
			var clientCode="";
			var DomainId="";
			var customrecord_ns_hdfc_account_number_SearchObj = search.create({type: "customrecord_ns_hdfc_account_number_",
				filters:
					[
						["isinactive","is","F"],"AND",["custrecord_ns_subsidiary_","is",subsidiaryId]
						],
						columns:
							[									
								search.createColumn({name: "custrecord_ns_subsidiary_code", label: "Subsidiary/Client Code"}),
								search.createColumn({name: "custrecord_ns_domain_id_", label: "Domain Id"}),
								]
			});
			var searchResultCount = customrecord_ns_hdfc_account_number_SearchObj.runPaged().count;
			log.debug("customrecord_ns_hdfc_account_number_SearchObj result count",searchResultCount);
			customrecord_ns_hdfc_account_number_SearchObj.run().each(function(result){
				// .run().each has a limit of 4,000 results					
				clientCode = result.getValue({name: "custrecord_ns_subsidiary_code", label: "Subsidiary/Client Code"});
				DomainId = result.getValue({name: "custrecord_ns_domain_id_", label: "Domain Id"});
				return true;
			});
			///-------------------------------------------------------------End- Get Client Code and Domain Code ---------------------------//
			var i_payment_file_sequence="";
			var objCurrentDate_N     = convert_date(objCurrentDateValue);
			var objCurrentDate_NEW = format.parse({value:objCurrentDate_N,type:format.Type.DATE}) 
			objCurrentDate_NEW = format.format({value:objCurrentDate_NEW,type:format.Type.DATE}) 
			log.debug('getInputData','objCurrentDate_NEW =='+objCurrentDate_NEW);

			i_payment_file_sequence = get_file_counter_no(file_initial_counter , objCurrentDate_NEW);
			log.debug('getInputData','i_payment_file_sequence =='+i_payment_file_sequence);


			//var fileName = sftpFileName+" "+currentDateValueAppended+" "+currentDateTimeStampValue+" "+i_payment_file_sequence;
			//var fileName = "testPayment"+""+currentDateValue+""+i_payment_file_sequence;

			log.debug('getInputData','i_payment_file_sequence=='+i_payment_file_sequence);
			//log.debug('getInputData','i_payment_file_sequence length=='+i_payment_file_sequence.length);

			/*			if(i_payment_file_sequence.length==1){
					i_payment_file_sequence = '90'+i_payment_file_sequence;
				}
				if(i_payment_file_sequence.length==2){
					i_payment_file_sequence = '9'+i_payment_file_sequence;
				}
				else{
					i_payment_file_sequence = i_payment_file_sequence;
				}*/

			if(parseInt(i_payment_file_sequence) < 10){
				i_payment_file_sequence = '70'+i_payment_file_sequence;
			}
			else if(parseInt(i_payment_file_sequence) < 100){
				i_payment_file_sequence = '7'+i_payment_file_sequence;
			}
			else{
				i_payment_file_sequence = parseInt(i_payment_file_sequence);
			}

			//var fileName = sftpFileName+currentDay+currentMonth+'.'+i_payment_file_sequence;			
			var  fileName = DomainId+'_'+clientCode+'_'+clientCode+currentDay+currentMonth+'.'+i_payment_file_sequence;
			log.debug('getInputData','fileName=='+fileName);


			var sName = "HDFC_NS_Integration_"+fileName; 

			var fileString = "";

			if(vendorBillSearchId && _logValidation(ID_ARR)) 
			{			
				var arrFilters = new Array();
				var arrVBInternalID=[];
				log.debug('getInputData', 'ID_ARR**1 -->' + ID_ARR);

				if(ID_ARR){
					var splitValues = ID_ARR.toString().split(",");
					for(var i=0;i<splitValues.length;i++){
						arrVBInternalID.push(parseInt(splitValues[i]));
					}
				}

				arrFilters.push(search.createFilter({name: 'internalid',operator: search.Operator.ANYOF,values:arrVBInternalID}));

				if(vendorBillSearchId)
					var vendorbillSearchObj = search.load({ id: vendorBillSearchId });

				if (_logValidation(arrFilters)) {
					for (var flt = 0; flt < arrFilters.length; flt++) {
						log.debug('getInputData', 'arrFilters['+flt+'] -->' + arrFilters[flt]);
						vendorbillSearchObj.filters.push(arrFilters[flt]);
					}
				}

				var objSearchResult = vendorbillSearchObj.run().getRange({ start: 0, end: 1000 });
				//log.debug('getInputData', ' HDFC to NS Search Results  -->' + objSearchResult);

				var counter = 0;

				if(_logValidation(objSearchResult)) 
				{
					log.debug('getInputData', ' HDFC to NS Search Results Length  -->' + objSearchResult.length);
					for(var i = 0; i < objSearchResult.length; i++){

						var i_AMT_TO_PAID_=0;


						var PMT_JSON = get_payment_types();
						var paymentMethodId = "";
						try
						{
							if(BANK_PAYMENT_METHOD){
								var i_PMT_STR = PMT_JSON[BANK_PAYMENT_METHOD].pymt_method_str ; 	
								paymentMethodId = PMT_JSON[BANK_PAYMENT_METHOD].pymt_method_id ;
							}
						}
						catch(eww){var i_PMT_STR = "";}

						var transactionType ="";
						if(i_PMT_STR){
							transactionType=i_PMT_STR.substring(0,bftTransactionType)
						}else{
							transactionType="";
						}


						var recordID = objSearchResult[i].getValue({ name: "internalid"});
						log.debug('getInputData', ' recordID  -->' + recordID);
						arrTransactionNo.push(recordID);

						var todayDate     = convert_date(objCurrentDate);
						var currentDateTimeStamp       = todayDate.getTime();

						var customerRefNo = recordID+''+currentDateTimeStamp;
						if(customerRefNo){
							customerRefNo = customerRefNo.substring(0,bftPaymentDetails1)
						}else{
							customerRefNo="";
						}
						log.debug('getInputData', ' customerRefNo  -->' + customerRefNo);
						
						var beneficiaryCode ="";
						var  beneficiaryCodeValue=objSearchResult[i].getValue({name: "entityid", join: "vendor", label: "ID"});

						if(beneficiaryCodeValue){
								var splittedBeneficiaryCode = beneficiaryCodeValue.split(' ');
								beneficiaryCode = splittedBeneficiaryCode[0];
							}

						if(beneficiaryCode){
							beneficiaryCode = beneficiaryCode.substring(0,bftVendorBeneficiaryCode)
						}else{
							beneficiaryCode="";
						}
						log.debug('getInputData', ' beneficiaryCode  -->' + beneficiaryCode);

						var vendor_id = objSearchResult[i].getValue({name: "entity"});

						//var beneficiaryName = objSearchResult[i].getText({name: "entity",label: "Name"});
						var beneficiaryName = objSearchResult[i].getValue({name: "custentity_in_benficiary_name",label: "BENEFICIARY NAME"});
						if(beneficiaryName){			
							beneficiaryName = beneficiaryName.toString();
							beneficiaryName = beneficiaryName.replace(/[^a-zA-Z0-9 ]/g, "");							
							beneficiaryName = beneficiaryName.substring(0,bftBeneficiaryName)
						}else{
							beneficiaryName="";
						}
						log.debug('getInputData', ' beneficiaryName  -->' + beneficiaryName);
						
						var beneficiaryName_BankStatment="";
						if(beneficiaryName){
							 beneficiaryName_BankStatment = beneficiaryName.substring(0,bftUniqueCustRefNo)
						}
						if(beneficiaryName_BankStatment){
							beneficiaryName_BankStatment = beneficiaryName_BankStatment
						}
						else{
							beneficiaryName_BankStatment="";
						}			

						try{
							i_AMT_TO_PAID_ = AMOUNT_ID_ARRAY[recordID].amount_to_be_paid ; 
						}
						catch(excss){
							i_AMT_TO_PAID_ = 0 ;
						}	
						log.debug('getInputData', ' i_AMT_TO_PAID_  -->' + i_AMT_TO_PAID_);

						var transactionAmount = i_AMT_TO_PAID_;
						log.debug('getInputData', ' transactionAmount  -->' + transactionAmount);
						if(transactionAmount){transactionAmount=transactionAmount;}else{transactionAmount="";}

						//var recordDueDate= objSearchResult[i].getValue({ name: "duedate"});

						var recordDueDate ="";
						try{						
							recordDueDate = PAYMENT_DATE_ARR[recordID].payment_date;
						}
						catch(epxx){
							recordDueDate= todayDateConverted;							
						}
						log.debug('getInputData', ' recordDueDate  -->' + recordDueDate);

						recordDueDate = append_zero_in_date(recordDueDate , bftPaymentDate);

						var checkNumber ="";

						var debitAccountNo = "";

						if(BANK_ACCOUNT_NO){
							debitAccountNo = BANK_ACCOUNT_NO.substring(0,bftDebitAccountNo)
						}else{
							debitAccountNo = "";
						}

						var beneficiaryAccountNo = objSearchResult[i].getValue({name: "custentity_bank_account_no", join: "vendor", label: "Beneficiary Account No"});
						//log.debug('getInputData', ' beneficiaryAccountNo  -->' + beneficiaryAccountNo);	
						//log.debug('getInputData', ' bftBeneficiaryBankAccountNo  -->' + bftBeneficiaryBankAccountNo);	
						if(beneficiaryAccountNo){
							beneficiaryAccountNo = beneficiaryAccountNo.substring(0,bftBeneficiaryBankAccountNo)
						}else{
							beneficiaryAccountNo="";
						}
						log.debug('getInputData', ' beneficiaryAccountNo**1  -->' + beneficiaryAccountNo);	

						var beneficiaryBankIFSCCode = objSearchResult[i].getValue({name: "custentity_sort_code_ifsc_code", join: "vendor", label: "Beneficiary Bank IFSC Code"});
						if(beneficiaryBankIFSCCode){
							beneficiaryBankIFSCCode = beneficiaryBankIFSCCode.substring(0,bftBeneficiaryBankIFSCCode)
						}else{
							beneficiaryBankIFSCCode="";
						}
						log.debug('getInputData', ' beneficiaryBankIFSCCode  -->' + beneficiaryBankIFSCCode);

						var beneficiaryBankName = objSearchResult[i].getValue({name: "custentity_bank_name", join: "vendor", label: "Beneficiary Bank Name"});
						if(beneficiaryBankName){
							beneficiaryBankName = beneficiaryBankName.substring(0,bftBeneficiaryBankName)
						}else{
							beneficiaryBankName="";
						}
						log.debug('getInputData', ' beneficiaryBankName  -->' + beneficiaryBankName);

						var beneficiaryBankBranchName = objSearchResult[i].getValue({name: "custentity_bank_address", join: "vendor", label: "Beneficiary Bank Branch Name"});
						if(beneficiaryBankBranchName){
							beneficiaryBankBranchName = beneficiaryBankBranchName.substring(0,bftBeneficiaryBankBranchName)
						}else{
							beneficiaryBankBranchName="";
						}
						log.debug('getInputData', ' beneficiaryBankBranchName  -->' + beneficiaryBankBranchName);

						var beneficiaryAddr1 = objSearchResult[i].getValue({name: "custentity_hdfc_beneficiary_mail_add_1",join: "vendor",label:"Beneficiary Mailing Address 1"});						
						if(beneficiaryAddr1){
							beneficiaryAddr1 = beneficiaryAddr1.substring(0,bftBeneficiaryAddr1)
						}else{
							beneficiaryAddr1="";
						}
						log.debug('getInputData', ' beneficiaryAddr1  -->' + beneficiaryAddr1);

						var beneficiaryAddr2 = objSearchResult[i].getValue({name: "custentity_hdfc_beneficiary_mail_add_2",join: "vendor",label:"Beneficiary Mailing Address 2"});
						if(beneficiaryAddr2){
							beneficiaryAddr2 = beneficiaryAddr2.substring(0,bftBeneficiaryAddr2)
						}else{
							beneficiaryAddr2="";
						}
						log.debug('getInputData', ' beneficiaryAddr2  -->' + bftBeneficiaryAddr3);

						var beneficiaryAddr3 = objSearchResult[i].getValue({name: "custentity_hdfc_beneficiary_mail_add_3",join: "vendor",label:"Beneficiary Mailing Address 3"});
						if(beneficiaryAddr3){
							beneficiaryAddr3 = beneficiaryAddr3.substring(0,bftBeneficiaryAddr3)
						}else{
							beneficiaryAddr3="";
						}
						log.debug('getInputData', ' beneficiaryAddr3  -->' + beneficiaryAddr3);

						var beneficiaryAddr4="";
						var beneficiaryAddr5="";

						/*var beneficiaryCity = objSearchResult[i].getValue({name: "billcity",join: "vendor",label: "Billing City"});
							if(beneficiaryCity){
								beneficiaryCity = beneficiaryCity.substring(0,bftBeneficiaryCity)
							}else{
								beneficiaryCity="";
							}
							log.debug('getInputData', ' beneficiaryCity  -->' + beneficiaryCity);

							var beneficiaryPincode = objSearchResult[i].getValue({name: "billzipcode",join: "vendor",label: "Billing Zip"});
							if(beneficiaryPincode){
								beneficiaryPincode = beneficiaryPincode.substring(0,bftBeneficiaryZip)
							}else{
								beneficiaryPincode="";
							}
							log.debug('getInputData', ' beneficiaryPincode  -->' + beneficiaryPincode);*/

						var sRecordType = objSearchResult[i].getValue({name: "recordtype"});
						log.debug('getInputData', ' sRecordType  -->' + sRecordType);

						var transactionRefNo = objSearchResult[i].getValue({name: "refnumber"});
						log.debug('getInputData', ' transactionRefNo  -->' + transactionRefNo);

						var printLocation="";
						var payableLocation="";

						var paymentDetails1 ="";
						var paymentDetails2 ="";
						var paymentDetails3 ="";
						var paymentDetails4 ="";
						var paymentDetails5 ="";
						var paymentDetails6 ="";
						var paymentDetails7 ="";

						var micrNo ="";
						var beneficiaryBankBranchName="";			
						var beneficiaryEmailId=objSearchResult[i].getValue({name: "email",join: "vendor",label:"Email"});
						if(beneficiaryEmailId){
							beneficiaryEmailId = beneficiaryEmailId.substring(0,bftEmailId)
						}else{
							beneficiaryEmailId="";
							beneficiaryEmailId = 'pralhad@yantrainc.com'
						}
						log.debug('getInputData', ' beneficiaryEmailId  -->' + beneficiaryEmailId);
						;


						//fileString +=","+ "," + 
						fileString +=	transactionType+ "," +	
						beneficiaryCode+","+
						beneficiaryAccountNo+","+
						transactionAmount+ "," +
						beneficiaryName+ "," +
						payableLocation+","+
						printLocation+","+
						beneficiaryAddr1+','+
						beneficiaryAddr2+','+
						beneficiaryAddr3+','+
						beneficiaryAddr4+','+
						beneficiaryAddr5+','+
						beneficiaryName_BankStatment+","+						
						customerRefNo+ "," +						
						customerRefNo+ "," +
						paymentDetails2+ "," +
						paymentDetails3+ "," +
						paymentDetails4+ "," +
						paymentDetails5+ "," +
						paymentDetails6+ "," +
						paymentDetails7+ "," +
						checkNumber+","+
						recordDueDate+","+				
						micrNo+","+
						beneficiaryBankIFSCCode+","+
						beneficiaryBankName+","+	
						beneficiaryBankBranchName+","+
						beneficiaryEmailId

						fileString = fileString+"\n"; 

						returnValue[recordID] = {"vendor_id":  vendor_id, "ben_account" :beneficiaryAccountNo , "ben_ifsc_code" :beneficiaryBankIFSCCode , "vb_amt_paid" : i_AMT_TO_PAID_ , "vb_recordtype": sRecordType, "vb_id" : recordID , "vb_timestamp":currentDateTimeStamp,'recName':sName,'user_id':USER_ID,'bank_payment_method':paymentMethodId,'payment_date':recordDueDate};

					}

					var objFile = file.create({ name: fileName, fileType: file.Type.PLAINTEXT, contents: fileString, folder: paymentFolderId });

					var fileSaveId = objFile.save();
					log.debug('getInputData', ' fileSaveId  -->' + fileSaveId);

				}

			}
			//---------------------------------------------- Start - Get Values from Search and create Payment file ---------------------------------------------------------------------//

			//----------------------------------------------Start -  SFTP CONNECTION - UPLOAD -------------------------------------------------------------------------------------//
			var success_fail_flag = false;			

			//log.debug('getInputData', 'sftpUsername  -->'+sftpUsername);
			//log.debug('getInputData', 'sftpPasswordGuid  -->'+sftpPasswordGuid);
			//log.debug('getInputData', 'sftpHostKey  -->'+sftpHostKey);
			//log.debug('getInputData', 'sftpHostKeyType  -->'+sftpHostKeyType);
			//log.debug('getInputData', 'sftpURL  -->'+sftpURL);

			try
			{
				/*var objSFTPConnection = sftp.createConnection({ username : sftpUsername, keyId : sftpPasswordGuid, hostKey : sftpHostKey, hostKeyType : sftpHostKeyType, url : sftpURL , port : 22});
					log.debug('getInputData', 'objSFTPConnection  -->'+objSFTPConnection); 

					var objSFTPUpload = objSFTPConnection.upload({ directory: sftpInputFolderPath, filename: fileName+".txt", file: objFile, replaceExisting: false });
					log.debug('getInputData',"objSFTPUpload =="+objSFTPUpload); */

				try
				{
					//	var objSFTPConnection = sftp.createConnection({ url : sftpURL , keyId : sftpPasswordGuid,  hostKey : sftpHostKey , username : sftpUsername, port : 22 , hostKeyType : sftpHostKeyType});

					log.debug('getInputData', 'sftpInputFolderPath  -->'+sftpInputFolderPath); 

					var objSFTPConnection = sftp.createConnection({username: sftpUsername, keyId:sftpPasswordGuid, url: sftpURL, directory: sftpInputFolderPath,  hostKey: sftpHostKey});

					log.debug('getInputData:objSFTPConnection==',objSFTPConnection); 
					log.debug('getInputData:fileName==',fileName); 
					//var objSFTPUpload = objSFTPConnection.upload({ filename: fileName+".txt", file: objFile, replaceExisting: false });
					var objSFTPUpload = objSFTPConnection.upload({ filename: fileName, file: objFile, replaceExisting: false });
					log.debug('getInputData:objSFTPUpload ==',objSFTPUpload);
				}
				catch(ewww)
				{
					log.debug('error',"exception caught =="+ewww);
				}

				/*if(fileSaveId){
						var incrementedAutoNo = parseInt(i_payment_file_sequence) + parseInt(1);
						log.debug('getInputData',' incrementedAutoNo -->'+incrementedAutoNo); 
						if(incrementedAutoNo){
							var autoNoRecordSaveId = record.submitFields({type: 'customrecord_file_auto_numbering',id: 1, values: { custrecord_f_an_date: new Date,custrecord_f_an_incremental_number:incrementedAutoNo }, 
								options: {enableSourcing: true,ignoreMandatoryFields : true}});
						}
						log.debug('getInputData',' autoNoRecordSaveId -->'+autoNoRecordSaveId); 
					}*/
				success_fail_flag = true;
			}
			catch(exqw)
			{
				var errString =  'Error :' + exqw.name + ' : ' + exqw.type + ' : ' + exqw.message;
				log.error("debug"," Exception Caught -->"+errString);
				success_fail_flag = false ;				
			}
			//----------------------------------------------End -  SFTP CONNECTION - UPLOAD -------------------------------------------------------------------------------------//

			arrTransactionNo = remove_duplicates(arrTransactionNo);

			var banklogRecordId = createBankIntegrationlogs(sName,USER_ID,todayDate,getCurrentDateTime , success_fail_flag ,fileSaveId ,i_payment_file_sequence ,fileName ,arrTransactionNo);
			log.debug('getInputData',' banklogRecordId -->'+banklogRecordId);


			log.debug('getInputData','----------------------------------------- Execution Ends Here ------------------------------------------------------');
		}
		catch(e){
			var errString =  'Error :' + e.name + ' : ' + e.type + ' : ' + e.message;
			log.error('debug','errString -->'+errString);
		}

		return returnValue
	}	
	function map(context) 
	{
		var i_BD_submitID = '';
		try
		{
			log.debug("---Map-----");			
			var objScript = runtime.getCurrentScript();
			
			var configRecObj	= config.load({type: config.Type.USER_PREFERENCES});
			var dateFormatValue	= configRecObj.getValue({fieldId: 'DATEFORMAT'});
			log.debug("map",'dateFormatValue=='+dateFormatValue);

			var USER_ID = objScript.getParameter({name: 'custscript_user_'});
			var TRANSMISSION_DATE = objScript.getParameter({name: 'custscript_transmission_date_'});
			var BANKACCOUNT = objScript.getParameter({name: 'custscript_account_'});
			var BANK_PAYMENT_METHOD = objScript.getParameter({name: 'custscript_bnk_pmt_method_'});
			var BANK_ACCOUNT_NO = objScript.getParameter({name: 'custscript_account__no_'});
			var AMOUNT_ID_ARRAY = objScript.getParameter({name: 'custscript_amount_id_arr'});

			var key = context.key
			log.debug("map", 'key -->'+key);

			var value = context.value;
			log.debug("map", 'Value JSON Stringify -->'+JSON.stringify(value));

			value = JSON.parse(value);

			if(_logValidation(key))
			{
				var recordtype =  value.vb_recordtype			  
				//	var bank_account_X = value.vb_account
				var bank_method_type_X =  value.vb_bank_method
				var bank_amount_X = value.vb_amt_paid ;
				//	var vb_customer_ref_no = value.vb_customer_ref_no ;
				var vb_timestamp = value.vb_timestamp ;
				var recName = value.recName ;				
				var getUserId = value.user_id ;
				var getPaymentMethod = value.bank_payment_method ;
				var vendor_id = value.vendor_id ;

				var benf_account_code = value.ben_account ;
				var ben_ifsc_code = value.ben_ifsc_code ;

				var vendorbillId = value.vb_id;
				var paymentDate = value.payment_date

				var todays_date = convert_date(new Date());
				log.debug("map", 'vendorbillId -->'+vendorbillId);				
				log.debug("map", 'recordtype -->'+recordtype);
				log.debug("map", 'vb_timestamp -->'+vb_timestamp);
				log.debug("map", 'getUserId -->'+getUserId);
				log.debug("map", 'getPaymentMethod -->'+getPaymentMethod);
				log.debug("map", 'paymentDate -->'+paymentDate);

				var splitgetUserId = getUserId.toString().split(' ');

				var userId = splitgetUserId[0];
				log.debug("map", 'userId -->'+userId);

				var primaryKeyValue = key+""+vb_timestamp;


				try
				{					
					var i_VB_submitID = record.submitFields({type: recordtype,id: key, values: { custbody_hdfc_bank_payment_hold: true }, options: {enableSourcing: true,ignoreMandatoryFields : true}});
					log.debug('map',' VB_submitID -->'+i_VB_submitID); 

					try
					{
						var integrationLogId ="";

						if(recName){
							var customrecord_bank_integration_logsSearchObj = search.create({type: "customrecord_bank_integration_logs",
								filters:
									[
										["name","is",recName],"AND",["isinactive","is","F"]
										],
										columns:
											[
												search.createColumn({name: "internalid", label: "Internal ID"})
												]
							});
							var searchResultCount = customrecord_bank_integration_logsSearchObj.runPaged().count;
							log.debug("customrecord_bank_integration_logsSearchObj result count",searchResultCount);
							customrecord_bank_integration_logsSearchObj.run().each(function(result){
								// .run().each has a limit of 4,000 results
								integrationLogId = result.getValue({name: "internalid", label: "Internal ID"});
								return true;
							});
						}

						var objBankDetails = record.create({type : 'customrecord_hdfc_bank_details',isDynamic : true});
						if(recName){
							objBankDetails.setValue({ fieldId: 'name', value: recName});
						}
						if(integrationLogId){
							objBankDetails.setValue({fieldId: 'custrecord_hbd_bank_logs',value: integrationLogId,ignoreFieldChange: false}); 
						}
						if(key){
							objBankDetails.setValue({fieldId: 'custrecord_hbd_transaction',value: key,ignoreFieldChange: false});
						}
						if(primaryKeyValue){
							objBankDetails.setValue({fieldId: 'custrecord_hbd_primary_key',value: primaryKeyValue,ignoreFieldChange: false});
						}
						if(todays_date){
							objBankDetails.setValue({fieldId: 'custrecord_hbd_created_date',value: todays_date,ignoreFieldChange: false});
						}
						if(userId){
							objBankDetails.setValue({fieldId: 'custrecord_hbd_user',value: parseInt(userId),ignoreFieldChange: false});
						}
						if(BANKACCOUNT){
							objBankDetails.setValue({fieldId: 'custrecord_hbd_debit_account_',value: BANKACCOUNT,ignoreFieldChange: false});
						}
						if(ben_ifsc_code){
							objBankDetails.setValue({fieldId: 'custrecord_hbd_ifsc_code',value: ben_ifsc_code,ignoreFieldChange: false});
						}
						if(bank_amount_X){
							objBankDetails.setValue({fieldId: 'custrecord_hbd_payment_amount',value: bank_amount_X,ignoreFieldChange: false});
						}
						if(benf_account_code){
							objBankDetails.setValue({fieldId: 'custrecord_hbd_benificiary_account_no',value: benf_account_code,ignoreFieldChange: false});
						}
						if(vendor_id){
							objBankDetails.setValue({fieldId: 'custrecord_hbd_vendor_',value: vendor_id,ignoreFieldChange: false});
						}
						if(paymentDate){
							//objBankDetails.setValue({fieldId: 'custrecord_hbd_payment_date',value: todays_date,ignoreFieldChange: false});		
							/*var parsedPaymentDate = format.parse({ value: paymentDate, type: format.Type.DATE })
							log.debug("map", 'parsedPaymentDate*1 -->'+parsedPaymentDate);*/
						
							var formatedDate = getDateFormat(paymentDate,dateFormatValue);
							log.debug('TestLog','formatedDate==' + formatedDate )
							var DateValue= format.parse({value:formatedDate, type: format.Type.DATE})
							log.debug('TestLog','DateValue==' + DateValue )
							
							
							
							if(DateValue){
								objBankDetails.setValue({fieldId: 'custrecord_hbd_payment_date',value: DateValue,ignoreFieldChange: false});
							}
							/*					
							if(paymentDate){
								var formatted_paymentDate = format.format({ value: paymentDate, type: format.Type.DATE })
								log.debug("map", 'formatted_paymentDate*1 -->'+formatted_paymentDate);
								objBankDetails.setValue({fieldId: 'custrecord_hbd_payment_date',value: formatted_paymentDate,ignoreFieldChange: false});
							}
							if(paymentDate){
								
								log.debug("map", 'new Date(paymentDate)*1 -->'+new Date(paymentDate));
								objBankDetails.setValue({fieldId: 'custrecord_hbd_payment_date',value: new Date(paymentDate),ignoreFieldChange: false});
							}*/
						}
						if(userId){
							objBankDetails.setValue({fieldId: 'custrecord_hbd_approval_user',value: userId,ignoreFieldChange: false});
						}
						if(todays_date){
							objBankDetails.setValue({fieldId: 'custrecord_hbd_approval_date',value: todays_date,ignoreFieldChange: false});
						}
						if(getUserId){
							objBankDetails.setValue({fieldId: 'custrecord_hbd_approved_by',value: getUserId,ignoreFieldChange: false});	
						}
						if(getPaymentMethod){
							objBankDetails.setValue({fieldId: 'custrecord_hbd_payment_method',value:getPaymentMethod,ignoreFieldChange: false});
						}
						/*if(getPaymentMethod=='N'){
								objBankDetails.setValue({fieldId: 'custrecord_hbd_payment_method',value:7,ignoreFieldChange: false});
							}
							else if(getPaymentMethod=='R'){
								objBankDetails.setValue({fieldId: 'custrecord_hbd_payment_method',value:8 ,ignoreFieldChange: false});
							}*/
						i_BD_submitID = objBankDetails.save({enableSourcing: true,ignoreMandatoryFields: true});
						log.debug("map", 'i_BD_submitID -->'+i_BD_submitID);
					}	
					catch(excsd)
					{	
						log.debug("map", 'ERROR -->'+excsd);
					}								
				}	
				catch(exwqnh)
				{
					log.debug('debug',' Exception Caught ... -->'+exwqnh);     
				}
			}

			context.write({key: context.key , value: i_BD_submitID});
		}
		catch(ex)
		{
			log.error('debug','map error: '+ex.message);	
		}
	}

	function reduce(context)
	{

		try
		{		
			context.write({ key: context.key , value: context.values}); 


		}
		catch(ex)
		{
			log.error('reduce error: ', ex.message);	
		}    	
	}
	function summarize(summary) {   
		try{ 	 
			var type = summary.toString();
			var vend_id = [];
			log.debug(type + ' Usage Consumed', summary.usage);
			log.debug(type + ' Concurrency Number ', summary.concurrency);
			log.debug(type + ' Number of Yields', summary.yields);

			// HTML Head in Tables 
			var html = '';

			html += '<table style="border:1px solid black ">';

			html += '<tr>'

				html += '<td style="border-right:1px solid black; border-bottom:1px solid black">ENTITY</td>';
			html += '<td style="border-right:1px solid black; border-bottom:1px solid black">VENDOR</td>';
			html += '<td style="border-right:1px solid black; border-bottom:1px solid black">PAYMENT DATE</td>';
			html += '<td style="border-right:1px solid black; border-bottom:1px solid black">NARRATION</td>';
			html += '<td style="border-right:1px solid black; border-bottom:1px solid black">AMOUNT</td>';
			//html += '<td style="border-right:1px solid black; border-bottom:1px solid black">CGST</td>';
			//html += '<td style="border-right:1px solid black; border-bottom:1px solid black">SGST</td>';
			//html += '<td style="border-right:1px solid black; border-bottom:1px solid black">IGST</td>';
			html += '<td style="border-right:1px solid black; border-bottom:1px solid black">GROSS AMT</td>';
			html += '<td style="border-right:1px solid black; border-bottom:1px solid black">TDS</td>';
			html += '<td style="border-right:1px solid black; border-bottom:1px solid black">NET AMOUNT</td>';
			html += '<td style="border-right:1px solid black; border-bottom:1px solid black">TRANSACTION NUMBER</td>';
			html += '<td style="border-right:0px solid black; border-bottom:1px solid black">ATTACHMENT LINK</td>';
			html += '<\/tr>'

				// HTML END Head Code



				summary.output.iterator().each(function(key, value)
						{
					log.debug('value',JSON.parse(value));
					//vend_id.push(value);


					/*	var customrecord_hdfc_bank_detailsSearchObj = search.create({
							type: "customrecord_hdfc_bank_details",
							filters:
								[
									["internalid","anyof",JSON.parse(value)], 
									"AND", 
									["custrecord_hbd_transaction.mainline","is","T"]
									],
									columns:
										[
											search.createColumn({
												name: "custbody19",
												join: "CUSTRECORD_HBD_TRANSACTION",
												label: "Vendor Name"
											}),
											search.createColumn({
												name: "memo",
												join: "CUSTRECORD_HBD_TRANSACTION",
												label: "Memo"
											}),
											search.createColumn({name: "custrecord_hbd_payment_amount", label: "Payment Amount"}),
											search.createColumn({
												name: "custbody_cgstamount",
												join: "CUSTRECORD_HBD_TRANSACTION",
												label: "CGST Amount"
											}),
											search.createColumn({
												name: "custbody_sgstamount",
												join: "CUSTRECORD_HBD_TRANSACTION",
												label: "SGST Amount"
											}),
											search.createColumn({
												name: "custbodyigstamount",
												join: "CUSTRECORD_HBD_TRANSACTION",
												label: "IGST Amount"
											}),
											search.createColumn({
												name: "grossamount",
												join: "CUSTRECORD_HBD_TRANSACTION",
												label: "Amount (Gross)"
											}),
											search.createColumn({
												name: "custcol_tdsamount",
												join: "CUSTRECORD_HBD_TRANSACTION",
												label: "TDS Amount"
											}),
											search.createColumn({
												name: "netamount",
												join: "CUSTRECORD_HBD_TRANSACTION",
												label: "Amount (Net)"
											}),
											search.createColumn({
												name: "transactionnumber",
												join: "CUSTRECORD_HBD_TRANSACTION",
												label: "Transaction Number"
											}),
											search.createColumn({
												name: "custbody_attachpreappdoc",
												join: "CUSTRECORD_HBD_TRANSACTION",
												label: "Attach Pre-Approved Doc"
											}),
											search.createColumn({name: "internalid", label: "Internal ID"})
											]
						});
						var searchResultCount = customrecord_hdfc_bank_detailsSearchObj.runPaged().count;
						log.debug("customrecord_hdfc_bank_detailsSearchObj result count",searchResultCount);


						customrecord_hdfc_bank_detailsSearchObj.run().each(function(result){

							var cgst = result.getValue({ name: "custbody_cgstamount",join: "CUSTRECORD_HBD_TRANSACTION",label: "CGST Amount"})

							var sgst = result.getValue({ name: "custbody_sgstamount",join: "CUSTRECORD_HBD_TRANSACTION",label: "SGST Amount"}) 

							var igst = result.getValue({ name: "custbodyigstamount",join: "CUSTRECORD_HBD_TRANSACTION",label: "IGST Amount"})

							var attachedFile = result.getValue({ name: "custbody_attachpreappdoc",join: "CUSTRECORD_HBD_TRANSACTION",label: "Attach Pre-Approved Doc"})

							var to_userlogo = file.load({
								id: attachedFile,
							});

							var netsuiteUrl = 'https://5123585-sb1.app.netsuite.com'
								var  finalUrl =  netsuiteUrl + to_userlogo.url 

								var transNumber = result.getValue({ name: "transactionnumber", join: "CUSTRECORD_HBD_TRANSACTION", label: "Transaction Number"});							
								var urlString = "<a href='"+finalUrl+"' target='_blank' style='font-size:10pt'>"+transNumber+"</a><br/>";

								if(cgst){
									cgst = cgst
								}
								else{
									cgst = 0
								}

							if(sgst){
								sgst = sgst
							}
							else{
								sgst= 0
							}

							if(igst){
								igst =igst
							}
							else{
								igst = 0
							}

							// Values Gettting for Head 
							html += '<tr>'
								html += '<td style="border-right:1px solid black; border-bottom:0px solid black">'+result.getValue({name: "custbody19", join: "CUSTRECORD_HBD_TRANSACTION", label: "Vendor Name"})+'<\/td>'
								html += '<td style="border-right:1px solid black; border-bottom:0px solid black">'+result.getValue({name: "memo", join: "CUSTRECORD_HBD_TRANSACTION",label: "Memo"})+'<\/td>'
								html += '<td style="border-right:1px solid black; border-bottom:0px solid black">'+result.getValue({name: "custrecord_hbd_payment_amount", label: "Payment Amount" })+'<\/td>'
								html += '<td style="border-right:1px solid black; border-bottom:0px solid black">'+cgst+'<\/td>'
								html += '<td style="border-right:1px solid black; border-bottom:0px solid black">'+sgst+'<\/td>'
								html += '<td style="border-right:1px solid black; border-bottom:0px solid black">'+igst+'<\/td>'
								//html += '<td style="border-right:1px solid black; border-bottom:0px solid black">'+result.getValue({ name: "grossamount",join: "CUSTRECORD_HBD_TRANSACTION",label: "Amount (Gross)"})+'<\/td>'
								html += '<td style="border-right:1px solid black; border-bottom:0px solid black">'+result.getValue({ name: "grossamount",join: "CUSTRECORD_HBD_TRANSACTION",label: "Amount (Gross)"})+'<\/td>'
								html += '<td style="border-right:1px solid black; border-bottom:0px solid black">'+result.getValue({name: "custcol_tdsamount",join: "CUSTRECORD_HBD_TRANSACTION",label: "TDS Amount"})+'<\/td>'
								html += '<td style="border-right:1px solid black; border-bottom:0px solid black">'+result.getValue({ name: "netamount",join: "CUSTRECORD_HBD_TRANSACTION",label: "Amount (Net)"})+'<\/td>'
								html += '<td style="border-right:1px solid black; border-bottom:0px solid black">'+result.getValue({ name: "transactionnumber", join: "CUSTRECORD_HBD_TRANSACTION", label: "Transaction Number"})+'<\/td>'
								//html += '<td style="border-right:0px solid black; border-bottom:0px solid black">'+finalUrl+'<\/td>'
								html += '<td style="border-right:0px solid black; border-bottom:0px solid black">'+urlString+'<\/td>'
								html += '<\/tr>'
									//End Value Getting For HTML Head
									return true;
						});*/

					// End of Scripted Search Code


					//----------------------------------------------- start - Get Details for Email notification --------------------------------------------------------//
					var vendorbillSearchObj = search.create({
						type: "vendorbill",
						filters:
							[
								["type","anyof","VendBill"], "AND", ["custrecord_hbd_transaction.internalid","anyof",JSON.parse(value)], "AND", ["mainline","is","T"]
								],
								columns:
									[
										search.createColumn({name: "fxamount",  label: "Amount (Foreign Currency)"}),
										search.createColumn({name: "subsidiary",  label: "Subsidiary"}),
										search.createColumn({name: "custbody19",  label: "Vendor Name"}),
										search.createColumn({name: "custrecord_hbd_payment_date", join: "CUSTRECORD_HBD_TRANSACTION", label: "Payment Date"}),
										search.createColumn({name: "memo",  label: "Memo"}),										
										search.createColumn({name: "custrecord_hbd_payment_amount", join: "CUSTRECORD_HBD_TRANSACTION", label: "Payment Amount"}),
										search.createColumn({name: "custbody_cgstamount",  label: "CGST Amount"}),
										search.createColumn({name: "custbody_sgstamount", label: "SGST Amount"}),
										search.createColumn({name: "custbodyigstamount", label: "IGST Amount"}),
										search.createColumn({name: "grossamount", label: "Amount (Gross)"}),
										/*search.createColumn({ name: "formulacurrency", formula: "{grossamount}", label: "Formula (Currency)" }),*/
										search.createColumn({name: "netamount", label: "Amount (Net)"}),
										search.createColumn({name: "taxamount",  label: "Amount (Tax)"}),
										search.createColumn({name: "amount",  label: "Amount"}),
										search.createColumn({name: "transactionnumber", label: "Transaction Number"}),
										search.createColumn({name: "custbody_tdsamounty",  label: "Total TDS amount"}),
										search.createColumn({name: "custbody_attachpreappdoc",  label: "Attach Pre-Approved Doc"}),
										search.createColumn({name: "internalid",label: "Internal ID"}),
										search.createColumn({ name: "formulacurrency", formula: "-{taxtotal}+{grossamount}", label: "Formula (Currency)" })
										],
										settings: [{name: "consolidationtype",value: "NONE"}]
					});
					var searchResultCount = vendorbillSearchObj.runPaged().count;
					log.debug("vendorbillSearchObj result count",searchResultCount);
					vendorbillSearchObj.run().each(function(result){
						// .run().each has a limit of 4,000 results

						var entityName = result.getText({name: "subsidiary",  label: "Subsidiary"});
						var vendorName = result.getValue({name: "custbody19",  label: "Vendor Name"});
						var paymentDate = result.getValue({name: "custrecord_hbd_payment_date", join: "CUSTRECORD_HBD_TRANSACTION", label: "Payment Date"});
						var memo = result.getValue({name: "memo",  label: "Memo"});
						var getPaymentAmount = result.getValue({name: "custrecord_hbd_payment_amount", join: "CUSTRECORD_HBD_TRANSACTION",label: "Payment Amount"});							
						//var cgstAmount = result.getValue({name: "custbody_cgstamount", label: "CGST Amount"});
						//var sgstAmount = result.getValue({name: "custbody_sgstamount", label: "SGST Amount"});
						//var igstAmount = result.getValue({name: "custbodyigstamount", label: "IGST Amount"});
						//var grossAmount = result.getValue({name: "grossamount", label: "Amount (Gross)"});
						/*var grossAmount =result.getValue({ name: "formulacurrency", formula: "{grossamount}", label: "Formula (Currency)" })*/		
						var grossAmount = result.getValue({name: "formulacurrency", formula: "-{taxtotal}+{grossamount}", label: "Formula (Currency)" });
						var tdsAmount = result.getValue({name: "custbody_tdsamounty", label: "Total TDS amount"});
						var netAmount = result.getValue({name: "netamount", label: "Amount (Net)"});						
						var transactionNumber = result.getValue({name: "transactionnumber", label: "Transaction Number"});
						var attachmentLinkDocId = result.getValue({name: "custbody_attachpreappdoc",  label: "Attach Pre-Approved Doc"});

						log.debug("summarize","entityName=="+entityName);
						if(entityName){
							var splittedEntityName = entityName.toString().split(':');
							log.debug("summarize","splittedEntityName=="+splittedEntityName);
							log.debug("summarize","splittedEntityName.length=="+splittedEntityName.lenght);
							entityName=splittedEntityName[splittedEntityName.length-1];
							}
						else{
							entityName="";
						}
						log.debug("summarize","entityName**1=="+entityName);
						log.debug("summarize","paymentDate=="+paymentDate);
						if(entityName){entityName=entityName;}else{entityName="";}
						if(vendorName){vendorName=vendorName;}else{vendorName="";}
						if(paymentDate){paymentDate=paymentDate;}else{paymentDate="";}
						if(memo){memo=memo;}else{memo="";}
						if(getPaymentAmount){getPaymentAmount=getPaymentAmount;}else{getPaymentAmount="";}
						//if(cgstAmount){cgstAmount=cgstAmount;}else{cgstAmount="";}
						//if(sgstAmount){sgstAmount=sgstAmount;}else{sgstAmount="";}
						//if(igstAmount){igstAmount=igstAmount;}else{igstAmount="";}
						if(grossAmount){grossAmount=grossAmount;}else{grossAmount="";}
						if(tdsAmount){tdsAmount=tdsAmount;}else{tdsAmount="";}
						if(netAmount){netAmount=netAmount;}else{netAmount="";}
						if(transactionNumber){transactionNumber=transactionNumber;}else{transactionNumber="";}

						var urlString ="";
						if(attachmentLinkDocId){
							var to_userlogo = file.load({id: attachmentLinkDocId});
							
							to_userlogo.isOnline = true;
							
							var netsuiteUrl = 'https://5123585-sb1.app.netsuite.com'
								var  finalUrl =  netsuiteUrl + to_userlogo.url 
								urlString = "<a href='"+finalUrl+"' target='_blank' style='font-size:10pt'>"+transactionNumber+"</a><br/>";
						}
						else{
							urlString="";
						}


						// Values Gettting for Head 
						html += '<tr>'
							html += '<td style="border-right:1px solid black; border-bottom:0px solid black">'+entityName+'<\/td>'
							html += '<td style="border-right:1px solid black; border-bottom:0px solid black">'+vendorName+'<\/td>'
							html += '<td style="border-right:1px solid black; border-bottom:0px solid black">'+paymentDate+'<\/td>'
							html += '<td style="border-right:1px solid black; border-bottom:0px solid black">'+memo+'<\/td>'
							html += '<td style="border-right:1px solid black; border-bottom:0px solid black">'+getPaymentAmount+'<\/td>'								
							html += '<td style="border-right:1px solid black; border-bottom:0px solid black">'+grossAmount+'<\/td>'
							html += '<td style="border-right:1px solid black; border-bottom:0px solid black">'+tdsAmount+'<\/td>'
							html += '<td style="border-right:1px solid black; border-bottom:0px solid black">'+netAmount+'<\/td>'
							html += '<td style="border-right:1px solid black; border-bottom:0px solid black">'+transactionNumber+'<\/td>'							
							html += '<td style="border-right:0px solid black; border-bottom:0px solid black">'+urlString+'<\/td>'
							html += '<\/tr>'
								//End Value Getting For HTML Head
								return true;
					});

					/*
							vendorbillSearchObj.id="customsearch1670588929812";
							vendorbillSearchObj.title="Transaction search for Bank details (copy)";
							var newSearchId = vendorbillSearchObj.save();
					 */


					//----------------------------------------------- end - Get Details for Email notification --------------------------------------------------------//



					return true;
						}); 

			html += '</table>'

				log.debug('html',html);


			//Email Send Code API
			email.send({
				author:302704,
				//author:-5,
				recipients:'pralhad@yantrainc.com',
				subject: 'Vendor Bill Payment File',
				body:'We acknowledge that we have received the Vendor Payment <br/> <br/>'+html,

			});

			log.debug('Email Send');

			//End Email Send Code API


		}
		catch(ex){

			log.debug('Error in Summarize Function',ex.message);
		}

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
	function append_zero_in_date(date_q , DATEFORMAT)
	{
		log.debug('append_zero_in_date','date_q=='+date_q);
		log.debug('append_zero_in_date','DATEFORMAT=='+DATEFORMAT);
		var return_str = "";	
		try
		{
			var date_x = format.parse({value:date_q,type:format.Type.DATE}) 	
			var day_x = date_x.getDate();
			var month_x = date_x.getMonth()+1 ;
			var year_x = date_x.getFullYear();

			if(day_x < 10)
			{
				day_x = '0'+day_x ;
			}
			if(month_x < 10)
			{
				month_x = '0'+month_x 
			}			 

			DATEFORMAT = DATEFORMAT.replace(/DD/g,day_x);
			DATEFORMAT = DATEFORMAT.replace(/MM/g,month_x);
			DATEFORMAT = DATEFORMAT.replace(/YYYY/g,year_x);

			return_str = DATEFORMAT;		 
		}	
		catch(excdqw)
		{
			log.debug("Exception -->"+excdqw)  
		}	
		return return_str;
	}
	function amount_formatting(amount , AMT_FORMAT)
	{
		var return_data = "";	
		try
		{
			var result = AMT_FORMAT.toString().split(',');
			var result_1 = result[0];
			var result_2 = result[1];

			var amt_result = amount.toString().split('.');
			var amt_result_1 = amt_result[0];
			var amt_result_2 = amt_result[1];

			var amt_1 = amt_result_1.substring(0,result_1);
			var amt_2 = amt_result_2.substring(0,result_2);
			var amt   = amt_1 + '.' + amt_2 ;
			return_data = amt ;

		}	
		catch(exsdd)
		{
			log.debug("Exception -->"+exsdd) 
		}
		return return_data ;	
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

	function createBankIntegrationlogs(sName,USER_ID,todayDate,getCurrentDateTime , success_fail_flag ,fileSaveId ,i_payment_file_sequence ,fileName ,arrTransactionNo)
	{
		try
		{
			var objBankintegrationlogs = record.create({type : 'customrecord_bank_integration_logs',isDynamic : true});
			if(sName){
				objBankintegrationlogs.setValue({ fieldId: 'name', value: sName}); 
			}

			/*	if(success_fail_flag){
					objBankintegrationlogs.setValue({fieldId: 'custrecord_bil_status',value: 3,ignoreFieldChange: false});
				}
				else*/ {
					objBankintegrationlogs.setValue({fieldId: 'custrecord_bil_status',value: 2,ignoreFieldChange: false});
				}

				if(_logValidation(fileSaveId)){
					objBankintegrationlogs.setValue({fieldId: 'custrecord_bil_payment_file',value: fileSaveId,ignoreFieldChange: false});
				}
				//objBankintegrationlogs.setValue({fieldId: 'custrecord_bil_reversal_file',value: fileSaveId ,ignoreFieldChange: false});  

				if(_logValidation(arrTransactionNo))
				{	
					/*for(var t=0;t<arrTransactionNo.length;t++)
					{*/
					objBankintegrationlogs.setValue({fieldId: 'custrecord_bil_transaction',value: arrTransactionNo ,ignoreFieldChange: false});  
					//}
				}							
				var i_logs_submitID = objBankintegrationlogs.save({enableSourcing: true,ignoreMandatoryFields: true});
				log.debug('createBankIntegrationlogs',' i_logs_submitID=='+i_logs_submitID);			
		}	
		catch(excsd)
		{
			log.debug('createBankIntegrationlogs','****** ERROR ***** -->'+excsd);		
		}		
		return i_logs_submitID;
	}
	function update_processed(a_transaction_array)
	{
		try
		{
			for(var p_1 =0 ; p_1 <a_transaction_array.length ; p_1++)
			{
				if(_logValidation(a_transaction_array[p_1]))
				{
					try
					{
						var i_TR_submitID = record.submitFields({type: "vendorbill",id: a_transaction_array[p_1], 
							values: {   		    
								custbody_is_bank_file_created: true						
							},
							options: {enableSourcing: true,ignoreMandatoryFields : true}});  
						log.debug('****** i_TR_submitID A ***** -->'+i_TR_submitID);		
					} 
					catch(excww)
					{
						var i_TR_submitID = record.submitFields({type: "vendorprepayment",id: a_transaction_array[p_1], 
							values: {   		    
								custbody_is_bank_file_created: true						
							},
							options: {enableSourcing: true,ignoreMandatoryFields : true}}); 
						log.debug('****** i_TR_submitID B ***** -->'+i_TR_submitID);					
					}

				}			  
			}			
		}	
		catch(excs)
		{
			log.debug('****** ERROR UPDATE ***** -->'+excs);		 
		}
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
	function convertDate(dDate)
	{
		var dDate_convert = "" ;    

		if(_logValidation(dDate))
		{
			var dDate_convert = new Date(dDate);
			dDate_convert.setHours(dDate_convert.getHours() + 5); // set Hours to 5 hours later           
		}    
		return dDate_convert; 
	}

	function create_file_counter(file_counter , id_x)
	{
		log.audit('create_file_counter','********file_counter *********** -->'+file_counter);	
		log.audit('create_file_counter','********id_x *********** -->'+id_x);	
		try
		{
			if(!_logValidation(id_x))
			{
				var o_FL_OBJ = record.create({type: 'customrecord_file_auto_numbering',isDynamic: true});  
			}
			else
			{
				var o_FL_OBJ = record.load({type: 'customrecord_file_auto_numbering',id: id_x ,isDynamic: true});  
			}

			o_FL_OBJ.setValue({fieldId: 'custrecord_f_an_incremental_number',value: file_counter ,ignoreFieldChange: false}); 

			var d_date_R   = new Date();
			d_date_R = convert_date(d_date_R);

			o_FL_OBJ.setValue({fieldId: 'custrecord_f_an_date',value: d_date_R ,ignoreFieldChange: false}); 

			var i_FL_logs_submitID = o_FL_OBJ.save({enableSourcing: true,ignoreMandatoryFields: true});
			log.audit('************** FL Submit ID *********** -->'+i_FL_logs_submitID);	

		}	
		catch(excfr)
		{
			log.debug('****** ERROR Ex LOGS ***** -->'+excfr);		   
		}	
	}	
	function get_file_counter_no(file_initial_counter , DATE_TODAY) // customrecord_file_auto_numbering
	{
		log.audit('get_file_counter_no','********file_initial_counter *********** -->'+file_initial_counter);	
		log.audit('get_file_counter_no','********DATE_TODAY *********** -->'+DATE_TODAY);	

		var finalSeqNo = 0;
		var seqNo = 0 ;
		var id_cnt = 0;
		try
		{		 
			try
			{				
				var customrecord_file_auto_numberingSearchObj = search.create({
					type: "customrecord_file_auto_numbering",
					filters:
						[
							["custrecord_f_an_date","on",DATE_TODAY]
							],
							columns:
								[
									search.createColumn({name: "internalid", label: "Internal ID"}),
									search.createColumn({name: "custrecord_f_an_date", label: "Date"}),
									search.createColumn({name: "custrecord_f_an_incremental_number", label: "Incremental Number"})
									]
				});
				var searchResultCount = customrecord_file_auto_numberingSearchObj.runPaged().count;
				log.debug("customrecord_file_auto_numberingSearchObj result count",searchResultCount);
				customrecord_file_auto_numberingSearchObj.run().each(function(result){
					var id_ = result.getValue({name: "internalid"});
					log.audit('get_file_counter_no','********id_ *********** -->'+id_);	
					id_cnt = id_ ;
					seqNo = result.getValue({name: "custrecord_f_an_incremental_number"});			  
					return true;
				});
			} 
			catch(excdq)
			{
				log.debug("excdq excdq "+excdq)
			}		 				
			if(seqNo!=0 && seqNo!=null & seqNo!='' && seqNo!=undefined)
			{
				finalSeqNo = Number(seqNo)+1;
			}
			if(seqNo == null || seqNo == "" || seqNo == undefined)
			{
				finalSeqNo = file_initial_counter;
			}
			create_file_counter(finalSeqNo , id_cnt)

		}	
		catch(excd)
		{
			log.debug("excd -->"+excd) 
		}		
		return finalSeqNo ;
	}
	return {
		getInputData: getInputData,
		map: map,
		reduce:reduce,
		summarize: summarize
	};

});