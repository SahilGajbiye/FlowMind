import React, { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";

import {
  Mail,
  MessageSquare,
  Plus,
  X,
  Play,
  Save,
  Download,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Settings,
  ChevronDown,
  List,
  RefreshCw,
  Clock,
  Cpu,
  FileText,
  Zap,
  Globe,
  Database,
  Calendar,
  Coins,
  GitBranch,
  Rocket,
  ShieldCheck,
  Search,
} from "lucide-react";
import html2canvas from "html2canvas";

const API_BASE = "http://localhost:5000/api";
import { useAuth } from "../context/AuthContext";

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// --- Real Brand Logos (SVG Strings) ---
const LOGO_SVGS = {
  openai: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-[#10a37f]">
      <path d="M22.28 9.82a5.98 5.98 0 0 0-.51-4.9 6.04 6.04 0 0 0-4.39-3.1 6.01 6.01 0 0 0-5.19 1.04 6.02 6.02 0 0 0-5.67 0 6.01 6.01 0 0 0-5.19-1.04 6.05 6.05 0 0 0-4.39 3.1 6 6 0 0 0-.51 4.9 6.04 6.04 0 0 0 1.04 5.19 6.02 6.02 0 0 0 0 5.67 6.01 6.01 0 0 0 1.04 5.19 6.05 6.05 0 0 0 4.39 3.1 6.01 6.01 0 0 0 5.19-1.04 6.02 6.02 0 0 0 5.67 0 6.01 6.01 0 0 0 5.19 1.04 6.05 6.05 0 0 0 4.39-3.1 6 6 0 0 0 .51-4.9 6.04 6.04 0 0 0-1.04-5.19 6.02 6.02 0 0 0 0-5.67 6.01 6.01 0 0 0-1.04-5.19zM12.06 18.97l-5.13-2.96v-5.92l5.13 2.96v5.92zm1.15-2l5.13-2.96v-5.92l-5.13 2.96v5.92zm-6.28-9.07l5.13-2.96 5.13 2.96-5.13 2.96-5.13-2.96z"/>
    </svg>
  ),
  meta: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-[#0668E1]">
      <path d="M17.435 8.347c-1.642 0-3.13 1.05-4.322 2.684a20.08 20.08 0 0 1-1.113-1.684C10.808 7.712 9.32 6.66 7.678 6.66c-3.149 0-5.701 2.4-5.701 5.34s2.552 5.34 5.701 5.34c1.642 0 3.13-1.05 4.322-2.684a20.08 20.08 0 0 1 1.113 1.684c1.192 1.635 2.68 2.684 4.322 2.684 3.149 0 5.701-2.4 5.701-5.34s-2.552-5.34-5.701-5.34zm0 8.68c-1.113 0-2.226-.818-3.23-2.18l-.54-.736.54-.736c1.004-1.362 2.117-2.18 3.23-2.18 1.908 0 3.461 1.553 3.461 3.461s-1.553 3.461-3.461 3.461zM7.678 14.847c-1.908 0-3.461-1.553-3.461-3.461s1.553-3.461 3.461-3.461c1.113 0 2.226.818 3.23 2.18l.54.736-.54.736c-1.004 1.362-2.117 2.18-3.23 2.18z" />
    </svg>
  ),
  kimi: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-purple-400">
      <path d="M12 2L9.19 8.63 2 12l7.19 3.37L12 22l2.81-6.63L22 12l-7.19-3.37L12 2z" />
    </svg>
  ),

  google: (

    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  ),
  telegram: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.891 8.145l-1.456 6.82c-.109.49-.399.611-.81.383l-2.232-1.645-1.077 1.037c-.119.119-.219.219-.449.219l.16-2.268 4.128-3.729c.179-.159-.039-.248-.278-.088l-5.101 3.212-2.198-.687c-.478-.15-.487-.478.1-.706l8.587-3.311c.397-.145.744.093.586.764z" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5z" fill="#4285F4"/>
    </svg>
  ),
  gmail: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#EA4335"/>
    </svg>
  ),
  slack: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.523-2.52A2.528 2.528 0 0 1 8.834 0a2.527 2.527 0 0 1 2.52 2.522v2.52h-2.52zM8.834 6.313a2.527 2.527 0 0 1-2.52 2.521 2.527 2.527 0 0 1 2.52 2.521h6.313A2.528 2.528 0 0 1 17.68 8.834a2.528 2.528 0 0 1-2.522-2.521h-6.324zM18.958 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.527 2.527 0 0 1-2.522 2.52h-2.52v-2.52zM17.688 8.834a2.527 2.527 0 0 1-2.521 2.52 2.527 2.527 0 0 1-2.521-2.52V2.521A2.528 2.528 0 0 1 15.167 0a2.528 2.528 0 0 1 2.521 2.522v6.312zM15.167 18.958a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.167 24a2.527 2.527 0 0 1-2.52-2.52v-2.52h2.52zM15.167 17.688a2.527 2.527 0 0 1 2.52-2.521 2.527 2.527 0 0 1-2.52-2.521H8.834a2.528 2.528 0 0 1-2.521 2.521 2.528 2.528 0 0 1 2.521 2.521h6.333z" fill="#E01E5A"/>
    </svg>
  ),
  crypto: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 24C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12zm0-22c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10zm2 12.5v-1h1.5v-1.5H14v-1h1.5v-1.5H14v-1h-1v1h-1.5v-1h-1v1H9v1.5h1.5v1H9v1.5h1.5v1H9v1h1v-1h1.5v1h1v-1zm-2.5-3.5h1.5v1H11.5v-1zm0 2.5h1.5v1h-1.5v-1z" fill="#F7931A"/>
    </svg>
  ),
  llama: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zM11 7h2v10h-2V7z"/>
    </svg>
  ),
  gemini: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-blue-400">
      <path d="M12 2L9.19 8.63 2 12l7.19 3.37L12 22l2.81-6.63L22 12l-7.19-3.37L12 2z"/>
    </svg>
  ),
};

