#!/usr/bin/env python
"""
Script to create default Site object for django.contrib.sites app.
This fixes the migration issue where django-allauth expects the sites app tables to exist.
"""

import os
import django
import sys

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_project.settings')
django.setup()

from django.db import connection, connections
from django.db.migrations.recorder import MigrationRecorder
from django.db.utils import OperationalError

def create_site_table():
    """Create the django_site table if it doesn't exist."""
    with connection.cursor() as cursor:
        try:
            # Check if table exists
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='django_site';")
            if not cursor.fetchone():
                print("Creating django_site table...")
                cursor.execute('''
                    CREATE TABLE django_site (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        domain VARCHAR(100) NOT NULL,
                        name VARCHAR(50) NOT NULL
                    );
                ''')
                print("Table created successfully.")
                # Create the default site
                domain = os.environ.get('REPLIT_DOMAIN', 'example.com')
                # Use direct string formatting for SQLite
                cursor.execute(
                    "INSERT INTO django_site (id, domain, name) VALUES (1, '%s', 'My E-commerce Site')" % domain
                )
                print(f"Created default site with domain: {domain}")
            else:
                print("django_site table already exists.")
        except Exception as e:
            print(f"Error creating table: {e}")
            return False
    return True

def mark_migrations_as_applied():
    """Mark the sites migrations as applied in Django's migration system."""
    try:
        connection = connections['default']
        recorder = MigrationRecorder(connection)
        
        # Create migrations table if it doesn't exist
        recorder.ensure_schema()
        
        # Check if the migrations are already recorded
        sites_migrations = recorder.migration_qs.filter(app='sites')
        if not sites_migrations.exists():
            # Record the sites migrations as applied
            recorder.record_applied('sites', '0001_initial')
            recorder.record_applied('sites', '0002_alter_domain_unique')
            print("Marked sites migrations as applied.")
        else:
            print("Sites migrations already marked as applied.")
    except Exception as e:
        print(f"Error marking migrations: {e}")
        return False
    return True

if __name__ == '__main__':
    if create_site_table() and mark_migrations_as_applied():
        print("Sites fix completed successfully!")
    else:
        print("Failed to fix sites configuration.")