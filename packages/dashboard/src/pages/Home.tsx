import { useState } from "react";
import { useGatewayStatus } from "../hooks/useGatewayStatus";

export function Home() {
  const status = useGatewayStatus();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Панель управления</h2>
        <p className="text-gray-400 mt-1">Обзор состояния шлюза и подключенных каналов.</p>
      </div>

      {/* Status card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="text-sm text-gray-400">Статус шлюза</div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full ${status?.status === "ok" ? "bg-green-400" : "bg-red-400"}`} />
            <span className="font-medium">{status?.status === "ok" ? "Работает" : "Остановлен"}</span>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="text-sm text-gray-400">Активные каналы</div>
          <div className="text-2xl font-bold mt-1">
            {status?.channels ? Object.keys(status.channels).length : 0}
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="text-sm text-gray-400">Аптайм</div>
          <div className="text-2xl font-bold mt-1">
            {status?.uptime ? formatUptime(status.uptime) : "—"}
          </div>
        </div>
      </div>

      {/* Channels list */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
        <h3 className="font-semibold mb-3">Подключенные каналы</h3>
        {status?.channels && Object.keys(status.channels).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(status.channels).map(([name, info]: [string, any]) => (
              <div key={name} className="flex items-center justify-between py-2 px-3 bg-gray-800/50 rounded">
                <span className="font-medium capitalize">{name}</span>
                <span className={`text-sm ${info.status?.connected ? "text-green-400" : "text-red-400"}`}>
                  {info.status?.connected ? "Подключен" : "Отключен"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Нет подключенных каналов. Настройте Telegram бота.</p>
        )}
      </div>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}ч ${m}м`;
  return `${m}м`;
}
