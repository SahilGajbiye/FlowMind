import React, { useState, useRef, useCallback, useEffect } from "react";
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
} from "lucide-react";
import html2canvas from "html2canvas";

const API_BASE = "http://localhost:5000/api";
import { useAuth } from "../context/AuthContext";

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const nodeCategories = {
  Trigger: [
    {
      id: "file-upload",
      type: "DocumentInputNode",
      label: "File Upload",
      icon: "📁",
      color: "#95E1D3",
      description: "Upload file trigger",
    },
    {
      id: "text-message",
      type: "TextInputNode",
      label: "Text input",
      icon: "💬",
      color: "#95E1D3",
      description: "Input custom text",
    },
    {
      id: "schedule",
      type: "ScheduleTriggerNode",
      label: "Schedule",
      icon: "⏰",
      color: "#8B5CF6",
      description: "Run on a schedule (cron)",
    },
  ],
  "LLM Connectors": [
    {
      id: "openai",
      type: "LLMNode",
      label: "OpenAI",
      icon: "🤖",
      color: "#10a37f",
      description: "GPT-4, GPT-3.5 models",
    },
    {
      id: "llama",
      type: "LLMNode",
      label: "llama",
      icon: "🦙",
      color: "#10a37f",
      description: "llama models",
    },
    {
      id: "gemini",
      type: "LLMNode",
      label: "Kimi k2",
      icon: "✨",
      color: "#4285f4",
      description: "Gemini Pro models",
    },
  ],
  // "Document Processing": [
  //   {
  //     id: "pdf-parser",
  //     label: "PDF Parser",
  //     icon: "📄",
  //     color: "#E74C3C",
  //     description: "Extract text from PDF",
  //   },
  // ],
  "Vector & RAG": [
    {
      id: "faiss",
      type: "VectorDBNode",
      label: "FAISS",
      icon: "🧬",
      color: "#1ABC9C",
      description: "Vector database",
    },
    {
      id: "pinecone",
      type: "VectorDBNode",
      label: "Pinecone",
      icon: "🌲",
      color: "#00D4AA",
      description: "Vector database",
    },
  ],
  "Output & Actions": [
    {
      id: "gmail",
      label: "Gmail",
      type: "EmailNode",
      icon: "📧",
      color: "#EA4335",
      description: "EmailNode",
    },
    {
      id: "slack",
      label: "Slack",
      icon: "💬",
      color: "#4A154B",
      description: "Send messages",
    },
    {
      id: "telegram",
      type: "TelegramNode",
      label: "Telegram",
      icon: "🌍",
      color: "#F97316",
      description: "Send message via Telegram",
    },
    {
      id: "http-request",
      type: "HTTPRequestNode",
      label: "HTTP Request",
      icon: "🌐",
      color: "#6366F1",
      description: "Call any external API",
    },
  ],
  "Logic & Flow": [
    {
      id: "condition",
      type: "ConditionNode",
      label: "Condition",
      icon: "🔀",
      color: "#F59E0B",
      description: "If/Else branching logic",
    },
  ],
};


