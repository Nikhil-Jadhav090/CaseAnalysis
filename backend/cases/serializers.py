from rest_framework import serializers
from .models import Case, Document, Analysis, Comment

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ('id', 'file', 'uploaded_by', 'uploaded_at', 'description')
        read_only_fields = ('uploaded_by', 'uploaded_at')

class AnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Analysis
        fields = ('keywords', 'sentiment', 'category_confidence', 'summary', 'analyzed_at')
        read_only_fields = ('analyzed_at',)

class CommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = Comment
        fields = ('id', 'content', 'user', 'user_name', 'created_at', 'updated_at')
        read_only_fields = ('user', 'created_at', 'updated_at')

class CaseSerializer(serializers.ModelSerializer):
    documents = DocumentSerializer(many=True, read_only=True)
    analysis = AnalysisSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)

    class Meta:
        model = Case
        fields = (
            'id', 'case_id', 'title', 'description', 'category', 'status',
            'priority', 'severity', 'deadline', 'location', 'involved_parties',
            'estimated_value', 'incident_date', 'confidential', 'tags',
            'created_by', 'created_by_name', 'assigned_to', 'assigned_to_name',
            'created_at', 'updated_at', 'closed_at', 'documents', 'analysis', 'comments',
            # Expose inline analysis fields stored on the case
            'analysis_keywords', 'analysis_sentiment', 'analysis_category_confidence', 'analysis_summary',
            'analysis_country', 'analysis_state', 'analysis_city', 'analysis_pincode',
            'analysis_language', 'analysis_legal_sections', 'analysis_sanction_recommendations',
            'analysis_filing_viability', 'analysis_filing_authorities',
            'analysis_next_steps', 'analysis_evidence_priority', 'analysis_timeline_estimate', 'analyzed_at',
            # Robbery / prior extended fields
            'victim_info', 'suspect_info', 'incident_sequence', 'stolen_items', 'evidence_collected',
            'witnesses_info', 'medical_info', 'apprehension_info', 'follow_up_actions',
            # New police intake fields
            'fir_number', 'case_type', 'reporting_datetime', 'place_occurrence', 'area_street', 'city_district',
            'police_station_jurisdiction', 'gps_coordinates', 'complainant_info', 'victim_details', 'accused_details',
            'motive', 'evidence_catalog', 'officer_info', 'seized_items', 'remarks_notes'
        )
        read_only_fields = ('case_id', 'created_by', 'created_at', 'updated_at', 'closed_at')

    # Allow front-end to set the new structured robbery fields
    def to_internal_value(self, data):
        obj = super().to_internal_value(data)
        # accept victim_info etc. as provided (no deep validation here)
        for key in (
            'victim_info','suspect_info','incident_sequence','stolen_items','evidence_collected','witnesses_info','medical_info','apprehension_info','follow_up_actions',
            'fir_number','case_type','reporting_datetime','place_occurrence','area_street','city_district','police_station_jurisdiction','gps_coordinates','complainant_info','victim_details','accused_details','motive','evidence_catalog','officer_info','seized_items','remarks_notes'
        ):
            if key in data:
                obj[key] = data.get(key)
        return obj