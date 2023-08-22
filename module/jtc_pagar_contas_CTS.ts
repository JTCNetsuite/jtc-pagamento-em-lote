/**
 * @NAPIVersion 2.x
 * @NModuleScope public
 */


export const constant = {
    FORM: {
        TITLE: 'Pagamento em Lote',
        BTN_SUBMIT: 'Buscar',
        FILTERS: {
            FORNECEDOR: {
                ID: 'custpage_vendor',
                LABEL: 'Fornecedor'
            },
            DATA_DE: {
                ID: 'custpage_date_de',
                LABEL: 'Data De'
            },
            DATA_ATE: {
                ID: 'custpage_date_ate',
                LABEL: 'Data Até'
            }
        },
        SUBLIST: {
            ID: 'custpage_sublista_contas',
            LABEL: 'Contas a Pagar',
            FIELDS: {
                APPLY: {
                    ID: 'custpage_apply',
                    LABEL: 'Pagar'
                },
                ID_TRANS: {
                    ID: 'custpage_id',
                    LABEL: '..'
                },
                FORNECEDOR: {
                    ID: 'custpage_vendor_sub',
                    LABEL: 'Fonecedor'
                },
                DATA: {
                    ID: 'custpage_date',
                    LABEL: 'Data'
                },
                VALOR: {
                    ID: 'custpage_valor',
                    LABEL: 'Valor'
                },

            }
        },
        CHECK_PAGE: {
            ID: 'custpage_check',
            LABEL: '...'
        },
        CONTA: {
            ID: 'custpage_account',
            LABEL: 'Conta'            
        },
        DATA_PG: {
            ID: 'custpage_data_pg',
            LABEL: 'Data do Pagamento'
        }
    },

    VENDOR_BILL: {
        FORNECEDOR: 'entity',
        DATA: 'trandate',
        STATUS: 'approvalstatus',
        VALOR: 'total',
        DATA_VENCIMENTO: 'duedate'
    },

    RT_LOTE_PAGAMENTO: {
        ID:"customrecord_jtc_lote_de_pagamento",
        DATA_INICIO: 'custrecord_jtc_pg_date_de',
        DATA_FIM: 'custrecord_jtc_pg_data_fim',
        STATUS: 'custrecord_jtc_pg_status'
    },
    VENDOR_PAYMENT: {
        REC_LOTE: 'custbody_jtc_registro_de_lote',
        CONTA: 'account',
        DATA: 'trandate'
    },
    ACCOUNT: {
        ID: 'account'
    },

    SCRIPT_CONTAS_PAGAR_MR: {
        ID:1406,
        PARAMS: {
            IDS_CONTAS: 'custscript_jtc_id_contas_a_pagar',
            ID_REC_PG_LOTE: 'custscript_id_rec_pag_em_lote',
            CONTA: 'custscript_jtc_conta_pagar',
            DT_PAGAMENTO: 'custscript_jtc_data_de_pagamento'
        }
    }
}