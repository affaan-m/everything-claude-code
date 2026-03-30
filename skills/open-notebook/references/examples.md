# Open Notebook Examples

## Complete Research Workflow

This example demonstrates a full research workflow: creating a notebook, adding sources, generating notes, chatting with the AI, and searching across materials.

```python
import requests
import time

BASE_URL = "http://localhost:5055/api"


def complete_research_workflow():
    """End-to-end research workflow with Open Notebook."""

    # 1. Create a research notebook
    notebook = requests.post(f"{BASE_URL}/notebooks", json={
        "name": "Drug Resistance in Cancer",
        "description": "Review of mechanisms of drug resistance in solid tumors"
    }).json()
    notebook_id = notebook["id"]
    print(f"Created notebook: {notebook_id}")

    # 2. Add sources from URLs
    urls = [
        "https://www.nature.com/articles/s41568-020-0281-y",
        "https://www.cell.com/cancer-cell/fulltext/S1535-6108(20)30211-8",
    ]

    source_ids = []
    for url in urls:
        source = requests.post(f"{BASE_URL}/sources", data={
            "url": url,
            "notebook_id": notebook_id,
            "process_async": "true"
        }).json()
        source_ids.append(source["id"])
        print(f"Added source: {source['id']}")

    # 3. Wait for processing to complete
    for source_id in source_ids:
        while True:
            status = requests.get(
                f"{BASE_URL}/sources/{source_id}/status"
            ).json()
            if status.get("status") in ("completed", "failed"):
                break
            time.sleep(5)
        print(f"Source {source_id}: {status['status']}")

    # 4. Create a chat session and ask questions
    session = requests.post(f"{BASE_URL}/chat/sessions", json={
        "notebook_id": notebook_id,
        "title": "Resistance Mechanisms"
    }).json()

    answer = requests.post(f"{BASE_URL}/chat/execute", json={
        "session_id": session["id"],
        "message": "What are the primary mechanisms of drug resistance in solid tumors?",
        "context": {"include_sources": True, "include_notes": True}
    }).json()
    print(f"AI response: {answer}")

    # 5. Search across materials
    results = requests.post(f"{BASE_URL}/search", json={
        "query": "efflux pump resistance mechanism",
        "search_type": "vector",
        "limit": 5
    }).json()
    print(f"Found {results['total']} search results")

    # 6. Create a human note summarizing findings
    note = requests.post(f"{BASE_URL}/notes", json={
        "title": "Summary of Resistance Mechanisms",
        "content": "Key findings from the literature...",
        "note_type": "human",
        "notebook_id": notebook_id
    }).json()
    print(f"Created note: {note['id']}")


if __name__ == "__main__":
    complete_research_workflow()
```

## File Upload Example

```python
import requests

BASE_URL = "http://localhost:5055/api"


def upload_research_papers(notebook_id, file_paths):
    """Upload multiple research papers to a notebook."""
    for path in file_paths:
        with open(path, "rb") as f:
            response = requests.post(
                f"{BASE_URL}/sources",
                data={
                    "notebook_id": notebook_id,
                    "process_async": "true",
                },
                files={"file": (path.split("/")[-1], f)},
            )
        if response.status_code == 200:
            print(f"Uploaded: {path}")
        else:
            print(f"Failed: {path} - {response.text}")


# Usage
upload_research_papers("notebook:abc123", [
    "papers/study_1.pdf",
    "papers/study_2.pdf",
    "papers/supplementary.docx",
])
```

## Podcast Generation Example

