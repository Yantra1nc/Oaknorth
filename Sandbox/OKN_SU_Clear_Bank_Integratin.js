/*
Script Name: SU_Oaknorth_Approve_Bulk_Journal_Entries.js
Script Type: Suitelet Script
Created Date: 01/11/2022
Created By: sanjit yadav(Yantra Inc).
Company : Yantra Inc.
Description:
 *************************************************************/
/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 **/
var PAYMENTS_CREDIT_APPLIED_ARR = {};
var i_subsidaryArray = []
define(['N/ui/serverWidget', 'N/log', 'N/currentRecord', 'N/format', 'N/record', 'N/search', 'N/redirect', 'N/url', 'N/runtime', 'N/task'],
    function(serverWidget, log, currentRecord, format, record, search, redirect, url, runtime, task) {
        var initiateSublistArray = ['custpage_bill', 'custpage_date', 'custpage_due_date', 'custpage_transaction_no', 'custpage_vendor_name', 'custpage_amount_to_be_paid', 'custpage_amount_due', 'custpage_total_amount', 'custpage_payment_credit', 'custpage_tax_amount', 'custpage_location', 'custpage_ben_bank_name', 'custpage_account_no', 'custpage_ifsc_code', 'custpage_subsidairy', "custpage_bank_accounts", "custpage_payment_date", "custpage_rejection_reason", 'custpage_custom_record_id']

        function onRequest(context) {
            try {
                if (context.request.method == 'GET') {
                    var o_contextOBJ = runtime.getCurrentScript();
                    log.debug('suiteletFunction', ' Context OBJ --> ' + o_contextOBJ);

                    var PROCESS_TYPE = o_contextOBJ.getParameter({
                        name: 'custscript_process_type'
                    });
                    log.debug('schedulerFunction', ' PROCESS_TYPE --> ' + PROCESS_TYPE);

                    var SEARCH_X = "";
                    var FORM_X = "";
                    var deployID = "";
                    var button_name = '';

                    if (PROCESS_TYPE == 'Initiate') {
                        SEARCH_X = 'customsearch_clear_bank_integ_initiate';
                        FORM_X = 'OakNorth UK | Clear Bank Integration | Initiate';
                        deployID = 'customdeploy_okn_init_slear_bank_integ';
                        button_name = 'OakNorth | Initiate Approval'
                    }
                    if (PROCESS_TYPE == 'Payment') {
						SEARCH_X='customsearch_clear_bank_payment_file'
                        //SEARCH_X = 'customsearch_clear_bank_integration';
                        FORM_X = 'OakNorth UK | Clear Bank Integration | Payment';
                        deployID = 'customdeploy_okn_su_slear_bank_integarti';
                        button_name = 'Clear Bank | Proceed to Payment'
                    }


                    var userName = "";
                    var userId = "";

                    var objUser = runtime.getCurrentUser();

                    if (_logValidation(objUser)) {
                        userId = objUser.id;
                        userName = objUser.name;
                    }

                    var custFromDate = context.request.parameters.custFromDate;
                    var requestor = context.request.parameters.i_requestor;

                    var i_subAccont = context.request.parameters.ii_accounId
                    log.debug('i_subAccont', i_subAccont)
                    if (_logValidation(custFromDate)) {
                        log.debug('suiteletFunction', 'Project PARAM --> ' + custFromDate);
                        custFromDate = format.parse({
                            value: custFromDate,
                            type: format.Type.DATE
                        })
                        custFromDate = format.format({
                            value: custFromDate,
                            type: format.Type.DATE
                        })
                        log.debug('schedulerFunction', ' from Date   -->' + custFromDate)
                    }
                    var custToDate = context.request.parameters.custToDate;
                    if (_logValidation(custToDate)) {
                        log.debug('suiteletFunction', 'Project PARAM --> ' + custToDate);
                        custToDate = format.parse({
                            value: custToDate,
                            type: format.Type.DATE
                        })
                        custToDate = format.format({
                            value: custToDate,
                            type: format.Type.DATE
                        })
                        log.debug('schedulerFunction', ' to Date   -->' + custToDate)
                    }

                    var custSubsidaryName = context.request.parameters.custSubsidaryName;
                    log.debug("custSubsidaryName", custSubsidaryName);

                    var form = serverWidget.createForm({
                        title: FORM_X
                    });
                    form.addFieldGroup({
                        id: 'custpage_bank_file_info',
                        label: 'Primary Information'
                    });
                    form.addFieldGroup({
                        id: 'custpage_date_filters',
                        label: 'Date Criteria'
                    });
                    var objFldUserId = form.addField({
                        id: 'custpage_userid',
                        type: serverWidget.FieldType.TEXT,
                        label: 'User#',
                        container: 'custpage_bank_file_info'
                    });
                    objFldUserId.defaultValue = userId + " " + userName;
                    objFldUserId.updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.DISABLED
                    });
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

                    if (hours < 10) {
                        hours = '0' + hours;
                    }
                    if (minutes < 10) {
                        minutes = '0' + minutes;
                    }
                    if (seconds < 10) {
                        seconds = '0' + seconds;
                    }

                    // prints date & time in YYYY-MM-DD HH:MM:SS format
                    //    log.debug('format date', year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);
                    //var dateCreated = year + "-" + month + "-" + date + " " + hours + "-" + minutes + "-" + seconds;
                    var dateCreated = year + "-" + month + "-" + date;
                    //    log.debug('date created', datecreated);

                    var objFldTransmissionDate = form.addField({
                        id: 'custpage_transmissiondate',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Current Date',
                        container: 'custpage_bank_file_info'
                    });
                    objFldTransmissionDate.defaultValue = dateCreated;
                    objFldTransmissionDate.updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.DISABLED
                    });

                    var from_date = form.addField({
                        id: 'custpage_fromdate',
                        type: serverWidget.FieldType.DATE,
                        label: 'Bill Start Date',
                        container: 'custpage_date_filters'
                    });


                    var to_date = form.addField({
                        id: 'custpage_todate',
                        type: serverWidget.FieldType.DATE,
                        label: 'Bill End Date',
                        container: 'custpage_date_filters'
                    });
                    /*if(PROCESS_TYPE != 'Payment')
				 {
					
					 from_date.isMandatory = true;
					 to_date.isMandatory = true;
				 }
				 */

                    var PROCESS_OBJ = form.addField({
                        id: 'custpage_processtype',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Type',
                        container: 'custpage_bank_file_info'
                    });
                    PROCESS_OBJ.defaultValue = PROCESS_TYPE;
                    PROCESS_OBJ.updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.DISABLED
                    });



                    form.updateDefaultValues({
                        custpage_form_submit: 'showSublist'
                    });

                    var subsidary = form.addField({
                        id: 'custpage_subsidary',
                        type: serverWidget.FieldType.SELECT,
                        label: 'Subsidary',
                        container: 'custpage_bank_file_info'

                    });


                    subsidary.addSelectOption({
                        value: '',
                        text: ''
                    });
                    subsidiarySearch(subsidary)
                    if (PROCESS_TYPE == 'Initiate') {
                        log.debug('i_subsidaryArray', i_subsidaryArray)

                        var objFldBankAccount = form.addField({
                            id: 'custpage_bank_account',
                            type: serverWidget.FieldType.SELECT,
                            label: 'Bank Account#',
                            container: 'custpage_bank_file_info'

                        });
                        objFldBankAccount.addSelectOption({
                            value: '',
                            text: ''
                        });
                        objFldBankAccount.defaultValue = i_subAccont;
                        objFldBankAccount.isMandatory = true;
                        searchAccountId(i_subsidaryArray, objFldBankAccount)
                    }

                    custSubsidaryName = split_data(custSubsidaryName)
                    if (_logValidation(custSubsidaryName)) {
                        subsidary.defaultValue = custSubsidaryName;
                    }

                    if (_logValidation(custFromDate)) {
                        from_date.defaultValue = custFromDate;
                    }
                    if (_logValidation(custToDate)) {
                        to_date.defaultValue = custToDate;
                    }

                    var sublist = form.addSublist({
                        id: 'custsublistid',
                        type: serverWidget.SublistType.LIST,
                        label: 'Clear Bank | Bill Entries'

                    });
                    form.clientScriptModulePath = 'SuiteScripts/CLI_Valie_clear_Bank_integration_from.js';
                    //form.clientScriptFileId = 911135;

                    //log.debug("custtrantype  Bill Payment Order Data", custtranstype);

                    var a_filters = new Array();

                    var a_columns = new Array();
                    a_columns.push(search.createColumn({
                        name: 'internalid'
                    }));

                    var a_filters = new Array();

                    paymentCredit()
                    log.debug('PAYMENTS_CREDIT_APPLIED_ARR', PAYMENTS_CREDIT_APPLIED_ARR)


                    if (_logValidation(custFromDate) && _logValidation(custToDate)) {

                        a_filters.push(
                            search.createFilter({
                                name: 'trandate',
                                operator: search.Operator.WITHIN,
                                values: [custFromDate, custToDate]
                            }));
                    }
                    if (PROCESS_TYPE == 'Payment' && !_logValidation(custFromDate) && !_logValidation(custToDate)) {
                        custFromDate = 'NA'
                        custToDate = 'NA'
                        from_date.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.DISABLED
                        });
                        to_date.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.DISABLED
                        });
                    }
                    if (_logValidation(custSubsidaryName)) {
						if(PROCESS_TYPE=='Payment'){
							a_filters.push(
                            search.createFilter({
                                name: 'custrecord_subsidary',
                                operator: search.Operator.ANYOF,
                                values: custSubsidaryName
                            }));
						}else{
							a_filters.push(
                            search.createFilter({
                                name: 'subsidiary',
                                operator: search.Operator.ANYOF,
                                values: custSubsidaryName
                            }));
						}
                        
                    }

                    //	if (_logValidation(custFromDate) && _logValidation(custToDate)) 
                    {
                        var markAll = "markAll()";
                        var unmarkAll = "unmarkAll()";

                        sublist.addMarkAllButtons();
                        /******* Sublist Fields*********/
                        sublist.addField({
                            id: 'custpage_select',
                            type: serverWidget.FieldType.CHECKBOX,
                            label: 'Select'
                        });
						/*sublist.addField({
                            id: 'custpage_pp_pc_edit',
                            type: serverWidget.FieldType.TEXT,
                            label: 'Edit | View'
                        });
						*/
						/*sublist.setSublistValue({
                            id: 'custpage_pp_pc_edit',
                            line: 0,
                            value: setEVLink()
                        });
						*/

                        var tranId = sublist.addField({
                            id: 'custpage_bill',
                            type: serverWidget.FieldType.SELECT,
                            label: 'Bill',
                            source: 'transaction'
                        });
                        tranId.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.DISABLED
                        });
                        sublist.addField({
                            id: 'custpage_date',
                            type: serverWidget.FieldType.TEXT,
                            label: 'DATE'
                        });
                        sublist.addField({
                            id: 'custpage_due_date',
                            type: serverWidget.FieldType.TEXT,
                            label: 'Due Date'
                        });
                        sublist.addField({
                            id: 'custpage_transaction_no',
                            type: serverWidget.FieldType.TEXT,
                            label: 'TRANSACTION NUMBER'
                        });
                        var vendorId = sublist.addField({
                            id: 'custpage_vendor_name',
                            type: serverWidget.FieldType.SELECT,
                            label: 'VENDOR NAME',
                            source: 'vendor'
                        });
                        vendorId.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.DISABLED
                        });
                        var totalAmt = sublist.addField({
                            id: 'custpage_amount_to_be_paid',
                            type: serverWidget.FieldType.CURRENCY,
                            label: 'AMOUNT TO BE PAID '
                        });
						if(PROCESS_TYPE == 'Initiate'){
                        totalAmt.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.ENTRY
                        });
						}
                        sublist.addField({
                            id: 'custpage_amount_due',
                            type: serverWidget.FieldType.CURRENCY,
                            label: 'AMOUNT DUE '
                        });
                        sublist.addField({
                            id: 'custpage_total_amount',
                            type: serverWidget.FieldType.CURRENCY,
                            label: 'TOTAL AMOUNT '
                        });
                        sublist.addField({
                            id: 'custpage_payment_credit',
                            type: serverWidget.FieldType.CURRENCY,
                            label: 'PAYMENT & CREDIT '
                        });
                        sublist.addField({
                            id: 'custpage_tax_amount',
                            type: serverWidget.FieldType.CURRENCY,
                            label: 'TAX AMOUNT '
                        });
                        var locId = sublist.addField({
                            id: 'custpage_location',
                            type: serverWidget.FieldType.SELECT,
                            label: 'LOCATION ,',
                            source: 'location'
                        });
                        locId.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.DISABLED
                        });
                        sublist.addField({
                            id: 'custpage_ben_bank_name',
                            type: serverWidget.FieldType.TEXT,
                            label: 'BENEFICIARY BANK NAME '
                        });
                        sublist.addField({
                            id: 'custpage_account_no',
                            type: serverWidget.FieldType.TEXT,
                            label: 'ACCOUNT NO'
                        });
                        sublist.addField({
                            id: 'custpage_ifsc_code',
                            type: serverWidget.FieldType.TEXT,
                            label: 'IFCS CODE'
                        });
                        var subId = sublist.addField({
                            id: 'custpage_subsidairy',
                            type: serverWidget.FieldType.SELECT,
                            label: 'SUBSIDAIRY',
                            source: 'subsidiary'
                        });
                        subId.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.DISABLED
                        });
                        if (PROCESS_TYPE != 'Initiate') {
                            var bankAcc = sublist.addField({
                                id: 'custpage_bank_accounts',
                                type: serverWidget.FieldType.SELECT,
                                label: 'Bank Account',
                                source: 'account'
                            });
                            bankAcc.updateDisplayType({
                                displayType: serverWidget.FieldDisplayType.DISABLED
                            });
                            var pymtDat = sublist.addField({
                                id: 'custpage_payment_date',
                                type: serverWidget.FieldType.TEXT,
                                label: 'PAYMENT DATE',

                            });
                            pymtDat.updateDisplayType({
                                displayType: serverWidget.FieldDisplayType.DISABLED
                            });
                            var rejectReason = sublist.addField({
                                id: 'custpage_rejection_reason',
                                type: serverWidget.FieldType.TEXTAREA,
                                label: 'REJECT RESON (CLEAR BANK)',

                            });
                            rejectReason.updateDisplayType({
                                displayType: serverWidget.FieldDisplayType.DISABLED
                            });
                            var customRecord = sublist.addField({
                                id: 'custpage_custom_record_id',
                                type: serverWidget.FieldType.TEXT,
                                label: 'Custom Record Id',

                            });
                            customRecord.updateDisplayType({
                                displayType: serverWidget.FieldDisplayType.HIDDEN
                            });
							

                        }

                        /*************** END******************/
                        var VendorPymtBillSearchObj = search.load({
                            id: SEARCH_X
                        });

                        log.debug('Bill search result.', JSON.stringify(VendorPymtBillSearchObj));

                        if (_logValidation(a_filters)) {
                            for (var idx = 0; idx < a_filters.length; idx++) {
                                VendorPymtBillSearchObj.filters.push(a_filters[idx]);
                                log.debug('a_filters', a_filters[idx]);
                            }
                        }

                        /*********End************/

                        var a_search_results = VendorPymtBillSearchObj.run().getRange({
                            start: 0,
                            end: 1000
                        });
                        //log.debug('schedulerFunction', '  Search Results  -->' + a_search_results);
                        //log.audit('schedulerFunction', '  Search Results.length  -->' + a_search_results.length);
                        var SublistSearch = VendorPymtBillSearchObj.run();

                        var SublistSearchResults = SublistSearch.getRange(0, 1000);
                        var c = 0;
                        for (var ix = 0; ix < SublistSearchResults.length; ix++) {
                            var result = SublistSearchResults[ix];
							log.audit('result',result)
                            for (var k in result.columns) {
                                var fieldValue;
                                fieldValue = result.getValue(result.columns[k])
                                //log.debug('fieldValue', fieldValue)
                                if (!fieldValue) {
                                    fieldValue = '';
                                }
                             //   log.debug('fieldValue', fieldValue)
                                if (_logValidation(fieldValue)) {
                                    sublist.setSublistValue({
                                        id: initiateSublistArray[k],
                                        value: fieldValue,
                                        line: ix
                                    });
                                }
                                if (result.columns[k].label == 'PAYMENT & CREDIT' && PROCESS_TYPE == 'Initiate') {
                                    var reocrdId = result.getValue(result.columns[0])
									/*sublist.setSublistValue({
										id: 'custpage_pp_pc_edit',
										line: ix,
										value: setEVLink()
									});*/
									log.debug('reocrdId',reocrdId)
                                    var paidAmount = 0;
                                    try {
                                        paidAmount = Math.abs(PAYMENTS_CREDIT_APPLIED_ARR[reocrdId].payingamount);
                                    } catch (excdd) {
                                        paidAmount = 0;
                                    }
									log.debug('paidAmount',paidAmount)
                                    if (paidAmount > 0) {
										log.debug('details of log','fieldValue:'+fieldValue+':paidAmount:'+paidAmount)
                                        sublist.setSublistValue({
                                            id: initiateSublistArray[5],
                                            value: Number(Math.abs(result.getValue(result.columns[7])) - paidAmount).toFixed(2),
                                            line: ix
                                        });
                                    }
                                    sublist.setSublistValue({
                                        id: initiateSublistArray[8],
                                        value: paidAmount,
                                        line: ix
                                    });
                                }
                            }
                        }

                        log.debug('enter')
                    }

                    form.addSubmitButton({
                        id: 'approve',
                        label: button_name,
                        functionName: 'approve()' //client script function call
                    });

                    //form.clientScriptModulePath = ' ';// client script name.js
                    form.addButton({
                        id: 'refresh',
                        label: 'Refresh',
                        functionName: 'refresh()' //client script function call
                    });

                    form.addButton({
                        id: 'search',
                        label: 'Apply Criteria',
                        functionName: 'searchlist()' //client script function call
                    });

                    if (PROCESS_TYPE == 'Payment') {
                        form.addButton({
                            id: 'reject_payment',
                            label: 'Reject Payment',
                            functionName: 'rejectpayment()' //client script function call
                        });

                    }

                    if (PROCESS_TYPE != 'Payment') {
                        form.addButton({
                            id: 'export_csv',
                            label: 'Download CSV',
                            functionName: 'exportCSV()'
                        });
                    }
					
					context.response.writePage(form);
					
                   
                } //else if (context.request.method == 'POST') {
                else {
                    var request = context.request;
                    var a_selected_items = new Array();
                    var arr_t = [];
                    var amountArray = []
                    log.debug('suiteletFunction', 'Post Function ...');

                    var userFromDate = context.request.parameters.custpage_fromdate;
                    log.debug('post method from date', userFromDate);
                    var userToDate = context.request.parameters.custpage_todate;
                    log.debug('post method to date', userToDate);
                    var userSubsidary = context.request.parameters.custpage_subsidary;
                    log.debug('post method user subsidary ', userSubsidary);
                    var o_contextOBJ = runtime.getCurrentScript();
                    log.debug('suiteletFunction', ' Context OBJ --> ' + o_contextOBJ);

                    var PROCESS_TYPE = o_contextOBJ.getParameter({
                        name: 'custscript_process_type'
                    });
                    log.debug('schedulerFunction', ' PROCESS_TYPE --> ' + PROCESS_TYPE);
                    var i_bankAccount = context.request.parameters.custpage_bank_account
                    log.debug('i_bankAccount', i_bankAccount)

                    var SEARCH_X = "";
                    var FORM_X = "";
                    var deployID = "";
                    var button_name = '';

                    var userName = "";
                    var emailAddress = "";

                    var objUser = runtime.getCurrentUser();

                    if (_logValidation(objUser)) {
                        emailAddress = objUser.email;
                        //	userName = objUser.name;
                    }
                    if (PROCESS_TYPE == 'Initiate') {
                        SEARCH_X = 'customsearch_clear_bank_integ_initiate';
                        FORM_X = 'OakNorth UK | Clear Bank Integration | Initiate';
                        deployID = 'customdeploy_okn_init_slear_bank_integ';
                        button_name = 'OakNorth | Initiate Approval'
                    }
                    if (PROCESS_TYPE == 'Payment') {
                        SEARCH_X = 'customsearch_clear_bank_integration';
                        FORM_X = 'OakNorth UK | Clear Bank Integration | Payment';
                        deployID = 'customdeploy_okn_su_slear_bank_integarti';
                        button_name = 'Clear Bank | Proceed to Payment'
                    }
                    var i_line_count = request.getLineCount({
                        group: 'custsublistid'
                    });
                    log.audit('schedulerFunction', ' Line Count -->' + i_line_count);
                    var billJson = []
                    if (_logValidation(i_line_count)) {
                        for (var t_k = 0; t_k < i_line_count; t_k++) {
                            var type = '';
                            var f_select = request.getSublistValue({
                                group: 'custsublistid',
                                name: 'custpage_select',
                                line: t_k
                            });
                            if (f_select == 'T') {
                                //log.debug('a_selected_itemid i if condition', a_selected_itemid)

                                var billNo = request.getSublistValue({
                                    group: 'custsublistid',
                                    name: 'custpage_bill',
                                    line: t_k
                                });
                                var billDate = request.getSublistValue({
                                    group: 'custsublistid',
                                    name: 'custpage_date',
                                    line: t_k
                                });
                                var billDueDate = request.getSublistValue({
                                    group: 'custsublistid',
                                    name: 'custpage_due_date',
                                    line: t_k
                                });
                                var billTrNo = request.getSublistValue({
                                    group: 'custsublistid',
                                    name: 'custpage_transaction_no',
                                    line: t_k
                                });
                                var billVendor = request.getSublistValue({
                                    group: 'custsublistid',
                                    name: 'custpage_vendor_name',
                                    line: t_k
                                });
                                var billToBePaid = request.getSublistValue({
                                    group: 'custsublistid',
                                    name: 'custpage_amount_to_be_paid',
                                    line: t_k
                                });
                                var billDue = request.getSublistValue({
                                    group: 'custsublistid',
                                    name: 'custpage_amount_due',
                                    line: t_k
                                });
                                var billtotal = request.getSublistValue({
                                    group: 'custsublistid',
                                    name: 'custpage_total_amount',
                                    line: t_k
                                });
                                var billCredit = request.getSublistValue({
                                    group: 'custsublistid',
                                    name: 'custpage_payment_credit',
                                    line: t_k
                                });
                                var billtax = request.getSublistValue({
                                    group: 'custsublistid',
                                    name: 'custpage_tax_amount',
                                    line: t_k
                                });
                                var billLoaction = request.getSublistValue({
                                    group: 'custsublistid',
                                    name: 'custpage_location',
                                    line: t_k
                                });
                                var billBenName = request.getSublistValue({
                                    group: 'custsublistid',
                                    name: 'custpage_ben_bank_name',
                                    line: t_k
                                });
                                var billAccontNo = request.getSublistValue({
                                    group: 'custsublistid',
                                    name: 'custpage_account_no',
                                    line: t_k
                                });
                                var billIfscCode = request.getSublistValue({
                                    group: 'custsublistid',
                                    name: 'custpage_ifsc_code',
                                    line: t_k
                                });
                                var billSubsidary = request.getSublistValue({
                                    group: 'custsublistid',
                                    name: 'custpage_subsidairy',
                                    line: t_k
                                });
                                if (PROCESS_TYPE == 'Payment') {
                                    var billAccounts = request.getSublistValue({
                                        group: 'custsublistid',
                                        name: 'custpage_bank_accounts',
                                        line: t_k
                                    });
                                    var billPaymentDate = request.getSublistValue({
                                        group: 'custsublistid',
                                        name: 'custpage_payment_date',
                                        line: t_k
                                    });
                                    var billReject = request.getSublistValue({
                                        group: 'custsublistid',
                                        name: 'custpage_rejection_reason',
                                        line: t_k
                                    });
									var customRecId =  request.getSublistValue({
                                        group: 'custsublistid',
                                        name: 'custpage_custom_record_id',
                                        line: t_k
                                    });
                                } else {
                                    var billAccounts = i_bankAccount
                                    var billPaymentDate = ''
                                    var billReject = ''
									var customRecId=''
                                }
                                billJson.push({
                                    "billNo": billNo,
                                    "billDate": billDate,
                                    "billDueDate": billDueDate,
                                    "billTrNo": billTrNo,
                                    "billVendor": billVendor,
                                    "billToBePaid": billToBePaid,
                                    "billDue": billDue,
                                    "billtotal": billtotal,
                                    "billCredit": billCredit,
                                    "billtax": billtax,
                                    "billLoaction": billLoaction,
                                    "billBenName": billBenName,
                                    "billAccontNo": billAccontNo,
                                    "billIfscCode": billIfscCode,
                                    "billSubsidary": billSubsidary,
                                    "billAccounts": billAccounts,
                                    "billPaymentDate": billPaymentDate,
                                    "billReject": billReject,
                                    "emailAddress": emailAddress,
                                    "currentUser": objUser.id,
									"customRecId":customRecId,
									"processType":PROCESS_TYPE
                                })
                            }
                        }
                    }
                    log.debug('billJson', billJson)
                    var arr_t = []
                    log.audit('arr_t', arr_t)
                    if (billJson.length > 0) {
                        reschedule_script(arr_t, PROCESS_TYPE, i_bankAccount, emailAddress, amountArray, billJson)
                    }
                    setTimeout(function() {
                        log.debug('Ran after 1 second');
                    }, 15000);

                    redirect.toSuitelet({
                        scriptId: 'customscript_okn_su_slear_bank_integarti',
                        deploymentId: deployID,
                        parameters: null
                    });

                }
            } catch (ex) {
                log.error({
                    title: ' SUITLET ERROR',
                    details: 'ex,name' + ex.name + 'ex.message' + ex.message + 'ex.type ' + ex.type
                });
            }

        }

        function setTimeout(aFunction, milliseconds) {
            var date = new Date();
            date.setMilliseconds(date.getMilliseconds() + milliseconds);
            while (new Date() < date) {}

            return aFunction();
        }

        function reschedule_script(arr_t, process_type, i_bankAccount, emailAddress, amountArray, billJson) {
            try {
                log.audit('enter')
                var o_script_task_SO = task.create({
                    taskType: task.TaskType.MAP_REDUCE
                });
                o_script_task_SO.scriptId = 'customscript_okn_mr_update_bill_record'
                o_script_task_SO.deploymentId = null;
                o_script_task_SO.params = {
                    custscript_bill_record_array: arr_t.toString(),
                    custscript_process_type_x: process_type,
                    custscript_bank_account_id: i_bankAccount,
                    custscript_current_receiver_email: emailAddress,
                    custscript_amount_array: amountArray.toString(),
                    custscript_record_json: billJson
                };

                var o_script_task_SO_ID = o_script_task_SO.submit();
                log.debug('reschedule_script', '  Script Scheduled ....... ');
            } catch (e) {
                log.error('error in reschedule_script function', e.message)
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

        function convert_date(d_date) {
            var d_date_convert = "";

            if (_logValidation(d_date)) {
                var currentTime = new Date(d_date);
                var currentOffset = currentTime.getTimezoneOffset();
                var ISTOffset = 330; // IST offset UTC +5:30
                d_date_convert = new Date(currentTime.getTime() + (ISTOffset + currentOffset) * 60000);

            }
            return d_date_convert;
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

        function subsidiarySearch(subsidary) {
            try {

                search.load({
                    id: 'customsearch_clear_bank_search'
                }).run().each(function(result) {

                    //subsidary.
                    subsidary.addSelectOption({
                        value: result.id,
                        text: result.getValue({
                            name: "name",
                            sort: search.Sort.ASC,
                            label: "Name"
                        }),
                        isSelected: false
                    });
                    i_subsidaryArray.push(result.id)
                    return true;
                });
            } catch (e) {
                log.error('error in search', e.message)
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

        function currentDate() {
            var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            var currObj = new Date()
            var i_day = currObj.getDate()
            if (i_day < 10) {
                i_day = '0' + i_day
            }
            return i_day + '-' + month[currObj.getMonth()] + '-' + currObj.getFullYear()
        }

        function bankAccountNo(objFldBankAccount) {
            try {
                var customrecord_ns_hdfc_account_number_SearchObj = search.create({
                    type: "customrecord_ns_hdfc_account_number_",
                    filters: [
                        ["isinactive", "is", "F"]
                    ],
                    columns: [
                        search.createColumn({
                            name: "custrecord_ns_coa_",
                            label: "Bank Account"
                        })
                    ]
                });
                var searchResultCount = customrecord_ns_hdfc_account_number_SearchObj.runPaged().count;
                log.debug("customrecord_ns_hdfc_account_number_SearchObj result count", searchResultCount);
                customrecord_ns_hdfc_account_number_SearchObj.run().each(function(result) {
                    // .run().each has a limit of 4,000 results
                    objFldBankAccount.addSelectOption({
                        value: result.getValue({
                            name: "custrecord_ns_coa_",
                            label: "Bank Account"
                        }),
                        text: result.getText({
                            name: "custrecord_ns_coa_",
                            label: "Bank Account"
                        }),
                        isSelected: false
                    });
                    return true;
                });


            } catch (e) {
                log.error('error in bankAccountNo function', e.message)
            }
        }
		
		function setEVLink() {/* formatting */
            var recType = 'vendorbill'

            var v = url.resolveRecord({
                recordType: recType,
                recordId: 3488228,
                isEditMode: false
            });
            var e = url.resolveRecord({
                recordType: recType,
                recordId: 3488228,
                isEditMode: true
            });
            var view = '<a href="' + v + '">View</a>';
            var edit = '<a href="' + e + '">Edit</a>';
            
            return edit + " | " + view;
        }
		function setEntityLink(entityId) {
        	try{
	        	var entityLink = '/app/common/entity/vendor.nl?id=' + entityId;

	        	return entityLink;
	        } catch(ex) {
	        	log.error({
	        		title: 'Error in setEntityLink',
	        		details: ex.message
	        	});
	        }
        }
        function searchAccountId(i_subsidaryArray, objFldBankAccount) {
            try {
                var customrecord_sub_wise_acc_mappingsSearchObj = search.create({
                    type: "customrecord_sub_wise_acc_mappings",
                    filters: [
                        ["isinactive", "is", "F"],
                        "AND",
                        ["custrecord_s_a_subsidiary_", "anyof", i_subsidaryArray]
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
                    objFldBankAccount.addSelectOption({
                        value: result.getValue({
                            name: "custrecord_s_a_account_",
                            label: "Account #"
                        }),
                        text: result.getText({
                            name: "custrecord_s_a_account_",
                            label: "Account #"
                        }),
                        isSelected: false
                    });
                    return true;
                });

            } catch (e) {
                log.error('error in search account id function', e.message)
            }
        }

        function _logValidation(value) {
            if (value != null && value != '' && value != undefined && value.toString() != 'NaN' && value != NaN) {
                return true;
            } else {
                return false;
            }
        }
        return {
            onRequest: onRequest
        };
    });