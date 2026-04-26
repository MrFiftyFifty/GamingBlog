from rest_framework import serializers
from .models import Topic, Post, Comment, Notification, TopicBan, Upload, Profile, SteamGame, UserSteamGame, PrivateMessage
from django.contrib.auth import get_user_model

class TopicSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    subscribers_count = serializers.SerializerMethodField()
    is_subscribed = serializers.SerializerMethodField()

    class Meta:
        model = Topic
        fields = [
            'id',
            'title',
            'content',
            'author',
            'created_at',
            'updated_at',
            'is_pinned',
            'subscribers_count',
            'is_subscribed'
        ]

    def get_author(self, obj):
        return {
            "id": obj.author.id,
            "username": obj.author.username
        }

    def get_subscribers_count(self, obj):
        return obj.subscribers.count()

    def get_is_subscribed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.subscribers.filter(id=request.user.id).exists()
        return False


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