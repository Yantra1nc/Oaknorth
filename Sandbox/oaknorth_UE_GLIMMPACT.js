    /**
     *@NApiVersion 2.x
     *@NScriptType UserEventScript
     */
     define(['N/error', 'N/currentRecord', 'N/search', 'N/record', 'N/log', 'N/ui/serverWidget', 'N/runtime'],
     function(error, currentRecord, search, record, log, serverWidget, runtime) {
         function beforeLoad(context) {
             var form = context.form;


             var currentRecord = context.newRecord;
             /*var record_Id = currentRecord.id;
             log.debug("record_Id", record_Id);*/
             var record_Id = currentRecord.getValue('id');
             log.debug("record_Id", record_Id);

             var record_type = currentRecord.type;
             log.debug("record_type", record_type);




             if (context.type == context.UserEventType.VIEW || context.type == context.UserEventType.EDIT) {


                 if (record_type == "customrecord_sagevendorbills") {
                     var NameVendor = currentRecord.getValue("custrecord_name_of_vendor");
                     log.debug("NameVendor", NameVendor);
                     /* var VendorSub = currentRecord.getText("custrecord_sage_vendor");
                      log.debug("VendorSub", VendorSub);*/
                     /*var posting_period = currentRecord.getText("custrecord_bill_date");
                     log.debug("posting_period", posting_period);*/
                     var tab = context.form.addTab({
                         id: 'custpage_gl_impact',
                         label: 'Expense Gl Impact'
                     });

                     var gl_sublist = context.form.addSublist({
                         id: 'custpage_grnsublist',
                         type: serverWidget.SublistType.INLINEEDITOR,
                         label: 'GRN Details',
                         tab: 'custpage_gl_impact'

                     });
                     log.debug("gl_sublist", gl_sublist);

                     var addsublistfield1 = gl_sublist.addField({
                         id: 'custpage_account',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Account'
                     });
                     /*var addsublistfield_glcode = gl_sublist.addField({
                         id: 'custpage_glcode',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Gl Code'
                     });*/

                     var addsublistfield_debit = gl_sublist.addField({
                         id: 'custpage_amount_debit',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Amount(Debit)'
                     });

                     var addsublistfield_credit = gl_sublist.addField({
                         id: 'custpage_amount_credit',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Amout(Credit)'
                     });

                     /*var addsublistfield_posting = gl_sublist.addField({
                         id: 'custpage_amount_posting',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Posting'
                     });*/

                     var addsublistfield_memo = gl_sublist.addField({
                         id: 'custpage_amount_memo',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Memo'
                     });

                     var addsublistfield_name = gl_sublist.addField({
                         id: 'custpage_amount_name',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Name'
                     });

                     /*var addsublistfield_subsidiary = gl_sublist.addField({
                         id: 'custpage_amount_subsidiary',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Subsidiary'
                     });*/


                     //if(){

                     var gl_impact_array = [];
                     var amountarray = [];
                     var customrecord_sagevendorbillsSearchObj = search.create({
                         type: "customrecord_sagevendorbills",
                         filters: [
                             ["internalid", "anyof", record_Id]
                         ],
                         columns: [
                             search.createColumn({
                                 name: "custrecord_sage_ap_account",
                                 label: "AP Account "
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_itemexpense_account",
                                 join: "CUSTRECORD_SAGE_VENDOR_BILL_NO",
                                 label: "GL Name"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_amount__",
                                 join: "CUSTRECORD_SAGE_VENDOR_BILL_NO",
                                 label: "Amount"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_gl_code",
                                 join: "CUSTRECORD_SAGE_VENDOR_BILL_NO",
                                 label: "GL Code"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_memo",
                                 join: "CUSTRECORD_SAGE_VENDOR_BILL_NO",
                                 label: "Memo/Remarks"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_subsidiary__",
                                 join: "CUSTRECORD_SAGE_VENDOR_BILL_NO",
                                 label: "Subsidiary"
                             }),
                             search.createColumn({
                                 name: "custrecord_name_of_vendor",
                                 label: "Name of Vendor"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_vendor",
                                 label: "Sage Vendor"
                             })
                         ]
                     });


                     var searchResult = customrecord_sagevendorbillsSearchObj.run()
                         .getRange({
                             start: 0,
                             end: 1000
                         });

                     var total_amount = 0;
                     var sage_Array = [];
                     for (var s = 0; s < searchResult.length; s++) {
                         // .run().each has a limit of 4,000 results
                         var sage_amount = searchResult[s].getValue({
                             name: "custrecord_sage_amount__",
                             join: "CUSTRECORD_SAGE_VENDOR_BILL_NO",
                             label: "Amount"
                         })
                         total_amount = parseFloat(parseFloat(total_amount) + parseFloat(sage_amount)).toFixed(2);
                         var rec = {

                             "gl_impact": searchResult[s].getText({
                                 name: "custrecord_sage_itemexpense_account",
                                 join: "CUSTRECORD_SAGE_VENDOR_BILL_NO",
                                 label: "GL Name"
                             }),

                             "amount": searchResult[s].getValue({
                                 name: "custrecord_sage_amount__",
                                 join: "CUSTRECORD_SAGE_VENDOR_BILL_NO",
                                 label: "Amount"
                             }),
                             "gl_code": searchResult[s].getValue({
                                 name: "custrecord_sage_gl_code",
                                 join: "CUSTRECORD_SAGE_VENDOR_BILL_NO",
                                 label: "GL Code"
                             }),
                             "sage_memo": searchResult[s].getValue({
                                 name: "custrecord_sage_memo",
                                 join: "CUSTRECORD_SAGE_VENDOR_BILL_NO",
                                 label: "Memo/Remarks"
                             }),
                             "line_subsidiary": searchResult[s].getValue({
                                 name: "custrecord_sage_subsidiary__",
                                 join: "CUSTRECORD_SAGE_VENDOR_BILL_NO",
                                 label: "Subsidiary"
                             }),
                             "nameofvendor": searchResult[s].getValue({
                                 name: "custrecord_name_of_vendor",
                                 label: "Name of Vendor"
                             }),
                             "bodylevelsubsidiary": searchResult[s].getText({
                                 name: "custrecord_sage_vendor",
                                 label: "Sage Vendor"
                             }),
                             "Sage_amount": total_amount
                         }
                         sage_Array.push(rec);

                     }
                     log.debug("sage_Array", sage_Array);


                     var ap_account = currentRecord.getText('custrecord_sage_ap_account');
                     log.debug("ap_account", ap_account);
                     var ap_account_id = currentRecord.getValue('custrecord_sage_ap_account');
                     log.debug("ap_account_id", ap_account_id);
                     if (_logValidation(ap_account_id)) {
                         var record_load_ap = record.load({
                             type: 'customrecord_sage_gl_name',
                             id: ap_account_id,
                             isDynamic: true
                         });
                         log.debug("record_load_ap", record_load_ap);

                         var ap_glcode_id = record_load_ap.getValue('custrecord_sage_expense_account_number');
                         log.debug("ap_glcode_id", ap_glcode_id);
                     }


                     var ap_line = sage_Array.length - 1;
                     log.debug("ap_line", ap_line);

                     for (var i = 0; i < sage_Array.length; i++) {
                         var final_account = sage_Array[i].gl_code + ' ' + sage_Array[i].gl_impact;
                         log.debug("final_account", final_account);
                         if (_logValidation(final_account)) {
                             gl_sublist.setSublistValue({
                                 id: 'custpage_account',
                                 line: i,
                                 value: final_account
                             });
                         }


                         //}
                         /*gl_sublist.setSublistValue({
                             id: 'custpage_glcode',
                             line: i,
                             value: sage_Array[i].gl_code
                         });*/
                         if (_logValidation(sage_Array[i].amount)) {
                             gl_sublist.setSublistValue({
                                 id: 'custpage_amount_debit',
                                 line: i,
                                 value: sage_Array[i].amount
                             });
                         }

                         if (i == ap_line) {
                             if (_logValidation(ap_account_id) && _logValidation(ap_account)) {
                                 var final_ap = ap_glcode_id + ' ' + ap_account;
                                 if (_logValidation(final_ap)) {
                                     gl_sublist.setSublistValue({
                                         id: 'custpage_account',
                                         line: i + 1,
                                         value: final_ap
                                     });
                                 }
                             }
                             if (_logValidation(sage_amount)) {
                                 gl_sublist.setSublistValue({
                                     id: 'custpage_amount_credit',
                                     line: i + 1,
                                     value: sage_Array[i].Sage_amount
                                 });
                             }

                             /*gl_sublist.setSublistValue({
                                 id: 'custpage_amount_subsidiary',
                                 line: i + 1,
                                 value: VendorSub
                             });*/
                         }
                         /*if(_logValidation(posting_period)){
                                                     gl_sublist.setSublistValue({
                                                         id: 'custpage_amount_posting',
                                                         line: i,
                                                         value: posting_period
                                                     });
                         }*/

                         if (_logValidation(sage_Array[i].sage_memo)) {
                             gl_sublist.setSublistValue({
                                 id: 'custpage_amount_memo',
                                 line: i,
                                 value: sage_Array[i].sage_memo
                             });
                         }

                         if (_logValidation(NameVendor)) {
                             gl_sublist.setSublistValue({
                                 id: 'custpage_amount_name',
                                 line: i,
                                 value: NameVendor
                             });
                         }

                         /*gl_sublist.setSublistValue({
                             id: 'custpage_amount_subsidiary',
                             line: i,
                             value: VendorSub
                         });*/




                     }

                     ///////////////////////gl impact payment tab for vendor bill///////////////////////


                     var tab_payment = context.form.addTab({
                         id: 'custpage_gl_impact_payment',
                         label: 'Payment Gl Impact'
                     });


                     var gl_sublist_payment = context.form.addSublist({
                         id: 'custpage_glsublist_payment',
                         type: serverWidget.SublistType.INLINEEDITOR,
                         label: 'GL Impact Payment',
                         tab: 'custpage_gl_impact_payment'

                     });
                     log.debug("gl_sublist_payment", gl_sublist_payment);

                     var addsublistfield1_accpayment = gl_sublist_payment.addField({
                         id: 'custpage_account_payment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Account'
                     });

                     /*var addsublist_glcodepayment = gl_sublist_payment.addField({
                         id: 'custpage_glcodepayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Gl Code'
                     });*/

                     var addsublistfield_debitpayment = gl_sublist_payment.addField({
                         id: 'custpage_amount_debitpayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Amount(Debit)'
                     });

                     var addsublistfield_creditpayment = gl_sublist_payment.addField({
                         id: 'custpage_amount_creditpayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Amout(Credit)'
                     });

                     /*var addsublistfield_postingpayment = gl_sublist_payment.addField({
                         id: 'custpage_postingpayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Posting'
                     });*/

                     var addsublistfield_memopayment = gl_sublist_payment.addField({
                         id: 'custpage_memopayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Memo'
                     });

                     var addsublistfield_namepayment = gl_sublist_payment.addField({
                         id: 'custpage_namepayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Name'
                     });

                     /*var addsublistfield_subsidiarypayment = gl_sublist_payment.addField({
                         id: 'custpage_subsidiarypayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Subsidiary'
                     });*/






                     var customrecord_sagevendorpaymentsSearchObj = search.create({
                         type: "customrecord_sagevendorpayments",
                         filters: [
                             ["custrecord_sage_vp_applyvendorbillno.internalid", "anyof", record_Id]
                         ],
                         columns: [
                             search.createColumn({
                                 name: "CUSTRECORD_SAGE_BANKACCOUNT_VENDORPAYMEN",
                                 summary: "GROUP",
                                 label: "Bank Account"
                             }),
                             search.createColumn({
                                 name: "CUSTRECORD_SAGE_TOTALAMOUNT_VP",
                                 summary: "SUM",
                                 label: "Total Amount"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_acct_id1",
                                 summary: "GROUP",
                                 label: "Account ID"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_vp_narration",
                                 summary: "GROUP",
                                 label: "Narration"
                             })
                             /*search.createColumn({name: "CUSTRECORD_SAGE_TOTALAMOUNT_VP", label: "Total Amount"})*/

                         ]
                     });


                     var searchResultpayment = customrecord_sagevendorpaymentsSearchObj.run()
                         .getRange({
                             start: 0,
                             end: 1000
                         });


                     //////////////////////search for tototal/////////////////////

                     var sage_Array_payment = [];
                     for (var s = 0; s < searchResultpayment.length; s++) {
                         // .run().each has a limit of 4,000 results

                         var rec_P = {

                             "bank_acc": searchResultpayment[s].getText({
                                 name: "CUSTRECORD_SAGE_BANKACCOUNT_VENDORPAYMEN",
                                 summary: "GROUP",
                                 label: "Bank Account"
                             }),
                             "glcode_P": searchResultpayment[s].getValue({
                                 name: "custrecord_sage_acct_id1",
                                 summary: "GROUP",
                                 label: "Account ID"
                             }),
                             "amt_pyt": searchResultpayment[s].getValue({
                                 name: "CUSTRECORD_SAGE_TOTALAMOUNT_VP",
                                 summary: "SUM",
                                 label: "Total Amount"
                             }),
                             "memo_P": searchResultpayment[s].getValue({
                                 name: "custrecord_sage_vp_narration",
                                 summary: "GROUP",
                                 label: "Narration"
                             })


                         }
                         sage_Array_payment.push(rec_P);

                     }

                     //log.debug("sage_Array_payment", sage_Array_payment);
                     //log.debug("amountarray", amountarray);




                     var ap_line_payment = sage_Array_payment.length - 1;
                     log.debug("ap_line_payment", ap_line_payment);



                     for (var i = 0; i < sage_Array_payment.length; i++) {
                         var final_account_payment = sage_Array_payment[i].glcode_P + '  ' + sage_Array_payment[i].bank_acc;

                         if (_logValidation(final_account_payment)) {
                             gl_sublist_payment.setSublistValue({
                                 id: 'custpage_account_payment',
                                 line: i,
                                 value: final_account_payment
                             });
                         }

                         /*gl_sublist_payment.setSublistValue({
                             id: 'custpage_glcodepayment',
                             line: i,
                             value: sage_Array_payment[i].glcode_P
                         });*/
                         if (_logValidation(sage_Array_payment[i].amt_pyt)) {
                             gl_sublist_payment.setSublistValue({
                                 id: 'custpage_amount_creditpayment',
                                 line: i,
                                 value: sage_Array_payment[i].amt_pyt
                             });
                         }

                         /*if(_logValidation(posting_period)){
                                                     gl_sublist_payment.setSublistValue({
                                                         id: 'custpage_postingpayment',
                                                         line: i,
                                                         value: posting_period
                                                     });
                         }*/

                         if (_logValidation(sage_Array_payment[i].memo_P)) {
                             gl_sublist_payment.setSublistValue({
                                 id: 'custpage_memopayment',
                                 line: i,
                                 value: sage_Array_payment[i].memo_P
                             });
                         }

                         if (_logValidation(NameVendor)) {
                             gl_sublist_payment.setSublistValue({
                                 id: 'custpage_namepayment',
                                 line: i,
                                 value: NameVendor
                             });
                         }

                         /*gl_sublist_payment.setSublistValue({
                             id: 'custpage_subsidiarypayment',
                             line: i,
                             value: VendorSub
                         });*/

                         if (i == ap_line_payment) {
                             if (_logValidation(ap_account_id) && _logValidation(ap_account)) {
                                 if (_logValidation(final_ap)) {
                                     gl_sublist_payment.setSublistValue({
                                         id: 'custpage_account_payment',
                                         line: i + 1,
                                         value: final_ap
                                     });
                                 }
                             }
                             if (_logValidation(sage_Array_payment[i].amt_pyt)) {
                                 gl_sublist_payment.setSublistValue({
                                     id: 'custpage_amount_debitpayment',
                                     line: i + 1,
                                     value: sage_Array_payment[i].amt_pyt
                                 });
                             }

                             /*gl_sublist_payment.setSublistValue({
                                 id: 'custpage_subsidiarypayment',
                                 line: i + 1,
                                 value: VendorSub
                             });*/
                         }

                     }
                     //}
                     //}
                 }

                 //SAGE VENDOR PAYMENT
                 if (record_type == "customrecord_sagevendorpayments") {
                     var NameVendor = currentRecord.getText("custrecord_sage_vendor_2");
                     log.debug("NameVendor", NameVendor);
                     var acc_id = currentRecord.getText("custrecord_sage_acct_id1");
                     log.debug("NameVendor", NameVendor);
                     /* var VendorSub = currentRecord.getText("custrecord_sage_subsidiary_vp");
                      log.debug("VendorSub", VendorSub);*/
                     /*var posting_period = currentRecord.getText("custrecord_sage_date_vp");
                     log.debug("posting_period", posting_period);*/

                     var apply_vendor_bill = currentRecord.getValue("custrecord_sage_vp_applyvendorbillno");
                     log.debug("apply_vendor_bill", apply_vendor_bill);
                     var record_load = record.load({
                         type: 'customrecord_sagevendorbills',
                         id: apply_vendor_bill,
                         isDynamic: true
                     });
                     log.debug("record_load", record_load);
                     var ap_account = record_load.getText('custrecord_sage_ap_account');
                     var ap_account_no = record_load.getText('custrecord_sage_vb_accountid');

                     var tab_payment = context.form.addTab({
                         id: 'custpage_gl_impact_payment',
                         label: 'Payment Gl Impact'
                     });


                     var gl_sublist_payment = context.form.addSublist({
                         id: 'custpage_glsublist_payment',
                         type: serverWidget.SublistType.INLINEEDITOR,
                         label: 'GL Impact Payment',
                         tab: 'custpage_gl_impact_payment'

                     });
                     log.debug("gl_sublist_payment", gl_sublist_payment);

                     var addsublistfield1_accpayment = gl_sublist_payment.addField({
                         id: 'custpage_account_payment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Account'
                     });

                     /*var addsublist_glcodepayment = gl_sublist_payment.addField({
                         id: 'custpage_glcodepayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Gl Code'
                     });*/

                     var addsublistfield_debitpayment = gl_sublist_payment.addField({
                         id: 'custpage_amount_debitpayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Amount(Debit)'
                     });

                     var addsublistfield_creditpayment = gl_sublist_payment.addField({
                         id: 'custpage_amount_creditpayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Amout(Credit)'
                     });

                     var addsublistfield_postingpayment = gl_sublist_payment.addField({
                         id: 'custpage_postingpayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Posting'
                     });

                     var addsublistfield_memopayment = gl_sublist_payment.addField({
                         id: 'custpage_memopayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Memo'
                     });

                     var addsublistfield_namepayment = gl_sublist_payment.addField({
                         id: 'custpage_namepayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Name'
                     });

                     /*var addsublistfield_subsidiarypayment = gl_sublist_payment.addField({
                         id: 'custpage_subsidiarypayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Subsidiary'
                     });*/


                     var customrecord_sagevendorpaymentsSearchObj = search.create({
                         type: "customrecord_sagevendorpayments",
                         filters: [
                             ["custrecord_sage_vp_applyvendorbillno.internalid", "anyof", apply_vendor_bill]
                         ],
                         columns: [
                             search.createColumn({
                                 name: "CUSTRECORD_SAGE_BANKACCOUNT_VENDORPAYMEN",
                                 summary: "GROUP",
                                 label: "Bank Account"
                             }),
                             search.createColumn({
                                 name: "CUSTRECORD_SAGE_TOTALAMOUNT_VP",
                                 summary: "SUM",
                                 label: "Total Amount"
                             }),
                             /*search.createColumn({
                                 name: "custrecord_sage_acct_id1",
                                 summary: "GROUP",
                                 label: "Account ID"
                             }),*/
                             search.createColumn({
                                 name: "custrecord_sage_vp_narration",
                                 summary: "GROUP",
                                 label: "Narration"
                             })
                             /*search.createColumn({name: "CUSTRECORD_SAGE_TOTALAMOUNT_VP", label: "Total Amount"})*/

                         ]
                     });


                     var searchResultpayment = customrecord_sagevendorpaymentsSearchObj.run()
                         .getRange({
                             start: 0,
                             end: 1000
                         });



                     var sage_Array_payment = [];
                     for (var s = 0; s < searchResultpayment.length; s++) {
                         // .run().each has a limit of 4,000 results

                         var rec_P = {

                             "bank_acc": searchResultpayment[s].getText({
                                 name: "CUSTRECORD_SAGE_BANKACCOUNT_VENDORPAYMEN",
                                 summary: "GROUP",
                                 label: "Bank Account"
                             }),
                             /*"glcode_P": searchResultpayment[s].getValue({
                                 name: "custrecord_sage_exppay_accountid",
                                 summary: "GROUP",
                                 label: "Account ID"
                             }),*/
                             "amt_pyt": searchResultpayment[s].getValue({
                                 name: "CUSTRECORD_SAGE_TOTALAMOUNT_VP",
                                 summary: "SUM",
                                 label: "Total Amount"
                             }),
                             "memo_P": searchResultpayment[s].getValue({
                                 name: "custrecord_sage_vp_narration",
                                 summary: "GROUP",
                                 label: "Narration"
                             })


                         }
                         sage_Array_payment.push(rec_P);

                     }

                     log.debug("sage_Array_payment", sage_Array_payment);
                     //log.debug("amountarray", amountarray);

                     /*var ap_account_id = currentRecord.getValue('custrecord_sage_ap_account');
                     log.debug("ap_account_id", ap_account_id);
                     
                 var record_load_ap = record.load({
type:'customrecord_sage_gl_name',
id:ap_account_id,
isDynamic:true
});
log.debug("record_load_ap",record_load_ap);

var ap_glcode_id = record_load_ap.getValue('custrecord_sage_expense_account_number');
                     log.debug("ap_glcode_id", ap_glcode_id);*/




                     var ap_line_payment = sage_Array_payment.length - 1;
                     log.debug("ap_line_payment", ap_line_payment);



                     for (var i = 0; i < sage_Array_payment.length; i++) {


                         var final_account_payment = acc_id + ' ' + sage_Array_payment[i].bank_acc;
                         if (_logValidation(final_account_payment)) {
                             gl_sublist_payment.setSublistValue({
                                 id: 'custpage_account_payment',
                                 line: i,
                                 value: final_account_payment
                             });
                         }
                         /*gl_sublist_payment.setSublistValue({
                             id: 'custpage_glcodepayment',
                             line: i,
                             value: sage_Array_payment[i].glcode_P
                         });*/
                         if (_logValidation(sage_Array_payment[i].amt_pyt)) {
                             gl_sublist_payment.setSublistValue({
                                 id: 'custpage_amount_creditpayment',
                                 line: i,
                                 value: sage_Array_payment[i].amt_pyt
                             });
                         }
                         /*gl_sublist_payment.setSublistValue({
                             id: 'custpage_postingpayment',
                             line: i,
                             value: posting_period
                         });*/
                         if (_logValidation(sage_Array_payment[i].memo_P)) {
                             gl_sublist_payment.setSublistValue({
                                 id: 'custpage_memopayment',
                                 line: i,
                                 value: sage_Array_payment[i].memo_P
                             });
                         }
                         if (_logValidation(NameVendor)) {
                             gl_sublist_payment.setSublistValue({
                                 id: 'custpage_namepayment',
                                 line: i,
                                 value: NameVendor
                             });
                         }
                         /*gl_sublist_payment.setSublistValue({
                             id: 'custpage_subsidiarypayment',
                             line: i,
                             value: VendorSub
                         });*/

                         if (i == ap_line_payment) {
                             if (_logValidation(ap_account_no) && _logValidation(ap_account)) {
                                 var final_ap = ap_account_no + ' ' + ap_account;
                                 if (_logValidation(final_ap)) {
                                     gl_sublist_payment.setSublistValue({
                                         id: 'custpage_account_payment',
                                         line: i + 1,
                                         value: final_ap
                                     });
                                 }
                             }
                             if (_logValidation(sage_Array_payment[i].amt_pyt)) {
                                 gl_sublist_payment.setSublistValue({
                                     id: 'custpage_amount_debitpayment',
                                     line: i + 1,
                                     value: sage_Array_payment[i].amt_pyt
                                 });
                             }
                             /*gl_sublist_payment.setSublistValue({
                                 id: 'custpage_subsidiarypayment',
                                 line: i + 1,
                                 value: VendorSub
                             });*/
                         }

                     }

                 }
                 //SAGE EMPLOYEE EXPENSES
                 if (record_type == "customrecordenteremployeeexpenses_") {
                     var NameVendor = currentRecord.getText("custrecord_sage_empexp_empname");
                     log.debug("NameVendor", NameVendor);
                     var VendorSub = currentRecord.getText("custrecord_sage_empexp_subsidiary");
                     log.debug("VendorSub", VendorSub);
                     var posting_period = currentRecord.getText("custrecord_sage_empexp_date");
                     log.debug("posting_period", posting_period);

                     var tab = context.form.addTab({
                         id: 'custpage_gl_impact',
                         label: 'Expense Gl Impact'
                     });

                     var gl_sublist = context.form.addSublist({
                         id: 'custpage_grnsublist',
                         type: serverWidget.SublistType.INLINEEDITOR,
                         label: 'GRN Details',
                         tab: 'custpage_gl_impact'

                     });
                     log.debug("gl_sublist", gl_sublist);

                     var addsublistfield1 = gl_sublist.addField({
                         id: 'custpage_account',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Account'
                     });
                     /*var addsublistfield_glcode = gl_sublist.addField({
                         id: 'custpage_glcode',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Gl Code'
                     });*/

                     var addsublistfield_debit = gl_sublist.addField({
                         id: 'custpage_amount_debit',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Amount(Debit)'
                     });

                     var addsublistfield_credit = gl_sublist.addField({
                         id: 'custpage_amount_credit',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Amout(Credit)'
                     });

                     /*var addsublistfield_posting = gl_sublist.addField({
                         id: 'custpage_amount_posting',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Posting'
                     });*/

                     var addsublistfield_memo = gl_sublist.addField({
                         id: 'custpage_amount_memo',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Memo'
                     });

                     var addsublistfield_name = gl_sublist.addField({
                         id: 'custpage_amount_name',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Name'
                     });

                     /*var addsublistfield_subsidiary = gl_sublist.addField({
                         id: 'custpage_amount_subsidiary',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Subsidiary'
                     });*/


                     var gl_impact_array = [];
                     var amountarray = [];

                     var customrecordenteremployeeexpenses_SearchObj = search.create({
                         type: "customrecordenteremployeeexpenses_",
                         filters: [
                             ["internalid", "anyof", record_Id]
                         ],
                         columns: [
                             search.createColumn({
                                 name: "name",
                                 sort: search.Sort.ASC,
                                 label: "Name"
                             }),
                             search.createColumn({
                                 name: "scriptid",
                                 label: "Script ID"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_empexp_empname",
                                 label: "Employee Name"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_empexp_subsidiary",
                                 label: "Subsidiary"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_empexp_memo",
                                 label: "MEMO"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_empexp_currency",
                                 label: "CURRENCY"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_empexp_exchangerate",
                                 label: "Exchange Rate "
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_empexp_amount",
                                 label: "Amount"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_acct_id",
                                 join: "CUSTRECORD_SAGE_EMP_NAME",
                                 label: "Account ID"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_acct_name",
                                 join: "CUSTRECORD_SAGE_EMP_NAME",
                                 label: "Account Name "
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_amt",
                                 join: "CUSTRECORD_SAGE_EMP_NAME",
                                 label: "Amount"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_emp_exp_memo",
                                 join: "CUSTRECORD_SAGE_EMP_NAME",
                                 label: "Memo"
                             })
                         ]
                     });




                     var searchResult = customrecordenteremployeeexpenses_SearchObj.run()
                         .getRange({
                             start: 0,
                             end: 1000
                         });

                     var total_amount = 0;
                     var sage_Array = [];
                     for (var s = 0; s < searchResult.length; s++) {
                         // .run().each has a limit of 4,000 results
                         var sage_amount = searchResult[s].getValue({
                                 name: "custrecord_sage_amt",
                                 join: "CUSTRECORD_SAGE_EMP_NAME",
                                 label: "Amount"
                             }),
                             total_amount = parseFloat(parseFloat(total_amount) + parseFloat(sage_amount)).toFixed(2);
                         var rec = {

                             "gl_impact": searchResult[s].getText({
                                 name: "custrecord_sage_acct_name",
                                 join: "CUSTRECORD_SAGE_EMP_NAME",
                                 label: "Account Name "
                             }),

                             "amount": searchResult[s].getValue({
                                 name: "custrecord_sage_amt",
                                 join: "CUSTRECORD_SAGE_EMP_NAME",
                                 label: "Amount"
                             }),
                             "gl_code": searchResult[s].getValue({
                                 name: "custrecord_sage_acct_id",
                                 join: "CUSTRECORD_SAGE_EMP_NAME",
                                 label: "Account ID"
                             }),
                             "sage_memo": searchResult[s].getValue({
                                 name: "custrecord_sage_emp_exp_memo",
                                 join: "CUSTRECORD_SAGE_EMP_NAME",
                                 label: "Memo"
                             }),
                             "line_subsidiary": searchResult[s].getValue({
                                 name: "custrecord_sage_empexp_subsidiary",
                                 label: "Subsidiary"
                             }),
                             "nameofvendor": searchResult[s].getValue({
                                 name: "name",
                                 sort: search.Sort.ASC,
                                 label: "Name"
                             }),
                             //"bodylevelsubsidiary":searchResult[s].getText({name: "custrecord_sage_vendor", label: "Sage Vendor"}),
                             "Sage_amount": total_amount
                         }
                         sage_Array.push(rec);

                     }
                     log.debug("sage_Array", sage_Array);
                     //log.debug("amountarray", amountarray);


                     var ap_account = currentRecord.getText('custrecord_sage_empexp_payableaccount');
                     log.debug("ap_account", ap_account);
                     var ap_account_id = currentRecord.getValue('custrecord_sage_empexp_payableaccount');
                     log.debug("ap_account_id", ap_account_id);

                     if (_logValidation(ap_account_id)) {

                         var record_load_ap = record.load({
                             type: 'customrecord_sage_gl_name',
                             id: ap_account_id,
                             isDynamic: true
                         });
                         log.debug("record_load_ap", record_load_ap);

                         var ap_glcode_id = record_load_ap.getValue('custrecord_sage_expense_account_number');
                         log.debug("ap_glcode_id", ap_glcode_id);


                     }






                     var ap_line = sage_Array.length - 1;
                     log.debug("ap_line", ap_line);

                     for (var i = 0; i < sage_Array.length; i++) {
                         var final_account = sage_Array[i].gl_code + ' ' + sage_Array[i].gl_impact;
                         log.debug("final_account", final_account);
                         if (_logValidation(final_account)) {
                             gl_sublist.setSublistValue({
                                 id: 'custpage_account',
                                 line: i,
                                 value: final_account
                             });
                         }

                         /*gl_sublist.setSublistValue({
                             id: 'custpage_glcode',
                             line: i,
                             value: sage_Array[i].gl_code
                         });*/
                         if (_logValidation(sage_Array[i].amount)) {
                             gl_sublist.setSublistValue({
                                 id: 'custpage_amount_debit',
                                 line: i,
                                 value: sage_Array[i].amount
                             });
                         }
                         if (i == ap_line) {
                             if (_logValidation(ap_account_id) && _logValidation(ap_account)) {
                                 var final_ap = ap_glcode_id + ' ' + ap_account;
                                 if (_logValidation(final_ap)) {
                                     gl_sublist.setSublistValue({
                                         id: 'custpage_account',
                                         line: i + 1,
                                         value: final_ap
                                     });
                                 }
                             }
                             if (_logValidation(sage_Array[i].Sage_amount)) {
                                 gl_sublist.setSublistValue({
                                     id: 'custpage_amount_credit',
                                     line: i + 1,
                                     value: sage_Array[i].Sage_amount
                                 });
                             }
                             /* gl_sublist.setSublistValue({
                                  id: 'custpage_amount_subsidiary',
                                  line: i + 1,
                                  value: VendorSub
                              });*/
                         }

                         /*gl_sublist.setSublistValue({
                         id: 'custpage_amount_posting',
                         line: i,
                         value:  posting_period
                     });*/
                         if (_logValidation(sage_Array[i].sage_memo)) {
                             gl_sublist.setSublistValue({
                                 id: 'custpage_amount_memo',
                                 line: i,
                                 value: sage_Array[i].sage_memo
                             });
                         }
                         if (_logValidation(NameVendor)) {
                             gl_sublist.setSublistValue({
                                 id: 'custpage_amount_name',
                                 line: i,
                                 value: NameVendor
                             });
                         }
                         /*gl_sublist.setSublistValue({
                             id: 'custpage_amount_subsidiary',
                             line: i,
                             value: VendorSub
                         });*/




                     }



                     ///////////////////////gl impact payment tab for employee expenses///////////////////////
                     //if(record_type == "customrecord_sagevendorpayments"){

                     var tab_payment = context.form.addTab({
                         id: 'custpage_gl_impact_payment',
                         label: 'Payment Gl Impact'
                     });


                     var gl_sublist_payment = context.form.addSublist({
                         id: 'custpage_glsublist_payment',
                         type: serverWidget.SublistType.INLINEEDITOR,
                         label: 'GL Impact Payment',
                         tab: 'custpage_gl_impact_payment'

                     });
                     log.debug("gl_sublist_payment", gl_sublist_payment);

                     var addsublistfield1_accpayment = gl_sublist_payment.addField({
                         id: 'custpage_account_payment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Account'
                     });

                     /*var addsublist_glcodepayment = gl_sublist_payment.addField({
                         id: 'custpage_glcodepayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Gl Code'
                     });*/

                     var addsublistfield_debitpayment = gl_sublist_payment.addField({
                         id: 'custpage_amount_debitpayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Amount(Debit)'
                     });

                     var addsublistfield_creditpayment = gl_sublist_payment.addField({
                         id: 'custpage_amount_creditpayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Amout(Credit)'
                     });

                     /*var addsublistfield_postingpayment = gl_sublist_payment.addField({
                         id: 'custpage_postingpayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Posting'
                     });*/

                     var addsublistfield_memopayment = gl_sublist_payment.addField({
                         id: 'custpage_memopayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Memo'
                     });

                     var addsublistfield_namepayment = gl_sublist_payment.addField({
                         id: 'custpage_namepayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Name'
                     });

                     /*var addsublistfield_subsidiarypayment = gl_sublist_payment.addField({
                         id: 'custpage_subsidiarypayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Subsidiary'
                     });*/


                     var customrecordsageexpensespayments_SearchObj = search.create({
                         type: "customrecordsageexpensespayments_",
                         filters: [
                             ["custrecord_sage_exppay_apply_vendorbill.internalid", "anyof", record_Id]
                         ],
                         columns: [
                             search.createColumn({
                                 name: "id",
                                 sort: search.Sort.ASC,
                                 label: "ID"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_exppay_bankaccount",
                                 label: "Bank Account"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_exppay_date",
                                 label: "Date"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_exppay_subsidiary",
                                 label: "SUBSIDIARY"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_exppay_totalamount",
                                 label: "Total Amount"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_exppay_apply_billno",
                                 label: "Apply(Bill Credit No)"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_exppay_apply_vendorbill",
                                 label: "Apply(vendor bill No)"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_exppay_accountid",
                                 label: "Account ID"
                             })
                         ]
                     });


                     var searchResultpayment = customrecordsageexpensespayments_SearchObj.run()
                         .getRange({
                             start: 0,
                             end: 1000
                         });

                     var memo_P = currentRecord.getValue('custrecord_sage_empexp_memo');

                     var sage_Array_payment = [];
                     for (var s = 0; s < searchResultpayment.length; s++) {
                         // .run().each has a limit of 4,000 results

                         var rec_P = {

                             "bank_acc": searchResultpayment[s].getText({
                                 name: "custrecord_sage_exppay_bankaccount",
                                 label: "Bank Account"
                             }),
                             "glcode_P": searchResultpayment[s].getValue({
                                 name: "custrecord_sage_exppay_accountid",
                                 label: "Account ID"
                             }),
                             "amt_pyt": searchResultpayment[s].getValue({
                                 name: "custrecord_sage_exppay_totalamount",
                                 label: "Total Amount"
                             }),
                             /*"memo_P": searchResultpayment[s].getValue({
                             name: "custrecord_sage_vp_narration",
                             summary: "GROUP",
                             label: "Narration"
                              }),*/
                             "sub_emp_payment_tab": searchResultpayment[s].getValue({
                                 name: "custrecord_sage_exppay_subsidiary",
                                 label: "SUBSIDIARY"
                             }),
                             "Postingperiod": searchResultpayment[s].getValue({
                                 name: "custrecord_sage_exppay_date",
                                 label: "Date"
                             })


                         }
                         sage_Array_payment.push(rec_P);

                     }

                     var ap_line_payment = sage_Array_payment.length - 1;
                     log.debug("ap_line_payment", ap_line_payment);



                     for (var i = 0; i < sage_Array_payment.length; i++) {
                         var final_account_payment = sage_Array_payment[i].glcode_P + ' ' + sage_Array_payment[i].bank_acc;
                         if (_logValidation(final_account_payment)) {
                             gl_sublist_payment.setSublistValue({
                                 id: 'custpage_account_payment',
                                 line: i,
                                 value: final_account_payment
                             });
                         }

                         /*gl_sublist_payment.setSublistValue({
                         id: 'custpage_glcodepayment',
                         line: i,
                         value:sage_Array_payment[i].glcode_P
                     });*/
                         if (_logValidation(sage_Array_payment[i].amt_pyt)) {

                             gl_sublist_payment.setSublistValue({
                                 id: 'custpage_amount_creditpayment',
                                 line: i,
                                 value: sage_Array_payment[i].amt_pyt
                             });
                         }
                         /*if(_logValidation(Postingperiod)){
                         gl_sublist_payment.setSublistValue({
                             id: 'custpage_postingpayment',
                             line: i,
                             value: sage_Array_payment[i].Postingperiod
                         });
                     }*/
                         if (_logValidation(memo_P)) {
                             gl_sublist_payment.setSublistValue({
                                 id: 'custpage_memopayment',
                                 line: i,
                                 value: memo_P
                             });
                         }
                         /*gl_sublist_payment.setSublistValue({
                             id: 'custpage_subsidiarypayment',
                             line: i,
                             value: VendorSub
                         });*/
                         if (_logValidation(NameVendor)) {
                             gl_sublist_payment.setSublistValue({
                                 id: 'custpage_namepayment',
                                 line: i,
                                 value: NameVendor
                             });
                         }

                         if (i == ap_line_payment) {
                             if (_logValidation(ap_account_id) && _logValidation(ap_account)) {
                                 if (_logValidation(final_ap)) {
                                     gl_sublist_payment.setSublistValue({
                                         id: 'custpage_account_payment',
                                         line: i + 1,
                                         value: final_ap
                                     });
                                 }
                             }
                             if (_logValidation(sage_Array_payment[i].amt_pyt)) {
                                 gl_sublist_payment.setSublistValue({
                                     id: 'custpage_amount_debitpayment',
                                     line: i + 1,
                                     value: sage_Array_payment[i].amt_pyt
                                 });
                             }
                             /*gl_sublist_payment.setSublistValue({
                                 id: 'custpage_subsidiarypayment',
                                 line: i + 1,
                                 value: VendorSub
                             });*/
                         }

                     }

                     //}
                 }

                 //SAGE EMPLOYEE PAYMENTS-payment only record
                 if (record_type == "customrecordsageexpensespayments_") {
                     log.debug("entered");
                     var NameVendor = currentRecord.getText("custrecord_sage_exppay_emppay");
                     log.debug("NameVendor", NameVendor);
                     var VendorSub = currentRecord.getText("custrecord_sage_exppay_subsidiary");
                     log.debug("VendorSub", VendorSub);
                     var posting_period = currentRecord.getText("custrecord_sage_exppay_date");
                     log.debug("posting_period", posting_period);
                     var apply_vendor_bill = currentRecord.getValue('custrecord_sage_exppay_apply_vendorbill');
                     log.debug("apply_vendor_bill", apply_vendor_bill);
                     var record_load = record.load({
                         type: 'customrecordenteremployeeexpenses_',
                         id: apply_vendor_bill,
                         isDynamic: true
                     });
                     log.debug("record_load", record_load);
                     var ap_account = record_load.getText('custrecord_sage_empexp_payableaccount');
                     var ap_account_no = record_load.getText('custrecord_sage_empexp_accountid');
                     var memo_payment = record_load.getValue('custrecord_sage_empexp_memo');

                     log.debug("ap_account", ap_account);

                     var tab_payment = context.form.addTab({
                         id: 'custpage_gl_impact_payment',
                         label: 'Payment Gl Impact'
                     });


                     var gl_sublist_payment = context.form.addSublist({
                         id: 'custpage_glsublist_payment',
                         type: serverWidget.SublistType.INLINEEDITOR,
                         label: 'GL Impact Payment',
                         tab: 'custpage_gl_impact_payment'

                     });
                     log.debug("gl_sublist_payment", gl_sublist_payment);

                     var addsublistfield1_accpayment = gl_sublist_payment.addField({
                         id: 'custpage_account_payment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Account'
                     });

                     /*var addsublist_glcodepayment = gl_sublist_payment.addField({
                         id: 'custpage_glcodepayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Gl Code'
                     });*/

                     var addsublistfield_debitpayment = gl_sublist_payment.addField({
                         id: 'custpage_amount_debitpayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Amount(Debit)'
                     });

                     var addsublistfield_creditpayment = gl_sublist_payment.addField({
                         id: 'custpage_amount_creditpayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Amout(Credit)'
                     });

                     /*var addsublistfield_postingpayment = gl_sublist_payment.addField({
                         id: 'custpage_postingpayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Posting'
                     });*/

                     var addsublistfield_memopayment = gl_sublist_payment.addField({
                         id: 'custpage_memopayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Memo'
                     });

                     var addsublistfield_namepayment = gl_sublist_payment.addField({
                         id: 'custpage_namepayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Name'
                     });

                     /*var addsublistfield_subsidiarypayment = gl_sublist_payment.addField({
                         id: 'custpage_subsidiarypayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Subsidiary'
                     });*/



                     var customrecordsageexpensespayments_SearchObj = search.create({
                         type: "customrecordsageexpensespayments_",
                         filters: [
                             ["custrecord_sage_exppay_apply_vendorbill.internalid", "anyof", apply_vendor_bill]
                         ],
                         columns: [
                             search.createColumn({
                                 name: "id",
                                 sort: search.Sort.ASC,
                                 label: "ID"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_exppay_bankaccount",
                                 label: "Bank Account"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_exppay_date",
                                 label: "Date"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_exppay_subsidiary",
                                 label: "SUBSIDIARY"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_exppay_totalamount",
                                 label: "Total Amount"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_exppay_apply_billno",
                                 label: "Apply(Bill Credit No)"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_exppay_apply_vendorbill",
                                 label: "Apply(vendor bill No)"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_exppay_accountid",
                                 label: "Account ID"
                             })
                         ]
                     });


                     var searchResultpayment = customrecordsageexpensespayments_SearchObj.run()
                         .getRange({
                             start: 0,
                             end: 1000
                         });

                     var sage_Array_payment = [];
                     for (var s = 0; s < searchResultpayment.length; s++) {
                         // .run().each has a limit of 4,000 results

                         var rec_P = {

                             "bank_acc": searchResultpayment[s].getText({
                                 name: "custrecord_sage_exppay_bankaccount",
                                 label: "Bank Account"
                             }),
                             "glcode_P": searchResultpayment[s].getValue({
                                 name: "custrecord_sage_exppay_accountid",
                                 label: "Account ID"
                             }),
                             "amt_pyt": searchResultpayment[s].getValue({
                                 name: "custrecord_sage_exppay_totalamount",
                                 label: "Total Amount"
                             }),
                             /*"memo_P": searchResultpayment[s].getValue({
                             name: "custrecord_sage_vp_narration",
                             summary: "GROUP",
                             label: "Narration"
                              }),
                             "sub_emp_payment_tab": searchResultpayment[s].getValue({
                                 name: "custrecord_sage_exppay_subsidiary",
                                 label: "SUBSIDIARY"
                             }),*/
                             "Postingperiod": searchResultpayment[s].getValue({
                                 name: "custrecord_sage_exppay_date",
                                 label: "Date"
                             })


                         }
                         sage_Array_payment.push(rec_P);

                     }

                     var ap_line_payment = sage_Array_payment.length - 1;
                     log.debug("ap_line_payment", ap_line_payment);



                     for (var i = 0; i < sage_Array_payment.length; i++) {

                         var final_account_payment = sage_Array_payment[i].glcode_P + ' ' + sage_Array_payment[i].bank_acc;
                         if (_logValidation(final_account_payment)) {
                             gl_sublist_payment.setSublistValue({
                                 id: 'custpage_account_payment',
                                 line: i,
                                 value: final_account_payment
                             });
                         }
                         /*gl_sublist_payment.setSublistValue({
                         id: 'custpage_glcodepayment',
                         line: i,
                         value:sage_Array_payment[i].glcode_P
                     });*/
                         if (_logValidation(sage_Array_payment[i].amt_pyt)) {
                             gl_sublist_payment.setSublistValue({
                                 id: 'custpage_amount_creditpayment',
                                 line: i,
                                 value: sage_Array_payment[i].amt_pyt
                             });
                         }
                         /*if(_logValidation(Postingperiod)){
                                                     gl_sublist_payment.setSublistValue({
                                                         id: 'custpage_postingpayment',
                                                         line: i,
                                                         value: sage_Array_payment[i].Postingperiod
                                                     });
                         }*/
                         if (_logValidation(memo_payment)) {
                             gl_sublist_payment.setSublistValue({
                                 id: 'custpage_memopayment',
                                 line: i,
                                 value: memo_payment
                             });
                         }
                         if (_logValidation(NameVendor)) {
                             gl_sublist_payment.setSublistValue({
                                 id: 'custpage_namepayment',
                                 line: i,
                                 value: NameVendor
                             });
                         }



                         if (i == ap_line_payment) {
                             if (_logValidation(ap_account_no) && _logValidation(ap_account)) {
                                 var final_ap = ap_account_no + ' ' + ap_account;
                                 if (_logValidation(final_ap)) {
                                     gl_sublist_payment.setSublistValue({
                                         id: 'custpage_account_payment',
                                         line: i + 1,
                                         value: final_ap
                                     });
                                 }
                             }
                             if (_logValidation(sage_Array_payment[i].amt_pyt)) {
                                 gl_sublist_payment.setSublistValue({
                                     id: 'custpage_amount_debitpayment',
                                     line: i + 1,
                                     value: sage_Array_payment[i].amt_pyt
                                 });
                             }

                         }

                     }

                     //}
                 }

                 //sage customer invoice starts here-uniqueID
                 if (record_type == "customrecord_sageinvoiceslist") {
                     var NameVendor = currentRecord.getText("custrecord_sage_customername");
                     log.debug("NameVendor", NameVendor);
                     var VendorSub = currentRecord.getText("custrecord_sage_customerinvo_subsidiary");
                     log.debug("VendorSub", VendorSub);
                     var posting_period = currentRecord.getText("custrecord_sage_invoice_date");
                     log.debug("posting_period", posting_period);

                     var ap_account = currentRecord.getText('custrecord_sage_reveivable_account');
                     log.debug("ap_account", ap_account);
                     var ap_account_id = currentRecord.getValue('custrecord_sage_reveivable_account');
                     log.debug("ap_account_id", ap_account_id);
                     if (_logValidation(ap_account_id)) {
                         var record_load_ap = record.load({
                             type: 'customrecord_sage_gl_name',
                             id: ap_account_id,
                             isDynamic: true
                         });
                         log.debug("record_load_ap", record_load_ap);

                         var ap_glcode_id = record_load_ap.getValue('custrecord_sage_expense_account_number');
                         log.debug("ap_glcode_id", ap_glcode_id);
                     }

                     var tab = context.form.addTab({
                         id: 'custpage_gl_impact',
                         label: 'Expense Gl Impact'
                     });

                     var gl_sublist = context.form.addSublist({
                         id: 'custpage_grnsublist',
                         type: serverWidget.SublistType.INLINEEDITOR,
                         label: 'GRN Details',
                         tab: 'custpage_gl_impact'

                     });
                     log.debug("gl_sublist", gl_sublist);

                     var addsublistfield1 = gl_sublist.addField({
                         id: 'custpage_account',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Account'
                     });
                     /*var addsublistfield_glcode = gl_sublist.addField({
                         id: 'custpage_glcode',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Gl Code'
                     });*/

                     var addsublistfield_debit = gl_sublist.addField({
                         id: 'custpage_amount_debit',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Amount(Debit)'
                     });

                     var addsublistfield_credit = gl_sublist.addField({
                         id: 'custpage_amount_credit',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Amout(Credit)'
                     });

                     /*var addsublistfield_posting = gl_sublist.addField({
                         id: 'custpage_amount_posting',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Posting'
                     });*/

                     var addsublistfield_memo = gl_sublist.addField({
                         id: 'custpage_amount_memo',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Memo'
                     });

                     var addsublistfield_name = gl_sublist.addField({
                         id: 'custpage_amount_name',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Name'
                     });

                     /*var addsublistfield_subsidiary = gl_sublist.addField({
                         id: 'custpage_amount_subsidiary',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Subsidiary'
                     });*/


                     var gl_impact_array = [];
                     var amountarray = [];

                     var customrecord_sageinvoiceslistSearchObj = search.create({
                         type: "customrecord_sageinvoiceslist",
                         filters: [
                             ["internalid", "anyof", record_Id]
                         ],
                         columns: [
                             search.createColumn({
                                 name: "name",
                                 sort: search.Sort.ASC,
                                 label: "Name"
                             }),
                             //search.createColumn({name: "custrecord_subsidiary", label: "Subsidiary"}),
                             //search.createColumn({name: "custrecordsageraccount", label: "Receivable Account "}),
                             search.createColumn({
                                 name: "custrecord_sage_accountid_",
                                 join: "CUSTRECORD_SAGE_APPLIED_INVOICE_NUMBER",
                                 label: "Account ID"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_account_name_1",
                                 join: "CUSTRECORD_SAGE_APPLIED_INVOICE_NUMBER",
                                 label: "Account Name "
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_amount_",
                                 join: "CUSTRECORD_SAGE_APPLIED_INVOICE_NUMBER",
                                 label: "Amount"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_memo_",
                                 join: "CUSTRECORD_SAGE_APPLIED_INVOICE_NUMBER",
                                 label: "Memo"
                             })
                         ]
                     });

                     var searchResult = customrecord_sageinvoiceslistSearchObj.run()
                         .getRange({
                             start: 0,
                             end: 1000
                         });
                     log.debug("searchResult", searchResult);

                     var total_amount = 0;
                     var sage_Array = [];
                     for (var s = 0; s < searchResult.length; s++) {
                         // .run().each has a limit of 4,000 results
                         var sage_amount = searchResult[s].getValue({
                             name: "custrecord_sage_amount_",
                             join: "CUSTRECORD_SAGE_APPLIED_INVOICE_NUMBER",
                             label: "Amount"
                         })
                         total_amount = parseFloat(parseFloat(total_amount) + parseFloat(sage_amount)).toFixed(2);
                         var rec = {

                             "gl_impact": searchResult[s].getText({
                                 name: "custrecord_sage_account_name_1",
                                 join: "CUSTRECORD_SAGE_APPLIED_INVOICE_NUMBER",
                                 label: "Account Name "
                             }),

                             "amount": searchResult[s].getValue({
                                 name: "custrecord_sage_amount_",
                                 join: "CUSTRECORD_SAGE_APPLIED_INVOICE_NUMBER",
                                 label: "Amount"
                             }),
                             "gl_code": searchResult[s].getValue({
                                 name: "custrecord_sage_accountid_",
                                 join: "CUSTRECORD_SAGE_APPLIED_INVOICE_NUMBER",
                                 label: "Account ID"
                             }),
                             "sage_memo": searchResult[s].getValue({
                                 name: "custrecord_sage_memo_",
                                 join: "CUSTRECORD_SAGE_APPLIED_INVOICE_NUMBER",
                                 label: "Memo"
                             }),
                             //"line_subsidiary":searchResult[s].getValue({name: "custrecord_sage_empexp_subsidiary", label: "Subsidiary"}),
                             /*"nameofvendor":searchResult[s].getValue({
                             name: "name",
                             sort: search.Sort.ASC,
                             label: "Name"
                              }),*/
                             //"bodylevelsubsidiary":searchResult[s].getText({name: "custrecord_sage_vendor", label: "Sage Vendor"}),
                             "Sage_amount": total_amount
                         }
                         sage_Array.push(rec);

                     }
                     log.debug("sage_Array", sage_Array);
                     //log.debug("amountarray", amountarray);

                     /*var ap_account = currentRecord.getText('custrecord_sage_empexp_payableaccount');
                     log.debug("ap_account", ap_account);*/


                     var ap_line = sage_Array.length - 1;
                     log.debug("ap_line", ap_line);

                     for (var i = 0; i < sage_Array.length; i++) {
                         var final_account = sage_Array[i].gl_code + ' ' + sage_Array[i].gl_impact;
                         log.debug("final_account", final_account);
                         if (_logValidation(final_account)) {
                             gl_sublist.setSublistValue({
                                 id: 'custpage_account',
                                 line: i,
                                 value: final_account
                             });
                         }

                         /*gl_sublist.setSublistValue({
                             id: 'custpage_glcode',
                             line: i,
                             value: sage_Array[i].gl_code
                         });*/
                         if (_logValidation(sage_Array[i].amount)) {
                             gl_sublist.setSublistValue({
                                 id: 'custpage_amount_debit',
                                 line: i,
                                 value: sage_Array[i].amount
                             });
                         }
                         if (i == ap_line) {
                             if (_logValidation(ap_account_id) && _logValidation(ap_account)) {
                                 var final_ap = ap_glcode_id + ' ' + ap_account;
                                 if (_logValidation(final_ap)) {
                                     gl_sublist.setSublistValue({
                                         id: 'custpage_account',
                                         line: i + 1,
                                         value: final_ap
                                     });
                                 }
                             }
                             if (_logValidation(sage_Array[i].Sage_amount)) {
                                 gl_sublist.setSublistValue({
                                     id: 'custpage_amount_credit',
                                     line: i + 1,
                                     value: sage_Array[i].Sage_amount
                                 });
                             }
                             /*gl_sublist.setSublistValue({
                                 id: 'custpage_amount_subsidiary',
                                 line: i + 1,
                                 value: VendorSub
                             });*/
                         }

                         /*gl_sublist.setSublistValue({
                             id: 'custpage_amount_posting',
                             line: i,
                             value: posting_period
                         });*/
                         if (_logValidation(sage_Array[i].sage_memo)) {
                             gl_sublist.setSublistValue({
                                 id: 'custpage_amount_memo',
                                 line: i,
                                 value: sage_Array[i].sage_memo
                             });
                         }
                         if (_logValidation(NameVendor)) {
                             gl_sublist.setSublistValue({
                                 id: 'custpage_amount_name',
                                 line: i,
                                 value: NameVendor
                             });
                         }
                         /*gl_sublist.setSublistValue({
                         id: 'custpage_amount_subsidiary',
                         line: i,
                         value: VendorSub
                     });*/




                     }

                     ///////////////////////gl impact payment tab for invoice payments///////////////////////
                     //if(record_type == "customrecord_sagevendorpayments"){

                     var tab_payment = context.form.addTab({
                         id: 'custpage_gl_impact_payment',
                         label: 'Payment Gl Impact'
                     });


                     var gl_sublist_payment = context.form.addSublist({
                         id: 'custpage_glsublist_payment',
                         type: serverWidget.SublistType.INLINEEDITOR,
                         label: 'GL Impact Payment',
                         tab: 'custpage_gl_impact_payment'

                     });
                     log.debug("gl_sublist_payment", gl_sublist_payment);

                     var addsublistfield1_accpayment = gl_sublist_payment.addField({
                         id: 'custpage_account_payment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Account'
                     });

                     /* var addsublist_glcodepayment = gl_sublist_payment.addField({
                          id: 'custpage_glcodepayment',
                          type: serverWidget.FieldType.TEXT,
                          label: 'Gl Code'
                      });*/

                     var addsublistfield_debitpayment = gl_sublist_payment.addField({
                         id: 'custpage_amount_debitpayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Amount(Debit)'
                     });

                     var addsublistfield_creditpayment = gl_sublist_payment.addField({
                         id: 'custpage_amount_creditpayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Amout(Credit)'
                     });

                     /*var addsublistfield_postingpayment = gl_sublist_payment.addField({
                         id: 'custpage_postingpayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Posting'
                     });*/

                     var addsublistfield_memopayment = gl_sublist_payment.addField({
                         id: 'custpage_memopayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Memo'
                     });

                     var addsublistfield_namepayment = gl_sublist_payment.addField({
                         id: 'custpage_namepayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Name'
                     });

                     /*var addsublistfield_subsidiarypayment = gl_sublist_payment.addField({
                         id: 'custpage_subsidiarypayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Subsidiary'
                     });*/


                     var customrecord_sage_customer_paymentsSearchObj = search.create({
                         type: "customrecord_sage_customer_payments",
                         filters: [
                             ["custrecord_sage_apply_invoice_no.internalid", "anyof", record_Id]
                         ],
                         columns: [
                             search.createColumn({
                                 name: "custrecord_sage_bank_account",
                                 label: "Bank Account"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_total_amount",
                                 label: "Total Amount"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_customer_narration",
                                 label: "Narration"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_date",
                                 label: "Date"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_account_id_payment",
                                 label: "Account ID"
                             })

                         ]
                     });





                     var searchResultpayment = customrecord_sage_customer_paymentsSearchObj.run()
                         .getRange({
                             start: 0,
                             end: 1000
                         });

                     var sage_Array_payment = [];
                     for (var s = 0; s < searchResultpayment.length; s++) {
                         // .run().each has a limit of 4,000 results

                         var rec_P = {

                             "bank_acc": searchResultpayment[s].getText({
                                 name: "custrecord_sage_bank_account",
                                 label: "Bank Account"
                             }),
                             "glcode_P": searchResultpayment[s].getValue({
                                 name: "custrecord_sage_account_id_payment",
                                 label: "Account ID"
                             }),
                             "amt_pyt": searchResultpayment[s].getValue({
                                 name: "custrecord_sage_total_amount",
                                 label: "Total Amount"
                             }),
                             "memo_P": searchResultpayment[s].getValue({
                                 name: "custrecord_sage_customer_narration",
                                 label: "Narration"
                             }),
                             //"sub_emp_payment_tab": searchResultpayment[s].getValue({name: "custrecord_sage_exppay_subsidiary", label: "SUBSIDIARY"}),
                             "Postingperiod": searchResultpayment[s].getValue({
                                 name: "custrecord_sage_date",
                                 label: "Date"
                             })


                         }
                         sage_Array_payment.push(rec_P);

                     }

                     var ap_line_payment = sage_Array_payment.length - 1;
                     log.debug("ap_line_payment", ap_line_payment);



                     for (var i = 0; i < sage_Array_payment.length; i++) {
                         var final_account_payment = sage_Array_payment[i].glcode_P + '  ' + sage_Array_payment[i].bank_acc;
                         if (_logValidation(final_account_payment)) {
                             gl_sublist_payment.setSublistValue({
                                 id: 'custpage_account_payment',
                                 line: i,
                                 value: final_account_payment
                             });
                         }
                         /*gl_sublist_payment.setSublistValue({
                         id: 'custpage_glcodepayment',
                         line: i,
                         value:sage_Array_payment[i].glcode_P
                     });*/
                         if (_logValidation(sage_Array_payment[i].amt_pyt)) {
                             gl_sublist_payment.setSublistValue({
                                 id: 'custpage_amount_creditpayment',
                                 line: i,
                                 value: sage_Array_payment[i].amt_pyt
                             });
                         }
                         /* gl_sublist_payment.setSublistValue({
                              id: 'custpage_postingpayment',
                              line: i,
                              value: sage_Array_payment[i].Postingperiod
                          });*/
                         if (_logValidation(sage_Array_payment[i].memo_P)) {
                             gl_sublist_payment.setSublistValue({
                                 id: 'custpage_memopayment',
                                 line: i,
                                 value: sage_Array_payment[i].memo_P
                             });
                         }
                         if (_logValidation(NameVendor)) {
                             gl_sublist_payment.setSublistValue({
                                 id: 'custpage_namepayment',
                                 line: i,
                                 value: NameVendor
                             });
                         }

                         /*gl_sublist_payment.setSublistValue({
                             id: 'custpage_subsidiarypayment',
                             line: i,
                             value: VendorSub
                         });*/

                         if (i == ap_line_payment) {
                             if (_logValidation(ap_account_id) && _logValidation(ap_account)) {
                                 if (_logValidation(final_ap)) {
                                     gl_sublist_payment.setSublistValue({
                                         id: 'custpage_account_payment',
                                         line: i + 1,
                                         value: final_ap
                                     });
                                 }
                             }
                             if (_logValidation(sage_Array_payment[i].amt_pyt)) {
                                 gl_sublist_payment.setSublistValue({
                                     id: 'custpage_amount_debitpayment',
                                     line: i + 1,
                                     value: sage_Array_payment[i].amt_pyt
                                 });
                             }
                             /*gl_sublist_payment.setSublistValue({
                                 id: 'custpage_subsidiarypayment',
                                 line: i + 1,
                                 value: VendorSub
                             });*/
                         }

                     }

                     //}


                 }

                 //SAGE INVOICE PAYMENTS
                 if (record_type == "customrecord_sage_customer_payments") {
                     log.debug("entered");
                     var NameVendor = currentRecord.getText("custrecord_sage_customer_name");
                     log.debug("NameVendor", NameVendor);
                     var VendorSub = currentRecord.getText("custrecord_sage_subsidiary_name");
                     log.debug("VendorSub", VendorSub);
                     var posting_period = currentRecord.getText("custrecord_sage_date");
                     log.debug("posting_period", posting_period);
                     var apply_vendor_bill = currentRecord.getValue('custrecord_sage_apply_invoice_no');
                     log.debug("apply_vendor_bill", apply_vendor_bill);
                     var record_load = record.load({
                         type: 'customrecord_sageinvoiceslist',
                         id: apply_vendor_bill,
                         isDynamic: true
                     });
                     log.debug("record_load", record_load);
                     var ap_account = record_load.getText('custrecord_sage_reveivable_account');
                     var ap_account_no = currentRecord.getText('custrecord_sage_account_id_payment');
                     var tab_payment = context.form.addTab({
                         id: 'custpage_gl_impact_payment',
                         label: 'Payment Gl Impact'
                     });


                     var gl_sublist_payment = context.form.addSublist({
                         id: 'custpage_glsublist_payment',
                         type: serverWidget.SublistType.INLINEEDITOR,
                         label: 'GL Impact Payment',
                         tab: 'custpage_gl_impact_payment'

                     });
                     log.debug("gl_sublist_payment", gl_sublist_payment);

                     var addsublistfield1_accpayment = gl_sublist_payment.addField({
                         id: 'custpage_account_payment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Account'
                     });

                     /*var addsublist_glcodepayment = gl_sublist_payment.addField({
                         id: 'custpage_glcodepayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Gl Code'
                     });*/

                     var addsublistfield_debitpayment = gl_sublist_payment.addField({
                         id: 'custpage_amount_debitpayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Amount(Debit)'
                     });

                     var addsublistfield_creditpayment = gl_sublist_payment.addField({
                         id: 'custpage_amount_creditpayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Amout(Credit)'
                     });

                     /*var addsublistfield_postingpayment = gl_sublist_payment.addField({
                         id: 'custpage_postingpayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Posting'
                     });*/

                     var addsublistfield_memopayment = gl_sublist_payment.addField({
                         id: 'custpage_memopayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Memo'
                     });

                     var addsublistfield_namepayment = gl_sublist_payment.addField({
                         id: 'custpage_namepayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Name'
                     });

                     /*var addsublistfield_subsidiarypayment = gl_sublist_payment.addField({
                         id: 'custpage_subsidiarypayment',
                         type: serverWidget.FieldType.TEXT,
                         label: 'Subsidiary'
                     });*/




                     var customrecord_sage_customer_paymentsSearchObj = search.create({
                         type: "customrecord_sage_customer_payments",
                         filters: [
                             ["custrecord_sage_apply_invoice_no.internalid", "anyof", apply_vendor_bill]
                         ],
                         columns: [
                             search.createColumn({
                                 name: "custrecord_sage_bank_account",
                                 label: "Bank Account"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_total_amount",
                                 label: "Total Amount"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_customer_narration",
                                 label: "Narration"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_date",
                                 label: "Date"
                             }),
                             search.createColumn({
                                 name: "custrecord_sage_account_id_payment",
                                 label: "Account ID"
                             })


                         ]
                     });


                     var searchResultpayment = customrecord_sage_customer_paymentsSearchObj.run()
                         .getRange({
                             start: 0,
                             end: 1000
                         });
                     var sage_Array_payment = [];
                     for (var s = 0; s < searchResultpayment.length; s++) {
                         // .run().each has a limit of 4,000 results

                         var rec_P = {

                             "bank_acc": searchResultpayment[s].getText({
                                 name: "custrecord_sage_bank_account",
                                 label: "Bank Account"
                             }),
                             "glcode_P": searchResultpayment[s].getValue({
                                 name: "custrecord_sage_account_id_payment",
                                 label: "Account ID"
                             }),
                             "amt_pyt": searchResultpayment[s].getValue({
                                 name: "custrecord_sage_total_amount",
                                 label: "Total Amount"
                             }),
                             "memo_P": searchResultpayment[s].getValue({
                                 name: "custrecord_sage_customer_narration",
                                 label: "Narration"
                             }),
                             //"sub_emp_payment_tab": searchResultpayment[s].getValue({name: "custrecord_sage_exppay_subsidiary", label: "SUBSIDIARY"}),
                             "Postingperiod": searchResultpayment[s].getValue({
                                 name: "custrecord_sage_date",
                                 label: "Date"
                             })


                         }
                         sage_Array_payment.push(rec_P);

                     }

                     var ap_line_payment = sage_Array_payment.length - 1;
                     log.debug("ap_line_payment", ap_line_payment);



                     for (var i = 0; i < sage_Array_payment.length; i++) {
                         var final_account_payment = sage_Array_payment[i].glcode_P + '  ' + sage_Array_payment[i].bank_acc;
                         if (_logValidation(final_account_payment)) {
                             gl_sublist_payment.setSublistValue({
                                 id: 'custpage_account_payment',
                                 line: i,
                                 value: final_account_payment
                             });
                         }
                         /*gl_sublist_payment.setSublistValue({
                         id: 'custpage_glcodepayment',
                         line: i,
                         value:sage_Array_payment[i].glcode_P
                     });*/
                         if (_logValidation(sage_Array_payment[i].amt_pyt)) {
                             gl_sublist_payment.setSublistValue({
                                 id: 'custpage_amount_creditpayment',
                                 line: i,
                                 value: sage_Array_payment[i].amt_pyt
                             });
                         }
                         /* gl_sublist_payment.setSublistValue({
                              id: 'custpage_postingpayment',
                              line: i,
                              value: sage_Array_payment[i].Postingperiod
                          });*/
                         if (_logValidation(sage_Array_payment[i].memo_P)) {
                             gl_sublist_payment.setSublistValue({
                                 id: 'custpage_memopayment',
                                 line: i,
                                 value: sage_Array_payment[i].memo_P
                             });
                         }
                         if (_logValidation(NameVendor)) {
                             gl_sublist_payment.setSublistValue({
                                 id: 'custpage_namepayment',
                                 line: i,
                                 value: NameVendor
                             });
                         }

                         /*gl_sublist_payment.setSublistValue({
                             id: 'custpage_subsidiarypayment',
                             line: i,
                             value: VendorSub
                         });*/

                         if (i == ap_line_payment) {
                             if (_logValidation(ap_account_no) && _logValidation(ap_account)) {
                                 var final_ap = ap_account_no + ' ' + ap_account;
                                 if (_logValidation(final_ap)) {
                                     gl_sublist_payment.setSublistValue({
                                         id: 'custpage_account_payment',
                                         line: i + 1,
                                         value: final_ap
                                     });
                                 }
                             }
                             if (_logValidation(sage_Array_payment[i].amt_pyt)) {
                                 gl_sublist_payment.setSublistValue({
                                     id: 'custpage_amount_debitpayment',
                                     line: i + 1,
                                     value: sage_Array_payment[i].amt_pyt
                                 });
                             }
                             /*gl_sublist_payment.setSublistValue({
                                 id: 'custpage_subsidiarypayment',
                                 line: i + 1,
                                 value: VendorSub
                             });*/
                         }

                     }

                     //}
                 }




             }
         }

         function _logValidation(value) {
             if (value != 'null' && value != null && value != null && value != '' && value != undefined && value != undefined && value != 'undefined' && value != 'undefined' && value != 'NaN' && value != NaN && value != 'Infinity') {
                 return true;
             } else {
                 return false;
             }
         }

         return {

             beforeLoad: beforeLoad
         };
     });