import re

from rest_framework import serializers

from ..models import BannedWord


def normalize_text(text):
    if not text:
        return ''

    return text.casefold()


def find_banned_words(text):
    normalized_text = normalize_text(text)

    if not normalized_text:
        return []

    banned_words = BannedWord.objects.filter(
        is_active=True
    ).values_list('word', flat=True)

    found_words = []

    for word in banned_words:
        normalized_word = normalize_text(word.strip())

        if not normalized_word:
            continue

        pattern = r'(?<![\w])' + re.escape(normalized_word) + r'(?![\w])'

        if re.search(pattern, normalized_text, flags=re.IGNORECASE):
            found_words.append(normalized_word)

    return found_words


def validate_text_has_no_banned_words(text):
    found_words = find_banned_words(text)

    if found_words:
        raise serializers.ValidationError(
            'Текст содержит запрещённые слова.'
        )

    return text