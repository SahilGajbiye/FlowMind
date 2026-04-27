import os
import json

import shutil
import tempfile
import urllib.parse
import urllib.request
import pypdf
import asyncio
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), "../../.env")
load_dotenv(env_path)                           

class Node:
    '''
    Input from prev node: None
    Output to next node: None
    '''
    def __init__(self, prev_node=None, next_node=None, node_id=None):
        self.prev_node = prev_node
        self.next_node = next_node
        self.node_id = node_id

class TextInputNode(Node):
    def __init__(self, prev_node=None, next_node=None, node_id=None, text_input=None, **kwargs):
        super().__init__(prev_node, next_node, node_id)
        self.text_input = text_input
    
    def execute(self):
        return self.text_input
    
class DocumentInputNode(Node):
    def __init__(self, prev_node=None, next_node=None, node_id=None, fileUrl=None, **kwargs):
        super().__init__(prev_node, next_node, node_id)
        self.document_path = fileUrl
        self.document_file = None
    
    def execute(self):
        if not self.document_path:
            return ""
        try:
            self.document_file, is_temp = self.fetch_document(self.document_path)
            return self.retrieve_text(self.document_file)
        finally:
            if 'is_temp' in locals() and is_temp and self.document_file and os.path.exists(self.document_file):
                try:
                    os.remove(self.document_file)
                except OSError:
                    pass
    
    def fetch_document(self, document_path):
        allowed_exts = {".pdf"}
        parsed = urllib.parse.urlparse(document_path)
        if parsed.scheme in ("http", "https"):
            with tempfile.NamedTemporaryFile(prefix="document_", suffix=".pdf", delete=False) as tmp:
                target_path = tmp.name
            urllib.request.urlretrieve(document_path, target_path)
            return target_path, True
        return document_path, False
    
    def retrieve_text(self, file_path: str) -> str:
        reader = pypdf.PdfReader(file_path)
        return "\n".join(page.extract_text() for page in reader.pages if page.extract_text())

class WebhookNode(Node):
    def __init__(self, prev_node=None, next_node=None, node_id=None, text_input="", **kwargs):
        super().__init__(prev_node, next_node, node_id)
        self.text_input = text_input
    def execute(self):
        return self.text_input

class LLMNode(Node):
    def __init__(self, prev_node=None, next_node=None, node_id=None, prompt="", text_input="", type=None, api_key=None, **kwargs):
        super().__init__(prev_node, next_node, node_id)
        self.prompt = prompt
        self.llm_model = {'llama': 'llama-3.1-8b-instant', 'openai': 'llama-3.3-70b-versatile', 'gemini': 'llama-3.3-70b-versatile'}.get(type or 'llama', 'llama-3.1-8b-instant')
        self.api_key = api_key or os.environ.get("GROQ_API_KEY")
        self.text_input = text_input
    def execute(self):
        from langchain_groq import ChatGroq
        from langchain_core.messages import HumanMessage
        llm = ChatGroq(model_name=self.llm_model, api_key=self.api_key)
        response = llm.invoke([HumanMessage(content=f"{self.prompt}\n\nCONTEXT:\n{self.text_input}")])
        return getattr(response, "content", str(response))

class VectorDBNode(Node):
    def __init__(self, prev_node=None, next_node=None, node_id=None, text_data=None, query=None, type=None, api_key=None, **kwargs):
        super().__init__(prev_node, next_node, node_id)
        self.text_data = text_data
        self.db_selected = type
        self.query = query
        self.pine_api_key = api_key or os.environ.get("PINECONE_API_KEY")
    def execute(self):
        from langchain.text_splitter import RecursiveCharacterTextSplitter
        if not self.text_data: return ""
        chunks = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100).split_text(self.text_data)
        if self.db_selected == 'faiss':
            from langchain_community.vectorstores import FAISS
            from langchain_community.embeddings import HuggingFaceEmbeddings
            embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
            vectorstore = FAISS.from_texts(chunks, embedding_model)
            docs = vectorstore.similarity_search(self.query, k=3)
            return "\n\n---\n\n".join([doc.page_content for doc in docs])
        return ""

