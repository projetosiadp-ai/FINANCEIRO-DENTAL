/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  Search,
  Check,
  X,
  AlertTriangle,
  Calendar,
  Layers,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { CancelamentoBoleto } from "../types";

interface AbaCancelamentoProps {
  data: CancelamentoBoleto[];
  onAdd: (registro: Omit<CancelamentoBoleto, "id" | "dataCriacao" | "status">) => void;
  onUpdate: (id: string, updates: Partial<CancelamentoBoleto>) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  currentUserEmail: string;
}

export default function AbaCancelamento({
  data,
  onAdd,
  onUpdate,
  onDelete,
  onComplete,
  currentUserEmail
}: AbaCancelamentoProps) {
  const [search, setSearch] = useState("");

  // Collapsible state for histories
  const [emAndamentoExpanded, setEmAndamentoExpanded] = useState(true);
  const [realizadoExpanded, setRealizadoExpanded] = useState(false);

  // Create form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCodigo, setNewCodigo] = useState("");
  const [newValorAnterior, setNewValorAnterior] = useState("");
  const [newEmpresaAnterior, setNewEmpresaAnterior] = useState<"Online" | "PF">("Online");
  const [newDataAlteracao, setNewDataAlteracao] = useState("");
  const [newMotivoCancelamento, setNewMotivoCancelamento] = useState("");
  const [newMigracaoPara, setNewMigracaoPara] = useState("Elos Rec - 05 dias");
  const [newValorAtual, setNewValorAtual] = useState("");
  const [newProroximoVencimento, setNewProroximoVencimento] = useState("");

  // Edit form state
  const [editingItem, setEditingItem] = useState<CancelamentoBoleto | null>(null);

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodigo || !newValorAnterior || !newDataAlteracao || !newMotivoCancelamento || !newValorAtual || !newProroximoVencimento) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    onAdd({
      codigoCliente: newCodigo,
      valorAnterior: parseFloat(newValorAnterior) || 0,
      empresaAnterior: newEmpresaAnterior,
      dataAlteracao: newDataAlteracao,
      motivoCancelamento: newMotivoCancelamento,
      migracaoPara: newMigracaoPara,
      valorAtual: parseFloat(newValorAtual) || 0,
      proximoVencimento: newProroximoVencimento
    });
    // Reset fields
    setNewCodigo("");
    setNewValorAnterior("");
    setNewEmpresaAnterior("Online");
    setNewDataAlteracao("");
    setNewMotivoCancelamento("");
    setNewMigracaoPara("Elos Rec - 05 dias");
    setNewValorAtual("");
    setNewProroximoVencimento("");
    setShowAddForm(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    onUpdate(editingItem.id, {
      codigoCliente: editingItem.codigoCliente,
      valorAnterior: editingItem.valorAnterior,
      empresaAnterior: editingItem.empresaAnterior,
      dataAlteracao: editingItem.dataAlteracao,
      motivoCancelamento: editingItem.motivoCancelamento,
      migracaoPara: editingItem.migracaoPara,
      valorAtual: editingItem.valorAtual,
      proximoVencimento: editingItem.proximoVencimento
    });
    setEditingItem(null);
  };

  const isVencendoAmanha = (dataStr: string) => {
    return dataStr === "2026-06-06";
  };

  const emAndamento = data.filter(d => d.status === "Pendente");
  const realizado = data.filter(d => d.status === "Completo");

  const filterRecord = (r: CancelamentoBoleto) => {
    return r.codigoCliente.toLowerCase().includes(search.toLowerCase()) ||
           r.motivoCancelamento.toLowerCase().includes(search.toLowerCase());
  };

  const filteredEmAndamento = emAndamento.filter(filterRecord);
  const filteredRealizado = realizado.filter(filterRecord);

  // Diverse options
  const migracaoOptions = [
    "Elos Rec - 05 dias",
    "Elos Rec - 10 dias",
    "Elos Rec - 15 dias",
    "Elos Rec - 20 dias",
    "Elos Rec - 25 dias"
  ];

  return (
    <div id="aba-cancelamento-container" className="flex-1 overflow-y-auto bg-[#050d1a] text-white p-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold font-sans text-white flex items-center gap-2">
            <span className="w-2.5 h-6 bg-red-500 rounded-sm"></span>
            Cancelamento Recorrente → Boleto Bancário
          </h2>
          <p className="text-xs text-[#4a6b8a]">
            Acompanhe a alteração inversa: clientes saindo de assinaturas automáticas recorrentes para boletos faturados por problemas de crédito ou solicitações específicas
          </p>
        </div>

        <button
          id="btn-add-cancelamento"
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-[#00d8ff] to-[#00a2ff] hover:brightness-110 text-white font-bold py-2 px-4 rounded-lg text-xs leading-none transition duration-150 cursor-pointer shadow-[0_2px_15px_rgba(0,216,255,0.2)]"
        >
          <Plus size={15} />
          <span>Novo Cancelamento</span>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-[#0d1b2e] border border-[#1a3a5a] rounded-xl p-4 mb-6">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#4a6b8a]">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Pesquisar por cliente ou motivo (Cancelamento)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#050d1a] border border-[#1a3a5a] hover:border-[#00d8ff]/25 focus:border-[#00d8ff] rounded-lg px-3 py-1.5 pl-9 text-xs text-white placeholder-[#4a6b8a] outline-none transition"
          />
        </div>
      </div>

      {/* Stack structure to show Histórico Em Andamento vs Histórico Realizado (vertical stack) */}
      <div className="flex flex-col gap-8">
        
        {/* EM ANDAMENTO */}
        <div className="space-y-4">
          <button
            onClick={() => setEmAndamentoExpanded(!emAndamentoExpanded)}
            className="w-full flex items-center justify-between border-b border-[#1a3a5a] pb-2 cursor-pointer text-left focus:outline-none select-none group"
          >
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 group-hover:text-[#00d8ff] transition-colors">
              <Clock size={16} className="text-amber-500" />
              Histórico Em Andamento ({filteredEmAndamento.length})
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-mono font-bold">
                Transições em Aberto
              </span>
              {emAndamentoExpanded ? (
                <ChevronUp size={16} className="text-slate-400" />
              ) : (
                <ChevronDown size={16} className="text-slate-400" />
              )}
            </div>
          </button>

          {emAndamentoExpanded && (
            filteredEmAndamento.length === 0 ? (
              <div className="p-8 text-center bg-[#0d1b2e] border border-dashed border-[#1a3a5a] rounded-xl text-xs text-[#4a6b8a]">
                Nenhuma transição inversa para boleto pendente.
              </div>
            ) : (
              <div className="space-y-3 animate-fade-in">
                {filteredEmAndamento.map(item => (
                  <div
                    key={item.id}
                    className={`bg-[#0d1b2e] border p-4 rounded-xl relative overflow-hidden transition ${
                      isVencendoAmanha(item.proximoVencimento)
                        ? "border-red-500/30 bg-red-500/[0.01]"
                        : "border-[#1a3a5a] hover:border-[#00d8ff]/20"
                    }`}
                  >
                    {isVencendoAmanha(item.proximoVencimento) && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white font-black text-[9px] uppercase px-2 py-0.5 tracking-wider rounded-bl-lg animate-pulse flex items-center gap-1">
                        <AlertTriangle size={10} />
                        Vencimento Amanhã
                      </div>
                    )}

                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white font-mono">{item.codigoCliente}</h4>
                        <p className="text-[10px] text-[#4a6b8a] mt-1">Lançado: {item.dataCriacao.split("-").reverse().join("/")}</p>
                      </div>

                      <button
                        id={`btn-complete-can-${item.id}`}
                        onClick={() => onComplete(item.id)}
                        className="bg-[#00d8ff]/10 hover:bg-[#00d8ff] text-[#00d8ff] hover:text-[#050d1a] border border-[#00d8ff]/20 p-1 px-2.5 rounded text-[10.5px] font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Check size={12} />
                        <span>Fatura Emitida</span>
                      </button>
                    </div>

                    {/* Comparisons */}
                    <div className="grid grid-cols-2 gap-4 my-3 bg-[#050d1a]/40 p-2.5 rounded-lg text-xs">
                      <div>
                        <span className="text-[9px] text-[#4a6b8a] uppercase block">Cobrança Web Anterior</span>
                        <p className="text-slate-300 font-medium">{item.empresaAnterior}</p>
                        <p className="font-bold text-slate-400 mt-0.5">R$ {item.valorAnterior.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#4a6b8a] uppercase block">Novo Vencimento Boleto</span>
                        <p className="text-cyan-400 font-medium">{item.migracaoPara}</p>
                        <p className="font-bold text-red-500 mt-0.5">R$ {item.valorAtual.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="text-xs space-y-2 mt-2">
                      <p className="text-slate-300">
                        <span className="text-[#4a6b8a]">Alteração em:</span> <span className="font-mono font-bold text-white">{item.dataAlteracao.split("-").reverse().join("/")}</span>
                      </p>
                      <p className="flex items-center gap-1.5 text-[#4a6b8a]">
                        <Calendar size={13} className="text-[#00d8ff]" />
                        <span>Próxima Data do Faturamento:</span>
                        <span className={`font-mono font-bold ${
                          isVencendoAmanha(item.proximoVencimento) ? "text-red-400" : "text-white"
                        }`}>
                          {item.proximoVencimento.split("-").reverse().join("/")}
                        </span>
                      </p>
                      {item.motivoCancelamento && (
                        <div className="bg-[#050d1a]/30 p-2 rounded text-[10.5px] text-slate-300 border-l border-amber-505/40">
                          <span className="font-bold text-white block mb-0.5">Motivo Relatado:</span>
                          "{item.motivoCancelamento}"
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-[#1a3a5a] text-[11px]">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="text-[#4a6b8a] hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 size={12} /> Editar
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="text-red-400/70 hover:text-red-400 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={12} /> Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* REALIZADO */}
        <div className="space-y-4">
          <button
            onClick={() => setRealizadoExpanded(!realizadoExpanded)}
            className="w-full flex items-center justify-between border-b border-[#1a3a5a] pb-2 cursor-pointer text-left focus:outline-none select-none group"
          >
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 group-hover:text-[#00d8ff] transition-colors">
              <CheckCircle size={16} className="text-[#00d8ff]" />
              Histórico Realizado ({filteredRealizado.length})
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-[#00d8ff]/10 text-[#00d8ff] px-2 py-0.5 rounded font-mono font-bold">
                Alterações Concluídas
              </span>
              {realizadoExpanded ? (
                <ChevronUp size={16} className="text-slate-400" />
              ) : (
                <ChevronDown size={16} className="text-slate-400" />
              )}
            </div>
          </button>

          {realizadoExpanded && (
            filteredRealizado.length === 0 ? (
              <div className="p-8 text-center bg-[#0d1b2e]/40 border border-dashed border-[#1a3a5a] rounded-xl text-xs text-[#4a6b8a]">
                Nenhuma alteração de faturamento liquida no arquivo.
              </div>
            ) : (
              <div className="space-y-3 animate-fade-in">
                {filteredRealizado.map(item => (
                  <div
                    key={item.id}
                    className="bg-[#0d1b2e]/40 border border-[#1a3a5a] p-4 rounded-xl opacity-80 hover:opacity-100 transition relative"
                  >
                    <div className="absolute top-2 right-2 bg-[#00d8ff]/10 border border-[#00d8ff]/20 text-[#00d8ff] text-[9px] uppercase px-2 py-0.5 rounded">
                      Concluído
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white/50 font-mono line-through">{item.codigoCliente}</h4>
                      <p className="text-[10px] text-[#4a6b8a]">Criado: {item.dataCriacao.split("-").reverse().join("/")}</p>
                    </div>

                    <div className="mt-3 text-[10.5px] text-slate-300 space-y-1.5 bg-[#050d1a]/20 p-2 rounded">
                      <p>Substituído por: <span className="text-white font-semibold">{item.migracaoPara} | Valor R$ {item.valorAtual.toFixed(2)}</span></p>
                      <p className="text-amber-500 italic">"{item.motivoCancelamento}"</p>
                      <div className="h-px bg-white/5 my-1"></div>
                      <p className="flex items-center gap-1 text-[#00d8ff]">
                        <CheckCircle size={11} />
                        <span className="text-[#4a6b8a]">Fechado em:</span> <span className="text-white">{item.dataConclusao?.split("-").reverse().join("/")}</span>
                      </p>
                      <p className="text-[9px] text-[#4a6b8a]">Responsável: {item.modificadoPor || "Sistêmico"}</p>
                    </div>

                    {/* Actions buttons */}
                    <div className="flex justify-end gap-2 mt-3 pt-2.5 border-t border-white/5 text-[11px]">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="text-[#4a6b8a] hover:text-white flex items-center gap-1 transition cursor-pointer"
                      >
                        <Edit2 size={12} /> Editar
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="text-red-400/70 hover:text-red-400 flex items-center gap-1 transition cursor-pointer"
                      >
                        <Trash2 size={12} /> Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

      </div>

      {/* MODAL: ADD */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#051430] border border-[#00f0ff]/20 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-[#001435] border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Novo Registro de Cancelamento Recorrente</h3>
              <button onClick={() => setShowAddForm(false)} className="text-white/40 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} className="p-5 space-y-3 text-xs">
              <div>
                <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Código do Cliente *</label>
                <input
                  type="text"
                  required
                  placeholder="EX: DP-09881"
                  value={newCodigo}
                  onChange={(e) => setNewCodigo(e.target.value)}
                  className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Empresa Anterior *</label>
                  <select
                    value={newEmpresaAnterior}
                    onChange={(e) => setNewEmpresaAnterior(e.target.value as any)}
                    className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none"
                  >
                    <option value="PF">PF</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Valor Anterior (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="120.00"
                    value={newValorAnterior}
                    onChange={(e) => setNewValorAnterior(e.target.value)}
                    className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Data da Alteração *</label>
                  <input
                    type="date"
                    required
                    value={newDataAlteracao}
                    onChange={(e) => setNewDataAlteracao(e.target.value)}
                    onClick={(e) => { try { e.currentTarget.showPicker(); } catch (err) {} }}
                    className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Migração Para *</label>
                  <select
                    value={newMigracaoPara}
                    onChange={(e) => setNewMigracaoPara(e.target.value)}
                    className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none"
                  >
                    {migracaoOptions.map(e => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Valor Atual (Boleto) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="135.00"
                    value={newValorAtual}
                    onChange={(e) => setNewValorAtual(e.target.value)}
                    className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Próximo Vencimento *</label>
                  <input
                    type="date"
                    required
                    value={newProroximoVencimento}
                    onChange={(e) => setNewProroximoVencimento(e.target.value)}
                    onClick={(e) => { try { e.currentTarget.showPicker(); } catch (err) {} }}
                    className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Motivo do Cancelamento *</label>
                <textarea
                  required
                  placeholder="Justifique o motivo detalhado pelo qual o cliente solicitou faturamento por boleto..."
                  value={newMotivoCancelamento}
                  onChange={(e) => setNewMotivoCancelamento(e.target.value)}
                  className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white h-16 resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-white/5 hover:bg-white/10 text-[#b4c6ef] px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#00f0ff] to-[#0070f3] text-white font-bold px-4 py-1.5 rounded-lg cursor-pointer"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#051430] border border-[#00f0ff]/20 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-[#001435] border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Editar Cancelamento</h3>
              <button onClick={() => setEditingItem(null)} className="text-white/40 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-5 space-y-3 text-xs">
              <div>
                <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Código do Cliente</label>
                <input
                  type="text"
                  required
                  value={editingItem.codigoCliente}
                  onChange={(e) => setEditingItem({ ...editingItem, codigoCliente: e.target.value })}
                  className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Empresa Anterior</label>
                  <select
                    value={editingItem.empresaAnterior}
                    onChange={(e) => setEditingItem({ ...editingItem, empresaAnterior: e.target.value as any })}
                    className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none"
                  >
                    <option value="Online">Online</option>
                    <option value="PF">PF</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Valor Anterior</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingItem.valorAnterior}
                    onChange={(e) => setEditingItem({ ...editingItem, valorAnterior: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Data da Alteração</label>
                  <input
                    type="date"
                    required
                    value={editingItem.dataAlteracao}
                    onChange={(e) => setEditingItem({ ...editingItem, dataAlteracao: e.target.value })}
                    onClick={(e) => { try { e.currentTarget.showPicker(); } catch (err) {} }}
                    className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Migração Para</label>
                  <select
                    value={editingItem.migracaoPara}
                    onChange={(e) => setEditingItem({ ...editingItem, migracaoPara: e.target.value })}
                    className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none"
                  >
                    {migracaoOptions.map(e => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Valor Atual</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingItem.valorAtual}
                    onChange={(e) => setEditingItem({ ...editingItem, valorAtual: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Próximo Vencimento</label>
                  <input
                    type="date"
                    required
                    value={editingItem.proximoVencimento}
                    onChange={(e) => setEditingItem({ ...editingItem, proximoVencimento: e.target.value })}
                    onClick={(e) => { try { e.currentTarget.showPicker(); } catch (err) {} }}
                    className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Motivo do Cancelamento</label>
                <textarea
                  required
                  value={editingItem.motivoCancelamento}
                  onChange={(e) => setEditingItem({ ...editingItem, motivoCancelamento: e.target.value })}
                  className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white h-16 resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="bg-white/5 hover:bg-white/10 text-[#b4c6ef] px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#00f0ff] text-[#001435] font-bold px-4 py-1.5 rounded-lg cursor-pointer hover:brightness-110"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
