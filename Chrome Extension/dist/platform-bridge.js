// Platform Bridge Content Script for LeadMap Extension
// Runs on http://localhost:3000/*, http://127.0.0.1:3000/*, https://*.vercel.app/*

(function() {
  // Mark page as extension-connected
  try {
    document.documentElement.setAttribute("data-leadmap-installed", "true");
    window.__LEADMAP_EXTENSION_INSTALLED__ = true;
  } catch (e) {}

  let cachedWorkspace = null;

  // Function to discover and sync active workspace from the platform
  async function syncActiveWorkspace() {
    try {
      // 1. Check DOM bridge element if present
      const bridgeEl = document.getElementById("ewc-active-workspace-bridge");
      let wsId = bridgeEl ? bridgeEl.getAttribute("data-workspace-id") : null;
      let wsName = bridgeEl ? bridgeEl.getAttribute("data-workspace-name") : null;
      let wsKey = bridgeEl ? bridgeEl.getAttribute("data-api-key") : null;

      // 2. Fetch authenticated workspace info from same-origin platform API
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

        // Notify background service worker
        if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
          chrome.runtime.sendMessage({
            type: "UPDATE_PLATFORM_AUTH",
            payload: cachedWorkspace
          }, () => {
            if (chrome.runtime.lastError) {
              // Ignore if background worker is currently idle
            }
          });
        }
      }
    } catch (err) {
      // Non-blocking notice
    }
  }

  // Initial sync on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(syncActiveWorkspace, 500);
    });
  } else {
    setTimeout(syncActiveWorkspace, 500);
  }

  // Listen for DOM custom events dispatched by the platform web app
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

  // Listen for requests from extension popup or sidepanel
  if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "GET_ACTIVE_TAB_WORKSPACE") {
        if (cachedWorkspace) {
          sendResponse({ success: true, workspace: cachedWorkspace });
        } else {
          syncActiveWorkspace().then(() => {
            sendResponse({ success: true, workspace: cachedWorkspace });
          });
          return true; // Keep channel open
        }
      }
    });
  }
})();
