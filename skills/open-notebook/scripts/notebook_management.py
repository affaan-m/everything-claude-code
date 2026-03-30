"""
Open Notebook - Notebook Management Example

Demonstrates creating, listing, updating, and deleting notebooks
using the Open Notebook REST API.

Prerequisites:
    pip install requests

Usage:
    export OPEN_NOTEBOOK_URL="http://localhost:5055"
    python notebook_management.py
"""

import os
import requests

BASE_URL = os.getenv("OPEN_NOTEBOOK_URL", "http://localhost:5055") + "/api"


def create_notebook(name, description=""):
    """Create a new notebook."""
    response = requests.post(f"{BASE_URL}/notebooks", json={
        "name": name,
        "description": description,
    })
    response.raise_for_status()
    notebook = response.json()
    print(f"Created notebook: {notebook['id']} - {notebook['name']}")
    return notebook


def list_notebooks(archived=False):
    """List all notebooks, optionally filtering by archived status."""
    response = requests.get(f"{BASE_URL}/notebooks", params={
        "archived": archived,
    })
    response.raise_for_status()
    notebooks = response.json()
    print(f"Found {len(notebooks)} notebook(s):")
    for nb in notebooks:
        print(f"  - {nb['id']}: {nb['name']} "
              f"(sources: {nb.get('source_count', 0)}, "
              f"notes: {nb.get('note_count', 0)})")
    return notebooks


def get_notebook(notebook_id):
    """Retrieve a single notebook by ID."""
    response = requests.get(f"{BASE_URL}/notebooks/{notebook_id}")
    response.raise_for_status()
    return response.json()


def update_notebook(notebook_id, name=None, description=None, archived=None):
    """Update notebook fields."""
    payload = {}
    if name is not None:
        payload["name"] = name
    if description is not None:
        payload["description"] = description
    if archived is not None:
        payload["archived"] = archived
    response = requests.put(
        f"{BASE_URL}/notebooks/{notebook_id}", json=payload
    )
    response.raise_for_status()
    updated = response.json()
    print(f"Updated notebook: {updated['id']} - {updated['name']}")
    return updated


def delete_notebook(notebook_id, delete_sources=False):
    """Delete a notebook and optionally its exclusive sources."""
    # Preview what will be deleted
    preview = requests.get(
        f"{BASE_URL}/notebooks/{notebook_id}/delete-preview"
    ).json()
    print(f"Deletion will affect {preview.get('note_count', 0)} notes "
          f"and {preview.get('source_count', 0)} sources")

    response = requests.delete(
        f"{BASE_URL}/notebooks/{notebook_id}",
        params={"delete_sources": delete_sources},
    )
    response.raise_for_status()
    print(f"Deleted notebook: {notebook_id}")


def link_source_to_notebook(notebook_id, source_id):
    """Associate an existing source with a notebook."""
    response = requests.post(
        f"{BASE_URL}/notebooks/{notebook_id}/sources/{source_id}"
    )
    response.raise_for_status()
    print(f"Linked source {source_id} to notebook {notebook_id}")


def unlink_source_from_notebook(notebook_id, source_id):
    """Remove the association between a source and a notebook."""
    response = requests.delete(
        f"{BASE_URL}/notebooks/{notebook_id}/sources/{source_id}"
    )
    response.raise_for_status()
    print(f"Unlinked source {source_id} from notebook {notebook_id}")


if __name__ == "__main__":
    # Demo workflow
    print("=== Notebook Management Demo ===\n")

    # Create notebooks
    nb1 = create_notebook(
        "Protein Folding Research",
        "Literature review on AlphaFold and related methods"
    )
    nb2 = create_notebook(
        "CRISPR Gene Editing",
        "Survey of CRISPR-Cas9 applications in therapeutics"
    )

    # List all notebooks
    print()
    list_notebooks()

    # Update a notebook
    print()
    update_notebook(nb1["id"], description="Updated: Including ESMFold comparisons")

    # Archive a notebook
    print()
    update_notebook(nb2["id"], archived=True)
    print("\nActive notebooks:")
    list_notebooks(archived=False)

    print("\nArchived notebooks:")
    list_notebooks(archived=True)

    # Clean up
    print()
    delete_notebook(nb1["id"])
    delete_notebook(nb2["id"])
