/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
// GetInputData : 10000 Units
// Map : 1000 Units
// Reduce : 5000 Units
// Summary : 10000 Units

/*
	Script Name: OKN_MR_Update_Bill_Record
	Script Type: Map Reduce Script
	Created Date: 01/11/2022
	Created By: sanjit yadav(Yantra Inc).
	Company : Yantra Inc.
	Description:
	 *************************************************************/
var PAYMENTS_CREDIT_APPLIED_ARR = {};
define(['N/record', 'N/search', 'N/runtime', 'N/email', 'N/format', 'N/file', 'N/task', 'N/config'],

    function(record, search, runtime, email, format, file, task, config) {

        function getInputData(context) {
            try {
                var o_contextOBJ = runtime.getCurrentScript();

                var a_JE_Arr = o_contextOBJ.getParameter({
                    name: 'custscript_bill_record_array'
                });
                log.debug('getInputData', ' Journal Array #  --> ' + a_JE_Arr);

                var PROCESS_TYPE = o_contextOBJ.getParameter({
                    name: 'custscript_process_type_x'
                });
                log.debug('getInputData', ' PROCESS_TYPE #  --> ' + PROCESS_TYPE);
                var i_amountArray = o_contextOBJ.getParameter({
                    name: 'custscript_amount_array'
                });
				var recordJsonarray=  JSON.parse(o_contextOBJ.getParameter({
                    name: 'custscript_record_json'
                }))
				log.debug('recordJsonarray',recordJsonarray)
               /* var JE_ARR = split_data(a_JE_Arr);
                i_amountArray = split_data(i_amountArray)
                log.debug('i_amountArray', i_amountArray)
                var i_recordArray = []
                for (var i = 0; i < JE_ARR.length; i++) {
                    i_recordArray.push({
                        "recordId": JE_ARR[i],
                        "amount": i_amountArray[i]
                    })
                }


                return i_recordArray*/
				return recordJsonarray
                //var transType = runtime.getCurrentScript();
            } catch (ex) {
                log.error("ERROR", ex.message);
            }
            //return JE_ARR;


        }


        function map(context) {
            try {

                log.debug("-------------------------------------------MAP----------------------------------------------------------");

                var mappingResult = context.value;
                log.debug("mappingResult : ", mappingResult);
                var key = context.key
                log.debug("key : ", key);
                context.write(key, mappingResult);

            } catch (ex) {
                log.debug("map ex", ex.message);
            }
        }

        function reduce(context) {
            try {
                //   log.debug("enter");
                context.write({
                    key: context.key,
                    value: context.values.length
                });
                var o_contextOBJ = runtime.getCurrentScript();

                var PROCESS_TYPE = o_contextOBJ.getParameter({
                    name: 'custscript_process_type_x'
                });
                log.debug('getInputData', ' PROCESS_TYPE #  --> ' + PROCESS_TYPE);
                var i_bankAccount = o_contextOBJ.getParameter({
                    name: 'custscript_bank_account_id'
                });
                log.debug('getInputData', ' i_bankAccount #  --> ' + i_bankAccount);
                var a;
                for (a = 0; a < context.values.length; a++) {
                    var result = context.values[a];
                    var PRdetail = JSON.parse(result);
                    log.debug("PRdetail", PRdetail);
                    var i_recordId = PRdetail.billNo
                    var dueAmt = PRdetail.amount
                    if (_logValidation(dueAmt)) {
                        dueAmt = dueAmt
                    } else {
                        dueAmt = 0
                    }

                    if (_logValidation(i_recordId)) {
                        var o_tranOBJ = record.load({
                            type: 'vendorbill',
                            id: Number(i_recordId),
                            isDynamic: true,
                        });

                        if (PROCESS_TYPE == 'Initiate') {
                            o_tranOBJ.setValue({
                                fieldId: 'custbody_clear_bank_initiated',
                                value: true
                            });
                            o_tranOBJ.setValue({
                                fieldId: 'custbody_ok_pyament_rejected',
                                value: false
                            });
                            if (_logValidation(i_bankAccount)) {
                                o_tranOBJ.setValue({
                                    fieldId: 'custbody_clear_bank_account',
                                    value: i_bankAccount
                                });
                            }
                        }
                        /*if (PROCESS_TYPE == 'Payment') {
                            o_tranOBJ.setValue({
                                fieldId: 'custbody_clear_bank_pymt_initiated',
                                value: true
                            });
                            o_tranOBJ.setValue({
                                fieldId: 'custbody_clear_bank_amont_due',
                                value: dueAmt
                            });
                        }*/
                        var i_submitID = o_tranOBJ.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                        });
                        log.debug('map', '----------- Transaction Submit ID -----------  --> ' + i_submitID);
						var customRecId=''
						var dateObj=new Date()
						if(i_submitID && PROCESS_TYPE == 'Initiate'){
							try{
								var customObj = record.create({type:'customrecord_hdfc_bank_details',isDynamic:true})
								var timeStamp = dateObj.getTime()
								log.debug('timeStamp',timeStamp)
								var primryKay = PRdetail.billNo +''+timeStamp
								log.debug('primryKay',primryKay)
								var name = 'Clear Bank Integration'+dateObj
								customObj.setValue({fieldId:'name',value:name})
								customObj.setValue({fieldId:'custrecord_hbd_primary_key',value:primryKay})
								customObj.setValue({fieldId:'custrecord_hbd_user',value:PRdetail.currentUser})
								customObj.setValue({fieldId:'custrecord_hbd_transaction',value:PRdetail.billNo})
								customObj.setValue({fieldId:'custrecord_hbd_vendor_',value:PRdetail.billVendor})
								customObj.setValue({fieldId:'custrecord_tran_type',value:'Vendor Bill'})
								customObj.setValue({fieldId:'custrecord_hbd_bank_type_',value:1})
								customObj.setValue({fieldId:'custrecord_bill_amount_due',value:PRdetail.billToBePaid})
								customObj.setValue({fieldId:'custrecord_total_bill_amount',value:PRdetail.billtotal})
								customObj.setValue({fieldId:'custrecord_tax_amount',value:PRdetail.billtax})
								customObj.setValue({fieldId:'custrecord_bill_credit',value:PRdetail.billCredit})
								customObj.setValue({fieldId:'custrecord_subsidary',value:PRdetail.billSubsidary})
								customObj.setValue({fieldId:'custrecord_hbd_debit_account_',value:PRdetail.billAccounts})
								customObj.setValue({fieldId:'custrecord_hbd_payment_amount',value:PRdetail.billToBePaid})
								customObj.setValue({fieldId:'custrecord_hbd_approval_status',value:1})
								customRecId = customObj.save({
										enableSourcing: true,
										ignoreMandatoryFields: true
									});
									log.debug('customRecId',customRecId)
							}catch(e){
								log.error('error in custom record creation',e.message)
							}
						}
						
						if(PROCESS_TYPE == 'Payment'){
							var dateStr=''
							var day = dateObj.getDate()
							var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
									  "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"
									];
							if(day<9){
								day='0'+day
							}
							dateStr=day+'-'+monthNames[dateObj.getMonth()]+'-'+dateObj.getFullYear()
							log.debug('dateStr',dateStr)
							/*customRecId = record.submitFields({
							type: 'customrecord_hdfc_bank_details',
							id: PRdetail.customRecId,
							values: {
								custrecord_hbd_approval_user: PRdetail.currentUser,
								custrecord_hbd_approval_status:2,
								custrecord_hbd_approval_date:dateStr
							},
							options: {
								enableSourcing: false,
								ignoreMandatoryFields : true
							}
						});
						*/
						var customRecObj=record.load({type:'customrecord_hdfc_bank_details',id:PRdetail.customRecId,isDynamic:true})
						customRecObj.setValue({fieldId:'custrecord_hbd_approval_user',value:PRdetail.currentUser})
						customRecObj.setValue({fieldId:'custrecord_hbd_approval_status',value:2})
						customRecObj.setText({fieldId:'custrecord_hbd_approval_date',text:dateStr})
						customRecId=customRecObj.save({
							enableSourcing: true,
							ignoreMandatoryFields: true
						})
							log.debug('for payment initiation',customRecId)
						}


                    }

                }

            } catch (ex) {
                log.error("reduce ex", JSON.stringify(ex.message));
            }
            context.write({
                key: context.key,
                value: {customeRecordId:customRecId,processType:PROCESS_TYPE}
            });
			
			/*context.write({
                key: context.key,
                value: {fileId:data.fileId,type:data.type,recType:data.recType,recId:data.recId}
            });*/
            return i_recordId;

        }




        function summarize(summary) {
            try {
                log.debug("** in summarize");
                var type = summary.toString();
                log.debug(type + ' Usage Consumed', summary.usage);
                log.debug(type + ' Concurrency Number ', summary.concurrency);
                log.debug(type + ' Number of Yields', summary.yields);
                var email_contents = "";
                var o_contextOBJ = runtime.getCurrentScript();
                var PROCESS_TYPE = o_contextOBJ.getParameter({
                    name: 'custscript_process_type_x'
                });
                log.debug('summarize', ' PROCESS_TYPE #  --> ' + PROCESS_TYPE);
                var rec_array = o_contextOBJ.getParameter({
                    name: 'custscript_bill_record_array'
                });
                log.debug('summarize', ' rec_array #  --> ' + JSON.stringify(rec_array));
                var recID = split_data(rec_array) //parseInt(rec_array);
                log.debug("summarize recID", recID);

                var i_amountArray = o_contextOBJ.getParameter({
                    name: 'custscript_amount_array'
                });
                i_amountArray = split_data(i_amountArray)
				log.debug('i_amountArray',i_amountArray)
                var jsonArray = {}
                for (var ip = 0; ip < recID.length; ip++) {
                    jsonArray[recID[ip]] = {
                        "dueAmount": i_amountArray[ip]
                    }
                }
                log.debug('jsonArray', jsonArray)
                paymentCredit()
                log.debug('PAYMENTS_CREDIT_APPLIED_ARR', PAYMENTS_CREDIT_APPLIED_ARR)
                var i_receiver = o_contextOBJ.getParameter({
                    name: 'custscript_current_receiver_email'
                });
                log.debug('summarize', ' i_receiver #  --> ' + i_receiver);
				
				
				var contents = '';
				var recordArray=[]
					summary.output.iterator().each(function (key, value)
                        {
                           // contents += (key + ' ' + value + '\n');
						   log.debug('key value pair',key)
						   var jsonValue  =JSON.parse(value)
						   recordArray.push(jsonValue.customeRecordId)
						  // log.debug('value value pair',JSON.parse(value))
                            return true;
                        });
						
						log.debug('recordArray',recordArray)
                if (PROCESS_TYPE == 'Initiate' || PROCESS_TYPE == 'Payment' & recordArray.length>0) // email for initiate process
                {

                    // Search of Vendor Bill Scripted
                    var vendorbillSearchObj = search.create({
						   type: "customrecord_hdfc_bank_details",
						   filters:
						   [
							  ["internalid","anyof",recordArray], 
							  "AND", 
							  ["custrecord_hbd_transaction.mainline","is","T"]
						   ],
						   columns:
						   [
							  search.createColumn({
								 name: "altname",
								 join: "CUSTRECORD_HBD_VENDOR_",
								 label: "Name"
							  }),
							  search.createColumn({
								 name: "memo",
								 join: "CUSTRECORD_HBD_TRANSACTION",
								 label: "Memo"
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
							  search.createColumn({
								 name: "tranid",
								 join: "CUSTRECORD_HBD_TRANSACTION",
								 label: "Document Number"
							  }),
							  search.createColumn({
							  name: "namenohierarchy",
					 join: "CUSTRECORD_SUBSIDARY",
					 label: "Name (no hierarchy)"
						  }),
						  search.createColumn({name: "custrecord_bill_credit", label: "Bill Credit Amount"}),
						  search.createColumn({name: "custrecord_hbd_payment_amount", label: "Payment Amount"}),
						  search.createColumn({name: "custrecord_total_bill_amount", label: "Total Bill Amount"})
						   ]
						});;
                    var searchResultCount = vendorbillSearchObj.runPaged().count;
                    log.debug("vendorbillSearchObj result count", searchResultCount);

                    // HTML Head in Tables 
                    var html = '';
                    html += '<table style="border:1px solid black ">';
                    html += '<tr>'
					html += '<td style="border-right:1px solid black; border-bottom:1px solid black">Entity Name</td>';
					html += '<td style="border-right:1px solid black; border-bottom:1px solid black">Invoice No</td>';
                    html += '<td style="border-right:1px solid black; border-bottom:1px solid black">Vendor</td>';
                    html += '<td style="border-right:1px solid black; border-bottom:1px solid black">Narration</td>';
                    html += '<td style="border-right:1px solid black; border-bottom:1px solid black">Invoice Gross Amount</td>';
                    html += '<td style="border-right:1px solid black; border-bottom:1px solid black">Credit Note Applied</td>';
                    html += '<td style="border-right:1px solid black; border-bottom:1px solid black">Net Payable</td>';
                    html += '<td style="border-right:1px solid black; border-bottom:1px solid black">Transaction Number</td>';
                    html += '<td style="border-right:0px solid black; border-bottom:1px solid black">Attachment Link</td>';
                    html += '<\/tr>'

                    // HTML END Head Code

                    vendorbillSearchObj.run().each(function(result) {
                        
                        var attachmentLinkDocId = result.getValue({
								 name: "custbody_attachpreappdoc",
								 join: "CUSTRECORD_HBD_TRANSACTION",
								 label: "Attach Pre-Approved Doc"
                        });
                        var transactionNumber = result.getValue({
								 name: "transactionnumber",
								 join: "CUSTRECORD_HBD_TRANSACTION",
								 label: "Transaction Number"
                        });
						
						var invoiceNo = result.getValue({
							     name: "tranid",
								 join: "CUSTRECORD_HBD_TRANSACTION",
								 label: "Document Number"
						  })
						  var entityText = result.getValue({ name: "namenohierarchy",
         join: "CUSTRECORD_SUBSIDARY",
         label: "Name (no hierarchy)"})
                        var urlString = "";
                        if (attachmentLinkDocId) {
                            var to_userlogo = file.load({
                                id: attachmentLinkDocId
                            });

                            var netsuiteUrl = 'https://5123585-sb1.app.netsuite.com'
                            var finalUrl = netsuiteUrl + to_userlogo.url
                            urlString = "<a href='" + finalUrl + "' target='_blank' style='font-size:10pt'>" + transactionNumber + "</a><br/>";
                        } else {
                            urlString = "";
                        }

                        
                        var i_amount = result.getValue({
                            name: "custrecord_total_bill_amount", label: "Total Bill Amount"
                        })
						var totalInvAmount = i_amount
                        var paidAmount = result.getValue({name: "custrecord_bill_credit", label: "Bill Credit Amount"})
                        /*try {
                            paidAmount = PAYMENTS_CREDIT_APPLIED_ARR[result.id].payingamount;
                        } catch (excdd) {
                            paidAmount = 0;
                        }*/
                        i_amount = i_amount
                        // Values Gettting for Head 
                        html += '<tr>'
						 html += '<td style="border-right:1px solid black; border-bottom:0px solid black">' + entityText + '<\/td>'
						 html += '<td style="border-right:1px solid black; border-bottom:0px solid black">' + invoiceNo + '<\/td>'
                        html += '<td style="border-right:1px solid black; border-bottom:0px solid black">' + result.getValue({
								 name: "altname",
								 join: "CUSTRECORD_HBD_VENDOR_",
								 label: "Name"
                        }) + '<\/td>'
                        html += '<td style="border-right:1px solid black; border-bottom:0px solid black">' + result.getValue({
                            name: "memo",
								 join: "CUSTRECORD_HBD_TRANSACTION",
								 label: "Memo"
                        }) + '<\/td>'
                        html += '<td style="border-right:1px solid black; border-bottom:0px solid black">' + totalInvAmount + '<\/td>'
                        html += '<td style="border-right:1px solid black; border-bottom:0px solid black">' + paidAmount + '<\/td>'
                        html += '<td style="border-right:1px solid black; border-bottom:0px solid black">' + result.getValue({name: "custrecord_hbd_payment_amount", label: "Payment Amount"}) + '<\/td>'
                        html += '<td style="border-right:1px solid black; border-bottom:0px solid black">' + transactionNumber + '<\/td>'
                        html += '<td style="border-right:1px solid black; border-bottom:0px solid black">' + urlString + '<\/td>'
                        html += '<\/tr>'
                        //End Value Getting For HTML Head
                        return true;
                    });

                    html += '</table>'

                    log.debug("summary html", html);

                    // End of Scripted Search Code


                    var emailBody = ''
                    if (PROCESS_TYPE == 'Initiate') {
						emailBody = 'Below payments are successfully sent for Payment Approval.'
                        
                    }
                    if (PROCESS_TYPE == 'Payment') {
                        emailBody = 'Below payments are successfully uploaded on Clearbank Portal.'
                    }

                    //Email Send Code API
                    email.send({
                        author: 302704,
                        recipients: i_receiver, //'shweta.chopde@yantrainc.com,pralhad@yantrainc.com',
                        subject: 'Clear Bank Integration - Vendor Bill Payment File',
                        body: emailBody + '<br/> <br/>' + html,
                    })


                } // End Email Send Code API for Initiate




            } catch (e) {
                log.error("error in summarize", e);
            }
        }

        function _logValidation(value) {
            if (value != null && value != 'undefined' && value != undefined && value != '' && value != 'NaN' && value != ' ' && value != "0000-00-00") {
                return true;
            } else {
                return false;
            }
        }

        function split_data(data_q) {
            var a_data_ARR = new Array();
            if (_logValidation(data_q)) {
                var i_data_TT = new Array();
                i_data_TT = data_q.toString();

                if (_logValidation(i_data_TT)) {
                    for (var dt = 0; dt < i_data_TT.length; dt++) {
                        a_data_ARR = i_data_TT.split(',');
                        break;
                    }
                } //Data TT   
            }
            return a_data_ARR;
        }

        function remove_duplicates(arr) {
            var seen = {};
            var ret_arr = [];
            for (var i = 0; i < arr.length; i++) {
                if (!(arr[i] in seen)) {
                    ret_arr.push(arr[i]);
                    seen[arr[i]] = true;
                }
            }
            return ret_arr;
        }

        function transactionType(i_internalid) {
            var i_recordType = '';
            try {

                var transactionSearchObj = search.create({
                    type: "transaction",
                    filters: [
                        ["internalid", "anyof", i_internalid],
                        "AND",
                        ["mainline", "is", "T"]
                    ],
                    columns: [
                        search.createColumn({
                            name: "recordtype",
                            label: "Record Type"
                        })
                    ]
                });

                if (transactionSearchObj) {
                    var custResults = transactionSearchObj.run()
                        .getRange({
                            start: 0,
                            end: 10
                        });
                    //log.debug('custResults',custResults)
                    //log.debug('custSearch',custSearch)
                    if (custResults) {
                        var custResult = custResults[0];
                        if (custResult) {
                            i_recordType = custResult.getValue({
                                name: "recordtype",
                                label: "Record Type"
                            });
                            log.debug('i_recordType', i_recordType);
                        }
                    }
                }

                return i_recordType;


            } catch (ex2) {
                log.error('Error checking new transactionType record', ex2.message);
                return '';
            }
        }

        function paymentCredit() {
            try {
                search.load({
                    id: 'customsearch_credit_payment'
                }).run().each(function(result) {
                    var i_recordID_WXXX = result.getValue({
                        name: "internalid",
                        summary: "GROUP",
                        sort: search.Sort.ASC
                    });
                    var i_paying_amount = result.getValue({
                        name: "payingamount",
                        summary: "SUM"
                    });
                    PAYMENTS_CREDIT_APPLIED_ARR[i_recordID_WXXX] = {
                        "payingamount": i_paying_amount
                    };
                    //subsidary.

                    return true;
                });
            } catch (e) {
                log.error('error in payment credit function', e.message)
            }
        }

        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        };

    });