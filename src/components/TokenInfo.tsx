"use client";

import { useState, useEffect } from "react";
import { tokenManager } from "@/lib/token-manager";

interface TokenInfo {
  expiresIn: number;
  isRememberMe: boolean;
  expiresAt: Date;
}

export default function TokenInfo() {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const updateTokenInfo = () => {
      const info = tokenManager.getTokenInfo();
      setTokenInfo(info);

      if (info) {
        const hours = Math.floor(info.expiresIn / 3600);
        const minutes = Math.floor((info.expiresIn % 3600) / 60);

        if (hours > 24) {
          const days = Math.floor(hours / 24);
          const remainingHours = hours % 24;
          setTimeLeft(`${days}d ${remainingHours}h ${minutes}m`);
        } else {
          setTimeLeft(`${hours}h ${minutes}m`);
        }
      }
    };

    updateTokenInfo();
    const interval = setInterval(updateTokenInfo, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (!tokenInfo) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900">Session Info</h3>
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            tokenInfo.isRememberMe
              ? "bg-green-100 text-green-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {tokenInfo.isRememberMe ? "Remember Me" : "Standard"}
        </div>
      </div>

      <div className="space-y-1 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>Expires in:</span>
          <span className="font-medium">{timeLeft}</span>
        </div>
        <div className="flex justify-between">
          <span>Expires at:</span>
          <span className="font-medium">
            {tokenInfo.expiresAt.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-gray-100">
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div
            className={`h-1 rounded-full transition-all duration-300 ${
              tokenInfo.expiresIn < 3600
                ? "bg-red-500"
                : tokenInfo.expiresIn < 86400
                ? "bg-yellow-500"
                : "bg-green-500"
            }`}
            style={{
              width: `${Math.max(
                0,
                Math.min(
                  100,
                  (tokenInfo.expiresIn /
                    (tokenInfo.isRememberMe ? 30 * 24 * 3600 : 24 * 3600)) *
                    100
                )
              )}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
