import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config';
import { 
  FileText, AlertCircle, Scale, Camera, Users, 
  UserCheck, Shield, ChevronRight, CheckCircle, 
  MapPin, Phone, Mail, User, Calendar, Clock,
  Image, Video, Mic, FileImage, MessageSquare,
  Building2, AlertTriangle, X, Upload
} from 'lucide-react';

export default function CaseCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  // 1. Basic Incident Information
  const [incidentStory, setIncidentStory] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [incidentTime, setIncidentTime] = useState('');
  const [incidentLocation, setIncidentLocation] = useState('');
  const [incidentCity, setIncidentCity] = useState('');
  const [incidentLandmark, setIncidentLandmark] = useState('');

  // 2. Your Details
  const [yourName, setYourName] = useState('');
  const [yourAge, setYourAge] = useState('');
  const [yourContact, setYourContact] = useState('');
  const [yourRole, setYourRole] = useState('victim');
  const [injuryLoss, setInjuryLoss] = useState('');

  // 3. Opposite Person Details
  const [accusedName, setAccusedName] = useState('');
  const [accusedRelation, setAccusedRelation] = useState('');

  // 4. Evidence
  const [hasPhotos, setHasPhotos] = useState(false);
  const [photosDesc, setPhotosDesc] = useState('');
  const [hasVideos, setHasVideos] = useState(false);
  const [videosDesc, setVideosDesc] = useState('');
  const [hasCCTV, setHasCCTV] = useState(false);
  const [cctvDesc, setCctvDesc] = useState('');
  const [hasAudio, setHasAudio] = useState(false);
  const [audioDesc, setAudioDesc] = useState('');
  const [hasMedical, setHasMedical] = useState(false);
  const [medicalDesc, setMedicalDesc] = useState('');
  const [hasMessages, setHasMessages] = useState(false);
  const [messagesDesc, setMessagesDesc] = useState('');
  const [hasDocuments, setHasDocuments] = useState(false);
  const [documentsDesc, setDocumentsDesc] = useState('');

  // 5. Witness Information
  const [hasWitnesses, setHasWitnesses] = useState(false);
  const [witnessName, setWitnessName] = useState('');
  const [witnessContact, setWitnessContact] = useState('');
  const [witnessStatement, setWitnessStatement] = useState('');

  // 6. Police Status
  const [policeVisited, setPoliceVisited] = useState('no');
  const [firCopy, setFirCopy] = useState('');
  const [policeStation, setPoliceStation] = useState('');
  const [policeAction, setPoliceAction] = useState('');

  // 7. Type of Issue
  const [crimeType, setCrimeType] = useState('');
  const [customCrimeType, setCustomCrimeType] = useState('');

  const crimeTypes = [
    'Robbery',
    'Assault / Half Murder',
    'Rape / Molestation',
    'Harassment by Politician/MLA',
    'Land Dispute',
    'Domestic Violence',
    'Atrocity Related Crime',
    'Cybercrime',
    'Fraud / Cheating',
    'Other'
  ];

  const steps = [
    { icon: FileText, title: 'Incident Details', desc: 'What happened?' },
    { icon: User, title: 'Your Details', desc: 'About you' },
    { icon: UserCheck, title: 'Accused Details', desc: 'Opposite person' },
    { icon: Camera, title: 'Evidence', desc: 'Proof you have' },
    { icon: Users, title: 'Witnesses', desc: 'Who saw it' },
    { icon: Shield, title: 'Police Status', desc: 'Any FIR filed?' },
    { icon: AlertTriangle, title: 'Crime Type', desc: 'What kind of issue' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      
      const evidenceList = [];
      if (hasPhotos) evidenceList.push(`Photos: ${photosDesc}`);
      if (hasVideos) evidenceList.push(`Videos: ${videosDesc}`);
      if (hasCCTV) evidenceList.push(`CCTV: ${cctvDesc}`);
      if (hasAudio) evidenceList.push(`Audio: ${audioDesc}`);
      if (hasMedical) evidenceList.push(`Medical Reports: ${medicalDesc}`);
      if (hasMessages) evidenceList.push(`Messages/Calls: ${messagesDesc}`);
      if (hasDocuments) evidenceList.push(`Documents: ${documentsDesc}`);

      const caseData = {
        title: `${crimeType === 'Other' ? customCrimeType : crimeType} - ${yourName}`,
        description: incidentStory,
        
        // Basic Incident Info
        incident_details: {
          full_story: incidentStory,
          date: incidentDate,
          time: incidentTime,
          location: incidentLocation,
          city: incidentCity,
          landmark: incidentLandmark
        },
        
        // Your Details
        complainant_info: {
          name: yourName,
          age: yourAge,
          contact: yourContact,
          role: yourRole,
          injury_loss: injuryLoss
        },
        
        // Accused Details
        accused_details: {
          name: accusedName || 'Unknown',
          relation: accusedRelation,
          known_status: accusedName ? 'known' : 'unknown'
        },
        
        // Evidence
        evidence_catalog: {
          photos: hasPhotos ? [photosDesc] : [],
          videos: hasVideos ? [videosDesc] : [],
          cctv: hasCCTV ? [cctvDesc] : [],
          audio: hasAudio ? [audioDesc] : [],
          medical_reports: hasMedical ? [medicalDesc] : [],
          messages: hasMessages ? [messagesDesc] : [],
          documents: hasDocuments ? [documentsDesc] : [],
          summary: evidenceList
        },
        
        // Witnesses
        witnesses_info: hasWitnesses ? [{
          name: witnessName,
          contact: witnessContact,
          statement: witnessStatement
        }] : [],
        
        // Police Status
        police_status: {
          visited: policeVisited,
          fir_copy: firCopy,
          station: policeStation,
          action_taken: policeAction
        },
        
        fir_number: firCopy,
        police_station_jurisdiction: policeStation,
        
        // Crime Type
        case_type: crimeType === 'Other' ? customCrimeType : crimeType,
        
        priority: 'high',
        status: 'open'
      };

      const response = await axios.post(
        API_ENDPOINTS.cases,
        caseData,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      navigate(`/cases/${response.data.id}`);
    } catch (err) {
      console.error('Error creating case:', err);
      setError(err.response?.data?.detail || 'Failed to create case. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4 shadow-2xl animate-pulse">
            <Scale className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            Register Your Complaint
          </h1>
          <p className="text-purple-200 text-lg">We will analyze and guide you step by step</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, idx) => (
              <div key={idx} className="flex-1 relative">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      idx <= activeStep
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-white shadow-lg scale-110'
                        : 'bg-gray-700 border-gray-500'
                    }`}
                  >
                    <step.icon className={`w-6 h-6 ${idx <= activeStep ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <div className="text-center mt-2 hidden md:block">
                    <div className={`text-xs font-semibold ${idx <= activeStep ? 'text-white' : 'text-gray-400'}`}>
                      {step.title}
                    </div>
                    <div className={`text-xs ${idx <= activeStep ? 'text-purple-300' : 'text-gray-500'}`}>
                      {step.desc}
                    </div>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`absolute top-6 left-1/2 w-full h-0.5 ${
                    idx < activeStep ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-600'
                  }`} style={{ zIndex: -1 }} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 transition-all duration-500"
              style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/20 border-2 border-red-500/50 text-red-200 px-6 py-4 rounded-xl flex items-center gap-3 animate-shake">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 p-6">
              <div className="flex items-center gap-4 text-white">
                {React.createElement(steps[activeStep].icon, { className: 'w-8 h-8' })}
                <div>
                  <h2 className="text-2xl font-bold">{steps[activeStep].title}</h2>
                  <p className="text-purple-100 text-sm">{steps[activeStep].desc}</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Step 0: Incident Details */}
              {activeStep === 0 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-bold text-purple-200 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      What exactly happened? Tell us the full story in your own words *
                    </label>
                    <textarea
                      required
                      value={incidentStory}
                      onChange={(e) => setIncidentStory(e.target.value)}
                      rows={8}
                      className="w-full bg-white/5 border-2 border-purple-500/30 focus:border-purple-500 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all placeholder-gray-400"
                      placeholder="Describe what happened in detail... When did it start? What did they do? What did you do? Include all important details."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-purple-200 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Date of Incident *
                      </label>
                      <input
                        type="date"
                        required
                        value={incidentDate}
                        onChange={(e) => setIncidentDate(e.target.value)}
                        className="w-full bg-white/5 border-2 border-purple-500/30 focus:border-purple-500 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-purple-200 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Time (Approximate)
                      </label>
                      <input
                        type="time"
                        value={incidentTime}
                        onChange={(e) => setIncidentTime(e.target.value)}
                        className="w-full bg-white/5 border-2 border-purple-500/30 focus:border-purple-500 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-purple-200 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Exact Location (Area, Building, Street) *
                    </label>
                    <input
                      type="text"
                      required
                      value={incidentLocation}
                      onChange={(e) => setIncidentLocation(e.target.value)}
                      className="w-full bg-white/5 border-2 border-purple-500/30 focus:border-purple-500 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder="e.g., Shop No. 12, Main Road, near City Mall"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-purple-200 mb-2">City *</label>
                      <input
                        type="text"
                        required
                        value={incidentCity}
                        onChange={(e) => setIncidentCity(e.target.value)}
                        className="w-full bg-white/5 border-2 border-purple-500/30 focus:border-purple-500 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        placeholder="City name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-purple-200 mb-2">Nearby Landmark</label>
                      <input
                        type="text"
                        value={incidentLandmark}
                        onChange={(e) => setIncidentLandmark(e.target.value)}
                        className="w-full bg-white/5 border-2 border-purple-500/30 focus:border-purple-500 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        placeholder="e.g., Near Railway Station"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Your Details */}
              {activeStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-purple-200 mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={yourName}
                        onChange={(e) => setYourName(e.target.value)}
                        className="w-full bg-white/5 border-2 border-purple-500/30 focus:border-purple-500 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-purple-200 mb-2">Your Age</label>
                      <input
                        type="number"
                        value={yourAge}
                        onChange={(e) => setYourAge(e.target.value)}
                        className="w-full bg-white/5 border-2 border-purple-500/30 focus:border-purple-500 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        placeholder="Age"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-purple-200 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={yourContact}
                      onChange={(e) => setYourContact(e.target.value)}
                      className="w-full bg-white/5 border-2 border-purple-500/30 focus:border-purple-500 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-purple-200 mb-2">You are: *</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {['victim', 'complainant', 'witness'].map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setYourRole(role)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            yourRole === role
                              ? 'bg-purple-600 border-purple-400 text-white shadow-lg scale-105'
                              : 'bg-white/5 border-gray-600 text-gray-300 hover:border-purple-500'
                          }`}
                        >
                          <div className="font-semibold capitalize">{role}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-purple-200 mb-2">
                      Any injury or loss suffered? (Physical, Mental, Financial)
                    </label>
                    <textarea
                      value={injuryLoss}
                      onChange={(e) => setInjuryLoss(e.target.value)}
                      rows={4}
                      className="w-full bg-white/5 border-2 border-purple-500/30 focus:border-purple-500 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder="Describe any injuries, mental trauma, or financial loss you suffered..."
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Accused Details */}
              {activeStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-bold text-purple-200 mb-2">
                      Name or Description of Accused (If Known)
                    </label>
                    <input
                      type="text"
                      value={accusedName}
                      onChange={(e) => setAccusedName(e.target.value)}
                      className="w-full bg-white/5 border-2 border-purple-500/30 focus:border-purple-500 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder="Full name or description (e.g., tall man with beard)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-purple-200 mb-2">
                      Relationship with You
                    </label>
                    <select
                      value={accusedRelation}
                      onChange={(e) => setAccusedRelation(e.target.value)}
                      className="w-full bg-white/5 border-2 border-purple-500/30 focus:border-purple-500 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      <option value="">Select relationship</option>
                      <option value="unknown">Unknown / Stranger</option>
                      <option value="neighbor">Neighbor</option>
                      <option value="relative">Relative</option>
                      <option value="colleague">Colleague</option>
                      <option value="friend">Friend / Acquaintance</option>
                      <option value="mla">MLA / Politician</option>
                      <option value="police">Police Officer</option>
                      <option value="government">Government Official</option>
                      <option value="business">Business Associate</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {!accusedName && (
                    <div className="bg-blue-500/20 border-2 border-blue-400/50 rounded-xl p-4 text-blue-200">
                      <p className="text-sm">
                        💡 <strong>Don't know the accused?</strong> That's okay! You can still file a complaint. 
                        Provide as much description as possible (appearance, vehicle, etc.)
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Evidence */}
              {activeStep === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-yellow-500/20 border-2 border-yellow-400/50 rounded-xl p-4 mb-6">
                    <p className="text-yellow-200 font-semibold">
                      ⚠️ Evidence is very important! It helps AI analyze your case better and strengthens your complaint.
                    </p>
                  </div>

                  {[
                    { key: 'Photos', icon: Image, state: hasPhotos, setState: setHasPhotos, desc: photosDesc, setDesc: setPhotosDesc },
                    { key: 'Videos', icon: Video, state: hasVideos, setState: setHasVideos, desc: videosDesc, setDesc: setVideosDesc },
                    { key: 'CCTV', icon: Camera, state: hasCCTV, setState: setHasCCTV, desc: cctvDesc, setDesc: setCctvDesc },
                    { key: 'Audio', icon: Mic, state: hasAudio, setState: setHasAudio, desc: audioDesc, setDesc: setAudioDesc },
                    { key: 'Medical', icon: FileText, state: hasMedical, setState: setHasMedical, desc: medicalDesc, setDesc: setMedicalDesc },
                    { key: 'Messages/Calls', icon: MessageSquare, state: hasMessages, setState: setHasMessages, desc: messagesDesc, setDesc: setMessagesDesc },
                    { key: 'Documents', icon: FileImage, state: hasDocuments, setState: setHasDocuments, desc: documentsDesc, setDesc: setDocumentsDesc }
                  ].map((evidence) => (
                    <div key={evidence.key} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={evidence.state}
                          onChange={(e) => evidence.setState(e.target.checked)}
                          className="w-5 h-5 rounded border-gray-500 text-purple-600 focus:ring-purple-500"
                        />
                        <evidence.icon className="w-5 h-5 text-purple-400" />
                        <span className="text-white font-semibold">{evidence.key}</span>
                      </label>
                      {evidence.state && (
                        <textarea
                          value={evidence.desc}
                          onChange={(e) => evidence.setDesc(e.target.value)}
                          rows={2}
                          className="mt-3 w-full bg-white/5 border border-purple-500/30 text-white rounded-lg px-3 py-2 text-sm"
                          placeholder={`Describe your ${evidence.key.toLowerCase()} evidence...`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Step 4: Witnesses */}
              {activeStep === 4 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer mb-6">
                      <input
                        type="checkbox"
                        checked={hasWitnesses}
                        onChange={(e) => setHasWitnesses(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-500 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-white font-bold text-lg">Are there any witnesses?</span>
                    </label>
                  </div>

                  {hasWitnesses && (
                    <div className="space-y-6 bg-white/5 rounded-xl p-6 border border-purple-500/30">
                      <div>
                        <label className="block text-sm font-bold text-purple-200 mb-2">Witness Name</label>
                        <input
                          type="text"
                          value={witnessName}
                          onChange={(e) => setWitnessName(e.target.value)}
                          className="w-full bg-white/5 border-2 border-purple-500/30 focus:border-purple-500 text-white rounded-xl px-4 py-3"
                          placeholder="Full name of witness"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-purple-200 mb-2">Contact Details</label>
                        <input
                          type="text"
                          value={witnessContact}
                          onChange={(e) => setWitnessContact(e.target.value)}
                          className="w-full bg-white/5 border-2 border-purple-500/30 focus:border-purple-500 text-white rounded-xl px-4 py-3"
                          placeholder="Phone number or address"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-purple-200 mb-2">What they saw/heard</label>
                        <textarea
                          value={witnessStatement}
                          onChange={(e) => setWitnessStatement(e.target.value)}
                          rows={4}
                          className="w-full bg-white/5 border-2 border-purple-500/30 focus:border-purple-500 text-white rounded-xl px-4 py-3"
                          placeholder="What did the witness observe or hear during the incident?"
                        />
                      </div>
                    </div>
                  )}

                  {!hasWitnesses && (
                    <div className="bg-gray-700/30 border border-gray-600 rounded-xl p-6 text-center text-gray-300">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                      <p>No witnesses available? That's okay. Your case can still proceed.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 5: Police Status */}
              {activeStep === 5 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-bold text-purple-200 mb-4">
                      Have you gone to the police station?
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setPoliceVisited('yes')}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          policeVisited === 'yes'
                            ? 'bg-green-600 border-green-400 text-white shadow-lg scale-105'
                            : 'bg-white/5 border-gray-600 text-gray-300 hover:border-green-500'
                        }`}
                      >
                        <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                        <div className="font-bold">✔ Yes</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPoliceVisited('no')}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          policeVisited === 'no'
                            ? 'bg-red-600 border-red-400 text-white shadow-lg scale-105'
                            : 'bg-white/5 border-gray-600 text-gray-300 hover:border-red-500'
                        }`}
                      >
                        <X className="w-8 h-8 mx-auto mb-2" />
                        <div className="font-bold">❌ No</div>
                      </button>
                    </div>
                  </div>

                  {policeVisited === 'yes' && (
                    <div className="space-y-6 bg-white/5 rounded-xl p-6 border border-green-500/30">
                      <div>
                        <label className="block text-sm font-bold text-purple-200 mb-2">FIR Copy or Complaint Number</label>
                        <input
                          type="text"
                          value={firCopy}
                          onChange={(e) => setFirCopy(e.target.value)}
                          className="w-full bg-white/5 border-2 border-purple-500/30 focus:border-purple-500 text-white rounded-xl px-4 py-3"
                          placeholder="FIR number or acknowledgment number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-purple-200 mb-2">Police Station Name</label>
                        <input
                          type="text"
                          value={policeStation}
                          onChange={(e) => setPoliceStation(e.target.value)}
                          className="w-full bg-white/5 border-2 border-purple-500/30 focus:border-purple-500 text-white rounded-xl px-4 py-3"
                          placeholder="Name of the police station"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-purple-200 mb-2">Any action taken by police?</label>
                        <textarea
                          value={policeAction}
                          onChange={(e) => setPoliceAction(e.target.value)}
                          rows={3}
                          className="w-full bg-white/5 border-2 border-purple-500/30 focus:border-purple-500 text-white rounded-xl px-4 py-3"
                          placeholder="What action has been taken? Investigation started? Arrest made? No action yet?"
                        />
                      </div>
                    </div>
                  )}

                  {policeVisited === 'no' && (
                    <div className="bg-blue-500/20 border-2 border-blue-400/50 rounded-xl p-6">
                      <p className="text-blue-200">
                        💡 <strong>We recommend filing an FIR.</strong> Our AI will analyze your case and guide you on the next steps, 
                        including what to tell the police and which sections apply.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 6: Crime Type */}
              {activeStep === 6 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-bold text-purple-200 mb-4">
                      Select the type of issue (Crime Category) *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {crimeTypes.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setCrimeType(type)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            crimeType === type
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-400 text-white shadow-lg scale-105'
                              : 'bg-white/5 border-gray-600 text-gray-300 hover:border-purple-500'
                          }`}
                        >
                          <div className="font-bold">{type}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {crimeType === 'Other' && (
                    <div>
                      <label className="block text-sm font-bold text-purple-200 mb-2">
                        Please specify the crime type
                      </label>
                      <input
                        type="text"
                        required
                        value={customCrimeType}
                        onChange={(e) => setCustomCrimeType(e.target.value)}
                        className="w-full bg-white/5 border-2 border-purple-500/30 focus:border-purple-500 text-white rounded-xl px-4 py-3"
                        placeholder="Describe the type of crime"
                      />
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400/50 rounded-xl p-6 mt-8">
                    <h3 className="text-green-200 font-bold text-lg mb-3">✅ Ready to Submit!</h3>
                    <p className="text-green-100 text-sm mb-4">
                      Our AI will analyze your complaint and provide:
                    </p>
                    <ul className="text-green-100 text-sm space-y-2">
                      <li>✓ Legal sections that apply to your case</li>
                      <li>✓ Strength assessment of your complaint</li>
                      <li>✓ What documents you need</li>
                      <li>✓ Possible outcomes and next steps</li>
                      <li>✓ Legal rights and responsibilities</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="bg-white/5 p-6 flex justify-between items-center border-t border-white/10">
              <button
                type="button"
                onClick={prevStep}
                disabled={activeStep === 0}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-semibold"
              >
                ← Previous
              </button>

              {activeStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all flex items-center gap-2 font-semibold shadow-lg"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !crimeType}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl disabled:opacity-50 transition-all flex items-center gap-2 font-bold shadow-xl"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Submit Complaint
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}

