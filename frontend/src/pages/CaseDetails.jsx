import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { API_URL } from '../config';
import { 
  Scale, Shield, FileText, AlertTriangle, BookOpen, 
  DollarSign, BarChart3, CheckCircle, XCircle, Phone,
  MapPin, Globe, Calendar, Clock, User, Briefcase, Download
} from 'lucide-react';

export default function CaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchCase() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('access_token') || ''
        const res = await fetch(`${API_URL}/api/cases/${id}/`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.status === 401) {
          setError('Session expired. Please login again.')
          navigate('/login')
          return
        }
        if (!res.ok) {
          const msg = await res.text().catch(() => '');
          throw new Error(msg || `Failed to load case (${res.status})`);
        }
        const json = await res.json();
        if (isMounted) setData(json);
      } catch (e) {
        if (isMounted) setError(e.message || 'Failed to load');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchCase();
    return () => { isMounted = false };
  }, [id, navigate]);

  const ccEntries = Object.entries(data?.analysis_category_confidence || {});

  const downloadPDF = async () => {
    if (!data) return;
    
    setDownloading(true);
    try {
      // Import jsPDF and html2canvas dynamically
      const { default: jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      // Create a temporary container with the report content
      const reportElement = document.createElement('div');
      reportElement.style.width = '210mm'; // A4 width
      reportElement.style.padding = '20px';
      reportElement.style.backgroundColor = '#1a1a2e';
      reportElement.style.color = '#ffffff';
      reportElement.style.fontFamily = 'Arial, sans-serif';
      
      reportElement.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #a855f7; font-size: 28px; margin-bottom: 10px;">Comprehensive Case Analysis Report</h1>
          <p style="color: #c084fc; font-size: 14px;">Case ID: ${data.case_id}</p>
          <p style="color: #c084fc; font-size: 12px;">Generated: ${new Date().toLocaleString()}</p>
        </div>

        <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #ffffff; font-size: 20px; margin-bottom: 10px;">${data.title}</h2>
          <p style="color: #d1d5db; font-size: 14px;">${data.description || 'No description'}</p>
          ${data.analyzed_at ? `<p style="color: #9ca3af; font-size: 12px; margin-top: 10px;">Analyzed: ${new Date(data.analyzed_at).toLocaleString()}</p>` : ''}
        </div>

        ${data.analysis_summary ? `
        <div style="background: rgba(59,130,246,0.1); border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 20px;">
          <h3 style="color: #60a5fa; font-size: 16px; margin-bottom: 8px;">📋 Case Summary</h3>
          <p style="color: #e5e7eb; font-size: 13px;">${data.analysis_summary}</p>
        </div>
        ` : ''}

        ${Array.isArray(data.analysis_keywords) && data.analysis_keywords.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #60a5fa; font-size: 14px; margin-bottom: 8px;">🔑 Keywords</h3>
          <p style="color: #e5e7eb; font-size: 12px;">${data.analysis_keywords.map(k => `#${k}`).join(' ')}</p>
        </div>
        ` : ''}

        ${Array.isArray(data.analysis_legal_sections) && data.analysis_legal_sections.length > 0 ? `
        <div style="background: rgba(249,115,22,0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
          <h3 style="color: #fb923c; font-size: 16px; margin-bottom: 10px;">⚖️ Applicable Legal Sections</h3>
          ${data.analysis_legal_sections.map(s => `
            <div style="background: rgba(255,255,255,0.05); padding: 10px; margin-bottom: 8px; border-radius: 5px;">
              <p style="color: #fbbf24; font-weight: bold; font-size: 13px;">${s.section || 'Section'}</p>
              ${s.description ? `<p style="color: #d1d5db; font-size: 12px; margin-top: 4px;">${s.description}</p>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${data.analysis_filing_viability ? `
        <div style="background: rgba(${data.analysis_filing_viability.viable ? '34,197,94' : '239,68,68'},0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
          <h3 style="color: ${data.analysis_filing_viability.viable ? '#4ade80' : '#f87171'}; font-size: 16px; margin-bottom: 10px;">
            ${data.analysis_filing_viability.viable ? '✅ Case is Viable to File' : '⚠️ Case Needs More Evidence'}
          </h3>
          ${data.analysis_filing_viability.rationale ? `<p style="color: #e5e7eb; font-size: 12px; margin-bottom: 10px;">${data.analysis_filing_viability.rationale}</p>` : ''}
          ${Array.isArray(data.analysis_filing_viability.recommended_actions) && data.analysis_filing_viability.recommended_actions.length > 0 ? `
            <div style="margin-top: 10px;">
              <p style="color: #4ade80; font-weight: bold; font-size: 12px; margin-bottom: 5px;">Recommended Actions:</p>
              <ul style="color: #d1d5db; font-size: 11px; margin-left: 20px;">
                ${data.analysis_filing_viability.recommended_actions.map(a => `<li style="margin-bottom: 3px;">${a}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
        ` : ''}

        ${Array.isArray(data.analysis_filing_authorities) && data.analysis_filing_authorities.length > 0 ? `
        <div style="background: rgba(239,68,68,0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
          <h3 style="color: #f87171; font-size: 16px; margin-bottom: 10px;">🚨 Where to File / Police Action</h3>
          ${data.analysis_filing_authorities.map(a => `
            <div style="background: rgba(255,255,255,0.05); padding: 10px; margin-bottom: 8px; border-radius: 5px;">
              <p style="color: #fbbf24; font-weight: bold; font-size: 13px;">${a.name || a.authority_type || 'Authority'}</p>
              ${a.address ? `<p style="color: #d1d5db; font-size: 11px;">📍 ${a.address}</p>` : ''}
              ${Array.isArray(a.phone_numbers) && a.phone_numbers.length > 0 ? `<p style="color: #4ade80; font-size: 11px;">📞 ${a.phone_numbers.join(', ')}</p>` : ''}
              ${a.online_portal ? `<p style="color: #60a5fa; font-size: 11px;">🌐 ${a.online_portal}</p>` : ''}
              ${a.how_to_file ? `<p style="color: #d1d5db; font-size: 11px; margin-top: 5px;">How to file: ${a.how_to_file}</p>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        <div style="background: rgba(34,197,94,0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
          <h3 style="color: #4ade80; font-size: 16px; margin-bottom: 10px;">🆘 Emergency Helplines</h3>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
            <div style="text-align: center; background: rgba(239,68,68,0.2); padding: 10px; border-radius: 5px;">
              <p style="color: #ffffff; font-weight: bold; font-size: 18px;">112</p>
              <p style="color: #d1d5db; font-size: 10px;">Emergency</p>
            </div>
            <div style="text-align: center; background: rgba(236,72,153,0.2); padding: 10px; border-radius: 5px;">
              <p style="color: #ffffff; font-weight: bold; font-size: 18px;">181</p>
              <p style="color: #d1d5db; font-size: 10px;">Women</p>
            </div>
            <div style="text-align: center; background: rgba(59,130,246,0.2); padding: 10px; border-radius: 5px;">
              <p style="color: #ffffff; font-weight: bold; font-size: 18px;">1930</p>
              <p style="color: #d1d5db; font-size: 10px;">Cyber Crime</p>
            </div>
            <div style="text-align: center; background: rgba(168,85,247,0.2); padding: 10px; border-radius: 5px;">
              <p style="color: #ffffff; font-weight: bold; font-size: 18px;">1098</p>
              <p style="color: #d1d5db; font-size: 10px;">Child</p>
            </div>
          </div>
        </div>

        ${Array.isArray(data.analysis_next_steps) && data.analysis_next_steps.length > 0 ? `
        <div style="background: rgba(168,85,247,0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
          <h3 style="color: #c084fc; font-size: 16px; margin-bottom: 10px;">📋 Next Steps to Take</h3>
          <ol style="color: #d1d5db; font-size: 12px; margin-left: 20px;">
            ${data.analysis_next_steps.map(step => `<li style="margin-bottom: 5px;">${step}</li>`).join('')}
          </ol>
        </div>
        ` : ''}

        ${data.analysis_timeline_estimate ? `
        <div style="background: rgba(234,179,8,0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
          <h3 style="color: #fbbf24; font-size: 16px; margin-bottom: 10px;">⏱️ Timeline Estimate</h3>
          <p style="color: #e5e7eb; font-size: 12px;">${data.analysis_timeline_estimate}</p>
        </div>
        ` : ''}

        <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; margin-top: 30px; text-align: center;">
          <p style="color: #9ca3af; font-size: 11px;">This report was generated automatically by AI Case Analysis System</p>
          <p style="color: #9ca3af; font-size: 11px;">Please consult with a legal professional for advice specific to your situation</p>
        </div>
      `;

      document.body.appendChild(reportElement);

      // Generate canvas from HTML
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        backgroundColor: '#1a1a2e',
        logging: false,
      });

      document.body.removeChild(reportElement);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Case_Analysis_${data.case_id}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4 shadow-2xl">
            <Scale className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Comprehensive Case Analysis Report
          </h1>
          {data && (
            <div className="flex items-center justify-center gap-4 text-purple-200 text-sm mb-4">
              <span className="font-mono bg-purple-500/20 px-3 py-1 rounded-lg">{data.case_id}</span>
              <span className="capitalize bg-blue-500/20 px-3 py-1 rounded-lg">{data.status}</span>
            </div>
          )}
          {data && (
            <button
              onClick={downloadPDF}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-semibold shadow-lg transition-all"
            >
              {downloading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download Analysis Report (PDF)
                </>
              )}
            </button>
          )}
        </motion.div>

        {error && (
          <div className="mb-6 bg-red-500/20 border-2 border-red-500/50 text-red-200 px-6 py-4 rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-6 h-6" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center text-purple-200 py-20">
            <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <div>Loading case details...</div>
          </div>
        ) : !data ? (
          <div className="text-center text-gray-400 py-20">No case data found</div>
        ) : (
          <>
            {/* Case Overview Card */}
            <motion.div 
              className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-6 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-bold text-white mb-4">{data.title}</h2>
              <p className="text-purple-100 whitespace-pre-wrap mb-4">{data.description || '(No description)'}</p>
              
              {data.analyzed_at && (
                <div className="flex items-center gap-2 text-sm text-purple-300">
                  <Clock className="w-4 h-4" />
                  <span>Analyzed: {new Date(data.analyzed_at).toLocaleString()}</span>
                </div>
              )}
            </motion.div>

            {/* 7 Comprehensive Analysis Sections */}
            <div className="grid grid-cols-1 gap-6">
              
              {/* 1. JUSTICE PATHWAY */}
              <motion.div 
                className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-xl rounded-2xl border-2 border-blue-500/30 p-6 shadow-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Scale className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">1️⃣ Justice Pathway</h3>
                    <p className="text-blue-200 text-sm">Case validity & expected outcomes</p>
                  </div>
                </div>

                {data.analysis_summary && (
                  <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
                    <div className="text-sm text-blue-200 font-semibold mb-2">Case Summary</div>
                    <p className="text-white">{data.analysis_summary}</p>
                  </div>
                )}

                {Array.isArray(data.analysis_keywords) && data.analysis_keywords.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm text-blue-200 font-semibold mb-2">Keywords</div>
                    <div className="flex flex-wrap gap-2">
                      {data.analysis_keywords.map((k, i) => (
                        <span key={i} className="px-3 py-1 text-sm rounded-lg bg-blue-500/30 border border-blue-400/50 text-blue-100">
                          #{k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {typeof data.analysis_sentiment === 'number' && (
                  <div>
                    <div className="text-sm text-blue-200 font-semibold mb-2">Case Severity Assessment</div>
                    <div className="bg-white/5 rounded-xl p-3">
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-3 rounded-full transition-all"
                          style={{ width: `${Math.max(0, Math.min(100, (data.analysis_sentiment + 1) * 50))}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-300 mt-1 text-center">
                        {data.analysis_sentiment < -0.5 ? 'Very Serious' : data.analysis_sentiment < 0 ? 'Serious' : data.analysis_sentiment < 0.5 ? 'Moderate' : 'Minor'}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* 2. POLICE ACTION */}
              <motion.div 
                className="bg-gradient-to-br from-red-600/20 to-red-800/20 backdrop-blur-xl rounded-2xl border-2 border-red-500/30 p-6 shadow-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">2️⃣ Police Action Required</h3>
                    <p className="text-red-200 text-sm">Where & how to approach police</p>
                  </div>
                </div>

                {Array.isArray(data.analysis_filing_authorities) && data.analysis_filing_authorities.length > 0 ? (
                  <div className="space-y-3">
                    {data.analysis_filing_authorities.map((a, i) => (
                      <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-red-300 flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <div className="font-bold text-white mb-1">{a.name || a.authority_type || 'Authority'}</div>
                            {a.authority_type && (
                              <div className="text-xs text-red-200 mb-2 bg-red-500/20 inline-block px-2 py-1 rounded">
                                {a.authority_type}
                              </div>
                            )}
                            {a.address && (
                              <div className="text-sm text-gray-300 mb-2">{a.address}</div>
                            )}
                            {Array.isArray(a.phone_numbers) && a.phone_numbers.length > 0 && (
                              <div className="flex items-center gap-2 text-sm text-green-300 mb-2">
                                <Phone className="w-4 h-4" />
                                <span>{a.phone_numbers.join(', ')}</span>
                              </div>
                            )}
                            {a.online_portal && (
                              <div className="flex items-center gap-2 text-sm text-blue-300 mb-2 break-all">
                                <Globe className="w-4 h-4 flex-shrink-0" />
                                <a href={a.online_portal} target="_blank" rel="noreferrer" className="underline hover:text-blue-200">
                                  {a.online_portal}
                                </a>
                              </div>
                            )}
                            {a.jurisdiction && (
                              <div className="text-xs text-gray-400 mb-1">📍 Jurisdiction: {a.jurisdiction}</div>
                            )}
                            {a.how_to_file && (
                              <div className="text-xs text-gray-300 bg-white/5 p-2 rounded mt-2">
                                <strong>How to file:</strong> {a.how_to_file}
                              </div>
                            )}
                            {a.notes && (
                              <div className="text-xs text-yellow-300 mt-2 italic">⚠️ {a.notes}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/5 rounded-xl p-4 text-gray-400 text-sm">
                    Police action guidance will appear here after AI analysis
                  </div>
                )}
              </motion.div>

              {/* 3. FIR FILING GUIDE */}
              <motion.div 
                className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 backdrop-blur-xl rounded-2xl border-2 border-orange-500/30 p-6 shadow-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">3️⃣ FIR Filing Complete Guide</h3>
                    <p className="text-orange-200 text-sm">Sections, process & timeline</p>
                  </div>
                </div>

                {data.analysis_filing_viability && (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      {data.analysis_filing_viability.viable ? (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-400" />
                      )}
                      <div>
                        <div className="font-bold text-white">
                          {data.analysis_filing_viability.viable ? '✅ Case is Viable to File' : '⚠️ Case Needs More Evidence'}
                        </div>
                        {data.analysis_filing_viability.rationale && (
                          <div className="text-sm text-gray-300 mt-1">{data.analysis_filing_viability.rationale}</div>
                        )}
                      </div>
                    </div>

                    {Array.isArray(data.analysis_filing_viability.missing_evidence) && data.analysis_filing_viability.missing_evidence.length > 0 && (
                      <div className="mt-3 bg-red-500/10 rounded-lg p-3 border border-red-500/30">
                        <div className="text-sm font-semibold text-red-200 mb-2">❌ Missing Evidence:</div>
                        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                          {data.analysis_filing_viability.missing_evidence.map((m, idx) => (
                            <li key={idx}>{m}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {Array.isArray(data.analysis_filing_viability.recommended_actions) && data.analysis_filing_viability.recommended_actions.length > 0 && (
                      <div className="mt-3 bg-green-500/10 rounded-lg p-3 border border-green-500/30">
                        <div className="text-sm font-semibold text-green-200 mb-2">✅ Recommended Actions:</div>
                        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                          {data.analysis_filing_viability.recommended_actions.map((a, idx) => (
                            <li key={idx}>{a}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {Array.isArray(data.analysis_legal_sections) && data.analysis_legal_sections.length > 0 && (
                  <div>
                    <div className="text-sm font-semibold text-orange-200 mb-2">📜 Applicable Legal Sections:</div>
                    <div className="space-y-2">
                      {data.analysis_legal_sections.map((s, i) => (
                        <div key={i} className="bg-white/5 border border-orange-500/20 rounded-lg p-3">
                          <div className="font-bold text-orange-100">{s.section || 'Section'}</div>
                          {s.description && <div className="text-sm text-gray-300 mt-1">{s.description}</div>}
                          {s.citation && <div className="text-xs text-gray-400 mt-1 italic">{s.citation}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.analysis_timeline_estimate && (
                  <div className="mt-4 bg-white/5 rounded-xl p-3 border border-orange-500/20">
                    <div className="flex items-center gap-2 text-sm text-orange-200 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="font-semibold">Timeline Estimate:</span>
                    </div>
                    <div className="text-sm text-gray-300">{data.analysis_timeline_estimate}</div>
                  </div>
                )}
              </motion.div>

              {/* 4. PROTECTION & SAFETY */}
              <motion.div 
                className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-xl rounded-2xl border-2 border-green-500/30 p-6 shadow-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">4️⃣ Protection & Safety Measures</h3>
                    <p className="text-green-200 text-sm">Emergency contacts & legal protection</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-sm font-semibold text-green-200 mb-3">🚨 Emergency Helplines:</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-red-500/20 rounded-lg p-3 text-center border border-red-500/30">
                      <Phone className="w-5 h-5 mx-auto mb-1 text-red-300" />
                      <div className="font-bold text-white text-lg">112</div>
                      <div className="text-xs text-gray-300">Emergency</div>
                    </div>
                    <div className="bg-pink-500/20 rounded-lg p-3 text-center border border-pink-500/30">
                      <Phone className="w-5 h-5 mx-auto mb-1 text-pink-300" />
                      <div className="font-bold text-white text-lg">181</div>
                      <div className="text-xs text-gray-300">Women</div>
                    </div>
                    <div className="bg-blue-500/20 rounded-lg p-3 text-center border border-blue-500/30">
                      <Phone className="w-5 h-5 mx-auto mb-1 text-blue-300" />
                      <div className="font-bold text-white text-lg">1930</div>
                      <div className="text-xs text-gray-300">Cyber Crime</div>
                    </div>
                    <div className="bg-purple-500/20 rounded-lg p-3 text-center border border-purple-500/30">
                      <Phone className="w-5 h-5 mx-auto mb-1 text-purple-300" />
                      <div className="font-bold text-white text-lg">1098</div>
                      <div className="text-xs text-gray-300">Child</div>
                    </div>
                  </div>

                  {(data.analysis_country || data.analysis_state || data.analysis_city) && (
                    <div className="mt-4 bg-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm text-green-200 mb-1">
                        <MapPin className="w-4 h-4" />
                        <span className="font-semibold">Jurisdiction:</span>
                      </div>
                      <div className="text-sm text-gray-300">
                        {[data.analysis_country, data.analysis_state, data.analysis_city, data.analysis_pincode].filter(Boolean).join(' • ')}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* 5. LEGAL GUIDANCE */}
              <motion.div 
                className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-xl rounded-2xl border-2 border-purple-500/30 p-6 shadow-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">5️⃣ Complete Legal Guidance</h3>
                    <p className="text-purple-200 text-sm">Procedure, rights & obligations</p>
                  </div>
                </div>

                {Array.isArray(data.analysis_sanction_recommendations) && data.analysis_sanction_recommendations.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-purple-200 mb-2">⚖️ Charges That Can Be Filed:</div>
                    <div className="space-y-2">
                      {data.analysis_sanction_recommendations.map((r, i) => (
                        <div key={i} className="bg-white/5 border border-purple-500/20 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-bold text-purple-100">{r.code || r.name || 'Charge'}</div>
                            {typeof r.confidence === 'number' && (
                              <div className="text-xs bg-purple-500/30 px-2 py-1 rounded text-purple-100">
                                {Math.round(r.confidence * 100)}% confidence
                              </div>
                            )}
                          </div>
                          {r.name && r.code && r.name !== r.code && (
                            <div className="text-sm text-gray-400 mb-1">{r.name}</div>
                          )}
                          {r.description && (
                            <div className="text-sm text-gray-300">{r.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {Array.isArray(data.analysis_next_steps) && data.analysis_next_steps.length > 0 && (
                  <div>
                    <div className="text-sm font-semibold text-purple-200 mb-2">📋 Next Steps to Take:</div>
                    <div className="bg-white/5 rounded-xl p-4 border border-purple-500/20">
                      <ol className="list-decimal list-inside text-sm text-gray-300 space-y-2">
                        {data.analysis_next_steps.map((step, idx) => (
                          <li key={idx} className="pl-2">{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* 6. COMPENSATION */}
              <motion.div 
                className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 backdrop-blur-xl rounded-2xl border-2 border-yellow-500/30 p-6 shadow-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">6️⃣ Compensation & Financial Relief</h3>
                    <p className="text-yellow-200 text-sm">Victim compensation schemes</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-sm text-yellow-200 mb-3">
                    💰 Under CrPC Section 357A, victims of crimes are entitled to compensation from the State Government.
                  </div>
                  
                  {Array.isArray(data.analysis_filing_authorities) && data.analysis_filing_authorities.length > 0 ? (
                    <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20">
                      <div className="text-sm font-semibold text-yellow-200 mb-2">Where to Apply:</div>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {data.analysis_filing_authorities.map((a, i) => (
                          <li key={i}>• {a.name || a.authority_type}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">
                      Apply to the District Legal Services Authority (DLSA) or approach the trial court for compensation after filing FIR.
                    </div>
                  )}

                  {data.analysis_timeline_estimate && (
                    <div className="mt-3 bg-white/5 rounded-lg p-3">
                      <div className="text-sm text-yellow-200 font-semibold mb-1">⏱️ Processing Time:</div>
                      <div className="text-sm text-gray-300">{data.analysis_timeline_estimate}</div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* 7. CASE ANALYSIS REPORT */}
              <motion.div 
                className="bg-gradient-to-br from-cyan-600/20 to-cyan-800/20 backdrop-blur-xl rounded-2xl border-2 border-cyan-500/30 p-6 shadow-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">7️⃣ Case Analysis Report</h3>
                    <p className="text-cyan-200 text-sm">Strength, evidence & assessment</p>
                  </div>
                </div>

                {ccEntries.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-cyan-200 mb-3">📊 Category Confidence Analysis:</div>
                    <div className="space-y-3">
                      {ccEntries.map(([k, v]) => (
                        <div key={k} className="bg-white/5 rounded-lg p-3">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="capitalize text-white font-semibold">{k}</span>
                            <span className="text-cyan-300 font-bold">{Math.round((Number(v) || 0) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all" 
                              style={{ width: `${(Number(v) || 0) * 100}%` }} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {Array.isArray(data.analysis_evidence_priority) && data.analysis_evidence_priority.length > 0 && (
                  <div>
                    <div className="text-sm font-semibold text-cyan-200 mb-2">🔍 Evidence Priority:</div>
                    <div className="space-y-2">
                      {data.analysis_evidence_priority.map((e, i) => (
                        <div key={i} className="bg-white/5 border border-cyan-500/20 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            {e.priority === 'high' && <span className="text-red-400 font-bold">🔴 HIGH</span>}
                            {e.priority === 'medium' && <span className="text-yellow-400 font-bold">🟡 MEDIUM</span>}
                            {e.priority === 'low' && <span className="text-green-400 font-bold">🟢 LOW</span>}
                            {!e.priority && <span className="text-gray-400">⚪</span>}
                            <span className="text-white font-semibold">{e.item}</span>
                          </div>
                          {e.rationale && (
                            <div className="text-sm text-gray-300 mt-1">{e.rationale}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 bg-white/5 rounded-xl p-4 border border-cyan-500/20">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-cyan-200 mb-1 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Created</span>
                      </div>
                      <div className="text-gray-300">{new Date(data.created_at).toLocaleString()}</div>
                    </div>
                    {data.closed_at && (
                      <div>
                        <div className="text-cyan-200 mb-1 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>Closed</span>
                        </div>
                        <div className="text-gray-300">{new Date(data.closed_at).toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

            </div>

            {/* Footer Action */}
            <motion.div 
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <button
                onClick={() => navigate('/cases')}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg transition-all"
              >
                ← Back to Cases
              </button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

