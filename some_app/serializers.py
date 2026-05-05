from rest_framework import serializers
from .models import (
    Section,
    Tag,
    Topic,
    Post,
    Comment,
    Notification,
    TopicBan,
    Upload,
    Profile,
    SteamGame,
    UserSteamGame,
    PrivateMessage,
    ContentReport,
    BannedWord,
    ModerationLog
)

from django.contrib.auth import get_user_model
from django.utils.text import slugify
from django.contrib.contenttypes.models import ContentType
from .services.word_blacklist import validate_text_has_no_banned_words

class SectionSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    topics_count = serializers.SerializerMethodField()

    class Meta:
        model = Section
        fields = [
            'id',
            'owner',
            'owner_username',
            'title',
            'slug',
            'description',
            'topics_count',
            'created_at'
        ]
        read_only_fields = [
            'id',
            'owner',
            'owner_username',
            'topics_count',
            'created_at'
        ]

    def get_topics_count(self, obj):
        return obj.topics.count()

    def validate_slug(self, value):
        value = slugify(value)

        if not value:
            raise serializers.ValidationError("Slug cannot be empty")

        if Section.objects.filter(slug=value).exists():
            raise serializers.ValidationError("Section with this slug already exists")

        return value
    
class TagSerializer(serializers.ModelSerializer):
    topics_count = serializers.SerializerMethodField()

    class Meta:
        model = Tag
        fields = [
            'id',
            'name',
            'slug',
            'topics_count',
            'created_at'
        ]
        read_only_fields = [
            'id',
            'created_at'
        ]

    def get_topics_count(self, obj):
        return obj.topics.count()

    def validate_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError('Tag name cannot be empty')

        return value

    def validate_slug(self, value):
        value = value.strip().lower()

        if not value:
            raise serializers.ValidationError('Tag slug cannot be empty')

        return value
    
class TopicSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    subscribers_count = serializers.SerializerMethodField()
    is_subscribed = serializers.SerializerMethodField()

    section = SectionSerializer(read_only=True)

    section_id = serializers.PrimaryKeyRelatedField(
        source='section',
        queryset=Section.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )

    section_slug = serializers.SlugRelatedField(
        source='section',
        slug_field='slug',
        queryset=Section.objects.all(),
        write_only=True,
        required=False
    )

    tags = TagSerializer(many=True, read_only=True)

    tag_slugs = serializers.SlugRelatedField(
        source='tags',
        slug_field='slug',
        queryset=Tag.objects.all(),
        many=True,
        write_only=True,
        required=False
    )

    class Meta:
        model = Topic
        fields = [
            'id',
            'section',
            'section_id',
            'section_slug',
            'tags',
            'tag_slugs',
            'title',
            'content',
            'author',
            'author_username',
            'is_pinned',
            'subscribers_count',
            'is_subscribed',
            'created_at',
            'updated_at'
        ]

        read_only_fields = [
            'id',
            'author',
            'created_at',
            'updated_at'
        ]

    def validate_title(self, value):
        return validate_text_has_no_banned_words(value)

    def validate_content(self, value):
        return validate_text_has_no_banned_words(value)

    def get_subscribers_count(self, obj):
        return obj.subscribers.count()

    def get_is_subscribed(self, obj):
        request = self.context.get('request')

        if not request or not request.user.is_authenticated:
            return False

        return obj.subscribers.filter(id=request.user.id).exists()


class CommentSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id',
            'author',
            'post',
            'content',
            'parent',
            'created_at',
            'replies',
            'likes_count',
            'is_liked'
        ]
        read_only_fields = ['author']

    def validate_content(self, value):
        return validate_text_has_no_banned_words(value)

    def get_author(self, obj):
        return {
            "id": obj.author.id,
            "username": obj.author.username
        }

    def get_replies(self, obj):
        return CommentSerializer(
            obj.replies.all().order_by('created_at'),
            many=True,
            context=self.context
        ).data

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False


class PostSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id',
            'author',
            'topic',
            'content',
            'created_at',
            'likes_count',
            'is_liked',
            'comments'
        ]
        read_only_fields = ['author']

    def validate_content(self, value):
        return validate_text_has_no_banned_words(value)

    def get_author(self, obj):
        return {
            "id": obj.author.id,
            "username": obj.author.username
        }

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

    def get_comments(self, obj):
        comments = obj.comments.filter(parent__isnull=True).order_by('created_at')
        return CommentSerializer(
            comments,
            many=True,
            context=self.context
        ).data


class NotificationSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = '__all__'

    def get_sender(self, obj):
        return {
            "id": obj.sender.id,
            "username": obj.sender.username
        }
    
    
class TopicBanSerializer(serializers.ModelSerializer):
    class Meta:
        model = TopicBan
        fields = ['id', 'user', 'topic', 'reason', 'created_at']


class UploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Upload
        fields = ['id', 'file', 'created_at']


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'


class SteamGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = SteamGame
        fields = [
            'id',
            'appid',
            'name',
            'icon_url'
        ]


class UserSteamGameSerializer(serializers.ModelSerializer):
    appid = serializers.IntegerField(source='game.appid', read_only=True)
    name = serializers.CharField(source='game.name', read_only=True)
    icon_url = serializers.CharField(source='game.icon_url', read_only=True)

    playtime_minutes = serializers.IntegerField(source='playtime_forever', read_only=True)
    playtime_hours = serializers.SerializerMethodField()
    playtime_display = serializers.SerializerMethodField()

    playtime_2weeks_minutes = serializers.IntegerField(source='playtime_2weeks', read_only=True)
    playtime_2weeks_hours = serializers.SerializerMethodField()

    last_played_display = serializers.SerializerMethodField()

    class Meta:
        model = UserSteamGame
        fields = [
            'id',
            'appid',
            'name',
            'icon_url',
            'playtime_minutes',
            'playtime_hours',
            'playtime_display',
            'playtime_2weeks_minutes',
            'playtime_2weeks_hours',
            'last_played',
            'last_played_display',
            'updated_at'
        ]

    def get_playtime_hours(self, obj):
        return round(obj.playtime_forever / 60, 2)

    def get_playtime_display(self, obj):
        hours = obj.playtime_forever // 60
        minutes = obj.playtime_forever % 60

        if hours == 0:
            return f"{minutes} мин."

        return f"{hours} ч. {minutes} мин."

    def get_playtime_2weeks_hours(self, obj):
        return round(obj.playtime_2weeks / 60, 2)

    def get_last_played_display(self, obj):
        if not obj.last_played:
            return "Никогда не запускалась"

        return obj.last_played.strftime("%d.%m.%Y %H:%M")
    

User = get_user_model()


class PrivateMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    recipient_username = serializers.CharField(source='recipient.username', read_only=True)

    recipient_id = serializers.PrimaryKeyRelatedField(
        source='recipient',
        queryset=User.objects.all(),
        write_only=True
    )

    is_mine = serializers.SerializerMethodField()

    class Meta:
        model = PrivateMessage
        fields = [
            'id',
            'sender',
            'sender_username',
            'recipient',
            'recipient_username',
            'recipient_id',
            'content',
            'is_read',
            'is_mine',
            'created_at'
        ]
        read_only_fields = [
            'id',
            'sender',
            'recipient',
            'is_read',
            'created_at'
        ]

    def get_is_mine(self, obj):
        request = self.context.get('request')

        if not request:
            return False

        return obj.sender == request.user
    

