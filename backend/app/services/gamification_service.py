from datetime import datetime, timedelta, timezone
import uuid
from sqlalchemy.orm import Session
from app.models.achievement import Achievement, UserAchievement
from app.models.challenge import Challenge, UserChallenge
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.repositories.emission_repository import EmissionRepository
from app.repositories.achievement_repository import AchievementRepository
from app.repositories.challenge_repository import ChallengeRepository
from app.schemas.gamification import GamificationState
from app.schemas.challenge import ChallengeResponse, UserChallengeResponse

ACHIEVEMENT_DEFINITIONS = [
    {"name": "First Step", "description": "Record your first emission", "badge_icon": "🌱", "category": "onboarding", "threshold_score": 0},
    {"name": "Week Warrior", "description": "Track emissions for 7 consecutive days", "badge_icon": "🔥", "category": "streak", "threshold_score": 7},
    {"name": "Carbon Cutter", "description": "Reduce emissions by 10%", "badge_icon": "✂️", "category": "reduction", "threshold_score": 10},
    {"name": "Green Champion", "description": "Achieve a sustainability score of 80+", "badge_icon": "🏆", "category": "score", "threshold_score": 80},
    {"name": "Eco Warrior", "description": "Save 100kg of CO2", "badge_icon": "🌍", "category": "savings", "threshold_score": 100},
    {"name": "Planet Protector", "description": "Save 500kg of CO2", "badge_icon": "🛡️", "category": "savings", "threshold_score": 500},
    {"name": "Perfect Month", "description": "Track all categories for 30 days", "badge_icon": "📅", "category": "consistency", "threshold_score": 30},
    {"name": "Streak Master", "description": "Maintain a 30-day streak", "badge_icon": "⚡", "category": "streak", "threshold_score": 30},
    {"name": "Zero Hero", "description": "Achieve zero waste for a week", "badge_icon": "♻️", "category": "waste", "threshold_score": 7},
    {"name": "Green Level 5", "description": "Reach Green Level 5", "badge_icon": "🌟", "category": "level", "threshold_score": 5},
]

CHALLENGE_DEFINITIONS = [
    {"title": "Meatless Week", "description": "Go plant-based for 7 days", "goal_type": "days", "goal_value": 7, "reward_score": 50},
    {"title": "Commute Green", "description": "Use public transit for 5 days", "goal_type": "days", "goal_value": 5, "reward_score": 30},
    {"title": "Energy Saver", "description": "Reduce electricity by 20%", "goal_type": "percentage", "goal_value": 20, "reward_score": 40},
    {"title": "Water Wise", "description": "Save 100 liters of water", "goal_type": "liters", "goal_value": 100, "reward_score": 25},
    {"title": "Zero Waste Day", "description": "Produce zero landfill waste for 1 day", "goal_type": "days", "goal_value": 1, "reward_score": 20},
]


class GamificationService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.emission_repo = EmissionRepository(db)
        self.achievement_repo = AchievementRepository(db)
        self.challenge_repo = ChallengeRepository(db)

    def _seed_achievements(self):
        existing = self.achievement_repo.get_all_achievements()
        if not existing:
            for ach in ACHIEVEMENT_DEFINITIONS:
                self.achievement_repo.create({**ach, "created_at": datetime.now(timezone.utc)})

    def _seed_challenges(self):
        existing = self.challenge_repo.get_active_challenges()
        now = datetime.now(timezone.utc)
        if not existing:
            for ch in CHALLENGE_DEFINITIONS:
                self.challenge_repo.create({
                    **ch,
                    "starts_at": now,
                    "ends_at": now + timedelta(days=14),
                    "is_active": True,
                    "created_at": now,
                })

    def calculate_level(self, score: int) -> int:
        if score >= 81:
            return 5
        elif score >= 61:
            return 4
        elif score >= 41:
            return 3
        elif score >= 21:
            return 2
        return 1

    def update_streak(self, user_id: uuid.UUID) -> int:
        user = self.user_repo.get(user_id)
        if not user:
            return 0
        now = datetime.now(timezone.utc)
        today = now.date()
        current_streak = user.streak_days or 0

        records = self.emission_repo.get_by_user(user_id)
        if records:
            last_record = max(records, key=lambda r: r.recorded_at)
            last_date = last_record.recorded_at.date() if last_record.recorded_at else today
            if last_date == today - timedelta(days=1) or last_date == today:
                if last_date == today:
                    return current_streak
                current_streak += 1
            elif last_date < today - timedelta(days=1):
                current_streak = 1
            self.user_repo.update(user, {"streak_days": current_streak})
        return current_streak

    def calculate_total_badges(self, user_id: uuid.UUID) -> int:
        return self.achievement_repo.get_achievement_count(user_id)

    def check_and_award_badges(self, user_id: uuid.UUID):
        self._seed_achievements()
        user = self.user_repo.get(user_id)
        if not user:
            return
        self.achievement_repo.check_and_award_achievements(user_id, user.sustainability_score or 0)

    def get_weekly_challenges(self, user_id: uuid.UUID) -> list:
        self._seed_challenges()
        user_challenges = self.challenge_repo.get_user_challenges(user_id)
        active_challenges = self.challenge_repo.get_active_challenges()

        if not user_challenges:
            for ch in active_challenges[:3]:
                self.challenge_repo.join_challenge(user_id, ch.id)
            user_challenges = self.challenge_repo.get_user_challenges(user_id)

        result = []
        for uc in user_challenges:
            challenge = self.challenge_repo.get(uc.challenge_id)
            if challenge:
                result.append(UserChallengeResponse(
                    id=uc.id,
                    challenge=ChallengeResponse.model_validate(challenge),
                    progress=uc.progress,
                    completed=uc.completed,
                    completed_at=uc.completed_at,
                ))
        return result

    def get_gamification_state(self, user_id: uuid.UUID) -> GamificationState:
        user = self.user_repo.get(user_id)
        if not user:
            raise ValueError("User not found")

        self.check_and_award_badges(user_id)
        streak = self.update_streak(user_id)
        badges = self.calculate_total_badges(user_id)
        level = self.calculate_level(user.sustainability_score or 0)

        if (user.green_level or 1) != level:
            self.user_repo.update(user, {"green_level": level})

        weekly_challenges = self.get_weekly_challenges(user_id)
        completed_weekly = sum(1 for c in weekly_challenges if c.completed)
        total_weekly = len(weekly_challenges)

        return GamificationState(
            current_score=user.sustainability_score or 0,
            green_level=level,
            streak_days=streak,
            total_badges=badges,
            weekly_progress=round(completed_weekly / total_weekly * 100) if total_weekly > 0 else 0,
        )
