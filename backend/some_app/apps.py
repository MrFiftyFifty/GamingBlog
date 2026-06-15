from django.apps import AppConfig


class SomeAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'some_app'

    def ready(self):
        import some_app.signals