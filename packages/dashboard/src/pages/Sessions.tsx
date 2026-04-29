import { useState, useEffect } from "react";

interface Session {
  id: string;
  channel: string;
  chat_id: string;
  user_id: string | null;
  model: string;
  provider: string;
  updated_at: number;
}

export function Sessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data) => setSessions(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Сессии</h2>
        <p className="text-gray-400 mt-1">История диалогов по каналам и чатам.</p>
      </div>

      {loading ? (
        <p className="text-gray-400">Загрузка...</p>
      ) : sessions.length === 0 ? (
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 text-center text-gray-500">
          Нет сохраненных сессий. Отправьте сообщение боту чтобы создать первую сессию.
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-gray-400">
                <th className="py-3 px-4">Канал</th>
                <th className="py-3 px-4">Чат ID</th>
                <th className="py-3 px-4">Модель</th>
                <th className="py-3 px-4">Обновлена</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-3 px-4 font-medium capitalize">{s.channel}</td>
                  <td className="py-3 px-4 font-mono text-xs text-gray-400">{s.chat_id}</td>
                  <td className="py-3 px-4">{s.model}</td>
                  <td className="py-3 px-4 text-gray-400">{new Date(s.updated_at).toLocaleString("ru")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
