from rest_framework import serializers
from .models import Expense
from datetime import date


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ["id", "title", "amount", "date", "category", "note", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Title cannot be blank.")
        if len(value) > 200:
            raise serializers.ValidationError("Title must be 200 characters or fewer.")
        return value

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        if value > 99999999.99:
            raise serializers.ValidationError("Amount is unrealistically large.")
        return value

    def validate_date(self, value):
        if value.year < 2000:
            raise serializers.ValidationError("Date seems too far in the past (before year 2000).")
        if value > date(2100, 12, 31):
            raise serializers.ValidationError("Date seems too far in the future.")
        return value

    def validate_note(self, value):
        return value.strip()
