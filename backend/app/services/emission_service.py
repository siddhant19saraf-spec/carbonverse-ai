from datetime import datetime, date, timedelta, timezone
import uuid

from sqlalchemy.orm import Session

from app.constants import NATIONAL_AVERAGES_KG_PER_DAY
from app.repositories.emission_repository import EmissionRepository
from app.repositories.audit_log_repository import AuditLogRepository
from app.schemas.emission import (
    EmissionCreate,
    EmissionRecordResponse,
    EmissionSummary,
    CarbonScoreResponse,
)

CARBON_FACTORS: dict[str, dict[str, float]] = {
    "transportation": {
        "car": 0.21, "bus": 0.09, "train": 0.04, "flight": 0.25,
        "bike": 0.0, "walk": 0.0, "motorcycle": 0.15, "ev": 0.05,
    },
    "food": {
        "meat": 7.0, "dairy": 2.5, "vegetables": 0.5, "grains": 0.8,
        "fruit": 0.6, "seafood": 3.5, "processed": 3.0, "plant_based": 0.3,
    },
    "electricity": {"default": 0.5, "solar": 0.02, "wind": 0.01, "natural_gas": 0.4},
    "water": {"default": 0.001, "hot": 0.003},
    "waste": {"landfill": 0.5, "recycled": 0.1, "composted": 0.05},
}

SUGGESTIONS_BY_CATEGORY: dict[str, list[str]] = {
    "transportation": [
        "Consider using public transit instead of driving",
        "Carpooling can reduce your carbon footprint by up to 75%",
        "Walking or biking for short trips saves fuel and health",
        "Electric vehicles produce 50-70% less emissions",
    ],
    "food": [
        "Reducing meat consumption by 1 day per week saves significant CO2",
        "Buying local produce reduces transportation emissions",
        "Plant-based meals have 10x lower carbon footprint than meat",
        "Reducing food waste is one of the top climate actions",
    ],
    "electricity": [
        "Switch to LED bulbs to save 75% energy",
        "Unplug devices when not in use to reduce phantom loads",
        "Consider switching to a renewable energy provider",
        "Smart thermostats can reduce energy usage by 15%",
    ],
    "water": [
        "Take shorter showers to reduce hot water usage",
        "Fix leaky faucets to save up to 3,000 gallons per year",
        "Use cold water for laundry when possible",
        "Install water-efficient fixtures",
    ],
    "waste": [
        "Start composting food scraps to reduce landfill waste",
        "Recycle properly - contamination ruins recyclable materials",
        "Buy products with minimal packaging",
        "Use reusable bags, bottles, and containers",
    ],
}

UNIT_MULTIPLIERS: dict[str, float] = {
    "km": 1, "miles": 1.609, "liter": 1, "kWh": 1,
    "gallon": 3.785, "kg": 1, "meal": 1, "day": 1,
}


