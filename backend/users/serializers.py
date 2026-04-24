from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        user = authenticate(
            username=attrs.get('email'),
            password=attrs.get('password'),
        )
        if user is None:
            raise AuthenticationFailed('Неверные email или пароль')
        return super().validate(attrs)
    

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'avatar', 'bio', 'rating']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data.get('username', validated_data['email']),
            password=validated_data['password'],
        )
        user.avatar = validated_data.get('avatar')
        user.bio = validated_data.get('bio', '')
        user.rating = validated_data.get('rating', 0)
        user.save()
        return user