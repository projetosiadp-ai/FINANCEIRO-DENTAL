/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  LayoutDashboard,
  Shuffle,
  CreditCard,
  XSquare,
  Building2,
  Users,
  Shield,
  Briefcase,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  LogOut
} from "lucide-react";
import { SimulatedUser, UserRole } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  userEmail: string;
  users: SimulatedUser[];
  setCurrentUserEmail: (email: string) => void;
  onLogout?: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  userEmail,
  users,
  setCurrentUserEmail,
  onLogout
}: SidebarProps) {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard Principal",
      icon: LayoutDashboard,
      roles: ["Admin", "Comercial"]
    },
    {
      id: "migracao",
      label: "Migração Boleto → Cartão Elos",
      icon: Shuffle,
      roles: ["Admin"]
    },
    {
      id: "troca",
      label: "Troca de Cartão",
      icon: CreditCard,
      roles: ["Admin"]
    },
    {
      id: "cancelamento",
      label: "Cancelamento Recorrente → Boleto",
      icon: XSquare,
      roles: ["Admin"]
    },
    {
      id: "pj",
      label: "Controle PJ",
      icon: Building2,
      roles: ["Admin", "Comercial"]
    },
    {
      id: "usuarios",
      label: "Gerenciar Usuários",
      icon: Users,
      roles: ["Admin"]
    }
  ];

  // Retrieve current user and their Abas_Liberadas list
  const currentUserObj = users.find(u => u.email === userEmail);
  const abasLiberadas = currentUserObj?.Abas_Liberadas || [];

  // Conditional Visibility Logic:
  // - A view button is visible ONLY if current user's Abas_Liberadas contains its exact label
  // - Gerenciar Usuários is a critical admin management view, available if role is Admin
  const allowedMenuItems = menuItems.filter(item => {
    if (item.id === "usuarios") {
      return userRole === "Admin";
    }
    return abasLiberadas.includes(item.label);
  });

  return (
    <div
      id="sidebar-container"
      className="w-72 bg-[#334155] border-r border-[#475569] flex flex-col text-white h-screen select-none shrink-0"
    >
      {/* DentalPlus Elegant Custom Vector Logo */}
      <div id="sidebar-logo" className="p-6 border-b border-[#475569] select-none">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-12 h-12 bg-[#475569] rounded-full border-2 border-[#00d8ff] ring-2 ring-[#00d8ff]/10 shadow-[0_0_15px_rgba(0,216,255,0.1)]">
            <div className="absolute inset-1 rounded-full border border-[#00d8ff]/20"></div>
            <span className="text-white font-black text-xl tracking-tighter">D</span>
            <span className="text-[#00d8ff] font-sans font-black text-md tracking-tighter">P</span>
          </div>
          <div>
            <div className="flex items-baseline font-sans font-bold text-lg tracking-tight">
              <span className="text-white">Dental</span>
              <span className="text-[#00d8ff]">Plus</span>
              <span className="text-[10px] align-super text-[#00d8ff] ml-0.5">®</span>
            </div>
            <p className="text-[9px] uppercase tracking-widest text-[#4a6b8a] font-medium">
              Plano Odontológico
            </p>
          </div>
        </div>
      </div>

      {/* Menu Options Scrollable list */}
      <div id="sidebar-nav" className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <p className="text-[10px] font-bold text-[#4a6b8a] uppercase tracking-wider px-3 mb-2">
          Navegação Autorizada
        </p>
        
        {allowedMenuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer text-left group ${
                isActive
                  ? "bg-[#1e293b] text-[#00d8ff] border-r-4 border-[#00d8ff] font-semibold"
                  : "text-[#cbd5e1] hover:text-white hover:bg-[#1e293b]/50"
              }`}
            >
              <Icon
                size={18}
                className={`transition-colors duration-200 ${
                  isActive ? "text-[#00d8ff]" : "text-[#4a6b8a] group-hover:text-white"
                }`}
              />
              <span className="truncate">{item.label}</span>
              
              {item.id === "usuarios" && (
                <span className="ml-auto text-[8px] bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/20 px-1.5 py-0.5 rounded uppercase font-bold tracking-tight">
                  ADM
                </span>
              )}
            </button>
          );
        })}

        {allowedMenuItems.length === 0 && (
          <div className="p-4 text-center border border-white/5 bg-white/[0.01] rounded-lg">
            <p className="text-xs text-[#4a6b8a] italic">Nenhuma aba disponível para este perfil político. Contate o administrador.</p>
          </div>
        )}

        {onLogout && (
          <button
            id="btn-sidebar-logout"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer text-left text-red-300 hover:text-red-200 hover:bg-red-500/10 mt-4 border border-dashed border-red-500/20"
          >
            <LogOut size={16} className="text-red-400" />
            <span>Sair do Sistema</span>
          </button>
        )}
      </div>

      {/* Access Permission Control Simulator */}
      <div id="sidebar-role-selector" className="p-4 bg-[#1e293b] border-t border-[#475569]">
        <div className="flex flex-col gap-3">
          
          {/* Advanced simulated user selection dropdown for testing */}
          <div className="flex flex-col gap-1.5">
            <p className="text-[9px] text-[#4a6b8a] flex items-center gap-1 uppercase tracking-wider font-bold">
              <span>Usuário Logado (Perfil)</span>
              <span className="animate-pulse text-[#00d8ff] font-bold">●</span>
            </p>
            <select
              value={userEmail}
              onChange={(e) => {
                const selectedEmail = e.target.value;
                const found = users.find(u => u.email === selectedEmail);
                if (found) {
                  setCurrentUserEmail(selectedEmail);
                  setUserRole(found.role);
                  
                  // Protection rule checking: if destination user does not have permission for the current active tab:
                  const currentAbas = found.Abas_Liberadas || [];
                  const activeMenuObj = menuItems.find(m => m.id === activeTab);
                  const isAllowed = (activeTab === "usuarios" && found.role === "Admin") ||
                                    (activeMenuObj ? currentAbas.includes(activeMenuObj.label) : false);

                  if (!isAllowed) {
                    // Redirect to their first authorized tab
                    const firstAllowed = menuItems.find(item => item.id !== "usuarios" && currentAbas.includes(item.label));
                    if (firstAllowed) {
                      setActiveTab(firstAllowed.id);
                    } else if (found.role === "Admin") {
                      setActiveTab("usuarios");
                    } else {
                      setActiveTab("dashboard");
                    }
                  }
                }
              }}
              className="w-full bg-[#1e293b] border border-[#475569] text-white rounded p-2 text-xs outline-none focus:border-[#00d8ff] cursor-pointer"
            >
              {users.map(u => (
                <option key={u.id} value={u.email}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div className="h-px bg-white/5 my-0.5"></div>

          {/* Quick privilege toggle keys to satisfy role emulation metrics */}
          <div className="px-2">
            <p className="text-[9px] text-[#4a6b8a] tracking-wider uppercase font-bold text-center mb-1.5">
              Filtro de Cargo (Cargo Rápido)
            </p>
            <div className="flex items-center justify-between bg-[#1e293b] p-1 rounded-lg border border-[#475569]">
              <button
                id="toggle-role-admin"
                onClick={() => {
                  const firstAdmin = users.find(u => u.role === "Admin");
                  if (firstAdmin) {
                    setCurrentUserEmail(firstAdmin.email);
                    setUserRole("Admin");
                  } else {
                    setUserRole("Admin");
                  }
                  // Safe page migration fallback checking
                  if (activeTab === "dashboard" || activeTab === "usuarios") return;
                  const currentAbas = firstAdmin?.Abas_Liberadas || [];
                  const targetMenuObj = menuItems.find(m => m.id === activeTab);
                  if (targetMenuObj && !currentAbas.includes(targetMenuObj.label)) {
                    setActiveTab("dashboard");
                  }
                }}
                className={`flex-1 text-center py-1 text-[10.5px] font-semibold rounded cursor-pointer transition-all duration-200 ${
                  userRole === "Admin"
                    ? "bg-[#00d8ff] text-[#1e293b] font-bold shadow-[0_0_10px_rgba(0,216,255,0.3)]"
                    : "text-[#cbd5e1]/60 hover:text-white"
                }`}
              >
                ADMIN
              </button>
              <button
                id="toggle-role-comercial"
                onClick={() => {
                  const firstCom = users.find(u => u.role === "Comercial");
                  if (firstCom) {
                    setCurrentUserEmail(firstCom.email);
                    setUserRole("Comercial");
                  } else {
                    setUserRole("Comercial");
                  }
                  // Automatically redirect to comercial-friendly dashboard if in restricted tab
                  if (activeTab === "migracao" || activeTab === "troca" || activeTab === "cancelamento" || activeTab === "usuarios") {
                    setActiveTab("dashboard");
                  }
                }}
                className={`flex-1 text-center py-1 text-[10.5px] font-semibold rounded cursor-pointer transition-all duration-200 ${
                  userRole === "Comercial"
                    ? "bg-[#475569] text-white font-bold border border-[#1e293b]"
                    : "text-[#cbd5e1]/60 hover:text-white"
                }`}
              >
                COMERCIAL
              </button>
            </div>
            <p className="text-[9px] text-[#4a6b8a] text-center mt-1">
              Testes facilitados alterando os perfis dinamicamente
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
