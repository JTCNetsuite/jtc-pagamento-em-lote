/**
 * @NAPIVersion 2.x
 * @NModuleScope public
 */

import { EntryPoints } from 'N/types'
import * as UI from 'N/ui/serverWidget'
import * as log from "N/log"
import {constant as CTS} from '../module/jtc_pagar_contas_CTS'
import * as record from 'N/record'
import * as search from 'N/search'
import * as redirect from 'N/redirect'
import * as task from 'N/task'

export const onRequest = (ctx: EntryPoints.Suitelet.onRequestContext) => {
    try {
        const form = UI.createForm({
            title: CTS.FORM.TITLE
        })

        if (ctx.request.method == "GET") {
            getForm(form, ctx)
        } else {
            if(ctx.request.parameters.custpage_check == "T"|| ctx.request.parameters.custpage_check == true) {
                const body = ctx.request.parameters

                const sublist = String(body.custpage_sublista_contasdata).split("/\u0001/")
                const lines = String(sublist[0]).split("\u0002")
                const dt_pgamento = body.custpage_data_pg

                log.debug('lines', lines)

                let id_to_send = ''

                for (var i =0;  i < lines.length; i++) {
                    // log.debug(i, lines[i])
                    const line = lines[i].split("\u0001")
                    if (line[0] == "T") {
                        log.debug(`${i}`, line)
                        id_to_send += `${line[1]},`
                    }

                }
                log.debug('id to send', id_to_send)

                const recLotePagamento = record.create({
                    type: CTS.RT_LOTE_PAGAMENTO.ID
                })

                recLotePagamento.setValue({fieldId: CTS.RT_LOTE_PAGAMENTO.DATA_INICIO, value: new Date()})
                recLotePagamento.setValue({fieldId: CTS.RT_LOTE_PAGAMENTO.STATUS, value: "INICIADO"})

               
                const idReturnLotePg = recLotePagamento.save()

                const mapReduceTask = task.create({
                    taskType: task.TaskType.MAP_REDUCE,
                    scriptId: CTS.SCRIPT_CONTAS_PAGAR_MR.ID,
                    params: {
                        custscript_jtc_id_contas_a_pagar: JSON.stringify(id_to_send),
                        custscript_id_rec_pag_em_lote: idReturnLotePg,
                        custscript_jtc_conta_pagar: body.custpage_account,
                        custscript_jtc_data_de_pagamento: dt_pgamento
                    }
                  
                });
                const idTask = mapReduceTask.submit();

                redirect.toRecord({
                    id: idReturnLotePg,
                    type: CTS.RT_LOTE_PAGAMENTO.ID
                })

            }else {
                postForm(form, ctx)
            }
            
        }

    } catch (e){
        log.error('jtc_tela_contas_pagar_MSR.onRequest', e)
        throw e
    }
}



const getForm = (form: UI.Form, ctx: EntryPoints.Suitelet.onRequestContext) => {
    try {

        
        const data_de = form.addField({
            id: CTS.FORM.FILTERS.DATA_DE.ID,
            label: CTS.FORM.FILTERS.DATA_DE.LABEL,
            type: UI.FieldType.DATE
        }).isMandatory = true

        const data_ate = form.addField({
            id: CTS.FORM.FILTERS.DATA_ATE.ID,
            label: CTS.FORM.FILTERS.DATA_ATE.LABEL,
            type: UI.FieldType.DATE
        }).isMandatory = true
        
        form.addSubmitButton({label: CTS.FORM.BTN_SUBMIT})

        ctx.response.writePage(form)
        
    } catch (e){
        log.error('jtc_tela_contas_pagar_MSR.getForm', e)
        throw e
    }
}


