def test_create_project(client, auth_headers):
    resp = client.post(
        "/api/v1/projects",
        json={"name": "My Project", "description": "Test desc"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    data = resp.json()["data"]
    assert data["name"] == "My Project"
    assert data["chunking_strategy"] == "naive"


def test_create_project_custom_config(client, auth_headers):
    resp = client.post(
        "/api/v1/projects",
        json={
            "name": "QA Project",
            "chunking_strategy": "qa",
            "chunk_size": 1024,
            "top_k": 10,
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201
    data = resp.json()["data"]
    assert data["chunking_strategy"] == "qa"
    assert data["chunk_size"] == 1024


def test_list_projects(client, auth_headers, project):
    resp = client.get("/api/v1/projects", headers=auth_headers)
    assert resp.status_code == 200
    projects = resp.json()["data"]
    assert any(p["id"] == project["id"] for p in projects)


def test_get_project(client, auth_headers, project):
    resp = client.get(f"/api/v1/projects/{project['id']}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["data"]["id"] == project["id"]


def test_get_project_not_found(client, auth_headers):
    import uuid
    resp = client.get(f"/api/v1/projects/{uuid.uuid4()}", headers=auth_headers)
    assert resp.status_code == 404


def test_update_project(client, auth_headers, project):
    resp = client.put(
        f"/api/v1/projects/{project['id']}",
        json={"name": "Updated Name"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["data"]["name"] == "Updated Name"


def test_delete_project(client, auth_headers):
    # Create a separate project to delete
    resp = client.post("/api/v1/projects", json={"name": "To Delete"}, headers=auth_headers)
    pid = resp.json()["data"]["id"]

    resp = client.delete(f"/api/v1/projects/{pid}", headers=auth_headers)
    assert resp.status_code == 200

    # Verify gone
    resp = client.get(f"/api/v1/projects/{pid}", headers=auth_headers)
    assert resp.status_code == 404


def test_project_isolation(client):
    # Register second user
    client.post("/api/v1/auth/register", json={"email": "other@example.com", "password": "password123"})
    login = client.post("/api/v1/auth/login", json={"email": "other@example.com", "password": "password123"})
    other_headers = {"Authorization": f"Bearer {login.json()['data']['access_token']}"}

    # Create project as other user
    resp = client.post("/api/v1/projects", json={"name": "Other Project"}, headers=other_headers)
    pid = resp.json()["data"]["id"]

    # First user registers separately
    client.post("/api/v1/auth/register", json={"email": "first@example.com", "password": "password123"})
    login1 = client.post("/api/v1/auth/login", json={"email": "first@example.com", "password": "password123"})
    first_headers = {"Authorization": f"Bearer {login1.json()['data']['access_token']}"}

    # First user cannot access other user's project
    resp = client.get(f"/api/v1/projects/{pid}", headers=first_headers)
    assert resp.status_code in (403, 404)
