/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  MigracaoElos,
  TrocaCartao,
  CancelamentoBoleto,
  ControlePJ,
  SimulatedUser,
  AppNotification
} from "./types";

export const INITIAL_USERS: SimulatedUser[] = [
  {
    id: "user-1",
    name: "projetos.iadp@gmail.com",
    email: "projetos.iadp@gmail.com",
    role: "Admin",
    status: "Ativo",
    createdAt: "2026-01-10",
    Abas_Liberadas: [
      "Dashboard Principal",
      "Migração Boleto → Cartão Elos",
      "Troca de Cartão",
      "Cancelamento Recorrente → Boleto",
      "Controle PJ"
    ],
    passwordHash: "24075307010a70183307f7c00650943ebdf1b69f69abcf5862d2bc27af34ef9b" // Hash of "admin123"
  },
  {
    id: "user-2",
    name: "Carlos Comercial",
    email: "carlos.comercial@dentalplus.com.br",
    role: "Comercial",
    status: "Ativo",
    createdAt: "2026-02-15",
    Abas_Liberadas: [
      "Dashboard Principal",
      "Controle PJ"
    ],
    passwordHash: "55d64817a18bbba7fa87d1880e6efade1db8c1ed8cfb048cb159b3ee3322fb68" // Hash of "comercial123"
  },
  {
    id: "user-3",
    name: "Ana Silva",
    email: "ana.silva@dentalplus.com.br",
    role: "Comercial",
    status: "Ativo",
    createdAt: "2026-03-20",
    Abas_Liberadas: [
      "Dashboard Principal",
      "Controle PJ"
    ],
    passwordHash: "55d64817a18bbba7fa87d1880e6efade1db8c1ed8cfb048cb159b3ee3322fb68" // Hash of "comercial123"
  },
  {
    id: "user-4",
    name: "Beatriz Admin",
    email: "beatriz.admin@dentalplus.com.br",
    role: "Admin",
    status: "Ativo",
    createdAt: "2026-01-01",
    Abas_Liberadas: [
      "Dashboard Principal",
      "Migração Boleto → Cartão Elos",
      "Troca de Cartão",
      "Cancelamento Recorrente → Boleto",
      "Controle PJ"
    ],
    passwordHash: "24075307010a70183307f7c00650943ebdf1b69f69abcf5862d2bc27af34ef9b" // Hash of "admin123"
  }
];

export const INITIAL_MIGRACAO_ELOS: MigracaoElos[] = [
  {
    id: "mig-1",
    codigoCliente: "DP-10029",
    empresaAnterior: "PF",
    valorAnterior: 180.00,
    empresaAtual: "Elos Rec 01",
    valorAtual: 165.00,
    proximaParcela: "2026-06-06", // Amanhã! Vai disparar alerta.
    premiacao: "Bônus de migração ativa: 10% desconto na primeira mensalidade do cartão Elos",
    status: "Pendente",
    dataCriacao: "2026-05-25"
  },
  {
    id: "mig-2",
    codigoCliente: "DP-10352",
    empresaAnterior: "Online",
    valorAnterior: 220.00,
    empresaAtual: "Elos Rec 02",
    valorAtual: 220.00,
    proximaParcela: "2026-06-12",
    premiacao: "Nenhuma premiação aplicada. Upgrade de cobertura odontológica estética.",
    status: "Pendente",
    dataCriacao: "2026-05-28"
  },
  {
    id: "mig-3",
    codigoCliente: "DP-09871",
    empresaAnterior: "PF",
    valorAnterior: 150.00,
    empresaAtual: "Elos Rec 03",
    valorAtual: 140.00,
    proximaParcela: "2026-06-01",
    premiacao: "Desconto fidelidade de boleto para débito recorrente",
    status: "Completo",
    dataCriacao: "2026-05-10",
    dataConclusao: "2026-05-29",
    modificadoPor: "projetos.iadp@gmail.com"
  },
  {
    id: "mig-4",
    codigoCliente: "DP-11005",
    empresaAnterior: "Online",
    valorAnterior: 310.00,
    empresaAtual: "Elos Rec 01",
    valorAtual: 290.00,
    proximaParcela: "2026-06-06", // Amanhã também!
    premiacao: "Aparelho ortodôntico incluso na taxa de migração recorrente",
    status: "Pendente",
    dataCriacao: "2026-06-01"
  }
];

