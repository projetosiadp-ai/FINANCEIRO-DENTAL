/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  AlertTriangle,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  FileSpreadsheet,
  Bell,
  Search,
  Filter,
  Calendar,
  X,
  ChevronDown,
  Info,
  DollarSign,
  Briefcase,
  Layers,
  Upload,
  AlertCircle
} from "lucide-react";
import {
  MigracaoElos,
  TrocaCartao,
  CancelamentoBoleto,
  ControlePJ,
  AppNotification,
  UserRole,
  FilterState
} from "../types";

interface DashboardViewProps {
  migracaoData: MigracaoElos[];
  trocaData: TrocaCartao[];
  cancelamentoData: CancelamentoBoleto[];
  pjData: ControlePJ[];
  notifications: AppNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  userRole: UserRole;
  onImportData: (aba: string, rows: any[]) => void;
  // Navigation trigger to take users directly to tabs so it serves as an interactive flow
  setActiveTab: (tab: string) => void;
}

export default function DashboardView({
  migracaoData,
  trocaData,
  cancelamentoData,
  pjData,
  notifications,
  setNotifications,
  userRole,
  onImportData,
  setActiveTab
}: DashboardViewProps) {
  // Global dashboard filter states
  const [filters, setFilters] = useState<FilterState>({
    periodoInicio: "",
    periodoFim: "",
    status: "Todos",
    empresa: "Todos",
    search: ""
  });

  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [importTarget, setImportTarget] = useState<string>("migracao");
  const [csvRawText, setCsvRawText] = useState<string>("");
  const [csvError, setCsvError] = useState<string | null>(null);

  // Mark all notifications as read
  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(not => ({ ...not, lida: true })));
  };

  // Mark a single notification as read
  const toggleNotificationRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev =>
      prev.map(not => (not.id === id ? { ...not, lida: !not.lida } : not))
    );
  };

  // Clear a notification
  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(not => not.id !== id));
  };

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.lida).length;
  }, [notifications]);

  // Companies / Categories for filters
  const uniqueCompanies = useMemo(() => {
    const list = new Set<string>();
    migracaoData.forEach(d => list.add(d.empresaAnterior));
    migracaoData.forEach(d => list.add(d.empresaAtual));
    cancelamentoData.forEach(d => list.add(d.empresaAnterior));
    cancelamentoData.forEach(d => list.add(d.migracaoPara));
    return Array.from(list).filter(Boolean);
  }, [migracaoData, cancelamentoData]);

  // Filter application: This filters rows across ALL 4 sources for KPIs & visual calculations
  const filteredMigracao = useMemo(() => {
    return migracaoData.filter(d => {
      // If user is Comercial, they shouldn't see Admin data or should see filtered, but they only have access to PJ tab as requested. 
      // "Comercial: Acesso restrito. Só pode visualizar e interagir com a aba 'Controle PJ' e a página principal filtrada apenas com dados pertinentes a ele."
      // Since it says "página principal filtrada apenas com dados pertinentes a ele",
      // let's say Comercial only sees records they are responsible or we display general metrics but mask certain fields or limit scope to PJ related clients.
      // To satisfy "página principal filtrada apenas com dados pertinentes a ele (Comercial)",
      // we filter by Comercial-related or PJ transactions only, or we highlight PJ info when Comercial is selected!
      if (userRole === "Comercial") {
        // Comercial can see general mock data associated with client codes that correspond to commercial activities (e.g., Code starts with PJ or is assigned) or mock values.
        // Let's filter to show only a subset of general finance, focusing on Controle PJ or client records with 'Carlos Comercial' or 'Ana Silva'.
        if (d.modificadoPor && d.modificadoPor !== "Carlos Comercial" && d.modificadoPor !== "Ana Silva" && d.modificadoPor !== "projetos.iadp@gmail.com") return false;
      }

      const matchSearch =
        !filters.search ||
        d.codigoCliente.toLowerCase().includes(filters.search.toLowerCase()) ||
        d.premiacao.toLowerCase().includes(filters.search.toLowerCase());

      const matchStatus =
        filters.status === "Todos" ||
        (filters.status === "Pendente" && d.status === "Pendente") ||
        (filters.status === "Completo" && d.status === "Completo");

      const matchEmpresa =
        filters.empresa === "Todos" ||
        d.empresaAnterior === filters.empresa ||
        d.empresaAtual === filters.empresa;

      const dateToCompare = d.dataCriacao;
      const matchDateInicio = !filters.periodoInicio || dateToCompare >= filters.periodoInicio;
      const matchDateFim = !filters.periodoFim || dateToCompare <= filters.periodoFim;

      return matchSearch && matchStatus && matchEmpresa && matchDateInicio && matchDateFim;
    });
  }, [migracaoData, filters, userRole]);

  const filteredTroca = useMemo(() => {
    return trocaData.filter(d => {
      if (userRole === "Comercial") {
        // Comercial doesn't have access to Troca de Cartão, so we filter it out or show only their client's card swap.
        // Let's show empty or restricted subset (e.g. only 1 mock card associated) to reflect the business boundary.
        return false;
      }

      const matchSearch =
        !filters.search ||
        d.codigoCliente.toLowerCase().includes(filters.search.toLowerCase());

      const matchStatus =
        filters.status === "Todos" ||
        (filters.status === "Pendente" && d.status === "Pendente") ||
        (filters.status === "Completo" && d.status === "Completo");

      const dateToCompare = d.dataCriacao;
      const matchDateInicio = !filters.periodoInicio || dateToCompare >= filters.periodoInicio;
      const matchDateFim = !filters.periodoFim || dateToCompare <= filters.periodoFim;

      return matchSearch && matchStatus && matchDateInicio && matchDateFim;
    });
  }, [trocaData, filters, userRole]);

  const filteredCancelamento = useMemo(() => {
    return cancelamentoData.filter(d => {
      if (userRole === "Comercial") {
        return false; // Restricted
      }

      const matchSearch =
        !filters.search ||
        d.codigoCliente.toLowerCase().includes(filters.search.toLowerCase()) ||
        d.motivoCancelamento.toLowerCase().includes(filters.search.toLowerCase());

      const matchStatus =
        filters.status === "Todos" ||
        (filters.status === "Pendente" && d.status === "Pendente") ||
        (filters.status === "Completo" && d.status === "Completo");

      const matchEmpresa =
        filters.empresa === "Todos" ||
        d.empresaAnterior === filters.empresa ||
        d.migracaoPara === filters.empresa;

      const dateToCompare = d.dataCriacao;
      const matchDateInicio = !filters.periodoInicio || dateToCompare >= filters.periodoInicio;
      const matchDateFim = !filters.periodoFim || dateToCompare <= filters.periodoFim;

      return matchSearch && matchStatus && matchEmpresa && matchDateInicio && matchDateFim;
    });
  }, [cancelamentoData, filters, userRole]);

  const filteredPj = useMemo(() => {
    return pjData.filter(d => {
      const matchSearch =
        !filters.search ||
        d.codigoCliente.toLowerCase().includes(filters.search.toLowerCase());

      const matchStatus =
        filters.status === "Todos" ||
        (filters.status === "Pendente" && d.status === "Pendente") ||
        (filters.status === "Completo" && d.status === "Completo");

      const dateToCompare = d.dataCriacao || d.dataContratacao;
      const matchDateInicio = !filters.periodoInicio || dateToCompare >= filters.periodoInicio;
      const matchDateFim = !filters.periodoFim || dateToCompare <= filters.periodoFim;

      return matchSearch && matchStatus && matchDateInicio && matchDateFim;
    });
  }, [pjData, filters]);

  // Metric computations of KPIs for filtered dataset
  const stats = useMemo(() => {
    let rawTotalMigrado = 0;
    let pendenteMigradoCount = 0;
    let trocaPendentesCount = 0;
    let cancelamentoProcessadosCount = 0;
    let totalPjCount = 0;
    let totalPjAtivos = 0;

    filteredMigracao.forEach(d => {
      if (d.status === "Completo") {
        rawTotalMigrado += d.valorAtual;
      } else {
        pendenteMigradoCount++;
      }
    });

    filteredTroca.forEach(d => {
      if (d.status === "Pendente") {
        trocaPendentesCount++;
      }
    });

    filteredCancelamento.forEach(d => {
      if (d.status === "Completo" || d.status === "Pendente") {
        cancelamentoProcessadosCount++;
      }
    });

    filteredPj.forEach(d => {
      totalPjCount++;
      if (d.status === "Pendente") {
        totalPjAtivos++;
      }
    });

    return {
      totalMigrado: rawTotalMigrado,
      pendenteMigrado: pendenteMigradoCount,
      trocaPendentes: trocaPendentesCount,
      cancelamentoProcessados: cancelamentoProcessadosCount,
      totalPj: totalPjCount,
      totalPjAtivos: totalPjAtivos
    };
  }, [filteredMigracao, filteredTroca, filteredCancelamento, filteredPj]);

  // Check CSV input parsing
  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvRawText.trim()) {
      setCsvError("Por favor, cole algum texto contendo dados CSV.");
      return;
    }

    try {
      const lines = csvRawText.split("\n").map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) {
        setCsvError("Nenhuma linha de dados encontrada.");
        return;
      }

      const parsedRows: any[] = [];
      lines.forEach((line, index) => {
        // Simple comma split
        const parts = line.split(",").map(part => part.trim().replace(/^["']|["']$/g, ""));
        
        if (importTarget === "migracao") {
          // DP-10029, PF, 180.00, Elos Rec 01, 165.00, 2026-06-06, Beneficio
          if (parts.length >= 2) {
            parsedRows.push({
              codigoCliente: parts[0] || `DP-NEW-${index + 100}`,
              empresaAnterior: (parts[1] === "Online" || parts[1] === "PF") ? parts[1] : "PF",
              valorAnterior: parseFloat(parts[2]) || 0.0,
              empresaAtual: parts[3] || "Elos Rec 01",
              valorAtual: parseFloat(parts[4]) || parseFloat(parts[2]) || 0.0,
              proximaParcela: parts[5] || "2026-06-15",
              premiacao: parts[6] || "Importado via painel integrado",
              status: "Pendente",
              dataCriacao: new Date().toISOString().split("T")[0]
            });
          }
        } else if (importTarget === "troca") {
          // DP-12883, 2026-06-06
          if (parts.length >= 1) {
            parsedRows.push({
              codigoCliente: parts[0] || `DP-NEW-${index + 100}`,
              dataVencimentoParcela: parts[1] || "2026-06-15",
              status: "Pendente",
              dataCriacao: new Date().toISOString().split("T")[0]
            });
          }
        } else if (importTarget === "cancelamento") {
          // DP-08871, 140.00, Online, 2026-06-01, Motivo, Elos Rec - 05 dias, 155.00, 2026-06-06
          if (parts.length >= 2) {
            parsedRows.push({
              codigoCliente: parts[0] || `DP-NEW-${index + 100}`,
              valorAnterior: parseFloat(parts[1]) || 0.0,
              empresaAnterior: (parts[2] === "Online" || parts[2] === "PF") ? parts[2] : "PF",
              dataAlteracao: parts[3] || new Date().toISOString().split("T")[0],
              motivoCancelamento: parts[4] || "Substituição cadastral",
              migracaoPara: parts[5] || "Elos Rec - diversos dias",
              valorAtual: parseFloat(parts[6]) || 0.0,
              proximoVencimento: parts[7] || "2026-06-15",
              status: "Pendente",
              dataCriacao: new Date().toISOString().split("T")[0]
            });
          }
        } else if (importTarget === "pj") {
          // PJ-50012, 2026-04-01, Elos Rec, 2026-06-06
          if (parts.length >= 1) {
            parsedRows.push({
              codigoCliente: parts[0] || `PJ-NEW-${index + 100}`,
              dataContratacao: parts[1] || new Date().toISOString().split("T")[0],
              formaPagamentoP1: (parts[2] === "Elos Rec" || parts[2] === "PIX" || parts[2] === "Boleto") ? parts[2] : "Elos Rec",
              dataProximaParcela: parts[3] || "2026-06-15",
              status: "Pendente",
              dataCriacao: new Date().toISOString().split("T")[0]
            });
          }
        }
      });

      if (parsedRows.length === 0) {
        setCsvError("Nenhum dado pôde ser extraído. Verifique o formato.");
        return;
      }

      onImportData(importTarget, parsedRows);
      setCsvRawText("");
      setCsvError(null);
      setShowImportModal(false);

      // Trigger success notifications
      const newNotification: AppNotification = {
        id: `not-sys-import-${Date.now()}`,
        tipo: "sistema",
        mensagem: `Importação de dados realizada: adicionados ${parsedRows.length} registros à tabela de ${
          importTarget === "migracao" ? "Migração" :
          importTarget === "troca" ? "Troca de Cartão" :
          importTarget === "cancelamento" ? "Cancelamentos" : "Controle PJ"
        }.`,
        lida: false,
        data: new Date().toISOString().split("T")[0]
      };
      setNotifications(prev => [newNotification, ...prev]);

    } catch (err: any) {
      setCsvError(`Erro ao processar dados CSV. Certifique-se de usar vírgulas para separar as colunas. Detalhes: ${err.message}`);
    }
  };

  const clearAllFilters = () => {
    setFilters({
      periodoInicio: "",
      periodoFim: "",
      status: "Todos",
      empresa: "Todos",
      search: ""
    });
  };

  return (
    <div id="dashboard-wrapper" className="flex-1 overflow-y-auto bg-[#050d1a] text-white">
      {/* Upper Navigation Bar / Header */}
      <header
        id="dashboard-header"
        className="sticky top-0 bg-[#081528]/90 backdrop-blur-md z-30 p-6 border-b border-[#1a3a5a] flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold font-sans tracking-tight flex items-center gap-2">
            <span>DentalPlus Financial</span>
            <span className="text-[#00d8ff] font-sans font-light">Analytics</span>
          </h1>
          <p className="text-xs text-[#4a6b8a] mt-1">
            {userRole === "Admin"
              ? "Painel de controle interno de faturas recorrentes, elos e conciliações de pagamento"
              : "Visão comercial restrita — Acompanhamento financeiro PJ de carteira de contratos"}
          </p>
        </div>

        {/* Global Toolbar Header Items */}
        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <div className="relative max-w-xs hidden sm:block">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#4a6b8a]">
              <Search size={16} />
            </span>
            <input
              id="global-header-search"
              type="text"
              placeholder="Mineração rápida (Cód. Cliente)..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="bg-[#0d1b2e] border border-[#1a3a5a] hover:border-[#00d8ff]/30 focus:border-[#00d8ff] focus:ring-1 focus:ring-[#00d8ff] rounded-lg px-3 py-2 pl-9 text-xs w-56 text-white placeholder-[#4a6b8a] outline-none transition-all duration-200"
            />
            {filters.search && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, search: "" }))}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-white/40 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Import Data Trigger Button */}
          <button
            id="btn-open-import-modal"
            onClick={() => setShowImportModal(true)}
            className="bg-transparent border border-[#00d8ff] text-[#00d8ff] px-4 py-2 hover:bg-[#00d8ff] hover:text-[#050d1a] rounded-lg text-xs leading-none transition-all duration-150 font-semibold cursor-pointer"
          >
            <FileSpreadsheet size={15} className="inline mr-1.5" />
            <span className="hidden md:inline">Importar CSV</span>
          </button>

          {/* Centralized Notification Bell with Badge Count */}
          <div className="relative">
            <button
              id="notification-bell-btn"
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              className="relative p-2.5 bg-[#112240] hover:bg-[#1a3a5a] border border-[#1a3a5a] hover:border-[#00d8ff]/30 rounded-lg text-[#4a6b8a] hover:text-white transition-all cursor-pointer"
            >
              <Bell size={17} />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-[#081528] rounded-full flex items-center justify-center text-[9px] font-bold text-white animate-bounce">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Notification Menu List Dropdown */}
            {showNotificationsDropdown && (
              <div
                id="notifications-panel-list"
                className="absolute right-0 mt-3 w-80 bg-[#0d1b2e] rounded-xl border border-[#1a3a5a] shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-50 text-slate-300 overflow-hidden"
              >
                <div className="p-4 bg-[#081528] border-b border-[#1a3a5a] flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Bell size={14} className="text-[#00d8ff]" />
                    Central de Alertas
                  </h3>
                  {unreadNotificationsCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[10px] text-[#00d8ff] hover:underline cursor-pointer"
                    >
                      Ler todas
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#4a6b8a]">
                      Nenhuma notificação cadastrada
                    </div>
                  ) : (
                    notifications.map(not => (
                      <div
                        key={not.id}
                        className={`p-3 text-xs flex flex-col gap-1 transition-all ${
                          not.lida ? "opacity-60 bg-transparent" : "bg-[#112240] text-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`inline-block w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              not.tipo === "vencimento" ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-[#00d8ff]"
                            }`}
                          ></span>
                          <p className="flex-1 font-medium leading-relaxed">{not.mensagem}</p>
                          <button
                            onClick={(e) => deleteNotification(not.id, e)}
                            className="text-[#4a6b8a] hover:text-white cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-2 text-[10px] text-[#4a6b8a]">
                          <span>{not.data}</span>
                          <div className="flex gap-2">
                            {!not.lida && (
                              <button
                                onClick={(e) => toggleNotificationRead(not.id, e)}
                                className="text-[#00d8ff] hover:underline cursor-pointer"
                              >
                                Marcar como lido
                              </button>
                            )}
                            {not.aba && (
                              <button
                                onClick={() => {
                                  setActiveTab(not.aba || "dashboard");
                                  setShowNotificationsDropdown(false);
                                }}
                                className="text-white hover:underline cursor-pointer font-semibold flex items-center gap-0.5"
                              >
                                Acessar <ArrowUpRight size={10} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Control Panel Body */}
      <main id="dashboard-content" className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Filters and Search Banner */}
        <div id="filters-toolbar" className="bg-[#0d1b2e] border border-[#1a3a5a] rounded-xl p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mr-2">
                <Filter size={14} className="text-[#00d8ff]" />
                Filtros Globais:
              </span>

              {/* Status Picker Selector */}
              <div className="relative">
                <span className="text-[10px] text-[#4a6b8a] block absolute -top-3 left-1 bg-[#0d1b2e] px-1 font-bold">Status</span>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                  className="bg-[#050d1a] border border-[#1a3a5a] hover:border-[#00d8ff]/30 rounded px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="Todos">Todos Status</option>
                  <option value="Pendente">Apenas Pendentes</option>
                  <option value="Completo">Apenas Concluídos</option>
                </select>
              </div>

              {/* Company Picker Selector */}
              <div className="relative">
                <span className="text-[10px] text-[#4a6b8a] block absolute -top-3 left-1 bg-[#0d1b2e] px-1 font-bold">Empresa</span>
                <select
                  value={filters.empresa}
                  onChange={(e) => setFilters(prev => ({ ...prev, empresa: e.target.value }))}
                  className="bg-[#050d1a] border border-[#1a3a5a] hover:border-[#00d8ff]/30 rounded px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="Todos">Todas Empresas</option>
                  <option value="PF">PF (Pessoa Física)</option>
                  <option value="Online">Online</option>
                  {uniqueCompanies.filter(c => c !== "PF" && c !== "Online").map(comp => (
                    <option key={comp} value={comp}>{comp}</option>
                  ))}
                </select>
              </div>

              {/* Period Date Filters */}
              <div className="flex items-center gap-1.5 bg-[#050d1a] border border-[#1a3a5a] rounded px-2 py-1">
                <Calendar size={13} className="text-[#00d8ff]" />
                <input
                  type="date"
                  value={filters.periodoInicio}
                  onChange={(e) => setFilters(prev => ({ ...prev, periodoInicio: e.target.value }))}
                  onClick={(e) => { try { e.currentTarget.showPicker(); } catch (err) {} }}
                  className="bg-transparent text-xs text-white outline-none focus:ring-0 max-w-[100px] cursor-pointer"
                  title="Data Início"
                />
                <span className="text-[#4a6b8a] text-xs">até</span>
                <input
                  type="date"
                  value={filters.periodoFim}
                  onChange={(e) => setFilters(prev => ({ ...prev, periodoFim: e.target.value }))}
                  onClick={(e) => { try { e.currentTarget.showPicker(); } catch (err) {} }}
                  className="bg-transparent text-xs text-white outline-none focus:ring-0 max-w-[100px] cursor-pointer"
                  title="Data Fim"
                />
              </div>

              {/* Action clear filters if something is changed */}
              {(filters.search || filters.status !== "Todos" || filters.empresa !== "Todos" || filters.periodoInicio || filters.periodoFim) && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition cursor-pointer"
                >
                  <X size={14} /> Limpar Filtros
                </button>
              )}
            </div>

            {/* Indicator of active records count */}
            <div className="text-[11px] text-[#4a6b8a] font-mono self-end">
              Registros filtrados:{" "}
              <span className="text-[#00d8ff] font-bold">
                {filteredMigracao.length + filteredTroca.length + filteredCancelamento.length + filteredPj.length}
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard KPIs Cards Section */}
        <div id="dashboard-kpis-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Migrado Elos */}
          <div
            id="kpi-total-migrado"
            onClick={() => userRole === "Admin" && setActiveTab("migracao")}
            className={`bg-[#0d1b2e] border border-[#1a3a5a] hover:border-[#00d8ff]/30 p-5 rounded-2xl transition duration-200 shadow-md flex flex-col justify-between relative overflow-hidden group ${
              userRole === "Admin" ? "cursor-pointer" : ""
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00d8ff]/5 to-transparent rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#4a6b8a]">
                Receita Migrada (Elos)
              </span>
              <div className="p-2 bg-[#00d8ff]/10 text-[#00d8ff] rounded-xl">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-black font-sans leading-none">
                R$ {stats.totalMigrado.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#00d8ff]">
                <CheckCircle2 size={12} />
                <span>Base recorrente ativa</span>
              </div>
            </div>
          </div>

          {/* Card 2: Migrações Pendentes */}
          <div
            id="kpi-migracoes-pendentes"
            onClick={() => userRole === "Admin" && setActiveTab("migracao")}
            className={`bg-[#0d1b2e] border border-[#1a3a5a] hover:border-[#00d8ff]/30 p-5 rounded-2xl transition duration-200 shadow-md flex flex-col justify-between relative overflow-hidden group ${
              userRole === "Admin" ? "cursor-pointer" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#4a6b8a]">
                Migrações Pendentes
              </span>
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                <Clock size={16} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-black font-sans leading-none">
                {stats.pendenteMigrado}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-500">
                <AlertTriangle size={12} className="animate-pulse" />
                <span>Exige envio manual</span>
              </div>
            </div>
          </div>

          {/* Card 3: Trocas de Cartões Pendentes (Admin Only view logic checks) */}
          <div
            id="kpi-trocas-pendentes"
            onClick={() => userRole === "Admin" && setActiveTab("troca")}
            className={`bg-[#0d1b2e] border border-[#1a3a5a] hover:border-[#00d8ff]/30 p-5 rounded-2xl transition duration-200 shadow-md flex flex-col justify-between relative overflow-hidden group ${
              userRole === "Admin" ? "cursor-pointer" : "opacity-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#4a6b8a]">
                Troca de Cartão Pendentes
              </span>
              <div className="p-2 bg-red-500/10 text-red-400 rounded-xl">
                <AlertTriangle size={16} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-black font-sans leading-none">
                {userRole === "Admin" ? stats.trocaPendentes : "■ Restrito"}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#4a6b8a]">
                <span>{userRole === "Admin" ? "Vencimentos monitorados" : "Perfil incorreto"}</span>
              </div>
            </div>
          </div>

          {/* Card 4: Controle PJ Contratos */}
          <div
            id="kpi-controle-pj"
            onClick={() => setActiveTab("pj")}
            className="bg-[#0d1b2e] border border-[#1a3a5a] hover:border-[#00d8ff]/30 p-5 rounded-2xl transition duration-200 cursor-pointer shadow-md flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00d8ff]/5 to-transparent rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#4a6b8a]">
                Controle PJ Ativos
              </span>
              <div className="p-2 bg-[#00d8ff]/10 text-[#00d8ff] rounded-xl">
                <Briefcase size={16} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-black font-sans leading-none">
                {stats.totalPj}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#00d8ff]">
                <Users size={12} />
                <span>{stats.totalPjAtivos} parcelas pendentes</span>
              </div>
            </div>
          </div>

        </div>

        <div id="dashboard-charts-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Chart 1: Evolution of Revenue (Valor Anterior vs Valor Atual) */}
          <div className="bg-[#0d1b2e] border border-[#1a3a5a] rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Comparativo de Migração Financeira
                </h3>
                <p className="text-[11px] text-[#4a6b8a]">
                  Preços de Planos Boleto (Anterior) contra Cartão Elos (Atual) em R$
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-red-400 rounded-full"></span>
                  <span className="text-slate-300">Anterior</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-[#00d8ff] rounded-full"></span>
                  <span className="text-[#00d8ff]">Atual Elos</span>
                </div>
              </div>
            </div>

            {/* Custom Interactive SVG Graph mimicking image_89f83f.png double line area diagram */}
            <div className="w-full h-64 bg-[#050d1a] rounded-xl border border-[#1a3a5a] p-4 relative flex flex-col justify-between">
              {/* Vertical Guide Lines */}
              <div className="absolute inset-0 p-4 flex justify-between pointer-events-none opacity-10">
                <div className="h-full border-l border-white"></div>
                <div className="h-full border-l border-white"></div>
                <div className="h-full border-l border-white"></div>
                <div className="h-full border-l border-white"></div>
                <div className="h-full border-l border-white"></div>
              </div>

              {/* Vector SVG representation */}
              <div className="w-full flex-1 relative">
                <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="gradAnterior" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f87171" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#f87171" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="gradAtual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00d8ff" stopOpacity="0.30" />
                      <stop offset="100%" stopColor="#00d8ff" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Red line area (Anterior) */}
                  <path
                    d="M 10 160 Q 120 130 230 110 T 380 90 T 490 80 L 490 200 L 10 200 Z"
                    fill="url(#gradAnterior)"
                  />
                  <path
                    d="M 10 160 Q 120 130 230 110 T 380 90 T 490 80"
                    fill="none"
                    stroke="#f87171"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Cyan line area (Atual Elos) */}
                  <path
                    d="M 10 170 Q 120 100 230 140 T 380 70 T 490 40 L 490 200 L 10 200 Z"
                    fill="url(#gradAtual)"
                  />
                  <path
                    d="M 10 170 Q 120 100 230 140 T 380 70 T 490 40"
                    fill="none"
                    stroke="#00d8ff"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="filter drop-shadow-[0_0_8px_rgba(0,216,255,0.3)]"
                  />

                  {/* Highlights Points */}
                  <circle cx="230" cy="140" r="5" fill="#00d8ff" />
                  <circle cx="380" cy="70" r="5" fill="#00d8ff" />
                  <circle cx="380" cy="90" r="4" fill="#f87171" />
                  <circle cx="490" cy="40" r="6" fill="#00d8ff" className="animate-ping" />
                  <circle cx="490" cy="40" r="5" fill="#ffffff" />
                </svg>

                {/* Legend Values on overlay */}
                <div className="absolute top-4 right-10 bg-[#0d1b2e]/90 border border-[#00d8ff]/30 rounded px-2.5 py-1 text-[10px] font-mono">
                  <p className="text-[#00d8ff] font-bold">Lote Atual: R$ {stats.totalMigrado.toLocaleString()}</p>
                </div>
              </div>

              {/* Chart X axis */}
              <div className="flex justify-between text-[11px] text-[#4a6b8a] font-mono mt-2">
                <span>Jan-Fev</span>
                <span>Março</span>
                <span>Abril</span>
                <span>Maio</span>
                <span>Jun (Hoje)</span>
              </div>
            </div>
          </div>

          {/* Chart 2: Pagamentos PJ Metodologia (PIX, Boleto, Elos Rec) & Alarm Status */}
          <div className="bg-[#0d1b2e] border border-[#1a3a5a] rounded-2xl p-6 shadow-md flex flex-col">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Distribuição de Pagamentos PJ e Alertas
              </h3>
              <p className="text-[11px] text-[#4a6b8a] mb-4">
                Formas de recolhimento dos clientes PJ sob supervisão ativa
              </p>
            </div>

            <div id="pj-distribution-container" className="flex-1 flex items-center justify-center w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center w-full">
                {/* Custom SVG Ring Donut Chart */}
                <div className="flex justify-center relative py-4">
                  <svg width="150" height="150" viewBox="0 0 100 100">
                    {/* Base Circle */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#050d1a" strokeWidth="10" />
                    
                    {/* Elos Rec segment (approx 60%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#00d8ff"
                      strokeWidth="10"
                      strokeDasharray="143 238"
                      strokeDashoffset="0"
                      className="filter drop-shadow-[0_0_4px_rgba(0,216,255,0.2)]"
                    />
                    
                    {/* PIX segment (approx 25%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#00a2ff"
                      strokeWidth="10"
                      strokeDasharray="60 238"
                      strokeDashoffset="-143"
                    />
                    
                    {/* Boleto segment (approx 15%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#4a6b8a"
                      strokeWidth="10"
                      strokeDasharray="35 238"
                      strokeDashoffset="-203"
                    />
                    
                    {/* Floating Center text */}
                    <text x="50" y="47" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                      {pjData.length}
                    </text>
                    <text x="50" y="60" textAnchor="middle" fill="#4a6b8a" fontSize="7" opacity="0.6">
                      CLIENTES
                    </text>
                  </svg>
                </div>

                {/* Legends with progress indicators */}
                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-[#00d8ff] rounded-full"></span>
                        <span>Elos Recorrente</span>
                      </span>
                      <span className="font-mono text-[#00d8ff] font-bold">60%</span>
                    </div>
                    <div className="w-full bg-[#050d1a] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#00d8ff] h-full" style={{ width: "60%" }}></div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-[#00a2ff] rounded-full"></span>
                        <span>PIX instantâneo</span>
                      </span>
                      <span className="font-mono text-[#00a2ff] font-bold">25%</span>
                    </div>
                    <div className="w-full bg-[#050d1a] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#00a2ff] h-full" style={{ width: "25%" }}></div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-[#4a6b8a] rounded-full"></span>
                        <span>Boleto Bancário</span>
                      </span>
                      <span className="font-mono text-[#4a6b8a] font-bold">15%</span>
                    </div>
                    <div className="w-full bg-[#050d1a] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#4a6b8a] h-full" style={{ width: "15%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RECENT ALERTS SECTION AND TABLE SUMMARIES */}
        <div id="alerts-quick-view-section" className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* List of Tomorrow's Expirations/Vencimentos */}
          <div className="xl:col-span-1 bg-[#0d1b2e] border border-[#1a3a5a] rounded-2xl p-6 flex flex-col h-[350px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <AlertCircle size={16} className="text-red-400 animate-pulse" />
                Vencendo Amanhã
              </h3>
              <span className="text-[10px] bg-red-500/20 text-red-300 font-semibold px-2 py-0.5 rounded-full">
                06/06 (Amanhã)
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {/* Filtering items whose expiration date is exactly "2026-06-06" (tomorrow) */}
              {(() => {
                const tomorrow = "2026-06-06";
                const mTom = filteredMigracao.filter(d => d.proximaParcela === tomorrow && d.status === "Pendente");
                const tTom = filteredTroca.filter(d => d.dataVencimentoParcela === tomorrow && d.status === "Pendente");
                const cTom = filteredCancelamento.filter(d => d.proximoVencimento === tomorrow && d.status === "Pendente");
                const pTom = filteredPj.filter(d => d.dataProximaParcela === tomorrow && d.status === "Pendente");

                const totalTomCount = mTom.length + tTom.length + cTom.length + pTom.length;

                if (totalTomCount === 0) {
                  return (
                    <div className="h-full flex items-center justify-center text-center p-6 text-xs text-[#4a6b8a]">
                      Nenhum vencimento ou obrigação financeira agendada para amanhã.
                    </div>
                  );
                }

                return (
                  <>
                    {mTom.map(d => (
                      <div key={d.id} className="bg-[#050d1a] border-l-4 border-[#00d8ff] p-3 rounded-r-lg space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-white">{d.codigoCliente}</span>
                          <span className="text-[#00d8ff] font-mono font-bold">R$ {d.valorAtual}</span>
                        </div>
                        <p className="text-[10.5px] text-slate-300 truncate">Migração Boleto → Cartão Elos</p>
                        <button
                          onClick={() => {
                            userRole === "Admin" ? setActiveTab("migracao") : setActiveTab("dashboard");
                          }}
                          className="text-[9px] text-[#00d8ff] hover:underline flex items-center gap-0.5"
                        >
                          Concluir registro <ArrowUpRight size={10} />
                        </button>
                      </div>
                    ))}
                    {tTom.map(d => (
                      <div key={d.id} className="bg-[#050d1a] border-l-4 border-amber-500 p-3 rounded-r-lg space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-white">{d.codigoCliente}</span>
                          <span className="text-amber-500 font-semibold">Pendente</span>
                        </div>
                        <p className="text-[10.5px] text-slate-300 truncate">Troca de Cartão Pendente</p>
                        <button
                          onClick={() => {
                            userRole === "Admin" ? setActiveTab("troca") : setActiveTab("dashboard");
                          }}
                          className="text-[9px] text-[#00d8ff] hover:underline flex items-center gap-0.5"
                        >
                          Concluir registro <ArrowUpRight size={10} />
                        </button>
                      </div>
                    ))}
                    {cTom.map(d => (
                      <div key={d.id} className="bg-[#050d1a] border-l-4 border-red-500 p-3 rounded-r-lg space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-white">{d.codigoCliente}</span>
                          <span className="text-red-400 font-mono font-bold">R$ {d.valorAtual}</span>
                        </div>
                        <p className="text-[10.5px] text-slate-300 truncate">Cancelamento → Boleto</p>
                        <button
                          onClick={() => {
                            userRole === "Admin" ? setActiveTab("cancelamento") : setActiveTab("dashboard");
                          }}
                          className="text-[9px] text-[#00d8ff] hover:underline flex items-center gap-0.5"
                        >
                          Concluir registro <ArrowUpRight size={10} />
                        </button>
                      </div>
                    ))}
                    {pTom.map(d => (
                      <div key={d.id} className="bg-[#050d1a] border-l-4 border-blue-400 p-3 rounded-r-lg space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-white">{d.codigoCliente}</span>
                          <span className="text-blue-400 font-mono font-bold">{d.formaPagamentoP1}</span>
                        </div>
                        <p className="text-[10.5px] text-slate-300 truncate">Controle de Mensalidade PJ</p>
                        <button
                          onClick={() => setActiveTab("pj")}
                          className="text-[9px] text-[#00d8ff] hover:underline flex items-center gap-0.5"
                        >
                          Concluir registro <ArrowUpRight size={10} />
                        </button>
                      </div>
                    ))}
                  </>
                );
              })()}
            </div>
          </div>

          {/* Table summary of all pending operations across tabs to keep everything highly actionable */}
          <div className="xl:col-span-2 bg-[#0d1b2e] border border-[#1a3a5a] rounded-2xl p-6 flex flex-col h-[350px]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Fila Geral de Lançamentos Pendentes
                </h3>
                <p className="text-[11px] text-[#4a6b8a]">
                  Resumo consolidado para auditoria rápida de registros não consolidados
                </p>
              </div>
              <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded">
                Geral
              </span>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-auto w-full">
              <table id="tbl-global-pending" className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1a3a5a] text-[#4a6b8a] pb-2">
                    <th className="py-2.5 font-bold">Cliente</th>
                    <th className="py-2.5 font-bold">Procedimento</th>
                    <th className="py-2.5 font-bold">Prioridade (IA)</th>
                    <th className="py-2.5 font-bold">Data Alvo/Próxima</th>
                    <th className="py-2.5 font-bold">Valor</th>
                    <th className="py-2.5 font-bold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a3a5a] text-slate-300">
                  {(() => {
                    const rowItems: any[] = [];
                    filteredMigracao.filter(x => x.status === "Pendente").forEach(x => {
                      rowItems.push({
                        cliente: x.codigoCliente,
                        tipo: "Migração Elos",
                        data: x.proximaParcela,
                        valor: `R$ ${x.valorAtual.toFixed(2)}`,
                        aba: "migracao",
                        rawObj: x
                      });
                    });
                    filteredTroca.filter(x => x.status === "Pendente").forEach(x => {
                      rowItems.push({
                        cliente: x.codigoCliente,
                        tipo: "Troca Cartão",
                        data: x.dataVencimentoParcela,
                        valor: "—",
                        aba: "troca",
                        rawObj: x
                      });
                    });
                    filteredCancelamento.filter(x => x.status === "Pendente").forEach(x => {
                      rowItems.push({
                        cliente: x.codigoCliente,
                        tipo: "Boleto Cancelado",
                        data: x.proximoVencimento,
                        valor: `R$ ${x.valorAtual.toFixed(2)}`,
                        aba: "cancelamento",
                        rawObj: x
                      });
                    });
                    filteredPj.filter(x => x.status === "Pendente").forEach(x => {
                      rowItems.push({
                        cliente: x.codigoCliente,
                        tipo: "Controle PJ",
                        data: x.dataProximaParcela,
                        valor: x.formaPagamentoP1,
                        aba: "pj",
                        rawObj: x
                      });
                    });

                    // Configure sort by Score_IA Descending (highest value first)
                    rowItems.sort((a, b) => {
                      const scoreA = typeof a.rawObj?.Score_IA === "number" ? a.rawObj.Score_IA : 0;
                      const scoreB = typeof b.rawObj?.Score_IA === "number" ? b.rawObj.Score_IA : 0;
                      if (scoreA !== scoreB) {
                        return scoreB - scoreA; // Descending
                      }
                      // Tie breaker: sort by target date ascending
                      return a.data.localeCompare(b.data);
                    });

                    if (rowItems.length === 0) {
                      return (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-[#4a6b8a]">
                            Fila vazia! Todos os registros financeiros estão concluídos e arquivados.
                          </td>
                        </tr>
                      );
                    }

                    return rowItems.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 font-semibold text-white">{row.cliente}</td>
                        <td className="py-3">
                          <span className={`inline-block px-2 py-0.5 text-[9px] font-semibold rounded-full ${
                            row.tipo === "Migração Elos" ? "bg-[#00d8ff]/10 text-[#00d8ff]" :
                            row.tipo === "Troca Cartão" ? "bg-amber-500/10 text-amber-500" :
                            row.tipo === "Boleto Cancelado" ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"
                          }`}>
                            {row.tipo}
                          </span>
                        </td>
                        <td className="py-3">
                          {row.rawObj?.Score_IA !== undefined ? (
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-bold rounded-md ${
                              row.rawObj.Score_IA >= 80 ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                              row.rawObj.Score_IA >= 50 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                              "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            }`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                              {row.rawObj.Score_IA}%
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">Analisando...</span>
                          )}
                        </td>
                        <td className="py-3 font-mono">
                          {row.data.split("-").reverse().join("/")}
                        </td>
                        <td className="py-3 font-semibold text-white">{row.valor}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => setActiveTab(row.aba)}
                            className="bg-white/5 hover:bg-[#00d8ff] hover:text-[#050d1a] px-2 py-1 rounded transition text-[10.5px] cursor-pointer"
                          >
                            Tratar
                          </button>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </main>

      {/* RENDER IMPORT DATA MODAL WITH MULTIPLE EXAMPLES TO FACILITATE TESTING */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div
            id="import-csv-modal"
            className="bg-[#0d1b2e] border border-[#1a3a5a] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-5 bg-[#050d1a] border-b border-[#1a3a5a] flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Upload size={16} className="text-[#00d8ff]" />
                Importar Planilha via CSV
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-[#4a6b8a] hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#4a6b8a] block mb-1.5">
                  1. Escolha a tabela de destino dos dados:
                </label>
                <select
                  value={importTarget}
                  onChange={(e) => {
                    setImportTarget(e.target.value);
                    setCsvRawText("");
                    setCsvError(null);
                  }}
                  className="w-full bg-[#050d1a] border border-[#1a3a5a] hover:border-[#00d8ff]/30 focus:border-[#00d8ff] rounded-lg px-3 py-2 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="migracao">A. MIGRAÇÃO BOLETO → CARTÃO ELOS</option>
                  {userRole === "Admin" && (
                    <>
                      <option value="troca">B. TROCA DE CARTÃO</option>
                      <option value="cancelamento">C. CANCELAMENTO RECORRENTE → BOLETO</option>
                    </>
                  )}
                  <option value="pj">D. CONTROLE PJ</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <label className="text-xs font-semibold text-[#4a6b8a] block">
                    2. Cole as linhas CSV estruturadas:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      // Insert placeholder templates based on target
                      if (importTarget === "migracao") {
                        setCsvRawText(
                          "DP-11051, PF, 220.00, Elos Rec 01, 200.00, 2026-06-06, Desconto de migração de férias\n" +
                          "DP-11082, Online, 150.00, Elos Rec 03, 140.00, 2026-06-07, Brinde kit higienização premium\n"
                        );
                      } else if (importTarget === "troca") {
                        setCsvRawText(
                          "DP-14022, 2026-06-06\n" +
                          "DP-14115, 2026-06-12\n"
                        );
                      } else if (importTarget === "cancelamento") {
                        setCsvRawText(
                          "DP-09110, 180.00, PF, 2026-06-02, Recusa no cartão por antifraude, Elos Rec - 10 dias, 195.00, 2026-06-06\n"
                        );
                      } else if (importTarget === "pj") {
                        setCsvRawText(
                          "PJ-50210, 2026-05-15, PIX, 2026-06-06\n" +
                          "PJ-50320, 2026-05-18, Elos Rec, 2026-06-18\n"
                        );
                      }
                    }}
                    className="text-[10px] text-[#00d8ff] hover:underline cursor-pointer font-medium"
                  >
                    Auto-colar exemplo
                  </button>
                </div>
                <textarea
                  value={csvRawText}
                  onChange={(e) => setCsvRawText(e.target.value)}
                  placeholder="Por exemplo: CÓDIGO, EMPRESA_ANTERIOR, VALOR..."
                  className="w-full bg-[#050d1a] border border-[#1a3a5a] hover:border-[#00d8ff]/30 focus:border-[#00d8ff] rounded-lg px-3 py-2.5 text-xs text-white outline-none min-h-[110px] font-mono leading-relaxed"
                ></textarea>
                <p className="text-[10px] text-[#4a6b8a] mt-1">
                  Insira uma linha por registro. Separe os campos por vírgulas.
                </p>
              </div>

              {csvError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-2 text-xs text-red-300">
                  <AlertCircle size={15} className="shrink-0 text-red-400 mt-0.5" />
                  <span>{csvError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1a3a5a]">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="bg-white/5 hover:bg-white/10 text-slate-300 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#00d8ff] to-[#00a2ff] text-white font-bold px-4 py-2 rounded-lg text-xs cursor-pointer hover:brightness-110 transition"
                >
                  Confirmar Importação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
