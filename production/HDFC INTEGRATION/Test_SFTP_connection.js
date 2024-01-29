/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
//GetInputData : 10000 Units
//Map : 1000 Units
//Reduce : 5000 Units
//Summary : 10000 Units  9539af1f5c2f4647ae292af38395f300

define(['N/record', 'N/search', 'N/runtime', 'N/email','N/format','N/file','N/task','N/sftp'],

		function(record, search, runtime, email,format,file,task,sftp) {

	function getInputData(context) {
		
		try		{
			var arrTemp = [];

			/*var fileString = 'TestPaymentFile';

			var objFile = file.create({ name: 'TestFileName', fileType: file.Type.PLAINTEXT, contents: fileString, folder: 806 });

			var fileSaveId = objFile.save();
			log.debug('getInputData', ' fileSaveId  -->' + fileSaveId);*/
	  
			//---------------Start - Connection to SFTP Server ----------------------//
			var i_SFTP_user_name_GP        = 'oaknorth';	
			var i_password_guid_GP         =  'custkey_on_hdfc_ns';					
			var i_SFTP_server_URL_GP       = 'onb-sftp-prod.oaknorth-it.com';		  
			var i_SFTP_host_key_GP         = 'AAAAB3NzaC1yc2EAAAADAQABAAABAQDXNKXUHRRofURgPsz5LC9heiGcP0GUZ2Gt7f+uzEy+po9X0fxu6YAogzV39Hq2DhmneVLWdaUTmKdlOdubtoLDVzdBQvZ9WFBUewEpePCbBghr+OrYdexmwjE7ZE7ExWn3BEUM/UUrG4WovBqZPgfdC9U128lUVfRIv5R12vT3/z0Gkukxpuykm7uubdLz1idvtL9qjlG/NlLjHjcqdc4+ts5/MASaV+q4EZeOf2smb8TOl/rFXE0HK93pqcA3cYiBHJApfTRwuBPnRbS6/OqyP8QyiXwxOD3mtyY7P0nDYi6QbdcMOmmc6LCKtDT6WnH+uH27+5TozBIJ8yjGJeUD';
			var i_SFTP_host_key_type_GP    = 'rsa';
			
			try
			{
				var o_connectionOBJ = sftp.createConnection({
					username     : i_SFTP_user_name_GP,
					keyId:i_password_guid_GP,
					url          : i_SFTP_server_URL_GP,
					hostKey      : i_SFTP_host_key_GP,
					hostKeyType  : i_SFTP_host_key_type_GP,
					port  : 22,
					directory: '/usr/local/HDFC/Forward/src'
				});
				log.debug('schedulerFunction:o_connectionOBJ==',o_connectionOBJ); 	

				//---------------Start - Connection to SFTP Server ----------------------//

				// var objSFTPUpload = o_connectionOBJ.upload({filename: 'TestFileName.txt', file: objFile, replaceExisting: false });
				// var objSFTPUpload = o_connectionOBJ.upload({ directory: '/src', filename: 'TestFileName.txt', file: objFile, replaceExisting: false });
				// var objSFTPUpload = o_connectionOBJ.upload({filename: 'TestFileName.txt', file: objFile, replaceExisting: false });
				//log.debug('getInputData:objSFTPUpload==',objSFTPUpload);

				var listDirectory = o_connectionOBJ.list();
				log.debug('schedulerFunction:listDirectory==', listDirectory);

			}
			catch(exytr)
			{				
				log.debug('ERROR', 'Exception Caught While SFTP Connection -->'+exytr); 			 
			}		 
			/* 	var file_ = 'Daily_data_ERP-ludo supreme_2021-09-20'
			var o_fileOBJ = o_connectionOBJ.download({
			       	    directory: 'Input',
			      	    filename: file_+'.csv'
			   });  

		  	 log.debug('schedulerFunction', 'o_fileOBJ  -->'+o_fileOBJ.getContents());   */		
		}
		catch(ex){
			log.debug("ERROR",'Exception ',ex.message);	
		}

		return arrTemp;

	}

	function map(context) 
	{    	
		log.debug("---Map-----");

		var key = context.key
		log.debug("map", 'key -->'+key);

		var value = context.value;
		log.debug("map", 'Value -->'+value);

		context.write(key,value);     	
	}

	function reduce(context) {

		try
		{     

			context.write({ key: context.key , value: context.values.length });			

		}
		catch(ex){
			log.error('reduce error: ', ex.message);	
		}

	}

	function summarize(summary) {

		var type = summary.toString();
		log.debug(type + ' Usage Consumed', summary.usage);
		log.debug(type + ' Concurrency Number ', summary.concurrency);
		log.debug(type + ' Number of Yields', summary.yields);

	}

	function _logValidation(value)
	{
		if(value!=null && value!= 'undefined' && value!=undefined && value!='' && value!='NaN' && value!=' ')
		{
			return true;
		}	 
		else	  
		{
			return false;
		}
	}	
	return {
		onRequest : getInputData
		//   map: map,
		//  reduce: reduce,
		//  summarize: summarize
	};

});