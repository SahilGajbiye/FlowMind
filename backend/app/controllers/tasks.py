import json
from celery import Celery, chain

# Import all node classes
from app.controllers.nodes import (
    DocumentInputNode, LLMNode, VectorDBNode,
    TextInputNode, EmailNode, TelegramNode, SlackNode, WebhookNode,
    HTTPRequestNode, ConditionNode, ScheduleTriggerNode
)

# ✅ FIXED: Proper Celery instance (same everywhere)
celery = Celery(
    'app.controllers.tasks',
    broker='redis://localhost:6379/0',
    backend='redis://localhost:6379/0'
)

# --- Node Class Registry ---
NODE_CLASS_REGISTRY = {
    "TextInputNode": TextInputNode,
    "DocumentInputNode": DocumentInputNode,
    "LLMNode": LLMNode,
    "VectorDBNode": VectorDBNode,
    "EmailNode": EmailNode,
    "TelegramNode": TelegramNode,
    "SlackNode": SlackNode,
    "WebhookNode": WebhookNode,
    "HTTPRequestNode": HTTPRequestNode,
    "ConditionNode": ConditionNode,
    "ScheduleTriggerNode": ScheduleTriggerNode,
}

FRONTEND_TYPE_TO_CLASS = {
    "text-message": "TextInputNode",
    "file-upload": "DocumentInputNode",
    "pdf-parser": "DocumentInputNode",
    "openai": "LLMNode",
    "llama": "LLMNode",
    "gemini": "LLMNode",
    "faiss": "VectorDBNode",
    "pinecone": "VectorDBNode",
    "gmail": "EmailNode",
    "slack": "SlackNode",
    "telegram": "TelegramNode",
    "webhook": "WebhookNode",
    "http-request": "HTTPRequestNode",
    "condition": "ConditionNode",
    "schedule": "ScheduleTriggerNode",
}

def _update_user_stats(user_id, success=True):
    """Update user execution counters in DB using direct SQLAlchemy connection."""
    try:
        import os
        from dotenv import load_dotenv
        from sqlalchemy import create_engine, text

        # Load env from backend .env file
        env_path = os.path.join(os.path.dirname(__file__), "../../.env")
        load_dotenv(env_path)

        db_url = os.environ.get("DATABASE_URL")
        if not db_url:
            print("WORKER: DATABASE_URL not found, skipping stats update")
            return

        engine = create_engine(db_url)
        with engine.connect() as conn:
            if success:
                conn.execute(
                    text("UPDATE users SET no_of_success_execution = COALESCE(no_of_success_execution, 0) + 1 WHERE id = :uid"),
                    {"uid": user_id}
                )
            else:
                conn.execute(
                    text("UPDATE users SET no_of_failed_execution = COALESCE(no_of_failed_execution, 0) + 1 WHERE id = :uid"),
                    {"uid": user_id}
                )
            conn.commit()
        print(f"WORKER: ✅ Updated user {user_id} stats — success={success}")
    except Exception as e:
        print(f"WORKER: ❌ Failed to update user stats: {e}")

# --- Execute Single Node ---
@celery.task(name='backend.tasks.execute_node')
def execute_node(previous_output=None, *, node_config, user_id=None):
    node_type = node_config.get("type")
    node_description = node_config.get("description")

    # Try mapping by backend class name safely using FRONTEND_TYPE_TO_CLASS
    class_name = FRONTEND_TYPE_TO_CLASS.get(node_type)
    if not class_name:
        class_name = node_description

    if not class_name or class_name not in NODE_CLASS_REGISTRY:
        print(f"WORKER: Ignoring unknown node '{class_name}' (type was '{node_type}')")
        return previous_output

    NodeClass = NODE_CLASS_REGISTRY[class_name]

    init_kwargs = node_config.get("config", {})
    init_kwargs['type'] = node_config.get('type')

    # ✅ Pass previous output to next node
    if previous_output is not None:
        if 'text_input' in NodeClass.__init__.__code__.co_varnames:
            init_kwargs['text_input'] = previous_output
        elif 'text_data' in NodeClass.__init__.__code__.co_varnames:
            init_kwargs['text_data'] = previous_output

    print(f"WORKER: Executing node '{node_description}'")

    try:
        node_instance = NodeClass(**init_kwargs)
        result = node_instance.execute()
        # ✅ Increment success counter only for output/action nodes
        output_nodes = {"EmailNode", "TelegramNode", "SlackNode"}
        if class_name in output_nodes and user_id:
            _update_user_stats(user_id, success=True)
        return result
    except Exception as e:
        # ✅ Increment failure counter
        output_nodes = {"EmailNode", "TelegramNode", "SlackNode"}
        if class_name in output_nodes and user_id:
            _update_user_stats(user_id, success=False)
        raise


# --- Run Full Workflow ---
@celery.task(name='backend.tasks.run_workflow')
def run_workflow(workflow_data_string, initial_input=None):
    print("ORCHESTRATOR DATA RECEIVED LENGTH:", len(workflow_data_string))
    print("ORCHESTRATOR RAW DATA:", workflow_data_string)
    workflow = json.loads(workflow_data_string)

    nodes = {node["id"]: node for node in workflow.get("nodes", [])}
    connections = workflow.get("connections", [])
    user_id = workflow.get("user_id")  # passed from controller

    # --- Topological Sort ---
    in_degree = {node_id: 0 for node_id in nodes}
    adj = {node_id: [] for node_id in nodes}

    for conn in connections:
        adj[conn["from"]].append(conn["to"])
        in_degree[conn["to"]] += 1

    queue = [node_id for node_id in nodes if in_degree[node_id] == 0]
    sorted_nodes = []

    while queue:
        u = queue.pop(0)
        sorted_nodes.append(nodes[u])

        for v in adj[u]:
            in_degree[v] -= 1
            if in_degree[v] == 0:
                queue.append(v)

    if not sorted_nodes:
        raise ValueError("Workflow has no starting node")

    print(f"ORCHESTRATOR: Execution order -> {[n.get('description', n.get('type')) for n in sorted_nodes]}")

    # --- Build Celery Chain ---
    if initial_input is not None:
        task_chain = [execute_node.s(initial_input, node_config=sorted_nodes[0], user_id=user_id)] + \
                     [execute_node.s(node_config=node, user_id=user_id) for node in sorted_nodes[1:]]
    else:
        task_chain = [execute_node.s(node_config=node, user_id=user_id) for node in sorted_nodes]

    workflow_chain = chain(task_chain)

    print(f"ORCHESTRATOR: Running workflow '{workflow.get('name')}'")

    result = workflow_chain.delay()

    return result.id
