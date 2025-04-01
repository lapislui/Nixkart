#!/usr/bin/env python
import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_project.settings')
django.setup()

from django.contrib.auth.models import User
from django.db.utils import IntegrityError
from django.utils import timezone


def create_users():
    # Create a superuser
    if not User.objects.filter(username='admin').exists():
        user = User.objects.create_user(
            username='staff',
            email='staff@gmail.com',
            password='staff123'
        )
        user.is_staff = True
        user.save()
        print("Staff user 'staff' created successfully.")
    else:
        print("Staff user 'staff' already exists.")

    # Create a default user
    if not User.objects.filter(username='defaultuser').exists():
        User.objects.create_user(
            username='defaultuser',
            email='defaultuser@example.com',
            password='defaultpassword'
        )
        print("Default user 'defaultuser' created successfully.")
    else:
        print("Default user 'defaultuser' already exists.")

if __name__ == '__main__':
    create_users()