// --- Helper for rendering Icons from string ---
const NodeIcon = ({ iconName, size = 18, className = "" }) => {
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

  // Check for brand logos first
  const brandLogos = {
    openai: LOGO_SVGS.openai,
    google: LOGO_SVGS.google,
    telegram: LOGO_SVGS.telegram,
    calendar: LOGO_SVGS.calendar,
    gmail: LOGO_SVGS.gmail,
    slack: LOGO_SVGS.slack,
    coins: LOGO_SVGS.crypto,
    sparkles: LOGO_SVGS.kimi,
    meta: LOGO_SVGS.meta,
  };

  if (brandLogos[iconName]) {
    return <div style={{ width: size, height: size }} className={className}>{brandLogos[iconName]}</div>;
  }

  const IconComponent = icons[iconName] || Zap;
  return <IconComponent size={size} className={className} />;
};

const nodeCategories = {
  Trigger: [
    {
      id: "file-upload",
      type: "DocumentInputNode",
      label: "File Upload",
      icon: "file",
      color: "#95E1D3",
      description: "Upload file trigger",
    },
    {
      id: "text-message",
      type: "TextInputNode",
      label: "Text input",
      icon: "message",
      color: "#95E1D3",
      description: "Input custom text",
    },
    {
      id: "schedule",
      type: "ScheduleTriggerNode",
      label: "Schedule",
      icon: "clock",
      color: "#8B5CF6",
      description: "Run on a schedule (cron)",
    },
  ],
  "LLM Connectors": [
    {
      id: "openai",
      type: "LLMNode",
      label: "OpenAI",
      icon: "openai",
      color: "#10a37f",
      description: "GPT-4, GPT-3.5 models",
    },
    {
      id: "llama",
      type: "LLMNode",
      label: "llama",
      icon: "meta",
      color: "#10a37f",
      description: "llama models",
    },
    {
      id: "gemini",
      type: "LLMNode",
      label: "Kimi k2",
      icon: "sparkles",
      color: "#4285f4",
      description: "Moonshot AI (Kimi) models",
    },
  ],
  "Vector & RAG": [
    {
      id: "faiss",
      type: "VectorDBNode",
      label: "FAISS",
      icon: "dna",
      color: "#1ABC9C",
      description: "Vector database",
    },
    {
      id: "pinecone",
      type: "VectorDBNode",
      label: "Pinecone",
      icon: "tree",
      color: "#00D4AA",
      description: "Vector database",
    },
  ],
  "Output & Actions": [
    {
      id: "gmail",
      label: "Gmail",
      type: "EmailNode",
      icon: "gmail",
      color: "#EA4335",
      description: "EmailNode",
    },
    {
      id: "slack",
      label: "Slack",
      icon: "slack",
      color: "#4A154B",
      description: "Send messages",
    },
    {
      id: "telegram",
      type: "TelegramNode",
      label: "Telegram",
      icon: "telegram",
      color: "#F97316",
      description: "Send message via Telegram",
    },
    {
      id: "http-request",
      type: "HTTPRequestNode",
      label: "HTTP Request",
      icon: "globe",
      color: "#6366F1",
      description: "Call any external API",
    },
    {
      id: "google-calendar",
      type: "GoogleCalendarNode",
      label: "Google Calendar",
      icon: "calendar",
      color: "#4285F4",
      description: "Sync events to Google Calendar",
    },
    {
      id: "crypto-tracker",
      type: "CryptoTrackerNode",
      label: "Crypto Tracker",
      icon: "coins",
      color: "#F7931A",
      description: "Live crypto/stock prices",
    },
  ],
  "Logic & Flow": [
    {
      id: "condition",
      type: "ConditionNode",
      label: "Condition",
      icon: "branch",
      color: "#F59E0B",
      description: "If/Else branching logic",
    },
    {
      id: "scheduler",
      type: "SchedulerNode",
      label: "Task Scheduler",
      icon: "clock",
      color: "#F59E0B",
      description: "AI-driven scheduling",
    },
  ],
};

