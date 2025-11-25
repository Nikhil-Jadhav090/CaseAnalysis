from rest_framework import serializers
from .models import ChatSession, ChatMessage, ChatAttachment
from .models import IntegrationSetting

class ChatAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatAttachment
        fields = ('id', 'attachment_type', 'file', 'text_content', 'created_at')
        read_only_fields = ('created_at',)

class ChatMessageSerializer(serializers.ModelSerializer):
    attachments = ChatAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = ChatMessage
        fields = ('id', 'is_user', 'content', 'created_at', 'attachments')
        read_only_fields = ('is_user', 'created_at')

class ChatSessionSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model = ChatSession
        fields = ('id', 'created_at', 'updated_at', 'messages')
        read_only_fields = ('created_at', 'updated_at')


class IntegrationSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = IntegrationSetting
        fields = ('id', 'name', 'value', 'updated_at')
        read_only_fields = ('updated_at',)