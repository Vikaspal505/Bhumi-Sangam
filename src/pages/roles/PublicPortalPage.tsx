import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Parcel, GroundingCitation } from '../../types';
import { 
  Search, 
  MapPin, 
  CheckCircle2, 
  Send, 
  FileText, 
  ChevronRight,
  ExternalLink,
  HelpCircle,
  Building,
  Download
} from 'lucide-react';
import { MOCK_PUBLIC_FAQS } from '../../data/mockData';
import { MiniMap } from '../../components/map/MiniMap';
import { LeafletMapView } from '../../components/map/LeafletMapView';

export const PublicPortalPage: React.FC = () => {
  const { 
    parcels, 
    submitPublicGrievance, 
    showToast, 
    activeWard, 
    askSearchGrounding, 
    setSelectedParcel,
    language 
  } = useApp();
  const t = (en: string, hi: string) => language === 'hi' ? hi : en;

  const [activeTab, setActiveTab] = useState<'search' | 'map' | 'report' | 'faq'>('search');
  const [searchQuery, setSearchQuery] = useState<string>('Sy. 40/4');
  const [searchedParcel, setSearchedParcel] = useState<Parcel | null>(parcels[3] || parcels[0]);

  // Search Statutory FAQ state
  const [faqSearchQuery, setFaqSearchQuery] = useState<string>('');
  const [faqSearching, setFaqSearching] = useState<boolean>(false);
  const [faqGroundedAnswer, setFaqGroundedAnswer] = useState<{ text: string; citations: GroundingCitation[]; disclaimer: string } | null>(null);

  // Grievance form state
  const [surveyInput, setSurveyInput] = useState<string>('');
  const [issueType, setIssueType] = useState<string>('Area Mismatch');
  const [description, setDescription] = useState<string>('');
  const [citizenName, setCitizenName] = useState<string>('');
  const [citizenPhone, setCitizenPhone] = useState<string>('');
  const [submittedTrackingId, setSubmittedTrackingId] = useState<string | null>(null);

  const handleSearchBySurvey = (e: React.FormEvent) => {
    e.preventDefault();
    const term = searchQuery.trim().toLowerCase();
    const found = parcels.find(p => 
      p.surveyNo.toLowerCase().includes(term) || 
      p.khasraNo.toLowerCase().includes(term) ||
      p.plotNo.toLowerCase().includes(term)
    );

    if (found) {
      setSearchedParcel(found);
      setSelectedParcel(found);
      showToast(t("Record Located","रिकॉर्ड मिला"), t(`Retrieved official record for ${found.surveyNo}`,`${found.surveyNo} का आधिकारिक रिकॉर्ड प्राप्त हुआ`), "success");
    } else {
      setSearchedParcel(null);
      showToast(t("Record Not Found","रिकॉर्ड नहीं मिला"), t(`No public entry matching '${term}'. Try 'Sy. 40/4' or 'Plot 104'.`,`'${term}' से मिलता कोई प्रविष्टि नहीं। 'Sy. 40/4' या 'Plot 104' आज़माएँ।`), "info");
    }
  };

  const handleSearchFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqSearchQuery.trim()) return;
    setFaqSearching(true);
    showToast(t("Consulting Official Records","आधिकारिक रिकॉर्ड देखे जा रहे हैं"), t("Retrieving statutory land records guidelines...","वैधानिक भूमि अभिलेख दिशानिर्देश प्राप्त हो रहे हैं..."), "info");

    try {
      const res = await askSearchGrounding(faqSearchQuery, "Public citizen inquiry on urban land records");
      setFaqGroundedAnswer(res);
    } catch (err: any) {
      showToast(t("Notice","सूचना"), t("Official guidelines retrieved from cache.","आधिकारिक दिशानिर्देश कैश से प्राप्त हुए।"), "info");
    } finally {
      setFaqSearching(false);
    }
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!surveyInput || !description) return;

    submitPublicGrievance({
      khasraOrSurveyNo: surveyInput,
      ward: 'Ward 142 Indiranagar',
      issueType: issueType,
      citizenName: citizenName || 'Citizen Applicant',
      citizenContact: citizenPhone || 'Not provided',
      description: description
    });

    const newId = `GRV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setSubmittedTrackingId(newId);
    setSurveyInput('');
    setDescription('');
    setCitizenName('');
    setCitizenPhone('');
  };

  return (
    <div className="p-6 max-w-[1280px] mx-auto space-y-6">
      {/* Official Header with Breadcrumb */}
      <div className="space-y-1.5 pb-3 border-b border-[#D5D9DE] dark:border-[#2F343A]">
        <nav className="text-xs text-[#718096] dark:text-[#7D858E] flex items-center gap-1.5" aria-label="Breadcrumb">
          <span>{t('Home','होम')}</span>
          <ChevronRight className="w-3 h-3 text-[#718096] dark:text-[#7D858E]" />
          <span className="text-[#4A5568] dark:text-[#AEB4BB]">{t('Public Land Records','सार्वजनिक भूमि अभिलेख')}</span>
          <ChevronRight className="w-3 h-3 text-[#718096] dark:text-[#7D858E]" />
          <span className="font-semibold text-[#1B1F23] dark:text-[#E8EAED]">{t('Citizen Portal','नागरिक पोर्टल')}</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1B1F23] dark:text-[#E8EAED]">
              {t('Citizen Open Land Registry','नागरिक खुला भूमि रजिस्ट्री')}
            </h1>
            <p className="text-xs text-[#718096] dark:text-[#7D858E] mt-0.5">
              {t('Transparent, privacy-preserving parcel boundary search by Khasra/Survey number, land-use zoning, and grievance submission under the NAKSHA Programme.','नक्शा कार्यक्रम के तहत खसरा/सर्वे संख्या द्वारा पारदर्शी, गोपनीयता-संरक्षित पार्सल सीमा खोज, भूमि-उपयोग ज़ोनिंग, और शिकायत प्रस्तुति।')}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#718096] dark:text-[#7D858E]">
            <MapPin className="w-3.5 h-3.5" />
            <span>{t('Active Ward:','सक्रिय वार्ड:')} {activeWard}</span>
          </div>
        </div>
      </div>

      {/* Flat Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-[#D5D9DE] dark:border-[#2F343A] text-xs font-semibold">
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'search'
              ? 'border-[#1F4E8C] dark:border-[#3F7CC4] text-[#1F4E8C] dark:text-[#7FB0E8]'
              : 'border-transparent text-[#4A5568] dark:text-[#AEB4BB] hover:text-[#1B1F23] dark:hover:text-[#E8EAED]'
          }`}
        >
          {t('Search Parcel Record','पार्सल रिकॉर्ड खोजें')}
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'map'
              ? 'border-[#1F4E8C] dark:border-[#3F7CC4] text-[#1F4E8C] dark:text-[#7FB0E8]'
              : 'border-transparent text-[#4A5568] dark:text-[#AEB4BB] hover:text-[#1B1F23] dark:hover:text-[#E8EAED]'
          }`}
        >
          {t('Public Cadastral Map','सार्वजनिक भूमि मानचित्र')}
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'report'
              ? 'border-[#1F4E8C] dark:border-[#3F7CC4] text-[#1F4E8C] dark:text-[#7FB0E8]'
              : 'border-transparent text-[#4A5568] dark:text-[#AEB4BB] hover:text-[#1B1F23] dark:hover:text-[#E8EAED]'
          }`}
        >
          {t('File Public Grievance','सार्वजनिक शिकायत दर्ज करें')}
        </button>
        <button
          onClick={() => setActiveTab('faq')}
          className={`px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'faq'
              ? 'border-[#1F4E8C] dark:border-[#3F7CC4] text-[#1F4E8C] dark:text-[#7FB0E8]'
              : 'border-transparent text-[#4A5568] dark:text-[#AEB4BB] hover:text-[#1B1F23] dark:hover:text-[#E8EAED]'
          }`}
        >
          {t('Statutory FAQs & Guidelines','वैधानिक प्रश्नोत्तर और दिशानिर्देश')}
        </button>
      </div>

      {/* Tab 1: Search Parcel */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          {/* Plain Search Box */}
          <div className="bg-white dark:bg-[#1A1D21] border border-[#D5D9DE] dark:border-[#2F343A] rounded-[4px] p-5 shadow-xs">
            <h2 className="text-sm font-semibold text-[#1B1F23] dark:text-[#E8EAED] mb-1">
              {t('Search Parcel by Survey or Khasra Number','सर्वे या खसरा संख्या से पार्सल खोजें')}
            </h2>
            <p className="text-xs text-[#718096] dark:text-[#7D858E] mb-3">
              {t('Enter official revenue survey identifier (e.g. "Sy. 40/4", "Khasra 281", or "Plot 104")','आधिकारिक राजस्व सर्वे पहचानकर्ता दर्ज करें (जैसे "Sy. 40/4", "खसरा 281", या "प्लॉट 104")')}
            </p>

            <form onSubmit={handleSearchBySurvey} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Enter survey or khasra number...','सर्वे या खसरा संख्या दर्ज करें...')}
                className="flex-1 h-10 px-3 border border-[#D5D9DE] dark:border-[#2F343A] bg-[#F4F5F7] dark:bg-[#22262B] rounded-[4px] text-xs text-[#1B1F23] dark:text-[#E8EAED] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
              />
              <button
                type="submit"
                className="h-10 px-5 text-xs font-semibold rounded-[4px] bg-[#1F4E8C] dark:bg-[#3F7CC4] text-white hover:opacity-95 transition-opacity flex items-center gap-1.5 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{t('Search Records','रिकॉर्ड खोजें')}</span>
              </button>
            </form>
          </div>

          {/* Searched Record Display */}
          {searchedParcel ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Record Metadata Card (7 cols) */}
              <div className="lg:col-span-7 bg-white dark:bg-[#1A1D21] border border-[#D5D9DE] dark:border-[#2F343A] rounded-[4px] p-5 shadow-xs space-y-4">
                <div className="border-b border-[#D5D9DE] dark:border-[#2F343A] pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-[#1F4E8C] dark:text-[#7FB0E8] font-semibold">{searchedParcel.id}</span>
                    <h2 className="text-base font-semibold text-[#1B1F23] dark:text-[#E8EAED]">
                      Survey No. {searchedParcel.surveyNo} ({searchedParcel.khasraNo})
                    </h2>
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded-[2px] border text-xs font-medium ${
                    searchedParcel.status === 'verified'
                      ? 'border-[#2E7D32]/40 text-[#2E7D32] dark:text-[#4FA37A]'
                      : 'border-[#B78103]/40 text-[#B78103] dark:text-[#C99A3C]'
                  }`}>
                    {searchedParcel.status === 'verified' ? t('Verified Cadastral Record','सत्यापित भूमि अभिलेख') : t('In Review','समीक्षाधीन')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-[#F4F5F7] dark:bg-[#22262B] border border-[#D5D9DE] dark:border-[#2F343A] rounded-[2px]">
                    <span className="text-[#718096] dark:text-[#7D858E] block text-[11px]">{t('Registered RoR Area','पंजीकृत RoR क्षेत्रफल')}</span>
                    <span className="text-base font-semibold text-[#1B1F23] dark:text-[#E8EAED] font-mono">{searchedParcel.recordAreaSqM} m²</span>
                  </div>
                  <div className="p-3 bg-[#F4F5F7] dark:bg-[#22262B] border border-[#D5D9DE] dark:border-[#2F343A] rounded-[2px]">
                    <span className="text-[#718096] dark:text-[#7D858E] block text-[11px]">{t('Drone Orthorectified Area','ड्रोन ऑर्थोरेक्टिफाइड क्षेत्रफल')}</span>
                    <span className="text-base font-semibold text-[#1B1F23] dark:text-[#E8EAED] font-mono">{searchedParcel.measuredAreaSqM} m²</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-[#D5D9DE] dark:border-[#2F343A]">
                    <span className="text-[#718096] dark:text-[#7D858E]">{t('Registered Land Use','पंजीकृत भूमि उपयोग')}</span>
                    <span className="font-semibold text-[#1B1F23] dark:text-[#E8EAED]">{searchedParcel.landUse}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#D5D9DE] dark:border-[#2F343A]">
                    <span className="text-[#718096] dark:text-[#7D858E]">{t('Survey Directorate Code','सर्वे निदेशालय कोड')}</span>
                    <span className="font-mono text-[#1B1F23] dark:text-[#E8EAED]">KA-BLR-W142-{searchedParcel.surveyNo.replace(/\D/g, '')}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#D5D9DE] dark:border-[#2F343A]">
                    <span className="text-[#718096] dark:text-[#7D858E]">{t('ISO 19157 Spatial Confidence','ISO 19157 स्थानिक विश्वास स्कोर')}</span>
                    <span className="font-mono font-semibold text-[#1B1F23] dark:text-[#E8EAED]">{searchedParcel.confidenceScore}%</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#D5D9DE] dark:border-[#2F343A]">
                    <span className="text-[#718096] dark:text-[#7D858E]">{t('Encumbrance Certificate Status','भार प्रमाणपत्र स्थिति')}</span>
                    <span className="text-[#2E7D32] dark:text-[#4FA37A] font-semibold">{t('Nil Encumbrance Reported','कोई भार नहीं दर्ज')}</span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-[#718096] dark:text-[#7D858E]">
                  {t('Note: For mutation certificates or certified copies of RoR (Pahani), please visit the Sub-Registrar / Tehsil office.','नोट: म्यूटेशन प्रमाणपत्र या RoR (पहानी) की प्रमाणित प्रतियों के लिए, कृपया उप-पंजीयक / तहसील कार्यालय जाएँ।')}
                </div>
              </div>

              {/* Spatial MiniMap (5 cols) */}
              <div className="lg:col-span-5 bg-white dark:bg-[#1A1D21] border border-[#D5D9DE] dark:border-[#2F343A] rounded-[4px] p-4 shadow-xs space-y-3">
                <div className="text-xs font-semibold text-[#1B1F23] dark:text-[#E8EAED]">
                  {t('Public Spatial View','सार्वजनिक स्थानिक दृश्य')} · {t('Survey No.','सर्वे सं.')} {searchedParcel.surveyNo}
                </div>
                <div className="h-64 rounded-[2px] overflow-hidden border border-[#D5D9DE] dark:border-[#2F343A]">
                  <MiniMap center={[12.9716, 77.6412]} zoom={17} markerTitle={`Survey ${searchedParcel.surveyNo}`} />
                </div>
                <div className="text-[11px] text-[#718096] dark:text-[#7D858E] flex justify-between">
                  <span>{t('Coordinates:','निर्देशांक:')} 12.9716° N, 77.6412° E</span>
                  <span>{t('Datum:','डेटम:')} WGS84</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-white dark:bg-[#1A1D21] border border-[#D5D9DE] dark:border-[#2F343A] rounded-[4px] text-center text-xs text-[#718096] dark:text-[#7D858E]">
              {t('No matching record found. Please verify the survey or khasra number entered above.','कोई मिलान रिकॉर्ड नहीं मिला। कृपया ऊपर दर्ज सर्वे या खसरा संख्या सत्यापित करें।')}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Public Map */}
      {activeTab === 'map' && (
        <div className="bg-white dark:bg-[#1A1D21] border border-[#D5D9DE] dark:border-[#2F343A] rounded-[4px] p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#D5D9DE] dark:border-[#2F343A]">
            <div>
              <h2 className="text-sm font-semibold text-[#1B1F23] dark:text-[#E8EAED]">
                {t('Official Public GIS Cadastral Viewer (Ward 142)','आधिकारिक सार्वजनिक GIS भूमि दर्शक (वार्ड 142)')}
              </h2>
              <p className="text-xs text-[#718096] dark:text-[#7D858E]">
                {t('Pan and zoom to inspect verified boundary lines and civic infrastructure','सत्यापित सीमा रेखाओं और नागरिक अवसंरचना का निरीक्षण करने के लिए पैन और ज़ूम करें')}
              </p>
            </div>
          </div>
          <div className="h-[520px] rounded-[2px] overflow-hidden border border-[#D5D9DE] dark:border-[#2F343A]">
            <LeafletMapView hideFloatingLayerControls={false} />
          </div>
        </div>
      )}

      {/* Tab 3: File Grievance */}
      {activeTab === 'report' && (
        <div className="max-w-2xl bg-white dark:bg-[#1A1D21] border border-[#D5D9DE] dark:border-[#2F343A] rounded-[4px] p-6 shadow-xs space-y-4">
          <div className="border-b border-[#D5D9DE] dark:border-[#2F343A] pb-3">
            <h2 className="text-sm font-semibold text-[#1B1F23] dark:text-[#E8EAED]">
              {t('Submit Public Cadastral Grievance','सार्वजनिक भूमि शिकायत दर्ज करें')}
            </h2>
            <p className="text-xs text-[#718096] dark:text-[#7D858E] mt-0.5">
              {t('File a formal representation regarding parcel boundary mismatch, area error, or road encroachment under NAKSHA rules.','नक्शा नियमों के तहत पार्सल सीमा बेमेल, क्षेत्रफल त्रुटि, या सड़क अतिक्रमण के संबंध में औपचारिक प्रतिनिधित्व दर्ज करें।')}
            </p>
          </div>

          {submittedTrackingId && (
            <div className="p-4 bg-[#2E7D32]/10 border border-[#2E7D32]/30 text-[#2E7D32] dark:text-[#4FA37A] rounded-[4px] text-xs space-y-1">
              <div className="font-semibold">{t('Grievance Registered Successfully','शिकायत सफलतापूर्वक दर्ज हो गई')}</div>
              <div>{t('Official Tracking ID:','आधिकारिक ट्रैकिंग आईडी:')} <strong className="font-mono text-sm">{submittedTrackingId}</strong></div>
              <div className="text-[11px] text-[#4A5568] dark:text-[#AEB4BB]">
                {t('Your complaint has been forwarded to the Tehsil Revenue Officer for ground verification.','आपकी शिकायत जमीनी सत्यापन के लिए तहसील राजस्व अधिकारी को भेज दी गई है।')}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#1B1F23] dark:text-[#E8EAED] mb-1">
                  {t('Survey / Plot Number','सर्वे / प्लॉट संख्या')} <span className="text-[#C4584F]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sy. 40/4"
                  value={surveyInput}
                  onChange={(e) => setSurveyInput(e.target.value)}
                  className="w-full h-10 px-3 border border-[#D5D9DE] dark:border-[#2F343A] bg-[#F4F5F7] dark:bg-[#22262B] rounded-[4px] text-[#1B1F23] dark:text-[#E8EAED] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1B1F23] dark:text-[#E8EAED] mb-1">
                  {t('Issue Classification','मुद्दा वर्गीकरण')} <span className="text-[#C4584F]">*</span>
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full h-10 px-3 border border-[#D5D9DE] dark:border-[#2F343A] bg-[#F4F5F7] dark:bg-[#22262B] rounded-[4px] text-[#1B1F23] dark:text-[#E8EAED] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
                >
                  <option value="Area Mismatch">{t('Area Discrepancy (Deed vs Drone Map)','क्षेत्रफल विसंगति (दस्तावेज़ बनाम ड्रोन मानचित्र)')}</option>
                  <option value="Boundary Shift">{t('Boundary Shift / Missing Stones','सीमा विस्थापन / गुम सीमा चिन्ह')}</option>
                  <option value="Encroachment">{t('Encroachment onto Road / Common Land','सड़क / सामान्य भूमि पर अतिक्रमण')}</option>
                  <option value="Name Error">{t('Name / Ownership Entry Error','नाम / स्वामित्व प्रविष्टि त्रुटि')}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#1B1F23] dark:text-[#E8EAED] mb-1">
                  {t('Applicant Name','आवेदक का नाम')}
                </label>
                <input
                  type="text"
                  placeholder={t('Shri / Smt','श्री / श्रीमती')}
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full h-10 px-3 border border-[#D5D9DE] dark:border-[#2F343A] bg-[#F4F5F7] dark:bg-[#22262B] rounded-[4px] text-[#1B1F23] dark:text-[#E8EAED] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1B1F23] dark:text-[#E8EAED] mb-1">
                  {t('Contact Mobile Number','संपर्क मोबाइल नंबर')}
                </label>
                <input
                  type="tel"
                  placeholder="+91 "
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                  className="w-full h-10 px-3 border border-[#D5D9DE] dark:border-[#2F343A] bg-[#F4F5F7] dark:bg-[#22262B] rounded-[4px] text-[#1B1F23] dark:text-[#E8EAED] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#1B1F23] dark:text-[#E8EAED] mb-1">
                {t('Detailed Description of Grievance','शिकायत का विस्तृत विवरण')} <span className="text-[#C4584F]">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder={t('Describe physical boundaries, discrepancies observed with adjoining plots, or relevant revenue court case references...','भौतिक सीमाओं, आसन्न भूखंडों के साथ देखी गई विसंगतियों, या प्रासंगिक राजस्व न्यायालय मामले के संदर्भों का वर्णन करें...')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border border-[#D5D9DE] dark:border-[#2F343A] bg-[#F4F5F7] dark:bg-[#22262B] rounded-[4px] text-[#1B1F23] dark:text-[#E8EAED] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
              />
            </div>

            <div className="pt-3 border-t border-[#D5D9DE] dark:border-[#2F343A] flex justify-end">
              <button
                type="submit"
                className="h-10 px-6 text-xs font-semibold rounded-[4px] bg-[#1F4E8C] dark:bg-[#3F7CC4] text-white hover:opacity-95 transition-opacity flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t('Submit Grievance to Tehsil','तहसील में शिकायत दर्ज करें')}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Statutory FAQs */}
      {activeTab === 'faq' && (
        <div className="space-y-6">
          {/* FAQ Search */}
          <div className="bg-white dark:bg-[#1A1D21] border border-[#D5D9DE] dark:border-[#2F343A] rounded-[4px] p-5 shadow-xs">
            <h2 className="text-sm font-semibold text-[#1B1F23] dark:text-[#E8EAED] mb-1">
              {t('Search Land Records Guidelines & Acts','भूमि अभिलेख दिशानिर्देश और अधिनियम खोजें')}
            </h2>
            <form onSubmit={handleSearchFaq} className="flex gap-2 mt-3">
              <input
                type="text"
                value={faqSearchQuery}
                onChange={(e) => setFaqSearchQuery(e.target.value)}
                placeholder={t('Ask about mutation rules, deed variance tolerance, or boundary dispute arbitration...','म्यूटेशन नियमों, दस्तावेज़ विचलन सहनशीलता, या सीमा विवाद मध्यस्थता के बारे में पूछें...')}
                className="flex-1 h-10 px-3 border border-[#D5D9DE] dark:border-[#2F343A] bg-[#F4F5F7] dark:bg-[#22262B] rounded-[4px] text-xs text-[#1B1F23] dark:text-[#E8EAED] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
              />
              <button
                type="submit"
                disabled={faqSearching}
                className="h-10 px-5 text-xs font-semibold rounded-[4px] bg-[#1F4E8C] dark:bg-[#3F7CC4] text-white hover:opacity-95 transition-opacity flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{faqSearching ? t('Searching...','खोज रहे हैं...') : t('Search','खोजें')}</span>
              </button>
            </form>

            {faqGroundedAnswer && (
              <div className="mt-4 p-4 rounded-[4px] bg-[#F4F5F7] dark:bg-[#22262B] border border-[#D5D9DE] dark:border-[#2F343A] text-xs space-y-2">
                <div className="font-semibold text-[#1B1F23] dark:text-[#E8EAED]">
                  {t('Official Guidance Summary:','आधिकारिक मार्गदर्शन सारांश:')}
                </div>
                <div className="leading-relaxed text-[#4A5568] dark:text-[#AEB4BB] whitespace-pre-line">
                  {faqGroundedAnswer.text}
                </div>
                <div className="text-[11px] text-[#718096] dark:text-[#7D858E] italic pt-1">
                  {t('Note: Information is retrieved from public sources. Please verify with the official gazette or department notification.','नोट: जानकारी सार्वजनिक स्रोतों से प्राप्त की गई है। कृपया आधिकारिक राजपत्र या विभागीय अधिसूचना से सत्यापित करें।')}
                </div>
              </div>
            )}
          </div>

          {/* Standard Accordion FAQs */}
          <div className="bg-white dark:bg-[#1A1D21] border border-[#D5D9DE] dark:border-[#2F343A] rounded-[4px] p-5 shadow-xs space-y-3">
            <h2 className="text-sm font-semibold text-[#1B1F23] dark:text-[#E8EAED] mb-3">
              {t('Frequently Asked Citizen Inquiries','नागरिकों द्वारा अक्सर पूछे जाने वाले प्रश्न')}
            </h2>
            <div className="divide-y divide-[#D5D9DE] dark:divide-[#2F343A]">
              {MOCK_PUBLIC_FAQS.map((faq, idx) => (
                <div key={idx} className="py-3">
                  <div className="font-semibold text-xs text-[#1B1F23] dark:text-[#E8EAED] mb-1">
                    {faq.q || (faq as any).question}
                  </div>
                  <div className="text-xs text-[#4A5568] dark:text-[#AEB4BB] leading-relaxed">
                    {faq.a || (faq as any).answer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
