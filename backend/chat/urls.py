from django.urls import path
from . import views

urlpatterns = [
    path('sessions/', views.ChatSessionListCreate.as_view(), name='chat_sessions'),
    path('sessions/<int:pk>/', views.ChatSessionDetail.as_view(), name='chat_session_detail'),
    path('sessions/<int:session_id>/messages/', views.ChatMessageCreate.as_view(), name='chat_messages'),
    path('settings/gemini/', views.GeminiSettingView.as_view(), name='gemini_setting'),
]