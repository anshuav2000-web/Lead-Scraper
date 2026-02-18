
import React, { useState } from 'react';
import { User, WebhookConfig } from '../types.ts';
import { Button } from './Button.tsx';

interface WebhookSettingsProps {
  user: User;
  onUpdateWebhook: (config: WebhookConfig) => void;
}

export const WebhookSettings: React.FC<WebhookSettingsProps> = ({ user, onUpdateWebhook }) => {
  const [url, setUrl] = useState(user.webhook?.url || '');
  const [secret, setSecret] = useState(user.webhook?.secret || '');
  const [enabled, setEnabled] = useState(user.webhook?.enabled || false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const newConfig: WebhookConfig = {
      ...user.webhook,
      url,
      secret,
      enabled,
      logs: user.webhook?.logs || []
    };
    await onUpdateWebhook(newConfig);
    setIsSaving(false);
    alert("Webhook configuration updated successfully.");
  };

  const handleTestWebhook = async () => {
    if (!url || !url.startsWith('http')) {
      alert("Validation Error: A valid endpoint URL starting with http/https is required for testing.");
      return;
    }

    setIsTesting(true);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Canvas-Cartel-Test': 'true'
        },
        body: JSON.stringify({
          event: "connectivity_test",
          timestamp: new Date().toISOString(),
          message: "Secure handshake test from Canvas Cartel LeadScrape Engine",
          metadata: {
            origin: "Platform Dashboard",
            version: "2.5.0-Native"
          }
        }),
      });

      if (response.ok) {
        alert(`Success! Handshake verified. Status: ${response.status} ${response.statusText}`);
      } else {
        alert(`Warning: Endpoint reached but returned error status ${response.status}. Verify your server logic.`);
      }
    } catch (err: any) {
      console.error("Webhook Test Error:", err);
      alert(`Connectivity Failure: ${err.message}. Ensure your endpoint allows CORS requests from this domain or is publicly accessible.`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-10 max-w-4xl mx-auto py-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-white tracking-tighter">Enterprise Webhooks</h2>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Automate your leads into your own personal CRM or workflow.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-zinc-900/40 rounded-[2.5rem] border border-zinc-800 p-10 space-y-8">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Global Switch</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">Enable or disable all outbound traffic</p>
              </div>
              <button 
                onClick={() => setEnabled(!enabled)}
                className={`w-14 h-7 rounded-full p-1 transition-all ${enabled ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-zinc-800'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-all ${enabled ? 'translate-x-7' : 'translate-x-0'}`}></div>
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Payload URL</label>
                <input 
                  type="url" 
                  placeholder="https://your-server.com/webhook"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-xs font-bold text-white focus:outline-none focus:border-red-600 transition-all"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Signing Secret (Optional)</label>
                <input 
                  type="password" 
                  placeholder="••••••••••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-xs font-bold text-white focus:outline-none focus:border-red-600 transition-all"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                />
              </div>

              <div className="pt-4 flex flex-col md:flex-row gap-4">
                <Button 
                  onClick={handleSave} 
                  isLoading={isSaving}
                  className="flex-1 md:flex-none px-10"
                >
                  Save Configuration
                </Button>
                <Button 
                  variant="secondary"
                  onClick={handleTestWebhook} 
                  isLoading={isTesting}
                  className="flex-1 md:flex-none px-10 border-zinc-800 text-zinc-400 hover:text-white"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  Test Connection
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/20 rounded-[2.5rem] border border-zinc-800/40 p-8 flex items-center gap-6">
            <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-red-500 border border-zinc-800">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-widest">Developer Note</h4>
              <p className="text-[10px] text-zinc-500 font-medium leading-relaxed mt-1">Payloads are sent as a POST request with Content-Type: application/json. We recommend using tools like n8n, Make, or Zapier for easy integration.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900/40 rounded-[2.5rem] border border-zinc-800 p-8">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Delivery History</h3>
            <div className="space-y-4">
              {user.webhook?.logs && user.webhook.logs.length > 0 ? (
                user.webhook.logs.slice(0, 5).map(log => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-900">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                      <span className="text-[10px] font-bold text-zinc-400">{log.statusCode}</span>
                    </div>
                    <span className="text-[9px] font-black text-zinc-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                   <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest italic">No logs detected</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
