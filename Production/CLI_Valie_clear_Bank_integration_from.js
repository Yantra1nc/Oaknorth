/*

Script Name: CL_Oaknorth_load_data_file.js
Script Type: Client Script
Created Date: 01/11/2022
Created By: sanjit yadav(Yantra Inc).
Company : Yantra Inc.
Description: 
*************************************************************/
/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript 
 **/
define(['N/error', 'N/log', 'N/record', 'N/runtime', 'N/currentRecord', 'N/search', 'N/format', 'N/url', 'N/email', 'N/file'],
    function(error, log, record, runtime, currentRecord, search, format, url, email, file) {
        var IS_CONFIRMED;

        function searchlist() {
            try {
                var o_recordOBJ = currentRecord.get();

                var d_from_date = o_recordOBJ.getText({
                    fieldId: "custpage_fromdate"
                }); //id from suitelet
                log.debug('d_from_date', d_from_date);
                var d_to_date = o_recordOBJ.getText({
                    fieldId: "custpage_todate"
                });
                log.debug('d_to_date', d_to_date);

                var d_subsidary_name = o_recordOBJ.getValue({
                    fieldId: "custpage_subsidary"
                });
                log.debug('d_subsidary_name', d_subsidary_name);

                var transtype = o_recordOBJ.getValue({
                    fieldId: "transaction_type"
                });
                var i_requestor = o_recordOBJ.getValue({
                    fieldId: "custpage_requestor"
                });
                var PROCESS_TYPE = o_recordOBJ.getValue({
                    fieldId: "custpage_processtype"
                });
                var i_accounId = o_recordOBJ.getValue({
                    fieldId: "custpage_bank_account"
                });
                var deployID = "";

                if (PROCESS_TYPE == 'Initiate') {
                    SEARCH_X = 'customsearch_clear_bank_integ_initiate';
                    FORM_X = 'OakNorth UK | Clear Bank Integration | Initiate';
                    deployID = 'customdeploy_okn_init_slear_bank_integ';
                }
                if (PROCESS_TYPE == 'Payment') {
                    SEARCH_X = 'customsearch_clear_bank_integration';
                    FORM_X = 'OakNorth UK | Clear Bank Integration | Payment';
                    deployID = 'customdeploy_okn_su_slear_bank_integarti';
                }


                var s_URL = url.resolveScript({
                    scriptId: 'customscript_okn_su_slear_bank_integarti',
                    deploymentId: deployID
                }); //suitlet id 		
                s_URL += '&custFromDate=' + d_from_date;
                s_URL += '&custToDate=' + d_to_date;
                s_URL += '&custSubsidaryName=' + d_subsidary_name;
                s_URL += '&ii_accounId=' + i_accounId;
                window.onbeforeunload = null;
                window.open(s_URL, '_self', null, null);
            } catch (excjdk) {
                //alert('Exception Caught -->' + excjdk);
                log.error("Search Error", excjdk);
            }

        }

        function rejectpayment() {
            try {
                var o_recordOBJ = currentRecord.get();


                var d_from_date = o_recordOBJ.getText({
                    fieldId: "custpage_fromdate"
                }); //id from suitelet
                log.debug('d_from_date', d_from_date);
                var d_to_date = o_recordOBJ.getText({
                    fieldId: "custpage_todate"
                });
                log.debug('d_to_date', d_to_date);

                var d_subsidary_name = o_recordOBJ.getValue({
                    fieldId: "custpage_subsidary"
                });
                log.debug('d_subsidary_name', d_subsidary_name);

                var transtype = o_recordOBJ.getValue({
                    fieldId: "transaction_type"
                });
                var i_requestor = o_recordOBJ.getValue({
                    fieldId: "custpage_requestor"
                });
                var PROCESS_TYPE = o_recordOBJ.getValue({
                    fieldId: "custpage_processtype"
                });
                var deployID = "";
                if (PROCESS_TYPE == 'Payment') {
                    SEARCH_X = 'customsearch_clear_bank_integration';
                    FORM_X = 'OakNorth UK | Clear Bank Integration | Payment';
                    deployID = 'customdeploy_okn_su_slear_bank_integarti';
                }
                var lineCount = o_recordOBJ.getLineCount({
                    sublistId: 'custsublistid'
                })
                //alert('line count'+lineCount)
                var i_customRecArray = []
                var trasArray = []
                for (var i = 0; i < lineCount; i++) {
                    var isRejectBill = o_recordOBJ.getSublistValue({
                        sublistId: 'custsublistid',
                        fieldId: 'custpage_select',
                        line: i
                    })
                    //alert('isRejectBill'+isRejectBill)
                    if (isRejectBill == true || isRejectBill == 'true' || isRejectBill == 'T') {
                        var billId = o_recordOBJ.getSublistValue({
                            sublistId: 'custsublistid',
                            fieldId: 'custpage_custom_record_id',
                            line: i
                        })
                        var actulaBillId = o_recordOBJ.getSublistValue({
                            sublistId: 'custsublistid',
                            fieldId: 'custpage_bill',
                            line: i
                        })
                        //alert("billId"+billId)


                        if (_logValidation(billId)) {
                            i_customRecArray.push(billId)
                            trasArray.push(actulaBillId)
                            /* var id = record.submitFields({
                                type: record.Type.VENDOR_BILL,
                                id: billId,
                                values: {
                                    custbody_ok_pyament_rejected: true,
                                    custbody_clear_bank_initiated: false,
                                    custbody_clear_bank_pymt_initiated: false
                                },
                                options: {
                                    enableSourcing: false,
                                    ignoreMandatoryFields: true
                                }
                            });
							*/

                        }
                    }
                }

                // if (IS_CONFIRMED) {

                var theResponse = prompt('Enter Rejection Reason');
                //alert('User typed '  + theResponse);

                //alert("i_customRecArray"+i_customRecArray)
                if (theResponse && i_customRecArray.length > 0) {
                 /*   for (var i = 0; i < i_customRecArray.length; i++) {
                        var id = record.submitFields({
                            type: 'customrecord_hdfc_bank_details',
                            id: i_customRecArray[i],
                            values: {
                                custrecord_hbd_approval_status: 3,
                                custrecord_hbd_rejection_reason: theResponse
                            },
                            options: {
                                enableSourcing: false,
                                ignoreMandatoryFields: true
                            }
                        });
                        var id = record.submitFields({
                            type: record.Type.VENDOR_BILL,
                            id: trasArray[i],
                            values: {
                                custbody_ok_pyament_rejected: true,
                                custbody_clear_bank_initiated: false,
                                custbody_ok_reject_reson: theResponse,
                                custbody_clear_bank_pymt_initiated: false

                            },
                            options: {
                                enableSourcing: false,
                                ignoreMandatoryFields: true
                            }
                        });

                    }
                    if (i_customRecArray.length > 0) {
                        sendRejectEmailNotification(i_customRecArray)
                    }
					*/
                    //send email notificaton
/*
                    var s_URL = url.resolveScript({
                        scriptId: 'customscript_okn_su_slear_bank_integarti',
                        deploymentId: deployID
                    }); //suitlet id 		
                    s_URL += '&custFromDate=' + d_from_date;
                    s_URL += '&custToDate=' + d_to_date;
                    s_URL += '&custSubsidaryName=' + d_subsidary_name;
                    window.onbeforeunload = null;
                    window.open(s_URL, '_self', null, null);
                    return true;
					*/
					 var s_URL = url.resolveScript({
						scriptId: 'customscript_ok_su_generate_csv_file',
						deploymentId: 'customdeploy_ok_su_generate_csv_file'
					});
					var line_str=''
					s_URL += '&csvfile=' + line_str;
					s_URL += '&email_type=' + 'Reject';
					s_URL += '&i_customRecArray=' + i_customRecArray;
					s_URL += '&trasArray=' + trasArray;
					s_URL += '&reason=' + theResponse;
					//alert("s_URL"+s_URL)
					window.onbeforeunload = null;
					window.open(s_URL, '_self', null, null);
					
					
                }
                //sendRejectEmailNotification(i_customRecArray)



            } catch (excjdk) {
                log.error("rejectpayment", excjdk.message);
                alert('error' + excjdk)
            }
        }


        function sendRejectEmailNotification(i_customRecArray) {
            //alert("alert in email"+i_customRecArray)
			try{
            var errorMessage = ''
            var vendorbillSearchObj = search.create({
                type: "customrecord_hdfc_bank_details",
                filters: [
                    ["internalid", "anyof", i_customRecArray],
                    "AND",
                    ["custrecord_hbd_transaction.mainline", "is", "T"],
                    "AND",
                    ["custrecord_hbd_approval_status", "anyof", "3"]

                ],
                columns: [
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
                    search.createColumn({
                        name: "custrecord_bill_credit",
                        label: "Bill Credit Amount"
                    }),
                    search.createColumn({
                        name: "custrecord_hbd_payment_amount",
                        label: "Payment Amount"
                    }),
                    search.createColumn({
                        name: "custrecord_total_bill_amount",
                        label: "Total Bill Amount"
                    }),
                    search.createColumn({
                        name: "custrecord_hbd_rejection_reason",
                        label: "Rejection Reason"
                    })
                ]


            });
            var searchResultCount = vendorbillSearchObj.runPaged().count;
         //  alert("search result."+searchResultCount)

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
				alert("attachmentLinkDocId"+attachmentLinkDocId)
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
                var entityText = result.getValue({
                    name: "namenohierarchy",
                    join: "CUSTRECORD_SUBSIDARY",
                    label: "Name (no hierarchy)"
                })
                var urlString = "";
				try{
                if (attachmentLinkDocId) {
                    var to_userlogo = file.load({
                        id:Number(attachmentLinkDocId)
                    });
                    var netsuiteUrl = 'https://5123585-sb1.app.netsuite.com'
                    var finalUrl = netsuiteUrl + to_userlogo.url
                    urlString = "<a href='" + finalUrl + "' target='_blank' style='font-size:10pt'>" + transactionNumber + "</a><br/>";
                } else {
                    urlString = "";
                }
				}catch(e){
					alert("error in file load"+e.message)
				}

                errorMessage = result.getValue({
                    name: "custrecord_hbd_rejection_reason",
                    label: "Rejection Reason"
                })
				//alert("errorMessage---"+errorMessage)
                var i_amount = result.getValue({
                    name: "custrecord_total_bill_amount",
                    label: "Total Bill Amount"
                })
                var totalInvAmount = i_amount
                var paidAmount = result.getValue({
                    name: "custrecord_bill_credit",
                    label: "Bill Credit Amount"
                })
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
                html += '<td style="border-right:1px solid black; border-bottom:0px solid black">' + result.getValue({
                    name: "custrecord_hbd_payment_amount",
                    label: "Payment Amount"
                }) + '<\/td>'
                html += '<td style="border-right:1px solid black; border-bottom:0px solid black">' + transactionNumber + '<\/td>'
                html += '<td style="border-right:1px solid black; border-bottom:0px solid black">' + urlString + '<\/td>'
                html += '<\/tr>'
                //End Value Getting For HTML Head
                return true;
            });

            html += '</table>'

            //alert("htem view"+html)

            // End of Scripted Search Code


            var emailBody = ''
            emailBody = 'Below payments are rejected.<br/>Rejection Reason :' + errorMessage

//alert("email send enter"+errorMessage)
            //Email Send Code API
            /*email.send({
                author: 302704,
                recipients: 'accountspayable.platform@oaknorth.com, shweta.chopde@yantrainc.com, accountspayable@oaknorth.co.uk, akash.singh@yantrainc.com, sanjit@yantrainc.com', //'shweta.chopde@yantrainc.com,pralhad@yantrainc.com',
                subject: 'Clear Bank Integration - Vendor Bill Rejected',
                body: emailBody + '<br/> <br/>' + html,
            })
			*/
			//alert("email send")
			}catch(e){
				alert("error message->"+e.message)
			}

        }
        //*********** HELPER FUNCTIONS ***********
        function handlePromptResult(buttonClicked, text) {
            if (buttonClicked !== 'ok') {
                return;
            }
            console.log("You entered: " + text);

            IS_CONFIRMED = true;
            getNLMultiButtonByName('multibutton_submitter').onMainButtonClick(this); //NS Hack to call simulate user clicking Save Button
        }

        function validateSaveRecord() { //Here you do your own saveRecord validation/automation. 
            return true; //Return true if you want to proceed with the save.
        }

        function fieldChanged(context) {
            try {
                var currentObj = context.currentRecord
                var fieldName = context.fieldId
                if (fieldName == 'custpage_subsidary') {
                    var payType = currentObj.getValue({
                        fieldId: 'custpage_processtype'
                    });
                    var i_subId = currentObj.getValue({
                        fieldId: 'custpage_subsidary'
                    });
                    // alert("payType"+payType)
                    if (payType == 'Initiate' && _logValidation(i_subId)) {
                        var fieldObj = currentObj.getField({
                            fieldId: 'custpage_bank_account'
                        })
                        fieldObj.removeSelectOption({
                            value: null
                        })
                        var isResult = findAccountId(i_subId)
                        //alert("isAccountId"+isAccountId)
                        if (_logValidation(isResult)) {
                            if (_logValidation(isResult[0]) && _logValidation(isResult[1])) {
                                // currentObj.setValue({fieldId:'custpage_bank_account',value:isAccountId})
                                fieldObj.insertSelectOption({
                                    value: isResult[0],
                                    text: isResult[1]
                                });
                            }
                        }
                    }
                }
                if (fieldName === 'custpage_amount_to_be_paid' && context.sublistId == 'custsublistid') {
                    var billAmt = currentObj.getCurrentSublistValue({
                        sublistId: 'custsublistid',
                        fieldId: 'custpage_amount_to_be_paid'
                    })
                    var currentindex = currentObj.getCurrentSublistIndex({
                        sublistId: 'custsublistid'
                    })
                    //alert("billAmt"+billAmt)
                    var dueAmt = currentObj.getSublistValue({
                        sublistId: 'custsublistid',
                        fieldId: 'custpage_amount_due',
                        line: currentindex
                    })
                    //alert("dueAmt"+dueAmt)
                    if (Number(billAmt) > Number(dueAmt)) {
                        alert("You can not add more then due amount")
                        currentObj.setCurrentSublistValue({
                            sublistId: 'custsublistid',
                            fieldId: 'custpage_amount_to_be_paid',
                            value: Number(dueAmt)
                        })
                    }
                }
            } catch (e) {
                log.error('error in field changed function', e.message)
                alert("error in setting value" + e.message)
            }
        }

        function validateField(context) {
            var currentRecord = context.currentRecord;
            var sublistName = context.sublistId;
            var sublistFieldName = context.fieldId;
            var line = context.line;
            if (sublistName === 'custsublistid') {
                if (sublistFieldName === 'custpage_amount_to_be_paid') {
                    alert("hello")
                    if (Number(currentRecord.getCurrentSublistValue({
                            sublistId: 'custsublistid',
                            fieldId: 'custpage_amount_to_be_paid'
                        })) > Number(currentRecord.getCurrentSublistValue({
                            sublistId: 'custsublistid',
                            fieldId: 'custpage_amount_due'
                        })))
                        alert("You can not add more then due amount")
                    return false
                }
            }
            return true;
        }

        function findAccountId(i_subId) {
            try {
                var i_accountId = ''
                var i_accountName = ''
                var customrecord_sub_wise_acc_mappingsSearchObj = search.create({
                    type: "customrecord_sub_wise_acc_mappings",
                    filters: [
                        ["isinactive", "is", "F"],
                        "AND",
                        ["custrecord_s_a_subsidiary_", "anyof", i_subId]
                    ],
                    columns: [
                        search.createColumn({
                            name: "custrecord_s_a_account_",
                            label: "Account #"
                        })
                    ]
                });
                var searchResultCount = customrecord_sub_wise_acc_mappingsSearchObj.runPaged().count;
                log.debug("customrecord_sub_wise_acc_mappingsSearchObj result count", searchResultCount);
                customrecord_sub_wise_acc_mappingsSearchObj.run().each(function(result) {
                    // .run().each has a limit of 4,000 results
                    /* objFldBankAccount.addSelectOption({
					value: result.getValue({name: "custrecord_s_a_account_", label: "Account #"}),
					text: result.getText({
						name: "custrecord_s_a_account_", label: "Account #"
					}),
					isSelected: false
				});*/
                    i_accountId = result.getValue({
                        name: "custrecord_s_a_account_",
                        label: "Account #"
                    })
                    i_accountName = result.getText({
                        name: "custrecord_s_a_account_",
                        label: "Account #"
                    })
                    return true;
                });
                return [i_accountId, i_accountName]

            } catch (e) {
                log.error('errorn in findAccountId function ', e.emssage)
                return [null, null]
            }
        }

        function refresh() {
            var currentRec = currentRecord.get();
            var PROCESS_TYPE = currentRec.getValue({
                fieldId: "custpage_processtype"
            });
            //alert("PROCESS_TYPE"+PROCESS_TYPE)
            var deployment_Id = ''
            if (PROCESS_TYPE == 'Initiate') {
                deployment_Id = 'customdeploy_okn_init_slear_bank_integ'
            } else {
                deployment_Id = 'customdeploy_okn_su_slear_bank_integarti'
            }
            var s_URL = url.resolveScript({
                scriptId: 'customscript_okn_su_slear_bank_integarti',
                deploymentId: deployment_Id
            });
            window.onbeforeunload = null;
            window.open(s_URL, '_self', null, null);
        }

        function pageInit(context) {
			try{
				 
			}catch(e){
				alert("in page init"+e)
			}

        }

        function onSave(context) {
            var currentObj = context.currentRecord
            var lineCount = currentObj.getLineCount({
                sublistId: 'custsublistid'
            })
            var flag = false
            for (var i = 0; i < lineCount; i++) {
                var i_checkBox = currentObj.getCurrentSublistValue({
                    sublistId: 'custsublistid',
                    fieldId: 'custpage_select'
                })
                if (i_checkBox == 'true' || i_checkBox == true || i_checkBox == "T") {
                    flag = true
                }
            }

            if (!flag) {
                alert("You have not selected any bill to proceed the clear bank")
            } else {
                return true
            }

        }

        function _logValidation(value) {
            if (value != null && value != '' && value != undefined && value.toString() != 'NaN' && value != NaN) {
                return true;
            } else {
                return false;
            }
        }


        function exportCSV() {

            try {
                var currentRec = currentRecord.get();
                var tran_array = new Array();
                //alert('Enter in Export Function');
                var lineCount_csv = currentRec.getLineCount({
                    sublistId: 'custsublistid'
                });
                //  alert("lineCount_csv"+lineCount_csv);
                var initiateSublistArray = ['custpage_bill', 'custpage_date', 'custpage_due_date', 'custpage_transaction_no', 'custpage_vendor_name', 'custpage_amount_to_be_paid', 'custpage_amount_due', 'custpage_total_amount', 'custpage_payment_credit', 'custpage_tax_amount', 'custpage_location', 'custpage_ben_bank_name', 'custpage_account_no', 'custpage_ifsc_code', 'custpage_subsidairy', "custpage_bank_accounts", "custpage_payment_date", "custpage_rejection_reason", 'custpage_custom_record_id']
                var internalIdArray = []
                for (var j = 0; j < initiateSublistArray.length - 5; j++) {
                    var colName = initiateSublistArray[j];
                    internalIdArray.push(colName)
                }
                // alert("internalIdArray" + internalIdArray)
                var line_str = ''

                for (var i = 0; i < lineCount_csv; i++) {
                    var select_checkbox = currentRec.getSublistValue({
                        sublistId: "custsublistid",
                        fieldId: "custpage_select",
                        line: i

                    });
                    if (select_checkbox == true) {
                        for (var ip = 0; ip < internalIdArray.length; ip++) {
                            if (ip == 0) {
                                var LineObj = currentRec.getSublistText({
                                    sublistId: 'custsublistid',
                                    fieldId: internalIdArray[ip],
                                    line: i
                                });
                                //alert("LineObj"+LineObj)
                                LineObj = LineObj.replace("Vendor Bill #", " ")
                            } else {
                                //alert("else")
                                var LineObj = currentRec.getSublistText({
                                    sublistId: 'custsublistid',
                                    fieldId: internalIdArray[ip],
                                    line: i
                                });
                            }

                            if (!_logValidation(LineObj)) {
                                LineObj = ''
                            }
                            //alert("LineObj"+LineObj)
                            line_str += LineObj.replace(/[`~!@#$%^&*()_|+\-=?;:'",<>\{\}\[\]\\\/]/gi, ' ').replace(/[\r\n]/gm, ' ') + ','
                        }
                        line_str += 'splitdata'

                    }
                }

                var s_URL = url.resolveScript({
                    scriptId: 'customscript_ok_su_generate_csv_file',
                    deploymentId: 'customdeploy_ok_su_generate_csv_file'
                });
                s_URL += '&csvfile=' + line_str;
                //alert("s_URL"+s_URL)
                window.onbeforeunload = null;
                window.open(s_URL, '_self', null, null);



            } catch (ex) {

                log.debug('Error in Export CSV Function', ex.message);
            }
        }

        return {

            searchlist: searchlist,
            pageInit: pageInit,
            refresh: refresh,
          //  saveRecord: onSave,
            rejectpayment: rejectpayment,
            fieldChanged: fieldChanged,
            exportCSV: exportCSV,
            sendRejectEmailNotification: sendRejectEmailNotification
            //validateField:validateField
        };
    });