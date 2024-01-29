/*

Script Name: SU_NS_HDFC_Payment_Total.js
Script Type: Suitelet Script
Created Date: 22/10/2021
Created By: Trupti Gujarathi.
Company : Yantra Inc.
Description: 
*************************************************************/
/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 **/
 define(['N/ui/serverWidget', 'N/log', 'N/currentRecord', 'N/format', 'N/record', 'N/search', 'N/redirect', 'N/url', 'N/runtime','N/task' , "N/ui/serverWidget","N/file"], function(serverWidget, log, currentRecord, format, record, search, redirect, url, runtime,task,ui,file) {
    function onRequest(context) {
			var resultIndexSN	= 0; 
			var resultStepSN	= 1000;
        if(context.request.method == 'GET') 
		{
			 var response = context.response;
            var o_contextOBJ = runtime.getCurrentScript();
            log.debug('suiteletFunction', ' Context OBJ --> ' + o_contextOBJ);

            var ID_ARRAY = context.request.parameters.id_array;
			var i_Amount_paid = context.request.parameters.amt_array;
			log.debug("i_Amount_paid",i_Amount_paid)
            
			//var header_str = "Internal id,Date,Date Due,Type ,Document No,Transaction No, Vendor ,Payment Amount,TDSAMT,Amt Due,Payment,Location \n"
			var header_str = "Internal id,Date,Date Due,Type ,Document No,Transaction No, Vendor ,Orig.Amt,TDSAMT,Amount To Be Paid ,Location \n"
			var line_str = "";
			ID_ARRAY = split_data(ID_ARRAY);
			log.debug('suiteletFunction', ' ID_ARRAY --> ' + ID_ARRAY);
            log.debug('suiteletFunction', ' ID_ARRAY Length --> ' + ID_ARRAY.length);
			i_Amount_paid = split_data(i_Amount_paid);
			
			
			
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
			
			var objSearch_GC = search.create({type: 'customrecord_general_configuration',filters: null,columns: arrColumns_GC});
			var searchResult_GC    = objSearch_GC.run().getRange({start: 0, end: 1000});
			//log.debug('onRequest:Get()','searchResult_GC=='+searchResult_GC);
			if(_logValidation(searchResult_GC))
			{					
				for(var gc=0;gc<searchResult_GC.length;gc++){
					internalID_GC = searchResult_GC[gc].getValue({name: 'internalid'});						
					vendorBillSearchId = searchResult_GC[gc].getValue({name: 'custrecord_gc_payment_search'});										
				}
			}

			//-------------------------------------- End - get Values from General Configuration Record ----------------------------------------------//			
			
			
			
            var a_filters = new Array();

            var a_columns = new Array();
            a_columns.push(search.createColumn({
                name: 'internalid'
            }));

            var a_filters = new Array();
      
            if(_logValidation(ID_ARRAY)) 
			{
                a_filters.push(search.createFilter({name: 'internalid',operator: search.Operator.ANYOF,values: ID_ARRAY}));
            }

            var vendorbillSearchObj = search.load({id: vendorBillSearchId});

            if (_logValidation(a_filters)) {
                for (var idx = 0; idx < a_filters.length; idx++) {
                    vendorbillSearchObj.filters.push(a_filters[idx]);
                }
            }
            var a_search_results = vendorbillSearchObj.run().getRange({
                start: 0,
                end: 1000
            });
            log.debug('schedulerFunction', ' HDFC to NS Search Results  -->' + a_search_results);

            var counter = 0;
            //vendorbillSearchObj.run().each(function(result)
						
           
            if(_logValidation(a_search_results) && _logValidation(ID_ARRAY)) 
			{
                for(var i = 0; i < a_search_results.length; i++) 
				{
                    // .run().each has a limit of 4,000 results
					var record_internalid= a_search_results[i].getValue({
						name: "internalid"
					});                   
                   log.debug('record_internalid --> '+record_internalid);

				   var record_date=a_search_results[i].getValue({
					name: "trandate"
				   });
                   log.debug('record_date --> '+record_date);

				   var record_duedate=a_search_results[i].getValue({
					name: "duedate"
				   });
                   log.debug('record_duedate --> '+record_duedate);

					var record_type = a_search_results[i].getValue({
						name: "type",
						
					});                   
                   log.debug('record_type --> '+record_type);
 
				   var record_documentno=a_search_results[i].getValue({
					name: "tranid"
				   });
                   log.debug('record_documentno --> '+record_documentno);

                   var record_trannumber=a_search_results[i].getValue({
					name: "transactionnumber"
				   });
                   log.debug('record_trannumber --> '+record_trannumber);

				   var entityName = a_search_results[i].getValue({name: "altname",join: "vendor"});
                   log.debug('entityName --> '+entityName);
				   
				    var vendor_code = a_search_results[i].getValue({name: "formulatext",formula: "{vendor.entityid}"});
                   log.debug('vendor_code --> '+vendor_code);
				   
				  // var s_vendor_NM = vendor_code+' '+entityName;
                   
                  var  s_vendor_NM = entityName;

                    var i_recordAmount = a_search_results[i].getValue({name: "total"});
                   log.debug('i_recordAmount '+i_recordAmount);
				   
				   var record_tdsamt=a_search_results[i].getValue({
					name: "taxtotal"
				   });
                   log.debug('record_tdsamt --> '+record_tdsamt);

				   var record_amtdue=a_search_results[i].getValue({
					name: "custamt"
				   });
                   log.debug('record_amtdue --> '+record_amtdue);
 
				   /*var record_payment=a_search_results[i].getValue({
					name: ""                                                       //add field id 
				   });*/
                 //  log.debug('record_payment --> '+record_payment);

				   var record_location=a_search_results[i].getText({
					name: "location"                                                       
				   });
                   log.debug('record_location --> '+record_location);
				   			   

				  // line_str = record_internalid +","+record_date+","+record_duedate+","+ record_type+ ","+record_documentno+","+record_trannumber+","+ entityName+","+ i_recordAmount+ ","+record_tdsamt+","+record_amtdue+","+record_payment+","+record_location+"\n";

				   if(line_str =="")
				   {
					line_str = record_internalid +","+record_date+","+record_duedate+","+ record_type+ ","+record_documentno+","+record_trannumber+","+ s_vendor_NM+","+ i_recordAmount+ ","+record_tdsamt+","+i_Amount_paid[i]+","+record_location+"\n";
				   }
				   else
				   {
					 line_str += line_str = record_internalid +","+record_date+","+record_duedate+","+ record_type+ ","+record_documentno+","+record_trannumber+","+ s_vendor_NM+","+ i_recordAmount+ ","+record_tdsamt+","+i_Amount_paid[i]+","+record_location+"\n";
				   }
               
                }

                //return true;
            }
			else
			{
				line_str = "No data selected."
			}
             var s_File_Name = 'HDFC_Payment_Entries_Total' + new Date() + '.csv';
			 
			 var s_file_contents = header_str + line_str
			
			var fileObj = file.create({
            	 name : s_File_Name,
            	 fileType: file.Type.CSV,
            	 contents: s_file_contents
            	 });
            	//fileObj.folder = i_folder_id;
            
        	//i_error_file_Id = fileObj.save();  
          
		//   return fileObj ;
			response.writeFile({
				    file : fileObj
				});
           
        }

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
return {
    onRequest: onRequest
};
});