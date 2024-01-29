/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
/*************************************************************
 * File Header
 * Script Type: Suitelets Script
 * Script Name: OakNorth-SU-HDFC-Bank-CSV-File-Create
 * File Name  : Oknorth_SU_HDFC_Bank_CSV_File_1.js
 * Created On : 10/02/2023
 * Modified On: 11/02/2023
 * Created By : Akash Singh (Yantra Inc.)
 * Modified By:
 * Description: This Suitelets is for Creating CSV File on Button Click
 *************************************************************************/

define(['N/record', 'N/search', 'N/ui/serverWidget', 'N/file', "N/format"], function (record, search, serverWidget, file, format) {

    function onRequest(context) {

        try {

            if (context.request.method == 'GET') {

                var response = context.response;

                var form = serverWidget.createForm({
                    title: ' '
                });

                //Calling from Client Script Values
                var custsubsidiary = context.request.parameters.custsubsidiary;
                log.audit('custsubsidiary', custsubsidiary)


                var custbankaccount = context.request.parameters.custbankaccount;
                log.audit("custbankaccount", custbankaccount);


                var custbankamttype = context.request.parameters.custbank_amt_type;

                log.audit('custbankamttype', custbankamttype);

                var custStartDate = context.request.parameters.custstartdate;
                log.audit("custStartDate", custStartDate);


                var custEndDate = context.request.parameters.custenddate;
                log.audit("custEndDate", custEndDate);


                var custvendname = context.request.parameters.custvendname;
                log.audit("custvendname", custvendname);


                var custlocation = context.request.parameters.custlocation;
                log.audit("custlocation", custlocation);

                var custCheckBox = context.request.parameters.custCheckbox;
                log.audit('custCheckBox', custCheckBox);

                var ID_ARRAY = context.request.parameters.id_array;
                log.audit('ID_ARRAY', ID_ARRAY);

                ID_ARRAY = split_data(ID_ARRAY);

                var payment_date = context.request.parameters.payment_date
                log.audit('Payment Date',payment_date)

                //End Calling From Client Script Values


                //Date Validation Start and End Date Format parse

                if (_logValidation(custStartDate)) {
                    log.debug('suiteletFunction', 'Start Date 1 --> ' + custStartDate);
                    custStartDate = format.parse({
                        value: custStartDate,
                        type: format.Type.DATE
                    })
                    custStartDate = format.format({
                        value: custStartDate,
                        type: format.Type.DATE
                    })
                    log.debug('suiteletFunction', ' start Date   -->' + custStartDate)
                }


                if (_logValidation(custEndDate)) {
                    log.debug('suiteletFunction', 'End Date 1 --> ' + custEndDate);
                    custEndDate = format.parse({
                        value: custEndDate,
                        type: format.Type.DATE
                    })
                    custEndDate = format.format({
                        value: custEndDate,
                        type: format.Type.DATE
                    })
                    log.debug('suiteletFunction', ' end Date   -->' + custEndDate)
                }

                // End Date Validation Start and End Date Format parse


                //Filters Selecting Based on Data Shown in UI
                var a_filters = new Array();

                if (_logValidation(ID_ARRAY) ) {
                    a_filters.push(search.createFilter({
                        name: 'internalid',
                        operator: search.Operator.ANYOF,
                        values: ID_ARRAY
                    }));
                }

                var a_columns = new Array();
                a_columns.push(search.createColumn({
                    name: 'internalid'
                }));


                if (_logValidation(custStartDate) && _logValidation(custEndDate)) {
                    a_filters.push(
                        search.createFilter({
                            name: 'trandate',
                            operator: search.Operator.WITHIN,
                            values: [custStartDate, custEndDate]
                        }));
                }

                if (_logValidation(custStartDate) && _logValidation(custEndDate)) {
                    a_filters.push(search.createFilter({ name: 'duedate', operator: search.Operator.WITHIN, values: [custStartDate, custEndDate] }));
                }


                if (_logValidation(custsubsidiary)) {
                    a_filters.push(search.createFilter({ name: 'subsidiary', operator: search.Operator.ANYOF, values: custsubsidiary }));
                }

                if (_logValidation(custvendname)) {
                    a_filters.push(search.createFilter({ name: 'entity', operator: search.Operator.ANYOF, values: custvendname }));
                }

                

                // if (_logValidation(custlocation)) {
                //     a_filters.push(search.createFilter({ name: 'location', operator: search.Operator.ANYOF, values: custlocation }));
                // }


                // End Filters Selecting Based on Data Shown in UI

                var header_str = "Bill,Start Date, Due Date, Transaction No, Vendor Name, Amount to be Paid, Amount Due, Total Amount, Tax Amount, Location, Benificiary Bank Name, Benificiary Bank Account No,IFSC Code \n"
                var line_str = "";


                var vendor_search = search.load({
                    id: 'customsearch_ns_hdfcbank_paymentfile',
                });

                log.debug('vendor_search', vendor_search);


                if (_logValidation(a_filters)) {

                    for (var j = 0; j < a_filters.length; j++) {

                        vendor_search.filters.push(a_filters[j]);

                    }

                }

                var a_search_results = vendor_search.run().getRange({
                    start: 0,
                    end: 100
                });

                log.debug('Vendor Bill', 'Vendor Bill Data ---->' + a_search_results.length);


                if (_logValidation(a_search_results)) 
                {

                   // if (custCheckBox == 'true') 
                    {


                        for (var i = 0; i < a_search_results.length; i++) {

                            var rec_type = a_search_results[i].getValue({
                                name: 'type'
                            });


                            var vendor_name = a_search_results[i].getText({
                                name: 'entity'
                            });


                            var rec_id = a_search_results[i].getValue({
                                name: 'internalid'
                            });


                            var i_location = a_search_results[i].getText({
                                name: 'location'
                            });


                            var i_start_date = a_search_results[i].getValue({
                                name: 'trandate'
                            });


                            var i_due_date = a_search_results[i].getValue({
                                name: 'duedate'
                            });

                            var i_doc_no = a_search_results[i].getValue({
                                name: 'tranid'
                            });


                            var trans_no = a_search_results[i].getValue({
                                name: 'transactionnumber'
                            });

                            // var i_benificary_bank_acc = a_search_results[i].getValue({
                            //     name: 'custentity_bank_account_no',
                            //     join: "vendor",
                            //     label: "Beneficiary Account No"
                            // });

                            var i_tds_amt = a_search_results[i].getValue({
                                name: 'taxtotal'
                            });

                            var i_tds_amt_1 = Math.abs(i_tds_amt);


                            var total_amt = a_search_results[i].getValue({
                                name: 'total'

                            });

                          var  total_amt_1 = Math.abs(total_amt);


                            var i_benificary_bank_name = a_search_results[i].getValue({

                                name: "custentity_bank_name",
                                join: "vendor",
                                label: "Bank Name"
                            });

                            var beneficiaryBankIFSCCode = a_search_results[i].getValue({
                                name: "custentity_sort_code_ifsc_code",
                                join: "vendor",
                                label: "Bank IFSC Code"
                            });
                            var beneficiaryBankAccountNo = a_search_results[i].getValue({
                                name: "custentity_bank_account_no",
                                join: "vendor",
                                label: "Bank Account No"
                            });

                            if (line_str == "") {
                                line_str = i_doc_no + "," + i_start_date + "," + i_due_date +  "," + trans_no + "," +vendor_name+ "," +total_amt_1+ "," +total_amt_1+ "," +total_amt_1+ "," +i_tds_amt_1+ "," +i_location+ "," + i_benificary_bank_name + "," + beneficiaryBankAccountNo + "," +beneficiaryBankIFSCCode+"\n";
                            } else {
                                line_str += line_str = i_doc_no + "," + i_start_date + "," + i_due_date +  "," + trans_no + "," +vendor_name+ "," +total_amt_1+ "," +total_amt_1+ "," +total_amt_1+ "," +i_tds_amt_1+ "," +i_location+ "," + i_benificary_bank_name + "," + beneficiaryBankAccountNo + "," +beneficiaryBankIFSCCode+"\n";
                            }

                        }


                    }

                   

                }

                else {
                    line_str = "No data selected."
                }
                var s_File_Name = 'HDFC_Bank_Integration_CSV_File' + new Date() + '.csv';

                var s_file_contents = header_str + line_str

                var fileObj = file.create({
                    name: s_File_Name,
                    fileType: file.Type.CSV,
                    contents: s_file_contents
                });

                

                context.response.writeFile({
                    file: fileObj,
                    isInline:true
                });

                return;


                context.response.writePage(form);
            }



        }

        catch (ex) {

            log.debug('Error in GET Suitelet Function', ex.message);
        }

    }

    return {
        onRequest: onRequest
    };

    function formatToDate(date) {
        return format.format({
            value: date,
            type: format.Type.DATE
        });
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

    function _logValidation(value) {
        if (value != null && value != '' && value != undefined && value.toString() != 'NaN' && value != NaN) {
            return true;
        } else {
            return false;
        }
    }
});
