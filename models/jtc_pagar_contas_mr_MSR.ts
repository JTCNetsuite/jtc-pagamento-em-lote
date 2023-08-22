/**
 * @NAPIVersion 2.x
 * @NModuleScope public
 */

import { EntryPoints } from 'N/types'
import * as log from 'N/log'
import * as runtime from 'N/runtime'
import { constant as CTS} from '../module/jtc_pagar_contas_CTS'
import * as record from 'N/record'
import * as search from 'N/search'


export const getInputData = () => {
    try {
        
        const currScript = runtime.getCurrentScript()
        const idContasPagar = currScript.getParameter({name: CTS.SCRIPT_CONTAS_PAGAR_MR.PARAMS.IDS_CONTAS})
        
        log.debug('id constas', idContasPagar)

        const ids = String(idContasPagar).slice(1, -1).split(",")
        ids.pop()
        log.debug('ids', ids)

        const filters = []
        for (var i=0; i < ids.length; i++) {
            filters.push(["internalid", search.Operator.ANYOF, ids[i]], "OR")
        }

        filters.pop()

        log.debug('filters', filters)
        const searchVendorBill = search.create({
            type: search.Type.VENDOR_BILL,
            filters: [
                ["mainline", search.Operator.IS, "T"],
                "AND",
                filters
            ],
            columns: []
        })
        return searchVendorBill

    } catch (error) {
        log.error('jtc_pagar_contas_mr_MSR.getInputData',error)
    }
}


export const map = (ctx: EntryPoints.MapReduce.mapContext) => {
    try {
        log.debug('ctx', ctx.value)
        const values = JSON.parse(ctx.value)
        
        const currScript = runtime.getCurrentScript()
        const idRecPgLote = currScript.getParameter({name: CTS.SCRIPT_CONTAS_PAGAR_MR.PARAMS.ID_REC_PG_LOTE})
        const conta = currScript.getParameter({name: CTS.SCRIPT_CONTAS_PAGAR_MR.PARAMS.CONTA})
        const dt_pgamento = String(currScript.getParameter({name: CTS.SCRIPT_CONTAS_PAGAR_MR.PARAMS.DT_PAGAMENTO})).split("/")
        log.debug("dt_pg", dt_pgamento)


        const idTrans = values.id

        const recPayment = record.transform({
            fromId: idTrans,
            fromType: record.Type.VENDOR_BILL,
            toType: record.Type.VENDOR_PAYMENT            
        })
        recPayment.setValue({fieldId: CTS.VENDOR_PAYMENT.CONTA, value: conta})
        recPayment.setValue({fieldId: CTS.VENDOR_PAYMENT.REC_LOTE, value: idRecPgLote})
        recPayment.setValue({fieldId: CTS.VENDOR_PAYMENT.DATA, value: new Date(`${dt_pgamento[1]}/${dt_pgamento[0]}/${dt_pgamento[2]}`)})

        const idPymente = recPayment.save({ignoreMandatoryFields: true})

        log.audit('idPyament', idPymente)


        


    } catch (error) {
        log.error('jtc_pagar_contas_mr_MSR.getInputData',error)
    }
}

export const summarize = (ctx: EntryPoints.MapReduce.summarizeContext) => {
      
    const currScript = runtime.getCurrentScript()
    const idRecPgLote = currScript.getParameter({name: CTS.SCRIPT_CONTAS_PAGAR_MR.PARAMS.ID_REC_PG_LOTE})

    const recordPgLote = record.load({
        type: CTS.RT_LOTE_PAGAMENTO.ID,
        id: idRecPgLote
    })

    recordPgLote.setValue({fieldId: CTS.RT_LOTE_PAGAMENTO.DATA_FIM, value: new Date()})
    recordPgLote.setValue({fieldId: CTS.RT_LOTE_PAGAMENTO.STATUS, value: 'FINALIZADO'})

    const idPglote = recordPgLote.save()
    log.audit('idPglote', idPglote)
}   