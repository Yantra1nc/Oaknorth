/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

/*************************************************************
 * File Header
 * Script Type:User Event Script
 * Script Name:OK_Send_Bill_details
 * File Name:  OK_Send_Bill_details.js
 * Created On: 01/11/2022
 * Modified On:
 * Created By: Sanjit yadav
 * Modified By: 
 * Description: 
 *********************************************************** */
define(['N/record', 'N/runtime', 'N/https', 'N/http', 'N/search', 'N/error', 'N/ui/serverWidget', 'N/ui/message'],
    function(record, runtime, https, http, search, error, serverWidget, message) {
			var outhError=''
        function error_beforeSubmit(context) {
            var currentObj = context.newRecord;
            //var bill_recId = currentObj.id;
            var recordtype = currentObj.type;
            log.debug('before Submit', recordtype)
            var errorObj = null;
            if (recordtype == 'vendorbill') {
                var i_vendor = currentObj.getValue({
                    fieldId: 'entity'
                })
                var i_subsidiary = currentObj.getValue({
                    fieldId: 'subsidiary'
                })
                var ukSubsidiary = false
                var i_mode = currentObj.getValue({
                    fieldId: 'custbody_ok_payment_mode'
                })
                log.debug("runtime.executionContext", runtime.executionContext);
                if (i_subsidiary == 61 || i_subsidiary == 71 || i_subsidiary == 64 || i_subsidiary == 76 || i_subsidiary == 55) {
                    ukSubsidiary = true
                }
                log.debug('BeforeSubmit', ':-ukSubsidiary--:' + ukSubsidiary)
                if (_logValidation(i_vendor) && ukSubsidiary) {
                    var fieldLookUp = search.lookupFields({
                        type: search.Type.VENDOR,
                        id: i_vendor,
                        columns: ['custentity_in_benficiary_name', 'custentity_sort_code_ifsc_code', 'custentity_bank_account_no']
                    });
                    log.debug('fieldLookUp-- before Submit', fieldLookUp)
                    var i_name = fieldLookUp.custentity_in_benficiary_name
                    var i_accountNumber = fieldLookUp.custentity_bank_account_no
                    var i_sortCode = fieldLookUp.custentity_sort_code_ifsc_code
                    if (!_logValidation(i_sortCode) || !_logValidation(i_accountNumber)) {
                        errorObj = error.create({
                            code: 'Error',
                            message: 'Missing Vendor Account No/Sort Code'
                        });
                        throw errorObj.message;
                        return false;

                    }
                    if (!i_mode) {
                        errorObj = error.create({
                            code: 'Error',
                            message: 'Please select  Fields Payment Mode(Clear Bank)'
                        });
                        throw errorObj.message;
                        return false;
                    }
                }
            }

        }

        function afterSubmit(context) {
            try {
                log.debug('context.type', context.type)
                var contxt_ = runtime.executionContext; //get execution context
                log.debug('contxt_', contxt_)
                var currentRecord = context.newRecord;
                var bill_recId = currentRecord.id;
                var recordtype = currentRecord.type;
                log.debug('After Submit recordtype', recordtype)
                if (contxt_ == 'MAPREDUCE' && recordtype == 'customrecord_hdfc_bank_details') {

                    var bankRecobj = record.load({
                        type: recordtype,
                        id: bill_recId,
                        isDynamic: true
                    });
                    log.debug('bill record id', bill_recId)
                    var i_amount = bankRecobj.getValue({
                        fieldId: 'custrecord_hbd_payment_amount'
                    })
                    if (!_logValidation(i_amount)) {
                        i_amount = 0
                    }
                    var billId = bankRecobj.getValue({
                        fieldId: 'custrecord_hbd_transaction'
                    })
                    var primaryKey = bankRecobj.getValue({
                        fieldId: 'custrecord_hbd_primary_key'
                    })
					if(billId){
						var fieldLookUp = search.lookupFields({
						type: search.Type.VENDOR_BILL,
						id: billId,
						columns: ['tranid',]
					});
					}
                    var initiated = bankRecobj.getValue({
                        fieldId: 'custbody_clear_bank_initiated'
                    })

                    var payment_initiated = bankRecobj.getValue({
                        fieldId: 'custbody_clear_bank_pymt_initiated'
                    })

                    log.debug('afterSubmit', 'initiated -->' + initiated)
                    log.debug('afterSubmit', 'payment_initiated -->' + payment_initiated)

                    var i_sourceType = 'NetSuit'
                    var i_reference =fieldLookUp.tranid /*bankRecobj.getValue({
                        fieldId: 'tranid'
                    })*/
                    var i_vendor = bankRecobj.getValue({
                        fieldId: 'custrecord_hbd_vendor_'
                    })
                    var i_status = bankRecobj.getValue({
                        fieldId: 'custrecord_hbd_approval_status'
                    })
                    var i_subsidiary = bankRecobj.getValue({
                        fieldId: 'custrecord_subsidary'
                    })
                    var i_tr_status = bankRecobj.getValue({
                        fieldId: 'status'
                    })
                    log.debug('i_tr_status', i_tr_status)
                    var ukSubsidiary = false
                    var isPaymentCreated = bankRecobj.getValue({
                        fieldId: 'custrecord_hbd_vendor_payment'
                    })
                    if (_logValidation(isPaymentCreated)) {
                        log.debug('if Bill id is true then do not send details to clear bank', isPaymentCreated)
                        return
                    }
                    if (i_subsidiary == 61 || i_subsidiary == 71 || i_subsidiary == 64 || i_subsidiary == 76 || i_subsidiary == 55) {
                        ukSubsidiary = true
                    }
                    log.debug('i_status', 'i_status--' + i_status + ':-ukSubsidiary--:' + ukSubsidiary)

                    // if ((initiated == true) && (payment_initiated == true)) 
                    {
                        if (_logValidation(i_vendor) && i_status == 2 && ukSubsidiary /*&& i_tr_status == 'Open'*/ ) {
                            var fieldLookUp = search.lookupFields({
                                type: search.Type.VENDOR,
                                id: i_vendor,
                                columns: ['custentity_in_benficiary_name', 'custentity_sort_code_ifsc_code', 'custentity_bank_account_no']
                            });
                            log.debug('fieldLookUp', fieldLookUp)
                            var i_name = fieldLookUp.custentity_in_benficiary_name
                            var i_accountNumber = fieldLookUp.custentity_bank_account_no
                            var i_sortCode = fieldLookUp.custentity_sort_code_ifsc_code
                            if (_logValidation(i_accountNumber) && _logValidation(i_sortCode)) {
                                var responseUrl = postData_Mule(primaryKey, i_amount, i_sourceType, i_reference, i_name, i_sortCode, i_accountNumber)
                                log.debug('responseUrl', responseUrl.respBody)

                                // update the custom record after response
                                if (_logValidation(responseUrl)) {
                                    if (responseUrl.respBody  && responseUrl.code==200) {
                                        var i_status = responseUrl.respBody.paymentResponse.status
                                        var i_referenceId = responseUrl.respBody.paymentResponse.referenceId
                                        var i_errorMessage = responseUrl.respBody.paymentResponse.errorMessage
                                        if (i_status == 'Accepted') {
                                          /*  bankRecobj.setValue({
                                            fieldId: 'custrecord_refrence_id',
                                            value: i_referenceId
                                        })*/
                                            /*var id = record.submitFields({
                                                type: record.Type.VENDOR_BILL,
                                                id: billId,
                                                values: {
                                                    custbody_ok_refrence_id: i_referenceId,
                                                    custbody_ok_is_bill_updated: true
                                                },
                                                options: {
                                                    enableSourcing: false,
                                                    ignoreMandatoryFields: true
                                                }
                                            });
                                            log.debug('bill record updated ', id)

                                        }*/
									}
                                        var erroLog=createErrorLog(billId, i_status, responseUrl.param, responseUrl.respBody, bill_recId)
										/*bankRecobj.setValue({
                                            fieldId: 'custrecord_hbd_bank_logs',
                                            value: erroLog
                                        })*/
										
										var id = record.submitFields({
                                                type:recordtype ,
                                                id: bill_recId,
                                                values: {
                                                    custrecord_refrence_id: i_referenceId,
													custrecord_hbd_bank_logs:erroLog
                                                  //  custbody_ok_is_bill_updated: true
                                                },
                                                options: {
                                                    enableSourcing: false,
                                                    ignoreMandatoryFields: true
                                                }
                                            });
                                            log.debug('custom record updated ', id)
										
                                    }else{
										var i_status='Failed'
										var erroLog=createErrorLog(billId, i_status, responseUrl.param, responseUrl.respBody, bill_recId)
										var id = record.submitFields({
                                                type:recordtype ,
                                                id: bill_recId,
                                                values: {
                                                  //  custrecord_refrence_id: i_referenceId,
													custrecord_hbd_bank_logs:erroLog,
													custrecord_hbd_approval_status:1,
													custrecord_hbd_rejection_reason:responseUrl.respBody
                                                  //  custbody_ok_is_bill_updated: true
                                                },
                                                options: {
                                                    enableSourcing: false,
                                                    ignoreMandatoryFields: true
                                                }
                                            });
                                            log.debug('custom record updated ', id)
									}

                                }else{
									
									//update it if failed to upload
									var id = record.submitFields({
                                                type:recordtype ,
                                                id: bill_recId,
                                                values: {
                                                  //  custrecord_refrence_id: i_referenceId,
													//custrecord_hbd_bank_logs:erroLog,
													custrecord_hbd_approval_status:1,
													custrecord_hbd_rejection_reason:outhError
                                                  //  custbody_ok_is_bill_updated: true
                                                },
                                                options: {
                                                    enableSourcing: false,
                                                    ignoreMandatoryFields: true
                                                }
                                            });
                                            log.debug('custom record updated ', id)
								}
                            }
                        }

                    } // Payment Initiated & Initiated ?
					/*setTimeout(function() {
                        log.debug('Ran after 1 second');
                    }, 15000);
                    var customRecid = bankRecobj.save({
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    });
                    log.debug('customRecid', customRecid)
					*/

                }
            } catch (e) {
                var errString = 'afterSubmit ' + e.name + ' : ' + e.type + ' : ' + e.message;
                log.error({
                    title: 'afterSubmit',
                    details: errString
                });
            }
        }

        function postData_Mule(bill_recId, i_amount, i_sourceType, i_reference, i_name, i_sortCode, i_accountNumber) {
            try {
                //var accessToken = '';
                var url = 'https://apigateway-test.oaknorth-it.com/netsuite' //'https://mule-dev.oaknorth-it.com/payments/transfers';

                var params = {
                    "paymentDetails": {
                        "transactionId": bill_recId,
                        "amount": i_amount,
                        "sourceType": i_sourceType,
                        "reference": i_reference
                    },
                    "creditor": {
                        "name": i_name,
                        "accountNumber": i_accountNumber,
                        "sortCode": i_sortCode
                    }
                }


                var response = null;
                 log.debug('params', 'params--' +JSON.stringify(params))
                var tokenDetails = GetToken()
                log.debug('tokenDetails', tokenDetails)
                var accessToken = tokenDetails.token
                if (_logValidation(accessToken)) {
                    var headers = {
                        //"Host"              : 'tstdrv1656341.restlets.api.netsuite.com',
                        "Authorization": 'Bearer ' + accessToken.toString(),
                        "Content-Type": 'application/json'
                    };

                    var o_response = https.post({
                        url: url,
                        body: JSON.stringify(params),
                        headers: headers
                    });
                    log.debug('RESPONSE', '[CODE : ' + o_response.code + '] [BODY : ' + o_response.body + ']');

                }

                if (o_response) {
                    if (o_response.body) {
                        var body = o_response.body;
                        var respBody = JSON.parse(body);
                        log.debug('respBody', respBody)
                    }
                }
                return {
                    'respBody': respBody,
                    'param': JSON.stringify(params),
					'code':o_response.code
                };

            } catch (e) {
                log.error('error in postData_Mule', e.message)
                //  createAuthError(e.message)
				outhError=e.message
                return ''
            }
        }

        function createErrorLog(bill_recId, i_status, request, response, custom_recId) {
            try {
                var customObj = record.create({
                    type: 'customrecord_bank_integration_logs',
                    isDynamic: true
                })
                var i_customName = 'NS-Clear Bank Intergartion'
                var i_statusValue = ''
                if (i_status == 'Accepted') {
                    i_statusValue = 1
                }
                if (i_status == 'Failed') {
                    i_statusValue = 3
                }
                if (_logValidation(i_statusValue)) {
                    customObj.setValue({
                        fieldId: 'custrecord_bil_status',
                        value: i_statusValue
                    })
                }
                customObj.setValue({
                    fieldId: 'name',
                    value: i_customName
                })
                customObj.setValue({
                    fieldId: 'custrecord_ok_request',
                    value: request
                })
                customObj.setValue({
                    fieldId: 'custrecord_ok_respone',
                    value: JSON.stringify(response)
                })
                customObj.setValue({
                    fieldId: 'custrecord_bil_transaction',
                    value: bill_recId
                })
                customObj.setValue({
                    fieldId: 'custrecord_ok_cleare_bank_integration',
                    value: true
                })
                customObj.setValue({
                    fieldId: 'custrecord_primary_key_ref',
                    value: custom_recId
                })
                var errorId = customObj.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });
                log.debug('errorId', errorId)
				return errorId
            } catch (e) {
                log.error('error in createErrorLog', e.message)
            }
        }


        function createAuthError(i_errString) {
            try {
                var customObj = record.create({
                    type: 'customrecord_bank_integration_logs',
                    isDynamic: true
                })
                var i_customName = 'NS-Clear Bank Auth Error'
                customObj.setValue({
                    fieldId: 'custrecord_bil_status',
                    value: 3
                })

                customObj.setValue({
                    fieldId: 'name',
                    value: i_customName
                })

                customObj.setValue({
                    fieldId: 'custrecord_ok_respone',
                    value: i_errString
                })

                customObj.setValue({
                    fieldId: 'custrecord_ok_cleare_bank_integration',
                    value: true
                })
                var errorId = customObj.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });
                log.debug('errorId', errorId)
            } catch (e) {
                log.error('error in createAuthError function', e.message)
            }
        }

        function beforeLoad(context) {
            var currentObj = context.newRecord;
            var bill_recId = currentObj.id;
            var recordtype = currentObj.type;
            log.debug('before Load ', recordtype)
            if (context.type === 'view' && recordtype == 'vendorbill')
                try {
					
                    /*  var tokenDetails = GetToken()
                    log.debug('tokenDetails', tokenDetails)
					var accessToken=tokenDetails.token
					if(_logValidation(accessToken)){
					var s_restlet_url = "https://apigateway-test.oaknorth-it.com/netsuite";
					var o_payload = {
						"creditor": {
							"name": "test",
							"sortCode": "000004",
							"accountNumber": "12345677"
						},
						"paymentDetails": {
							"amount": "1",
							"reference": "Test11",
							"sourceType": "NetSuit",
							"transactionId": "12342"
						}
					}
						var headers = 
						{               
							//"Host"              : 'tstdrv1656341.restlets.api.netsuite.com',
							"Authorization"     : 'Bearer '+accessToken.toString(),
							"Content-Type"      : 'application/json'
						};
						
						var o_restlet_response = https.post({
							url: s_restlet_url,
							body: JSON.stringify(o_payload),
							headers: headers
						});
						var o_response = https.post({
							url: s_restlet_url,
							body: JSON.stringify(o_payload),
							headers: headers
						});
						log.debug('RESPONSE','[CODE : '+o_response.code+'] [BODY : '+o_response.body+']');
						
					}
              
                if (o_response) {
                    if (o_response.body) {
                        var body = o_response.body;
                        var respBody = JSON.parse(body);
                        log.debug('respBody', respBody)
                    }
                }*/
                    //}

                    var is_billed = currentObj.getValue({
                        fieldId: 'custbody_ok_is_bill_updated'
                    })
                    log.debug('is_billed', is_billed)
                    var i_status = currentObj.getValue({
                        fieldId: 'status'
                    })
                    log.debug('i_status', i_status)
                    var i_subsidiary = currentObj.getValue({
                        fieldId: 'subsidiary'
                    })
                    var ukSubsidiary = false
                    if (i_subsidiary == 61 || i_subsidiary == 71 || i_subsidiary == 64 || i_subsidiary == 76 || i_subsidiary == 55) {
                        ukSubsidiary = true
                    }

                    if (is_billed && i_status == 'Open' && ukSubsidiary) {
                        context.form.addPageInitMessage({
                            type: message.Type.INFORMATION,
                            message: 'Send Details to clear Bank Integration to Pending for Clear Bank Payment',
                            duration: 17000
                        });
                        /*context.form.addPageInitMessage({type: message.Type.INFORMATION, message: 'Payment is pending from clear bank', duration: 17000});
                         */
                        var newButton = context.form.getButton({
                            id: 'edit'
                        })
                        newButton.isDisabled = true;
                    }
                    if (is_billed && i_status == 'Paid In Full' && ukSubsidiary) {
                        context.form.addPageInitMessage({
                            type: message.Type.INFORMATION,
                            message: 'Payment Applied Successfully for this bill',
                            duration: 17000
                        });
                    }
                } catch (e) {
                    log.error('error in before load', e.message)

                }

            if (context.type === 'copy') {
                var currentObj = context.newRecord;
                currentObj.setValue({
                    fieldId: 'custbody_hdfc_bank_payment_hold',
                    value: false
                });
                currentObj.setValue({
                    fieldId: 'custbody_clear_bank_initiated',
                    value: false
                });
                currentObj.setValue({
                    fieldId: 'custbody_clear_bank_pymt_initiated',
                    value: false
                });
            }
        }


        function GetToken() {
            try {
                var accessToken = '';
                var clientid = '',
                    clientsecret = '',
                    username = '',
                    password = '',
                    tokenSecret = '',
                    url = 'https://netsuite-cb-test.auth.eu-west-1.amazoncognito.com/oauth2/token';
                // provide the credentials to generate the token 

                var params = {
                    'grant_type': 'client_credentials',
                    'client_id': '6jbbpdplfniro7rj6hlv6e85fm', //clientid,
                    'client_secret': '1879ekmu96t3ts5stt9ofrb49k2q5rul0pna0v48ai1lboau26bb', //clientsecret,
                    // 'username': 'demo@hisysmc.onmicrosoft.com', //username,
                    // 'password': 'DA@#$1234' ,//password + tokenSecret,
                    //'scope': 'clearbannetsuiteNew/test'
                };


                //Setting up Headers 
                var headersArr = [];
                headersArr['Content-Type'] = 'application/x-www-form-urlencoded';
                headersArr['Accept'] = '*/*';

                var response = null;
                if (url) {
                    //https Module
                    if (url.indexOf('https://') != -1) {
                        response = https.post({
                            url: url,
                            body: params,
                            headers: headersArr
                        });
                    }
                    //http Module
                    else if (url.indexOf('http://') != -1) {
                        response = http.post({
                            url: url,
                            headers: headersArr,
                            body: JSON.stringify(params)
                        });
                    }
                }
                log.debug('response', response)
                if (response) {
                    if (response.body) {
                        var body = response.body;
                        var respBody = JSON.parse(body);
                        log.debug('respBody', respBody)
                        if (respBody.access_token) {
                            accessToken = respBody.access_token;
                            log.debug('accessToken', accessToken)
                            return {
                                'token': accessToken
                            };
                        }

                    }
                }

            } catch (ex) {
                log.error('error in token generation', JSON.stringify(ex));
                createAuthError(ex.message)
                return '';
            }
        }
