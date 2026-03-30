# Modal Common Examples

## LLM Inference Service (vLLM)

```python
import modal

app = modal.App("vllm-service")

image = (
    modal.Image.debian_slim(python_version="3.11")
    .uv_pip_install("vllm>=0.6.0")
)

@app.cls(gpu="H100", image=image, min_containers=1)
class LLMService:
    @modal.enter()
    def load(self):
        from vllm import LLM
        self.llm = LLM(model="meta-llama/Llama-3-70B-Instruct")

    @modal.method()
    def generate(self, prompt: str, max_tokens: int = 512) -> str:
        from vllm import SamplingParams
        params = SamplingParams(max_tokens=max_tokens, temperature=0.7)
        outputs = self.llm.generate([prompt], params)
        return outputs[0].outputs[0].text

    @modal.fastapi_endpoint(method="POST")
    def api(self, request: dict):
        text = self.generate(request["prompt"], request.get("max_tokens", 512))
        return {"text": text}
```

## Image Generation (Flux)

```python
import modal

app = modal.App("image-gen")

image = (
    modal.Image.debian_slim(python_version="3.11")
    .uv_pip_install("diffusers", "torch", "transformers", "accelerate")
)

vol = modal.Volume.from_name("flux-weights", create_if_missing=True)

@app.cls(gpu="L40S", image=image, volumes={"/models": vol})
class ImageGenerator:
    @modal.enter()
    def load(self):
        import torch
        from diffusers import FluxPipeline
        self.pipe = FluxPipeline.from_pretrained(
            "black-forest-labs/FLUX.1-schnell",
            torch_dtype=torch.bfloat16,
            cache_dir="/models",
        ).to("cuda")

    @modal.method()
    def generate(self, prompt: str) -> bytes:
        image = self.pipe(prompt, num_inference_steps=4, guidance_scale=0.0).images[0]
        import io
        buf = io.BytesIO()
        image.save(buf, format="PNG")
        return buf.getvalue()
```

## Speech Transcription (Whisper)

```python
import modal

app = modal.App("transcription")

image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("ffmpeg")
    .uv_pip_install("openai-whisper", "torch")
)

@app.cls(gpu="T4", image=image)
class Transcriber:
    @modal.enter()
    def load(self):
        import whisper
        self.model = whisper.load_model("large-v3")

    @modal.method()
    def transcribe(self, audio_path: str) -> dict:
        return self.model.transcribe(audio_path)
```

## Batch Data Processing

```python
import modal

app = modal.App("batch-processor")

image = modal.Image.debian_slim().uv_pip_install("pandas", "pyarrow")
vol = modal.Volume.from_name("batch-data", create_if_missing=True)

@app.function(image=image, volumes={"/data": vol}, cpu=4.0, memory=8192)
def process_chunk(chunk_id: int) -> dict:
    import pandas as pd
    df = pd.read_parquet(f"/data/input/chunk_{chunk_id:04d}.parquet")
    result = df.groupby("category").agg({"value": ["sum", "mean", "count"]})
    result.to_parquet(f"/data/output/result_{chunk_id:04d}.parquet")
    return {"chunk_id": chunk_id, "rows": len(df)}

@app.local_entrypoint()
def main():
    chunk_ids = list(range(500))
    results = list(process_chunk.map(chunk_ids))
    total = sum(r["rows"] for r in results)
    print(f"Processed {total} total rows across {len(results)} chunks")
```

## Web Scraping at Scale

```python
import modal

app = modal.App("scraper")

image = modal.Image.debian_slim().uv_pip_install("httpx", "beautifulsoup4")

@app.function(image=image, retries=3, timeout=60)
def scrape_url(url: str) -> dict:
    import httpx
    from bs4 import BeautifulSoup
    response = httpx.get(url, follow_redirects=True, timeout=30)
    soup = BeautifulSoup(response.text, "html.parser")
    return {
        "url": url,
        "title": soup.title.string if soup.title else None,
        "text": soup.get_text()[:5000],
    }

@app.local_entrypoint()
def main():
    urls = ["https://example.com", "https://example.org"]  # Your URL list
    results = list(scrape_url.map(urls))
    for r in results:
        print(f"{r['url']}: {r['title']}")
```

## Protein Structure Prediction

```python
import modal

app = modal.App("protein-folding")

image = (
    modal.Image.debian_slim(python_version="3.11")
    .uv_pip_install("chai-lab")
)

vol = modal.Volume.from_name("protein-data", create_if_missing=True)

@app.function(gpu="A100-80GB", image=image, volumes={"/data": vol}, timeout=3600)
def fold_protein(sequence: str) -> str:
    from chai_lab.chai1 import run_inference
    output = run_inference(
        fasta_file=write_fasta(sequence, "/data/input.fasta"),
        output_dir="/data/output/",
    )
    return str(output)
```

## Scheduled ETL Pipeline

```python
import modal

app = modal.App("etl")

image = modal.Image.debian_slim().uv_pip_install("pandas", "sqlalchemy", "psycopg2-binary")

@app.function(
    image=image,
    schedule=modal.Cron("0 3 * * *"),  # 3 AM UTC daily
    secrets=[modal.Secret.from_name("database-creds")],
    timeout=7200,
)
def daily_etl():
    import os
    import pandas as pd
    from sqlalchemy import create_engine

    source = create_engine(os.environ["SOURCE_DB"])
    dest = create_engine(os.environ["DEST_DB"])

    df = pd.read_sql("SELECT * FROM events WHERE date = CURRENT_DATE - 1", source)
    df = transform(df)
    df.to_sql("daily_summary", dest, if_exists="append", index=False)
    print(f"Loaded {len(df)} rows")
```

## FastAPI with GPU Model

```python
import modal

app = modal.App("api-with-gpu")

image = (
    modal.Image.debian_slim(python_version="3.11")
    .uv_pip_install("fastapi", "sentence-transformers", "torch")
)

@app.cls(gpu="L40S", image=image, min_containers=1)
class EmbeddingService:
    @modal.enter()
    def load(self):
        from sentence_transformers import SentenceTransformer
        self.model = SentenceTransformer("all-MiniLM-L6-v2", device="cuda")

    @modal.asgi_app()
    def serve(self):
        from fastapi import FastAPI
        api = FastAPI()

        @api.post("/embed")
        async def embed(request: dict):
            embeddings = self.model.encode(request["texts"])
            return {"embeddings": embeddings.tolist()}

        @api.get("/health")
        async def health():
            return {"status": "ok"}

        return api
```

## Document OCR Job Queue

```python
import modal

app = modal.App("ocr-queue")

image = modal.Image.debian_slim().uv_pip_install("pytesseract", "Pillow").apt_install("tesseract-ocr")
vol = modal.Volume.from_name("ocr-data", create_if_missing=True)

@app.function(image=image, volumes={"/data": vol})
def ocr_page(image_path: str) -> str:
    import pytesseract
    from PIL import Image
    img = Image.open(image_path)
    return pytesseract.image_to_string(img)

@app.function(volumes={"/data": vol})
def process_document(doc_id: str):
    import os
    pages = sorted(os.listdir(f"/data/docs/{doc_id}/"))
    paths = [f"/data/docs/{doc_id}/{p}" for p in pages]
    texts = list(ocr_page.map(paths))
    full_text = "\n\n".join(texts)
    with open(f"/data/results/{doc_id}.txt", "w") as f:
        f.write(full_text)
    return {"doc_id": doc_id, "pages": len(texts)}
```
