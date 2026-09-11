"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Send,
  Check,
  CheckCheck,
  Clock,
  Phone,
  Mail,
  Building2,
  Tag,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  X,
  Plus,
  ExternalLink,
  ChevronRight,
  Filter,
  User,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  WhatsAppConversation,
  WhatsAppMessage,
  getWhatsAppConversations,
  getConversationMessages,
  mockConversations,
  mockMessages,
  mockWhatsAppTemplates,
  DEFAULT_WORKSPACE_ID,
} from "@/lib/whatsapp/service";
import { createClient } from "@/lib/supabase/client";

export default function WhatsAppInboxPage() {
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">("open");
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>(mockWhatsAppTemplates);
  const [isSyncingTemplates, setIsSyncingTemplates] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = useMemo(() => createClient(), []);

  // Fetch initial conversations
  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const data = await getWhatsAppConversations(DEFAULT_WORKSPACE_ID, statusFilter);
      setConversations(data);
      if (data.length > 0 && !selectedConvId) {
        setSelectedConvId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
      setConversations(mockConversations);
      if (!selectedConvId && mockConversations.length > 0) {
        setSelectedConvId(mockConversations[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [statusFilter]);

  // Load messages whenever selected conversation changes
  useEffect(() => {
    if (!selectedConvId) {
      setMessages([]);
      return;
    }

    async function loadMessages() {
      setIsLoadingMessages(true);
      try {
        const msgs = await getConversationMessages(selectedConvId!);
        setMessages(msgs);
      } catch (err) {
        console.error("Failed to load messages:", err);
        setMessages(mockMessages[selectedConvId!] || []);
      } finally {
        setIsLoadingMessages(false);
      }
    }

    loadMessages();

    // Mark as read locally
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedConvId ? { ...c, unread_count: 0 } : c))
    );
  }, [selectedConvId]);

  // Auto-scroll to bottom of thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoadingMessages]);

  // Supabase Realtime subscription for instant new messages
  useEffect(() => {
    const channel = supabase
      .channel("inbox-live-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMsg = payload.new as any;
          if (newMsg.conversation_id === selectedConvId) {
            setMessages((prev) => [
              ...prev,
              {
                id: newMsg.id,
                conversation_id: newMsg.conversation_id,
                sender_type: newMsg.sender_type,
                content_type: newMsg.content_type || "text",
                content_text: newMsg.content_text,
                template_name: newMsg.template_name,
                message_id: newMsg.message_id,
                status: newMsg.status || "delivered",
                created_at: newMsg.created_at || new Date().toISOString(),
              },
            ]);
          }

          // Update conversation list snippet
          setConversations((prev) =>
            prev.map((c) =>
              c.id === newMsg.conversation_id
                ? {
                    ...c,
                    last_message_text: newMsg.content_text,
                    last_message_at: newMsg.created_at,
                    unread_count:
                      newMsg.sender_type === "customer" && c.id !== selectedConvId
                        ? c.unread_count + 1
                        : c.unread_count,
                  }
                : c
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConvId, supabase]);

  // Selected conversation object
  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === selectedConvId) || null;
  }, [conversations, selectedConvId]);

  // Filtered conversation list
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const name = `${c.contact?.first_name || ""} ${c.contact?.last_name || ""}`.toLowerCase();
      const phone = (c.contact?.phone || "").toLowerCase();
      const company = (c.contact?.company || "").toLowerCase();
      const q = searchQuery.toLowerCase();
      return name.includes(q) || phone.includes(q) || company.includes(q);
    });
  }, [conversations, searchQuery]);

  // Send plain text message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedConvId || isSending) return;

    const messageText = inputText.trim();
    setInputText("");
    setIsSending(true);

    // Optimistic message in UI
    const tempId = `temp_${Date.now()}`;
    const optimisticMsg: WhatsAppMessage = {
      id: tempId,
      conversation_id: selectedConvId,
      sender_type: "agent",
      content_type: "text",
      content_text: messageText,
      status: "sending",
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: selectedConvId,
          message_type: "text",
          content_text: messageText,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to deliver message via Meta Cloud API");
      }

      // Update optimistic message with real status & id
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? {
                ...m,
                id: data.message?.id || tempId,
                status: "sent",
                message_id: data.message?.message_id,
              }
            : m
        )
      );

      // Update conversation in list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConvId
            ? {
                ...c,
                last_message_text: messageText,
                last_message_at: new Date().toISOString(),
              }
            : c
        )
      );
    } catch (err: any) {
      console.error("Send message failed:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? {
                ...m,
                status: "failed",
                error_message: err.message,
              }
            : m
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  // Send WhatsApp Template message
  const handleSendTemplate = async () => {
    if (!selectedTemplate || !selectedConvId || isSending) return;

    setIsSending(true);
    const templateName = selectedTemplate.name;

    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: selectedConvId,
          message_type: "template",
          template_name: templateName,
          template_language: selectedTemplate.language || "en_US",
          template_params: [activeConversation?.contact?.first_name || "Customer"],
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to dispatch template");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: data.message?.id || `tpl_${Date.now()}`,
          conversation_id: selectedConvId,
          sender_type: "agent",
          content_type: "template",
          template_name: templateName,
          content_text: selectedTemplate.body_text || `Template: ${templateName}`,
          status: "sent",
          created_at: new Date().toISOString(),
        },
      ]);

      setShowTemplateModal(false);
      setSelectedTemplate(null);
    } catch (err: any) {
      alert(`Error sending template: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // Toggle conversation status (open/closed)
  const toggleStatus = async () => {
    if (!activeConversation) return;
    const newStatus = activeConversation.status === "open" ? "closed" : "open";

    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversation.id ? { ...c, status: newStatus } : c))
    );

    try {
      const supabaseAdmin = createClient();
      await supabaseAdmin
        .from("conversations")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", activeConversation.id);
    } catch (err) {
      console.warn("Status toggle note:", err);
    }
  };

  // Sync templates from Meta
  const handleSyncTemplates = async () => {
    setIsSyncingTemplates(true);
    setSyncStatus(null);
    try {
      const res = await fetch("/api/whatsapp/templates/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setSyncStatus(`Synced ${data.count} templates from Meta!`);
      } else {
        setSyncStatus(data.error || "Failed to sync templates");
      }
    } catch (err: any) {
      setSyncStatus(err.message);
    } finally {
      setIsSyncingTemplates(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)] min-h-[600px] border border-border/80 rounded-2xl bg-card overflow-hidden shadow-2xl">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-border bg-card/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-500/10">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-foreground tracking-tight">
                WhatsApp Shared Inbox
              </h1>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Cloud API
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Multi-agent customer support & two-way verified messaging
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadConversations}
            disabled={isLoading}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            title="Refresh conversations"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/whatsapp/campaigns/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Zap className="w-3.5 h-3.5" />
            Bulk Broadcast
          </Link>
          <Link
            href="/whatsapp/config"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-muted/40 hover:bg-muted transition-colors text-foreground"
          >
            Settings
          </Link>
        </div>
      </div>

      {/* 3-Pane Body Layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* PANE 1: Conversation List (Left) */}
        <div className="w-80 md:w-88 shrink-0 border-r border-border flex flex-col bg-card/40">
          {/* Search & Filters */}
          <div className="p-3.5 border-b border-border/80 space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-background border border-border/70 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-muted-foreground/60"
              />
            </div>

            <div className="flex rounded-lg bg-muted/60 p-0.5 text-[11px] font-medium">
              <button
                onClick={() => setStatusFilter("open")}
                className={`flex-1 py-1 rounded-md transition-all ${
                  statusFilter === "open"
                    ? "bg-background text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Open
              </button>
              <button
                onClick={() => setStatusFilter("closed")}
                className={`flex-1 py-1 rounded-md transition-all ${
                  statusFilter === "closed"
                    ? "bg-background text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Closed
              </button>
              <button
                onClick={() => setStatusFilter("all")}
                className={`flex-1 py-1 rounded-md transition-all ${
                  statusFilter === "all"
                    ? "bg-background text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
            </div>
          </div>

          {/* Conversation List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/40">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                <MessageSquare className="w-6 h-6 text-muted-foreground/40" />
                No {statusFilter !== "all" ? statusFilter : ""} conversations found
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === selectedConvId;
                const contactName =
                  `${conv.contact?.first_name || ""} ${conv.contact?.last_name || ""}`.trim() ||
                  conv.contact?.phone ||
                  "Unknown Contact";

                const initials = contactName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                      isSelected
                        ? "bg-emerald-500/10 border-l-2 border-l-emerald-500"
                        : "hover:bg-muted/40 border-l-2 border-l-transparent"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-medium text-xs flex items-center justify-center shrink-0">
                      {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span
                          className={`text-xs truncate ${
                            isSelected ? "font-semibold text-foreground" : "font-medium text-foreground"
                          }`}
                        >
                          {contactName}
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
                          {new Date(conv.last_message_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <p className="text-[11px] text-muted-foreground truncate mb-1.5">
                        {conv.last_message_text || "Started a conversation"}
                      </p>

                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider ${
                            conv.status === "open"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {conv.status}
                        </span>

                        {conv.unread_count > 0 && (
                          <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* PANE 2: Active Conversation Thread (Center) */}
        <div className="flex-1 flex flex-col min-w-0 bg-background/50">
          {activeConversation ? (
            <>
              {/* Thread Header */}
              <div className="h-14 px-6 border-b border-border/80 flex items-center justify-between bg-card/40 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center justify-center">
                    {(activeConversation.contact?.first_name?.[0] || "U").toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">
                        {`${activeConversation.contact?.first_name || ""} ${
                          activeConversation.contact?.last_name || ""
                        }`.trim() || activeConversation.contact?.phone}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {activeConversation.contact?.phone}
                      </span>
                    </div>
                    {activeConversation.contact?.company && (
                      <p className="text-[10px] text-muted-foreground">
                        {activeConversation.contact.company}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleStatus}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      activeConversation.status === "open"
                        ? "border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                    }`}
                  >
                    {activeConversation.status === "open" ? "Close Thread" : "Re-open Thread"}
                  </button>
                </div>
              </div>

              {/* Message History */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {isLoadingMessages ? (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    Loading conversation messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                    <MessageSquare className="w-10 h-10 text-muted-foreground/30 mb-2" />
                    <p className="text-xs font-medium text-foreground">No messages in this thread yet</p>
                    <p className="text-[11px] text-muted-foreground max-w-sm mt-1">
                      Send a message below or trigger an approved Meta WhatsApp template to initiate outreach.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isAgent = msg.sender_type === "agent" || msg.sender_type === "bot";
                    const isTemplate = msg.content_type === "template";

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isAgent ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm text-xs ${
                            isAgent
                              ? "bg-emerald-600 text-white rounded-tr-xs"
                              : "bg-card border border-border text-foreground rounded-tl-xs"
                          }`}
                        >
                          {isTemplate && (
                            <div className="flex items-center gap-1.5 mb-1 pb-1 border-b border-white/20 text-[10px] font-semibold uppercase tracking-wider text-emerald-100">
                              <Sparkles className="w-3 h-3" />
                              Meta Template: {msg.template_name}
                            </div>
                          )}

                          <p className="whitespace-pre-line leading-relaxed">{msg.content_text}</p>

                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                              isAgent ? "text-emerald-100/70" : "text-muted-foreground"
                            }`}
                          >
                            <span>
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>

                            {isAgent && (
                              <span>
                                {msg.status === "sending" && <Clock className="w-3 h-3 animate-spin" />}
                                {msg.status === "sent" && <Check className="w-3 h-3" />}
                                {msg.status === "delivered" && <CheckCheck className="w-3 h-3" />}
                                {msg.status === "read" && (
                                  <CheckCheck className="w-3 h-3 text-cyan-200 font-bold" />
                                )}
                                {msg.status === "failed" && (
                                  <AlertCircle className="w-3 h-3 text-red-200" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        {msg.error_message && (
                          <span className="text-[10px] text-destructive mt-1">
                            Error: {msg.error_message}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Live Composer */}
              <div className="p-4 border-t border-border/80 bg-card/40 shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTemplateModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    title="Send approved WhatsApp template"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Templates
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your WhatsApp message..."
                    className="flex-1 px-4 py-2 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-muted-foreground/60"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim() || isSending}
                    className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <h3 className="text-sm font-semibold text-foreground">Select a Conversation</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                Choose a customer from the left list to view thread history and send live replies.
              </p>
            </div>
          )}
        </div>

        {/* PANE 3: Contact Sidebar (Right) */}
        {activeConversation && (
          <div className="w-72 shrink-0 border-l border-border bg-card/20 p-5 flex flex-col gap-5 overflow-y-auto hidden lg:flex">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-lg flex items-center justify-center mb-3">
                {(activeConversation.contact?.first_name?.[0] || "U").toUpperCase()}
              </div>
              <h2 className="text-sm font-bold text-foreground">
                {`${activeConversation.contact?.first_name || ""} ${
                  activeConversation.contact?.last_name || ""
                }`.trim() || "WhatsApp User"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activeConversation.contact?.company || "No Company"}
              </p>
            </div>

            <div className="space-y-3 text-xs border-t border-border pt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Contact Information
              </span>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-mono text-foreground">{activeConversation.contact?.phone}</span>
              </div>

              {activeConversation.contact?.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate text-foreground">{activeConversation.contact.email}</span>
                </div>
              )}

              {activeConversation.contact?.company && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate text-foreground">{activeConversation.contact.company}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2 border-t border-border pt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Assigned Tags
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(activeConversation.contact?.tags || ["VIP", "WhatsApp Outreach"]).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-muted/80 text-foreground border border-border/60"
                  >
                    <Tag className="w-2.5 h-2.5 text-emerald-400" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Channel Quality */}
            <div className="space-y-2 border-t border-border pt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Channel Verification
              </span>
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Opt-in Status</span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Subscribed
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Meta Quality</span>
                  <span className="text-foreground font-semibold">HIGH</span>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-border">
              <Link
                href={`/contacts`}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-border hover:bg-muted transition-colors text-foreground"
              >
                Open in CRM Contacts
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Template Picker Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Select WhatsApp Template</h3>
                <p className="text-xs text-muted-foreground">
                  Meta-approved message templates for business initiation
                </p>
              </div>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {templates.length} templates available
              </span>
              <button
                onClick={handleSyncTemplates}
                disabled={isSyncingTemplates}
                className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncingTemplates ? "animate-spin" : ""}`} />
                Sync with Meta
              </button>
            </div>

            {syncStatus && (
              <div className="p-2 rounded-lg text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {syncStatus}
              </div>
            )}

            <div className="max-h-64 overflow-y-auto space-y-2">
              {templates.map((tpl) => (
                <div
                  key={tpl.id || tpl.name}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedTemplate?.name === tpl.name
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{tpl.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">{tpl.body_text}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-3 py-1.5 text-xs rounded-xl border border-border hover:bg-muted text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleSendTemplate}
                disabled={!selectedTemplate || isSending}
                className="px-4 py-1.5 text-xs font-medium rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40"
              >
                {isSending ? "Sending..." : "Send Template"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
