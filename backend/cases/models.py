from django.db import models
from django.conf import settings

class Case(models.Model):
    class Status(models.TextChoices):
        OPEN = 'open', 'Open'
        IN_PROGRESS = 'in_progress', 'In Progress'
        CLOSED = 'closed', 'Closed'

    class Category(models.TextChoices):
        GENERAL = 'general', 'General'
        FRAUD = 'fraud', 'Fraud'
        SECURITY = 'security', 'Security'
        COMPLIANCE = 'compliance', 'Compliance'
        FINANCIAL = 'financial', 'Financial'
        CYBERCRIME = 'cybercrime', 'Cybercrime'
        IDENTITY_THEFT = 'identity_theft', 'Identity Theft'
        INTELLECTUAL_PROPERTY = 'intellectual_property', 'Intellectual Property'
        CORRUPTION = 'corruption', 'Corruption'
        MONEY_LAUNDERING = 'money_laundering', 'Money Laundering'
        DATA_BREACH = 'data_breach', 'Data Breach'
        REGULATORY = 'regulatory', 'Regulatory'

    class Priority(models.TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'
        CRITICAL = 'critical', 'Critical'

    class Severity(models.TextChoices):
        MINOR = 'minor', 'Minor'
        MODERATE = 'moderate', 'Moderate'
        MAJOR = 'major', 'Major'
        SEVERE = 'severe', 'Severe'

    # Case identification
    case_id = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=Category.choices, default=Category.GENERAL)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    
    # Case classification
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    severity = models.CharField(max_length=20, choices=Severity.choices, default=Severity.MODERATE)
    
    # Temporal information
    incident_date = models.DateField(null=True, blank=True)
    incident_time = models.TimeField(null=True, blank=True)
    discovery_date = models.DateField(null=True, blank=True)
    deadline = models.DateField(null=True, blank=True)
    estimated_duration = models.DurationField(null=True, blank=True)
    
    # Location information
    location = models.CharField(max_length=200, blank=True)
    jurisdiction = models.CharField(max_length=100, blank=True)
    geo_location = models.CharField(max_length=100, blank=True)  # For latitude/longitude
    
    # Financial information
    estimated_value = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    recovery_amount = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    insurance_reference = models.CharField(max_length=100, blank=True)
    budget_allocated = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    
    # Parties and relationships
    involved_parties = models.TextField(blank=True)
    witnesses = models.TextField(blank=True)
    related_cases = models.ManyToManyField('self', blank=True, symmetrical=False)
    external_references = models.JSONField(default=list)  # For external case references
    
    # Risk and compliance
    risk_level = models.CharField(max_length=20, default='medium')
    compliance_requirements = models.TextField(blank=True)
    legal_holds = models.BooleanField(default=False)
    statute_limitations = models.DateField(null=True, blank=True)
    
    # Security and privacy
    confidential = models.BooleanField(default=False)
    security_level = models.CharField(max_length=20, default='standard')
    data_privacy_impact = models.TextField(blank=True)
    encryption_required = models.BooleanField(default=False)
    
    # Investigation details
    investigation_methods = models.JSONField(default=list)
    evidence_list = models.JSONField(default=list)
    chain_of_custody = models.JSONField(default=list)
    interview_notes = models.TextField(blank=True)
    # Robbery / incident specific structured capture
    victim_info = models.JSONField(default=dict, blank=True)
    suspect_info = models.JSONField(default=dict, blank=True)
    incident_sequence = models.TextField(blank=True)
    stolen_items = models.JSONField(default=list, blank=True)
    evidence_collected = models.JSONField(default=dict, blank=True)
    witnesses_info = models.JSONField(default=list, blank=True)
    medical_info = models.JSONField(default=dict, blank=True)
    apprehension_info = models.JSONField(default=dict, blank=True)
    follow_up_actions = models.JSONField(default=list, blank=True)

    # Extended police case intake fields
    fir_number = models.CharField(max_length=100, blank=True)
    case_type = models.CharField(max_length=100, blank=True)  # Theft, Assault, Cyber Crime, etc.
    reporting_datetime = models.DateTimeField(null=True, blank=True)
    place_occurrence = models.CharField(max_length=200, blank=True)
    area_street = models.CharField(max_length=200, blank=True)
    city_district = models.CharField(max_length=150, blank=True)
    police_station_jurisdiction = models.CharField(max_length=150, blank=True)
    gps_coordinates = models.CharField(max_length=100, blank=True)  # Lat,long optional
    complainant_info = models.JSONField(default=dict, blank=True)  # {name, age, gender, address, contact, id_proof, relation_with_victim}
    victim_details = models.JSONField(default=dict, blank=True)    # Separate from victim_info for structured intake
    accused_details = models.JSONField(default=dict, blank=True)   # {known_status, name_alias, age_gender, address, description}
    motive = models.TextField(blank=True)
    evidence_catalog = models.JSONField(default=dict, blank=True)  # {cctv:[], photos:[], videos:[], audio:[], documents:[], forensic_reports:[]}
    officer_info = models.JSONField(default=dict, blank=True)      # {officer_name, badge_number, station_name, assigned_to}
    seized_items = models.JSONField(default=list, blank=True)
    remarks_notes = models.TextField(blank=True)
    
    # Analysis and metrics
    root_cause = models.TextField(blank=True)
    impact_analysis = models.TextField(blank=True)
    success_metrics = models.JSONField(default=dict)
    lessons_learned = models.TextField(blank=True)
    
    # Communication and workflow
    escalation_level = models.CharField(max_length=20, default='normal')
    notification_list = models.JSONField(default=list)  # List of people to notify
    communication_log = models.JSONField(default=list)
    next_review_date = models.DateField(null=True, blank=True)
    
    # Categorization and organization
    tags = models.JSONField(default=list)
    custom_fields = models.JSONField(default=dict)  # For dynamic additional fields
    department = models.CharField(max_length=100, blank=True)
    business_unit = models.CharField(max_length=100, blank=True)
    
    # Quality control
    quality_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    peer_review_status = models.CharField(max_length=20, default='pending')
    review_notes = models.TextField(blank=True)
    last_qa_date = models.DateField(null=True, blank=True)

    # AI Analysis results stored directly on the case
    analysis_keywords = models.JSONField(default=list)
    analysis_sentiment = models.FloatField(null=True, blank=True)
    analysis_category_confidence = models.JSONField(default=dict)
    analysis_summary = models.TextField(blank=True)
    analysis_country = models.CharField(max_length=100, blank=True)
    analysis_state = models.CharField(max_length=100, blank=True)
    analysis_city = models.CharField(max_length=100, blank=True)
    analysis_pincode = models.CharField(max_length=20, blank=True)
    # New extended analysis attributes
    analysis_language = models.CharField(max_length=50, blank=True)
    analysis_legal_sections = models.JSONField(default=list)
    analysis_sanction_recommendations = models.JSONField(default=list)
    analysis_filing_viability = models.JSONField(default=dict)
    analysis_filing_authorities = models.JSONField(default=list)
    analysis_next_steps = models.JSONField(default=list)  # Ordered actionable steps
    analysis_evidence_priority = models.JSONField(default=list)  # Evidence items ranked
    analysis_timeline_estimate = models.CharField(max_length=200, blank=True)  # Indicative timeline summary
    analyzed_at = models.DateTimeField(null=True, blank=True)
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='cases_created'
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cases_assigned'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.case_id} - {self.title}"

class Document(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='documents')
    file = models.FileField(upload_to='case_documents/%Y/%m/')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    description = models.CharField(max_length=200, blank=True)

class Analysis(models.Model):
    case = models.OneToOneField(Case, on_delete=models.CASCADE, related_name='analysis')
    keywords = models.JSONField(default=list)
    sentiment = models.FloatField(null=True)
    category_confidence = models.JSONField(default=dict)
    summary = models.TextField()
    analyzed_at = models.DateTimeField(auto_now=True)

class Comment(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']