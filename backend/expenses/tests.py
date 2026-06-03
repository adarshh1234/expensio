from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from datetime import date, timedelta
from .models import Expense


class ExpenseModelTest(TestCase):
    def test_str(self):
        e = Expense(title="Coffee", amount=100, date=date.today(), category="Food")
        self.assertIn("Coffee", str(e))

    def test_ordering_most_recent_first(self):
        Expense.objects.create(title="Old", amount=50, date=date(2024, 1, 1), category="Food")
        Expense.objects.create(title="New", amount=80, date=date(2024, 6, 1), category="Food")
        first = Expense.objects.first()
        self.assertEqual(first.title, "New")


class ExpenseAPITest(APITestCase):
    def setUp(self):
        self.url = "/api/expenses/"
        self.valid = {
            "title": "Lunch",
            "amount": "250.00",
            "date": str(date.today()),
            "category": "Food",
            "note": "",
        }

    def test_create_valid(self):
        r = self.client.post(self.url, self.valid, format="json")
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.data["title"], "Lunch")

    def test_create_missing_title(self):
        data = {**self.valid, "title": ""}
        r = self.client.post(self.url, data, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_zero_amount(self):
        data = {**self.valid, "amount": "0"}
        r = self.client.post(self.url, data, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_negative_amount(self):
        data = {**self.valid, "amount": "-50"}
        r = self.client.post(self.url, data, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_invalid_category(self):
        data = {**self.valid, "category": "NotACategory"}
        r = self.client.post(self.url, data, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_past_date_too_old(self):
        data = {**self.valid, "date": "1999-01-01"}
        r = self.client.post(self.url, data, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_search_by_title(self):
        Expense.objects.create(title="Coffee at Starbucks", amount=200, date=date.today(), category="Food")
        Expense.objects.create(title="Bus ticket", amount=50, date=date.today(), category="Transport")
        r = self.client.get(self.url + "?search=coffee")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(r.data["results"]), 1)
        self.assertEqual(r.data["results"][0]["title"], "Coffee at Starbucks")

    def test_filter_by_category(self):
        Expense.objects.create(title="Groceries", amount=500, date=date.today(), category="Food")
        Expense.objects.create(title="Electricity", amount=1200, date=date.today(), category="Bills")
        r = self.client.get(self.url + "?category=Bills")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(r.data["results"]), 1)

    def test_date_range_filter(self):
        today = date.today()
        Expense.objects.create(title="A", amount=100, date=today - timedelta(days=5), category="Food")
        Expense.objects.create(title="B", amount=100, date=today - timedelta(days=1), category="Food")
        Expense.objects.create(title="C", amount=100, date=today, category="Food")
        r = self.client.get(
            self.url + f"?date_from={(today - timedelta(days=2)).isoformat()}&date_to={today.isoformat()}"
        )
        self.assertEqual(len(r.data["results"]), 2)

    def test_weird_date_range_from_gt_to(self):
        today = date.today()
        Expense.objects.create(title="X", amount=100, date=today, category="Food")
        r = self.client.get(
            self.url + f"?date_from={today.isoformat()}&date_to={(today - timedelta(days=3)).isoformat()}"
        )
        self.assertEqual(len(r.data["results"]), 0)

    def test_summary_endpoint(self):
        today = date.today()
        Expense.objects.create(title="A", amount=500, date=today, category="Food")
        Expense.objects.create(title="B", amount=300, date=today, category="Transport")
        r = self.client.get(f"/api/expenses/summary/?year={today.year}&month={today.month}")
        self.assertEqual(r.status_code, 200)
        self.assertAlmostEqual(r.data["total"], 800.0)
        self.assertIn("Food", r.data["breakdown"])

    def test_summary_invalid_month(self):
        r = self.client.get("/api/expenses/summary/?year=2024&month=13")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_edit_expense(self):
        e = Expense.objects.create(title="Old", amount=100, date=date.today(), category="Food")
        r = self.client.patch(f"{self.url}{e.id}/", {"title": "Updated"}, format="json")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data["title"], "Updated")

    def test_delete_expense(self):
        e = Expense.objects.create(title="ToDelete", amount=100, date=date.today(), category="Food")
        r = self.client.delete(f"{self.url}{e.id}/")
        self.assertEqual(r.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Expense.objects.count(), 0)
