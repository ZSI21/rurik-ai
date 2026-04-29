export function Channels() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Каналы</h2>
        <p className="text-gray-400 mt-1">Управление подключенными мессенджерами.</p>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Telegram</h3>
            <p className="text-sm text-gray-400 mt-1">
              Подключение через Bot API. Создайте бота через @BotFather.
            </p>
          </div>
          <span className="px-3 py-1 bg-green-900/50 text-green-400 text-sm rounded-full">
            Доступен
          </span>
        </div>
        <div className="mt-4 p-3 bg-gray-800/50 rounded text-sm font-mono text-gray-300">
          TELEGRAM_BOT_TOKEN=...
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 opacity-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">VK</h3>
            <p className="text-sm text-gray-400 mt-1">Подключение к VK API. Скоро.</p>
          </div>
          <span className="px-3 py-1 bg-gray-800 text-gray-500 text-sm rounded-full">
            Скоро
          </span>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 opacity-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Yandex Messenger</h3>
            <p className="text-sm text-gray-400 mt-1">Интеграция с Яндекс 360. Запланировано.</p>
          </div>
          <span className="px-3 py-1 bg-gray-800 text-gray-500 text-sm rounded-full">
            Запланировано
          </span>
        </div>
      </div>
    </div>
  );
}