export default function CanvasPage() {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showNodePanel, setShowNodePanel] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("LLM Connectors");
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const [currentWorkflowId, setCurrentWorkflowId] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionId, setExecutionId] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const [savedWorkflows, setSavedWorkflows] = useState([]);
  const [showWorkflowList, setShowWorkflowList] = useState(false);
  const [notification, setNotification] = useState(null);
  const [executionResults, setExecutionResults] = useState(null);
  const canvasRef = useRef(null);
  const { user, tokens } = useAuth();

  const notify = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const url = window.location.href;
    const lastPart = url.split("/").pop().split("?")[0];

    const searchParams = new URLSearchParams(window.location.search);
    const templateParam = searchParams.get("template");
    if (templateParam) {
      try {
        const tpl = JSON.parse(decodeURIComponent(templateParam));
        setWorkflowName(tpl.name || "Untitled Workflow");
        setNodes(tpl.nodes || []);
        setConnections(tpl.connections || []);
        setCurrentWorkflowId(lastPart);
        notify(`Template "${tpl.name}" loaded! Customize and save.`);
        return;
      } catch (e) {
        console.warn("Failed to parse template:", e);
      }
    }

    loadWorkflow(lastPart);
  }, []);

  const loadWorkflow = async (workflowId) => {
    try {
      const response = await fetch(`${API_BASE}/workflows/${workflowId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokens.access}`,
        },
      });

      if (response.status == 404) return;

      if (!response.ok) throw new Error("Workflow not found");
      const workflow = await response.json();

      const transformedNodes = workflow.nodes.map((node) => ({
        ...node,
        color: node.color || "#ADFF2F",
        icon: node.icon || "bot",
        description: node.description || `${node.type} node`,
        config: node.config || {},
        status: null,
      }));

      setWorkflowName(workflow.name);
      setNodes(transformedNodes);
      setConnections(workflow.connections || []);
      setCurrentWorkflowId(workflow.id);
      setShowWorkflowList(false);
      setExecutionResults(null);
      notify(`Loaded workflow: ${workflow.name}`);
    } catch (error) {
      console.error("Error loading workflow:", error);
      notify("Failed to load workflow", "error");
    }
  };

  const generateAndUploadThumbnail = async () => {
    try {
      if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) return null;
      if (nodes.length === 0) return null;

      const offscreen = document.createElement("canvas");
      offscreen.width = 800;
      offscreen.height = 500;
      const ctx = offscreen.getContext("2d");

      ctx.fillStyle = "#141414";
      ctx.fillRect(0, 0, 800, 500);
      
      // Draw Grid Pattern
      ctx.strokeStyle = "#2a2a2a";
      ctx.lineWidth = 1;
      for(let i=0; i<800; i+=30) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,500); ctx.stroke(); }
      for(let i=0; i<500; i+=30) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(800,i); ctx.stroke(); }

      const xs = nodes.map((n) => n.x);
      const ys = nodes.map((n) => n.y);
      const minX = Math.min(...xs) - 50;
      const minY = Math.min(...ys) - 50;
      const maxX = Math.max(...xs) + 250;
      const maxY = Math.max(...ys) + 100;
      
      const scaleX = 700 / Math.max(maxX - minX, 1);
      const scaleY = 400 / Math.max(maxY - minY, 1);
      const scale = Math.min(scaleX, scaleY, 0.8);
      const offsetX = (800 - (maxX - minX) * scale) / 2;
      const offsetY = (500 - (maxY - minY) * scale) / 2;

      // Draw Connections
      connections.forEach(conn => {
        const from = nodes.find(n => n.id === conn.from);
        const to = nodes.find(n => n.id === conn.to);
        if(from && to) {
          ctx.beginPath();
          ctx.strokeStyle = from.color;
          ctx.lineWidth = 3 * scale;
          ctx.setLineDash([5, 5]);
          const x1 = offsetX + (from.x - minX + 160) * scale;
          const y1 = offsetY + (from.y - minY + 40) * scale;
          const x2 = offsetX + (to.x - minX) * scale;
          const y2 = offsetY + (to.y - minY + 40) * scale;
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // Draw Nodes
      nodes.forEach((node) => {
        const nx = offsetX + (node.x - minX) * scale;
        const ny = offsetY + (node.y - minY) * scale;
        const nw = 180 * scale;
        const nh = 70 * scale;
        
        // Glow effect
        ctx.shadowBlur = 15 * scale;
        ctx.shadowColor = node.color;
        
        // Node background
        ctx.fillStyle = "#1C1C1E";
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 2 * scale;
        
        const r = 10 * scale;
        ctx.beginPath();
        ctx.moveTo(nx + r, ny);
        ctx.lineTo(nx + nw - r, ny);
        ctx.quadraticCurveTo(nx + nw, ny, nx + nw, ny + r);
        ctx.lineTo(nx + nw, ny + nh - r);
        ctx.quadraticCurveTo(nx + nw, ny + nh, nx + nw - r, ny + nh);
        ctx.lineTo(nx + r, ny + nh);
        ctx.quadraticCurveTo(nx, ny + nh, nx, ny + nh - r);
        ctx.lineTo(nx, ny + r);
        ctx.quadraticCurveTo(nx, ny, nx + r, ny);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        
        // Node Header Color Bar
        ctx.fillStyle = node.color;
        ctx.fillRect(nx, ny, 6 * scale, nh);

        // Node Label Text
        ctx.fillStyle = "#FFFFFF";
        ctx.font = `bold ${14 * scale}px Inter, sans-serif`;
        ctx.fillText(node.label, nx + 15 * scale, ny + 25 * scale);
        
        // Optional: Draw a tiny icon placeholder
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(nx + nw - 20 * scale, ny + 20 * scale, 10 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      return offscreen.toDataURL("image/png", 0.9);


    } catch (err) {
      return null;
    }
  };

  const saveWorkflow = async () => {
    if (nodes.length === 0) {
      notify("Cannot save an empty workflow", "error");
      return;
    }
    try {
      const link = window.location.href;
      const lastPart = link.split("/").pop().split("?")[0];
      const thumbnailUrl = await generateAndUploadThumbnail();

      const workflowData = {
        id: lastPart,
        name: workflowName,
        nodes,
        connections,
        ...(thumbnailUrl && { thumbnail_url: thumbnailUrl }),
      };

      const response = await fetch(`${API_BASE}/workflows`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.access}`,
        },
        body: JSON.stringify(workflowData),
      });

      if (!response.ok) throw new Error("Failed to save");
      notify("Workflow saved successfully!");
    } catch (error) {
      notify("Failed to save workflow", "error");
    }
  };

  const executeWorkflow = async () => {
    let workflowIdToRun = currentWorkflowId;
    if (!workflowIdToRun) {
      const link = window.location.href;
      workflowIdToRun = link.split("/").pop().split("?")[0];
    }
    if (!workflowIdToRun) {
      notify("Please save the workflow before executing", "error");
      return;
    }
    setIsExecuting(true);
    setNodes((prev) => prev.map((n) => ({ ...n, status: "running" })));
    try {
      const workflowPayload = { id: workflowIdToRun, name: workflowName, nodes, connections };
      const response = await fetch(`${API_BASE}/workflows/${workflowIdToRun}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.access}`,
        },
        body: JSON.stringify(workflowPayload),
      });
      if (!response.ok) throw new Error("Execution failed");
      notify("Workflow execution started...");
      setTimeout(() => {
        setNodes((prev) => prev.map((n) => ({ ...n, status: "success" })));
        setIsExecuting(false);
      }, 3000);
    } catch (error) {
      setNodes((prev) => prev.map((n) => ({ ...n, status: "error" })));
      setIsExecuting(false);
    }
  };

  const handleConfigChange = (nodeId, configKey, value) => {
    setNodes((prev) => prev.map((node) => node.id === nodeId ? { ...node, config: { ...node.config, [configKey]: value } } : node));
    if (selectedNode?.id === nodeId) {
      setSelectedNode((prev) => ({ ...prev, config: { ...prev.config, [configKey]: value } }));
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    if (draggedNode !== null) {
      const rect = canvasRef.current.getBoundingClientRect();
      setNodes((prev) => prev.map((node) => node.id === draggedNode ? { ...node, x: e.clientX - rect.left - dragOffset.x, y: e.clientY - rect.top - dragOffset.y } : node));
    }
  }, [draggedNode, dragOffset]);

  const handleMouseUp = useCallback(() => {
    if (connecting !== null && hoveredNode !== null && hoveredNode !== connecting) {
      setConnections((prev) => [...prev, { from: connecting, to: hoveredNode }]);
    }
    setConnecting(null);
    setDraggedNode(null);
  }, [connecting, hoveredNode]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const addNode = (nodeConfig) => {
    const newNode = {
      id: `${nodeConfig.id}-${Date.now()}`,
      type: nodeConfig.id,
      label: nodeConfig.label,
      icon: nodeConfig.icon,
      color: nodeConfig.color,
      description: nodeConfig.type,
      x: 400,
      y: 100 + nodes.length * 50,
      config: {},
      status: null,
    };
    setNodes((prev) => [...prev, newNode]);
    setShowNodePanel(false);
    setSelectedNode(newNode);
  };

  const deleteNode = (nodeId) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setConnections((prev) => prev.filter((c) => c.from !== nodeId && c.to !== nodeId));
    if (selectedNode?.id === nodeId) setSelectedNode(null);
  };

  const getNodeCenter = (node) => ({ x: node.x + 110, y: node.y + 40 });

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden font-sans text-white bg-brand-dark">
      {notification && (
        <div className={`fixed top-20 right-6 z-50 rounded-xl p-4 shadow-xl flex items-center gap-3 min-w-80 ${notification.type === "error" ? "bg-red-500/20 border border-red-500/30" : "bg-primary/20 border border-primary/30"}`}>
          {notification.type === "error" ? <AlertCircle size={20} className="text-red-400" /> : <CheckCircle2 size={20} className="text-primary" />}
          <span className={`text-sm font-medium ${notification.type === "error" ? "text-red-300" : "text-primary"}`}>{notification.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-brand-dark/50 backdrop-blur-md border-stroke z-30">
        <div className="flex items-center gap-4">
          <Link to="/workflow" className="p-2 transition-colors rounded-lg hover:bg-white/5 text-slate-400">
            <X size={20} />
          </Link>
          <div className="w-px h-6 bg-stroke" />
          <input type="text" value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} className="bg-transparent border-none text-md font-bold text-white focus:outline-none focus:ring-0 w-64" />
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-white/5 px-3 py-1.5 rounded-full border border-stroke">
           <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
           Editing Mode
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {/* Canvas Area */}
        <div ref={canvasRef} className="relative w-full h-full cursor-grab active:cursor-grabbing bg-brand-dark" style={{ backgroundImage: "radial-gradient(#2a2a2a 1px, transparent 1px)", backgroundSize: "30px 30px" }}>
          {/* Connections SVG */}
          <svg className="absolute inset-0 pointer-events-none z-10 w-full h-full">
            {connections.map((conn, idx) => {
              const from = nodes.find((n) => n.id === conn.from);
              const to = nodes.find((n) => n.id === conn.to);
              if (!from || !to) return null;
              const start = getNodeCenter(from);
              const end = { x: to.x, y: to.y + 40 };
              const cp1x = start.x + Math.abs(end.x - start.x) / 2;
              const cp2x = end.x - Math.abs(end.x - start.x) / 2;
              return (
                <g key={idx}>
                  <path d={`M ${start.x} ${start.y} C ${cp1x} ${start.y}, ${cp2x} ${end.y}, ${end.x} ${end.y}`} fill="none" stroke={from.color} strokeWidth="3" strokeLinecap="round" opacity="0.6" className="connection-path" />
                  <circle cx={end.x} cy={end.y} r="4" fill={from.color} />
                </g>
              );
            })}
            {connecting !== null && (
              <line x1={getNodeCenter(nodes.find((n) => n.id === connecting)).x} y1={getNodeCenter(nodes.find((n) => n.id === connecting)).y} x2={mousePos.x} y2={mousePos.y} stroke="#ADFF2F" strokeWidth="3" strokeDasharray="5,5" opacity="0.4" />
            )}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <div key={node.id} className="absolute z-20" style={{ left: node.x, top: node.y }} onMouseEnter={() => setHoveredNode(node.id)} onMouseLeave={() => setHoveredNode(null)}>
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#1C1C1E] rounded-full cursor-crosshair z-30" style={{ backgroundColor: node.color }} />
              <div onMouseDown={(e) => { setDraggedNode(node.id); setDragOffset({ x: e.clientX - e.currentTarget.getBoundingClientRect().left, y: e.clientY - e.currentTarget.getBoundingClientRect().top }); setSelectedNode(node); }} onClick={() => setSelectedNode(node)} className="bg-[#1C1C1E] border-2 rounded-xl w-80 p-4 cursor-move transition-all user-select-none" style={{ borderColor: selectedNode?.id === node.id ? node.color : "#38373A", boxShadow: selectedNode?.id === node.id ? `0 8px 32px ${node.color}40` : "0 4px 16px rgba(0,0,0,0.3)" }}>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center h-12 w-12 min-w-12 rounded-xl" style={{ backgroundColor: `${node.color}15`, color: node.color }}>
                    <NodeIcon iconName={node.icon} size={28} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 text-sm font-semibold text-white">{node.label}</div>
                    <div className="text-xs leading-relaxed text-gray-400">{node.description}</div>
                    {node.status && (
                      <div className="flex items-center gap-2 mt-2">
                        {node.status === "success" && <CheckCircle2 size={14} className="text-primary" />}
                        {node.status === "running" && <div className="w-3.5 h-3.5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />}
                        {node.status === "error" && <AlertCircle size={14} className="text-red-400" />}
                        <span className={`text-xs font-medium ${node.status === "success" ? "text-primary" : node.status === "error" ? "text-red-400" : "text-yellow-400"}`}>{node.status === "success" ? "✓ Completed" : node.status === "error" ? "✗ Failed" : "⟳ Running..."}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div onMouseDown={(e) => { e.stopPropagation(); setConnecting(node.id); }} className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#1C1C1E] rounded-full cursor-crosshair z-30" style={{ backgroundColor: node.color }} />
            </div>
          ))}

          {/* Empty State */}
          {nodes.length === 0 && !showNodePanel && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
              <div className="mb-6 text-primary drop-shadow-2xl">
                 <Rocket size={80} strokeWidth={1.5} className="animate-bounce" />
              </div>
              <h2 className="mb-3 text-3xl font-bold text-white tracking-tight">Start Building Your Workflow</h2>
              <p className="max-w-md text-lg text-gray-400 leading-relaxed">Click the <span className="text-primary font-bold">+</span> button in the toolbar below <br/> to add your first node and begin automations.</p>
            </div>
          )}
        </div>

        {/* Bottom Toolbar */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-6 py-4 rounded-3xl bg-[#1C1C1E]/80 backdrop-blur-xl border border-stroke shadow-2xl">
          <button onClick={() => setShowNodePanel(true)} className="flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all rounded-2xl bg-primary text-brand-dark hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
            <Plus size={18} strokeWidth={2.5} /> Add Node
          </button>
          <div className="w-px h-8 mx-2 bg-stroke" />
          <button onClick={saveWorkflow} className="flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors rounded-2xl bg-white/5 hover:bg-white/10 border border-stroke">
            <Save size={18} /> Save
          </button>
          <button onClick={executeWorkflow} disabled={isExecuting} className="flex items-center gap-2 px-8 py-3 text-sm font-bold transition-all rounded-2xl bg-accent text-white hover:scale-105 active:scale-95 shadow-lg shadow-accent/20 disabled:opacity-50 disabled:scale-100">
            <Play size={18} fill="currentColor" /> {isExecuting ? "Running..." : "Run Workflow"}
          </button>
        </div>

        {/* Node Settings Panel */}
        {selectedNode && (
          <div className="absolute right-0 top-0 h-full w-80 bg-[#1C1C1E] border-l border-stroke flex flex-col shadow-lg z-30">
            <div className="flex items-center justify-between p-5 border-b border-stroke">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${selectedNode.color}15`, color: selectedNode.color }}>
                   <NodeIcon iconName={selectedNode.icon} size={20} />
                </div>
                <div className="text-lg font-bold text-white">{selectedNode.label}</div>
              </div>
              <button onClick={() => setSelectedNode(null)} className="p-2 text-gray-500 transition-colors hover:text-white rounded-lg hover:bg-white/5"><X size={20} /></button>
            </div>
            
            <div className="flex-1 p-5 overflow-y-auto space-y-6">
              {selectedNode.type === "text-message" && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400">Custom Text</label>
                  <textarea value={selectedNode.config?.text_input || ""} onChange={(e) => handleConfigChange(selectedNode.id, "text_input", e.target.value)} rows={6} className="w-full p-3 bg-[#2A2A2D] border border-stroke rounded-xl text-sm outline-none focus:border-primary/50 transition-colors resize-none" />
                </div>
              )}
              {selectedNode.type === "openai" && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400">System Prompt</label>
                  <textarea value={selectedNode.config?.prompt || ""} onChange={(e) => handleConfigChange(selectedNode.id, "prompt", e.target.value)} rows={8} className="w-full p-3 bg-[#2A2A2D] border border-stroke rounded-xl text-sm font-mono outline-none focus:border-primary/50 transition-colors resize-none" />
                </div>
              )}
              {selectedNode.type === "scheduler" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-400">Minutes Before</label>
                    <div className="flex items-center gap-3">
                      <input type="number" min="0" max="60" value={selectedNode.config?.minutes_before || 5} onChange={(e) => handleConfigChange(selectedNode.id, "minutes_before", e.target.value)} className="flex-1 p-3 bg-[#2A2A2D] border border-stroke rounded-xl text-sm outline-none focus:border-primary/50" />
                      <span className="text-xs text-gray-500">min</span>
                    </div>
                  </div>
                </div>
              )}
              {selectedNode.type === "crypto-tracker" && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400">Select Asset</label>
                  <select value={selectedNode.config?.coin_id || "bitcoin"} onChange={(e) => handleConfigChange(selectedNode.id, "coin_id", e.target.value)} className="w-full p-3 bg-[#2A2A2D] border border-stroke rounded-xl text-sm outline-none focus:border-primary/50">
                    <option value="bitcoin">Bitcoin (BTC)</option>
                    <option value="ethereum">Ethereum (ETH)</option>
                    <option value="solana">Solana (SOL)</option>
                  </select>
                </div>
              )}
              {selectedNode.type === "google-calendar" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-400">Calendar ID (Gmail)</label>
                    <input type="text" placeholder="e.g. yourname@gmail.com" value={selectedNode.config?.calendar_id || "primary"} onChange={(e) => handleConfigChange(selectedNode.id, "calendar_id", e.target.value)} className="w-full p-3 bg-[#2A2A2D] border border-stroke rounded-xl text-sm outline-none focus:border-primary/50" />
                    <p className="text-[10px] text-gray-500 italic">Note: Share your calendar with service account email first.</p>
                  </div>
                </div>
              )}
              {selectedNode.type === "telegram" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-400">Chat ID</label>
                    <input type="text" value={selectedNode.config?.chat_id || ""} onChange={(e) => handleConfigChange(selectedNode.id, "chat_id", e.target.value)} className="w-full p-3 bg-[#2A2A2D] border border-stroke rounded-xl text-sm outline-none focus:border-primary/50" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-stroke bg-brand-dark/30">
              <button onClick={() => deleteNode(selectedNode.id)} className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold text-red-400 transition-all border border-red-500/30 rounded-xl hover:bg-red-500/10 active:scale-95"><Trash2 size={18} /> Delete Node</button>
            </div>
          </div>
        )}

        {/* Node Panel Overlay */}
        {showNodePanel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-[#1C1C1E] border border-stroke rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px]">
              <div className="flex items-center justify-between p-6 border-b border-stroke">
                <div><h3 className="text-xl font-bold text-white">Add Node</h3><p className="text-sm text-gray-500">Select a component to add to your canvas</p></div>
                <button onClick={() => setShowNodePanel(false)} className="p-2 text-gray-500 transition-colors hover:text-white rounded-lg hover:bg-white/5"><X size={24} /></button>
              </div>
              <div className="flex flex-1 overflow-hidden">
                <div className="w-48 border-r border-stroke bg-brand-dark/20 p-2 space-y-1">
                  {Object.keys(nodeCategories).map((cat) => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedCategory === cat ? "bg-primary text-brand-dark shadow-lg shadow-primary/20" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}>{cat}</button>
                  ))}
                </div>
                <div className="flex-1 p-6 overflow-y-auto grid grid-cols-2 gap-4 content-start">
                  {nodeCategories[selectedCategory].map((node) => (
                    <button key={node.id} onClick={() => addNode(node)} className="group flex flex-col items-start p-4 text-left transition-all border bg-[#2A2A2D]/50 border-stroke rounded-2xl hover:border-primary hover:bg-primary/5 active:scale-95">
                      <div className="p-3 mb-3 rounded-xl transition-colors group-hover:bg-primary/20" style={{ backgroundColor: `${node.color}15`, color: node.color }}><NodeIcon iconName={node.icon} size={24} /></div>
                      <div className="font-bold text-white mb-1">{node.label}</div>
                      <div className="text-xs text-gray-500 leading-relaxed">{node.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
