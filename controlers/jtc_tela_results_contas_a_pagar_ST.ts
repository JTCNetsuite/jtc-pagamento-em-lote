/**
 * @NAPIVersion 2.x
 * @NScriptType Suitelet
 */


import { EntryPoints } from 'N/types'
import * as MSR from '../models/jtc_tela_pagar_contas_st_MSR'


export const onRequest: EntryPoints.Suitelet.onRequest = (ctx: EntryPoints.Suitelet.onRequestContext) => {
    try {
        MSR.onRequest(ctx)
    } catch (error) {
        
    }
}