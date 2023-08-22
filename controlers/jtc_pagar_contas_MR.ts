/**
 * @NAPIVersion 2.x
 * @NScriptType MapReduceScript
 */


import { EntryPoints } from 'N/types'
import * as log from 'N/log'
import * as MSR from '../models/jtc_pagar_contas_mr_MSR'

export const getInputData: EntryPoints.MapReduce.getInputData = () => {
    try {
        return MSR.getInputData()
    } catch (error) {
        log.error("jtc_pagar_contas_MR.getInputData", error)
    }
}

export const map: EntryPoints.MapReduce.map = (ctx: EntryPoints.MapReduce.mapContext) => {
    try {
        MSR.map(ctx)
    } catch (error) {
        log.error("jtc_pagar_contas_MR.map", error)
    }
}

export const summarize: EntryPoints.MapReduce.summarize = (ctx: EntryPoints.MapReduce.summarizeContext) => {
    try {
        MSR.summarize(ctx)
    } catch (error) {
        log.error("jtc_pagar_contas_MR.Summarize", error)
    }
}