const postForm = (form: UI.Form, ctx: EntryPoints.Suitelet.onRequestContext) => {
    try {

        const body = ctx.request.parameters
        const data_de = body.custpage_date_de
        const data_ate = body.custpage_date_ate

        
        const filters = []

        form.addField({
            id: CTS.FORM.DATA_PG.ID,
            label: CTS.FORM.DATA_PG.LABEL,
            type: UI.FieldType.DATE
        })

        form.addField({
            id: CTS.FORM.CHECK_PAGE.ID,
            label: CTS.FORM.CHECK_PAGE.LABEL,
            type: UI.FieldType.CHECKBOX
        }).updateDisplayType({displayType: UI.FieldDisplayType.HIDDEN}).defaultValue = 'T'

        const account = form.addField({
            id:CTS.FORM.CONTA.ID,
            label: CTS.FORM.CONTA.LABEL,
            type: UI.FieldType.SELECT,
            source: 'account'
        })



        if (!!data_de && !!data_ate) {
            filters.push([
                CTS.VENDOR_BILL.DATA_VENCIMENTO, search.Operator.WITHIN, data_de, data_ate
            ])
            filters.push("AND")
        } else if (!!data_de) {
            filters.push([
                CTS.VENDOR_BILL.DATA_VENCIMENTO, search.Operator.AFTER, data_de
            ])
            filters.push("AND")
        } else if(!!data_ate) {
            filters.push([
                CTS.VENDOR_BILL.DATA_VENCIMENTO, search.Operator.BEFORE, data_ate
            ])
            filters.push("AND")
        }

        filters.push(["mainline", search.Operator.IS, "T"])
        filters.push("AND")

        filters.push([CTS.VENDOR_BILL.STATUS, search.Operator.IS, 2])
        filters.push("AND")

        filters.push(["status", search.Operator.ANYOF, "VendBill:A"])

        log.debug('filers', filters)

        const sublist = form.addSublist({
            id: CTS.FORM.SUBLIST.ID,
             label: CTS.FORM.SUBLIST.LABEL,
            type: UI.SublistType.LIST
        })

        createSublist(sublist)

        sublist.addMarkAllButtons()

        const searchVendorBill = search.create({
            type: search.Type.VENDOR_BILL,
            filters: filters,
            columns: [
                search.createColumn({name: CTS.VENDOR_BILL.FORNECEDOR}),
                search.createColumn({name: CTS.VENDOR_BILL.DATA_VENCIMENTO}),
                search.createColumn({name: CTS.VENDOR_BILL.VALOR})
            ]
        }).run().getRange({start: 0, end: 30})


        log.debug('seachrVendorBill', searchVendorBill)

       

        if (searchVendorBill.length > 0) {
            
            for (var i=0; i < searchVendorBill.length; i++) {

                sublist.setSublistValue({
                    id: CTS.FORM.SUBLIST.FIELDS.FORNECEDOR.ID,
                    line: i,
                    value: String(searchVendorBill[i].getValue({name: CTS.VENDOR_BILL.FORNECEDOR}))
                })
                sublist.setSublistValue({
                    id: CTS.FORM.SUBLIST.FIELDS.ID_TRANS.ID,
                    line: i,
                    value: searchVendorBill[i].id
                })
                sublist.setSublistValue({
                    id: CTS.FORM.SUBLIST.FIELDS.DATA.ID,
                    line: i,
                    value: String(searchVendorBill[i].getValue({name: CTS.VENDOR_BILL.DATA_VENCIMENTO}))
                })

                sublist.setSublistValue({
                    id: CTS.FORM.SUBLIST.FIELDS.VALOR.ID,
                    line: i,
                    value: String(searchVendorBill[i].getValue({name: CTS.VENDOR_BILL.VALOR}))
                })
            }
        }

        form.addSubmitButton({label: "Pagar"})
        
        ctx.response.writePage(form)
    } catch (e){
        log.error('jtc_tela_contas_pagar_MSR.postForm', e)
        throw e
    }
}


const createSublist = ( sublist: UI.Sublist) => {
    try {

        const apply = sublist.addField({
            id: CTS.FORM.SUBLIST.FIELDS.APPLY.ID,
            label: CTS.FORM.SUBLIST.FIELDS.APPLY.LABEL,
            type: UI.FieldType.CHECKBOX ,
        })

        const id_contas = sublist.addField({
            id: CTS.FORM.SUBLIST.FIELDS.ID_TRANS.ID,
            label: CTS.FORM.SUBLIST.FIELDS.ID_TRANS.LABEL,
            type: UI.FieldType.TEXT ,
        }).updateDisplayType({displayType: UI.FieldDisplayType.HIDDEN})
        
    
        const fonecedor_sub = sublist.addField({
            id: CTS.FORM.SUBLIST.FIELDS.FORNECEDOR.ID,
            label: CTS.FORM.SUBLIST.FIELDS.FORNECEDOR.LABEL,
            type: UI.FieldType.SELECT ,
            source: String(record.Type.VENDOR)
        }).updateDisplayType({displayType: UI.FieldDisplayType.INLINE})
    
        const data = sublist.addField({
            id: CTS.FORM.SUBLIST.FIELDS.DATA.ID,
            label: CTS.FORM.SUBLIST.FIELDS.DATA.LABEL,
            type: UI.FieldType.DATE
        })
    
        const valor = sublist.addField({
            id: CTS.FORM.SUBLIST.FIELDS.VALOR.ID,
            label: CTS.FORM.SUBLIST.FIELDS.VALOR.LABEL,
            type: UI.FieldType.CURRENCY
        })
    } catch (e) {
        log.error("jtc_tela_contas_pagar.createSublist", e)
    }
    
    
}