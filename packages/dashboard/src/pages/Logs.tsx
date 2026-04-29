import { useState, useEffect, useRef } from "react";

interface LogEntry {
  type: string;
  data: unknown;
  timestamp: number;
}

export function Logs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const entry = JSON.parse(event.data);
        setLogs((prev) => [entry, ...prev].slice(0, 200));
      } catch {}
    };

    ws.onclose = () => {
      setLogs((prev) => [
        { type: "system", data: { message: "WebSocket отключен" }, timestamp: Date.now() },
        ...prev,
      ]);
    };

    return () => ws.close();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Логи</h2>
        <p className="text-gray-400 mt-1">События шлюза в реальном времени.</p>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          {logs.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Ожидание событий...
            </div>
          ) : (
            logs.map((entry, i) => (
              <div
                key={i}
                className={`px-4 py-2 border-b border-gray-800/50 font-mono text-xs flex gap-3 ${
                  entry.type === "error" ? "bg-red-900/20" : ""
                }`}
              >
                <span className="text-gray-600 shrink-0 w-20">
                  {new Date(entry.timestamp).toLocaleTimeString("ru")}
                </span>
                <span
                  className={`shrink-0 w-20 ${
                    entry.type === "incoming"
                      ? "text-blue-400"
                      : entry.type === "outgoing"
                      ? "text-green-400"
                      : entry.type === "error"
                      ? "text-red-400"
                      : "text-gray-400"
                  }`}
                >
                  {entry.type}
                </span>
                <span className="text-gray-300 truncate">
                  {JSON.stringify(entry.data)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
