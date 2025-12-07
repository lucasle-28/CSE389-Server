import React, { useState } from "react";

export default function ChatBox() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setReply("");
    setMeta(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      setReply(data.assistantReply || JSON.stringify(data));

      const headRes = await fetch("/api/chat", {
        method: "HEAD",
        credentials: "include",
      });

      const metaObj = {
        ok: headRes.headers.get("X-Chat-Ok"),
        statusCode: headRes.headers.get("X-Chat-StatusCode"),
        startedAt: headRes.headers.get("X-Chat-StartedAt"),
        finishedAt: headRes.headers.get("X-Chat-FinishedAt"),
        durationMs: headRes.headers.get("X-Chat-DurationMs"),
        error: headRes.headers.get("X-Chat-Error"),
      };
      setMeta(metaObj);
    } catch (err) {
      setReply("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbox">
      <textarea
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask ChatGPT something..."
      />
      <button onClick={handleSend} disabled={loading}>
        {loading ? "Sending..." : "Send"}
      </button>

      {reply && (
        <div className="reply">
          <h3>ChatGPT reply:</h3>
          <pre>{reply}</pre>
        </div>
      )}

      {meta && (
        <div className="metadata">
          <h4>Metadata (HEAD /api/chat)</h4>
          <ul>
            <li>ok: {meta.ok}</li>
            <li>statusCode: {meta.statusCode}</li>
            <li>startedAt: {meta.startedAt}</li>
            <li>finishedAt: {meta.finishedAt}</li>
            <li>durationMs: {meta.durationMs}</li>
            {meta.error && <li>error: {meta.error}</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
