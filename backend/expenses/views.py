from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Max, Q
from django.db.models.functions import TruncMonth
from datetime import date
import calendar

from .models import Expense
from .serializers import ExpenseSerializer


class ExpenseViewSet(viewsets.ModelViewSet):
    """
    CRUD for expenses + extra endpoints:
      GET  /api/expenses/summary/?year=&month=  — monthly totals + category breakdown
    """
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        qs = Expense.objects.all()

        # --- search (partial title match, case-insensitive) ---
        search = self.request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(title__icontains=search)

        # --- category filter ---
        category = self.request.query_params.get("category", "").strip()
        if category:
            qs = qs.filter(category=category)

        # --- date range filter ---
        date_from = self.request.query_params.get("date_from", "").strip()
        date_to = self.request.query_params.get("date_to", "").strip()

        if date_from:
            try:
                qs = qs.filter(date__gte=date_from)
            except Exception:
                pass  # bad format — ignore, don't crash

        if date_to:
            try:
                qs = qs.filter(date__lte=date_to)
            except Exception:
                pass

        # Validate weird range (from > to) — return empty queryset
        if date_from and date_to and date_from > date_to:
            return qs.none()

        return qs

    @action(detail=False, methods=["get"], url_path="summary")
    def summary(self, request):
        """
        Monthly summary: total, count, largest expense, daily average,
        category breakdown. Defaults to current month.
        """
        today = date.today()
        try:
            year = int(request.query_params.get("year", today.year))
            month = int(request.query_params.get("month", today.month))
            if not (1 <= month <= 12):
                return Response({"error": "month must be 1–12."}, status=status.HTTP_400_BAD_REQUEST)
            if year < 2000 or year > 2100:
                return Response({"error": "year out of range."}, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return Response({"error": "Invalid year or month."}, status=status.HTTP_400_BAD_REQUEST)

        qs = Expense.objects.filter(date__year=year, date__month=month)
        total = qs.aggregate(total=Sum("amount"))["total"] or 0
        count = qs.count()
        days_in_month = calendar.monthrange(year, month)[1]
        daily_avg = float(total) / days_in_month if total else 0

        largest = qs.order_by("-amount").values("id", "title", "amount").first()

        # Category breakdown
        breakdown = {}
        for exp in qs.values("category", "amount"):
            breakdown[exp["category"]] = breakdown.get(exp["category"], 0) + float(exp["amount"])

        return Response({
            "year": year,
            "month": month,
            "total": float(total),
            "count": count,
            "daily_avg": round(daily_avg, 2),
            "largest": largest,
            "breakdown": breakdown,
        })
