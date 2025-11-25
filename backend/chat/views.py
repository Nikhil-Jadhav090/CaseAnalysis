from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from django.conf import settings
from .models import ChatSession, ChatMessage, ChatAttachment, IntegrationSetting
from .serializers import ChatSessionSerializer, ChatMessageSerializer, IntegrationSettingSerializer
import json

class ChatSessionListCreate(generics.ListCreateAPIView):
    serializer_class = ChatSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ChatSessionDetail(generics.RetrieveAPIView):
    serializer_class = ChatSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)

class ChatMessageCreate(generics.CreateAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        try:
            session = ChatSession.objects.get(
                id=self.kwargs['session_id'],
                user=request.user
            )
        except ChatSession.DoesNotExist:
            return Response(
                {"error": "Chat session not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Save user message
        user_message = ChatMessage.objects.create(
            session=session,
            is_user=True,
            content=request.data.get('content', '')
        )

        # Save attachments (evidence files, audio, accused info, etc.)
        attachments_summary = []
        
        # Handle accused info
        if 'accused' in request.data and request.data['accused']:
            ChatAttachment.objects.create(
                message=user_message,
                attachment_type='accused',
                text_content=request.data['accused']
            )
            attachments_summary.append(f"Accused: {request.data['accused']}")

        # Handle file uploads (evidence, audio)
        if 'evidence_files' in request.FILES:
            for file in request.FILES.getlist('evidence_files'):
                ChatAttachment.objects.create(
                    message=user_message,
                    attachment_type='evidence',
                    file=file
                )
                attachments_summary.append(f"Evidence file: {file.name}")

        if 'audio_files' in request.FILES:
            for file in request.FILES.getlist('audio_files'):
                ChatAttachment.objects.create(
                    message=user_message,
                    attachment_type='audio',
                    file=file
                )
                attachments_summary.append(f"Audio file: {file.name}")

        # Resolve GEMINI API key: prefer DB stored IntegrationSetting, otherwise fallback to settings
        def get_gemini_api_key():
            try:
                s = IntegrationSetting.objects.filter(name='GEMINI_API_KEY').first()
                if s and s.value:
                    return s.value
            except Exception:
                pass
            return getattr(settings, 'GEMINI_API_KEY', None)

        api_key = get_gemini_api_key()
        if not api_key:
            return Response({'error': 'Gemini API key not configured'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        # Lazy import Gemini client to avoid protobuf import-time errors
        try:
            import google.generativeai as genai
        except Exception as e:
            return Response({'error': 'AI integration not available: %s' % str(e)}, status=status.HTTP_501_NOT_IMPLEMENTED)

        # Configure Gemini
        genai.configure(api_key=api_key)
        # Use a current available model
        model = genai.GenerativeModel('gemini-2.0-flash')

        # Get chat history for context (exclude the message we just saved)
        history_qs = ChatMessage.objects.filter(session=session).order_by('created_at')
        history = history_qs.exclude(id=user_message.id)
        context = "\n".join([
            f"{'User' if msg.is_user else 'Assistant'}: {msg.content}"
            for msg in history
        ])

        # Build attachments context
        attachments_context = "\n".join(attachments_summary) if attachments_summary else ""

        # Prepare prompt with attachments context
        prompt = f"""
        You are an AI assistant for a Case Analysis System specialized in legal case analysis and evidence review.
        Help the user with their query, paying special attention to any evidence or case information provided.
        
        Previous conversation:
        {context}

        Attachments provided:
        {attachments_context if attachments_context else "None"}

        User message: {request.data.get('content', '')}

        Provide a thorough, helpful response. Analyze any evidence provided, consider the accused information,
        and give legal or investigative guidance as appropriate for a case analysis system.
        """

        try:
            response = model.generate_content(prompt)

            # Extract response text (handle SDK variations)
            response_text = getattr(response, 'text', None) or str(response)

            # Strip markdown code fences if present
            response_text = response_text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.startswith('```'):
                response_text = response_text[3:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            response_text = response_text.strip()

            # Save AI reply
            ai_message = ChatMessage.objects.create(session=session, is_user=False, content=response_text)

            return Response({
                "user_message": ChatMessageSerializer(user_message).data,
                "ai_message": ChatMessageSerializer(ai_message).data
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GeminiSettingView(APIView):
    """Admin-only endpoint to get/set the GEMINI API key used by chat/cases."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        setting = IntegrationSetting.objects.filter(name='GEMINI_API_KEY').first()
        ser = IntegrationSettingSerializer(setting) if setting else None
        return Response(ser.data if ser else {'name': 'GEMINI_API_KEY', 'value': ''})

    def post(self, request):
        # Upsert the GEMINI_API_KEY
        value = request.data.get('value')
        if value is None:
            return Response({'error': 'value is required'}, status=status.HTTP_400_BAD_REQUEST)
        setting, _ = IntegrationSetting.objects.update_or_create(name='GEMINI_API_KEY', defaults={'value': value})
        ser = IntegrationSettingSerializer(setting)
        return Response(ser.data)