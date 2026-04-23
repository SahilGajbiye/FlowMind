import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getWorkflows } from "../services/api";
import { useAuth } from "../context/AuthContext";

const API_BASE = "http://localhost:5000/api";

// --- Helper Icon Components ---
const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path d="M4 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5.59a1 1 0 0 0-.293-.707l-2.828-2.828A1 1 0 0 0 9.59 2H4Zm0 9h8v1H4v-1Zm0-3h8v1H4v-1Zm0-3h5v1H4V5Z" />
  </svg>
);
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.75-10.25a.75.75 0 0 0-1.5 0v3.5c0 .26.104.512.293.702l2.5 2.5a.75.75 0 0 0 1.06-1.062L8.75 8.44V4.75Z" clipRule="evenodd" />
  </svg>
);
const HashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path d="M8.016 3.11A.75.75 0 0 1 8.75 3h.5a.75.75 0 0 1 .75.75v.516a.75.75 0 0 1-1.5 0v-.016h.016v.016a.75.75 0 0 1-1.5 0v-1.14a.75.75 0 0 1 .016-.16Zm-2 0A.75.75 0 0 1 6.75 3h.5a.75.75 0 0 1 .75.75v.516a.75.75 0 0 1-1.5 0v-.016h.016v.016a.75.75 0 0 1-1.5 0v-1.14a.75.75 0 0 1 .016-.16ZM5.5 6.75a.75.75 0 0 0 0 1.5h.516a.75.75 0 0 0 0-1.5H5.5Zm3 0a.75.75 0 0 0 0 1.5h.516a.75.75 0 0 0 0-1.5H8.5Zm-4 3.5a.75.75 0 0 1 .75-.75h1.14a.75.75 0 0 1 0 1.5h-.016v.016a.75.75 0 0 1-1.5 0v-.516h-.016a.75.75 0 0 1-.75-.75Zm2 0a.75.75 0 0 1 .75-.75h1.14a.75.75 0 0 1 0 1.5h-.016v.016a.75.75 0 0 1-1.5 0v-.516h-.016a.75.75 0 0 1-.75-.75Zm2 0a.75.75 0 0 1 .75-.75h1.14a.75.75 0 0 1 0 1.5h-.016v.016a.75.75 0 0 1-1.5 0v-.516h-.016a.75.75 0 0 1-.75-.75Z" />
  </svg>
);
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
  </svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5A.75.75 0 0 1 9.95 6Z" clipRule="evenodd" />
  </svg>
);

