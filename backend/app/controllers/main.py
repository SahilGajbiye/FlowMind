from tasks import run_workflow, app
from celery.result import AsyncResult

# Load the workflow configuration from the file
with open('workflow.json', 'r') as f:
    workflow_config_string = f.read()

print("CLIENT: Queuing the dynamic workflow...")

# 1. Start the orchestrator task
orchestrator_task = run_workflow.delay(workflow_config_string)

# 2. Get the chain_id returned by the orchestrator
print("CLIENT: Waiting for orchestrator to return the chain ID...")
chain_id = orchestrator_task.get(timeout=20)
print(f"CLIENT: Got chain ID: {chain_id}")

# 3. Create a result object for the entire chain
chain_result_object = AsyncResult(id=chain_id, app=app)

# 4. Block and wait for the final result of the chain
print("CLIENT: Waiting for the entire workflow chain to complete...")
final_result = chain_result_object.get(timeout=120) # Increased timeout for model downloads

print("\n" + "="*40)
print("✅ Workflow Complete!")
print("Final Output:")
print(final_result)
print("="*40)

# redis-server 

# celery -A tasks worker --loglevel=info --pool=solo 

#  python main.py
