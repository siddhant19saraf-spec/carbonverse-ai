import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db
from app.core.security import get_password_hash

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})


@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def register_and_login(email: str = "test@example.com", username: str = "testuser", password: str = "securepass123"):
    client.post("/api/v1/auth/register", json={
        "email": email, "username": username, "password": password, "full_name": "Test User"
    })
    login_resp = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    return login_resp.json()["access_token"]


class TestHealthAndRoot:
    def test_health_check(self):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data

    def test_root(self):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "CarbonVerse AI" in data["name"]


class TestAuthentication:
    def test_register_user(self):
        response = client.post("/api/v1/auth/register", json={
            "email": "new@example.com", "username": "newuser", "password": "securepass123"
        })
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "new@example.com"
        assert data["username"] == "newuser"
        assert data["role"] == "user"
        assert "id" in data

    def test_register_duplicate_email(self):
        client.post("/api/v1/auth/register", json={
            "email": "dup@example.com", "username": "user1", "password": "pass123"
        })
        response = client.post("/api/v1/auth/register", json={
            "email": "dup@example.com", "username": "user2", "password": "pass123"
        })
        assert response.status_code == 400

    def test_register_duplicate_username(self):
        client.post("/api/v1/auth/register", json={
            "email": "a@example.com", "username": "sameuser", "password": "pass123"
        })
        response = client.post("/api/v1/auth/register", json={
            "email": "b@example.com", "username": "sameuser", "password": "pass123"
        })
        assert response.status_code == 400

    def test_register_short_password(self):
        response = client.post("/api/v1/auth/register", json={
            "email": "short@example.com", "username": "shortuser", "password": "123"
        })
        assert response.status_code == 400

    def test_login_success(self):
        client.post("/api/v1/auth/register", json={
            "email": "login@example.com", "username": "loginuser", "password": "mypassword"
        })
        response = client.post("/api/v1/auth/login", json={
            "email": "login@example.com", "password": "mypassword"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_login_invalid_credentials(self):
        client.post("/api/v1/auth/register", json={
            "email": "invalid@example.com", "username": "invaliduser", "password": "correctpass"
        })
        response = client.post("/api/v1/auth/login", json={
            "email": "invalid@example.com", "password": "wrongpass"
        })
        assert response.status_code == 401

    def test_login_nonexistent_user(self):
        response = client.post("/api/v1/auth/login", json={
            "email": "nonexistent@example.com", "password": "pass123"
        })
        assert response.status_code == 401

    def test_refresh_token(self):
        client.post("/api/v1/auth/register", json={
            "email": "refresh@example.com", "username": "refreshuser", "password": "pass123"
        })
        login_resp = client.post("/api/v1/auth/login", json={
            "email": "refresh@example.com", "password": "pass123"
        })
        refresh = login_resp.json()["refresh_token"]
        response = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh})
        assert response.status_code == 200
        assert "access_token" in response.json()

    def test_refresh_invalid_token(self):
        response = client.post("/api/v1/auth/refresh", json={"refresh_token": "invalid.token.here"})
        assert response.status_code == 401

    def test_get_me_authenticated(self):
        token = register_and_login("me@example.com", "meuser")
        response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert response.json()["email"] == "me@example.com"

    def test_get_me_unauthenticated(self):
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 401

    def test_change_password(self):
        token = register_and_login("chg@example.com", "chguser")
        response = client.post(
            "/api/v1/auth/change-password",
            json={"old_password": "securepass123", "new_password": "newpassword123"},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200

    def test_change_password_wrong_old(self):
        token = register_and_login("wrong@example.com", "wronguser")
        response = client.post(
            "/api/v1/auth/change-password",
            json={"old_password": "wrongoldpass", "new_password": "newpassword123"},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 400


class TestEmissions:
    def test_record_emission(self):
        token = register_and_login("em@example.com", "emuser")
        response = client.post(
            "/api/v1/emissions/",
            json={"category": "transportation", "amount": 100, "unit": "km", "subcategory": "car"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["category"] == "transportation"
        assert data["carbon_footprint"] == 21.0

    def test_record_emission_food(self):
        token = register_and_login("food@example.com", "fooduser")
        response = client.post(
            "/api/v1/emissions/",
            json={"category": "food", "amount": 2, "unit": "kg", "subcategory": "meat"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 201
        assert response.json()["carbon_footprint"] == 14.0

    def test_record_emission_unauthenticated(self):
        response = client.post(
            "/api/v1/emissions/",
            json={"category": "transportation", "amount": 100, "unit": "km"},
        )
        assert response.status_code == 401

    def test_get_emissions(self):
        token = register_and_login("list@example.com", "listuser")
        client.post(
            "/api/v1/emissions/",
            json={"category": "electricity", "amount": 50, "unit": "kWh"},
            headers={"Authorization": f"Bearer {token}"},
        )
        response = client.get("/api/v1/emissions/", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_emission_summary(self):
        token = register_and_login("sum@example.com", "sumuser")
        client.post(
            "/api/v1/emissions/",
            json={"category": "electricity", "amount": 50, "unit": "kWh"},
            headers={"Authorization": f"Bearer {token}"},
        )
        response = client.get("/api/v1/emissions/summary", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        data = response.json()
        assert "total_carbon" in data
        assert "category_breakdown" in data
        assert "daily_average" in data

    def test_carbon_score(self):
        token = register_and_login("score@example.com", "scoreuser")
        response = client.get("/api/v1/emissions/score", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        data = response.json()
        assert "score" in data
        assert "level" in data
        assert "suggestions" in data
        assert 0 <= data["score"] <= 100

    def test_compare_national_average(self):
        token = register_and_login("compare@example.com", "compareuser")
        response = client.get("/api/v1/emissions/compare-national", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        data = response.json()
        assert "user_total" in data
        assert "national_total" in data
        assert "difference_pct" in data
        assert "breakdown" in data


class TestCoach:
    def test_coach_chat(self):
        token = register_and_login("coach@example.com", "coachuser")
        response = client.post(
            "/api/v1/coach/chat",
            json={"message": "How can I reduce my transportation emissions?"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "reply" in data
        assert "suggestions" in data

    def test_coach_chat_general(self):
        token = register_and_login("gen@example.com", "genuser")
        response = client.post(
            "/api/v1/coach/chat",
            json={"message": "What can I do to help the environment?"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200

    def test_daily_tip(self):
        response = client.get("/api/v1/coach/daily-tip")
        assert response.status_code == 200
        assert "tip" in response.json()
        assert len(response.json()["tip"]) > 0

    def test_weekly_insights(self):
        token = register_and_login("insights@example.com", "insightsuser")
        response = client.get("/api/v1/coach/weekly-insights", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        data = response.json()
        assert "summary" in data

    def test_coach_goals(self):
        token = register_and_login("goals@example.com", "goalsuser")
        response = client.get("/api/v1/coach/goals", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert "goals" in response.json()


class TestPredictions:
    def test_predictions(self):
        token = register_and_login("pred@example.com", "preduser")
        response = client.post(
            "/api/v1/predictions/",
            json={"months_ahead": 3},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "predictions" in data
        assert "trend_direction" in data
        assert "confidence_score" in data
        assert "projected_score" in data


class TestGamification:
    def test_gamification_state(self):
        token = register_and_login("game@example.com", "gameuser")
        response = client.get("/api/v1/achievements/state", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        data = response.json()
        assert "current_score" in data
        assert "green_level" in data
        assert "streak_days" in data
        assert "total_badges" in data

    def test_challenges(self):
        token = register_and_login("chall@example.com", "challuser")
        response = client.get("/api/v1/challenges/", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert isinstance(response.json(), list)


class TestGoals:
    def test_create_goal(self):
        token = register_and_login("goal@example.com", "goaluser")
        response = client.post(
            "/api/v1/goals/",
            json={
                "title": "Reduce Electricity",
                "description": "Cut electricity by 20%",
                "target_carbon_reduction": 50.0,
                "category": "electricity",
                "target_date": "2026-12-31",
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 201
        assert response.json()["title"] == "Reduce Electricity"

    def test_get_goals(self):
        token = register_and_login("getgoals@example.com", "getgoalsuser")
        response = client.get("/api/v1/goals/", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_create_goal_unauthenticated(self):
        response = client.post(
            "/api/v1/goals/",
            json={
                "title": "Test",
                "description": "Test description",
                "target_carbon_reduction": 10.0,
                "category": "test",
                "target_date": "2026-12-31",
            },
        )
        assert response.status_code == 401


class TestReports:
    def test_generate_report(self):
        token = register_and_login("report@example.com", "reportuser")
        response = client.post(
            "/api/v1/reports/generate",
            json={"date_from": "2026-01-01", "date_to": "2026-06-01", "include_recommendations": True},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "report_url" in data

    def test_download_report(self):
        token = register_and_login("dl@example.com", "dluser")
        response = client.post(
            "/api/v1/reports/download",
            json={"date_from": "2026-01-01", "date_to": "2026-06-01", "include_recommendations": True},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"
