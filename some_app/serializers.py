from rest_framework import serializers
from .models import Topic, Post, Comment

class TopicSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()

    class Meta:
        model = Topic
        fields = '__all__'

    def get_author(self, obj):
        return {
            "id": obj.author.id,
            "username": obj.author.username
        }

class PostSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = '__all__'
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

    
class CommentSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        read_only_fields = ['author']
        fields = '__all__'

    def get_author(self, obj):
        return {
            "id": obj.author.id,
            "username": obj.author.username
        }

    def get_replies(self, obj):
        return CommentSerializer(obj.replies.all(), many=True).data

    likes_count = serializers.IntegerField(read_only=True)

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False