export default function TestPage() {
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

  // Add this function to test workflow loading
  // const testWorkflowLoading = async () => {
  //   try {
  //     // First, fetch all workflows to see what's available
  //     const response = await fetch(`${API_BASE}/workflows`);
  //     const workflows = await response.json();

  //     console.log("📋 Available workflows:", workflows);

  //     if (workflows.length === 0) {
  //       notify("No workflows found in database. Create one first.", "error");
  //       return;
  //     }

  //     // Load the first workflow for testing
  //     const firstWorkflow = workflows[0];
  //     await loadWorkflow(firstWorkflow.id);
  //   } catch (error) {
  //     console.error("Test failed:", error);
  //     notify("Test failed: " + error.message, "error");
  //   }
  // };

  useEffect(() => {
    const url = window.location.href;
    const lastPart = url.split("/").pop().split("?")[0];

    // Check for template query param
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

  // const fetchWorkflows = async () => {
  //   try {
  //     const url = window.location.href;
  //     const lastPart = url.split("/").pop();
  //     console.log(lastPart);

  //     const response = await fetch(`${API_BASE}/workflows/${lastPart}`, {
  //       method: "GET",
  //       headers: {
  //         Authorization: `Bearer ${tokens.access}`,
  //       },
  //     });

  //     if (response.status == 404) return;
  //     const data = await response.json();
  //     setSavedWorkflows(data);
  //     console.log("✅ Loaded workflows from backend:", data);
  //   } catch (error) {
  //     console.error("Error fetching workflows:", error);
  //     notify("Failed to fetch workflows", "error");
  //   }
  // };

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

      console.log("📥 Loading workflow:", workflow);

      // Transform the workflow data to match your frontend format
      const transformedNodes = workflow.nodes.map((node) => ({
        ...node,
        // Ensure all required fields are present
        color: node.color || "#ADFF2F",
        icon: node.icon || "⚡",
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

  // Generate thumbnail by drawing workflow nodes on an offscreen canvas
  const generateAndUploadThumbnail = async () => {
    try {
      console.log("📸 Generating thumbnail from node data...");
      console.log("Cloud name:", CLOUDINARY_CLOUD_NAME);
      console.log("Upload preset:", CLOUDINARY_UPLOAD_PRESET);

      if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        console.warn("❌ Cloudinary env vars missing!");
        return null;
      }

      if (nodes.length === 0) return null;

      // Create offscreen canvas
      const offscreen = document.createElement("canvas");
      offscreen.width = 800;
      offscreen.height = 500;
      const ctx = offscreen.getContext("2d");

      // Background
      ctx.fillStyle = "#141414";
      ctx.fillRect(0, 0, 800, 500);

      // Draw dot grid
      ctx.fillStyle = "#2a2a2a";
      for (let x = 20; x < 800; x += 20) {
        for (let y = 20; y < 500; y += 20) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Find bounding box of nodes
      const xs = nodes.map((n) => n.x);
      const ys = nodes.map((n) => n.y);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const maxX = Math.max(...xs) + 200;
      const maxY = Math.max(...ys) + 80;
      const scaleX = 700 / Math.max(maxX - minX, 1);
      const scaleY = 420 / Math.max(maxY - minY, 1);
      const scale = Math.min(scaleX, scaleY, 1);
      const offsetX = 50 + (700 - (maxX - minX) * scale) / 2;
      const offsetY = 40 + (420 - (maxY - minY) * scale) / 2;

      // Draw connections
      ctx.strokeStyle = "#ADFF2F";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.globalAlpha = 0.5;
      connections.forEach((conn) => {
        const from = nodes.find((n) => n.id === conn.from);
        const to = nodes.find((n) => n.id === conn.to);
        if (!from || !to) return;
        const fx = offsetX + (from.x - minX) * scale + 110 * scale;
        const fy = offsetY + (from.y - minY) * scale + 40 * scale;
        const tx = offsetX + (to.x - minX) * scale;
        const ty = offsetY + (to.y - minY) * scale + 40 * scale;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(tx, ty);
        ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      // Draw nodes
      nodes.forEach((node) => {
        const nx = offsetX + (node.x - minX) * scale;
        const ny = offsetY + (node.y - minY) * scale;
        const nw = Math.max(180 * scale, 100);
        const nh = Math.max(70 * scale, 40);
        const r = 10;

        // Node shadow
        ctx.shadowColor = node.color || "#ADFF2F";
        ctx.shadowBlur = 12;

        // Node background
        ctx.fillStyle = "#1C1C1E";
        ctx.beginPath();
        ctx.roundRect(nx, ny, nw, nh, r);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Node color accent bar (left side)
        ctx.fillStyle = node.color || "#ADFF2F";
        ctx.beginPath();
        ctx.roundRect(nx, ny, 4, nh, [r, 0, 0, r]);
        ctx.fill();

        // Border
        ctx.strokeStyle = node.color || "#ADFF2F";
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.roundRect(nx, ny, nw, nh, r);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Icon + label
        const fontSize = Math.max(12 * scale, 9);
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillText(
          `${node.icon || "⚡"} ${node.label || node.type}`,
          nx + 12,
          ny + nh / 2 + fontSize / 3
        );
      });

      // Convert to blob and upload
      return new Promise((resolve) => {
        offscreen.toBlob(async (blob) => {
          if (!blob) { resolve(null); return; }
          console.log("✅ Canvas blob created:", blob.size, "bytes");

          const formData = new FormData();
          formData.append("file", blob, "thumbnail.png");
          formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
          formData.append("folder", "flowmind-thumbnails");

          try {
            console.log("⬆️ Uploading to Cloudinary...");
            const res = await fetch(
              `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
              { method: "POST", body: formData }
            );
            const data = await res.json();
            console.log("☁️ Cloudinary response:", data);
            if (data.error) {
              console.warn("❌ Cloudinary error:", data.error.message);
              // Fallback: use data URL directly
              resolve(offscreen.toDataURL("image/png", 0.7));
            } else {
              console.log("✅ Uploaded! URL:", data.secure_url);
              resolve(data.secure_url);
            }
          } catch (err) {
            console.warn("❌ Upload failed, using dataURL fallback:", err);
            resolve(offscreen.toDataURL("image/png", 0.7));
          }
        }, "image/png", 0.85);
      });
    } catch (err) {
      console.warn("❌ Thumbnail generation failed:", err);
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

      // Generate and upload thumbnail
      const thumbnailUrl = await generateAndUploadThumbnail();
      console.log("🖼️ Final thumbnail URL:", thumbnailUrl);

      const workflowData = {
        id: lastPart,
        name: workflowName,
        nodes,
        connections,
        ...(thumbnailUrl && { thumbnail_url: thumbnailUrl }),
      };
      const url = `${API_BASE}/workflows`;
      const method = "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.access}`,
        },
        body: JSON.stringify(workflowData),
      });

      if (!response.ok) throw new Error("Failed to save");
      const savedWorkflow = await response.json();

      setCurrentWorkflowId(savedWorkflow.id);
      notify("Workflow saved successfully!");
      // fetchWorkflows();
    } catch (error) {
      console.error("Error saving workflow:", error);
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
    setExecutionResults(null);

    // ✅ Feature 7: Mark all nodes as "running" immediately
    setNodes((prev) => prev.map((n) => ({ ...n, status: "running" })));

    try {
      const workflowPayload = {
        id: workflowIdToRun,
        name: workflowName,
        nodes: nodes,
        connections: connections,
      };
      const response = await fetch(
        `${API_BASE}/workflows/${workflowIdToRun}/execute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokens.access}`,
          },
          body: JSON.stringify(workflowPayload),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Execution failed to start");
      }

      const data = await response.json();
      setExecutionId(data.executionId);
      notify("Workflow execution started...");

      // ✅ Simulate node completion: mark nodes "success" one by one
      const delay = (ms) => new Promise((res) => setTimeout(res, ms));
      for (let i = 0; i < nodes.length; i++) {
        await delay(2000 + i * 1500);
        const nodeId = nodes[i].id;
        setNodes((prev) =>
          prev.map((n) => n.id === nodeId ? { ...n, status: "success" } : n)
        );
      }
      setIsExecuting(false);

    } catch (error) {
      console.error("Error executing workflow:", error);
      notify(error.message || "Failed to execute workflow", "error");
      // Mark all nodes as error
      setNodes((prev) => prev.map((n) => ({ ...n, status: "error" })));
      setIsExecuting(false);
    }
  };


  // const pollExecutionStatus = (execId) => {
  //   const intervalId = setInterval(async () => {
  //     try {
  //       const response = await fetch(`${API_BASE}/workflows/exec/${execId}`, {
  //         method: "GET",
  //         headers: {
  //           Authorization: `Bearer ${tokens.access}`,
  //         },
  //       });

  //       if (!response.ok) return;
  //       const execution = await response.json();

  //       setNodes((prevNodes) =>
  //         prevNodes.map((node) => {
  //           const result = execution.nodeResults.find(
  //             (r) => r.nodeId === node.id,
  //           );
  //           return result ? { ...node, status: "success" } : node;
  //         }),
  //       );

  //       if (execution.status === "completed" || execution.status === "failed") {
  //         clearInterval(intervalId);
  //         setIsExecuting(false);
  //         setExecutionResults(execution);
  //         if (execution.status === "completed") {
  //           notify("Workflow execution completed!");
  //         } else {
  //           notify(`Execution failed: ${execution.error}`, "error");
  //         }
  //       }
  //     } catch (error) {
  //       clearInterval(intervalId);
  //       setIsExecuting(false);
  //       console.error("Polling error:", error);
  //     }
  //   }, 2000);
  // };

  const exportWorkflow = () => {
    const workflowData = { name: workflowName, nodes, connections };
    const blob = new Blob([JSON.stringify(workflowData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workflowName.replace(/\s+/g, "-").toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notify("Workflow exported");
  };

  const clearCanvas = () => {
    if (
      window.confirm(
        "Are you sure you want to create a new workflow? Unsaved changes will be lost.",
      )
    ) {
      setNodes([]);
      setConnections([]);
      setSelectedNode(null);
      setCurrentWorkflowId(null);
      setWorkflowName("Untitled Workflow");
      setExecutionResults(null);
      notify("Canvas cleared");
    }
  };

  const handleConfigChange = (nodeId, configKey, value) => {
    const newNodes = nodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          config: {
            ...node.config,
            [configKey]: value,
          },
        };
      }
      return node;
    });
    setNodes(newNodes);

    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode((prev) => ({
        ...prev,
        config: {
          ...prev.config,
          [configKey]: value,
        },
      }));
    }
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
      if (draggedNode !== null) {
        const rect = canvasRef.current.getBoundingClientRect();
        setNodes((prev) =>
          prev.map((node) =>
            node.id === draggedNode
              ? {
                  ...node,
                  x: e.clientX - rect.left - dragOffset.x,
                  y: e.clientY - rect.top - dragOffset.y,
                }
              : node,
          ),
        );
      }
    },
    [draggedNode, dragOffset],
  );

  const handleMouseUp = useCallback(() => {
    if (
      connecting !== null &&
      hoveredNode !== null &&
      hoveredNode !== connecting
    ) {
      setConnections((prev) => [
        ...prev,
        { from: connecting, to: hoveredNode },
      ]);
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
    setConnections((prev) =>
      prev.filter((c) => c.from !== nodeId && c.to !== nodeId),
    );
    if (selectedNode?.id === nodeId) setSelectedNode(null);
  };

  const getNodeCenter = (node) => ({
    x: node.x + 110,
    y: node.y + 40,
  });

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden font-sans text-white bg-brand-dark">
      {notification && (
        <div
          className={`fixed top-20 right-6 z-50 rounded-xl p-4 shadow-xl flex items-center gap-3 min-w-80 ${
            notification.type === "error"
              ? "bg-red-500/20 border border-red-500/30"
              : "bg-primary/20 border border-primary/30"
          }`}
        >
          {notification.type === "error" ? (
            <AlertCircle size={20} className="text-red-400" />
          ) : (
            <CheckCircle2 size={20} className="text-primary" />
          )}
          <span
            className={`text-sm font-medium ${
              notification.type === "error" ? "text-red-300" : "text-primary"
            }`}
          >
            {notification.message}
          </span>
        </div>
      )}

      {/* Main Canvas Area - Takes 70% of screen */}
      <div
        className="relative flex-1 overflow-hidden"
        style={{ height: "50vh" }}
      >
        <div
          ref={canvasRef}
          className="relative w-full h-full overflow-auto bg-brand-dark"
          style={{
            backgroundImage: "radial-gradient(#38373A 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          {/* Connections SVG */}
          <svg className="absolute inset-0 z-10 w-full h-full pointer-events-none">
            {connections.map((conn, idx) => {
              const fromNode = nodes.find((n) => n.id === conn.from);
              const toNode = nodes.find((n) => n.id === conn.to);
              if (!fromNode || !toNode) return null;
              const from = getNodeCenter(fromNode);
              const to = getNodeCenter(toNode);
              return (
                <g key={idx}>
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="#ADFF2F"
                    strokeWidth="3"
                    strokeDasharray="5,5"
                    opacity="0.6"
                  />
                  <circle cx={to.x} cy={to.y} r="6" fill="#ADFF2F" />
                </g>
              );
            })}
            {connecting !== null && (
              <line
                x1={getNodeCenter(nodes.find((n) => n.id === connecting)).x}
                y1={getNodeCenter(nodes.find((n) => n.id === connecting)).y}
                x2={mousePos.x}
                y2={mousePos.y}
                stroke="#ADFF2F"
                strokeWidth="3"
                strokeDasharray="5,5"
                opacity="0.4"
              />
            )}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <div
              key={node.id}
              className="absolute z-20"
              style={{ left: node.x, top: node.y }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Input Connector */}
              <div
                className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#1C1C1E] rounded-full cursor-crosshair z-30"
                style={{ backgroundColor: node.color }}
              />

              {/* Node Body */}
              <div
                onMouseDown={(e) => {
                  setDraggedNode(node.id);
                  setDragOffset({
                    x: e.clientX - e.currentTarget.getBoundingClientRect().left,
                    y: e.clientY - e.currentTarget.getBoundingClientRect().top,
                  });
                  setSelectedNode(node);
                }}
                onClick={() => setSelectedNode(node)}
                className="bg-[#1C1C1E] border-2 rounded-xl w-80 p-4 cursor-move transition-all user-select-none"
                style={{
                  borderColor:
                    selectedNode?.id === node.id ? node.color : "#38373A",
                  boxShadow:
                    selectedNode?.id === node.id
                      ? `0 8px 32px ${node.color}40`
                      : "0 4px 16px rgba(0,0,0,0.3)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex items-center justify-center h-12 text-2xl min-w-12 rounded-xl"
                    style={{ backgroundColor: `${node.color}15` }}
                  >
                    {node.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 text-sm font-semibold text-white">
                      {node.label}
                    </div>
                    <div className="text-xs leading-relaxed text-gray-400">
                      {node.description}
                    </div>
                    {node.status && (
                      <div className="flex items-center gap-2 mt-2">
                        {node.status === "success" && (
                          <CheckCircle2 size={14} className="text-primary" />
                        )}
                        {node.status === "running" && (
                          <div className="w-3.5 h-3.5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                        )}
                        {node.status === "error" && (
                          <AlertCircle size={14} className="text-red-400" />
                        )}
                        <span
                          className={`text-xs font-medium ${
                            node.status === "success" ? "text-primary"
                            : node.status === "error" ? "text-red-400"
                            : "text-yellow-400"
                          }`}
                        >
                          {node.status === "success" ? "✓ Completed"
                           : node.status === "error" ? "✗ Failed"
                           : "⟳ Running..."}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Output Connector */}
              <div
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setConnecting(node.id);
                }}
                className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#1C1C1E] rounded-full cursor-crosshair z-30"
                style={{ backgroundColor: node.color }}
              />
            </div>
          ))}

          {/* Empty State */}
          {nodes.length === 0 && !showNodePanel && (
            <div className="absolute inset-0 z-10 flex items-center justify-center text-center">
              <div className="mb-4 text-5xl">🚀</div>
              <div className="mb-2 text-2xl font-semibold text-white">
                Start Building Your Workflow
              </div>
              <div className="text-lg text-gray-400">
                Click the + button in the toolbar to add your first node
              </div>
            </div>
          )}
        </div>

        {/* Node Settings Panel */}
        {selectedNode && (
          <div className="absolute right-0 top-0 h-full w-80 bg-[#1C1C1E] border-l border-stroke flex flex-col shadow-lg z-30">
            {/* Panel Header */}
            <div className="flex items-center justify-between p-5 border-b border-stroke">
              <div>
                <div className="text-lg font-bold text-white">
                  Node Settings
                </div>
                <div className="text-sm text-gray-400 mt-0.5">
                  Configure node parameters
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="bg-[#2A2A2D] border border-stroke rounded-lg p-2 cursor-pointer hover:border-primary/50 transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 p-5 overflow-y-auto">
              {/* Node Info */}
              <div
                className="p-4 mb-6 border rounded-xl"
                style={{
                  backgroundColor: `${selectedNode.color}08`,
                  borderColor: `${selectedNode.color}20`,
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">{selectedNode.icon}</div>
                  <div>
                    <div className="text-base font-semibold text-white">
                      {selectedNode.label}
                    </div>
                    <div className="mt-1 text-xs text-gray-400 break-all">
                      ID: {selectedNode.id}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Configuration Forms */}
              {selectedNode.type === "webhook" && (
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-semibold text-gray-300">
                    Webhook Trigger URL
                  </label>
                  <div className="p-3 bg-[#2A2A2D] border border-stroke rounded-lg text-sm text-gray-300 break-all mb-3 font-mono">
                    {currentWorkflowId 
                      ? `${API_BASE}/workflows/${currentWorkflowId}/webhook` 
                      : "Save workflow first to generate URL"}
                  </div>
                  <p className="text-xs text-gray-500">
                    Send a POST request to this URL with a JSON payload to instantly trigger this workflow.
                  </p>
                </div>
              )}

              {selectedNode.type === "gmail" && (
                <>
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-semibold text-gray-300">
                      From Email
                    </label>
                    <input
                      type="email"
                      placeholder="your-email@gmail.com"
                      value={selectedNode.config.sender_gmail || ""}
                      onChange={(e) =>
                        handleConfigChange(
                          selectedNode.id,
                          "sender_gmail",
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2.5 bg-[#2A2A2D] border border-stroke rounded-lg text-white text-sm outline-none placeholder-gray-500 focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-semibold text-gray-300">
                      Gmail App Password
                    </label>
                    <input
                      type="password"
                      placeholder="Get it from your Gmail account settings"
                      value={selectedNode.config.mail_password || ""}
                      onChange={(e) =>
                        handleConfigChange(
                          selectedNode.id,
                          "mail_password",
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2.5 bg-[#2A2A2D] border border-stroke rounded-lg text-white text-sm outline-none placeholder-gray-500 focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-semibold text-gray-300">
                      To Email
                    </label>
                    <input
                      type="email"
                      placeholder="recipient@example.com"
                      value={selectedNode.config.rec_email_id || ""}
                      onChange={(e) =>
                        handleConfigChange(
                          selectedNode.id,
                          "rec_email_id",
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2.5 bg-[#2A2A2D] border border-stroke rounded-lg text-white text-sm outline-none placeholder-gray-500 focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-semibold text-gray-300">
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="Your email subject"
                      value={selectedNode.config.subject || ""}
                      onChange={(e) =>
                        handleConfigChange(
                          selectedNode.id,
                          "subject",
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2.5 bg-[#2A2A2D] border border-stroke rounded-lg text-white text-sm outline-none placeholder-gray-500 focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-semibold text-gray-300">
                      Body
                    </label>
                    <textarea
                      placeholder="Email content..."
                      value={selectedNode.config.body || ""}
                      onChange={(e) =>
                        handleConfigChange(
                          selectedNode.id,
                          "body",
                          e.target.value,
                        )
                      }
                      rows={5}
                      className="w-full px-3 py-2.5 bg-[#2A2A2D] border border-stroke rounded-lg text-white text-sm outline-none placeholder-gray-500 focus:border-primary/50 transition-colors resize-vertical font-sans"
                    />
                  </div>
                </>
              )}

              {(selectedNode.type === "openai" ||
                selectedNode.type === "anthropic" ||
                selectedNode.type === "gemini" ||
                selectedNode.type === "llama") && (
                <>
                  {/*
                    Model selector temporarily commented out per request.
                    This keeps the Prompt textarea and functionality intact.

                    To re-enable the model dropdown later, uncomment the
                    following block and adjust available options as needed.
                  */}
                  {false && (
                    <div className="mb-4">
                      <label className="block mb-2 text-sm font-semibold text-gray-300">
                        Model
                      </label>
                      <select
                        value={selectedNode.config.type || ""}
                        onChange={(e) =>
                          handleConfigChange(
                            selectedNode.id,
                            "model",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2.5 bg-[#2A2A2D] border border-stroke rounded-lg text-white text-sm outline-none focus:border-primary/50 transition-colors"
                      >
                        {selectedNode.type === "openai" && (
                          <>
                            <option>gpt-4</option>
                            <option>gpt-4-turbo</option>
                            <option>gpt-3.5-turbo</option>
                          </>
                        )}
                        {selectedNode.type === "anthropic" && (
                          <>
                            <option>claude-3-opus</option>
                            <option>claude-3-sonnet</option>
                          </>
                        )}
                        {selectedNode.type === "gemini" && (
                          <>
                            <option>gemini-pro</option>
                            <option>gemini-pro-vision</option>
                          </>
                        )}
                      </select>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-semibold text-gray-300">
                      Prompt
                    </label>
                    <textarea
                      placeholder="Enter your prompt here..."
                      value={selectedNode.config.prompt || ""}
                      onChange={(e) =>
                        handleConfigChange(
                          selectedNode.id,
                          "prompt",
                          e.target.value,
                        )
                      }
                      rows={8}
                      className="w-full px-3 py-2.5 bg-[#2A2A2D] border border-stroke rounded-lg text-white text-sm outline-none placeholder-gray-500 focus:border-primary/50 transition-colors resize-vertical font-mono"
                    />
                  </div>
                </>
              )}

              {(selectedNode.type === "faiss" ||
                selectedNode.type === "pinecone") && (
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-semibold text-gray-300">
                    Query
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your query"
                    value={selectedNode.config.query || ""}
                    onChange={(e) =>
                      handleConfigChange(
                        selectedNode.id,
                        "query",
                        e.target.value,
                      )
                    }
                    className="w-full px-3 py-2.5 bg-[#2A2A2D] border border-stroke rounded-lg text-white text-sm outline-none placeholder-gray-500 focus:border-primary/50 transition-colors"
                  />
                </div>
              )}
              {selectedNode.type === "file-upload" && (
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-semibold text-gray-300">
                    File URL or Local Path
                  </label>
                  <input
                    type="text"
                    placeholder="https://example.com/file.pdf OR C:\Users\Sahil\resume.pdf"
                    value={selectedNode.config.fileUrl || ""}
                    onChange={(e) =>
                      handleConfigChange(
                        selectedNode.id,
                        "fileUrl",
                        e.target.value,
                      )
                    }
                    className="w-full px-3 py-2.5 mb-4 bg-[#2A2A2D] border border-stroke rounded-lg text-white text-sm outline-none placeholder-gray-500 focus:border-primary/50 transition-colors"
                  />
                  
                  <label className="block mb-2 text-sm font-semibold text-gray-300">
                    Or Upload from Device
                  </label>
                  <input 
                    type="file" 
                    accept=".pdf"
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer"
                    onChange={async (e) => {
                      if (!e.target.files[0]) return;
                      const file = e.target.files[0];
                      const formData = new FormData();
                      formData.append("file", file);
                      try {
                        const token = localStorage.getItem("token");
                        const res = await fetch(`${API_BASE}/workflows/upload`, {
                          method: "POST",
                          headers: { "Authorization": `Bearer ${token}` },
                          body: formData
                        });
                        const data = await res.json();
                        if (data.fileUrl) {
                          handleConfigChange(selectedNode.id, "fileUrl", data.fileUrl);
                        } else {
                          alert("Upload failed: " + (data.error || "Unknown error"));
                        }
                      } catch (err) {
                        console.error("Upload failed", err);
                        alert("Upload failed. Is backend running?");
                      }
                    }}
                  />
                  
                  {selectedNode.config.fileUrl && (
                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-xs text-green-400 break-all font-medium">
                        ✅ Selected: {selectedNode.config.fileUrl.split('\\').pop().split('/').pop()}
                      </p>
                    </div>
                  )}
                </div>
              )}
              {selectedNode.type === "text-message" && (
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-semibold text-gray-300">
                    Custom Text
                  </label>
                  <textarea
                    placeholder="Enter your text here..."
                    value={selectedNode.config.text_input || ""}
                    onChange={(e) =>
                      handleConfigChange(
                        selectedNode.id,
                        "text_input",
                        e.target.value,
                      )
                    }
                    rows={8}
                    className="w-full px-3 py-2.5 bg-[#2A2A2D] border border-stroke rounded-lg text-white text-sm outline-none placeholder-gray-500 focus:border-primary/50 transition-colors resize-vertical font-mono"
                  />
                </div>
              )}
              {selectedNode.type === "telegram" && (
                <div className="mb-4 space-y-4">
                  {/* Chat ID */}
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-300">
                      Telegram Chat ID
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Chat ID"
                      value={selectedNode.config.chat_id || ""}
                      onChange={(e) =>
                        handleConfigChange(
                          selectedNode.id,
                          "chat_id",
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2.5 bg-[#2A2A2D] border border-stroke rounded-lg text-white text-sm outline-none placeholder-gray-500 focus:border-primary/50 transition-colors"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-300">
                      Telegram Message
                    </label>
                    <textarea
                      placeholder="Enter message to send..."
                      value={selectedNode.config.text_input || ""}
                      onChange={(e) =>
                        handleConfigChange(
                          selectedNode.id,
                          "text_input",
                          e.target.value,
                        )
                      }
                      rows={4}
                      className="w-full px-3 py-2.5 bg-[#2A2A2D] border border-stroke rounded-lg text-white text-sm outline-none placeholder-gray-500 focus:border-primary/50 transition-colors resize-vertical"
                    />
                  </div>
                </div>
              )}

              {selectedNode.type === "http-request" && (
                <div className="mb-4 space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-300">URL *</label>
                    <input
                      type="url"
                      placeholder="https://api.example.com/endpoint"
                      value={selectedNode.config.url || ""}
                      onChange={(e) => handleConfigChange(selectedNode.id, "url", e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#2A2A2D] border border-stroke rounded-lg text-white text-sm outline-none placeholder-gray-500 focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-300">Method</label>
                    <select
                      value={selectedNode.config.method || "GET"}
                      onChange={(e) => handleConfigChange(selectedNode.id, "method", e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#2A2A2D] border border-stroke rounded-lg text-white text-sm outline-none focus:border-primary/50 transition-colors"
                    >
                      <option>GET</option>
                      <option>POST</option>
                      <option>PUT</option>
                      <option>PATCH</option>
                      <option>DELETE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-300">Headers (JSON)</label>
                    <textarea
                      placeholder={'{"Authorization": "Bearer token", "Content-Type": "application/json"}'}
                      value={selectedNode.config.headers || ""}
                      onChange={(e) => handleConfigChange(selectedNode.id, "headers", e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2.5 bg-[#2A2A2D] border border-stroke rounded-lg text-white text-sm outline-none placeholder-gray-500 focus:border-primary/50 transition-colors resize-vertical font-mono"
                    />
                  </div>
                  {["POST", "PUT", "PATCH"].includes(selectedNode.config.method) && (
                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-300">Body (JSON or text)</label>
                      <textarea
                        placeholder='{"key": "value"}'
                        value={selectedNode.config.body || ""}
                        onChange={(e) => handleConfigChange(selectedNode.id, "body", e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2.5 bg-[#2A2A2D] border border-stroke rounded-lg text-white text-sm outline-none placeholder-gray-500 focus:border-primary/50 transition-colors resize-vertical font-mono"
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-500">💡 Response from this node is passed to the next node as text.</p>
                </div>
              )}

              {selectedNode.type === "condition" && (
                <div className="mb-4 space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-300">Condition Type</label>
                    <select
                      value={selectedNode.config.condition_type || "contains"}
                      onChange={(e) => handleConfigChange(selectedNode.id, "condition_type", e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#2A2A2D] border border-stroke rounded-lg text-white text-sm outline-none focus:border-primary/50 transition-colors"
                    >
                      <option value="contains">Contains</option>
                      <option value="not_contains">Does NOT Contain</option>
                      <option value="equals">Equals</option>
                      <option value="starts_with">Starts With</option>
                      <option value="ends_with">Ends With</option>
                      <option value="length_gt">Length Greater Than</option>
                      <option value="length_lt">Length Less Than</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-300">Value</label>
                    <input
                      type="text"
                      placeholder="e.g. error, success, 100..."
                      value={selectedNode.config.condition_value || ""}
                      onChange={(e) => handleConfigChange(selectedNode.id, "condition_value", e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#2A2A2D] border border-stroke rounded-lg text-white text-sm outline-none placeholder-gray-500 focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs text-yellow-300">
                    🔀 If condition is <strong>TRUE</strong> → passes data forward<br/>
                    If condition is <strong>FALSE</strong> → workflow stops at this node
                  </div>
                </div>
              )}

              {selectedNode.type === "schedule" && (
                <div className="mb-4 space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-300">Cron Expression</label>
                    <input
                      type="text"
                      placeholder="0 8 * * * (every day at 8am)"
                      value={selectedNode.config.cron || ""}
                      onChange={(e) => handleConfigChange(selectedNode.id, "cron", e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#2A2A2D] border border-stroke rounded-lg text-white text-sm outline-none placeholder-gray-500 focus:border-primary/50 transition-colors font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Every hour", value: "0 * * * *" },
                      { label: "Every day 8am", value: "0 8 * * *" },
                      { label: "Every Monday", value: "0 9 * * 1" },
                      { label: "Every 30 min", value: "*/30 * * * *" },
                    ].map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => handleConfigChange(selectedNode.id, "cron", preset.value)}
                        className="px-2 py-1.5 text-xs bg-[#2A2A2D] border border-stroke rounded-lg text-gray-300 hover:border-primary/50 hover:text-white transition-colors text-left"
                      >
                        {preset.label}<br/>
                        <span className="font-mono text-gray-500">{preset.value}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">⚠️ Requires Celery Beat to be running for scheduled execution.</p>
                </div>
              )}

              {/* Delete Button */}
              <div className="pt-6 mt-6 border-t border-stroke">
                <button
                  onClick={() => deleteNode(selectedNode.id)}
                  className="flex items-center justify-center w-full gap-2 py-3 text-sm font-semibold text-red-400 transition-colors border rounded-lg cursor-pointer bg-red-500/20 border-red-500/30 hover:bg-red-500/30"
                >
                  <Trash2 size={16} /> Delete Node
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Toolbar */}
      <div className="h-20 bg-[#1C1C1E] border-t border-stroke flex items-center justify-between px-6 shrink-0 gap-4">
        {/* Left side buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={clearCanvas}
            className="px-4 py-3 bg-[#2A2A2D] text-gray-300 border border-stroke rounded-lg cursor-pointer font-semibold text-sm hover:border-red-500/50 hover:text-red-400 transition-colors flex items-center gap-2"
          >
            <Trash2 size={16} /> Clear
          </button>

          <button
            onClick={exportWorkflow}
            disabled={nodes.length === 0}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg cursor-pointer font-semibold text-sm border transition-all ${
              nodes.length === 0
                ? "bg-gray-600 border-gray-600 cursor-not-allowed opacity-60"
                : "bg-primary text-brand-dark border-primary hover:bg-primary/90"
            }`}
          >
            <Download size={16} /> Export
          </button>
        </div>

        {/* Center — Workflow Name Input + Add Node Button */}
        <div className="flex items-center gap-3 flex-1 justify-center max-w-sm">
          <button
            onClick={() => setShowNodePanel(!showNodePanel)}
            className={`w-10 h-10 shrink-0 rounded-full border-none cursor-pointer flex items-center justify-center shadow-xl transition-all duration-300 ${
              showNodePanel
                ? "bg-red-500 hover:bg-red-600"
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            {showNodePanel ? (
              <X size={20} className="text-white" strokeWidth={2.5} />
            ) : (
              <Plus size={20} className="text-brand-dark" strokeWidth={2.5} />
            )}
          </button>

          {/* Editable Workflow Name */}
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            placeholder="Workflow name..."
            className="flex-1 bg-[#2A2A2D] text-white text-sm font-semibold border border-stroke rounded-lg px-4 py-3 text-center focus:outline-none focus:border-primary/70 focus:bg-[#333336] transition-colors placeholder-gray-500"
          />
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={saveWorkflow}
            disabled={nodes.length === 0}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg cursor-pointer font-semibold text-sm border transition-all ${
              nodes.length === 0
                ? "bg-gray-600 border-gray-600 cursor-not-allowed opacity-60"
                : "bg-primary text-brand-dark border-primary hover:bg-primary/90"
            }`}
          >
            <Save size={16} /> Save
          </button>
          <button
            onClick={executeWorkflow}
            disabled={isExecuting || nodes.length < 2}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg cursor-pointer font-semibold text-sm border transition-all ${
              isExecuting || nodes.length < 2
                ? "bg-gray-600 border-gray-600 cursor-not-allowed opacity-60"
                : "bg-primary text-brand-dark border-primary hover:bg-primary/90"
            }`}
          >
            {isExecuting ? (
              <RefreshCw size={16} className="spinning" />
            ) : (
              <Play size={16} />
            )}
            {isExecuting ? "Executing..." : "Run"}
          </button>
        </div>
      </div>

      {/* Node Panel Modal */}
      {showNodePanel && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50"
          onClick={() => setShowNodePanel(false)}
        >
          <div
            className="bg-[#1C1C1E] border border-stroke rounded-2xl w-[900px] max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Category Tabs */}
            <div className="flex gap-1 px-4 pt-3 overflow-x-auto border-b border-stroke">
              {Object.keys(nodeCategories).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-5 py-3 border-b-2 border-transparent text-sm font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? "text-primary border-primary bg-primary/10"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Node Grid */}
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[calc(80vh-60px)] overflow-y-auto">
              {nodeCategories[selectedCategory]?.map((node) => (
                <button
                  key={node.id}
                  onClick={() => addNode(node)}
                  className="bg-[#2A2A2D] border border-stroke rounded-xl p-4 cursor-pointer text-left flex items-start gap-3 transition-all hover:border-primary/50"
                >
                  <div
                    className="flex items-center justify-center h-12 text-2xl min-w-12 rounded-xl"
                    style={{ backgroundColor: `${node.color}15` }}
                  >
                    {node.icon}
                  </div>
                  <div>
                    <div className="mb-1 text-sm font-semibold text-white">
                      {node.label}
                    </div>
                    <div className="text-xs leading-relaxed text-gray-400">
                      {node.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Workflow List Modal */}
      {showWorkflowList && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50"
          onClick={() => setShowWorkflowList(false)}
        >
          <div
            className="bg-[#1C1C1E] border border-stroke rounded-2xl w-[600px] max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-stroke">
              <h2 className="text-xl font-bold text-white">Saved Workflows</h2>
              <button
                onClick={() => setShowWorkflowList(false)}
                className="bg-[#2A2A2D] border border-stroke rounded-lg p-2 cursor-pointer hover:border-primary/50 transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>
            <div className="p-4 max-h-[calc(80vh-80px)] overflow-y-auto">
              {savedWorkflows.length === 0 ? (
                <div className="py-10 text-center text-gray-500">
                  No saved workflows yet
                </div>
              ) : (
                savedWorkflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    onClick={() => loadWorkflow(workflow.id)}
                    className="p-4 mb-3 bg-[#2A2A2D] border border-stroke rounded-xl cursor-pointer transition-all hover:border-primary/50"
                  >
                    <div className="mb-1 font-semibold text-white">
                      {workflow.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {(workflow.nodes || []).length} nodes •{" "}
                      {(workflow.connections || []).length} connections
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Last updated:{" "}
                      {new Date(workflow.updatedAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinning {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
