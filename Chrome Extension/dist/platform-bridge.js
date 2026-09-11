"use strict";
(() => {
  // src/content/platform-bridge.ts
  (function() {
    try {
      document.documentElement.setAttribute("data-leadmap-installed", "true");
      window.__LEADMAP_EXTENSION_INSTALLED__ = true;
    } catch (e) {
    }
    let cachedWorkspace = null;
    async function syncActiveWorkspace() {
      try {
        const bridgeEl = document.getElementById("ewc-active-workspace-bridge");
        let wsId = bridgeEl ? bridgeEl.getAttribute("data-workspace-id") : null;
        let wsName = bridgeEl ? bridgeEl.getAttribute("data-workspace-name") : null;
        let wsKey = bridgeEl ? bridgeEl.getAttribute("data-api-key") : null;
        if (!wsId || !wsKey) {
          const res = await fetch("/api/v1/leads/ingest", {
            credentials: "include",
            headers: { "Accept": "application/json" }
          });
          const data = await res.json();
          if (data && data.success && data.workspace) {
            wsId = data.workspace.id;
            wsName = data.workspace.name;
            wsKey = data.workspace.apiKey;
          }
        }
        if (wsId) {
          cachedWorkspace = {
            workspaceId: wsId,
            workspaceName: wsName || "My Workspace",
            apiKey: wsKey || `ewc_live_${wsId.replace(/-/g, "").slice(0, 16)}`,
            platformUrl: window.location.origin
          };
          if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
            chrome.runtime.sendMessage({
              type: "UPDATE_PLATFORM_AUTH",
              payload: cachedWorkspace
            }, () => {
              if (chrome.runtime.lastError) {
              }
            });
          }
        }
      } catch (err) {
      }
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        setTimeout(syncActiveWorkspace, 500);
      });
    } else {
      setTimeout(syncActiveWorkspace, 500);
    }
    window.addEventListener("EWC_SYNC_WORKSPACE_EVENT", (event) => {
      if (event.detail) {
        cachedWorkspace = {
          workspaceId: event.detail.workspaceId,
          workspaceName: event.detail.workspaceName,
          apiKey: event.detail.apiKey,
          platformUrl: window.location.origin
        };
        if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
          chrome.runtime.sendMessage({
            type: "UPDATE_PLATFORM_AUTH",
            payload: cachedWorkspace
          });
        }
      }
    });
    if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        if (message.type === "GET_ACTIVE_TAB_WORKSPACE") {
          if (cachedWorkspace) {
            sendResponse({ success: true, workspace: cachedWorkspace });
          } else {
            syncActiveWorkspace().then(() => {
              sendResponse({ success: true, workspace: cachedWorkspace });
            });
            return true;
          }
        }
      });
    }
  })();
})();
