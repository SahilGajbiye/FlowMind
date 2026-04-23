import os
import shutil
import tempfile
import urllib.parse
import urllib.request
import pypdf
import asyncio
from dotenv import load_dotenv
from dotenv import load_dotenv
import os

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
    '''
    Input from prev node: text_input
    Output to next node: execute()
    '''
    def __init__(self, prev_node=None, next_node=None, node_id=None, text_input=None, **kwargs):
        super().__init__(prev_node, next_node, node_id)
        self.text_input = text_input
    
    def execute(self):
        return self.text_input
    
class DocumentInputNode(Node):
    '''
    Input from prev node: None
    Output to next node: execute()
    '''
    def __init__(self, prev_node=None, next_node=None, node_id=None, fileUrl=None, **kwargs):
        super().__init__(prev_node, next_node, node_id)
        self.document_path = fileUrl
        self.document_file = None
    
    def execute(self):
        print(f"DocumentInputNode: document_path={self.document_path}")
        if not self.document_path:
            return ""
        
        try:
            self.document_file, is_temp = self.fetch_document(self.document_path)
            return self.retrieve_text(self.document_file)
        finally:
            if 'is_temp' in locals() and is_temp and self.document_file and os.path.exists(self.document_file):
                try:
                    os.remove(self.document_file)
                    print(f"Cleaned up downloaded file: {self.document_file}")
                except OSError as e:
                    print(f"Error deleting file {self.document_file}: {e}")
    
    def fetch_document(self, document_path):
        allowed_exts = {".pdf"}
        parsed = urllib.parse.urlparse(document_path)
        if parsed.scheme in ("http", "https"):
            url_ext = os.path.splitext(parsed.path)[1].lower()
            if url_ext not in allowed_exts:
                raise ValueError(f"Unsupported file extension '{url_ext}'. Supported: .pdf")
            try:
                with tempfile.NamedTemporaryFile(prefix="document_", suffix=".pdf", delete=False) as tmp:
                    target_path = tmp.name
                with urllib.request.urlopen(document_path) as resp, open(target_path, "wb") as out_file:
                    out_file.write(resp.read())
            except Exception as e:
                try:
                    if 'target_path' in locals() and os.path.exists(target_path):
                        os.remove(target_path)
                except Exception:
                    pass
                raise RuntimeError(f"Failed to download document from URL: {e}")
            print(f"Document downloaded to: {target_path}")
            return target_path, True
        if not os.path.isabs(document_path):
            raise ValueError("Only absolute paths are accepted.")
        ext = os.path.splitext(document_path)[1].lower()
        if ext not in allowed_exts:
            raise ValueError(f"Unsupported file extension '{ext}'. Supported: .pdf")
        if not os.path.isfile(document_path):
            raise FileNotFoundError(f"File not found: {document_path}")
        print(f"Using local document: {document_path}")
        return document_path, False
    
    def retrieve_text(self, file_path: str) -> str:
        if not os.path.exists(file_path):
            return f"Error: File not found at the specified path: {file_path}"
        print("Extracting text from PDF...")
        text = self.extract_text_from_pdf(file_path)
        print("Text extraction complete.")
        return text
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        if not os.path.exists(pdf_path):
            print(f"Error: PDF file not found at {pdf_path}")
            return ""
        try:
            reader = pypdf.PdfReader(pdf_path)
            return "\n".join(page.extract_text() for page in reader.pages if page.extract_text())
        except Exception as e:
            print(f"An error occurred while reading the PDF: {e}")
            return ""

class WebhookNode(Node):
    '''
    Trigger node that receives data from an external HTTP webhook.
    '''
    def __init__(self, prev_node=None, next_node=None, node_id=None, text_input="", **kwargs):
        super().__init__(prev_node, next_node, node_id)
        # text_input will be populated by execute_node taking the payload string
        self.text_input = text_input
        
    def execute(self):
        print(f"Executing WebhookNode. Returning payload: {self.text_input}")
        return self.text_input

