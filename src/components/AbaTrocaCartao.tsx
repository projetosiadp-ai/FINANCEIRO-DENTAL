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
  CreditCard,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { TrocaCartao } from "../types";

interface AbaTrocaCartaoProps {
  data: TrocaCartao[];
  onAdd: (registro: { codigoCliente: string; dataVencimentoParcela: string }) => void;
  onUpdate: (id: string, updates: Partial<TrocaCartao>) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  currentUserEmail: string;
}

export default function AbaTrocaCartao({
  data,
  onAdd,
  onUpdate,
  onDelete,
  onComplete,
  currentUserEmail
}: AbaTrocaCartaoProps) {
  const [search, setSearch] = useState("");

  // Collapsible state for histories
  const [emAndamentoExpanded, setEmAndamentoExpanded] = useState(true);
  const [realizadoExpanded, setRealizadoExpanded] = useState(false);

  // Create form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCodigo, setNewCodigo] = useState("");
  const [newDataVencimento, setNewDataVencimento] = useState("");

  // Edit form state
  const [editingItem, setEditingItem] = useState<TrocaCartao | null>(null);

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodigo || !newDataVencimento) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    onAdd({
      codigoCliente: newCodigo,
      dataVencimentoParcela: newDataVencimento
    });
    setNewCodigo("");
    setNewDataVencimento("");
    setShowAddForm(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    onUpdate(editingItem.id, {
      codigoCliente: editingItem.codigoCliente,
      dataVencimentoParcela: editingItem.dataVencimentoParcela
    });
    setEditingItem(null);
  };

  const isVencendoAmanha = (dataStr: string) => {
    return dataStr === "2026-06-06";
  };

  const emAndamento = data.filter(d => d.status === "Pendente");
  const realizado = data.filter(d => d.status === "Completo");

  const filteredEmAndamento = emAndamento.filter(r =>
    r.codigoCliente.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRealizado = realizado.filter(r =>
    r.codigoCliente.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div id="aba-troca-cartao-container" className="flex-1 overflow-y-auto bg-[#050d1a] text-white p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold font-sans text-white flex items-center gap-2">
            <span className="w-2.5 h-6 bg-amber-500 rounded-sm"></span>
            Troca de Cartão de Crédito
          </h2>
          <p className="text-xs text-[#4a6b8a]">
            Gerencie e acompanhe faturas que necessitam da troca de bandeira, atualização de cartão vencido ou novo token de débito recorrente
          </p>
        </div>

        <button
          id="btn-add-troca"
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-[#00d8ff] to-[#00a2ff] hover:brightness-110 text-white font-bold py-2 px-4 rounded-lg text-xs leading-none transition duration-150 cursor-pointer shadow-[0_2px_15px_rgba(0,216,255,0.2)]"
        >
          <Plus size={15} />
          <span>Nova Troca</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#0d1b2e] border border-[#1a3a5a] rounded-xl p-4 mb-6">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#4a6b8a]">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Pesquisar por código de cliente para troca..."
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
              <Clock size={16} className="text-amber-400" />
              Histórico Em Andamento ({filteredEmAndamento.length})
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-mono font-bold">
                Substituições Pendentes
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
                Nenhuma troca de cartão pendente.
              </div>
            ) : (
              <div className="space-y-3 animate-fade-in">
                {filteredEmAndamento.map(item => (
                  <div
                    key={item.id}
                    className={`bg-[#0d1b2e] border p-4 rounded-xl relative overflow-hidden transition ${
                      isVencendoAmanha(item.dataVencimentoParcela)
                        ? "border-red-500/30 bg-red-500/[0.01]"
                        : "border-[#1a3a5a] hover:border-[#00d8ff]/20"
                    }`}
                  >
                    {isVencendoAmanha(item.dataVencimentoParcela) && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white font-black text-[9px] uppercase px-2 py-0.5 tracking-wider rounded-bl-lg animate-pulse flex items-center gap-1">
                        <AlertTriangle size={10} />
                        Vence Amanhã
                      </div>
                    )}

                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                          <CreditCard size={14} className="text-[#00d8ff]" />
                          {item.codigoCliente}
                        </h4>
                        <p className="text-[10px] text-[#4a6b8a] mt-1">Lançado em: {item.dataCriacao.split("-").reverse().join("/")}</p>
                      </div>

                      <button
                        id={`btn-complete-troca-${item.id}`}
                        onClick={() => onComplete(item.id)}
                        className="bg-[#00d8ff]/10 hover:bg-[#00d8ff] text-[#00d8ff] hover:text-[#050d1a] border border-[#00d8ff]/20 p-1 px-2.5 rounded text-[10.5px] font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Check size={12} />
                        <span>Concluir Troca</span>
                      </button>
                    </div>

                    <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-300">
                      <Calendar size={13} className="text-[#00d8ff]" />
                      <span className="text-[#4a6b8a]">Prazo Limite / Vencimento da Parcela:</span>
                      <span className={`font-mono font-bold ${
                        isVencendoAmanha(item.dataVencimentoParcela) ? "text-red-400" : "text-white"
                      }`}>
                        {item.dataVencimentoParcela.split("-").reverse().join("/")}
                      </span>
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

        {/* HISTÓRICO REALIZADO */}
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
                Substituições Auditadas
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
                Nenhum histórico concluído.
              </div>
            ) : (
              <div className="space-y-3 animate-fade-in">
                {filteredRealizado.map(item => (
                  <div
                    key={item.id}
                    className="bg-[#0d1b2e]/40 border border-[#1a3a5a] p-4 rounded-xl opacity-80 hover:opacity-100 transition relative"
                  >
                    <div className="absolute top-2 right-2 bg-[#00d8ff]/10 border border-[#00d8ff]/20 text-[#00d8ff] text-[9px] uppercase px-1.5 py-0.5 rounded">
                      Concluído
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white/70 font-mono line-through">{item.codigoCliente}</h4>
                      <p className="text-[10px] text-[#4a6b8a]">Criado: {item.dataCriacao.split("-").reverse().join("/")}</p>
                    </div>

                    <div className="mt-3 text-[10.5px] text-[#4a6b8a] space-y-1">
                      <p>Parcela original venceria em: <span className="text-white font-mono">{item.dataVencimentoParcela.split("-").reverse().join("/")}</span></p>
                      <p className="flex items-center gap-1 text-[#00d8ff] font-medium">
                        <CheckCircle size={11} />
                        <span className="text-[#4a6b8a]">Cartão atualizado em:</span> <span className="text-white font-semibold">{item.dataConclusao?.split("-").reverse().join("/") || "05/06/2026"}</span>
                      </p>
                      <p className="text-[9px] italic text-[#4a6b8a]">Operador: {item.modificadoPor || "Sistêmico"}</p>
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

      {/* FORM: ADD */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#051430] border border-[#00f0ff]/20 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-[#001435] border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Novo Token de Troca de Cartão</h3>
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
                  placeholder="DP-14002"
                  value={newCodigo}
                  onChange={(e) => setNewCodigo(e.target.value)}
                  className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div>
                <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Data Vencimento da Parcela *</label>
                <input
                  type="date"
                  required
                  value={newDataVencimento}
                  onChange={(e) => setNewDataVencimento(e.target.value)}
                  onClick={(e) => { try { e.currentTarget.showPicker(); } catch (err) {} }}
                  className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00f0ff] cursor-pointer"
                />
                <p className="text-[10px] text-cyan-400 mt-1">Dica: escolha data 06/06/2026 para disparar o aviso de amanhã!</p>
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
                  className="bg-gradient-to-r from-[#00f0ff] to-[#0070f3] text-white font-bold px-4 py-1.5 rounded-lg cursor-pointer animate-pulse"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FORM: EDIT */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#051430] border border-[#00f0ff]/20 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-[#001435] border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Editar Registro de Troca</h3>
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

              <div>
                <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Data Vencimento da Parcela</label>
                <input
                  type="date"
                  required
                  value={editingItem.dataVencimentoParcela}
                  onChange={(e) => setEditingItem({ ...editingItem, dataVencimentoParcela: e.target.value })}
                  onClick={(e) => { try { e.currentTarget.showPicker(); } catch (err) {} }}
                  className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none cursor-pointer"
                />
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
                  className="bg-[#00f0ff] hover:brightness-110 text-[#001435] font-bold px-4 py-1.5 rounded-lg cursor-pointer"
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
