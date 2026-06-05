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
  Building2,
  ListFilter,
  FileClock,
  History,
  CornerDownRight,
  UserCheck,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { ControlePJ } from "../types";

interface AbaControlePJProps {
  data: ControlePJ[];
  onAdd: (registro: {
    codigoCliente: string;
    dataContratacao: string;
    formaPagamentoP1: "Elos Rec" | "PIX" | "Boleto";
    dataProximaParcela: string;
  }) => void;
  onUpdate: (id: string, updates: Partial<ControlePJ> & { logMsg?: string }) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  currentUserEmail: string;
}

export default function AbaControlePJ({
  data,
  onAdd,
  onUpdate,
  onDelete,
  onComplete,
  currentUserEmail
}: AbaControlePJProps) {
  const [search, setSearch] = useState("");
  const [filtroPagamento, setFiltroPagamento] = useState("Todos");

  // Collapsible state for histories
  const [emAndamentoExpanded, setEmAndamentoExpanded] = useState(true);
  const [realizadoExpanded, setRealizadoExpanded] = useState(false);

  // Create form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCodigo, setNewCodigo] = useState("");
  const [newDataContratacao, setNewDataContratacao] = useState("");
  const [newFormaPagamento, setNewFormaPagamento] = useState<"Elos Rec" | "PIX" | "Boleto">("Elos Rec");
  const [newDataProxima, setNewDataProxima] = useState("");

  // Edit form state
  const [editingItem, setEditingItem] = useState<ControlePJ | null>(null);
  
  // UI helper state to show historical logs list of a row
  const [expandedHistories, setExpandedHistories] = useState<Record<string, boolean>>({});

  const toggleHistory = (id: string) => {
    setExpandedHistories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodigo || !newDataContratacao || !newDataProxima) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    onAdd({
      codigoCliente: newCodigo,
      dataContratacao: newDataContratacao,
      formaPagamentoP1: newFormaPagamento,
      dataProximaParcela: newDataProxima
    });
    setNewCodigo("");
    setNewDataContratacao("");
    setNewFormaPagamento("Elos Rec");
    setNewDataProxima("");
    setShowAddForm(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    // Detect changed items for log audit
    const original = data.find(x => x.id === editingItem.id);
    const changes: string[] = [];
    if (original) {
      if (original.codigoCliente !== editingItem.codigoCliente) {
        changes.push(`Código de ${original.codigoCliente} para ${editingItem.codigoCliente}`);
      }
      if (original.formaPagamentoP1 !== editingItem.formaPagamentoP1) {
        changes.push(`Forma P1 de ${original.formaPagamentoP1} para ${editingItem.formaPagamentoP1}`);
      }
      if (original.dataProximaParcela !== editingItem.dataProximaParcela) {
        changes.push(`Vencimento de ${original.dataProximaParcela} para ${editingItem.dataProximaParcela}`);
      }
    }
    
    const logDate = new Date().toISOString().replace("T", " ").substring(0, 16);
    const logMsg = changes.length > 0 
      ? `${logDate} - Editado por ${currentUserEmail}. Alterado: ${changes.join(", ")}`
      : `${logDate} - Salvo sem alterações cadastrais por ${currentUserEmail}`;

    onUpdate(editingItem.id, {
      codigoCliente: editingItem.codigoCliente,
      dataContratacao: editingItem.dataContratacao,
      formaPagamentoP1: editingItem.formaPagamentoP1,
      dataProximaParcela: editingItem.dataProximaParcela,
      logMsg
    });
    setEditingItem(null);
  };

  const isVencendoAmanha = (dataStr: string) => {
    return dataStr === "2026-06-06";
  };

  const emAndamento = data.filter(d => d.status === "Pendente");
  const realizado = data.filter(d => d.status === "Completo");

  // Filtering lists
  const filterRecord = (r: ControlePJ) => {
    const matchesSearch = r.codigoCliente.toLowerCase().includes(search.toLowerCase());
    const matchesPagamento = filtroPagamento === "Todos" || r.formaPagamentoP1 === filtroPagamento;
    return matchesSearch && matchesPagamento;
  };

  const filteredEmAndamento = emAndamento.filter(filterRecord);
  const filteredRealizado = realizado.filter(filterRecord);

  return (
    <div id="aba-controle-pj-container" className="flex-1 overflow-y-auto bg-[#050d1a] text-white p-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold font-sans text-white flex items-center gap-2">
            <span className="w-2.5 h-6 bg-[#00a2ff] rounded-sm"></span>
            Controle Financeiro PJ (Pessoa Jurídica)
          </h2>
          <p className="text-xs text-[#4a6b8a]">
            Acompanhamento de longo prazo de contratos corporativos odontológicos, de acordo com o pagamento da primeira parcela (P1) e cronograma recorrente
          </p>
        </div>

        <button
          id="btn-add-pj"
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-[#00d8ff] to-[#00a2ff] hover:brightness-110 text-white font-bold py-2 px-4 rounded-lg text-xs leading-none transition duration-150 cursor-pointer shadow-[0_2px_15px_rgba(0,162,255,0.2)]"
        >
          <Plus size={15} />
          <span>Novo Contrato PJ</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#0d1b2e] border border-[#1a3a5a] rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#4a6b8a]">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Pesquisar por CNPJ / Código do Cliente corporativo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#050d1a] border border-[#1a3a5a] hover:border-[#00d8ff]/20 focus:border-[#00d8ff] rounded-lg px-3 py-1.5 pl-9 text-xs text-white placeholder-[#4a6b8a] outline-none transition"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#4a6b8a] shrink-0">Opção P1:</span>
          <select
            value={filtroPagamento}
            onChange={(e) => setFiltroPagamento(e.target.value)}
            className="bg-[#050d1a] border border-[#1a3a5a] hover:border-[#00d8ff]/10 rounded px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer"
          >
            <option value="Todos font-sans">Todos</option>
            <option value="Elos Rec">Elos Recorrente</option>
            <option value="PIX">PIX</option>
            <option value="Boleto">Boleto</option>
          </select>
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
                Parcelas Aberta
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
                Nenhum contrato corporativo com parcelas pendentes.
              </div>
            ) : (
              <div className="space-y-3 animate-fade-in">
                {filteredEmAndamento.map(item => (
                  <div
                    key={item.id}
                    className={`bg-[#0d1b2e] border p-4 rounded-xl relative overflow-hidden transition ${
                      isVencendoAmanha(item.dataProximaParcela)
                        ? "border-red-500/30 bg-red-500/[0.01]"
                        : "border-[#1a3a5a] hover:border-[#00d8ff]/20 animate-fade-in"
                    }`}
                  >
                    {isVencendoAmanha(item.dataProximaParcela) && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white font-black text-[9px] uppercase px-2 py-0.5 tracking-wider rounded-bl-lg animate-pulse flex items-center gap-1">
                        <AlertTriangle size={10} />
                        Vence Amanhã
                      </div>
                    )}

                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                          <Building2 size={14} className="text-[#00d8ff]" />
                          {item.codigoCliente}
                        </h4>
                        <p className="text-[10px] text-[#4a6b8a] mt-1">
                          Assinado em: {item.dataContratacao.split("-").reverse().join("/")}
                        </p>
                      </div>

                      <button
                        id={`btn-complete-pj-${item.id}`}
                        onClick={() => onComplete(item.id)}
                        className="bg-[#00d8ff]/10 hover:bg-[#00d8ff] text-[#00d8ff] hover:text-[#050d1a] border border-[#00d8ff]/20 p-1 px-2.5 rounded text-[10.5px] font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Check size={12} />
                        <span>Concluir Parcela</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 my-3 bg-[#050d1a]/40 p-2 rounded-lg text-xs">
                      <div>
                        <span className="text-[9px] text-[#4a6b8a] block uppercase">Forma de Pagamento P1</span>
                        <span className="text-[#00d8ff] font-bold">{item.formaPagamentoP1}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#4a6b8a] block uppercase">Próxima Parcela</span>
                        <span className={`font-mono font-bold ${
                          isVencendoAmanha(item.dataProximaParcela) ? "text-red-400" : "text-white"
                        }`}>
                          {item.dataProximaParcela.split("-").reverse().join("/")}
                        </span>
                      </div>
                    </div>

                    {/* LONG-TERM AUDIT LOG DISPLAY TIMELINE */}
                    <div className="mt-2 text-xs">
                      <button
                        onClick={() => toggleHistory(item.id)}
                        className="text-[#4a6b8a] hover:text-[#00d8ff] flex items-center gap-1 text-[11px] font-semibold cursor-pointer mb-1.5"
                      >
                        <History size={12} />
                        <span>
                          {expandedHistories[item.id] ? "Ocultar Histórico de Alterações" : "Ver Histórico de Alterações"} ({item.historicoModificacoes?.length || 0})
                        </span>
                      </button>

                      {expandedHistories[item.id] && (
                        <div className="bg-[#050d1a]/60 border border-[#1a3a5a] p-2 rounded max-h-36 overflow-y-auto space-y-1.5 animate-slide-down">
                          {item.historicoModificacoes && item.historicoModificacoes.length > 0 ? (
                            item.historicoModificacoes.map((log, lIdx) => (
                              <div key={lIdx} className="flex items-start gap-1 text-[10px] text-slate-300 leading-relaxed border-b border-[#1a3a5a] pb-1 last:border-0">
                                <CornerDownRight size={10} className="text-[#00d8ff] mt-1 shrink-0" />
                                <span>{log}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] text-[#4a6b8a] italic">Sem logs anteriores cadastrados.</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-[#1a3a5a] text-[11px]">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="text-[#4a6b8a] hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 size={12} /> Editar Contrato
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
                Contratos Consolidados
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
                Nenhum histórico corporativo arquivado nesta aba.
              </div>
            ) : (
              <div className="space-y-3 animate-fade-in">
                {filteredRealizado.map(item => (
                  <div
                    key={item.id}
                    className="bg-[#0d1b2e]/40 border border-[#1a3a5a] p-4 rounded-xl opacity-80 hover:opacity-100 transition relative"
                  >
                    <div className="absolute top-2 right-2 bg-[#00d8ff]/10 border border-[#00d8ff]/20 text-[#00d8ff] text-[9px] uppercase px-2 py-0.5 rounded">
                      Completo
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white/50 font-mono line-through">{item.codigoCliente}</h4>
                      <p className="text-[10px] text-[#4a6b8a]">Criado: {item.dataCriacao.split("-").reverse().join("/")}</p>
                    </div>

                    <div className="mt-3 text-[10.5px] text-[#4a6b8a] space-y-2">
                      <p>Forma de Pagamento: <span className="text-white font-semibold">{item.formaPagamentoP1}</span></p>
                      <p className="flex items-center gap-1 text-[#00d8ff]">
                        <CheckCircle size={11} />
                        <span className="text-[#4a6b8a]">Consolidado em:</span> <span className="text-white">{item.dataConclusao?.split("-").reverse().join("/")}</span>
                      </p>

                      <button
                        onClick={() => toggleHistory(item.id)}
                        className="text-[10.5px] text-[#4a6b8a] hover:text-white underline cursor-pointer"
                      >
                        {expandedHistories[item.id] ? "Ocultar Historial Completo" : "Exibir Historial Completo"}
                      </button>

                      {expandedHistories[item.id] && (
                        <div className="bg-[#050d1a]/30 border border-[#1a3a5a] p-2 rounded mt-1.5 space-y-1">
                          {item.historicoModificacoes?.map((log, lIdx) => (
                            <p key={lIdx} className="text-[10px] text-[#4a6b8a]">{log}</p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions buttons */}
                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-[#1a3a5a] text-[11px]">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="text-[#4a6b8a] hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 size={12} /> Editar Contrato
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

      </div>

      {/* MODAL: ADD */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#051430] border border-[#00f0ff]/20 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-[#001435] border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Novo Cadastro Corporativo PJ</h3>
              <button onClick={() => setShowAddForm(false)} className="text-white/40 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} className="p-5 space-y-3 text-xs">
              <div>
                <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Código PJ / CNPJ / Cliente *</label>
                <input
                  type="text"
                  required
                  placeholder="EX: PJ-50882"
                  value={newCodigo}
                  onChange={(e) => setNewCodigo(e.target.value)}
                  className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div>
                <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Data da Contratação *</label>
                <input
                  type="date"
                  required
                  value={newDataContratacao}
                  onChange={(e) => setNewDataContratacao(e.target.value)}
                  onClick={(e) => { try { e.currentTarget.showPicker(); } catch (err) {} }}
                  className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00f0ff] cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Forma de Pagamento da P1 *</label>
                <select
                  value={newFormaPagamento}
                  onChange={(e) => setNewFormaPagamento(e.target.value as any)}
                  className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none cursor-pointer"
                >
                  <option value="Elos Rec">Elos Recorrente</option>
                  <option value="PIX">PIX</option>
                  <option value="Boleto">Boleto Bancário</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Data da Próxima Parcela *</label>
                <input
                  type="date"
                  required
                  value={newDataProxima}
                  onChange={(e) => setNewDataProxima(e.target.value)}
                  onClick={(e) => { try { e.currentTarget.showPicker(); } catch (err) {} }}
                  className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00f0ff] cursor-pointer"
                />
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
                  className="bg-[#00a2ff] text-white font-bold px-4 py-1.5 rounded-lg cursor-pointer"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#051430] border border-[#00f0ff]/20 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-[#001435] border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Editar Contrato PJ</h3>
              <button onClick={() => setEditingItem(null)} className="text-white/40 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-5 space-y-3 text-xs">
              <div>
                <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Código PJ / CNPJ</label>
                <input
                  type="text"
                  required
                  value={editingItem.codigoCliente}
                  onChange={(e) => setEditingItem({ ...editingItem, codigoCliente: e.target.value })}
                  className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div>
                <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Data da Contratação</label>
                <input
                  type="date"
                  required
                  value={editingItem.dataContratacao}
                  onChange={(e) => setEditingItem({ ...editingItem, dataContratacao: e.target.value })}
                  onClick={(e) => { try { e.currentTarget.showPicker(); } catch (err) {} }}
                  className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Forma de Pagamento da P1</label>
                <select
                  value={editingItem.formaPagamentoP1}
                  onChange={(e) => setEditingItem({ ...editingItem, formaPagamentoP1: e.target.value as any })}
                  className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none cursor-pointer"
                >
                  <option value="Elos Rec">Elos Recorrente</option>
                  <option value="PIX">PIX</option>
                  <option value="Boleto">Boleto Bancário</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Data da Próxima Parcela</label>
                <input
                  type="date"
                  required
                  value={editingItem.dataProximaParcela}
                  onChange={(e) => setEditingItem({ ...editingItem, dataProximaParcela: e.target.value })}
                  onClick={(e) => { try { e.currentTarget.showPicker(); } catch (err) {} }}
                  className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00f0ff] cursor-pointer"
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
                  className="bg-[#00a2ff] text-white font-bold px-4 py-1.5 rounded-lg cursor-pointer"
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
