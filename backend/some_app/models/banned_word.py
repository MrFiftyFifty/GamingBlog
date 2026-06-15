from django.db import models


class BannedWord(models.Model):
    word = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['word']

    def save(self, *args, **kwargs):
        self.word = self.word.strip().casefold()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.word