import { useState, useEffect } from "react";

interface GatewayStatus {
  status: string;
  channels: Record<string, unknown>;
  uptime: number;
}

export function useGatewayStatus() {
  const [status, setStatus] = useState<GatewayStatus | null>(null);

  useEffect(() => {
    const fetchStatus = () => {
      fetch("/api/health")
        .then((r) => r.json())
        .then(setStatus)
        .catch(() => setStatus(null));
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return status;
}
