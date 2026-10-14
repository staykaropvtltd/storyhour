from app.database.models.profile import UserProfile


TEST_USER_ID = "d486d34e-0a56-4293-85f2-2b6b15801c80"
TEST_EMAIL = "storyteller@storyhour.com"


def _create_profile(
    api_db,
    *,
    user_id=TEST_USER_ID,
    email=TEST_EMAIL,
    full_name="Original Name",
    avatar_url="https://example.com/original.png",
    subscription_tier="standard",
    is_active=True,
):
    profile = api_db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if profile:
        profile.email = email
        profile.full_name = full_name
        profile.avatar_url = avatar_url
        profile.subscription_tier = subscription_tier
        profile.is_active = is_active
        profile.is_deleted = False
        api_db.commit()
        api_db.refresh(profile)
        return profile

    profile = UserProfile(
        user_id=user_id,
        email=email,
        full_name=full_name,
        avatar_url=avatar_url,
        subscription_tier=subscription_tier,
        is_active=is_active,
    )
    api_db.add(profile)
    api_db.commit()
    api_db.refresh(profile)
    return profile


def test_get_me_returns_local_profile(api_client, api_db, valid_token):
    """Authenticated user receives profile data from the local database."""
    _create_profile(api_db)

    response = api_client.get(
        "/api/me",
        headers={"Authorization": f"Bearer {valid_token}"},
    )

    assert response.status_code == 200

    data = response.json()
    assert data["id"] == TEST_USER_ID
    assert data["email"] == TEST_EMAIL
    assert data["full_name"] == "Original Name"
    assert data["avatar_url"] == "https://example.com/original.png"
    assert data["subscription_tier"] == "standard"
    assert data["is_active"] is True
    assert data["role"] == "Customer"


def test_get_me_without_local_profile_returns_404(
    api_client,
    api_db,
    valid_token,
):
    """Missing profile returns 404 and does not fall back to active user."""
    api_db.query(UserProfile).filter(UserProfile.user_id == TEST_USER_ID).delete()
    api_db.commit()

    response = api_client.get(
        "/api/me",
        headers={"Authorization": f"Bearer {valid_token}"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "User profile not found"


def test_update_me_full_name(api_client, api_db, valid_token):
    """PATCH /api/me updates only the user's full name."""
    _create_profile(api_db)

    response = api_client.patch(
        "/api/me",
        headers={"Authorization": f"Bearer {valid_token}"},
        json={"full_name": "Updated Name"},
    )

    assert response.status_code == 200

    data = response.json()
    assert data["full_name"] == "Updated Name"
    assert data["avatar_url"] == "https://example.com/original.png"

    profile = api_db.query(UserProfile).filter(
        UserProfile.user_id == TEST_USER_ID
    ).first()

    assert profile.full_name == "Updated Name"
    assert profile.avatar_url == "https://example.com/original.png"


def test_update_me_avatar_url(api_client, api_db, valid_token):
    """PATCH /api/me updates the user's avatar URL."""
    _create_profile(api_db)

    response = api_client.patch(
        "/api/me",
        headers={"Authorization": f"Bearer {valid_token}"},
        json={"avatar_url": "https://example.com/new-avatar.png"},
    )

    assert response.status_code == 200

    data = response.json()
    assert data["full_name"] == "Original Name"
    assert data["avatar_url"] == "https://example.com/new-avatar.png"


def test_update_me_cannot_modify_identity_or_role(
    api_client,
    api_db,
    valid_token,
):
    """Identity and authorization fields cannot be changed through profile updates."""
    _create_profile(api_db)

    response = api_client.patch(
        "/api/me",
        headers={"Authorization": f"Bearer {valid_token}"},
        json={
            "email": "attacker@example.com",
            "id": "different-user-id",
            "role": "Administrator",
            "subscription_tier": "unlimited",
            "is_active": False,
        },
    )

    assert response.status_code == 422

    profile = api_db.query(UserProfile).filter(
        UserProfile.user_id == TEST_USER_ID
    ).first()

    assert profile.email == TEST_EMAIL
    assert profile.subscription_tier == "standard"
    assert profile.is_active is True


def test_update_me_without_local_profile_returns_404(
    api_client,
    api_db,
    valid_token,
):
    """PATCH requires an existing local UserProfile."""
    api_db.query(UserProfile).filter(UserProfile.user_id == TEST_USER_ID).delete()
    api_db.commit()

    response = api_client.patch(
        "/api/me",
        headers={"Authorization": f"Bearer {valid_token}"},
        json={"full_name": "New Name"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "User profile not found"


def test_get_me_requires_authentication(api_client):
    """GET /api/me rejects requests without a JWT."""
    response = api_client.get("/api/me")

    assert response.status_code == 401


def test_update_me_requires_authentication(api_client):
    """PATCH /api/me rejects requests without a JWT."""
    response = api_client.patch(
        "/api/me",
        json={"full_name": "New Name"},
    )

    assert response.status_code == 401
