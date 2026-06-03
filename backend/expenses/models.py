from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class Expense(models.Model):
    CATEGORY_CHOICES = [
        ("Food", "Food"),
        ("Transport", "Transport"),
        ("Shopping", "Shopping"),
        ("Bills", "Bills"),
        ("Entertainment", "Entertainment"),
        ("Other", "Other"),
    ]

    title = models.CharField(max_length=200)
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    date = models.DateField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    note = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.title} — ₹{self.amount} ({self.date})"
