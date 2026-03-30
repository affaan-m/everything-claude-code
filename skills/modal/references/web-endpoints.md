# Modal Web Endpoints

## Table of Contents

- [Simple Endpoints](#simple-endpoints)
- [Deployment](#deployment)
- [ASGI Apps](#asgi-apps-fastapi-starlette-fasthtml)
- [WSGI Apps](#wsgi-apps-flask-django)
- [Custom Web Servers](#custom-web-servers)
- [WebSockets](#websockets)
- [Authentication](#authentication)
- [Streaming](#streaming)
- [Concurrency](#concurrency)
- [Limits](#limits)

## Simple Endpoints

The easiest way to create a web endpoint:

```python
import modal

app = modal.App("api-service")

@app.function()
@modal.fastapi_endpoint()
def hello(name: str = "World"):
    return {"message": f"Hello, {name}!"}
```

### POST Endpoints

```python
@app.function()
@modal.fastapi_endpoint(method="POST")
def predict(data: dict):
    result = model.predict(data["text"])
    return {"prediction": result}
```

### Query Parameters

Parameters are automatically parsed from query strings:

```python
@app.function()
@modal.fastapi_endpoint()
def search(query: str, limit: int = 10):
    return {"results": do_search(query, limit)}
```

Access via: `https://your-app.modal.run?query=hello&limit=5`

## Deployment

### Development Mode

```bash
modal serve script.py
```

- Creates a temporary public URL
- Hot-reloads on file changes
- Perfect for development and testing
- URL expires when you stop the command

### Production Deployment

```bash
modal deploy script.py
```

- Creates a permanent URL
- Runs persistently in the cloud
- Autoscales based on traffic
- URL format: `https://<workspace>--<app-name>-<function-name>.modal.run`

## ASGI Apps (FastAPI, Starlette, FastHTML)

For full framework applications, use `@modal.asgi_app`:

```python
from fastapi import FastAPI

web_app = FastAPI()

@web_app.get("/")
async def root():
    return {"status": "ok"}

@web_app.post("/predict")
async def predict(request: dict):
    return {"result": model.run(request["input"])}

@app.function(image=image, gpu="L40S")
@modal.asgi_app()
def fastapi_app():
    return web_app
```

### With Class Lifecycle

```python
@app.cls(gpu="L40S", image=image)
class InferenceService:
    @modal.enter()
    def load_model(self):
        self.model = load_model()

    @modal.asgi_app()
    def serve(self):
        from fastapi import FastAPI
        app = FastAPI()

        @app.post("/generate")
        async def generate(request: dict):
            return self.model.generate(request["prompt"])

        return app
```

## WSGI Apps (Flask, Django)

```python
from flask import Flask

flask_app = Flask(__name__)

@flask_app.route("/")
def index():
    return {"status": "ok"}

@app.function(image=image)
@modal.wsgi_app()
def flask_server():
    return flask_app
```

WSGI is synchronous — concurrent inputs run on separate threads.

## Custom Web Servers

For non-standard web frameworks (aiohttp, Tornado, TGI):

```python
@app.function(image=image, gpu="H100")
@modal.web_server(port=8000)
def serve():
    import subprocess
    subprocess.Popen([
        "python", "-m", "vllm.entrypoints.openai.api_server",
        "--model", "meta-llama/Llama-3-70B",
        "--host", "0.0.0.0",  # Must bind to 0.0.0.0, not localhost
        "--port", "8000",
    ])
```

The application must bind to `0.0.0.0` (not `127.0.0.1`).

## WebSockets

Supported with `@modal.asgi_app`, `@modal.wsgi_app`, and `@modal.web_server`:

```python
from fastapi import FastAPI, WebSocket

web_app = FastAPI()

@web_app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        result = process(data)
        await websocket.send_text(result)

@app.function()
@modal.asgi_app()
def ws_app():
    return web_app
```

- Full WebSocket protocol (RFC 6455)
- Messages up to 2 MiB each
- No RFC 8441 or RFC 7692 support yet

## Authentication

### Proxy Auth Tokens (Built-in)

Modal provides first-class endpoint protection via proxy auth tokens:

```python
@app.function()
@modal.fastapi_endpoint()
def protected(text: str):
    return {"result": process(text)}
```

Clients include `Modal-Key` and `Modal-Secret` headers to authenticate.

### Custom Bearer Tokens

```python
from fastapi import Header, HTTPException

@app.function(secrets=[modal.Secret.from_name("auth-secret")])
@modal.fastapi_endpoint(method="POST")
def secure_predict(data: dict, authorization: str = Header(None)):
    import os
    expected = os.environ["AUTH_TOKEN"]
    if authorization != f"Bearer {expected}":
        raise HTTPException(status_code=401, detail="Unauthorized")
    return {"result": model.predict(data["text"])}
```

### Client IP Access

Available for geolocation, rate limiting, and access control.

## Streaming

### Server-Sent Events (SSE)

```python
from fastapi.responses import StreamingResponse

@app.function(gpu="H100")
@modal.fastapi_endpoint()
def stream_generate(prompt: str):
    def generate():
        for token in model.stream(prompt):
            yield f"data: {token}\n\n"
    return StreamingResponse(generate(), media_type="text/event-stream")
```

## Concurrency

Handle multiple requests per container using `@modal.concurrent`:

```python
@app.function(gpu="L40S")
@modal.concurrent(max_inputs=10)
@modal.fastapi_endpoint(method="POST")
async def batch_predict(data: dict):
    return {"result": await model.predict_async(data["text"])}
```

## Limits

- Request body: up to 4 GiB
- Response body: unlimited
- Rate limit: 200 requests/second (5-second burst for new accounts)
- Cold starts occur when no containers are active (use `min_containers` to avoid)
