import { useCallback, useEffect, useState } from "react";
import { isCrewId, type CrewId } from "../data/crew";

export interface SharedMessage { id: string; from: CrewId; text: string; atISO: string }
export interface SharedAlert { id: string; from: CrewId; about: CrewId; to: CrewId | "all"; text: string; atISO: string; readBy: CrewId[] }
type Status = "disconnected" | "connecting" | "connected" | "offline";
const KEY = "decision-window-crew-access";
async function request(path: string, code: string, input: object = {}) {
  const response = await fetch(`/api/crew/${path}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${code}` }, body: JSON.stringify(input), cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Crew service unavailable");
  return data;
}
export function useCrewComms() {
  const [code, setCode] = useState(() => { try { return sessionStorage.getItem(KEY) || ""; } catch { return ""; } });
  const [identity, setIdentity] = useState<CrewId | null>(null);
  const [status, setStatus] = useState<Status>(code ? "connecting" : "disconnected");
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<SharedMessage[]>([]);
  const [alerts, setAlerts] = useState<SharedAlert[]>([]);
  const refresh = useCallback(async (access: string) => {
    const data = await request("feed", access);
    if (!isCrewId(data.crewId)) throw new Error("Invalid crew response");
    return data as { crewId: CrewId; messages: SharedMessage[]; alerts: SharedAlert[] };
  }, []);
  useEffect(() => {
    if (!code) return;
    let active = true;
    const poll = async () => {
      try { const data = await refresh(code); if (active) { setIdentity(data.crewId); setMessages(data.messages); setAlerts(data.alerts); setStatus("connected"); setError(""); } }
      catch (err) { if (active) { setStatus("offline"); setError(err instanceof Error ? err.message : "Crew service unavailable"); } }
    };
    void poll(); const timer = window.setInterval(poll, 3000);
    return () => { active = false; window.clearInterval(timer); };
  }, [code, refresh]);
  const connect = async (access: string) => {
    setStatus("connecting"); setError("");
    try { const data = await refresh(access.trim()); setIdentity(data.crewId); setMessages(data.messages); setAlerts(data.alerts); try { sessionStorage.setItem(KEY, access.trim()); } catch { /* session remains active in memory */ } setCode(access.trim()); setStatus("connected"); }
    catch (err) { setStatus("disconnected"); setError(err instanceof Error ? err.message : "Crew service unavailable"); throw err; }
  };
  const disconnect = () => { try { sessionStorage.removeItem(KEY); } catch { /* ignored */ } setCode(""); setIdentity(null); setMessages([]); setAlerts([]); setError(""); setStatus("disconnected"); };
  const submit = async (path: string, input: object) => {
    if (!code || status !== "connected") throw new Error("Connect to the crew service before sending.");
    try { await request(path, code, input); } catch (err) { setError(err instanceof Error ? err.message : "Crew service unavailable"); throw err; }
    try { const data = await refresh(code); setMessages(data.messages); setAlerts(data.alerts); setError(""); } catch { setStatus("offline"); setError("Sent, but the connection was lost. Reconnecting…"); }
  };
  return { identity, status, error, messages, alerts, connect, disconnect, sendMessage: (text: string) => submit("messages", { text }), sendAlert: (about: CrewId, to: CrewId | "all", text: string) => submit("alerts", { about, to, text }), markRead: (id: string) => submit(`alerts/${id}/read`, {}) };
}
export type CrewComms = ReturnType<typeof useCrewComms>;