```python
import requests
import time

BASE_URL = "http://localhost:5055/api"


def generate_research_podcast(notebook_id):
    """Generate a podcast episode from notebook contents."""

    # Get available episode and speaker profiles
    # (these must be configured in the UI or via API first)

    # Submit podcast generation job
    job = requests.post(f"{BASE_URL}/podcasts/generate", json={
        "notebook_id": notebook_id,
        "episode_profile_id": "episode_profile:default",
        "speaker_profile_ids": [
            "speaker_profile:host",
            "speaker_profile:expert"
        ]
    }).json()
    job_id = job["job_id"]
    print(f"Podcast generation started: {job_id}")

    # Poll for completion
    while True:
        status = requests.get(f"{BASE_URL}/podcasts/jobs/{job_id}").json()
        print(f"Status: {status.get('status', 'processing')}")
        if status.get("status") in ("completed", "failed"):
            break
        time.sleep(10)

    if status["status"] == "completed":
        # Download the audio
        episode_id = status["episode_id"]
        audio = requests.get(
            f"{BASE_URL}/podcasts/episodes/{episode_id}/audio"
        )
        with open("research_podcast.mp3", "wb") as f:
            f.write(audio.content)
        print("Podcast saved to research_podcast.mp3")


if __name__ == "__main__":
    generate_research_podcast("notebook:abc123")
```

## Custom Transformation Pipeline

```python
import requests

BASE_URL = "http://localhost:5055/api"


def create_and_run_transformations():
    """Create custom transformations and apply them to content."""

    # Create a methodology extraction transformation
    transform = requests.post(f"{BASE_URL}/transformations", json={
        "name": "extract_methods",
        "title": "Extract Methods",
        "description": "Extract and structure methodology from papers",
        "prompt": (
            "Extract the methodology section from this text. "
            "Organize into: Study Design, Sample Size, Statistical Methods, "
            "and Key Variables. Format as structured markdown."
        ),
        "apply_default": False,
    }).json()

    # Get models to find a suitable one
    models = requests.get(f"{BASE_URL}/models", params={
        "model_type": "llm"
    }).json()
    model_id = models[0]["id"]

    # Execute the transformation
    result = requests.post(f"{BASE_URL}/transformations/execute", json={
        "transformation_id": transform["id"],
        "input_text": "We conducted a randomized controlled trial with...",
        "model_id": model_id,
    }).json()
    print(f"Extracted methods:\n{result['output']}")


if __name__ == "__main__":
    create_and_run_transformations()
```

## Semantic Search with Filtering

```python
import requests

BASE_URL = "http://localhost:5055/api"


def advanced_search(notebook_id, query):
    """Perform filtered semantic search and get AI answers."""

    # Get sources from a specific notebook
    sources = requests.get(f"{BASE_URL}/sources", params={
        "notebook_id": notebook_id
    }).json()
    source_ids = [s["id"] for s in sources]

    # Vector search restricted to notebook sources
    results = requests.post(f"{BASE_URL}/search", json={
        "query": query,
        "search_type": "vector",
        "limit": 10,
        "source_ids": source_ids,
        "min_similarity": 0.75,
    }).json()

    print(f"Found {results['total']} results:")
    for result in results["results"]:
        print(f"  - {result.get('title', 'Untitled')} "
              f"(similarity: {result.get('similarity', 'N/A')})")

    # Get an AI-powered answer
    answer = requests.post(f"{BASE_URL}/search/ask/simple", json={
        "query": query,
    }).json()
    print(f"\nAI Answer: {answer['response']}")


if __name__ == "__main__":
    advanced_search("notebook:abc123", "CRISPR gene editing efficiency")
```

## Model Management

```python
import requests

BASE_URL = "http://localhost:5055/api"


def setup_ai_models():
    """Configure AI models for Open Notebook."""

    # Check available providers
    providers = requests.get(f"{BASE_URL}/models/providers").json()
    print(f"Available providers: {providers}")

    # Discover models from a provider
    discovered = requests.get(
        f"{BASE_URL}/models/discover/openai"
    ).json()
    print(f"Discovered {len(discovered)} OpenAI models")

    # Sync models to make them available
    requests.post(f"{BASE_URL}/models/sync/openai")

    # Auto-assign default models
    requests.post(f"{BASE_URL}/models/auto-assign")

    # Check current defaults
    defaults = requests.get(f"{BASE_URL}/models/defaults").json()
    print(f"Default models: {defaults}")


if __name__ == "__main__":
    setup_ai_models()
```
