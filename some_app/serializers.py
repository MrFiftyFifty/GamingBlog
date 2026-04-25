from rest_framework import serializers
from .models import Topic, Post, Comment, Notification, TopicBan, Upload


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