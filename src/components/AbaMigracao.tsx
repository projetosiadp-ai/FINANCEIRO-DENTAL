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
  Filter,
  Check,
  X,
  AlertTriangle,
  History,
  TrendingDown,
  Info,
  Calendar,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { MigracaoElos, StatusRegistro } from "../types";

interface AbaMigracaoProps {
  data: MigracaoElos[];
  onAdd: (registro: Omit<MigracaoElos, "id" | "dataCriacao" | "status">) => void;
  onUpdate: (id: string, updates: Partial<MigracaoElos>) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  currentUserEmail: string;
}

export default function AbaMigracao({
  data,
  onAdd,
  onUpdate,
  onDelete,
  onComplete,
  currentUserEmail
}: AbaMigracaoProps) {
  const [search, setSearch] = useState("");
  const [empresaFiltro, setEmpresaFiltro] = useState("Todas");

  // Collapsible state for histories
  const [emAndamentoExpanded, setEmAndamentoExpanded] = useState(true);
  const [realizadoExpanded, setRealizadoExpanded] = useState(false);
  
  // Create state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCodigo, setNewCodigo] = useState("");
  const [newEmpresaAnterior, setNewEmpresaAnterior] = useState<"PF" | "Online">("PF");
  const [newValorAnterior, setNewValorAnterior] = useState("");
  const [newEmpresaAtual, setNewEmpresaAtual] = useState("Elos Rec 01");
  const [newValorAtual, setNewValorAtual] = useState("");
  const [newProximaParcela, setNewProximaParcela] = useState("");
  const [newPremiacao, setNewPremiacao] = useState("");

  // Edit state
  const [editingItem, setEditingItem] = useState<MigracaoElos | null>(null);

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodigo || !newValorAnterior || !newValorAtual || !newProximaParcela) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    onAdd({
      codigoCliente: newCodigo,
      empresaAnterior: newEmpresaAnterior,
      valorAnterior: parseFloat(newValorAnterior) || 0,
      empresaAtual: newEmpresaAtual,
      valorAtual: parseFloat(newValorAtual) || 0,
      proximaParcela: newProximaParcela,
      premiacao: newPremiacao
    });
    // Reset
    setNewCodigo("");
    setNewValorAnterior("");
    setNewEmpresaAtual("Elos Rec 01");
    setNewValorAtual("");
    setNewProximaParcela("");
    setNewPremiacao("");
    setShowAddForm(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    onUpdate(editingItem.id, {
      codigoCliente: editingItem.codigoCliente,
      empresaAnterior: editingItem.empresaAnterior,
      valorAnterior: editingItem.valorAnterior,
      empresaAtual: editingItem.empresaAtual,
      valorAtual: editingItem.valorAtual,
      proximaParcela: editingItem.proximaParcela,
      premiacao: editingItem.premiacao
    });
    setEditingItem(null);
  };

  // Check if expiration is exactly 2026-06-06 (Tomorrow)
  const isVencendoAmanha = (dataStr: string) => {
    return dataStr === "2026-06-06";
  };

  const emAndamento = data.filter(d => d.status === "Pendente");
  const realizado = data.filter(d => d.status === "Completo");

  // Filtering lists
  const filterRecord = (r: MigracaoElos) => {
    const matchesSearch = r.codigoCliente.toLowerCase().includes(search.toLowerCase()) || 
                          r.premiacao.toLowerCase().includes(search.toLowerCase());
    const matchesEmpresa = empresaFiltro === "Todas" || 
                           r.empresaAnterior === empresaFiltro || 
                           r.empresaAtual === empresaFiltro;
    return matchesSearch && matchesEmpresa;
  };

  const filteredEmAndamento = emAndamento.filter(filterRecord);
  const filteredRealizado = realizado.filter(filterRecord);

  const empresasOptions = ["Elos Rec 01", "Elos Rec 02", "Elos Rec 03", "Elos Rec 04", "Elos Rec - 05 dias", "Elos Rec - 10 dias", "Elos Rec - 15 dias"];

  return (
    <div id="aba-migracao-container" className="flex-1 overflow-y-auto bg-[#050d1a] text-white p-6">
      
      {/* Tab Header with Page Context */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold font-sans text-white flex items-center gap-2">
            <span className="w-2.5 h-6 bg-[#00d8ff] rounded-sm"></span>
            Migração de Cobrança: Boleto → Cartão Elos
          </h2>
          <p className="text-xs text-[#4a6b8a]">
            Acompanhe a substituição de canais de pagamento de clientes antigos para o formato débito recorrente Elos
          </p>
        </div>

        <button
          id="btn-add-migracao"
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-[#00d8ff] to-[#00a2ff] hover:brightness-110 text-white font-bold py-2 px-4 rounded-lg text-xs leading-none transition-all duration-150 cursor-pointer shadow-[0_2px_15px_rgba(0,216,255,0.2)]"
        >
          <Plus size={15} />
          <span>Nova Migração</span>
        </button>
      </div>

      {/* Internal Filtering Tools */}
      <div className="bg-[#0d1b2e] border border-[#1a3a5a] rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#4a6b8a]">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Pesquisar por cliente ou premiação..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#050d1a] border border-[#1a3a5a] hover:border-[#00d8ff]/20 focus:border-[#00d8ff] rounded-lg px-3 py-1.5 pl-9 text-xs text-white placeholder-[#4a6b8a] outline-none transition"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#4a6b8a] shrink-0">Empresa:</span>
          <select
            value={empresaFiltro}
            onChange={(e) => setEmpresaFiltro(e.target.value)}
            className="bg-[#050d1a] border border-[#1a3a5a] hover:border-[#00d8ff]/20 rounded px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer"
          >
            <option value="Todas">Todas</option>
            <option value="PF">PF</option>
            <option value="Online">Online</option>
            {empresasOptions.map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stack structure to show Histórico Em Andamento vs Histórico Realizado (vertical stack) */}
      <div className="flex flex-col gap-8">
        
        {/* VIEW 1: HISTÓRICO EM ANDAMENTO */}
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
                Pendentes de Envio
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
                Nenhuma migração em andamento nesta pesquisa.
              </div>
            ) : (
              <div className="space-y-3 animate-fade-in">
                {filteredEmAndamento.map(item => (
                  <div
                    key={item.id}
                    className={`bg-[#0d1b2e] border p-4 rounded-xl relative overflow-hidden transition ${
                      isVencendoAmanha(item.proximaParcela)
                        ? "border-red-500/30 bg-red-500/[0.01]"
                        : "border-[#1a3a5a] hover:border-[#00d8ff]/200 animate-fade-in"
                    }`}
                  >
                    {isVencendoAmanha(item.proximaParcela) && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white font-black text-[9px] uppercase px-2.5 py-0.5 tracking-wider rounded-bl-lg animate-pulse flex items-center gap-1">
                        <AlertTriangle size={10} />
                        Amanhã
                      </div>
                    )}

                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white font-mono">{item.codigoCliente}</h4>
                        <p className="text-[10.5px] text-[#4a6b8a] mt-0.5">Criado em: {item.dataCriacao.split("-").reverse().join("/")}</p>
                      </div>
                      
                      {/* Send manual verification completion trigger */}
                      <button
                        id={`btn-complete-mig-${item.id}`}
                        onClick={() => onComplete(item.id)}
                        className="bg-[#00d8ff]/10 hover:bg-[#00d8ff] text-[#00d8ff] hover:text-[#050d1a] border border-[#00d8ff]/20 p-1.5 px-2.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Check size={13} />
                        <span>Envio Realizado</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 my-3 bg-[#050d1a]/50 p-2.5 rounded-lg text-xs">
                      <div>
                        <span className="text-[10px] text-[#4a6b8a] block uppercase tracking-tight">Formato Boleto</span>
                        <p className="text-slate-300 font-medium">{item.empresaAnterior}</p>
                        <p className="text-red-400 font-bold mt-0.5">R$ {item.valorAnterior.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#4a6b8a] block uppercase tracking-tight">Recorrente Elos</span>
                        <p className="text-[#00d8ff] font-medium">{item.empresaAtual}</p>
                        <p className="text-[#00d8ff] font-bold mt-0.5">R$ {item.valorAtual.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="text-xs space-y-2 mt-2">
                      <div className="flex items-center gap-1 text-slate-300">
                        <Calendar size={13} className="text-[#00d8ff]" />
                        <span className="text-[#4a6b8a]">Data do Próximo Vencimento:</span>
                        <span className={`font-mono font-bold ${
                          isVencendoAmanha(item.proximaParcela) ? "text-red-400" : "text-white"
                        }`}>
                          {item.proximaParcela.split("-").reverse().join("/")}
                        </span>
                      </div>
                      {item.premiacao && (
                        <div className="bg-[#050d1a]/30 p-2 rounded text-[11px] text-slate-300 leading-relaxed italic border-l-2 border-[#1a3a5a]">
                          "{item.premiacao}"
                        </div>
                      )}
                    </div>

                    {/* Actions buttons */}
                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-[#1a3a5a] text-[11px]">
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

        {/* VIEW 2: HISTÓRICO REALIZADO (READ ONLY AUDIT) */}
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
                Auditorias Arquivadas
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
                Nenhuma migração concluída arquivada no sistema ainda.
              </div>
            ) : (
              <div className="space-y-3 animate-fade-in">
                {filteredRealizado.map(item => (
                  <div
                    key={item.id}
                    className="bg-[#0d1b2e]/50 border border-[#1a3a5a] p-4 rounded-xl relative opacity-85 hover:opacity-100 transition"
                  >
                    <div className="absolute top-2 right-2 bg-[#00d8ff]/10 border border-[#00d8ff]/20 text-[#00d8ff] font-mono text-[9px] uppercase px-2 py-0.5 rounded flex items-center gap-0.5">
                      Concluído
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white/80 font-mono italic line-through">{item.codigoCliente}</h4>
                      <p className="text-[10.5px] text-[#4a6b8a] mt-0.5">Criado em: {item.dataCriacao.split("-").reverse().join("/")}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 my-2.5 bg-[#050d1a]/30 p-2 rounded text-xs opacity-80">
                      <div>
                        <span className="text-[9px] text-[#4a6b8a] block uppercase">Boleto Anterior</span>
                        <p className="text-slate-300 font-medium">{item.empresaAnterior} | R$ {item.valorAnterior.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#4a6b8a] block uppercase">Elos Atual</span>
                        <p className="text-[#00d8ff]/80 font-medium">{item.empresaAtual} | R$ {item.valorAtual.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-300 pt-2 border-t border-[#1a3a5a] flex flex-col gap-1">
                      <p className="flex items-center gap-1 text-[#00d8ff]">
                        <CheckCircle size={12} />
                        <span className="text-[#4a6b8a]">Conclusão:</span> <span className="font-mono text-white font-semibold">{item.dataConclusao?.split("-").reverse().join("/") || "—"}</span>
                      </p>
                      <p className="text-[10.5px] italic text-[#4a6b8a]">
                        Operador responsável: {item.modificadoPor || "Sistêmico"}
                      </p>
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

      {/* MODAL: ADD RECORD */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#051430] border border-[#00f0ff]/20 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-[#001435] border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Novo Lançamento Boleto → Elos</h3>
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
                  placeholder="EX: DP-12005"
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
                    className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none cursor-pointer"
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
                    placeholder="EX: 150.00"
                    value={newValorAnterior}
                    onChange={(e) => setNewValorAnterior(e.target.value)}
                    className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00f0ff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Empresa Atual *</label>
                  <select
                    value={newEmpresaAtual}
                    onChange={(e) => setNewEmpresaAtual(e.target.value)}
                    className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none cursor-pointer"
                  >
                    {empresasOptions.map(e => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Valor Atual (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="EX: 140.00"
                    value={newValorAtual}
                    onChange={(e) => setNewValorAtual(e.target.value)}
                    className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00f0ff]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Próxima Parcela (Vencimento) *</label>
                <input
                  type="date"
                  required
                  value={newProximaParcela}
                  onChange={(e) => setNewProximaParcela(e.target.value)}
                  onClick={(e) => { try { e.currentTarget.showPicker(); } catch (err) {} }}
                  className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00f0ff] cursor-pointer"
                />
                <p className="text-[10px] text-cyan-400 mt-1">Dica: selecione data 06/06/2026 para ver o alerta "Amanhã"!</p>
              </div>

              <div>
                <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Premiação descritiva</label>
                <textarea
                  placeholder="Instruções de bônus, brindes ou condições especiais concedidas..."
                  value={newPremiacao}
                  onChange={(e) => setNewPremiacao(e.target.value)}
                  className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none h-16 resize-none"
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
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT RECORD */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#051430] border border-[#00f0ff]/20 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-[#001435] border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Editar Migração Elos</h3>
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
                  className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Empresa Anterior</label>
                  <select
                    value={editingItem.empresaAnterior}
                    onChange={(e) => setEditingItem({ ...editingItem, empresaAnterior: e.target.value as any })}
                    className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none cursor-pointer"
                  >
                    <option value="PF">PF</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Valor Anterior (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingItem.valorAnterior}
                    onChange={(e) => setEditingItem({ ...editingItem, valorAnterior: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Empresa Atual</label>
                  <select
                    value={editingItem.empresaAtual}
                    onChange={(e) => setEditingItem({ ...editingItem, empresaAtual: e.target.value })}
                    className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none cursor-pointer"
                  >
                    {empresasOptions.map(e => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Valor Atual (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingItem.valorAtual}
                    onChange={(e) => setEditingItem({ ...editingItem, valorAtual: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Próxima Parcela (Vencimento)</label>
                <input
                  type="date"
                  required
                  value={editingItem.proximaParcela}
                  onChange={(e) => setEditingItem({ ...editingItem, proximaParcela: e.target.value })}
                  onClick={(e) => { try { e.currentTarget.showPicker(); } catch (err) {} }}
                  className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Premiação</label>
                <textarea
                  value={editingItem.premiacao}
                  onChange={(e) => setEditingItem({ ...editingItem, premiacao: e.target.value })}
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