class LLMNode(Node):
    '''
    Input from prev node: text_input
    Output to next node: execute()
    '''
    def __init__(self, prev_node=None, next_node=None, node_id=None, prompt="", text_input="", type=None, api_key=None, **kwargs):
        super().__init__(prev_node, next_node, node_id)
        self.prompt = prompt
        
        effective_model_key = type or 'llama'
        
        # --- THIS DICTIONARY IS CORRECTED ---
        # It now maps frontend types to valid model names available on Groq.
        self.llm_model = {
            'llama': 'llama-3.1-8b-instant',
            'openai': 'llama-3.3-70b-versatile', 
            'gemini': 'llama-3.3-70b-versatile'
        }.get(effective_model_key, 'llama-3.1-8b-instant')
        
        self.api_key = api_key or os.environ.get("GROQ_API_KEY")
        self.text_input = text_input

    def execute(self):
        llm = self._get_llm()
        final_prompt = self._build_prompt()
        return self._generate_output(llm, final_prompt)

    def _get_llm(self):
        from langchain_groq import ChatGroq
        return ChatGroq(model_name=self.llm_model, api_key=self.api_key)

    def _build_prompt(self):
        return f"{self.prompt}\n\nCONTEXT:\n{self.text_input}"

    def _generate_output(self, llm, prompt):
        from langchain_core.messages import HumanMessage
        response = llm.invoke([HumanMessage(content=prompt)])
        return getattr(response, "content", str(response))
    
class VectorDBNode(Node):
    '''
    Input from prev node: text_data
    Output to next node: execute()
    '''
    def __init__(self, prev_node=None, next_node=None, node_id=None, text_data=None, query=None, type=None, api_key=None, **kwargs):
        super().__init__(prev_node, next_node, node_id)
        self.text_data = text_data
        self.db_selected = type
        self.query = query
        self.pine_api_key = api_key or os.environ.get("PINECONE_API_KEY")
    
    def execute(self):
        # ... (rest of the class is unchanged)
        from langchain.text_splitter import RecursiveCharacterTextSplitter
        if not self.text_data or not self.text_data.strip():
            print("WORKER: No text data received by VectorDBNode. Skipping.")
            return "No text content was found in the source document to query."
        
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100, length_function=len)
        chunks = text_splitter.split_text(self.text_data)
        
        if not chunks:
            print("WORKER: Text splitting resulted in zero chunks. Skipping.")
            return "Text content was too short to be processed by the vector database."

        texts = chunks
        metadatas = [{"chunk_id": i} for i in range(len(chunks))]
        
        if self.db_selected == 'faiss':
            return self.faiss_db(texts, metadatas)
        elif self.db_selected == 'pinecone':
            return self.pinecone_db(texts, metadatas)
    
    def faiss_db(self, texts, metadatas):
        # ... (rest of the class is unchanged)
        from langchain_community.vectorstores import FAISS
        from langchain_community.embeddings import HuggingFaceEmbeddings
        import tempfile
        import os
        
        embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        vectorstore = FAISS.from_texts(texts, embedding_model, metadatas=metadatas)
        
        with tempfile.TemporaryDirectory() as temp_dir:
            faiss_index_path = os.path.join(temp_dir, "faiss_index")
            vectorstore.save_local(faiss_index_path)
            vectorstore = FAISS.load_local(faiss_index_path, embedding_model, allow_dangerous_deserialization=True)
            retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 3})
            docs_found = retriever.invoke(self.query)
            matched_texts = [doc.page_content for doc in docs_found]
            return "\n\n---\n\n".join(matched_texts)
    
    def pinecone_db(self, texts, metadatas):
        # ... (rest of the class is unchanged)
        from pinecone import Pinecone, ServerlessSpec
        from langchain_pinecone import Pinecone as LangchainPinecone
        from langchain_community.embeddings import HuggingFaceEmbeddings

        self.pine_api_key = os.environ.get('PINECONE_API_KEY')
        pc = Pinecone(api_key=self.pine_api_key)
        index_name = "langchain-rag-index"

        if index_name in pc.list_indexes().names():
            pc.delete_index(index_name)
        
        pc.create_index(
            name=index_name,
            dimension=384, 
            metric="cosine",
            spec=ServerlessSpec(cloud='aws', region='us-east-1')
        )
        
        embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        LangchainPinecone.from_texts(texts=texts, embedding=embedding_model, index_name=index_name, metadatas=metadatas)
        vectorstore = LangchainPinecone.from_existing_index(index_name, embedding_model)
        docs_found = vectorstore.similarity_search(self.query, k=3)
        matched_texts = [doc.page_content for doc in docs_found]
        return "\n\n---\n\n".join(matched_texts)
    
