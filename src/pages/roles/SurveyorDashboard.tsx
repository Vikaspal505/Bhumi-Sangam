import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SurveyorTask } from '../../types';
import { 
  Compass, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Send, 
  Radio, 
  Download,
  ChevronRight,
  ExternalLink,
  Layers,
  FileText
} from 'lucide-react';
import { MiniMap } from '../../components/map/MiniMap';

export const SurveyorDashboard: React.FC = () => {
  const { 
    surveyorTasks, 
    updateSurveyorTask, 
    gnssPoints, 
    parcels,
    setSelectedParcel,
    selectedParcel,
    draftedRemark,
    setDraftedRemark,
    fetchNearbyContext,
    showToast,
    language 
  } = useApp();
  const t = (en:string, hi:string) => language === 'hi' ? hi : en;

  const [selectedTask, setSelectedTask] = useState<SurveyorTask>(surveyorTasks[0]);
  const [gnssLat, setGnssLat] = useState<number>(selectedTask?.coordinates[0] || 12.9716);
  const [gnssLng, setGnssLng] = useState<number>(selectedTask?.coordinates[1] || 77.6412);
  const [accuracyCm, setAccuracyCm] = useState<number>(1.8);
  const [boundaryAction, setBoundaryAction] = useState<string>('Match Confirmed');
  const [remarks, setRemarks] = useState<string>('Physical boundary stone located. Compound wall aligns within 2 cm of drone orthorectified imagery.');
  const [hasPhoto, setHasPhoto] = useState<boolean>(true);
  const [isSynced, setIsSynced] = useState<boolean>(true);
  const [loadingSiteContext, setLoadingSiteContext] = useState<boolean>(false);
  const [siteContextText, setSiteContextText] = useState<string | null>(null);

  // If a remark was drafted by the Help assistant, insert it
  useEffect(() => {
    if (draftedRemark) {
      setRemarks(draftedRemark);
      setDraftedRemark(null);
      showToast("Remark Inserted", "Observation text imported from Help Assistant buffer.", "info");
    }
  }, [draftedRemark]);

  const pendingTasks = surveyorTasks.filter(t => t.status === 'Pending' || t.status === 'In Progress');
  const completedTasks = surveyorTasks.filter(t => t.status === 'Completed');

  const handleSubmitVerification = (e: React.FormEvent) => {
    e.preventDefault();
    updateSurveyorTask(selectedTask.id, {
      verifiedDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      gnssLatitude: gnssLat,
      gnssLongitude: gnssLng,
      accuracyCm: accuracyCm,
      boundaryAction: boundaryAction,
      fieldRemarks: remarks,
      photoAttached: hasPhoto
    });
    setIsSynced(false);
    setTimeout(() => {
      setIsSynced(true);
      showToast("Cloud Sync Complete", "Survey observations synchronized with Tehsil server.", "success");
    }, 1200);
  };

  const handleSelectTask = (task: SurveyorTask) => {
    setSelectedTask(task);
    setGnssLat(task.coordinates[0]);
    setGnssLng(task.coordinates[1]);
    const matchedParcel = parcels.find(p => p.id === task.parcelId);
    if (matchedParcel) {
      setSelectedParcel(matchedParcel);
    }
  };

  const handleFetchSiteAround = async (task = selectedTask) => {
    setLoadingSiteContext(true);
    showToast("Resolving Site Landmarks", `Retrieving access routes and civic landmarks near ${task.surveyNo}...`, "info");
    try {
      const res = await fetchNearbyContext(task.coordinates[0], task.coordinates[1], {
        surveyNo: task.surveyNo,
        ward: 'Ward 142'
      });
      setSiteContextText(res.text);
      showToast("Landmarks Located", "Location intelligence verified.", "success");
    } catch (e: any) {
      showToast("Location Error", e.message || "Could not retrieve site context", "warning");
    } finally {
      setLoadingSiteContext(false);
    }
  };

  return (
    <div className="p-6 max-w-[1280px] mx-auto space-y-6">
      {/* Official Header with Breadcrumb */}
      <div className="space-y-1.5 pb-3 border-b border-[#D5D9DE] dark:border-[#2F343A]">
        <nav className="text-xs text-[#718096] dark:text-[#7D858E] flex items-center gap-1.5" aria-label="Breadcrumb">
          <span>{t('Home', 'होम')}</span>
          <ChevronRight className="w-3 h-3 text-[#718096] dark:text-[#7D858E]" />
          <span className="text-[#4A5568] dark:text-[#AEB4BB]">{t('Field GNSS Rover', 'फ़ील्ड GNSS रोवर')}</span>
          <ChevronRight className="w-3 h-3 text-[#718096] dark:text-[#7D858E]" />
          <span className="font-semibold text-[#1B1F23] dark:text-[#E8EAED]">{t('Requisitions', 'मांग (Requisitions)')}</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1B1F23] dark:text-[#E8EAED]">
              {t('Field Surveyor GNSS Terminal','फील्ड सर्वेक्षक GNSS टर्मिनल')}
            </h1>
            <p className="text-xs text-[#718096] dark:text-[#7D858E] mt-0.5">
              {t('Ground-truthing, physical stone inspection, and cm-level RTK positioning linked to CORS Base Bangalore. (Survey of India Rover RTK Connected)','CORS बेस बैंगलोर से जुड़े ग्राउंड-ट्रूथिंग, भौतिक पत्थर निरीक्षण और सेमी-स्तरीय RTK पोजिशनिंग। (भारतीय सर्वेक्षण रोवर RTK कनेक्टेड)')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 border border-[#D5D9DE] dark:border-[#2F343A] bg-[#E9ECF0] dark:bg-[#22262B] text-[#4A5568] dark:text-[#AEB4BB] rounded-[2px] font-medium flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#2E7D32] dark:text-[#4FA37A]" />
              <span>{t('CORS Base: RTK Fixed', 'CORS बेस: RTK फिक्स्ड')}</span>
            </span>
          </div>
        </div>
      </div>

      {/* KPI Section: 5-column bordered summary strip */}
      <div className="bg-white dark:bg-[#1A1D21] border border-[#D5D9DE] dark:border-[#2F343A] rounded-[4px] overflow-hidden shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[#D5D9DE] dark:divide-[#2F343A]">
          <div className="p-4">
            <div className="flex items-center justify-between text-[13px] text-[#4A5568] dark:text-[#AEB4BB]">
              <span>{t('Assigned Tasks', 'सौंपे गए कार्य')}</span>
              <Compass className="w-4 h-4 text-[#718096] dark:text-[#7D858E]" />
            </div>
            <div className="text-[28px] font-semibold text-[#1B1F23] dark:text-[#E8EAED] leading-tight my-1">
              {surveyorTasks.length}
            </div>
            <div className="text-[13px] text-[#718096] dark:text-[#7D858E]">
              {t('Ward 142 cadastral survey','वार्ड 142 कैडस्ट्राल सर्वेक्षण')}
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between text-[13px] text-[#4A5568] dark:text-[#AEB4BB]">
              <span>{t('Pending Inspection', 'लंबित निरीक्षण')}</span>
              <Clock className="w-4 h-4 text-[#718096] dark:text-[#7D858E]" />
            </div>
            <div className="text-[28px] font-semibold text-[#1B1F23] dark:text-[#E8EAED] leading-tight my-1">
              {pendingTasks.length}
            </div>
            <div className="text-[13px] text-[#718096] dark:text-[#7D858E]">
              {t('Physical verification required','भौतिक सत्यापन आवश्यक')}
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between text-[13px] text-[#4A5568] dark:text-[#AEB4BB]">
              <span>{t('Completed & Truthed', 'पूर्ण और सत्यापित')}</span>
              <CheckCircle2 className="w-4 h-4 text-[#718096] dark:text-[#7D858E]" />
            </div>
            <div className="text-[28px] font-semibold text-[#1B1F23] dark:text-[#E8EAED] leading-tight my-1">
              {completedTasks.length}
            </div>
            <div className="text-[13px] text-[#718096] dark:text-[#7D858E]">
              {t('Synced to Tehsil server','तहसील सर्वर से सिंक किया गया')}
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between text-[13px] text-[#4A5568] dark:text-[#AEB4BB]">
              <span>{t('CORS RTK Precision', 'CORS RTK सटीकता')}</span>
              <Radio className="w-4 h-4 text-[#718096] dark:text-[#7D858E]" />
            </div>
            <div className="text-[28px] font-semibold text-[#1B1F23] dark:text-[#E8EAED] leading-tight my-1 font-mono">
              ±1.8 cm
            </div>
            <div className="text-[13px] text-[#718096] dark:text-[#7D858E]">
              {t('3D RMS (Fixed solution)','3D RMS (फिक्स्ड समाधान)')}
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between text-[13px] text-[#4A5568] dark:text-[#AEB4BB]">
              <span>{t('GNSS Constellation', 'GNSS तारामंडल')}</span>
              <MapPin className="w-4 h-4 text-[#718096] dark:text-[#7D858E]" />
            </div>
            <div className="text-[28px] font-semibold text-[#1B1F23] dark:text-[#E8EAED] leading-tight my-1 font-mono">
              24 SV
            </div>
            <div className="text-[13px] text-[#718096] dark:text-[#7D858E]">
              {t('GPS + GLONASS + NavIC','GPS + GLONASS + NavIC')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Assigned Field Tasks List (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1A1D21] border border-[#D5D9DE] dark:border-[#2F343A] rounded-[4px] shadow-xs flex flex-col">
          <div className="p-4 border-b border-[#D5D9DE] dark:border-[#2F343A] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#1B1F23] dark:text-[#E8EAED]">
                {t('Field Requisition Queue','फील्ड मांग कतार')}
              </h2>
              <p className="text-xs text-[#718096] dark:text-[#7D858E]">
                {t('Select a survey order to load boundary attributes','सीमा विशेषताओं को लोड करने के लिए एक सर्वेक्षण आदेश चुनें')}
              </p>
            </div>
            <span className="text-xs font-mono text-[#718096] dark:text-[#7D858E]">
              {surveyorTasks.length} {t('orders','आदेश')}
            </span>
          </div>

          <div className="divide-y divide-[#D5D9DE] dark:divide-[#2F343A] overflow-y-auto max-h-[560px]">
            {surveyorTasks.map((task, idx) => {
              const isSelected = selectedTask.id === task.id;
              return (
                <div
                  key={task.id}
                  onClick={() => handleSelectTask(task)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#E9ECF0] dark:bg-[#22262B] border-l-4 border-[#1F4E8C] dark:border-[#3F7CC4]'
                      : idx % 2 === 0
                      ? 'bg-white dark:bg-[#1A1D21]'
                      : 'bg-[#F8F9FA] dark:bg-[#1E2227]'
                  } hover:bg-[#E9ECF0] dark:hover:bg-[#22262B]`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-semibold text-[#1F4E8C] dark:text-[#7FB0E8]">
                      {task.id}
                    </span>
                    <span className={`inline-block px-1.5 py-0.5 rounded-[2px] border text-[10px] font-medium ${
                      task.status === 'Completed'
                        ? 'border-[#2E7D32]/40 text-[#2E7D32] dark:text-[#4FA37A]'
                        : task.status === 'In Progress'
                        ? 'border-[#B78103]/40 text-[#B78103] dark:text-[#C99A3C]'
                        : 'border-[#1565C0]/40 text-[#1565C0] dark:text-[#5C8FCB]'
                    }`}>
                      {task.status === 'Completed' ? t('Completed', 'पूर्ण') : task.status === 'Pending' ? t('Pending', 'लंबित') : t('In Progress', 'प्रगति पर')}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-[#1B1F23] dark:text-[#E8EAED]">
                    {t('Survey No.','सर्वेक्षण संख्या')} {task.surveyNo} · {task.priority} {t('Priority','प्राथमिकता')}
                  </h3>
                  <p className="text-[11px] text-[#4A5568] dark:text-[#AEB4BB] mt-0.5">
                    {t('Issue:','मुद्दा:')} {task.issueReason || task.instructions}
                  </p>
                  <div className="mt-2 text-[11px] text-[#718096] dark:text-[#7D858E] flex justify-between font-mono">
                    <span>{t('Target:','लक्ष्य:')} {task.targetArea || task.address}</span>
                    <span>{t('Due:','नियत:')} {task.assignedDate || task.dueTime}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Ground Truthing Verification Form & Map (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Spatial MiniMap Verification */}
          <div className="bg-white dark:bg-[#1A1D21] border border-[#D5D9DE] dark:border-[#2F343A] rounded-[4px] p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-[#1B1F23] dark:text-[#E8EAED]">
                  {t('Site Context','साइट संदर्भ')} · {t('Survey No.','सर्वेक्षण संख्या')} {selectedTask.surveyNo}
                </h3>
                <p className="text-[11px] text-[#718096] dark:text-[#7D858E]">
                  {t('Target coordinates:','लक्ष्य निर्देशांक:')} {selectedTask.coordinates[0].toFixed(5)}, {selectedTask.coordinates[1].toFixed(5)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleFetchSiteAround(selectedTask)}
                disabled={loadingSiteContext}
                className="px-2.5 py-1 text-xs border border-[#D5D9DE] dark:border-[#2F343A] bg-[#F4F5F7] dark:bg-[#22262B] text-[#1F4E8C] dark:text-[#7FB0E8] hover:underline rounded-[2px] cursor-pointer"
              >
                {loadingSiteContext ? t('Locating...','खोज रहा है...') : t('Identify Landmarks','सीमाचिह्न पहचानें')}
              </button>
            </div>

            {/* MiniMap */}
            <div className="h-48 rounded-[2px] overflow-hidden border border-[#D5D9DE] dark:border-[#2F343A]">
              <MiniMap 
                center={selectedTask.coordinates} 
                zoom={17} 
                markerTitle={`Survey ${selectedTask.surveyNo}`} 
              />
            </div>

            {siteContextText && (
              <div className="p-3 bg-[#F4F5F7] dark:bg-[#22262B] border border-[#D5D9DE] dark:border-[#2F343A] rounded-[2px] text-xs leading-relaxed text-[#4A5568] dark:text-[#AEB4BB]">
                <span className="font-semibold text-[#1B1F23] dark:text-[#E8EAED] block mb-1">Civic Landmarks Reference:</span>
                {siteContextText}
              </div>
            )}
          </div>

          {/* Form: GNSS RTK Ground Truthing Form */}
          <form 
            onSubmit={handleSubmitVerification}
            className="bg-white dark:bg-[#1A1D21] border border-[#D5D9DE] dark:border-[#2F343A] rounded-[4px] p-5 shadow-xs space-y-4"
          >
            <div className="border-b border-[#D5D9DE] dark:border-[#2F343A] pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#1B1F23] dark:text-[#E8EAED]">
                  {t('CORS RTK Observation Log · Form No. 4A','CORS RTK अवलोकन लॉग · फॉर्म संख्या 4A')}
                </h3>
                <p className="text-xs text-[#718096] dark:text-[#7D858E]">
                  {t('Record physical boundary stone observations and submit to Tehsil server','भौतिक सीमा पत्थर अवलोकन रिकॉर्ड करें और तहसील सर्वर में सबमिट करें')}
                </p>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-[2px] ${
                isSynced ? 'text-[#2E7D32] dark:text-[#4FA37A]' : 'text-[#B78103] dark:text-[#C99A3C]'
              }`}>
                {isSynced ? t('● Server Synced','● सर्वर सिंक किया गया') : t('○ Pending Dispatch','○ प्रेषण लंबित')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1B1F23] dark:text-[#E8EAED] mb-1">
                  {t('Latitude (WGS84 / EPSG:4326)','अक्षांश (WGS84 / EPSG:4326)')} <span className="text-[#C4584F]">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={gnssLat}
                  onChange={(e) => setGnssLat(parseFloat(e.target.value))}
                  className="w-full h-10 px-3 font-mono border border-[#D5D9DE] dark:border-[#2F343A] bg-[#F4F5F7] dark:bg-[#22262B] rounded-[4px] text-[#1B1F23] dark:text-[#E8EAED] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1B1F23] dark:text-[#E8EAED] mb-1">
                  {t('Longitude (WGS84 / EPSG:4326)','देशांतर (WGS84 / EPSG:4326)')} <span className="text-[#C4584F]">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={gnssLng}
                  onChange={(e) => setGnssLng(parseFloat(e.target.value))}
                  className="w-full h-10 px-3 font-mono border border-[#D5D9DE] dark:border-[#2F343A] bg-[#F4F5F7] dark:bg-[#22262B] rounded-[4px] text-[#1B1F23] dark:text-[#E8EAED] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1B1F23] dark:text-[#E8EAED] mb-1">
                  {t('Observed Accuracy (cm RMS)','प्रेक्षित सटीकता (सेमी RMS)')} <span className="text-[#C4584F]">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={accuracyCm}
                  onChange={(e) => setAccuracyCm(parseFloat(e.target.value))}
                  className="w-full h-10 px-3 font-mono border border-[#D5D9DE] dark:border-[#2F343A] bg-[#F4F5F7] dark:bg-[#22262B] rounded-[4px] text-[#1B1F23] dark:text-[#E8EAED] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1B1F23] dark:text-[#E8EAED] mb-1">
                  {t('Boundary Verification Action','सीमा सत्यापन कार्रवाई')} <span className="text-[#C4584F]">*</span>
                </label>
                <select
                  value={boundaryAction}
                  onChange={(e) => setBoundaryAction(e.target.value)}
                  className="w-full h-10 px-3 border border-[#D5D9DE] dark:border-[#2F343A] bg-[#F4F5F7] dark:bg-[#22262B] rounded-[4px] text-[#1B1F23] dark:text-[#E8EAED] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
                >
                  <option value="Match Confirmed">{t('Physical Stone Confirmed (Within 5 cm)','भौतिक पत्थर की पुष्टि (5 सेमी के भीतर)')}</option>
                  <option value="Offset Discrepancy">{t('Offset Discrepancy Found (Shift Needed)','ऑफ़सेट विसंगति पाई गई (स्थानांतरण आवश्यक)')}</option>
                  <option value="Encroachment Detected">{t('Encroachment / Wall Mismatch','अतिक्रमण / दीवार का बेमेल होना')}</option>
                  <option value="Missing Stone Re-pegged">{t('Missing Stone Re-pegged on Site','गायब पत्थर को साइट पर फिर से लगाया गया')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1B1F23] dark:text-[#E8EAED] mb-1">
                {t('Field Surveyor Remarks & Ground Observations','फील्ड सर्वेक्षक की टिप्पणियां और जमीनी अवलोकन')} <span className="text-[#C4584F]">*</span>
              </label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full p-3 text-xs border border-[#D5D9DE] dark:border-[#2F343A] bg-[#F4F5F7] dark:bg-[#22262B] rounded-[4px] text-[#1B1F23] dark:text-[#E8EAED] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
              />
              <p className="text-[11px] text-[#718096] dark:text-[#7D858E] mt-0.5">
                {t('Note: Standard observation text may also be generated via the Help Assistant at bottom-right.','नोट: मानक अवलोकन पाठ नीचे-दाईं ओर हेल्प असिस्टेंट के माध्यम से भी उत्पन्न किया जा सकता है।')}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1 text-xs">
              <input
                type="checkbox"
                id="photoAttached"
                checked={hasPhoto}
                onChange={(e) => setHasPhoto(e.target.checked)}
                className="rounded-[2px] border-[#D5D9DE] dark:border-[#2F343A] text-[#1F4E8C]"
              />
              <label htmlFor="photoAttached" className="text-[#4A5568] dark:text-[#AEB4BB]">
                {t('Geotagged site photograph attached (Latitude/Longitude embedded in EXIF)','जियोटैग की गई साइट की तस्वीर संलग्न है (EXIF में अक्षांश/देशांतर शामिल)')}
              </label>
            </div>

            <div className="pt-3 border-t border-[#D5D9DE] dark:border-[#2F343A] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => handleSelectTask(selectedTask)}
                className="h-10 px-4 text-xs font-semibold rounded-[4px] border border-[#D5D9DE] dark:border-[#2F343A] bg-transparent text-[#4A5568] dark:text-[#AEB4BB] hover:bg-[#F4F5F7] dark:hover:bg-[#22262B] cursor-pointer"
              >
                {t('Reset','रीसेट')}
              </button>
              <button
                type="submit"
                className="h-10 px-5 text-xs font-semibold rounded-[4px] bg-[#1F4E8C] dark:bg-[#3F7CC4] text-white hover:opacity-95 transition-opacity flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('Submit Verification & Dispatch to Tehsil','सत्यापन सबमिट करें और तहसील को भेजें')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
