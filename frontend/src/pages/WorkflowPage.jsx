import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { getWorkflows } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { 
  BarChart3, 
  MessageSquare, 
  Cpu, 
  Globe, 
  Calendar, 
  CloudRain, 
  Clock, 
  Coins, 
  Newspaper,
  Rocket,
  FileText,
  Zap,
  Database,
  ShieldCheck,
  Search,
  GitBranch,
  Mail,
  Plus,
  BrainCircuit,
  Bitcoin
} from "lucide-react";


const API_BASE = "http://localhost:5000/api";

// --- Real Brand Logos (SVG Strings) ---
const LOGO_SVGS = {
  openai: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="24" height="24" rx="6" fill="#10a37f" fillOpacity="0.1"/>
      <path d="M12 17V7M7 12H17" stroke="#10a37f" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  google: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="24" height="24" rx="6" fill="#4285F4" fillOpacity="0.1"/>
      <path d="M12 17V7M7 12H17" stroke="#4285F4" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="24" height="24" rx="6" fill="#4285F4" fillOpacity="0.1"/>
      <rect x="6" y="7" width="12" height="11" rx="2" stroke="#4285F4" strokeWidth="1.5"/>
      <path d="M6 11H18" stroke="#4285F4" strokeWidth="1.5"/>
    </svg>
  ),
  crypto: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="24" height="24" rx="6" fill="#F7931A" fillOpacity="0.1"/>
      <circle cx="12" cy="12" r="6" stroke="#F7931A" strokeWidth="2"/>
      <path d="M12 9V15M10 12H14" stroke="#F7931A" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  weather: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="24" height="24" rx="6" fill="#0ea5e9" fillOpacity="0.1"/>
      <path d="M11 15.5C13.2091 15.5 15 13.7091 15 11.5C15 9.29086 13.2091 7.5 11 7.5C8.79086 7.5 7 9.29086 7 11.5C7 13.7091 8.79086 15.5 11 15.5Z" stroke="#0ea5e9" strokeWidth="1.5"/>
      <path d="M17 14C17 15.6569 15.6569 17 14 17H10C8.34315 17 7 15.6569 7 14C7 12.3431 8.34315 11 10 11" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" fill="white" fillOpacity="0.1"/>
    </svg>
  ),
  ai: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="24" height="24" rx="6" fill="#10a37f" fillOpacity="0.1"/>
      <path d="M12 7V17M7 12H17" stroke="#10a37f" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="3" fill="#10a37f" fillOpacity="0.5"/>
    </svg>
  ),
  summarizer: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="24" height="24" rx="6" fill="#ec4899" fillOpacity="0.1"/>
      <path d="M8 8H16M8 12H16M8 16H13" stroke="#ec4899" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
};

// --- Icon Mapping Helper ---
const TemplateIcon = ({ name, size = 32, className = "" }) => {
  const brandLogos = {
    "Smart Meeting Scheduler": <Calendar size={20} className="text-blue-500" />,
    "Daily Report Sender": LOGO_SVGS.openai,
    "AI Personal Assistant": <BrainCircuit size={20} className="text-emerald-500" />,
    "Hourly Weather Alert": LOGO_SVGS.weather,
    "Crypto Smart Alert": <Bitcoin size={20} className="text-orange-500" />,
    "Wikipedia Summarizer": <Newspaper size={20} className="text-pink-500" />,
  };

  if (brandLogos[name]) {
    const IconElem = brandLogos[name];
    return (
      <div className={`flex items-center justify-center bg-white/5 rounded-xl border border-white/5 ${className}`} style={{ width: size, height: size }}>
        {React.isValidElement(IconElem) ? IconElem : <div className="w-5 h-5">{IconElem}</div>}
      </div>
    );
  }



  const icons = {
    file: FileText,
    message: MessageSquare,
    clock: Clock,
    bot: Cpu,
    sparkles: Zap,
    dna: Database,
    tree: ShieldCheck,
    mail: Mail,
    globe: Globe,
    calendar: Calendar,
    coins: Coins,
    branch: GitBranch,
    rocket: Rocket,
    search: Search,
    zap: Zap
  };
  const IconComponent = icons[name] || Zap;
  return <IconComponent size={size} className={className} />;
};

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5A.75.75 0 0 1 9.95 6Z" clipRule="evenodd" />
  </svg>
);