class EmissionService:
    def __init__(self, db: Session):
        self.db = db
        self.emission_repo = EmissionRepository(db)
        self.audit_repo = AuditLogRepository(db)

    def calculate_carbon_footprint(
        self,
        category: str,
        amount: float,
        unit: str,
        subcategory: str | None = None,
    ) -> float:
        cat_factors = CARBON_FACTORS.get(category, {})
        if subcategory and subcategory in cat_factors:
            factor = cat_factors[subcategory]
        elif "default" in cat_factors:
            factor = cat_factors["default"]
        else:
            factor = (
                sum(cat_factors.values()) / len(cat_factors) if cat_factors else 0.5
            )
        multiplier = UNIT_MULTIPLIERS.get(unit, 1)
        return round(amount * factor * multiplier, 4)

    def record_emission(
        self, user_id: uuid.UUID, data: EmissionCreate
    ) -> EmissionRecordResponse:
        carbon = self.calculate_carbon_footprint(
            data.category, data.amount, data.unit, data.subcategory
        )
        now = datetime.now(timezone.utc)
        record = self.emission_repo.create({
            "user_id": user_id,
            "category": data.category,
            "subcategory": data.subcategory,
            "amount": data.amount,
            "unit": data.unit,
            "carbon_footprint": carbon,
            "recorded_at": data.recorded_at or now,
            "created_at": now,
        })
        self.audit_repo.log_action(
            user_id, "record_emission", "emission", record.id,
            {"category": data.category, "carbon": carbon}, None, None,
        )
        return EmissionRecordResponse.model_validate(record)

    def get_user_emissions(self, user_id: uuid.UUID, days: int = 30) -> list:
        date_from = datetime.now(timezone.utc) - timedelta(days=days)
        return self.emission_repo.get_by_date_range(
            user_id, date_from, datetime.now(timezone.utc)
        )

    def get_emission_summary(self, user_id: uuid.UUID) -> EmissionSummary:
        total = self.emission_repo.get_total_by_user(user_id)
        breakdown = self.emission_repo.get_category_breakdown(user_id)
        daily_avg = self.emission_repo.get_average_daily_emission(user_id)
        weekly_total = sum(
            d["total"] for d in self.emission_repo.get_weekly_totals(user_id, 4)
        )
        monthly_total = sum(
            d["total"] for d in self.emission_repo.get_monthly_totals(user_id, 3)
        )
        return EmissionSummary(
            total_carbon=round(total, 2),
            category_breakdown={k: round(v, 2) for k, v in breakdown.items()},
            daily_average=round(daily_avg, 2),
            weekly_total=round(weekly_total, 2),
            monthly_total=round(monthly_total, 2),
        )

    def calculate_carbon_score(self, user_id: uuid.UUID) -> CarbonScoreResponse:
        summary = self.get_emission_summary(user_id)
        daily_avg = summary.daily_average
        national_avg = sum(NATIONAL_AVERAGES_KG_PER_DAY.values())

        if daily_avg <= 0:
            score = 100
        else:
            ratio = daily_avg / national_avg
            score = max(0, min(100, int(100 - (ratio - 1) * 100)))

        if score >= 80:
            level = "Excellent"
        elif score >= 60:
            level = "Good"
        elif score >= 40:
            level = "Average"
        elif score >= 20:
            level = "Below Average"
        else:
            level = "Needs Improvement"

        suggestions: list[str] = []
        for cat, value in summary.category_breakdown.items():
            national = NATIONAL_AVERAGES_KG_PER_DAY.get(cat, 0)
            if value / 30 > national:
                suggestions.extend(SUGGESTIONS_BY_CATEGORY.get(cat, [])[:2])
        if not suggestions:
            suggestions.append(
                "Great job! Keep maintaining your sustainable lifestyle."
            )

        return CarbonScoreResponse(
            score=score,
            level=level,
            total_emissions=summary.total_carbon,
            category_breakdown=summary.category_breakdown,
            suggestions=suggestions[:5],
        )

    def compare_with_national_average(self, user_id: uuid.UUID) -> dict:
        summary = self.get_emission_summary(user_id)
        national_total = sum(NATIONAL_AVERAGES_KG_PER_DAY.values()) * 30
        breakdown: dict[str, dict[str, float]] = {}
        for cat, user_val in summary.category_breakdown.items():
            national_val = NATIONAL_AVERAGES_KG_PER_DAY.get(cat, 0) * 30
            breakdown[cat] = {
                "user": round(user_val, 2),
                "national": round(national_val, 2),
                "difference_pct": (
                    round(((user_val - national_val) / national_val) * 100, 1)
                    if national_val > 0
                    else 0
                ),
            }
        return {
            "user_total": summary.total_carbon,
            "national_total": round(national_total, 2),
            "difference_pct": (
                round(
                    ((summary.total_carbon - national_total) / national_total) * 100,
                    1,
                )
                if national_total > 0
                else 0
            ),
            "breakdown": breakdown,
        }
