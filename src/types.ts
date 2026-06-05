/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "Admin" | "Comercial";

export interface SimulatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "Ativo" | "Pendente";
  createdAt: string;
  Abas_Liberadas?: string[];
  passwordHash?: string; // Advanced security: salted hash
}

export type StatusRegistro = "Pendente" | "Completo";

// A. MIGRAÇÃO BOLETO → CARTÃO ELOS
export interface MigracaoElos {
  id: string;
  codigoCliente: string;
  empresaAnterior: "PF" | "Online";
  valorAnterior: number;
  empresaAtual: string; // "Elos Rec 01", "Elos Rec 02", etc.
  valorAtual: number;
  proximaParcela: string; // YYYY-MM-DD
  premiacao: string;
  status: StatusRegistro;
  dataCriacao: string;
  dataConclusao?: string;
  modificadoPor?: string;
  Score_IA?: number;
}

// B. TROCA DE CARTÃO
export interface TrocaCartao {
  id: string;
  codigoCliente: string;
  dataVencimentoParcela: string; // YYYY-MM-DD
  status: StatusRegistro;
  dataCriacao: string;
  dataConclusao?: string;
  modificadoPor?: string;
  Score_IA?: number;
}

// C. CANCELAMENTO RECORRENTE → BOLETO
export interface CancelamentoBoleto {
  id: string;
  codigoCliente: string;
  valorAnterior: number;
  empresaAnterior: "Online" | "PF";
  dataAlteracao: string; // YYYY-MM-DD
  motivoCancelamento: string;
  migracaoPara: string; // "Elos Rec - diversos dias"
  valorAtual: number;
  proximoVencimento: string; // YYYY-MM-DD
  status: StatusRegistro;
  dataCriacao: string;
  dataConclusao?: string;
  modificadoPor?: string;
  Score_IA?: number;
}

// D. CONTROLE PJ
export interface ControlePJ {
  id: string;
  codigoCliente: string;
  dataContratacao: string; // YYYY-MM-DD
  formaPagamentoP1: "Elos Rec" | "PIX" | "Boleto";
  dataProximaParcela: string; // YYYY-MM-DD
  status: StatusRegistro;
  dataCriacao: string;
  dataConclusao?: string;
  modificadoPor?: string;
  historicoModificacoes?: string[]; // Log de histórico
  Score_IA?: number;
}

export interface AppNotification {
  id: string;
  tipo: "vencimento" | "sistema";
  mensagem: string;
  lida: boolean;
  data: string;
  referenciaId?: string;
  aba?: "migracao" | "troca" | "cancelamento" | "pj";
}

export interface FilterState {
  periodoInicio: string;
  periodoFim: string;
  status: "Todos" | "Pendente" | "Completo";
  empresa: string;
  search: string;
}
