from app.config.settings import settings


def test_using_test_database():
    assert settings.postgres_url == settings.postgres_url_test
