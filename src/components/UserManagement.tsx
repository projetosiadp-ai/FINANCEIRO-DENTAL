/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Users,
  Shield,
  UserPlus,
  Trash2,
  CheckCircle,
  Clock,
  Search,
  X,
  UserCheck,
  UserX,
  AlertCircle
} from "lucide-react";
import { SimulatedUser, UserRole } from "../types";

interface UserManagementProps {
  users: SimulatedUser[];
  onAddUser: (user: Omit<SimulatedUser, "id" | "createdAt">) => void;
  onUpdateUser: (id: string, updates: Partial<SimulatedUser>) => void;
  onDeleteUser: (id: string) => void;
  currentUserEmail: string;
}

export default function UserManagement({
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  currentUserEmail
}: UserManagementProps) {
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Editing User Permissions State
  const [editingUser, setEditingUser] = useState<SimulatedUser | null>(null);
  const [selectedAbas, setSelectedAbas] = useState<string[]>([]);

  // New user state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("Comercial");
  const [newStatus, setNewStatus] = useState<"Ativo" | "Pendente">("Ativo");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    onAddUser({
      name: newName,
      email: newEmail,
      role: newRole,
      status: newStatus
    });
    setNewName("");
    setNewEmail("");
    setNewRole("Comercial");
    setNewStatus("Ativo");
    setShowAddModal(false);
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div id="user-management-container" className="flex-1 overflow-y-auto bg-[#050d1a] text-white p-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold font-sans text-white flex items-center gap-2">
            <span className="w-2.5 h-6 bg-[#00d8ff] rounded-sm"></span>
            Controle de Usuários e Permissões de Acesso
          </h2>
          <p className="text-xs text-[#4a6b8a]">
            Libere novos acessos de consultores comerciais ou promova operadores à função de administrador de faturas da DentalPlus
          </p>
        </div>

        <button
          id="btn-add-simulated-user"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-[#00d8ff] to-[#00a2ff] hover:brightness-110 text-white font-bold py-2 px-4 rounded-lg text-xs leading-none cursor-pointer transition shadow-[0_2px_15px_rgba(0,216,255,0.2)]"
        >
          <UserPlus size={15} />
          <span>Convidar Usuário</span>
        </button>
      </div>

      {/* Warning admin indicator */}
      <div className="p-4 bg-[#0a192f] border-l-4 border-[#00d8ff] rounded-r-xl mb-6 flex gap-3 items-center">
        <Shield className="text-[#00d8ff] shrink-0" size={18} />
        <div className="text-xs">
          <p className="font-bold text-white">Privilégios de Administrador Ativos</p>
          <p className="text-[#4a6b8a] mt-0.5">Esta aba é restrita. Apenas administradores do sistema podem visualizar, criar operadores comerciais e liberar credenciais pendentes.</p>
        </div>
      </div>

      {/* Filter box */}
      <div className="bg-[#0d1b2e] border border-[#1a3a5a] rounded-xl p-4 mb-6">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#4a6b8a]">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Buscar usuário por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#050d1a] border border-[#1a3a5a] hover:border-[#00d8ff]/20 focus:border-[#00d8ff] rounded-lg px-3 py-1.5 pl-9 text-xs text-white placeholder-[#4a6b8a] outline-none transition"
          />
        </div>
      </div>

      {/* Users table list */}
      <div className="bg-[#0d1b2e] border border-[#1a3a5a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#050d1a] text-[#4a6b8a] uppercase text-[10px] tracking-wider border-b border-[#1a3a5a]">
                <th className="p-4 font-bold">Colaborador</th>
                <th className="p-4 font-bold">Role / Função</th>
                <th className="p-4 font-bold">Status Sistema</th>
                <th className="p-4 font-bold">Data Convite</th>
                <th className="p-4 font-bold text-right">Ações de Liberação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[#b4c6ef]/90">
              {filteredUsers.map(user => {
                const isSelf = user.email === currentUserEmail;
                
                return (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition">
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-white text-sm">{user.name}</p>
                        <p className="text-[#b4c6ef]/40 font-mono mt-0.5">{user.email}</p>
                      </div>
                    </td>
                    <td className="p-4 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Shield size={13} className={user.role === "Admin" ? "text-[#00f0ff]" : "text-[#00a2ff]"} />
                        <span className={user.role === "Admin" ? "text-white" : "text-[#b4c6ef]/85"}>
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        user.status === "Ativo"
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      }`}>
                        {user.status === "Ativo" ? <CheckCircle size={11} /> : <Clock size={11} />}
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[#b4c6ef]/50">
                      {user.createdAt.split("-").reverse().join("/")}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 text-[11.5px] items-center">
                        {/* Permissões button available for all, including self */}
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setSelectedAbas(user.Abas_Liberadas || []);
                          }}
                          className="bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/20 px-2.5 py-1.5 rounded transition font-bold cursor-pointer"
                          title="Gerenciar abas liberadas"
                        >
                          Permissões
                        </button>

                        {isSelf ? (
                          <span className="text-[10px] text-[#b4c6ef]/30 font-semibold italic select-none ml-2">
                            Seu Perfil Conectado
                          </span>
                        ) : (
                          <>
                            {/* Toggle Status */}
                            {user.status === "Pendente" ? (
                              <button
                                onClick={() => onUpdateUser(user.id, { status: "Ativo" })}
                                className="bg-green-500/15 hover:bg-green-500 text-green-400 hover:text-[#001435] border border-green-500/20 px-2.5 py-1.5 rounded transition font-bold cursor-pointer"
                              >
                                Aprovar
                              </button>
                            ) : (
                              <button
                                onClick={() => onUpdateUser(user.id, { status: "Pendente" })}
                                className="bg-white/5 hover:bg-amber-500 hover:text-[#001435] px-2.5 py-1.5 rounded transition cursor-pointer"
                                title="Suspender acesso temporariamente"
                              >
                                Suspender
                              </button>
                            )}

                            {/* Switch user role structure */}
                            <button
                              onClick={() => onUpdateUser(user.id, { role: user.role === "Admin" ? "Comercial" : "Admin" })}
                              className="bg-white/5 hover:bg-[#00f0ff] hover:text-[#001435] px-2.5 py-1.5 rounded transition cursor-pointer"
                              title="Alternar cargo administrativo"
                            >
                              Tornar {user.role === "Admin" ? "Comercial" : "Admin"}
                            </button>

                            {/* Delete access */}
                            <button
                              onClick={() => onDeleteUser(user.id)}
                              className="text-red-400 hover:bg-red-500/10 p-1.5 rounded transition cursor-pointer"
                              title="Remover operador completamente"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD SIMULATED OPERATOR */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#051430] border border-[#00f0ff]/20 rounded-xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-[#001435] border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Novo Convite de Operador</h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="EX: Julia Santos"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div>
                <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Endereço de E-mail Corporativo *</label>
                <input
                  type="email"
                  required
                  placeholder="EX: julia.santos@dentalplus.com.br"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Role de Acesso</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none cursor-pointer"
                  >
                    <option value="Comercial">Comercial</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#b4c6ef] font-semibold mb-1 block">Status Inicial</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-[#000e26] border border-white/10 rounded-lg p-2 text-white outline-none cursor-pointer"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-white/5 hover:bg-white/10 text-[#b4c6ef] px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#00f0ff] to-[#0070f3] text-white font-bold px-4 py-1.5 rounded-lg cursor-pointer"
                >
                  Criar Credencial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT USER PERMISSIONS */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#051430] border border-cyan-500/20 rounded-xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-[#001435] border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Editar Permissões de Acesso</h3>
                <p className="text-[10px] text-cyan-400 font-mono mt-0.5">{editingUser.email}</p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-white/40 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs text-[#b4c6ef] mb-2 font-medium">
                  Selecione individualmente quais telas e abas o colaborador <strong className="text-white">{editingUser.name}</strong> poderá visualizar e acessar no menu lateral do sistema:
                </p>

                <div className="space-y-2 mt-3">
                  {[
                    "Dashboard Principal",
                    "Migração Boleto → Cartão Elos",
                    "Troca de Cartão",
                    "Cancelamento Recorrente → Boleto",
                    "Controle PJ"
                  ].map(tabName => {
                    const isChecked = selectedAbas.includes(tabName);
                    return (
                      <label
                        key={tabName}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer select-none transition ${
                          isChecked
                            ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-200"
                            : "bg-[#000e26] border-white/5 text-[#b4c6ef]/80 hover:bg-white/[0.02]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAbas(prev => [...prev, tabName]);
                            } else {
                              setSelectedAbas(prev => prev.filter(t => t !== tabName));
                            }
                          }}
                          className="rounded border-white/10 text-cyan-500 focus:ring-cyan-500 bg-[#000e26] w-4 h-4 cursor-pointer"
                        />
                        <div className="text-xs">
                          <p className="font-bold">{tabName}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="bg-white/5 hover:bg-white/10 text-[#b4c6ef] px-3 py-1.5 rounded-lg cursor-pointer text-xs"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onUpdateUser(editingUser.id, { Abas_Liberadas: selectedAbas });
                    setEditingUser(null);
                  }}
                  className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:brightness-110 text-white font-bold px-4 py-1.5 rounded-lg cursor-pointer text-xs"
                >
                  Salvar Permissões
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
