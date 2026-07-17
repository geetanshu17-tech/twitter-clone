"use client";
import { useEffect, useState } from "react";
import axiosInstance from "../../lib/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function LoginHistorySection() {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (user?._id) {
      axiosInstance.get(`/login-history/${user._id}`)
        .then((res) => {
          setHistory(res.data);
        })
        .catch((err) => console.error("Failed to fetch history", err));
    }
  }, [user]);

  return (
    <div className="mt-8 border-t border-gray-700 pt-6">
      <h2 className="text-xl font-bold mb-4">{t("security")}</h2>
      <h3 className="text-md text-gray-400 mb-4">{t("recentLogins")}</h3>
      
      <div className="space-y-4">
        {history.length === 0 ? (
          <p className="text-sm text-gray-500">{t("noRecordsYet")}</p>
        ) : (
          history.map((record) => (
            <div key={record._id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-bold text-white">{record.browser}</p>
                <p className="text-sm text-gray-400">
                  {record.operatingSystem} • {record.deviceType}
                </p>
              </div>
              <div className="text-right text-xs text-gray-500">
                {new Date(record.loginTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}