class ContentReportSerializer(serializers.ModelSerializer):
    reporter_username = serializers.CharField(source='reporter.username', read_only=True)
    moderator_username = serializers.CharField(source='moderator.username', read_only=True)

    target_type = serializers.ChoiceField(
        choices=['topic', 'post', 'comment'],
        write_only=True
    )

    target_id = serializers.IntegerField(write_only=True)

    reported_object_type = serializers.SerializerMethodField()
    reported_object_id = serializers.SerializerMethodField()
    reported_object_preview = serializers.SerializerMethodField()

    class Meta:
        model = ContentReport
        fields = [
            'id',
            'reporter',
            'reporter_username',
            'target_type',
            'target_id',
            'reported_object_type',
            'reported_object_id',
            'reported_object_preview',
            'reason',
            'description',
            'status',
            'moderator',
            'moderator_username',
            'moderator_comment',
            'created_at',
            'updated_at',
            'resolved_at'
        ]

        read_only_fields = [
            'id',
            'reporter',
            'status',
            'moderator',
            'moderator_comment',
            'created_at',
            'updated_at',
            'resolved_at'
        ]

    def get_model_by_target_type(self, target_type):
        models_map = {
            'topic': Topic,
            'post': Post,
            'comment': Comment,
        }

        return models_map.get(target_type)

    def validate(self, attrs):
        target_type = attrs.get('target_type')
        target_id = attrs.get('target_id')

        model = self.get_model_by_target_type(target_type)

        if not model:
            raise serializers.ValidationError({
                'target_type': 'Invalid target type'
            })

        try:
            target_object = model.objects.get(id=target_id)
        except model.DoesNotExist:
            raise serializers.ValidationError({
                'target_id': 'Reported object does not exist'
            })

        request = self.context.get('request')

        if request and request.user.is_authenticated:
            content_type = ContentType.objects.get_for_model(model)

            already_exists = ContentReport.objects.filter(
                reporter=request.user,
                content_type=content_type,
                object_id=target_object.id
            ).exists()

            if already_exists:
                raise serializers.ValidationError(
                    'You have already reported this content'
                )

        attrs['target_object'] = target_object
        attrs['target_model'] = model

        return attrs

    def create(self, validated_data):
        target_object = validated_data.pop('target_object')
        target_model = validated_data.pop('target_model')

        validated_data.pop('target_type')
        validated_data.pop('target_id')

        content_type = ContentType.objects.get_for_model(target_model)

        return ContentReport.objects.create(
            content_type=content_type,
            object_id=target_object.id,
            **validated_data
        )

    def get_reported_object_type(self, obj):
        return obj.content_type.model

    def get_reported_object_id(self, obj):
        return obj.object_id

    def get_reported_object_preview(self, obj):
        content_object = obj.content_object

        if not content_object:
            return None

        if hasattr(content_object, 'title'):
            return content_object.title

        if hasattr(content_object, 'content'):
            return content_object.content[:120]

        return str(content_object)
    
class BannedWordSerializer(serializers.ModelSerializer):
    class Meta:
        model = BannedWord
        fields = [
            'id',
            'word',
            'is_active',
            'created_at'
        ]
        read_only_fields = [
            'id',
            'created_at'
        ]

    def validate_word(self, value):
        value = value.strip().casefold()

        if not value:
            raise serializers.ValidationError('Word cannot be empty')

        return value
    
class ModerationLogSerializer(serializers.ModelSerializer):
    moderator_username = serializers.CharField(source='moderator.username', read_only=True)
    target_username = serializers.CharField(source='target_user.username', read_only=True)
    topic_title = serializers.CharField(source='topic.title', read_only=True)

    target_object_type = serializers.SerializerMethodField()
    target_object_id = serializers.SerializerMethodField()
    target_object_preview = serializers.SerializerMethodField()

    class Meta:
        model = ModerationLog
        fields = [
            'id',
            'moderator',
            'moderator_username',
            'target_user',
            'target_username',
            'topic',
            'topic_title',
            'action',
            'target_object_type',
            'target_object_id',
            'target_object_preview',
            'reason',
            'metadata',
            'created_at'
        ]
        read_only_fields = [
            'id',
            'moderator',
            'moderator_username',
            'target_user',
            'target_username',
            'topic',
            'topic_title',
            'action',
            'target_object_type',
            'target_object_id',
            'target_object_preview',
            'reason',
            'metadata',
            'created_at'
        ]

    def get_target_object_type(self, obj):
        if not obj.content_type:
            return None

        return obj.content_type.model

    def get_target_object_id(self, obj):
        return obj.object_id

    def get_target_object_preview(self, obj):
        target = obj.content_object

        if not target:
            return None

        if hasattr(target, 'title'):
            return target.title

        if hasattr(target, 'content'):
            return target.content[:120]

        return str(target)