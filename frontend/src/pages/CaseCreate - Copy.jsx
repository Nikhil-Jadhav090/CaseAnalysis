import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

const SEVERITY_LEVELS = {
  MINOR: 'minor',
  MODERATE: 'moderate',
  MAJOR: 'major',
  SEVERE: 'severe'
};

const SECURITY_LEVELS = {
  STANDARD: 'standard',
  CONFIDENTIAL: 'confidential',
  RESTRICTED: 'restricted',
  TOP_SECRET: 'top_secret'
};

const ESCALATION_LEVELS = {
  NORMAL: 'normal',
  ELEVATED: 'elevated',
  URGENT: 'urgent',
  CRITICAL: 'critical'
};

const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

export default function CaseCreate() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(PRIORITY_LEVELS.MEDIUM);
  const [severity, setSeverity] = useState(SEVERITY_LEVELS.MODERATE);
  const [deadline, setDeadline] = useState('');
  const [location, setLocation] = useState('');
  const [involvedParties, setInvolvedParties] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [incidentTime, setIncidentTime] = useState('');
  const [discoveryDate, setDiscoveryDate] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [geoLocation, setGeoLocation] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [recoveryAmount, setRecoveryAmount] = useState('');
  const [insuranceReference, setInsuranceReference] = useState('');
  const [budgetAllocated, setBudgetAllocated] = useState('');
  const [witnesses, setWitnesses] = useState('');
  const [relatedCases, setRelatedCases] = useState([]);
  const [externalReferences, setExternalReferences] = useState([]);
  const [riskLevel, setRiskLevel] = useState(RISK_LEVELS.MEDIUM);
  const [complianceRequirements, setComplianceRequirements] = useState('');
  const [legalHolds, setLegalHolds] = useState(false);
  const [statuteLimitations, setStatuteLimitations] = useState('');
  const [confidentiality, setConfidentiality] = useState(false);
  const [securityLevel, setSecurityLevel] = useState(SECURITY_LEVELS.STANDARD);
  const [dataPrivacyImpact, setDataPrivacyImpact] = useState('');
  const [encryptionRequired, setEncryptionRequired] = useState(false);
  const [investigationMethods, setInvestigationMethods] = useState([]);
  const [evidenceList, setEvidenceList] = useState([]);
  const [chainOfCustody, setChainOfCustody] = useState([]);
  const [interviewNotes, setInterviewNotes] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [impactAnalysis, setImpactAnalysis] = useState('');
  const [successMetrics, setSuccessMetrics] = useState({});
  const [lessonsLearned, setLessonsLearned] = useState('');
  const [escalationLevel, setEscalationLevel] = useState(ESCALATION_LEVELS.NORMAL);
  const [notificationList, setNotificationList] = useState([]);
  const [communicationLog, setCommunicationLog] = useState([]);
  const [nextReviewDate, setNextReviewDate] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [department, setDepartment] = useState('');
  const [businessUnit, setBusinessUnit] = useState('');
  const [customFields, setCustomFields] = useState({});
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleFiles(e) {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => file.size <= 10 * 1024 * 1024);
    if (validFiles.length !== selectedFiles.length) {
      setError('Some files were skipped as they exceed the 10MB limit');
    }
    setFiles(validFiles);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const caseResponse = await axios.post('/api/cases/', {
        title,
        category,
        description,
        priority,
        severity,
        incident_date: incidentDate || null,
        incident_time: incidentTime || null,
        discovery_date: discoveryDate || null,
        deadline: deadline || null,
        estimated_duration: estimatedDuration || null,
        location,
        jurisdiction,
        geo_location: geoLocation,
        estimated_value: estimatedValue || null,
        recovery_amount: recoveryAmount || null,
        insurance_reference: insuranceReference,
        budget_allocated: budgetAllocated || null,
        involved_parties: involvedParties,
        witnesses,
        related_cases: relatedCases,
        external_references: externalReferences,
        risk_level: riskLevel,
        compliance_requirements: complianceRequirements,
        legal_holds: legalHolds,
        statute_limitations: statuteLimitations || null,
        confidential: confidentiality,
        security_level: securityLevel,
        data_privacy_impact: dataPrivacyImpact,
        encryption_required: encryptionRequired,
        investigation_methods: investigationMethods,
        evidence_list: evidenceList,
        chain_of_custody: chainOfCustody,
        interview_notes: interviewNotes,
        root_cause: rootCause,
        impact_analysis: impactAnalysis,
        success_metrics: successMetrics,
        lessons_learned: lessonsLearned,
        escalation_level: escalationLevel,
        notification_list: notificationList,
        communication_log: communicationLog,
        next_review_date: nextReviewDate || null,
        tags,
        department,
        business_unit: businessUnit,
        custom_fields: customFields
      });

      if (files.length > 0) {
        const caseId = caseResponse.data.id;
        const uploads = files.map(file => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('description', `Uploaded during case creation`);
          return axios.post(`/api/cases/${caseId}/upload_document/`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        });

        await Promise.all(uploads);
      }

      navigate(`/cases/${caseResponse.data.case_id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create case. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-10 max-w-3xl animate-fadeIn">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        .animate-slideIn {
          animation: slideIn 0.4s ease-out;
        }
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .input-focus {
          transition: all 0.3s ease;
        }
        .input-focus:focus {
          transform: scale(1.01);
          box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
        }
        .tag-enter {
          animation: slideIn 0.3s ease-out;
        }
        .file-enter {
          animation: fadeIn 0.4s ease-out;
        }
        .button-hover {
          transition: all 0.2s ease;
        }
        .button-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
        }
        .button-hover:active {
          transform: translateY(0);
        }
      `}</style>

      <div className="flex items-center mb-6 animate-slideIn">
        <h2 className="text-2xl font-semibold text-white">Create New Case</h2>
        <div className="ml-4 text-sm text-purple-400 animate-pulse">Auto-generated Case ID will be assigned</div>
      </div>

      <form onSubmit={handleSubmit} className="backdrop-blur-xl bg-white/10 p-8 rounded-lg shadow-lg shadow-black/50 space-y-6 border border-white/20 animate-fadeIn" style={{animationDelay: '0.2s'}}>
        {error && (
          <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded animate-slideIn">
            {error}
          </div>
        )}

        <div className="animate-slideIn" style={{animationDelay: '0.1s'}}>
          <label className="block text-sm font-medium text-gray-200">Title</label>
          <input 
            value={title} 
            onChange={e=>setTitle(e.target.value)} 
            required 
            className="mt-1 block w-full bg-gray-900/50 border border-gray-500 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 input-focus"
            placeholder="Enter case title" 
          />
        </div>

        <div className="animate-slideIn" style={{animationDelay: '0.15s'}}>
          <label className="block text-sm font-medium text-gray-200">Category</label>
          <select 
            value={category} 
            onChange={e=>setCategory(e.target.value)} 
            className="mt-1 block w-full bg-gray-900/50 border border-gray-500 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 input-focus"
          >
            <option value="general">General</option>
            <option value="fraud">Fraud</option>
            <option value="security">Security</option>
            <option value="compliance">Compliance</option>
            <option value="financial">Financial</option>
            <option value="cybercrime">Cybercrime</option>
            <option value="identity_theft">Identity Theft</option>
            <option value="intellectual_property">Intellectual Property</option>
            <option value="corruption">Corruption</option>
            <option value="money_laundering">Money Laundering</option>
            <option value="data_breach">Data Breach</option>
            <option value="regulatory">Regulatory</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slideIn" style={{animationDelay: '0.2s'}}>
          <div>
            <label className="block text-sm font-medium text-gray-200">Priority</label>
            <select 
              value={priority} 
              onChange={e=>setPriority(e.target.value)}
              className="mt-1 block w-full bg-gray-900/50 border border-gray-500 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 input-focus"
            >
              <option value={PRIORITY_LEVELS.LOW}>Low</option>
              <option value={PRIORITY_LEVELS.MEDIUM}>Medium</option>
              <option value={PRIORITY_LEVELS.HIGH}>High</option>
              <option value={PRIORITY_LEVELS.CRITICAL}>Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200">Severity</label>
            <select 
              value={severity} 
              onChange={e=>setSeverity(e.target.value)}
              className="mt-1 block w-full bg-gray-900/50 border border-gray-500 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 input-focus"
            >
              <option value={SEVERITY_LEVELS.MINOR}>Minor</option>
              <option value={SEVERITY_LEVELS.MODERATE}>Moderate</option>
              <option value={SEVERITY_LEVELS.MAJOR}>Major</option>
              <option value={SEVERITY_LEVELS.SEVERE}>Severe</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slideIn" style={{animationDelay: '0.25s'}}>
          <div>
            <label className="block text-sm font-medium text-gray-200">Incident Date</label>
            <input 
              type="date"
              value={incidentDate}
              onChange={e=>setIncidentDate(e.target.value)}
              className="mt-1 block w-full bg-gray-900/50 border border-gray-500 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 input-focus"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200">Deadline</label>
            <input 
              type="date"
              value={deadline}
              onChange={e=>setDeadline(e.target.value)}
              className="mt-1 block w-full bg-gray-900/50 border border-gray-500 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 input-focus"
            />
          </div>
        </div>

        <div className="animate-slideIn" style={{animationDelay: '0.3s'}}>
          <label className="block text-sm font-medium text-gray-200">Location</label>
          <input 
            type="text"
            value={location}
            onChange={e=>setLocation(e.target.value)}
            placeholder="Physical or virtual location of the incident"
            className="mt-1 block w-full bg-gray-900/50 border border-gray-500 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 input-focus"
          />
        </div>

        <div className="animate-slideIn" style={{animationDelay: '0.35s'}}>
          <label className="block text-sm font-medium text-gray-200">Involved Parties</label>
          <textarea 
            value={involvedParties}
            onChange={e=>setInvolvedParties(e.target.value)}
            rows={2}
            placeholder="List any individuals, organizations, or entities involved"
            className="mt-1 block w-full bg-gray-900/50 border border-gray-500 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 input-focus"
          />
        </div>

        <div className="animate-slideIn" style={{animationDelay: '0.4s'}}>
          <label className="block text-sm font-medium text-gray-200">Estimated Value</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              value={estimatedValue}
              onChange={e=>setEstimatedValue(e.target.value)}
              placeholder="0.00"
              className="block w-full pl-7 bg-gray-900/50 border border-gray-500 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 input-focus"
            />
          </div>
        </div>

        <div className="animate-slideIn" style={{animationDelay: '0.45s'}}>
          <label className="block text-sm font-medium text-gray-200">Description</label>
          <textarea 
            value={description} 
            onChange={e=>setDescription(e.target.value)} 
            rows={6} 
            className="mt-1 block w-full bg-gray-900/50 border border-gray-500 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 input-focus"
            placeholder="Provide detailed case description" 
          />
        </div>

        <div className="animate-slideIn" style={{animationDelay: '0.5s'}}>
          <label className="block text-sm font-medium text-gray-200">Tags</label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="text"
              value={newTag}
              onChange={e=>setNewTag(e.target.value)}
              onKeyPress={e=>{
                if(e.key === 'Enter' && newTag.trim()) {
                  e.preventDefault();
                  setTags([...tags, newTag.trim()]);
                  setNewTag('');
                }
              }}
              placeholder="Add tags"
              className="flex-grow bg-gray-900/50 border border-gray-500 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 input-focus"
            />
            <button
              type="button"
              onClick={()=>{
                if(newTag.trim()) {
                  setTags([...tags, newTag.trim()]);
                  setNewTag('');
                }
              }}
              className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all duration-200 button-hover"
            >
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800 tag-enter"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => setTags(tags.filter((_, i) => i !== index))}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-500 focus:outline-none transition-colors duration-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center animate-slideIn" style={{animationDelay: '0.55s'}}>
          <input
            type="checkbox"
            id="confidentiality"
            checked={confidentiality}
            onChange={e=>setConfidentiality(e.target.checked)}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-500 rounded bg-gray-900/50 transition-all duration-200"
          />
          <label htmlFor="confidentiality" className="ml-2 block text-sm text-gray-200">
            Mark as Confidential
          </label>
        </div>

        <div className="animate-slideIn" style={{animationDelay: '0.6s'}}>
          <label className="block text-sm font-medium text-gray-200">Upload Documents / Evidence</label>
          <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-500 border-dashed rounded-md hover:border-purple-500 transition-all duration-300">
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 transition-transform duration-300 hover:scale-110" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-gray-400">
                <label className="relative cursor-pointer rounded-md font-medium text-purple-400 hover:text-purple-300 focus-within:outline-none transition-colors duration-200">
                  <span>Upload files</span>
                  <input type="file" className="sr-only" multiple onChange={handleFiles} />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-400">Any file type up to 10MB each</p>
            </div>
          </div>
          {files.length > 0 && (
            <ul className="mt-4 space-y-2">
              {files.map((file, index) => (
                <li key={index} className="text-sm text-gray-300 flex items-center file-enter">
                  <svg className="h-4 w-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {file.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end space-x-3 animate-slideIn" style={{animationDelay: '0.65s'}}>
          <button
            type="button"
            onClick={() => navigate('/cases')}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-all duration-200 button-hover"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 button-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            {loading ? 'Creating...' : 'Create Case'}
          </button>
        </div>
      </form>
    </div>
  )
}