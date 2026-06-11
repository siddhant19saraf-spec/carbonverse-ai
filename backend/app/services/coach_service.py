from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.repositories.emission_repository import EmissionRepository
from app.schemas.coach import CoachResponse, WeeklyInsight

DAILY_TIPS = [
    "Today's tip: Try a meatless Monday - plant-based meals emit 10x less CO2 than beef.",
    "Today's tip: Unplug chargers when not in use - phantom loads account for 10% of energy bills.",
    "Today's tip: Walk or bike for trips under 2 miles to save 0.4kg CO2.",
    "Today's tip: Use a reusable water bottle - plastic bottles create 1.5kg CO2 to manufacture.",
    "Today's tip: Lower your thermostat by 2°F to save 5% on heating energy.",
    "Today's tip: Line-dry clothes when possible - dryers use 2.5kg CO2 per load.",
    "Today's tip: Buy local produce - imported food travels 1,500 miles on average.",
    "Today's tip: Start composting - food waste in landfills produces methane, a potent greenhouse gas.",
    "Today's tip: Choose products with less packaging to reduce waste emissions.",
    "Today's tip: Use cold water for laundry - 90% of washing machine energy heats water.",
    "Today's tip: Take public transit today - buses emit 80% less CO2 per passenger than cars.",
    "Today's tip: Set your computer to sleep mode - sleep uses 60% less power than active mode.",
    "Today's tip: Switch to LED bulbs - they use 75% less energy and last 25x longer.",
    "Today's tip: Eat seasonal foods - greenhouse-grown food can emit 10x more CO2.",
    "Today's tip: Repair instead of replace - manufacturing new products creates significant emissions.",
]

COACH_RESPONSES = {
    "transportation": [
        "Your transportation emissions are {value}kg CO2 this period. {comparison} To reduce this, consider carpooling 2 days a week, which can cut your commute emissions by 40%.",
        "I see you've logged {value}kg CO2 from transportation. {comparison} Have you tried using a bike for short trips? Each car-free mile saves about 0.21kg CO2.",
    ],
    "food": [
        "Your food-related emissions total {value}kg CO2. {comparison} Try incorporating 2 plant-based meals per week to reduce food emissions by up to 25%.",
        "From your food choices, you've generated {value}kg CO2. {comparison} Shopping at local farmers markets can reduce food miles and associated emissions.",
    ],
    "electricity": [
        "Your electricity usage accounts for {value}kg CO2. {comparison} Consider an energy audit - most homes can reduce electricity usage by 20-30% with simple changes.",
        "Electricity emissions are {value}kg CO2. {comparison} Switching to a green energy provider can reduce this by up to 90%.",
    ],
    "water": [
        "Water usage generates {value}kg CO2. {comparison} Low-flow fixtures can reduce water heating energy by 50%.",
        "Your water footprint is {value}kg CO2. {comparison} Shorter showers and cold-water laundry are quick wins.",
    ],
    "waste": [
        "Waste generation creates {value}kg CO2. {comparison} Composting can divert 30% of household waste from landfills.",
        "Your waste emissions are {value}kg CO2. {comparison} The zero-waste movement starts with refusing single-use items.",
    ],
}

COACH_GREETINGS = [
    "Great to see you! Let's review your environmental impact.",
    "Welcome back! I've been analyzing your recent activities.",
    "Hi there! Ready to make a positive impact today?",
]

COACH_GENERAL_RESPONSES = [
    "Based on your recent activities, your overall carbon footprint is trending {trend}. Keep up the {aspect}! Your current sustainability score is {score}/100.",
    "I've analyzed your latest data. You're doing {aspect} compared to the national average. Focus on {area} for maximum impact.",
    "Your sustainability journey shows {trend} progress. The biggest opportunity for improvement is in {area}. Would you like specific action items?",
]