const DeleteModal = ({ workflowName, onConfirm, onCancel, isDeleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="bg-[#1C1C1E] border border-red-500/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
      <div className="flex items-center justify-center w-14 h-14 mx-auto mb-5 rounded-full bg-red-500/15 border border-red-500/30">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-red-400">
          <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-white text-center mb-2">Delete Workflow?</h3>
      <p className="text-slate-400 text-center text-sm mb-1">You are about to permanently delete:</p>
      <p className="text-white font-semibold text-center mb-6 px-4 py-2 bg-[#2A2A2D] rounded-lg truncate">"{workflowName}"</p>
      <div className="flex gap-3">
        <button onClick={onCancel} disabled={isDeleting} className="flex-1 px-4 py-3 bg-[#2A2A2D] text-gray-300 border border-stroke rounded-xl font-semibold text-sm hover:bg-[#333336] transition-colors">Cancel</button>
        <button onClick={onConfirm} disabled={isDeleting} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
          {isDeleting ? "Deleting..." : <><TrashIcon /> Yes, Delete</>}
        </button>
      </div>
    </div>
  </div>
);

const WorkflowCard = ({ id, name, created, thumbnail_url, nodes = [], onDeleteClick }) => {
  return (
    <div className="group relative">
      <Link to={`/workflow/${id}`} className="cursor-pointer block">
        <div className="aspect-square bg-[#1C1C1E] rounded-2xl overflow-hidden border border-stroke group-hover:border-accent transition-all duration-300 relative">
          {thumbnail_url ? (
            <img src={thumbnail_url} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-[#1C1C1E] flex flex-col items-center justify-center p-6 relative">
               <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#2a2a2a 1px, transparent 1px)", backgroundSize: "15px 15px" }} />
               <div className="grid grid-cols-2 gap-3 relative z-10">
                  {nodes.slice(0, 4).map((node, i) => (
                    <div key={i} className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 bg-white/5 shadow-inner" style={{ color: node.color }}>
                       <TemplateIcon name={node.icon || node.type} size={20} />
                    </div>
                  ))}
                  {nodes.length === 0 && (
                     <div className="col-span-2 flex flex-col items-center gap-2 opacity-20">
                        <Rocket size={40} />
                     </div>
                  )}
               </div>
               <div className="mt-4 text-[10px] uppercase tracking-[0.2em] text-slate-600 font-black">Workflow Preview</div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
            <span className="text-white text-xs font-bold px-4 py-2 bg-primary/90 text-brand-dark rounded-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-xl">OPEN WORKFLOW</span>
          </div>
        </div>
      </Link>
      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDeleteClick({ id, name }); }} className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-red-600/80 border border-red-500/50 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center hover:bg-red-600 hover:scale-110 shadow-lg z-10"><TrashIcon /></button>
      <div className="p-2 mt-4 space-y-1">
        <h3 className="font-bold text-white text-md truncate">{name}</h3>
        <p className="text-xs text-slate-500">Created {created}</p>
      </div>
    </div>
  );
};

export default function WorkflowPage() {
  const { user, tokens } = useAuth();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const newWorkflowId = crypto.randomUUID();

  useEffect(() => {
    async function fetchWorkflows() {
      if (!user || !tokens?.access) { setLoading(false); return; }
      try {
        const response = await getWorkflows(user.id, tokens.access);
        setWorkflows(response.data.workflows || []);
      } catch (err) { setError(err.response?.data?.message || "Failed to fetch."); } finally { setLoading(false); }
    }
    fetchWorkflows();
  }, [user, tokens]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/workflows/${deleteTarget.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${tokens.access}` } });
      if (!res.ok) throw new Error("Failed");
      setWorkflows((prev) => prev.filter((w) => w.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) { console.error(err); } finally { setIsDeleting(false); }
  };

  return (
    <div className="w-full min-h-screen bg-brand-dark text-white">
      {deleteTarget && <DeleteModal workflowName={deleteTarget.name} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} isDeleting={isDeleting} />}
      <div className="px-28 py-10 mx-auto max-w-[1600px]">
        <header className="mb-16">
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">Workflow Dashboard</h1>
          <p className="text-slate-500 text-sm font-medium">Automate your tasks with AI-powered nodes and connections.</p>
        </header>

        <main>
          <section className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold flex items-center gap-3 text-white">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Rocket className="text-primary" size={16} /></div>
                Templates Library
              </h2>
              <div className="text-[10px] font-black text-slate-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 uppercase tracking-widest">6 Featured</div>
            </div>
            
            {(() => {
              const templates = [
                {
                  name: "Smart Meeting Scheduler",
                  desc: "Text to AI to Google Calendar",
                  color: "#4285F4",
                  nodes: [
                    { id: "tm-1", type: "text-message", label: "Meeting Text", icon: "message", color: "#95E1D3", x: 100, y: 100, config: { text_input: "Meeting with Client at 2 PM tomorrow for 45 minutes" } },
                    { id: "ai-1", type: "openai", label: "AI Event Parser", icon: "openai", color: "#10a37f", x: 350, y: 100, config: { prompt: "Extract meeting details from text. Return ONLY a JSON object with: 'summary' (string), 'start_time' (ISO 8601 format, assume today/tomorrow based on text), and 'duration' (integer minutes). No other text." } },
                    { id: "cal-1", type: "google-calendar", label: "Google Calendar", icon: "calendar", color: "#4285F4", x: 600, y: 100, config: { calendar_id: "primary" } },
                    { id: "tg-1", type: "telegram", label: "Telegram Bot", icon: "telegram", color: "#F97316", x: 850, y: 100, config: { chat_id: "1188065715" } },
                  ],
                  connections: [{ from: "tm-1", to: "ai-1" }, { from: "ai-1", to: "cal-1" }, { from: "cal-1", to: "tg-1" }],
                },
                {
                  name: "Daily Report Sender",
                  desc: "Summarize your day and send to Telegram",
                  color: "#10a37f",
                  nodes: [
                    { id: "t2", type: "text-message", label: "Daily Notes", icon: "message", color: "#95E1D3", x: 100, y: 150, config: { text_input: "Worked on UI design, fixed 3 bugs in backend, and had a meeting with the marketing team." } },
                    { id: "o2", type: "openai", label: "AI Summarizer", icon: "openai", color: "#10a37f", x: 350, y: 150, config: { prompt: "Summarize these daily notes into a professional bulleted report for Telegram." } },
                    { id: "tg2", type: "telegram", label: "Telegram Bot", icon: "telegram", color: "#F97316", x: 600, y: 150, config: { chat_id: "1188065715" } },
                  ],
                  connections: [{ from: "t2", to: "o2" }, { from: "o2", to: "tg2" }],
                },
                {
                  name: "Crypto Smart Alert",
                  desc: "Live Bitcoin tracking & AI analysis",
                  color: "#F7931A",
                  nodes: [
                    { id: "c3", type: "crypto-tracker", label: "Bitcoin Price", icon: "coins", color: "#F7931A", x: 100, y: 150, config: { coin: "bitcoin" } },
                    { id: "o3", type: "openai", label: "Market Analyst", icon: "openai", color: "#10a37f", x: 350, y: 150, config: { prompt: "Analyze this crypto price and tell me if it's a good time to buy or sell. Keep it short." } },
                    { id: "tg3", type: "telegram", label: "Alert Bot", icon: "telegram", color: "#F97316", x: 600, y: 150, config: { chat_id: "1188065715" } },
                  ],
                  connections: [{ from: "c3", to: "o3" }, { from: "o3", to: "tg3" }],
                },
                {
                   name: "Hourly Weather Alert",
                   desc: "Weather updates summarized by AI",
                   color: "#0ea5e9",
                   nodes: [
                     { id: "s4", type: "schedule", label: "Hourly", icon: "clock", color: "#8B5CF6", x: 100, y: 100, config: { schedule: "hourly" } },
                     { id: "h4", type: "http-request", label: "Weather API", icon: "globe", color: "#6366F1", x: 350, y: 100, config: { url: "https://api.weatherapi.com/v1/current.json?key=FREE_KEY&q=London" } },
                     { id: "o4", type: "openai", label: "Weather Expert", icon: "openai", color: "#10a37f", x: 600, y: 100, config: { prompt: "Explain this weather data in a friendly tone for a Telegram message." } },
                     { id: "tg4", type: "telegram", label: "Telegram Bot", icon: "telegram", color: "#F97316", x: 850, y: 100, config: { chat_id: "1188065715" } },
                   ],
                   connections: [{ from: "s4", to: "h4" }, { from: "h4", to: "o4" }, { from: "o4", to: "tg4" }],
                },
                {
                   name: "Wikipedia Summarizer",
                   desc: "Quick summaries of any topic",
                   color: "#ec4899",
                   nodes: [
                     { id: "w5", type: "text-message", label: "Topic Name", icon: "search", color: "#95E1D3", x: 100, y: 150, config: { text_input: "Artificial Intelligence" } },
                     { id: "h5", type: "http-request", label: "Wikipedia API", icon: "globe", color: "#6366F1", x: 350, y: 150, config: { url: "https://en.wikipedia.org/api/rest_v1/page/summary/" } },
                     { id: "o5", type: "openai", label: "AI Reader", icon: "openai", color: "#10a37f", x: 600, y: 150, config: { prompt: "Read this Wikipedia summary and give me the top 3 most interesting facts." } },
                     { id: "tg5", type: "telegram", label: "Knowledge Bot", icon: "telegram", color: "#F97316", x: 850, y: 150, config: { chat_id: "1188065715" } },
                   ],
                   connections: [{ from: "w5", to: "h5" }, { from: "h5", to: "o5" }, { from: "o5", to: "tg5" }],
                },
                {
                   name: "AI Personal Assistant",
                   desc: "Smart reminders and scheduling",
                   color: "#10a37f",
                   nodes: [
                     { id: "t6", type: "text-message", label: "User Goal", icon: "message", color: "#95E1D3", x: 100, y: 150, config: { text_input: "Remind me to buy milk at 6 PM" } },
                     { id: "o6", type: "openai", label: "Assistant", icon: "openai", color: "#10a37f", x: 350, y: 150, config: { prompt: "Schedule this reminder and format it nicely." } },
                     { id: "tg6", type: "telegram", label: "Reminder Bot", icon: "telegram", color: "#F97316", x: 600, y: 150, config: { chat_id: "1188065715" } },
                   ],
                   connections: [{ from: "t6", to: "o6" }, { from: "o6", to: "tg6" }],
                }
              ];

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {templates.map((tpl) => (
                    <Link 
                      key={tpl.name} 
                      to={`/workflow/${crypto.randomUUID()}?template=${encodeURIComponent(JSON.stringify({ name: tpl.name, nodes: tpl.nodes, connections: tpl.connections }))}`} 
                      className="group relative p-6 bg-[#1C1C1E]/50 backdrop-blur-sm border border-white/5 rounded-3xl hover:border-primary/40 transition-all duration-500 cursor-pointer flex flex-col min-h-[220px] w-full overflow-hidden shadow-2xl hover:shadow-primary/5"
                    >
                      <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary/5 blur-[50px] group-hover:bg-primary/10 transition-colors duration-500" />
                      <div className="relative z-10">
                        <div className="mb-5 inline-flex p-2.5 bg-white/5 rounded-2xl border border-white/5 group-hover:scale-110 transition-all duration-500 shadow-inner">
                          <TemplateIcon name={tpl.name} size={24} />
                        </div>
                        <h3 className="font-bold text-sm text-white mb-1.5 group-hover:text-primary transition-colors line-clamp-1">{tpl.name}</h3>
                        <p className="text-[10px] leading-relaxed text-slate-500 mb-6 line-clamp-2">{tpl.desc}</p>
                      </div>
                      <div className="mt-auto relative z-10 flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 group-hover:text-primary/70 transition-colors">Start Building</span>
                        <div className="w-7 h-7 rounded-full bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-brand-dark transition-all duration-500">
                           <Zap size={11} fill="currentColor" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              );
            })()}
          </section>

          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">⚡</div>
                Your Recent Workflows
              </h2>
              <div className="h-px flex-1 bg-white/5 mx-6" />
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <Link to={`/workflow/${newWorkflowId}`} className="group relative flex flex-col items-center justify-center p-8 bg-transparent border-2 border-dashed cursor-pointer aspect-square rounded-[2.5rem] border-white/5 text-slate-500 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-500">
                <div className="flex items-center justify-center w-16 h-16 mb-6 border-2 border-current rounded-full group-hover:scale-110 transition-transform duration-500"><Plus size={32} /></div>
                <span className="font-bold text-sm tracking-wide">Create New Flow</span>
              </Link>
              {workflows.map((w) => <WorkflowCard key={w.id} id={w.id} name={w.name} created={new Date(w.created_at).toLocaleDateString()} thumbnail_url={w.thumbnail_url} nodes={w.nodes || []} onDeleteClick={setDeleteTarget} />)}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