// --- Delete Confirmation Modal ---
const DeleteModal = ({ workflowName, onConfirm, onCancel, isDeleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="bg-[#1C1C1E] border border-red-500/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
      {/* Warning icon */}
      <div className="flex items-center justify-center w-14 h-14 mx-auto mb-5 rounded-full bg-red-500/15 border border-red-500/30">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-red-400">
          <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
        </svg>
      </div>

      <h3 className="text-xl font-bold text-white text-center mb-2">Delete Workflow?</h3>
      <p className="text-slate-400 text-center text-sm mb-1">You are about to permanently delete:</p>
      <p className="text-white font-semibold text-center mb-6 px-4 py-2 bg-[#2A2A2D] rounded-lg truncate">
        "{workflowName}"
      </p>
      <p className="text-red-400/80 text-xs text-center mb-6">
        This action cannot be undone.
      </p>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="flex-1 px-4 py-3 bg-[#2A2A2D] text-gray-300 border border-stroke rounded-xl font-semibold text-sm hover:bg-[#333336] transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isDeleting ? (
            <>
              <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Deleting...
            </>
          ) : (
            <>
              <TrashIcon /> Yes, Delete
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);

// --- Reusable Workflow Card Component ---
const WorkflowCard = ({ id, name, created, thumbnail_url, onDeleteClick }) => {
  return (
    <div className="group relative">
      <Link to={`/workflow/${id}`} className="cursor-pointer block">
        {/* Card Thumbnail */}
        <div className="aspect-square bg-[#1C1C1E] rounded-2xl overflow-hidden border border-stroke group-hover:border-accent transition-colors relative">
          {thumbnail_url ? (
            <img
              src={thumbnail_url}
              alt={`${name} preview`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-4">
              <div className="flex items-center justify-center w-16 h-16 border-2 border-dashed rounded-full border-stroke/50">
                <div className="w-4 h-4 rounded-full bg-accent/50"></div>
              </div>
            </div>
          )}
          {/* Open overlay on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <span className="text-white text-sm font-semibold px-3 py-1 bg-accent/80 rounded-full">Open</span>
          </div>
        </div>
      </Link>

      {/* Delete button — appears on hover, top-right corner */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDeleteClick({ id, name }); }}
        className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-red-600/80 border border-red-500/50 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center hover:bg-red-600 hover:scale-110 shadow-lg z-10"
        title="Delete workflow"
      >
        <TrashIcon />
      </button>

      {/* Card Details */}
      <div className="p-2 mt-4 space-y-1">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <HashIcon />
          <span># {id.slice(0, 5).toUpperCase()}</span>
        </div>
        <h3 className="flex items-center gap-2 font-bold text-white text-md">
          <FileIcon />
          {name}
        </h3>
        <p className="flex items-center gap-2 text-xs text-slate-400">
          <ClockIcon />
          Created {created}
        </p>
      </div>
    </div>
  );
};

// --- Main Workflow Page ---
export default function WorkflowPage() {
  const { user, tokens } = useAuth();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }
  const [isDeleting, setIsDeleting] = useState(false);

  const newWorkflowId = crypto.randomUUID();

  useEffect(() => {
    async function fetchWorkflows() {
      if (!user || !tokens?.access) {
        setLoading(false);
        setWorkflows([]);
        return;
      }
      try {
        const response = await getWorkflows(user.id, tokens.access);
        setWorkflows(response.data.workflows || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch workflows.");
        setWorkflows([]);
      } finally {
        setLoading(false);
      }
    }
    fetchWorkflows();
  }, [user, tokens]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/workflows/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setWorkflows((prev) => prev.filter((w) => w.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-brand-dark">
      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteModal
          workflowName={deleteTarget.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}

      <div className="p-8 mx-auto text-white max-w-7xl">
        <header className="mb-12">
          <h1 className="text-3xl font-bold">All Works</h1>
        </header>

        <main>
          {/* ── Workflow Templates ── */}
          <div className="mb-10">
            <h2 className="mb-4 text-xl font-semibold">🚀 Start from a Template</h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                {
                  name: "Daily Report Sender",
                  icon: "📊",
                  color: "#10a37f",
                  desc: "Generate a report with AI and send via Telegram",
                  nodes: [
                    { id: "text-message-tpl1", type: "text-message", label: "Text input", icon: "💬", color: "#95E1D3", description: "TextInputNode", x: 80, y: 80, config: { text_input: "Generate a daily summary report" }, status: null },
                    { id: "openai-tpl1", type: "openai", label: "OpenAI", icon: "🤖", color: "#10a37f", description: "LLMNode", x: 320, y: 80, config: { prompt: "Write a concise daily summary based on the input." }, status: null },
                    { id: "telegram-tpl1", type: "telegram", label: "Telegram", icon: "🌍", color: "#F97316", description: "TelegramNode", x: 560, y: 80, config: { chat_id: "" }, status: null },
                  ],
                  connections: [
                    { from: "text-message-tpl1", to: "openai-tpl1" },
                    { from: "openai-tpl1", to: "telegram-tpl1" },
                  ],
                },
                {
                  name: "Fast Demo Scheduler",
                  icon: "🚀",
                  color: "#F59E0B",
                  desc: "Run every 10 seconds to send a greeting message",
                  nodes: [
                    { id: "text-tpl-demo", type: "text-message", label: "Text input", icon: "💬", color: "#95E1D3", description: "TextInputNode", x: 80, y: 80, config: { text_input: "Hello! This is your 10-second demo greeting. 👋" }, status: null },
                    { id: "schedule-tpl", type: "schedule", label: "Schedule", icon: "⏰", color: "#8B5CF6", description: "ScheduleTriggerNode", x: 320, y: 80, config: { cron: "*/10 * * * * *" }, status: null },
                    { id: "telegram-tpl4", type: "telegram", label: "Telegram", icon: "🌍", color: "#F97316", description: "TelegramNode", x: 560, y: 80, config: { chat_id: "" }, status: null },
                  ],
                  connections: [
                    { from: "text-tpl-demo", to: "schedule-tpl" },
                    { from: "schedule-tpl", to: "telegram-tpl4" },
                  ],
                },
                {
                  name: "Hourly Weather Alert",
                  icon: "⛈️",
                  color: "#0ea5e9",
                  desc: "Fetch weather data every hour and notify",
                  nodes: [
                    { id: "schedule-weather", type: "schedule", label: "Schedule", icon: "⏰", color: "#8B5CF6", description: "ScheduleTriggerNode", x: 80, y: 80, config: { cron: "0 * * * *" }, status: null },
                    { id: "http-weather", type: "http-request", label: "HTTP Request", icon: "🌐", color: "#6366F1", description: "HTTPRequestNode", x: 280, y: 80, config: { url: "https://api.open-meteo.com/v1/forecast?latitude=28.6139&longitude=77.2090&current_weather=true", method: "GET", headers: "{}" }, status: null },
                    { id: "openai-weather", type: "openai", label: "OpenAI", icon: "🤖", color: "#10a37f", description: "LLMNode", x: 480, y: 80, config: { prompt: "Extract the current temperature and windspeed from this JSON and write a short, friendly 1-line weather update." }, status: null },
                    { id: "telegram-weather", type: "telegram", label: "Telegram", icon: "🌍", color: "#F97316", description: "TelegramNode", x: 680, y: 80, config: { chat_id: "" }, status: null },
                  ],
                  connections: [
                    { from: "schedule-weather", to: "http-weather" },
                    { from: "http-weather", to: "openai-weather" },
                    { from: "openai-weather", to: "telegram-weather" },
                  ],
                },
                {
                  name: "Wikipedia Summarizer",
                  icon: "📰",
                  color: "#EC4899",
                  desc: "Add a Wikipedia URL after the jina.ai link to summarize it",
                  nodes: [
                    { id: "http-jina", type: "http-request", label: "HTTP Request", icon: "🌐", color: "#6366F1", description: "HTTPRequestNode", x: 80, y: 80, config: { url: "https://r.jina.ai/ADD_WIKIPEDIA_URL_HERE", method: "GET", headers: "{}" }, status: null },
                    { id: "openai-jina", type: "openai", label: "OpenAI", icon: "🤖", color: "#10a37f", description: "LLMNode", x: 320, y: 80, config: { prompt: "Read this Wikipedia article text and summarize the core concept in 3 simple bullet points." }, status: null },
                    { id: "telegram-jina", type: "telegram", label: "Telegram", icon: "🌍", color: "#F97316", description: "TelegramNode", x: 560, y: 80, config: { chat_id: "" }, status: null },
                  ],
                  connections: [
                    { from: "http-jina", to: "openai-jina" },
                    { from: "openai-jina", to: "telegram-jina" },
                  ],
                },
              ].map((tpl) => (
                <Link
                  key={tpl.name}
                  to={`/workflow/${crypto.randomUUID()}?template=${encodeURIComponent(JSON.stringify({ name: tpl.name, nodes: tpl.nodes, connections: tpl.connections }))}`}
                  className="group p-4 bg-[#1C1C1E] border border-stroke rounded-2xl hover:border-accent transition-all cursor-pointer block"
                >
                  <div className="text-3xl mb-3">{tpl.icon}</div>
                  <h3 className="font-bold text-white text-sm mb-1">{tpl.name}</h3>
                  <p className="text-xs text-slate-400 mb-3">{tpl.desc}</p>
                  <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: `${tpl.color}20`, color: tpl.color }}>
                    Use Template →
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <h2 className="mb-6 text-xl font-semibold">Recent Workflows</h2>

          {loading ? (
            <div className="text-slate-400">Loading workflows...</div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {workflows.length > 0 ? (
                workflows.map((workflow) => (
                  <WorkflowCard
                    key={workflow.id}
                    id={workflow.id}
                    name={workflow.name}
                    created={workflow.created_at ? new Date(workflow.created_at).toLocaleDateString() : ""}
                    thumbnail_url={workflow.thumbnail_url}
                    onDeleteClick={setDeleteTarget}
                  />
                ))
              ) : (
                <div className="text-slate-400 col-span-full">No workflows found.</div>
              )}

              {/* "Add New Work" Card */}
              <Link to={`/workflow/${newWorkflowId}`} className="group">
                <div className="flex flex-col items-center justify-center p-4 transition-colors bg-transparent border-2 border-dashed cursor-pointer aspect-square rounded-2xl border-stroke text-slate-400 group-hover:border-accent group-hover:text-accent">
                  <div className="flex items-center justify-center w-12 h-12 mb-4 border-2 border-current rounded-full">
                    <PlusIcon />
                  </div>
                  <span className="font-semibold">Add work</span>
                </div>
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