class CoachService:
    def __init__(self, db: Session):
        self.db = db
        self.emission_repo = EmissionRepository(db)

    @staticmethod
    def get_daily_tip() -> str:
        day_of_year = datetime.now(timezone.utc).timetuple().tm_yday
        return DAILY_TIPS[day_of_year % len(DAILY_TIPS)]

    def generate_coach_response(self, user_id: str, message: str, context: dict | None = None) -> CoachResponse:
        breakdown = self.emission_repo.get_category_breakdown(user_id)
        daily_totals = self.emission_repo.get_daily_totals(user_id, 14)

        if not daily_totals:
            return CoachResponse(
                reply="Welcome to CarbonVerse AI Coach! Start by recording your daily activities so I can provide personalized insights and recommendations.",
                suggestions=[
                    "Record your transportation usage",
                    "Track your food consumption",
                    "Log your electricity usage",
                ],
            )

        recent_avg = sum(d["total"] for d in daily_totals[:7]) / 7 if daily_totals else 0
        older_avg = sum(d["total"] for d in daily_totals[7:]) / 7 if len(daily_totals) > 7 else recent_avg

        trend = "improving" if recent_avg < older_avg else ("worsening" if recent_avg > older_avg else "stable")

        msg_lower = message.lower()
        primary_category = max(breakdown, key=breakdown.get) if breakdown else None
        suggestions = []

        if any(word in msg_lower for word in ["transport", "car", "drive", "commute"]):
            category = "transportation"
            value = breakdown.get("transportation", 0)
            comparison = f"That's {max(0, value - 4.2 * 30):.1f}kg above the national monthly average of 126kg."
            reply = COACH_RESPONSES["transportation"][0].format(value=round(value, 1), comparison=comparison)
            suggestions = ["Switch to public transit 2x/week", "Carpool for commute", "Try an EV rental for a day"]
        elif any(word in msg_lower for word in ["food", "eat", "meal", "diet"]):
            category = "food"
            value = breakdown.get("food", 0)
            comparison = f"That's {max(0, value - 2.8 * 30):.1f}kg above the national monthly average of 84kg."
            reply = COACH_RESPONSES["food"][0].format(value=round(value, 1), comparison=comparison)
            suggestions = ["Try Meatless Mondays", "Buy local produce", "Reduce food waste"]
        elif any(word in msg_lower for word in ["electric", "energy", "power", "electricity"]):
            category = "electricity"
            value = breakdown.get("electricity", 0)
            comparison = f"That's {max(0, value - 3.5 * 30):.1f}kg above the national monthly average of 105kg."
            reply = COACH_RESPONSES["electricity"][0].format(value=round(value, 1), comparison=comparison)
            suggestions = ["Switch to LED bulbs", "Unplug idle devices", "Consider solar panels"]
        else:
            category = primary_category
            value = breakdown.get(category, 0) if category else 0
            aspect = "good" if trend == "improving" else "room for improvement"
            area = category or "all areas"
            reply = COACH_GENERAL_RESPONSES[0].format(
                trend=trend, aspect=aspect, score=min(100, max(0, 100 - int(recent_avg * 2)))
            )
            suggestions = [f"Focus on reducing {area} emissions", "Set a weekly reduction goal", "Track daily habits"]

        return CoachResponse(reply=reply, suggestions=suggestions)

    def generate_weekly_insights(self, user_id: str) -> WeeklyInsight:
        now = datetime.now(timezone.utc)
        week_start = now - timedelta(days=7)
        breakdown = self.emission_repo.get_category_breakdown(user_id)
        daily_totals = self.emission_repo.get_daily_totals(user_id, 14)

        total = sum(breakdown.values())
        max_cat = max(breakdown, key=breakdown.get) if breakdown else "N/A"
        min_cat = min(breakdown, key=breakdown.get) if breakdown else "N/A"

        recent_avg = sum(d["total"] for d in daily_totals[:7]) / 7 if daily_totals else 0
        older_avg = sum(d["total"] for d in daily_totals[7:]) / 7 if len(daily_totals) > 7 else recent_avg

        trend = "improving" if recent_avg < older_avg else ("worsening" if recent_avg > older_avg else "stable")
        pct_change = abs(recent_avg - older_avg) / older_avg * 100 if older_avg > 0 else 0

        summary = (
            f"This week you generated {total:.1f}kg CO2 total. "
            f"Your highest emissions came from {max_cat} ({breakdown.get(max_cat, 0):.1f}kg). "
            f"Your trend is {trend} with {pct_change:.1f}% change from the previous period."
        )
        areas = [f"Reduce {max_cat} usage", f"Increase sustainable {min_cat} practices", "Set a daily carbon budget"]

        return WeeklyInsight(
            week_start=week_start.date(),
            week_end=now.date(),
            summary=summary,
            achievements=["Consistent tracking maintained"],
            areas_for_improvement=[f"{max_cat} emissions are above target"],
            next_week_goals=areas,
        )

    def generate_sustainability_goals(self, user_id: str) -> list[str]:
        breakdown = self.emission_repo.get_category_breakdown(user_id)
        goals = []
        sorted_cats = sorted(breakdown.items(), key=lambda x: x[1], reverse=True)
        for cat, value in sorted_cats[:3]:
            reduction = value * 0.15
            goals.append(f"Reduce {cat} emissions by {reduction:.1f}kg CO2 ({15}%)")
        goals.append("Track all emissions daily for the next 7 days")
        goals.append("Try one new sustainable habit this week")
        return goals