class EmailNode(Node):
    # ... (class is unchanged)
    def __init__(self, prev_node=None, next_node=None, node_id=None, text_input="", 
                rec_email_id=None, subject="Workflow Result", sender_gmail=None, 
                 mail_password=None, mail_port=587, mail_use_tls=True, **kwargs):
        super().__init__(prev_node, next_node, node_id)
        self.rec_email_id = rec_email_id
        self.subject = subject
        self.mail_port = mail_port
        self.mail_use_tls = mail_use_tls
        self.mail_content = text_input
        self.sender_gmail = sender_gmail or os.environ.get("SENDER_GMAIL")
        self.mail_password = mail_password or os.environ.get("MAIL_PASSWORD")
    def execute(self):
        from flask import Flask
        from flask_mail import Mail, Message
        print(f"WORKER: Preparing to send email to {self.rec_email_id}")
        if not all([self.rec_email_id, self.sender_gmail, self.mail_password]):
            raise ValueError("Recipient email, sender email, and mail password are required.")
        app = Flask(__name__)
        app.config['MAIL_SERVER'] = 'smtp.gmail.com'
        app.config['MAIL_PORT'] = self.mail_port
        app.config['MAIL_USE_TLS'] = self.mail_use_tls
        app.config['MAIL_USERNAME'] = self.sender_gmail
        app.config['MAIL_PASSWORD'] = self.mail_password
        app.config['MAIL_DEFAULT_SENDER'] = self.sender_gmail
        mail = Mail(app)
        
        recipients_list = [email.strip() for email in str(self.rec_email_id).split(',') if email.strip()]
        
        with app.app_context():
            msg = Message(subject=self.subject,
                            recipients=recipients_list,
                            body=self.mail_content)
            mail.send(msg)
        success_message = f"Email with subject '{self.subject}' sent successfully to {', '.join(recipients_list)}."
        print(f"WORKER: {success_message}")
        return success_message
    
class TelegramNode(Node):
    # ... (class is unchanged)
    def __init__(self, prev_node=None, next_node=None, node_id=None, text_input="",
                 chat_id=None, bot_token=None, **kwargs):
        super().__init__(prev_node, next_node, node_id)
        self.chat_id = chat_id 
        self.message_content = text_input
        self.bot_token = bot_token or os.environ.get("TELEGRAM_BOT_TOKEN")
    async def _send_message_async(self):
        from telegram import Bot
        if not all([self.chat_id, self.bot_token]):
            raise ValueError("Telegram chat_id and bot_token are required.")
        bot = Bot(token=self.bot_token)
        chat_ids = [cid.strip() for cid in str(self.chat_id).split(',') if cid.strip()]
        for cid in chat_ids:
            try:
                await bot.send_message(chat_id=cid, text=self.message_content)
                print(f"WORKER: Telegram message sent successfully to {cid}.")
            except Exception as e:
                print(f"WORKER: Failed to send Telegram message to {cid}: {e}")
    def execute(self):
        print(f"WORKER: Preparing to send Telegram message to {self.chat_id}")
        asyncio.run(self._send_message_async())
        success_message = f"Telegram message process completed for IDs: {self.chat_id}."
        print(f"WORKER: {success_message}")
        return success_message

class SlackNode(Node):
    # ... (class is unchanged)
    def __init__(self, prev_node=None, next_node=None, node_id=None, text_input="",
                 channel_id=None, bot_token=None, **kwargs):
        super().__init__(prev_node, next_node, node_id)
        self.channel_id = channel_id
        self.message_content = text_input
        self.bot_token = bot_token or os.environ.get("SLACK_BOT_TOKEN")
    def execute(self):
        from slack_sdk import WebClient
        from slack_sdk.errors import SlackApiError
        print(f"WORKER: Preparing to send Slack message to channel {self.channel_id}")
        if not all([self.bot_token, self.channel_id]):
            raise ValueError("Slack Bot Token and Channel ID are required.")
        client = WebClient(token=self.bot_token)
        try:
            client.chat_postMessage(
                channel=self.channel_id,
                text=self.message_content
            )
            success_message = f"Message sent successfully to Slack channel {self.channel_id}."
            print(f"WORKER: {success_message}")
            return success_message
        except SlackApiError as e:
            error_details = e.response["error"]
            print(f"WORKER: Error sending Slack message: {error_details}")
            raise RuntimeError(f"Failed to send Slack message: {error_details}")


