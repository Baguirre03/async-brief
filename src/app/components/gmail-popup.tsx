"use client";

import {
  X,
  Minimize2,
  Maximize2,
  ExternalLink,
  Trash2,
  Mail,
} from "lucide-react";
import { useEffect, useState } from "react";

interface GmailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  messageUrl: string;
  messageData?: {
    title?: string | null;
    content?: string | null;
    sender?: string | null;
    recievedAt?: Date | string;
  };
}

export function GmailPopup({
  isOpen,
  onClose,
  messageUrl,
  messageData,
}: GmailPopupProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Gmail-style Compose Window */}
      <div
        className={`bg-white border border-gray-300 shadow-2xl transition-all duration-300 rounded-lg ${
          isMinimized ? "w-80 h-12" : "w-[600px] h-[600px]"
        } flex flex-col overflow-hidden`}
        style={{
          minHeight: isMinimized ? "48px" : "400px",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* Header - Same Gray as Read Section */}
        <div className="bg-gray-50 text-gray-800 px-4 py-2 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Gmail Message</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                window.open(messageUrl, "_blank", "noopener,noreferrer")
              }
              className="text-gray-600 hover:text-gray-800 transition-colors p-1"
              title="Open in Gmail"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                // TODO: Implement delete functionality
                console.log("Delete message");
              }}
              className="text-gray-600 hover:text-red-600 transition-colors p-1"
              title="Delete message"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-gray-600 hover:text-gray-800 transition-colors p-1"
              title={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Minimize2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 transition-colors p-1"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Content Area */}
            <div className="flex-1 overflow-hidden bg-white flex flex-col">
              {/* Message Header - Email Style */}
              <div className="border-b border-gray-200 p-4 bg-white">
                <div className="space-y-1">
                  <div className="text-sm text-gray-900">
                    <strong>From:</strong>{" "}
                    {messageData?.sender || "Unknown Sender"}
                  </div>
                  <div className="text-sm text-gray-900">
                    <strong>Subject:</strong>{" "}
                    {messageData?.title || "(no subject)"}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Date:</strong>{" "}
                    {messageData?.recievedAt &&
                      new Date(messageData.recievedAt).toLocaleString([], {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 overflow-auto p-4">
                {messageData?.content ? (
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {messageData.content}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <div className="text-gray-400 mb-4">
                        <Mail className="w-12 h-12 mx-auto" />
                      </div>
                      <p className="text-sm">No preview available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