function GetTokenProd() {
            try {
                var accessToken = '';
                var clientid = '',
                    clientsecret = '',
                    username = '',
                    password = '',
                    tokenSecret = '',
                    url = 'https://oaknorth-netsuite-clearbank-integration.auth.eu-west-1.amazoncognito.com/oauth2/token';
                // provide the credentials to generate the token 

                var params = {
                    'grant_type': 'client_credentials',
                    'client_id': '7h6uasc6rpi88e5ln5rbavvvfh', //clientid,
                    'client_secret': '1t043ar5rqb52nn509tbr33ri1er85jb3vkv2oa9ldcov45n1hvt', //clientsecret,
                    // 'username': 'demo@hisysmc.onmicrosoft.com', //username,
                    // 'password': 'DA@#$1234' ,//password + tokenSecret,
                    'scope': 'clearbanknetsuiteintegration/prod'
                };
				log.debug('params',params)

                //Setting up Headers 
                var headersArr = [];
                headersArr['Content-Type'] = 'application/x-www-form-urlencoded';
                headersArr['Accept'] = '*/*';

                var response = null;
                if (url) {
                    //https Module
                    if (url.indexOf('https://') != -1) {
                        response = https.post({
                            url: url,
                            body: params,
                            headers: headersArr
                        });
                    }
                    //http Module
                    else if (url.indexOf('http://') != -1) {
                        response = http.post({
                            url: url,
                            headers: headersArr,
                            body: JSON.stringify(params)
                        });
                    }
                }
                log.debug('response', response)
                if (response) {
                    if (response.body) {
                        var body = response.body;
                        var respBody = JSON.parse(body);
                        log.debug('respBody', respBody)
                        if (respBody.access_token) {
                            accessToken = respBody.access_token;
                            log.debug('accessToken', accessToken)
                            return {
                                'token': accessToken
                            };
                        }

                    }
                }

            } catch (ex) {
                log.error('error in token generation', JSON.stringify(ex));
                createAuthError(ex.message)
                return '';
            }
        }
        function _logValidation(value) {
            if (value != 'null' && value != null && value != null && value != '' && value != undefined && value != undefined && value != 'undefined' &&
                value != 'undefined' && value != 'NaN' && value != NaN && value != 'Infinity') {
                return true;
            } else {
                return false;
            }
        }
		function setTimeout(aFunction, milliseconds) {
            var date = new Date();
            date.setMilliseconds(date.getMilliseconds() + milliseconds);
            while (new Date() < date) {}

            return aFunction();
        }

        return {
            beforeLoad: beforeLoad,
            beforeSubmit: error_beforeSubmit,
            afterSubmit: afterSubmit
        };
    });