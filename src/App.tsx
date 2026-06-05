/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import AbaMigracao from "./components/AbaMigracao";
import AbaTrocaCartao from "./components/AbaTrocaCartao";
import AbaCancelamento from "./components/AbaCancelamento";
import AbaControlePJ from "./components/AbaControlePJ";
import UserManagement from "./components/UserManagement";

// Import types
import {
  MigracaoElos,
  TrocaCartao,
  CancelamentoBoleto,
  ControlePJ,
  AppNotification,
  SimulatedUser,
  UserRole
} from "./types";

// Import mock initial seeds as fallbacks
import {
  INITIAL_MIGRACAO_ELOS,
  INITIAL_TROCA_CARTAO,
  INITIAL_CANCELAMENTO_BOLETO,
  INITIAL_CONTROLE_PJ,
  INITIAL_NOTIFICATIONS,
  INITIAL_USERS
} from "./initialData";

// Import live Firebase Firestore database services
import { dbService, seedInitialDataIfRequired } from "./lib/firebase";

// Import new Security & Hashed Authentication Login page
import LoginPage from "./components/LoginPage";

export default function App() {
  // 1. Core States
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("dp_logged_in") === "true";
  });
  const [currentUserEmail, setCurrentUserEmail] = useState<string>(() => {
    return localStorage.getItem("dp_session_user_email") || "";
  });
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem("dp_user_role");
    return (saved as UserRole) || "Admin";
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    const saved = localStorage.getItem("dp_active_tab");
    return saved || "dashboard";
  });

  // DB Loading state
  const [dbLoading, setDbLoading] = useState(true);

  // Dynamic lists synchronized dynamically from Firestore
  const [migracaoData, setMigracaoData] = useState<MigracaoElos[]>([]);
  const [trocaData, setTrocaData] = useState<TrocaCartao[]>([]);
  const [cancelamentoData, setCancelamentoData] = useState<CancelamentoBoleto[]>([]);
  const [pjData, setPjData] = useState<ControlePJ[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [users, setUsers] = useState<SimulatedUser[]>([]);

  // 2. Fetch all collections from Firestore on mount
  useEffect(() => {
    async function loadDataFromFirestore() {
      try {
        setDbLoading(true);
        // Seed collections if Firestore instance has no documents yet
        await seedInitialDataIfRequired();

        const [dbUsers, dbMigs, dbTrocas, dbCancl, dbPJs, dbNotifs] = await Promise.all([
          dbService.getUsers(),
          dbService.getMigracoes(),
          dbService.getTrocas(),
          dbService.getCancelamentos(),
          dbService.getControlePJ(),
          dbService.getNotifications(),
        ]);

        if (dbUsers) {
          setUsers(dbUsers);
          const savedEmail = localStorage.getItem("dp_session_user_email") || "";
          const loggedUser = dbUsers.find(u => u.email === savedEmail);
          if (loggedUser) {
            setUserRole(loggedUser.role);
          }
        }
        if (dbMigs) setMigracaoData(dbMigs);
        if (dbTrocas) setTrocaData(dbTrocas);
        if (dbCancl) setCancelamentoData(dbCancl);
        if (dbPJs) setPjData(dbPJs);
        if (dbNotifs) setNotifications(dbNotifs);

      } catch (err) {
        console.error("Failed to load initial Firestore data. Falling back to local values:", err);
        // Fallback safely to memory defaults
        setUsers(INITIAL_USERS);
        setMigracaoData(INITIAL_MIGRACAO_ELOS);
        setTrocaData(INITIAL_TROCA_CARTAO);
        setCancelamentoData(INITIAL_CANCELAMENTO_BOLETO);
        setPjData(INITIAL_CONTROLE_PJ);
        setNotifications(INITIAL_NOTIFICATIONS);
      } finally {
        setDbLoading(false);
      }
    }

    loadDataFromFirestore();
  }, []);

  // --- SECURE SESSION HANDLERS ---
  const handleLoginSuccess = (user: SimulatedUser) => {
    setCurrentUserEmail(user.email);
    setUserRole(user.role);
    setIsLoggedIn(true);

    // Default redirection to permitted space
    const abas = user.Abas_Liberadas || [];
    if (abas.includes("Dashboard Principal")) {
      setActiveTab("dashboard");
    } else if (abas.length > 0) {
      const mappedDict: Record<string, string> = {
        "Dashboard Principal": "dashboard",
        "Migração Boleto → Cartão Elos": "migracao",
        "Troca de Cartão": "troca",
        "Cancelamento Recorrente → Boleto": "cancelamento",
        "Controle PJ": "pj"
      };
      const first = abas[0];
      if (mappedDict[first]) {
        setActiveTab(mappedDict[first]);
      } else {
        setActiveTab("dashboard");
      }
    } else {
      setActiveTab("dashboard");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("dp_logged_in");
    localStorage.removeItem("dp_session_user_email");
    localStorage.removeItem("dp_session_last_activity");
    setIsLoggedIn(false);
    setCurrentUserEmail("");
  };

  // Automated session timeout monitor (Logs out after 2 hours of inactivity)
  useEffect(() => {
    if (!isLoggedIn) return;

    const handleSessionActivity = () => {
      localStorage.setItem("dp_session_last_activity", Date.now().toString());
    };

    window.addEventListener("mousemove", handleSessionActivity);
    window.addEventListener("keydown", handleSessionActivity);
    window.addEventListener("click", handleSessionActivity);

    // Setup initial activity marker if missing
    if (!localStorage.getItem("dp_session_last_activity")) {
      localStorage.setItem("dp_session_last_activity", Date.now().toString());
    }

    const intervalId = setInterval(() => {
      const lastActivityStr = localStorage.getItem("dp_session_last_activity") || "0";
      const lastActivity = parseInt(lastActivityStr, 10);
      const TWO_HOURS_MS = 2 * 60 * 60 * 1000; // 2 Hours security window
      
      if (Date.now() - lastActivity > TWO_HOURS_MS) {
        handleLogout();
        alert("Sua sessão expirou por inatividade de segurança (2 horas de ócio total). Por favor, realize um novo login.");
      }
    }, 10000); // Check every 10 seconds

    return () => {
      window.removeEventListener("mousemove", handleSessionActivity);
      window.removeEventListener("keydown", handleSessionActivity);
      window.removeEventListener("click", handleSessionActivity);
      clearInterval(intervalId);
    };
  }, [isLoggedIn]);

  // Sync Preferences to localStorage
  useEffect(() => {
    localStorage.setItem("dp_user_role", userRole);
  }, [userRole]);

  useEffect(() => {
    localStorage.setItem("dp_active_tab", activeTab);
  }, [activeTab]);

  // Expand native datepicker popup on field click instantly (Satisfies custom UX requirements)
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.tagName === "INPUT" && (target as HTMLInputElement).type === "date") {
        try {
          (target as HTMLInputElement).showPicker();
        } catch (err) {
          // Guard for unsupported contexts
        }
      }
    };
    document.addEventListener("click", handleGlobalClick);
    return () => {
      document.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  // Notifications sync helper to write updates in background to Firestore
  const syncNotificationsToFirestore = async (prev: AppNotification[], next: AppNotification[]) => {
    try {
      // 1. Detect deletes
      const nextIds = new Set(next.map(n => n.id));
      const deleted = prev.filter(n => !nextIds.has(n.id));
      for (const item of deleted) {
        dbService.deleteNotification(item.id).catch(console.error);
      }

      // 2. Detect additions or changes
      for (const item of next) {
        const prevItem = prev.find(n => n.id === item.id);
        if (!prevItem || JSON.stringify(prevItem) !== JSON.stringify(item)) {
          dbService.saveNotification(item).catch(console.error);
        }
      }
    } catch (err) {
      console.error("Error syncing notifications changes to Firestore:", err);
    }
  };

  const handleSetNotifications = (action: React.SetStateAction<AppNotification[]>) => {
    setNotifications(prev => {
      const next = typeof action === "function" ? action(prev) : action;
      syncNotificationsToFirestore(prev, next);
      return next;
    });
  };

  // 3. Automate Daily Expirations checking alerts system on bootstrap
  useEffect(() => {
    if (dbLoading) return; // Prevent double alerts during synchronization load

    const tomorrowStr = "2026-06-06"; // Relative tomorrow for testing simulation
    const todayStr = "2026-06-05";
    const generatedAlerts: AppNotification[] = [];

    // Check A (Migrações)
    migracaoData.forEach(d => {
      if (d.proximaParcela === tomorrowStr && d.status === "Pendente") {
        const alreadyNotified = notifications.some(n => n.referenciaId === d.id);
        if (!alreadyNotified) {
          generatedAlerts.push({
            id: `not-auto-mig-${d.id}`,
            tipo: "vencimento",
            mensagem: `ALERTA VENCIMENTO: Próxima parcela do cliente ${d.codigoCliente} (Migração Elos) é amanhã, valor R$ ${d.valorAtual.toFixed(2)}.`,
            lida: false,
            data: todayStr,
            referenciaId: d.id,
            aba: "migracao"
          });
        }
      }
    });

    // Check B (Trocas)
    trocaData.forEach(d => {
      if (d.dataVencimentoParcela === tomorrowStr && d.status === "Pendente") {
        const alreadyNotified = notifications.some(n => n.referenciaId === d.id);
        if (!alreadyNotified) {
          generatedAlerts.push({
            id: `not-auto-trc-${d.id}`,
            tipo: "vencimento",
            mensagem: `ALERTA VENCIMENTO: Prazo limite para troca do cartão do cliente ${d.codigoCliente} é amanhã.`,
            lida: false,
            data: todayStr,
            referenciaId: d.id,
            aba: "troca"
          });
        }
      }
    });

    // Check C (Cancelamentos / Boleto)
    cancelamentoData.forEach(d => {
      if (d.proximoVencimento === tomorrowStr && d.status === "Pendente") {
        const alreadyNotified = notifications.some(n => n.referenciaId === d.id);
        if (!alreadyNotified) {
          generatedAlerts.push({
            id: `not-auto-can-${d.id}`,
            tipo: "vencimento",
            mensagem: `ALERTA VENCIMENTO: Vencimento do primeiro boleto do cliente ${d.codigoCliente} (Cancelado Recorrente) é amanhã, valor R$ ${d.valorAtual.toFixed(2)}.`,
            lida: false,
            data: todayStr,
            referenciaId: d.id,
            aba: "cancelamento"
          });
        }
      }
    });

    // Check D (Controle PJ)
    pjData.forEach(d => {
      if (d.dataProximaParcela === tomorrowStr && d.status === "Pendente") {
        const alreadyNotified = notifications.some(n => n.referenciaId === d.id);
        if (!alreadyNotified) {
          generatedAlerts.push({
            id: `not-auto-pj-${d.id}`,
            tipo: "vencimento",
            mensagem: `ALERTA VENCIMENTO: Mensalidade PJ do cliente corporativo ${d.codigoCliente} vence amanhã (${d.formaPagamentoP1}).`,
            lida: false,
            data: todayStr,
            referenciaId: d.id,
            aba: "pj"
          });
        }
      }
    });

    if (generatedAlerts.length > 0) {
      handleSetNotifications(prev => [...generatedAlerts, ...prev]);
    }
  }, [migracaoData, trocaData, cancelamentoData, pjData, dbLoading]);

  // 4. Autonomous AI Prioritization API Trigger (Workflow)
  const triggerAIPrioritization = async (
    type: "migracao" | "troca" | "cancelamento" | "pj",
    id: string,
    dataVencimento: string,
    valorAtual: number,
    motivo: string
  ) => {
    console.log(`[Trigger AI] Requesting score for ${type} id ${id}. Vencimento: ${dataVencimento}, Valor: ${valorAtual}`);
    try {
      const res = await fetch("/api/prioritize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataVencimento, valorAtual, motivo })
      });
      if (res.ok) {
        const { score } = await res.json();
        if (typeof score === "number") {
          updateRecordScore(type, id, score);
          return;
        }
      }
    } catch (err) {
      console.error("Failed to fetch server-side AI score:", err);
    }

    // Secure local fallback calculation complying with regulatory instructions
    let fallback = 20;
    const today = "2026-06-05";
    const tomorrow = "2026-06-06";
    if (dataVencimento === today || dataVencimento === tomorrow) {
      fallback += 50;
    }
    if (valorAtual > 250) {
      fallback += 30;
    } else if (valorAtual > 100) {
      fallback += 18;
    } else if (valorAtual > 0) {
      fallback += 8;
    }
    fallback = Math.min(fallback, 100);
    updateRecordScore(type, id, fallback);
  };

  const updateRecordScore = (type: string, id: string, score: number) => {
    if (type === "migracao") {
      setMigracaoData(prev => prev.map(r => {
        if (r.id === id) {
          const updated = { ...r, Score_IA: score };
          dbService.saveMigracao(updated).catch(console.error);
          return updated;
        }
        return r;
      }));
    } else if (type === "troca") {
      setTrocaData(prev => prev.map(r => {
        if (r.id === id) {
          const updated = { ...r, Score_IA: score };
          dbService.saveTroca(updated).catch(console.error);
          return updated;
        }
        return r;
      }));
    } else if (type === "cancelamento") {
      setCancelamentoData(prev => prev.map(r => {
        if (r.id === id) {
          const updated = { ...r, Score_IA: score };
          dbService.saveCancelamento(updated).catch(console.error);
          return updated;
        }
        return r;
      }));
    } else if (type === "pj") {
      setPjData(prev => prev.map(r => {
        if (r.id === id) {
          const updated = { ...r, Score_IA: score };
          dbService.saveControlePJ(updated).catch(console.error);
          return updated;
        }
        return r;
      }));
    }
  };

  // 5. Background Scanner Effect to autonomously score any unrated records sequentially
  useEffect(() => {
    if (dbLoading) return;

    let triggered = false;

    // Scan Migracao
    const unscoredMigracao = migracaoData.find(item => item.Score_IA === undefined);
    if (unscoredMigracao) {
      triggered = true;
      triggerAIPrioritization("migracao", unscoredMigracao.id, unscoredMigracao.proximaParcela, unscoredMigracao.valorAtual, unscoredMigracao.premiacao);
    }

    if (!triggered) {
      // Scan Troca
      const unscoredTroca = trocaData.find(item => item.Score_IA === undefined);
      if (unscoredTroca) {
        triggered = true;
        triggerAIPrioritization("troca", unscoredTroca.id, unscoredTroca.dataVencimentoParcela, 0, "Troca de cartão pendente");
      }
    }

    if (!triggered) {
      // Scan Cancelamento
      const unscoredCan = cancelamentoData.find(item => item.Score_IA === undefined);
      if (unscoredCan) {
        triggered = true;
        triggerAIPrioritization("cancelamento", unscoredCan.id, unscoredCan.proximoVencimento, unscoredCan.valorAtual, unscoredCan.motivoCancelamento);
      }
    }

    if (!triggered) {
      // Scan PJ
      const unscoredPj = pjData.find(item => item.Score_IA === undefined);
      if (unscoredPj) {
        triggered = true;
        triggerAIPrioritization("pj", unscoredPj.id, unscoredPj.dataProximaParcela, 0, unscoredPj.formaPagamentoP1);
      }
    }
  }, [migracaoData, trocaData, cancelamentoData, pjData, dbLoading]);

  // 6. CRUD operation handlers

  // A. MIGRAÇÃO BOLETO → CARTÃO ELOS handlers
  const handleAddMigracao = (newReg: Omit<MigracaoElos, "id" | "dataCriacao" | "status">) => {
    const id = `mig-${Date.now()}`;
    const entry: MigracaoElos = {
      ...newReg,
      id,
      status: "Pendente",
      dataCriacao: new Date().toISOString().split("T")[0]
    };
    setMigracaoData(prev => [entry, ...prev]);
    dbService.saveMigracao(entry).catch(console.error);

    // Trigger autonomous AI workflow
    triggerAIPrioritization("migracao", entry.id, entry.proximaParcela, entry.valorAtual, entry.premiacao);
  };

  const handleUpdateMigracao = (id: string, updates: Partial<MigracaoElos>) => {
    setMigracaoData(prev => {
      const updated = prev.map(r => {
        if (r.id === id) {
          const item = { ...r, ...updates, modificadoPor: currentUserEmail };
          dbService.saveMigracao(item).catch(console.error);
          return item;
        }
        return r;
      });
      const target = updated.find(r => r.id === id);
      if (target) {
        triggerAIPrioritization("migracao", id, target.proximaParcela, target.valorAtual, target.premiacao);
      }
      return updated;
    });
  };

  const handleDeleteMigracao = (id: string) => {
    setMigracaoData(prev => prev.filter(r => r.id !== id));
    dbService.deleteMigracao(id).catch(console.error);
  };

  const handleCompleteMigracao = (id: string) => {
    setMigracaoData(prev =>
      prev.map(r => {
        if (r.id === id) {
          const item: MigracaoElos = {
            ...r,
            status: "Completo",
            dataConclusao: new Date().toISOString().split("T")[0],
            modificadoPor: currentUserEmail
          };
          dbService.saveMigracao(item).catch(console.error);
          return item;
        }
        return r;
      })
    );
  };

  // B. TROCA DE CARTÃO handlers
  const handleAddTroca = (newReg: { codigoCliente: string; dataVencimentoParcela: string }) => {
    const entry: TrocaCartao = {
      id: `trc-${Date.now()}`,
      codigoCliente: newReg.codigoCliente,
      dataVencimentoParcela: newReg.dataVencimentoParcela,
      status: "Pendente",
      dataCriacao: new Date().toISOString().split("T")[0]
    };
    setTrocaData(prev => [entry, ...prev]);
    dbService.saveTroca(entry).catch(console.error);

    // Trigger autonomous AI workflow
    triggerAIPrioritization("troca", entry.id, entry.dataVencimentoParcela, 0, "Troca de cartão pendente");
  };

  const handleUpdateTroca = (id: string, updates: Partial<TrocaCartao>) => {
    setTrocaData(prev => {
      const updated = prev.map(r => {
        if (r.id === id) {
          const item = { ...r, ...updates, modificadoPor: currentUserEmail };
          dbService.saveTroca(item).catch(console.error);
          return item;
        }
        return r;
      });
      const target = updated.find(r => r.id === id);
      if (target) {
        triggerAIPrioritization("troca", id, target.dataVencimentoParcela, 0, "Troca de cartão pendente");
      }
      return updated;
    });
  };

  const handleDeleteTroca = (id: string) => {
    setTrocaData(prev => prev.filter(r => r.id !== id));
    dbService.deleteTroca(id).catch(console.error);
  };

  const handleCompleteTroca = (id: string) => {
    setTrocaData(prev =>
      prev.map(r => {
        if (r.id === id) {
          const item: TrocaCartao = {
            ...r,
            status: "Completo",
            dataConclusao: new Date().toISOString().split("T")[0],
            modificadoPor: currentUserEmail
          };
          dbService.saveTroca(item).catch(console.error);
          return item;
        }
        return r;
      })
    );
  };

  // C. CANCELAMENTO RECORRENTE → BOLETO handlers
  const handleAddCancelamento = (newReg: Omit<CancelamentoBoleto, "id" | "dataCriacao" | "status">) => {
    const entry: CancelamentoBoleto = {
      ...newReg,
      id: `can-${Date.now()}`,
      status: "Pendente",
      dataCriacao: new Date().toISOString().split("T")[0]
    };
    setCancelamentoData(prev => [entry, ...prev]);
    dbService.saveCancelamento(entry).catch(console.error);

    // Trigger autonomous AI workflow
    triggerAIPrioritization("cancelamento", entry.id, entry.proximoVencimento, entry.valorAtual, entry.motivoCancelamento);
  };

  const handleUpdateCancelamento = (id: string, updates: Partial<CancelamentoBoleto>) => {
    setCancelamentoData(prev => {
      const updated = prev.map(r => {
        if (r.id === id) {
          const item = { ...r, ...updates, modificadoPor: currentUserEmail };
          dbService.saveCancelamento(item).catch(console.error);
          return item;
        }
        return r;
      });
      const target = updated.find(r => r.id === id);
      if (target) {
        triggerAIPrioritization("cancelamento", id, target.proximoVencimento, target.valorAtual, target.motivoCancelamento);
      }
      return updated;
    });
  };

  const handleDeleteCancelamento = (id: string) => {
    setCancelamentoData(prev => prev.filter(r => r.id !== id));
    dbService.deleteCancelamento(id).catch(console.error);
  };

  const handleCompleteCancelamento = (id: string) => {
    setCancelamentoData(prev =>
      prev.map(r => {
        if (r.id === id) {
          const item: CancelamentoBoleto = {
            ...r,
            status: "Completo",
            dataConclusao: new Date().toISOString().split("T")[0],
            modificadoPor: currentUserEmail
          };
          dbService.saveCancelamento(item).catch(console.error);
          return item;
        }
        return r;
      })
    );
  };

  // D. CONTROLE PJ handlers
  const handleAddPJ = (newReg: {
    codigoCliente: string;
    dataContratacao: string;
    formaPagamentoP1: "Elos Rec" | "PIX" | "Boleto";
    dataProximaParcela: string;
  }) => {
    const logDate = new Date().toISOString().replace("T", " ").substring(0, 16);
    const entry: ControlePJ = {
      id: `pj-${Date.now()}`,
      codigoCliente: newReg.codigoCliente,
      dataContratacao: newReg.dataContratacao,
      formaPagamentoP1: newReg.formaPagamentoP1,
      dataProximaParcela: newReg.dataProximaParcela,
      status: "Pendente",
      dataCriacao: new Date().toISOString().split("T")[0],
      historicoModificacoes: [
        `${logDate} - Contrato incorporado PJ por ${currentUserEmail}. Opção P1 selecionada: ${newReg.formaPagamentoP1}.`
      ]
    };
    setPjData(prev => [entry, ...prev]);
    dbService.saveControlePJ(entry).catch(console.error);

    // Trigger autonomous AI workflow
    triggerAIPrioritization("pj", entry.id, entry.dataProximaParcela, 0, entry.formaPagamentoP1);
  };

  const handleUpdatePJ = (id: string, updates: Partial<ControlePJ> & { logMsg?: string }) => {
    setPjData(prev => {
      const updated = prev.map(r => {
        if (r.id === id) {
          const list = [...(r.historicoModificacoes || [])];
          if (updates.logMsg) {
            list.push(updates.logMsg);
          }
          const item = {
            ...r,
            codigoCliente: updates.codigoCliente !== undefined ? updates.codigoCliente : r.codigoCliente,
            dataContratacao: updates.dataContratacao !== undefined ? updates.dataContratacao : r.dataContratacao,
            formaPagamentoP1: updates.formaPagamentoP1 !== undefined ? updates.formaPagamentoP1 : r.formaPagamentoP1,
            dataProximaParcela: updates.dataProximaParcela !== undefined ? updates.dataProximaParcela : r.dataProximaParcela,
            historicoModificacoes: list,
            modificadoPor: currentUserEmail
          };
          dbService.saveControlePJ(item).catch(console.error);
          return item;
        }
        return r;
      });
      const target = updated.find(r => r.id === id);
      if (target) {
        triggerAIPrioritization("pj", id, target.dataProximaParcela, 0, target.formaPagamentoP1);
      }
      return updated;
    });
  };

  const handleDeletePJ = (id: string) => {
    setPjData(prev => prev.filter(r => r.id !== id));
    dbService.deleteControlePJ(id).catch(console.error);
  };

  const handleCompletePJ = (id: string) => {
    const logDate = new Date().toISOString().replace("T", " ").substring(0, 16);
    setPjData(prev =>
      prev.map(r => {
        if (r.id === id) {
          const list = [...(r.historicoModificacoes || [])];
          list.push(`${logDate} - Parcela P1 compensada e validada no extrato por ${currentUserEmail}. Status migrado para Concluído.`);
          const item: ControlePJ = {
            ...r,
            status: "Completo",
            dataConclusao: new Date().toISOString().split("T")[0],
            historicoModificacoes: list,
            modificadoPor: currentUserEmail
          };
          dbService.saveControlePJ(item).catch(console.error);
          return item;
        }
        return r;
      })
    );
  };

  // CSV Import Bulk loader
  const handleImportCSVData = (aba: string, rows: any[]) => {
    if (aba === "migracao") {
      setMigracaoData(prev => [...rows, ...prev]);
      for (const r of rows) {
        dbService.saveMigracao(r).catch(console.error);
      }
    } else if (aba === "troca") {
      setTrocaData(prev => [...rows, ...prev]);
      for (const r of rows) {
        dbService.saveTroca(r).catch(console.error);
      }
    } else if (aba === "cancelamento") {
      setCancelamentoData(prev => [...rows, ...prev]);
      for (const r of rows) {
        dbService.saveCancelamento(r).catch(console.error);
      }
    } else if (aba === "pj") {
      const logsReadyRows = rows.map(r => {
        const logDate = new Date().toISOString().replace("T", " ").substring(0, 16);
        return {
          ...r,
          historicoModificacoes: [`${logDate} - Importado em lote via arquivo CSV por ${currentUserEmail}.`]
        };
      });
      setPjData(prev => [...logsReadyRows, ...prev]);
      for (const r of logsReadyRows) {
        dbService.saveControlePJ(r).catch(console.error);
      }
    }
  };

  // Simulating User Access Permissions Page Handlers
  const handleAddUser = (newU: Omit<SimulatedUser, "id" | "createdAt">) => {
    const defaultAbas = newU.role === "Admin" ? [
      "Dashboard Principal",
      "Migração Boleto → Cartão Elos",
      "Troca de Cartão",
      "Cancelamento Recorrente → Boleto",
      "Controle PJ"
    ] : [
      "Dashboard Principal",
      "Controle PJ"
    ];

    const user: SimulatedUser = {
      ...newU,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
      Abas_Liberadas: defaultAbas,
      passwordHash: newU.role === "Admin"
        ? "24075307010a70183307f7c00650943ebdf1b69f69abcf5862d2bc27af34ef9b" // Hash for default "admin123"
        : "55d64817a18bbba7fa87d1880e6efade1db8c1ed8cfb048cb159b3ee3322fb68"  // Hash for default "comercial123"
    };
    setUsers(prev => [...prev, user]);
    dbService.saveUser(user).catch(console.error);
  };

  const handleUpdateUser = (id: string, updates: Partial<SimulatedUser>) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === id) {
          const item = { ...u, ...updates };
          dbService.saveUser(item).catch(console.error);
          return item;
        }
        return u;
      })
    );
    // If Admin changes their own role, synchronize userRole immediately for display
    const selfUser = users.find(u => u.id === id);
    if (selfUser && selfUser.email === currentUserEmail && updates.role) {
      setUserRole(updates.role);
    }
  };

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    dbService.deleteUser(id).catch(console.error);
  };

  // Dynamic RBAC Protection Rules:
  // Check if current logged-in user is authorized for the active tab view.
  const hasTabPermission = () => {
    const userObj = users.find(u => u.email === currentUserEmail) || users[0];
    if (!userObj) return true;

    if (activeTab === "usuarios") {
      return userRole === "Admin";
    }

    const abas = userObj.Abas_Liberadas || [];
    if (activeTab === "dashboard") return abas.includes("Dashboard Principal");
    if (activeTab === "migracao") return abas.includes("Migração Boleto → Cartão Elos");
    if (activeTab === "troca") return abas.includes("Troca de Cartão");
    if (activeTab === "cancelamento") return abas.includes("Cancelamento Recorrente → Boleto");
    if (activeTab === "pj") return abas.includes("Controle PJ");

    return true;
  };

  const isAuthorized = hasTabPermission();

  if (dbLoading) {
    return (
      <div id="db-loading-screen" className="flex h-screen w-screen flex-col items-center justify-center bg-[#0d1626]">
        {/* Sleek rotating ring logo */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-16 h-16 border-4 border-cyan-500/10 rounded-full"></div>
          <div className="absolute w-16 h-16 border-4 border-t-cyan-400 border-l-cyan-400 rounded-full animate-spin"></div>
          <svg className="absolute w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.24 12.24a6 6 0 1 1-8.49-8.49" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 3l-6 6" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 9V3h-6" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-white tracking-wide">DentalPlus Gestão Financeira</h2>
        <p className="text-xs text-[#4a6b8a] mt-2 animate-pulse">Sincronizando com o banco de dados nuvem...</p>
      </div>
    );
  }

  // Page protection guard (Ensures logged out users are strictly restricted to the Login screen)
  if (!isLoggedIn) {
    return <LoginPage users={users} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div id="application-layout" className="flex h-screen w-screen overflow-hidden bg-[#1e293b]">

      {/* 1. Left Navigation Menu Side rail */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        userEmail={currentUserEmail}
        users={users}
        setCurrentUserEmail={setCurrentUserEmail}
        onLogout={handleLogout}
      />

      {/* 2. Main Center Body Panel Container */}
      <div id="main-content-panel" className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

        {!isAuthorized ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#1e293b] p-10 text-center animate-pulse">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl mb-6 text-red-400">
              <svg className="w-12 h-12 stroke-current" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Acesso Restrito / Não Autorizado</h3>
            <p className="text-xs text-[#4a6b8a] max-w-md mb-6">
              Seu usuário (<span className="text-[#00d8ff] font-mono">{currentUserEmail}</span>) não possui permissões liberadas para visualizar a tela selecionada. Contate um administrador para liberar acesso nas configurações do painel.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  // Fallback to whichever is allowed
                  const userObj = users.find(u => u.email === currentUserEmail) || users[0];
                  const abas = userObj?.Abas_Liberadas || [];
                  if (abas.includes("Dashboard Principal")) {
                    setActiveTab("dashboard");
                  } else if (abas.length > 0) {
                    const mappedDict: Record<string, string> = {
                      "Dashboard Principal": "dashboard",
                      "Migração Boleto → Cartão Elos": "migracao",
                      "Troca de Cartão": "troca",
                      "Cancelamento Recorrente → Boleto": "cancelamento",
                      "Controle PJ": "pj"
                    };
                    const first = abas[0];
                    if (mappedDict[first]) {
                      setActiveTab(mappedDict[first]);
                    } else {
                      setActiveTab("dashboard");
                    }
                  } else {
                    setActiveTab("dashboard");
                  }
                }}
                className="bg-gradient-to-r from-red-500 to-amber-600 hover:brightness-110 text-white font-bold py-2.5 px-5 rounded-lg text-xs leading-none transition cursor-pointer"
              >
                Voltar para Área Segura
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Render correct tab component based on state */}
            {activeTab === "dashboard" && (
              <DashboardView
                migracaoData={migracaoData}
                trocaData={trocaData}
                cancelamentoData={cancelamentoData}
                pjData={pjData}
                notifications={notifications}
                setNotifications={handleSetNotifications}
                userRole={userRole}
                onImportData={handleImportCSVData}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === "migracao" && (
              <AbaMigracao
                data={migracaoData}
                onAdd={handleAddMigracao}
                onUpdate={handleUpdateMigracao}
                onDelete={handleDeleteMigracao}
                onComplete={handleCompleteMigracao}
                currentUserEmail={currentUserEmail}
              />
            )}

            {activeTab === "troca" && (
              <AbaTrocaCartao
                data={trocaData}
                onAdd={handleAddTroca}
                onUpdate={handleUpdateTroca}
                onDelete={handleDeleteTroca}
                onComplete={handleCompleteTroca}
                currentUserEmail={currentUserEmail}
              />
            )}

            {activeTab === "cancelamento" && (
              <AbaCancelamento
                data={cancelamentoData}
                onAdd={handleAddCancelamento}
                onUpdate={handleUpdateCancelamento}
                onDelete={handleDeleteCancelamento}
                onComplete={handleCompleteCancelamento}
                currentUserEmail={currentUserEmail}
              />
            )}

            {activeTab === "pj" && (
              <AbaControlePJ
                data={pjData}
                onAdd={handleAddPJ}
                onUpdate={handleUpdatePJ}
                onDelete={handleDeletePJ}
                onComplete={handleCompletePJ}
                currentUserEmail={currentUserEmail}
              />
            )}

            {activeTab === "usuarios" && (
              <UserManagement
                users={users}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
                currentUserEmail={currentUserEmail}
              />
            )}
          </>
        )}

      </div>

    </div>
  );
}