class HTTPRequestNode(Node):
    '''
    Makes an HTTP request (GET/POST/PUT/DELETE) to any URL.
    Input from prev node: text_input (used as request body if POST/PUT)
    Output to next node: response body as string
    Config fields: url, method, headers (JSON string), body
    '''
    def __init__(self, prev_node=None, next_node=None, node_id=None,
                 text_input="", url=None, method="GET", headers=None, body=None, **kwargs):
        super().__init__(prev_node, next_node, node_id)
        self.url = url
        self.method = (method or "GET").upper()
        self.body = body or text_input or ""
        # headers stored as JSON string in config
        self.headers_raw = headers or "{}"

    def execute(self):
        import requests
        import json

        if not self.url:
            raise ValueError("HTTPRequestNode: URL is required.")

        try:
            headers = json.loads(self.headers_raw) if self.headers_raw else {}
        except Exception:
            headers = {}

        print(f"WORKER: HTTPRequestNode → {self.method} {self.url}")

        try:
            if self.method in ("POST", "PUT", "PATCH"):
                # Try to send as JSON if body is valid JSON, else as plain text
                try:
                    json_body = json.loads(self.body)
                    resp = requests.request(self.method, self.url, json=json_body, headers=headers, timeout=15)
                except (json.JSONDecodeError, TypeError):
                    resp = requests.request(self.method, self.url, data=self.body, headers=headers, timeout=15)
            else:
                resp = requests.request(self.method, self.url, headers=headers, timeout=15)

            resp.raise_for_status()
            result = resp.text[:2000]  # cap output
            print(f"WORKER: HTTPRequestNode → Status {resp.status_code}, Response: {result[:200]}")
            return result
        except requests.exceptions.RequestException as e:
            raise RuntimeError(f"HTTP request failed: {str(e)}")


class ConditionNode(Node):
    '''
    Evaluates a condition on the incoming text.
    If condition is True  → passes the input forward unchanged.
    If condition is False → raises StopIteration (halts chain gracefully).
    Config fields:
      - condition_type: "contains" | "not_contains" | "equals" | "starts_with" | "ends_with" | "length_gt" | "length_lt"
      - condition_value: the value to compare against
    Input from prev node: text_input
    Output to next node: same text_input (if condition passes)
    '''
    def __init__(self, prev_node=None, next_node=None, node_id=None,
                 text_input="", condition_type="contains", condition_value="", **kwargs):
        super().__init__(prev_node, next_node, node_id)
        self.text_input = str(text_input or "")
        self.condition_type = condition_type or "contains"
        self.condition_value = str(condition_value or "")

    def evaluate(self):
        text = self.text_input
        val = self.condition_value
        ctype = self.condition_type

        if ctype == "contains":
            return val.lower() in text.lower()
        elif ctype == "not_contains":
            return val.lower() not in text.lower()
        elif ctype == "equals":
            return text.strip().lower() == val.strip().lower()
        elif ctype == "starts_with":
            return text.lower().startswith(val.lower())
        elif ctype == "ends_with":
            return text.lower().endswith(val.lower())
        elif ctype == "length_gt":
            try:
                return len(text) > int(val)
            except ValueError:
                return False
        elif ctype == "length_lt":
            try:
                return len(text) < int(val)
            except ValueError:
                return False
        return True

    def execute(self):
        result = self.evaluate()
        print(f"WORKER: ConditionNode → type='{self.condition_type}', value='{self.condition_value}', input='{self.text_input[:80]}' → {result}")
        if result:
            return self.text_input
        else:
            # Return a sentinel to signal downstream nodes to skip
            raise RuntimeError(f"ConditionNode: Condition '{self.condition_type} {self.condition_value}' was FALSE. Workflow branch stopped.")


class ScheduleTriggerNode(Node):
    '''
    Webhook trigger node — receives incoming HTTP payload (set up externally).
    In this local context, acts as a pass-through returning stored webhook data.
    '''
    def __init__(self, prev_node=None, next_node=None, node_id=None,
                 text_input="", webhook_url=None, **kwargs):
        super().__init__(prev_node, next_node, node_id)
        self.payload = text_input or ""
        self.webhook_url = webhook_url or ""

    def execute(self):
        print(f"WORKER: ScheduleTriggerNode → passing through payload: {self.payload[:200]}")
        return self.payload if self.payload else None
