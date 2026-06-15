import os
import sys
from pathlib import Path

import psycopg2
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

DB_NAME = os.getenv("DATABASE_NAME", "gamingblog")
DB_USER = os.getenv("DATABASE_USER", "gamingblog")
DB_PASSWORD = os.getenv("DATABASE_PASSWORD", "gamingblog")
DB_HOST = os.getenv("DATABASE_HOST", "localhost")
DB_PORT = os.getenv("DATABASE_PORT", "5432")

DEMO_EMAIL = "demo@gamingblog.local"
DEMO_USERNAME = "demo"
DEMO_PASSWORD = "Demo12345!"


def try_app_connect():
    return psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
    )


def ensure_role_and_database(admin_conn):
    admin_conn.autocommit = True
    cur = admin_conn.cursor()
    cur.execute("SELECT 1 FROM pg_roles WHERE rolname = %s", (DB_USER,))
    if cur.fetchone() is None:
        cur.execute(
            f"CREATE ROLE {DB_USER} WITH LOGIN PASSWORD %s",
            (DB_PASSWORD,),
        )
        print(f"Created role {DB_USER}")
    cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (DB_NAME,))
    if cur.fetchone() is None:
        cur.execute(f"CREATE DATABASE {DB_NAME} OWNER {DB_USER}")
        print(f"Created database {DB_NAME}")
    cur.close()


def main():
    os.environ.setdefault("PGCLIENTENCODING", "UTF8")
    try:
        conn = try_app_connect()
        conn.close()
        print("Database connection OK")
    except Exception as exc:
        print(f"App DB not ready ({exc}), trying postgres superuser...")
        admin = None
        for pwd in ("postgres", "gamingblog", "", "admin"):
            try:
                admin = psycopg2.connect(
                    dbname="postgres",
                    user="postgres",
                    password=pwd,
                    host=DB_HOST,
                    port=DB_PORT,
                )
                print("Connected as postgres")
                break
            except psycopg2.Error:
                continue
        if admin is None:
            print(
                "Cannot connect to PostgreSQL. Start the service and set postgres password, "
                "or create database/user manually.",
                file=sys.stderr,
            )
            sys.exit(1)
        ensure_role_and_database(admin)
        admin.close()
        conn = try_app_connect()
        conn.close()
        print("Database connection OK after setup")

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    sys.path.insert(0, str(BASE_DIR))
    import django

    django.setup()
    from django.core.management import call_command
    from django.contrib.auth import get_user_model

    call_command("migrate", verbosity=1, interactive=False)
    call_command("seed_forum", verbosity=1)

    User = get_user_model()
    user, created = User.objects.get_or_create(
        email=DEMO_EMAIL,
        defaults={
            "username": DEMO_USERNAME,
            "bio": "Демо-аккаунт для тестирования и скриншотов",
            "rating": 128,
        },
    )
    user.username = DEMO_USERNAME
    user.set_password(DEMO_PASSWORD)
    user.is_active = True
    user.save()

    print()
    print("Demo user ready (" + ("created" if created else "updated") + ")")
    print(f"  Email:    {DEMO_EMAIL}")
    print(f"  Username: {DEMO_USERNAME}")
    print(f"  Password: {DEMO_PASSWORD}")
    print("  Login:    http://localhost:3000/auth/login")
    print(f"  Profile:  http://localhost:3000/user/{DEMO_USERNAME}")


if __name__ == "__main__":
    main()