class EmailNode(Node):
    def __init__(self, prev_node=None, next_node=None, node_id=None, text_input="", rec_email_id=None, subject="Workflow Result", sender_gmail=None, mail_password=None, **kwargs):
        super().__init__(prev_node, next_node, node_id)
        self.rec_email_id = rec_email_id
        self.subject = subject
        self.mail_content = text_input
        self.sender_gmail = sender_gmail or os.environ.get("SENDER_GMAIL")
        self.mail_password = mail_password or os.environ.get("MAIL_PASSWORD")
    def execute(self):
        from flask import Flask
        from flask_mail import Mail, Message
        app = Flask(__name__)
        app.config.update(MAIL_SERVER='smtp.gmail.com', MAIL_PORT=587, MAIL_USE_TLS=True, MAIL_USERNAME=self.sender_gmail, MAIL_PASSWORD=self.mail_password)
        mail = Mail(app)
        with app.app_context():
            msg = Message(subject=self.subject, recipients=[self.rec_email_id], body=self.mail_content)
            mail.send(msg)
        return f"Email sent to {self.rec_email_id}"

class TelegramNode(Node):
    def __init__(self, prev_node=None, next_node=None, node_id=None, text_input="", chat_id=None, bot_token=None, **kwargs):
        super().__init__(prev_node, next_node, node_id)
        self.chat_id = chat_id
        self.message_content = text_input
        self.bot_token = bot_token or os.environ.get("TELEGRAM_BOT_TOKEN")
    def execute(self):
        from telegram import Bot
        bot = Bot(token=self.bot_token)
        asyncio.run(bot.send_message(chat_id=self.chat_id, text=self.message_content))
        return "Telegram message sent"

class SlackNode(Node):
    def __init__(self, prev_node=None, next_node=None, node_id=None, text_input="", channel_id=None, bot_token=None, **kwargs):
        super().__init__(prev_node, next_node, node_id)
        self.channel_id = channel_id
        self.message_content = text_input
        self.bot_token = bot_token or os.environ.get("SLACK_BOT_TOKEN")
    def execute(self):
        from slack_sdk import WebClient
        client = WebClient(token=self.bot_token)
        client.chat_postMessage(channel=self.channel_id, text=self.message_content)
        return "Slack message sent"

class HTTPRequestNode(Node):
    def __init__(self, prev_node=None, next_node=None, node_id=None, text_input="", url=None, method="GET", **kwargs):
        super().__init__(prev_node, next_node, node_id)
        self.url = url
        self.method = method.upper()
        self.body = text_input
    def execute(self):
        import requests
        resp = requests.request(self.method, self.url, data=self.body)
        return resp.text

class ConditionNode(Node):
    def __init__(self, prev_node=None, next_node=None, node_id=None, text_input="", condition_type="contains", condition_value="", **kwargs):
        super().__init__(prev_node, next_node, node_id)
        self.text_input = text_input
        self.condition_type = condition_type
        self.condition_value = condition_value
    def execute(self):
        if self.condition_type == "contains" and self.condition_value in self.text_input: return self.text_input
        raise RuntimeError("Condition failed")

class ScheduleTriggerNode(Node):
    def __init__(self, prev_node=None, next_node=None, node_id=None, text_input="", **kwargs):
        super().__init__(prev_node, next_node, node_id)
        self.payload = text_input
    def execute(self):
        return self.payload

