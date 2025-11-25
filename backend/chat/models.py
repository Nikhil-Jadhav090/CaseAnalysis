from django.db import models
from django.conf import settings

class ChatSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

class ChatMessage(models.Model):
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    is_user = models.BooleanField(default=True)  # True if message is from user, False if from AI
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

class ChatAttachment(models.Model):
    """Attachment to a chat message (evidence file, audio, or metadata like accused name)."""
    ATTACHMENT_TYPE_CHOICES = [
        ('evidence', 'Evidence File'),
        ('audio', 'Audio File'),
        ('accused', 'Accused Info'),
        ('other', 'Other'),
    ]
    
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, related_name='attachments')
    attachment_type = models.CharField(max_length=20, choices=ATTACHMENT_TYPE_CHOICES)
    file = models.FileField(upload_to='chat_attachments/%Y/%m/%d/', null=True, blank=True)  # For evidence/audio
    text_content = models.TextField(null=True, blank=True)  # For accused name, notes, etc.
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.get_attachment_type_display()} - {self.message.id}"


class IntegrationSetting(models.Model):
    """Simple key/value storage for integration settings (e.g. GEMINI_API_KEY).
    Admin users can update this via an API; code will prefer DB value over env.
    """
    name = models.CharField(max_length=100, unique=True)
    value = models.TextField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name}"