export const INITIAL_TROCA_CARTAO: TrocaCartao[] = [
  {
    id: "trc-1",
    codigoCliente: "DP-12883",
    dataVencimentoParcela: "2026-06-06", // Amanhã! Alerta de encerramento de lote.
    status: "Pendente",
    dataCriacao: "2026-05-30"
  },
  {
    id: "trc-2",
    codigoCliente: "DP-13291",
    dataVencimentoParcela: "2026-06-09",
    status: "Pendente",
    dataCriacao: "2026-05-31"
  },
  {
    id: "trc-3",
    codigoCliente: "DP-09941",
    dataVencimentoParcela: "2026-05-28",
    status: "Completo",
    dataCriacao: "2026-05-15",
    dataConclusao: "2026-05-27",
    modificadoPor: "projetos.iadp@gmail.com"
  }
];

export const INITIAL_CANCELAMENTO_BOLETO: CancelamentoBoleto[] = [
  {
    id: "can-1",
    codigoCliente: "DP-08871",
    valorAnterior: 140.00,
    empresaAnterior: "Online",
    dataAlteracao: "2026-06-01",
    motivoCancelamento: "Cliente relatou perda de cartão de crédito e preferiu migrar para boleto em lote corporativo",
    migracaoPara: "Elos Rec - 05 dias",
    valorAtual: 155.00,
    proximoVencimento: "2026-06-06", // Amanhã! Alerta.
    status: "Pendente",
    dataCriacao: "2026-06-02"
  },
  {
    id: "can-2",
    codigoCliente: "DP-11234",
    valorAnterior: 195.00,
    empresaAnterior: "PF",
    dataAlteracao: "2026-05-15",
    motivoCancelamento: "Recusa sistêmica recorrente no cartão por limite",
    migracaoPara: "Elos Rec - 10 dias",
    valorAtual: 195.00,
    proximoVencimento: "2026-06-15",
    status: "Pendente",
    dataCriacao: "2026-05-20"
  },
  {
    id: "can-3",
    codigoCliente: "DP-07551",
    valorAnterior: 89.00,
    empresaAnterior: "PF",
    dataAlteracao: "2026-05-10",
    motivoCancelamento: "Transações reprovadas múltiplas vezes (limite estourado)",
    migracaoPara: "Elos Rec - 15 dias",
    valorAtual: 99.00,
    proximoVencimento: "2026-05-25",
    status: "Completo",
    dataCriacao: "2026-05-10",
    dataConclusao: "2026-05-24",
    modificadoPor: "Carlos Comercial"
  }
];

export const INITIAL_CONTROLE_PJ: ControlePJ[] = [
  {
    id: "pj-1",
    codigoCliente: "PJ-50012",
    dataContratacao: "2026-04-01",
    formaPagamentoP1: "Elos Rec",
    dataProximaParcela: "2026-06-06", // Amanhã! Alerta.
    status: "Pendente",
    dataCriacao: "2026-05-01",
    historicoModificacoes: [
      "2026-05-01 14:23 - Registro criado por ana.silva@dentalplus.com.br",
      "2026-05-15 09:12 - Próxima parcela prorrogada de 01/06 para 06/06 por projetos.iadp@gmail.com"
    ]
  },
  {
    id: "pj-2",
    codigoCliente: "PJ-50024",
    dataContratacao: "2026-05-10",
    formaPagamentoP1: "PIX",
    dataProximaParcela: "2026-06-10",
    status: "Pendente",
    dataCriacao: "2026-05-10",
    historicoModificacoes: [
      "2026-05-10 11:00 - Contrato assinado. PIX selecionado por Carlos Comercial"
    ]
  },
  {
    id: "pj-3",
    codigoCliente: "PJ-49931",
    dataContratacao: "2026-03-15",
    formaPagamentoP1: "Boleto",
    dataProximaParcela: "2026-05-15",
    status: "Completo",
    dataCriacao: "2026-03-15",
    dataConclusao: "2026-05-15",
    modificadoPor: "Carlos Comercial",
    historicoModificacoes: [
      "2026-03-15 10:15 - Registro iniciado por Carlos Comercial",
      "2026-05-15 16:30 - Pagamento PJ da parcela de Maio confirmado. Concluído."
    ]
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "not-1",
    tipo: "vencimento",
    mensagem: "Vencimento amanhã: Migração do Cliente DP-10029 (Valor R$ 165,00) está agendada para 06/06/2026.",
    lida: false,
    data: "2026-06-05",
    referenciaId: "mig-1",
    aba: "migracao"
  },
  {
    id: "not-2",
    tipo: "vencimento",
    mensagem: "Vencimento amanhã: Troca de Cartão do Cliente DP-12883 está agendada para 06/06/2026.",
    lida: false,
    data: "2026-06-05",
    referenciaId: "trc-1",
    aba: "troca"
  },
  {
    id: "not-3",
    tipo: "sistema",
    mensagem: "Bem-vindo ao DentalPlus Gestão Financeira. Utilize o menu lateral para alternar entre as abas e o controle PJ.",
    lida: true,
    data: "2026-06-05"
  }
];
