import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone, timedelta
from app.services.emission_service import EmissionService, CARBON_FACTORS, NATIONAL_AVERAGES_KG_PER_DAY
from app.services.coach_service import CoachService, DAILY_TIPS
from app.services.prediction_service import PredictionService
from app.services.gamification_service import GamificationService


class TestEmissionService:
    def setup_method(self):
        self.db = MagicMock()
        self.service = EmissionService(self.db)

    def test_calculate_carbon_footprint_car(self):
        result = self.service.calculate_carbon_footprint("transportation", 100, "km", "car")
        assert result == 21.0

    def test_calculate_carbon_footprint_bus(self):
        result = self.service.calculate_carbon_footprint("transportation", 100, "km", "bus")
        assert result == 9.0

    def test_calculate_carbon_footprint_train(self):
        result = self.service.calculate_carbon_footprint("transportation", 100, "km", "train")
        assert result == 4.0

    def test_calculate_carbon_footprint_flight(self):
        result = self.service.calculate_carbon_footprint("transportation", 100, "km", "flight")
        assert result == 25.0

    def test_calculate_carbon_footprint_bike(self):
        result = self.service.calculate_carbon_footprint("transportation", 100, "km", "bike")
        assert result == 0.0

    def test_calculate_carbon_footprint_meat(self):
        result = self.service.calculate_carbon_footprint("food", 2, "kg", "meat")
        assert result == 14.0

    def test_calculate_carbon_footprint_vegetables(self):
        result = self.service.calculate_carbon_footprint("food", 1, "kg", "vegetables")
        assert result == 0.5

    def test_calculate_carbon_footprint_electricity(self):
        result = self.service.calculate_carbon_footprint("electricity", 50, "kWh")
        assert result == 25.0

    def test_calculate_carbon_footprint_water(self):
        result = self.service.calculate_carbon_footprint("water", 100, "liter")
        assert result == 0.1

    def test_calculate_carbon_footprint_waste(self):
        result = self.service.calculate_carbon_footprint("waste", 10, "kg", "landfill")
        assert result == 5.0

    def test_calculate_carbon_footprint_unknown_category(self):
        result = self.service.calculate_carbon_footprint("unknown", 10, "kg")
        assert result > 0

    def test_calculate_carbon_footprint_unknown_subcategory(self):
        result = self.service.calculate_carbon_footprint("transportation", 10, "km", "unknown")
        assert result > 0


class TestCoachService:
    def test_get_daily_tip_returns_string(self):
        tip = CoachService.get_daily_tip()
        assert isinstance(tip, str)
        assert len(tip) > 0

    def test_get_daily_tip_is_consistent(self):
        tip1 = CoachService.get_daily_tip()
        tip2 = CoachService.get_daily_tip()
        assert tip1 == tip2

    def test_daily_tips_not_empty(self):
        assert len(DAILY_TIPS) > 0


class TestGamificationService:
    def setup_method(self):
        self.db = MagicMock()
        self.service = GamificationService(self.db)

    def test_calculate_level_low(self):
        assert self.service.calculate_level(0) == 1
        assert self.service.calculate_level(19) == 1

    def test_calculate_level_medium(self):
        assert self.service.calculate_level(25) == 2
        assert self.service.calculate_level(45) == 3

    def test_calculate_level_high(self):
        assert self.service.calculate_level(65) == 4
        assert self.service.calculate_level(85) == 5
        assert self.service.calculate_level(100) == 5


class TestPredictionService:
    def setup_method(self):
        self.db = MagicMock()
        self.service = PredictionService(self.db)

    def test_linear_regression_basic(self):
        x = [0, 1, 2, 3, 4]
        y = [0, 2, 4, 6, 8]
        intercept, slope = self.service._linear_regression(x, y)
        assert abs(intercept - 0) < 0.001
        assert abs(slope - 2) < 0.001

    def test_linear_regression_flat(self):
        x = [0, 1, 2, 3]
        y = [5, 5, 5, 5]
        intercept, slope = self.service._linear_regression(x, y)
        assert abs(intercept - 5) < 0.001
        assert abs(slope) < 0.001

    def test_linear_regression_single_point(self):
        x = [0]
        y = [5]
        intercept, slope = self.service._linear_regression(x, y)
        assert intercept == 5
        assert slope == 0

    def test_linear_regression_empty(self):
        x = []
        y = []
        intercept, slope = self.service._linear_regression(x, y)
        assert intercept == 0
        assert slope == 0


class TestCarbonFactors:
    def test_all_categories_have_factors(self):
        required = {"transportation", "food", "electricity", "water", "waste"}
        assert required.issubset(set(CARBON_FACTORS.keys()))

    def test_transport_subcategories(self):
        transport = CARBON_FACTORS["transportation"]
        assert "car" in transport
        assert "bus" in transport
        assert "train" in transport
        assert "flight" in transport

    def test_food_subcategories(self):
        food = CARBON_FACTORS["food"]
        assert "meat" in food
        assert "vegetables" in food

    def test_national_averages(self):
        assert len(NATIONAL_AVERAGES_KG_PER_DAY) == 5
        for cat, val in NATIONAL_AVERAGES_KG_PER_DAY.items():
            assert val > 0