class SchedulerNode(Node):
    def __init__(self, prev_node=None, next_node=None, node_id=None, text_input="", **kwargs):
        super().__init__(prev_node, next_node, node_id)
        self.text_input = text_input
    def execute(self):
        import json, re
        from datetime import datetime, timedelta
        print(f"DEBUG: SchedulerNode input -> {self.text_input}")
        json_match = re.search(r'\[\s*\{.*\}\s*\]', self.text_input, re.DOTALL)
        if json_match:
            try:
                raw_json = json_match.group(0)
                print(f"DEBUG: Found JSON -> {raw_json}")
                schedule = json.loads(raw_json)
                return {"__flowmind_scheduler_meta": True, "schedule": schedule}
            except Exception as e:
                print(f"DEBUG: JSON Error -> {e}")
        else:
            print("DEBUG: No JSON found in input")
        return []

class GoogleCalendarNode(Node):
    def __init__(self, prev_node=None, next_node=None, node_id=None, text_input="", summary="New Event", duration=30, calendar_id="primary", **kwargs):
        super().__init__(prev_node, next_node, node_id)
        self.text_input = text_input
        self.summary = summary
        self.duration = duration
        self.calendar_id = calendar_id
    def execute(self):
        from google.oauth2 import service_account
        from googleapiclient.discovery import build
        from datetime import datetime, timedelta

        SCOPES = ['https://www.googleapis.com/auth/calendar.events']
        
        # Check if credentials.json is a Service Account or OAuth Client
        with open('credentials.json', 'r') as f:
            creds_data = json.load(f)

        if creds_data.get('type') == 'service_account':
            creds = service_account.Credentials.from_service_account_file('credentials.json', scopes=SCOPES)
        else:
            from google_auth_oauthlib.flow import InstalledAppFlow
            from google.auth.transport.requests import Request
            from google.oauth2.credentials import Credentials
            creds = None
            if os.path.exists('token.json'):
                creds = Credentials.from_authorized_user_file('token.json', SCOPES)
            if not creds or not creds.valid:
                if creds and creds.expired and creds.refresh_token:
                    creds.refresh(Request())
                else:
                    flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
                    creds = flow.run_local_server(port=0)
                with open('token.json', 'w') as token:
                    token.write(creds.to_json())

        service = build('calendar', 'v3', credentials=creds)

        # Try to parse AI output if it's JSON
        final_summary = self.summary
        final_start = datetime.now()
        final_duration = int(self.duration)

        if self.text_input.strip().startswith('{') or '```json' in self.text_input:
            try:
                raw_json = self.text_input
                if '```json' in raw_json:
                    raw_json = raw_json.split('```json')[1].split('```')[0].strip()
                data = json.loads(raw_json)
                final_summary = data.get('summary', final_summary)
                final_duration = data.get('duration', final_duration)
                if 'start_time' in data:
                    st = data['start_time']
                    if 'tomorrow' in st.lower():
                        final_start = (datetime.now() + timedelta(days=1)).replace(hour=int(st.split('T')[1].split(':')[0]), minute=0, second=0)
                    else:
                        try:
                            final_start = datetime.fromisoformat(st.replace('Z', ''))
                        except: pass
            except: pass

        end_time = final_start + timedelta(minutes=final_duration)
        
        event = {
          'summary': final_summary,
          'description': f"Created by FlowMind AI\nSource: {self.text_input}",
          'start': {'dateTime': final_start.isoformat(), 'timeZone': 'Asia/Kolkata'},
          'end': {'dateTime': end_time.isoformat(), 'timeZone': 'Asia/Kolkata'},
        }
        event = service.events().insert(calendarId=self.calendar_id, body=event).execute()
        return f"Event created: {event.get('htmlLink')}"

class CryptoTrackerNode(Node):
    def __init__(self, prev_node=None, next_node=None, node_id=None, coin_id="bitcoin", **kwargs):
        super().__init__(prev_node, next_node, node_id)
        self.coin_id = coin_id.lower()
    def execute(self):
        import requests
        url = f"https://api.coingecko.com/api/v3/simple/price?ids={self.coin_id}&vs_currencies=usd"
        resp = requests.get(url).json()
        price = resp.get(self.coin_id, {}).get('usd', 'Unknown')
        return f"Current price of {self.coin_id.capitalize()}: ${price} USD"


