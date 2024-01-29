/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
//GetInputData : 10000 Units
//Map : 1000 Units
//Reduce : 5000 Units
//Summary : 10000 Units

define(['N/record', 'N/search', 'N/runtime', 'N/email', 'N/format', 'N/file', 'N/task', 'N/sftp', 'N/encode'],

		function(record, search, runtime, email, format, file, task, sftp, encode){

	function getInputData(context){
		var return_val = {};
		try
		{
			var arrTemp = [];
			var MODULE_FOLDER = 93228;
			var message_txt = "";
			var sucessString = "";
			var s_success_flag = "";

			var o_contextOBJ = runtime.getCurrentScript();
			CONTEXT_OBJ = o_contextOBJ;
			log.debug('schedulerFunction', ' Context OBJ --> ' + o_contextOBJ);

			// --------------------------------------------------------- Start - Connection to SFTP -------------------------------------------------------- //			
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

				log.debug('schedulerFunction',' SFTP Host-Key --> '+i_SFTP_host_key_GP);	
				log.debug('schedulerFunction',' SFTP URL --> '+i_SFTP_server_URL_GP);	
				log.debug('schedulerFunction',' SFTP User Name --> '+i_SFTP_user_name_GP);	
				log.debug('schedulerFunction',' SFTP Password Guid --> '+i_password_guid_GP);	
				log.debug('schedulerFunction',' SFTP i_SFTP_host_key_type_GP  --> '+i_SFTP_host_key_type_GP);	
				log.debug('schedulerFunction',' SFTP i_SFTP_directory  --> '+i_SFTP_directory);	
				log.debug('schedulerFunction',' SFTP i_SFTP_port  --> '+i_SFTP_port);    

			}
			catch (excsw) {
				log.debug("ERROR EXCEPTION", 'excsw -->' + excsw);
			}

			var reversalFolderId = "";
			try
			{
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

				if(_logValidation(searchResult_GC))
				{

					for(var gc=0;gc<searchResult_GC.length;gc++){

						internalID_GC = searchResult_GC[gc].getValue({name: 'internalid'});
						//vendorBillSearchId = 'customsearch_hdfc_bank_details_search_';//searchResult_GC[gc].getValue({name: 'custrecord_gc_payment_search'});
						vendorBillSearchId = searchResult_GC[gc].getValue({name: 'custrecord_gc_payment_search'});
						paymentFolderId = searchResult_GC[gc].getValue({name: 'custrecord_gc_ns_payment_folder'});
						reversalFolderId = searchResult_GC[gc].getValue({name: 'custrecord_gc_ns_reversal_folder'});
						clientScriptPath = searchResult_GC[gc].getValue({name: 'custrecord_gc_ns_clientscript_path'});
						defaultSubsidiary = searchResult_GC[gc].getValue({name: 'custrecord_gc_ns_default_subsidiary'});
						creditpaymentAppliedSearchId = searchResult_GC[gc].getValue({name: 'custrecord_gc_ns_creditpayment_applied'});
						bankAccountId = searchResult_GC[gc].getValue({name: 'custrecord_gc_ns_bank_account'});
						file_initial_counter = searchResult_GC[gc].getValue({name: 'custrecord_gc_ns_file_initial_counter'});
					}
				}
			}
			catch(exsss)
			{

			}

			//--------------------------------------------Start - SFTP Connection ------------------------------------------//
			var FILE_JSON = {};

			try 
			{
				/*	 var o_connectionOBJ = sftp.createConnection({
		             username     : i_SFTP_user_name_GP,
		             passwordGuid : i_password_guid_GP,
		             url          : i_SFTP_server_URL_GP,
		             hostKey      : i_SFTP_host_key_GP,
		             hostKeyType  : i_SFTP_host_key_type_GP,
					 port         : parseInt(i_SFTP_port)
		         }); */

				var o_connectionOBJ = sftp.createConnection({username: i_SFTP_user_name_GP, keyId:i_password_guid_GP, url: i_SFTP_server_URL_GP, directory: i_SFTP_directory,  hostKey: i_SFTP_host_key_GP,hostKeyType:i_SFTP_host_key_type_GP,port:parseInt(i_SFTP_port)});
				log.debug('schedulerFunction:Connection ==', o_connectionOBJ);
				s_success_flag = 1;
				var successFileContent = "successfully Create File" + '\n';
			}
			catch(exytr)
			{
				log.error('ERROR', 'Exception Caught While SFTP Connection -->' + exytr);
				var successFileContent = "fail-->" + exytr.message + '\n';

				s_success_flag = 2;
			}

			//	var objFile = file.load({id:920224});
			//	log.debug('execute','objFile=='+objFile);
			//log.debug('execute','objFile length=='+objFile.getContents().length);

			//var fileList = objFile;

			var  fileList = o_connectionOBJ.list();

			log.debug('fileList', fileList);
			log.debug('fileList.length', fileList.length);

			for(var i = 0; i < fileList.length; i++)
			{
				var file_directory = fileList[i].directory

				var f_name = fileList[i].name
				/*var f_name = 'HDSE0909.r001';
				log.debug('f_name', f_name)*/

				//var file_chk_str = f_name.indexOf("HS47");


				//if((file_directory == false) && (file_chk_str >-1))
				if((file_directory == false))
				{
					var f_name = fileList[i].name
					log.debug('f_name', f_name)

					var fname_STR = f_name+'.txt';
					try
					{
						var f_file_created = is_file_created(fname_STR) ;
						if(f_file_created){
							FILE_JSON[f_file_created] = {'file_id':f_file_created};
						}
					}
					catch(ecdd)
					{
						var f_file_created = "";
					}

					log.debug("f_file_created",' +++++++ FILE CREATED ++++++ -->'+ f_file_created+'++++ fname_STR ++++'+fname_STR);


					if(!_logValidation(f_file_created))
						//	if(fname_STR == 'HS47_REJECT_052022_221947399.xls.txt')
					{
						try
						{
							//var downloadFile = o_connectionOBJ.download({directory : i_SFTP_directory,filename:f_name	})
							var downloadFile = o_connectionOBJ.download({filename:f_name})

							var hexEncodedString = encode.convert({
								string: downloadFile.getContents(),
								inputEncoding: encode.Encoding.BASE_64,
								outputEncoding: encode.Encoding.UTF_8
							});

						//	var hexEncodedString = downloadFile.getContents();

							//var hexEncodedString = objFile.getContents();
							var fileObj = file.create({
								name: f_name + ".txt",
								fileType: file.Type.PLAINTEXT,
								contents: hexEncodedString
							}); 
							fileObj.folder = reversalFolderId;
							var fileId = fileObj.save();
							log.debug('fileId',' ********** File ID *********'+fileId);



							/*	var file_chk_str = f_name.indexOf("REJECT");

						if(file_chk_str > -1)
						{
							var reject_param = "REJECT";
						}
						else
						{
							var reject_param = "";
						}*/

							//var fileId = 920224;
							//	var fileId = 921937;
							var reject_param="";	
							FILE_JSON[fileId] = {'file_id':fileId , "reject_param" : reject_param};

						}	
						catch(excsdr)
						{
							log.debug('ERROR',' ********** Exception Caught *********'+excsdr);  
						}					

					}  


				}  

			}//Loop  

		}//TRY
		catch(ex){
			log.debug("ERROR",'Exception '+ex);	
		}//CATCH
		log.debug('FILE_JSON',' ********** FILE_JSON *********'+JSON.stringify(FILE_JSON));
		return FILE_JSON;
	}	
	function map(context) 
	{
		try
		{
			log.debug("---Map-----");

			var key = context.key
			log.debug("map", 'key -->'+key);

			var value = JSON.parse(context.value);
			log.debug("map", 'Value -->'+JSON.stringify(value));

			var reject_param_X = value.reject_param ;
			log.debug("map", 'reject_param_X -->'+reject_param_X);

			try 
			{
				var o_script_task_SO = task.create({taskType: task.TaskType.MAP_REDUCE});
				o_script_task_SO.scriptId = 'customscript_mr_hdfc_to_ns_automate_paym';
				o_script_task_SO.deploymentId = null;
				o_script_task_SO.params = {'custscript_file_ns_x':key , 'custscript_file_ns_status' : reject_param_X};
				var o_script_task_SO_ID = o_script_task_SO.submit();
				log.debug('reschedule_script','  Script Scheduled ....... ');	 
			} 
			catch(err) 
			{
				log.error('Summarize', 'CATCH Msg - ' + err);
			}    
		}
		catch(ex)
		{
			log.error('map error: ', ex.message);	
		}
		context.write(key,value);  
	}

	function reduce(context)
	{

		try{				
			context.write({ key: context.key , value: context.values});     
		}
		catch(ex){
			log.error('reduce error: ', ex.message);	
		}    	
	}
	function summarize(summary) {    	 

	}

	//----------------------------------------------------------------Start - Custom Functions -------------------------------------------------------------//
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

	function get_logs_id(i_bill_id) {
		var return_z = "";
		try {
			if(_logValidation(i_bill_id)) {

				var o_logs_SS = search.create({type: "customrecord_integration_logs",
					filters: [
						["custrecord_il_transaction", "anyof", i_bill_id]
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
			log.debug('ERROR', 'Exception Caught in logs id  -->' + excsww);
		}
		return return_z;
	}

	function getFileUniqueRefNumber(refNo) {

		if(!refNo)
			return null;

		var billId = '';
		var pymtAmount = '';
		var pymtMethod = '';
		var bankAcc = '';
		var rcInteralId = '';
		var pymtReference = "";

		try {

			//	log.debug('refNo in serach function',refNo)
			var customrecord_seh_bank_detail_SearchObj = search.create({type: "customrecord_seh_bank_detail_",
				filters: [
					["custrecord_seh_file_unique_ref_no", "is", refNo]
					],
					columns: [
						search.createColumn({ name: "custrecord_seh_bill_vendor_prepayment_", label: "Bill/Vendor Prepayment #" }),
						search.createColumn({ name: "custrecord_seh_bank_payment_amount_", label: "BANK PAYMENT AMOUNT" }),
						search.createColumn({ name: "custrecord_seh_from_bank_account_", label: "FROM BANK ACCOUNT" }),
						search.createColumn({ name: "custrecord_seh_bank_payment_method_", label: "BANK PAYMENT METHOD" }),
						search.createColumn({ name: "internalid", label: "Internal ID" }),
						search.createColumn({name: "custrecord_seh_payment_"})
						]
			});
			if(customrecord_seh_bank_detail_SearchObj) {
				var custResults = customrecord_seh_bank_detail_SearchObj.run().getRange({ start: 0, end: 10 });
				if(custResults) {
					var custResult = custResults[0];
					if(custResult) {
						billId = custResult.getValue({ name: "custrecord_seh_bill_vendor_prepayment_", label: "Bill/Vendor Prepayment #" });
						pymtAmount = custResult.getValue({ name: "custrecord_seh_bank_payment_amount_", label: "BANK PAYMENT AMOUNT" });
						bankAcc = custResult.getValue({ name: "custrecord_seh_from_bank_account_", label: "FROM BANK ACCOUNT" });
						pymtMethod = custResult.getValue({ name: "custrecord_seh_bank_payment_method_", label: "BANK PAYMENT METHOD" });
						rcInteralId = custResult.getValue({ name: "internalid", label: "Internal ID" });
						pymtReference = custResult.getValue({name: "custrecord_seh_payment_"});
					}
				}
			}
			return [billId, pymtAmount, pymtMethod, bankAcc, rcInteralId,pymtReference];
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
			//log.debug("folderSearchObj result count",searchResultCount);
			folderSearchObj.run().each(function(result){
				// .run().each has a limit of 4,000 results
				i_file_id = result.getValue({name: "internalid",join: "file"});
				return true;
			});			
		}  
		return i_file_id;  
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
	//----------------------------------------------------------------End - Custom Functions -------------------------------------------------------------//
	return {
		getInputData: getInputData,
		map: map,
		summarize: summarize
	};

});