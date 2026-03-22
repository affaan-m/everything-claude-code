def test_create_api_key(client, auth_headers, project):
    resp = client.post(f"/api/v1/projects/{project['id']}/api-keys", headers=auth_headers)
    assert resp.status_code == 201
    data = resp.json()["data"]
    assert "plaintext_key" in data
    assert data["plaintext_key"].startswith("rag_")
    assert data["is_active"] is True


def test_list_api_keys(client, auth_headers, project):
    # Create 2 keys
    client.post(f"/api/v1/projects/{project['id']}/api-keys", headers=auth_headers)
    client.post(f"/api/v1/projects/{project['id']}/api-keys", headers=auth_headers)

    resp = client.get(f"/api/v1/projects/{project['id']}/api-keys", headers=auth_headers)
    assert resp.status_code == 200
    keys = resp.json()["data"]
    assert len(keys) >= 2
    # plaintext key NOT included in list
    for k in keys:
        assert "plaintext_key" not in k


def test_revoke_api_key(client, auth_headers, project):
    create_resp = client.post(f"/api/v1/projects/{project['id']}/api-keys", headers=auth_headers)
    key_id = create_resp.json()["data"]["id"]

    revoke_resp = client.post(
        f"/api/v1/projects/{project['id']}/api-keys/{key_id}/revoke",
        headers=auth_headers,
    )
    assert revoke_resp.status_code == 200
    assert revoke_resp.json()["data"]["is_active"] is False
    assert revoke_resp.json()["data"]["revoked_at"] is not None


def test_revoked_key_fails_retrieval(client, auth_headers, project):
    create_resp = client.post(f"/api/v1/projects/{project['id']}/api-keys", headers=auth_headers)
    key_data = create_resp.json()["data"]
    plaintext = key_data["plaintext_key"]
    key_id = key_data["id"]

    # Revoke it
    client.post(f"/api/v1/projects/{project['id']}/api-keys/{key_id}/revoke", headers=auth_headers)

    # Retrieve fails with revoked key
    resp = client.post(
        "/api/v1/retrieve",
        json={"question": "test"},
        headers={"Authorization": f"Bearer {plaintext}"},
    )
    assert resp.status_code == 401


def test_validate_key(client, auth_headers, project):
    create_resp = client.post(f"/api/v1/projects/{project['id']}/api-keys", headers=auth_headers)
    plaintext = create_resp.json()["data"]["plaintext_key"]

    resp = client.post(
        "/api/v1/auth/validate-key",
        headers={"Authorization": f"Bearer {plaintext}"},
    )
    assert resp.status_code == 200
    assert resp.json()["valid"] is True
    assert resp.json()["project_id"] == project["id"]
