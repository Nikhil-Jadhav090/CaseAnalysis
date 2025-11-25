from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.conf import settings
import json
from .models import Case, Document, Analysis, Comment
from .serializers import CaseSerializer, DocumentSerializer, CommentSerializer
from django.utils.module_loading import import_string
from django.db import transaction
import threading

# Optional import of IntegrationSetting (DB-stored config) without hard failure
try:
    from chat.models import IntegrationSetting
except Exception:  # pragma: no cover - optional dependency during migrations
    IntegrationSetting = None

class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj.created_by == request.user

class CaseViewSet(viewsets.ModelViewSet):
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        queryset = Case.objects.all()
        if not self.request.user.is_staff:
            queryset = queryset.filter(created_by=self.request.user)
        
        status = self.request.query_params.get('status', None)
        category = self.request.query_params.get('category', None)
        case_id = self.request.query_params.get('case_id', None)
        
        if status:
            queryset = queryset.filter(status=status)
        if category:
            queryset = queryset.filter(category=category)
        if case_id:
            queryset = queryset.filter(case_id__iexact=case_id)
            
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        # Generate case ID
        import uuid
        case_id = f"CASE-{uuid.uuid4().hex[:8].upper()}"
        case = serializer.save(created_by=self.request.user, case_id=case_id)

        # Auto-analyze asynchronously to avoid blocking create response
        country = (self.request.data.get('country') or '').strip()
        state = (self.request.data.get('state') or '').strip()
        city = (self.request.data.get('city') or '').strip()
        pincode = (self.request.data.get('pincode') or '').strip()

        def do_background_analysis(case_pk, country, state, city, pincode):
            from django.db import close_old_connections
            close_old_connections()
            try:
                c = Case.objects.get(pk=case_pk)
                analysis_data = self._generate_analysis(
                    title=c.title,
                    accused_name='',
                    description=c.description,
                    country=country,
                    state=state,
                    city=city,
                    pincode=pincode,
                    files_summary=[],
                )
                if isinstance(analysis_data, dict) and not (
                    'error' in analysis_data and 'raw' not in analysis_data and analysis_data['error'] == 'Gemini API key not configured'
                ):
                    self._apply_analysis_to_case(c, analysis_data if isinstance(analysis_data, dict) else {})
                    if 'keywords' in analysis_data:
                        Analysis.objects.update_or_create(
                            case=c,
                            defaults={
                                'keywords': analysis_data.get('keywords', []),
                                'sentiment': analysis_data.get('sentiment'),
                                'category_confidence': analysis_data.get('category_confidence', {}),
                                'summary': analysis_data.get('summary', '')
                            }
                        )
            except Exception:
                pass
            finally:
                close_old_connections()

        def schedule():
            t = threading.Thread(target=do_background_analysis, args=(case.pk, country, state, city, pincode), daemon=True)
            t.start()

        transaction.on_commit(schedule)

    # -------- Helper methods for analysis (generation, normalization, persistence) --------
    def _normalize_analysis(self, analysis_data, country, state, city, pincode):
        if analysis_data is None:
            return {'raw': '', 'error': 'No analysis data'}

        if isinstance(analysis_data, dict) and 'raw' not in analysis_data:
            analysis_data.setdefault('country', country)
            analysis_data.setdefault('state', state)
            analysis_data.setdefault('city', city)
            analysis_data.setdefault('pincode', pincode)
            analysis_data.setdefault('language', '')
            analysis_data.setdefault('keywords', [])
            # Coerce sentiment to float within [-1, 1]
            try:
                s = float(analysis_data.get('sentiment', 0))
                analysis_data['sentiment'] = max(-1.0, min(1.0, s))
            except Exception:
                analysis_data['sentiment'] = 0.0
            cc = analysis_data.get('category_confidence') or {}
            for k in ['general', 'fraud', 'security', 'compliance', 'financial']:
                try:
                    v = float(cc.get(k, 0))
                except Exception:
                    v = 0.0
                cc[k] = max(0.0, min(1.0, v))
            analysis_data['category_confidence'] = cc
            analysis_data.setdefault('summary', '')
            # Legal sections - ensure list of objects
            ls = analysis_data.get('legal_sections') or []
            if not isinstance(ls, list):
                ls = []
            norm_ls = []
            for item in ls:
                if isinstance(item, dict):
                    norm_ls.append({
                        'section': str(item.get('section', '')),
                        'description': str(item.get('description', '')),
                        'citation': str(item.get('citation', '')) if item.get('citation') is not None else ''
                    })
                else:
                    norm_ls.append({'section': str(item), 'description': '', 'citation': ''})
            analysis_data['legal_sections'] = norm_ls
            # Sanctions - ensure list with clamped confidence
            sanc = analysis_data.get('sanction_recommendations') or []
            if not isinstance(sanc, list):
                sanc = []
            norm_sanc = []
            for item in sanc:
                if isinstance(item, dict):
                    try:
                        conf = float(item.get('confidence', 0))
                    except Exception:
                        conf = 0.0
                    norm_sanc.append({
                        'code': str(item.get('code', '')),
                        'name': str(item.get('name', '')),
                        'description': str(item.get('description', '')),
                        'confidence': max(0.0, min(1.0, conf))
                    })
            analysis_data['sanction_recommendations'] = norm_sanc
            # Filing viability
            fv = analysis_data.get('filing_viability') or {}
            analysis_data['filing_viability'] = {
                'viable': bool(fv.get('viable', False)),
                'rationale': str(fv.get('rationale', '')),
                'missing_evidence': fv.get('missing_evidence', []) if isinstance(fv.get('missing_evidence', []), list) else [],
                'recommended_actions': fv.get('recommended_actions', []) if isinstance(fv.get('recommended_actions', []), list) else []
            }
            # Filing authorities - normalize list structure
            fa = analysis_data.get('filing_authorities') or []
            if not isinstance(fa, list):
                fa = []
            norm_fa = []
            for item in fa:
                if isinstance(item, dict):
                    nums = item.get('phone_numbers', [])
                    if not isinstance(nums, list):
                        nums = [str(nums)] if nums else []
                    nums = [str(n) for n in nums]
                    norm_fa.append({
                        'authority_type': str(item.get('authority_type', '')),
                        'name': str(item.get('name', '')),
                        'address': str(item.get('address', '')),
                        'phone_numbers': nums,
                        'online_portal': str(item.get('online_portal', '')),
                        'jurisdiction': str(item.get('jurisdiction', '')),
                        'how_to_file': str(item.get('how_to_file', '')),
                        'notes': str(item.get('notes', '')),
                    })
            analysis_data['filing_authorities'] = norm_fa
            # Future-oriented fields
            ns = analysis_data.get('next_steps') or []
            if not isinstance(ns, list):
                ns = []
            analysis_data['next_steps'] = [str(x) for x in ns][:15]
            ep = analysis_data.get('evidence_priority') or []
            if not isinstance(ep, list):
                ep = []
            # Expect items either strings or dicts {item, rationale}
            norm_ep = []
            for item in ep:
                if isinstance(item, dict):
                    norm_ep.append({
                        'item': str(item.get('item', '')),
                        'rationale': str(item.get('rationale', '')),
                        'priority': str(item.get('priority', '')),
                    })
                else:
                    norm_ep.append({'item': str(item), 'rationale': '', 'priority': ''})
            analysis_data['evidence_priority'] = norm_ep[:20]
            analysis_data['timeline_estimate'] = str(analysis_data.get('timeline_estimate', ''))[:200]
        return analysis_data

    def _apply_analysis_to_case(self, case, analysis_data):
        if not isinstance(analysis_data, dict):
            return
        case.analysis_country = str(analysis_data.get('country', '') or '')
        case.analysis_state = str(analysis_data.get('state', '') or '')
        case.analysis_city = str(analysis_data.get('city', '') or '')
        case.analysis_pincode = str(analysis_data.get('pincode', '') or '')
        case.analysis_language = str(analysis_data.get('language', '') or '')
        case.analysis_keywords = analysis_data.get('keywords', []) or []
        case.analysis_sentiment = analysis_data.get('sentiment', 0.0)
        case.analysis_category_confidence = analysis_data.get('category_confidence', {}) or {}
        case.analysis_summary = analysis_data.get('summary', '') or ''
        case.analysis_legal_sections = analysis_data.get('legal_sections', []) or []
        case.analysis_sanction_recommendations = analysis_data.get('sanction_recommendations', []) or []
        case.analysis_filing_viability = analysis_data.get('filing_viability', {}) or {}
        case.analysis_filing_authorities = analysis_data.get('filing_authorities', []) or []
        case.analysis_next_steps = analysis_data.get('next_steps', []) or []
        case.analysis_evidence_priority = analysis_data.get('evidence_priority', []) or []
        case.analysis_timeline_estimate = analysis_data.get('timeline_estimate', '') or ''
        case.analyzed_at = timezone.now()
        case.save(update_fields=[
            'analysis_country', 'analysis_state', 'analysis_city', 'analysis_pincode',
            'analysis_language', 'analysis_keywords', 'analysis_sentiment', 'analysis_category_confidence', 'analysis_summary',
            'analysis_legal_sections', 'analysis_sanction_recommendations', 'analysis_filing_viability',
            'analysis_filing_authorities', 'analysis_next_steps', 'analysis_evidence_priority', 'analysis_timeline_estimate', 'analyzed_at', 'updated_at'
        ])

    def _get_gemini_api_key(self):
        try:
            if IntegrationSetting is not None:
                s = IntegrationSetting.objects.filter(name='GEMINI_API_KEY').first()
                if s and s.value:
                    return s.value
        except Exception:
            pass
        return getattr(settings, 'GEMINI_API_KEY', None)

    def _generate_analysis(self, title, accused_name, description, country, state, city, pincode, files_summary, language, enforce_india=True):
        # Lazy import Gemini client and fallback if missing
        try:
            import google.generativeai as genai
            has_gemini = True
        except Exception:
            has_gemini = False

        # Fallback builder (also used for rate limits and other AI errors)
        def build_fallback(reason: str):
            import re
            from collections import Counter

            def top_keywords(text, n=7):
                words = re.findall(r"[A-Za-z]{4,}", text or '')
                common = [w.lower() for w in words]
                counts = Counter(common)
                return [w for w, _ in counts.most_common(n)]

            base_text = f"{title} {description}"
            kws = top_keywords(base_text)
            summary = (description[:280] + '…') if len(description or '') > 280 else (description or '')
            analysis_data = {
                'country': country,
                'state': state,
                'city': city,
                'pincode': pincode,
                'language': language,
                'keywords': kws,
                'sentiment': 0.0,
                'category_confidence': {
                    'general': 0.6 if description else 0.0,
                    'fraud': 0.2,
                    'security': 0.1,
                    'compliance': 0.1,
                    'financial': 0.2,
                },
                'summary': summary or 'No description provided.',
                'legal_sections': [],
                'sanction_recommendations': [],
                'filing_viability': {
                    'viable': False,
                    'rationale': f'Fallback used ({reason}). Provide more evidence and retry once AI availability improves.',
                    'missing_evidence': ['supporting documents', 'witness statements'],
                    'recommended_actions': ['compile documents', 'note chronology of events']
                },
                'filing_authorities': [],
                'next_steps': ['Gather all available evidence', 'Prepare a chronological event log', 'Consult legal counsel for refinement'],
                'evidence_priority': [
                    {'item': 'Primary digital evidence', 'rationale': 'Directly supports core allegation', 'priority': 'high'},
                    {'item': 'Witness statements', 'rationale': 'Corroborates incident timeline', 'priority': 'medium'}
                ],
                'timeline_estimate': 'Initial preparation 1-2 weeks; filing thereafter'
            }
            if (country or '').strip().lower() == 'india':
                analysis_data['legal_sections'] = [
                    {'section': 'IT Act, 2000', 'description': 'General provisions related to cyber offences', 'citation': ''}
                ]
                analysis_data['filing_authorities'] = [
                    {
                        'authority_type': 'Cyber Crime Portal',
                        'name': 'National Cyber Crime Reporting Portal',
                        'address': '',
                        'phone_numbers': ['1930', '112'],
                        'online_portal': 'https://cybercrime.gov.in',
                        'jurisdiction': 'Pan-India',
                        'how_to_file': 'File a complaint on the portal; attach evidence.',
                        'notes': 'Fallback data shown while AI is unavailable.'
                    }
                ]
            # Include a hint about fallback reason without breaking existing UI
            analysis_data['fallback_reason'] = reason
            return self._normalize_analysis(analysis_data, country, state, city, pincode)

        if not has_gemini:
            return build_fallback('no_ai_module')

        # Resolve API key
        api_key = self._get_gemini_api_key()
        if not api_key:
            return {'error': 'Gemini API key not configured'}

        # Configure Gemini
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash')

        # Build case text
        case_text = f"""
        Title: {title}
        Description: {description}
        Country/Jurisdiction: {country or 'Not specified'}
        State/Region: {state or 'Not specified'}
        City: {city or 'Not specified'}
        PIN/Postal Code: {pincode or 'Not specified'}
        """
        if accused_name:
            case_text += f"\nAccused: {accused_name}"

        files_context = "\n".join(files_summary) if files_summary else "No files attached"

        # Enforce India-only analysis if requested
        if enforce_india and (country or '').strip().lower() != 'india':
            return {'error': 'Only India jurisdiction supported for AI analysis currently.'}

        prompt = f"""
        You are an expert legal advocate and case advisor specializing in Indian law (IPC, CrPC, IT Act, POCSO, SC/ST Act, DV Act, etc.). `n`n COMPREHENSIVE CASE ANALYSIS REPORT - Provide detailed guidance on ALL these aspects:`n`n1 JUSTICE: Case validity, cognizable offense?, legal remedy, expected outcome, victim rights`n2 POLICE ACTION: Jurisdiction, FIR vs NCR, what to tell police, police obligations, if refused`n3 FIR FILING: Can file?, sections apply, where/how/when to file, sample draft`n4 PROTECTION: Safety steps, legal protection, court orders, emergency contacts`n5 LEGAL GUIDANCE: Applicable laws, procedure flow, rights, do/donts, lawyer timing`n6 COMPENSATION: Schemes CrPC 357A, application process, amount, timeline`n7 CASE STRENGTH: Current strength, evidence priority, missing evidence`n`nAnalysis Requirements (All in {language or 'English'}):
        1) Extract top 5-7 keywords relevant to the legal case
        2) Provide sentiment score in [-1.0, 1.0] (severity assessment)
        3) Category confidence for: general, fraud, security, compliance, financial (values in [0,1])
        4) Write a clear 2-3 sentence summary as an advocate would present it
        5) Legal sections (statutes/acts) applicable in the given country relevant to the facts
          6) Sanction recommendations (section/code, description, confidence) based on the country’s legal framework
          7) Filing viability assessment: whether evidence is sufficient to file a case now; list missing evidence if any; and recommended next actions
          8) Filing authorities for the specified location (where to file). If country is India, include appropriate authority with helpline and official portal:
              - Police Station (local jurisdiction)
              - State Cyber Crime Cell and the national portal https://cybercrime.gov.in
              - Emergency helpline 112; financial cyber fraud helpline 1930
              For other countries, provide equivalent authorities and official portals. Do NOT fabricate specific addresses. If exact address is unknown, leave it blank and provide steps to find the nearest office.
                    9) Provide an ordered list of 5-10 next_steps (concise actionable directives) each in target language.
                    10) Provide evidence_priority list (each item with item, rationale, priority high|medium|low).
                    11) Provide a concise timeline_estimate string describing expected phases (investigation, filing, preliminary hearing) with rough durations.

        Case Details:
        {case_text}

        Files Provided:
        {files_context}

        Strict JSON output only (no markdown, no comments). Use this schema:
        {{
            "country": "{country}",
            "state": "{state}",
            "city": "{city}",
            "pincode": "{pincode}",
            "language": "{language}",
            "keywords": ["keyword1", "keyword2", "keyword3"],
            "sentiment": 0.0,
            "category_confidence": {{
                "general": 0.0,
                "fraud": 0.0,
                "security": 0.0,
                "compliance": 0.0,
                "financial": 0.0
            }},
            "summary": "Clear incident summary as an advocate would present it",
            "legal_sections": [
                {{ "section": "Act/Code §number", "description": "what it covers and why it applies", "citation": "if applicable" }}
            ],
            "sanction_recommendations": [
                {{ "code": "section or charge code", "name": "offence name", "description": "why this charge applies", "confidence": 0.0 }}
            ],
            "filing_viability": {{
                "viable": false,
                "rationale": "advocate's assessment of case strength",
                "missing_evidence": ["specific document A", "witness statement B", "digital evidence C"],
                "recommended_actions": ["File FIR at local police station within 24 hours", "Preserve all digital evidence immediately", "Get medical examination if applicable", "Notify bank/financial institution", "Document all losses with receipts"]
            }},
            "filing_authorities": [
                {{
                    "authority_type": "Police Station | Cyber Crime Cell | Magistrate Court | Other",
                    "name": "official name if known",
                    "address": "leave blank if unknown",
                    "phone_numbers": ["112", "1930"],
                    "online_portal": "https://...",
                    "jurisdiction": "area covered",
                    "how_to_file": "steps to file",
                    "notes": "caveats"
                }}
            ],
            "next_steps": ["Action step 1", "Action step 2"],
            "evidence_priority": [{{"item": "Evidence item", "rationale": "Why important", "priority": "high"}}],
            "timeline_estimate": "Investigation 2 weeks; filing 1 week; preliminary hearing 1-2 months"
        }}
        """

        try:
            response = model.generate_content(prompt)
            response_text = getattr(response, 'text', None) or str(response)
            response_text = response_text.strip()
        except Exception as e:
            msg = str(e) if e else ''
            if '429' in msg or 'Resource exhausted' in msg or 'rate' in msg.lower() or 'quota' in msg.lower():
                return build_fallback('rate_limited')
            # Network or API errors: graceful fallback as well
            return build_fallback('ai_error')
        if response_text.startswith('```json'):
            response_text = response_text[len('```json'):]
        if response_text.startswith('```'):
            response_text = response_text[len('```'):]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        response_text = response_text.strip()

        analysis_data = None
        try:
            analysis_data = json.loads(response_text)
        except Exception:
            try:
                start = response_text.find('{')
                end = response_text.rfind('}')
                if start != -1 and end != -1 and end > start:
                    analysis_data = json.loads(response_text[start:end+1])
            except Exception:
                pass
        if analysis_data is None:
            analysis_data = {'raw': response_text, 'error': 'Response was not structured JSON'}
        return self._normalize_analysis(analysis_data, country, state, city, pincode)

    @action(detail=True, methods=['post'])
    def upload_document(self, request, pk=None):
        case = self.get_object()
        serializer = DocumentSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(case=case, uploaded_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        case = self.get_object()
        serializer = CommentSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(case=case, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def analyze(self, request, pk=None):
        case = self.get_object()
        # Optional location hints for richer analysis
        country = request.data.get('country', '').strip()
        state = request.data.get('state', '').strip()
        city = request.data.get('city', '').strip()
        pincode = request.data.get('pincode', '').strip()

        # Include existing case documents as context (names only)
        files_summary = [f"Case document: {d.file.name}" for d in case.documents.all()]

        language = request.data.get('language', 'English').strip()
        # Indian states list for validation
        indian_states = {
            'andhra pradesh','arunachal pradesh','assam','bihar','chhattisgarh','goa','gujarat','haryana','himachal pradesh','jharkhand','karnataka','kerala','madhya pradesh','maharashtra','manipur','meghalaya','mizoram','nagaland','odisha','punjab','rajasthan','sikkim','tamil nadu','telangana','tripura','uttar pradesh','uttarakhand','west bengal','andaman and nicobar islands','chandigarh','dadra and nagar haveli and daman and diu','delhi','jammu and kashmir','ladakh','lakshadweep','puducherry'
        }
        if state and state.lower() not in indian_states:
            return Response({'error': 'Invalid Indian state provided.'}, status=status.HTTP_400_BAD_REQUEST)
        allowed_languages = {'English','Hindi','Bengali','Tamil','Telugu','Marathi','Gujarati','Kannada','Malayalam','Punjabi'}
        if language not in allowed_languages:
            return Response({'error': 'Unsupported language. Choose from: ' + ', '.join(sorted(allowed_languages))}, status=status.HTTP_400_BAD_REQUEST)
        # Force country to India for now
        country = 'India'

        analysis_data = self._generate_analysis(
            title=case.title,
            accused_name='',
            description=case.description,
            country=country,
            state=state,
            city=city,
            pincode=pincode,
            files_summary=files_summary,
            language=language,
            enforce_india=True,
        )

        if isinstance(analysis_data, dict) and 'error' in analysis_data and 'raw' not in analysis_data and analysis_data['error'] == 'Gemini API key not configured':
            return Response(analysis_data, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        # Persist to Case
        self._apply_analysis_to_case(case, analysis_data if isinstance(analysis_data, dict) else {})

        # Also sync legacy Analysis one-to-one for backward compatibility if simple fields present
        if isinstance(analysis_data, dict) and 'keywords' in analysis_data:
            Analysis.objects.update_or_create(
                case=case,
                defaults={
                    'keywords': analysis_data.get('keywords', []),
                    'sentiment': analysis_data.get('sentiment'),
                    'category_confidence': analysis_data.get('category_confidence', {}),
                    'summary': analysis_data.get('summary', '')
                }
            )

        # Return the updated case payload
        return Response(self.get_serializer(case).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        case = self.get_object()
        case.status = Case.Status.CLOSED
        case.closed_at = timezone.now()
        case.save()
        
        serializer = self.get_serializer(case)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        """Admin-only: mark an OPEN case as IN_PROGRESS (approved)."""
        case = self.get_object()
        if case.status == Case.Status.OPEN:
            case.status = Case.Status.IN_PROGRESS
            case.save(update_fields=['status', 'updated_at'])
        # Log activity
        try:
            from users.models import ActivityLog
            ActivityLog.objects.create(
                actor=request.user,
                action='case_approved',
                target_type='case',
                target_id=str(case.pk),
                meta={'case_id': case.case_id, 'status': case.status}
            )
        except Exception:
            pass
        return Response(self.get_serializer(case).data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        case = self.get_object()
        response = super().destroy(request, *args, **kwargs)
        try:
            from users.models import ActivityLog
            ActivityLog.objects.create(
                actor=request.user,
                action='case_deleted',
                target_type='case',
                target_id=str(case.pk),
                meta={'case_id': case.case_id}
            )
        except Exception:
            pass
        return response

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def analyze_upload(self, request):
        """
        Custom endpoint: POST /api/cases/analyze_upload/
        Accepts: title, accused_name, description, evidence_files, audio_files
        Returns: AI analysis with keywords, sentiment, category_confidence, summary
        Allows anonymous (unauthenticated) access for case analysis
        """
        # Extract form data
        title = request.data.get('title', '').strip()
        accused_name = request.data.get('accused_name', '').strip()
        description = request.data.get('description', '').strip()
        country = request.data.get('country', '').strip()
        state = request.data.get('state', '').strip()
        city = request.data.get('city', '').strip()
        pincode = request.data.get('pincode', '').strip()

        if not title:
            return Response({'error': 'Case title is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not description:
            return Response({'error': 'Case description is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Files context summary
        files_summary = []
        if 'evidence_files' in request.FILES:
            for file in request.FILES.getlist('evidence_files'):
                files_summary.append(f"Evidence file: {file.name}")
        if 'audio_files' in request.FILES:
            for file in request.FILES.getlist('audio_files'):
                files_summary.append(f"Audio file: {file.name}")

        # Generate analysis (Gemini or fallback) and return normalized data
        language = request.data.get('language', 'English').strip()
        country = 'India'  # Force India for this public endpoint variant as per requirement
        state = request.data.get('state', '').strip()
        # Validation similar to detail analyze
        indian_states = {
            'andhra pradesh','arunachal pradesh','assam','bihar','chhattisgarh','goa','gujarat','haryana','himachal pradesh','jharkhand','karnataka','kerala','madhya pradesh','maharashtra','manipur','meghalaya','mizoram','nagaland','odisha','punjab','rajasthan','sikkim','tamil nadu','telangana','tripura','uttar pradesh','uttarakhand','west bengal','andaman and nicobar islands','chandigarh','dadra and nagar haveli and daman and diu','delhi','jammu and kashmir','ladakh','lakshadweep','puducherry'
        }
        if state and state.lower() not in indian_states:
            return Response({'error': 'Invalid Indian state provided.'}, status=status.HTTP_400_BAD_REQUEST)
        allowed_languages = {'English','Hindi','Bengali','Tamil','Telugu','Marathi','Gujarati','Kannada','Malayalam','Punjabi'}
        if language not in allowed_languages:
            return Response({'error': 'Unsupported language. Choose from: ' + ', '.join(sorted(allowed_languages))}, status=status.HTTP_400_BAD_REQUEST)

        analysis_data = self._generate_analysis(
            title=title,
            accused_name=accused_name,
            description=description,
            country=country,
            state=state,
            city=city,
            pincode=pincode,
            files_summary=files_summary,
            language=language,
            enforce_india=True,
        )

        if isinstance(analysis_data, dict) and 'error' in analysis_data and 'raw' not in analysis_data and analysis_data['error'] == 'Gemini API key not configured':
            return Response(analysis_data, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        return Response(analysis_data, status=status.HTTP_200_OK)
        
        # Note: This endpoint only returns analysis; it does not persist to a Case.
        # Use the detail action `analyze` to run and save analysis onto a specific Case.
