import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Parcel, MutationRecord } from '../../types';
import { LandRulesPanel } from '../../components/common/LandRulesPanel';
import { OfficialPrintHeader } from '../../components/common/OfficialPrintHeader';
import { 
  FileCheck2, 
  AlertTriangle, 
  Scale, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Send, 
  ChevronRight, 
  Download, 
  Filter, 
  Search,
  Printer
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

export const RevenueDashboard: React.FC = () => {
  const { 
    parcels, 
    mutationRecords, 
    updateMutationStatus, 
    setSelectedParcel, 
    selectedParcel,
    conflicts,
    resolveConflict,
    showToast,
    language 
  } = useApp();
  const t = (en: string, hi: string) => language === 'hi' ? hi : en;

  const [activeTab, setActiveTab] = useState<'approvals' | 'mutations' | 'conflicts' | 'records'>('approvals');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const pendingApprovals = parcels.filter(p => p.status === 'needs_review');
  const verifiedCount = parcels.filter(p => p.status === 'verified').length;
  const areaMismatches = parcels.filter(p => p.areaDeltaPercent > 5);
  const disputedParcels = parcels.filter(p => p.status === 'conflict');
  const activeMutations = mutationRecords.filter(m => m.status !== 'Sanctioned');

  const discrepancyChartData = parcels
    .filter(p => p.areaDeltaPercent > 3)
    .slice(0, 6)
    .map(p => ({
      survey: p.surveyNo,
      record: p.recordAreaSqM,
      measured: p.measuredAreaSqM,
      delta: p.areaDeltaPercent
    }));

  const handleApproveParcel = (parcel: Parcel) => {
    parcel.status = 'verified';
    parcel.confidenceScore = Math.min(99, parcel.confidenceScore + 10);
    showToast("Boundary Approved", `${parcel.surveyNo} approved and finalized into official RoR.`, "success");
  };

  const handleRequestSurvey = (parcel: Parcel) => {
    showToast("Field Survey Ordered", `Survey requisition dispatched for ${parcel.surveyNo} to Field Surveyor.`, "info");
  };

  const handleDownloadCSV = (datasetName: string) => {
    showToast("Download Initialized", `Exporting ${datasetName} as official CSV...`, "info");
  };

  const handleDownloadPDF = (datasetName: string) => {
    showToast("Print Format Ready", `Opening A4/Legal print preview for ${datasetName}...`, "info");
    window.print();
  };

  return (
    <div className="p-6 max-w-[1280px] mx-auto space-y-6">
      {/* Official Government Print Header - Hidden on screen, active on print */}
      <OfficialPrintHeader 
        reportTitle="Tehsil Revenue Cadastral Reconciliation Report"
        subTitle="Statutory Land Records Harmonization, Mutation Adjudication & RoR Verification"
      />

      {/* Official Header with Breadcrumb */}
      <div className="space-y-1.5 pb-3 border-b border-[#D5D9DE] dark:border-[#2F343A]">
        {/* Breadcrumb */}
        <nav className="text-xs text-[#718096] dark:text-[#7D858E] flex items-center gap-1.5" aria-label="Breadcrumb">
          <span>{t('Home','होम')}</span>
          <ChevronRight className="w-3 h-3 text-[#718096] dark:text-[#7D858E]" />
          <span className="text-[#4A5568] dark:text-[#AEB4BB]">{t('Revenue Administration','राजस्व प्रशासन')}</span>
          <ChevronRight className="w-3 h-3 text-[#718096] dark:text-[#7D858E]" />
          <span className="font-semibold text-[#1B1F23] dark:text-[#E8EAED]">{t('Overview','अवलोकन')}</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1B1F23] dark:text-[#E8EAED]">
              {t('Revenue Administration Workspace','राजस्व प्रशासन कार्यक्षेत्र')}
            </h1>
            <p className="text-xs text-[#718096] dark:text-[#7D858E] mt-0.5">
              {t('Reconcile cadastral boundaries, sanction mutations, and arbitrate spatial discrepancies for Jamabandi / Bhoomi records. (Tehsil Level Portal)','जमाबंदी / भूमि रिकॉर्ड के लिए कैडस्ट्राल सीमाओं का मिलान करें, म्यूटेशन को मंज़ूरी दें, और स्थानिक विसंगतियों की मध्यस्थता करें। (तहसील स्तर पोर्टल)')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownloadPDF('Revenue_Order_Gazette')}
              className="h-10 px-4 text-xs font-semibold rounded-[4px] bg-[#1F4E8C] dark:bg-[#3F7CC4] text-white hover:opacity-95 transition-opacity flex items-center gap-1.5 cursor-pointer"
              title="Print official A4/Legal administrative gazette report"
            >
              <Printer className="w-4 h-4" />
              <span>{t('Print Official Gazette','आधिकारिक राजपत्र प्रिंट करें')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Section: Single "At a glance" 5-column bordered summary strip */}
      <div className="bg-white dark:bg-[#1A1D21] border border-[#D5D9DE] dark:border-[#2F343A] rounded-[4px] overflow-hidden shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[#D5D9DE] dark:divide-[#2F343A]">
          {/* Cell 1 */}
          <div 
            onClick={() => setActiveTab('approvals')}
            className="p-4 hover:bg-[#F4F5F7] dark:hover:bg-[#22262B] transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-[13px] text-[#4A5568] dark:text-[#AEB4BB]">
              <span>{t('Pending Approvals','लंबित स्वीकृतियां')}</span>
              <Clock className="w-4 h-4 text-[#718096] dark:text-[#7D858E]" />
            </div>
            <div className="text-[28px] font-semibold text-[#1B1F23] dark:text-[#E8EAED] leading-tight my-1">
              {pendingApprovals.length}
            </div>
            <div className="text-[13px] text-[#718096] dark:text-[#7D858E]">
              {t('Needs officer signoff','अधिकारी के हस्ताक्षर की आवश्यकता')}
            </div>
          </div>

          {/* Cell 2 */}
          <div 
            onClick={() => setActiveTab('records')}
            className="p-4 hover:bg-[#F4F5F7] dark:hover:bg-[#22262B] transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-[13px] text-[#4A5568] dark:text-[#AEB4BB]">
              <span>{t('Verified Records','सत्यापित रिकॉर्ड')}</span>
              <CheckCircle2 className="w-4 h-4 text-[#718096] dark:text-[#7D858E]" />
            </div>
            <div className="text-[28px] font-semibold text-[#1B1F23] dark:text-[#E8EAED] leading-tight my-1">
              {verifiedCount}
            </div>
            <div className="text-[13px] text-[#718096] dark:text-[#7D858E]">
              {t('82.5% of active ward','सक्रिय वार्ड का 82.5%')}
            </div>
          </div>

          {/* Cell 3 */}
          <div 
            onClick={() => setActiveTab('approvals')}
            className="p-4 hover:bg-[#F4F5F7] dark:hover:bg-[#22262B] transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-[13px] text-[#4A5568] dark:text-[#AEB4BB]">
              <span>{t('Area Mismatches','क्षेत्रफल विसंगतियाँ')}</span>
              <Scale className="w-4 h-4 text-[#718096] dark:text-[#7D858E]" />
            </div>
            <div className="text-[28px] font-semibold text-[#1B1F23] dark:text-[#E8EAED] leading-tight my-1">
              {areaMismatches.length}
            </div>
            <div className="text-[13px] text-[#718096] dark:text-[#7D858E]">
              {t('RoR vs ORI Delta > 5%','RoR बनाम ORI अंतर > 5%')}
            </div>
          </div>

          {/* Cell 4 */}
          <div 
            onClick={() => setActiveTab('mutations')}
            className="p-4 hover:bg-[#F4F5F7] dark:hover:bg-[#22262B] transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-[13px] text-[#4A5568] dark:text-[#AEB4BB]">
              <span>{t('Mutation Requests','म्यूटेशन अनुरोध')}</span>
              <FileCheck2 className="w-4 h-4 text-[#718096] dark:text-[#7D858E]" />
            </div>
            <div className="text-[28px] font-semibold text-[#1B1F23] dark:text-[#E8EAED] leading-tight my-1">
              {activeMutations.length}
            </div>
            <div className="text-[13px] text-[#718096] dark:text-[#7D858E]">
              {t('Devolution & deeds','हस्तांतरण और विलेख')}
            </div>
          </div>

          {/* Cell 5 */}
          <div 
            onClick={() => setActiveTab('conflicts')}
            className="p-4 hover:bg-[#F4F5F7] dark:hover:bg-[#22262B] transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-[13px] text-[#4A5568] dark:text-[#AEB4BB]">
              <span>{t('Disputed Encumbrance','विवादित भार')}</span>
              <AlertTriangle className="w-4 h-4 text-[#718096] dark:text-[#7D858E]" />
            </div>
            <div className="text-[28px] font-semibold text-[#1B1F23] dark:text-[#E8EAED] leading-tight my-1">
              {disputedParcels.length}
            </div>
            <div className="text-[13px] text-[#718096] dark:text-[#7D858E]">
              {t('Flagged in Bhoomi index','भूमि सूचकांक में चिह्नित')}
            </div>
          </div>
        </div>
      </div>

      {/* Official Statutory Regulations Panel */}
      <LandRulesPanel />

      {/* Navigation Tabs (flat, 4px corners, clean borders) */}
      <div className="flex items-center gap-1 border-b border-[#D5D9DE] dark:border-[#2F343A] text-xs font-semibold">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'approvals'
              ? 'border-[#1F4E8C] dark:border-[#3F7CC4] text-[#1F4E8C] dark:text-[#7FB0E8]'
              : 'border-transparent text-[#4A5568] dark:text-[#AEB4BB] hover:text-[#1B1F23] dark:hover:text-[#E8EAED]'
          }`}
        >
          {t('Review & Approval Queue','समीक्षा और स्वीकृति कतार')} ({pendingApprovals.length})
        </button>
        <button
          onClick={() => setActiveTab('mutations')}
          className={`px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'mutations'
              ? 'border-[#1F4E8C] dark:border-[#3F7CC4] text-[#1F4E8C] dark:text-[#7FB0E8]'
              : 'border-transparent text-[#4A5568] dark:text-[#AEB4BB] hover:text-[#1B1F23] dark:hover:text-[#E8EAED]'
          }`}
        >
          {t('Mutation Registration Ledger','म्यूटेशन पंजीकरण खाता')} ({mutationRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('conflicts')}
          className={`px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'conflicts'
              ? 'border-[#1F4E8C] dark:border-[#3F7CC4] text-[#1F4E8C] dark:text-[#7FB0E8]'
              : 'border-transparent text-[#4A5568] dark:text-[#AEB4BB] hover:text-[#1B1F23] dark:hover:text-[#E8EAED]'
          }`}
        >
          {t('Boundary Conflicts','सीमा विवाद')} ({conflicts.length})
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'records'
              ? 'border-[#1F4E8C] dark:border-[#3F7CC4] text-[#1F4E8C] dark:text-[#7FB0E8]'
              : 'border-transparent text-[#4A5568] dark:text-[#AEB4BB] hover:text-[#1B1F23] dark:hover:text-[#E8EAED]'
          }`}
        >
          {t('All 40 Ward Records','सभी 40 वार्ड रिकॉर्ड')}
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'approvals' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Table Container (2 cols) */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1A1D21] border border-[#D5D9DE] dark:border-[#2F343A] rounded-[4px] shadow-xs">
            <div className="p-4 border-b border-[#D5D9DE] dark:border-[#2F343A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-[#1B1F23] dark:text-[#E8EAED]">
                  {t('Parcels Pending Officer Approval','अधिकारी की मंजूरी के लिए लंबित पार्सल')}
                </h3>
                <p className="text-xs text-[#718096] dark:text-[#7D858E]">
                  {t('Validations required before title deed finalization or Jamabandi entry','स्वत्व विलेख को अंतिम रूप देने या जमाबंदी प्रविष्टि से पहले सत्यापन आवश्यक है')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadCSV('Pending_Approvals')}
                  className="px-2.5 py-1 text-xs border border-[#D5D9DE] dark:border-[#2F343A] bg-[#F4F5F7] dark:bg-[#22262B] text-[#4A5568] dark:text-[#AEB4BB] hover:text-[#1B1F23] rounded-[2px] cursor-pointer flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => handleDownloadPDF('Pending_Approvals')}
                  className="px-2.5 py-1 text-xs border border-[#D5D9DE] dark:border-[#2F343A] bg-[#F4F5F7] dark:bg-[#22262B] text-[#4A5568] dark:text-[#AEB4BB] hover:text-[#1B1F23] rounded-[2px] cursor-pointer flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>PDF</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#E9ECF0] dark:bg-[#22262B] text-[#4A5568] dark:text-[#AEB4BB] font-semibold border-b border-[#D5D9DE] dark:border-[#2F343A] sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">{t('Parcel ID','पार्सल आईडी')}</th>
                    <th className="py-2.5 px-3">{t('Survey / Khasra','सर्वेक्षण / खसरा')}</th>
                    <th className="py-2.5 px-3">{t('Owner Name','मालिक का नाम')}</th>
                    <th className="py-2.5 px-3 text-right">{t('Deed Area (m²)','विलेख क्षेत्रफल (m²)')}</th>
                    <th className="py-2.5 px-3 text-right">{t('Measured (m²)','मापा गया (m²)')}</th>
                    <th className="py-2.5 px-3 text-right">{t('Variance','अंतर')}</th>
                    <th className="py-2.5 px-3 text-right">{t('Actions','क्रियाएँ')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5D9DE] dark:divide-[#2F343A]">
                  {pendingApprovals.map((parcel, idx) => (
                    <tr 
                      key={parcel.id}
                      onClick={() => setSelectedParcel(parcel)}
                      className={`cursor-pointer transition-colors ${
                        selectedParcel?.id === parcel.id
                          ? 'bg-[#E9ECF0]/70 dark:bg-[#22262B]'
                          : idx % 2 === 0
                          ? 'bg-white dark:bg-[#1A1D21]'
                          : 'bg-[#F8F9FA] dark:bg-[#1E2227]'
                      } hover:bg-[#E9ECF0] dark:hover:bg-[#22262B]`}
                    >
                      <td className="py-3 px-3 font-mono text-[#1F4E8C] dark:text-[#7FB0E8] font-medium">{parcel.id}</td>
                      <td className="py-3 px-3 font-medium text-[#1B1F23] dark:text-[#E8EAED]">
                        {parcel.surveyNo} <span className="text-[#718096] dark:text-[#7D858E]">({parcel.khasraNo})</span>
                      </td>
                      <td className="py-3 px-3 text-[#1B1F23] dark:text-[#E8EAED]">{parcel.ownerName}</td>
                      <td className="py-3 px-3 text-right font-mono text-[#718096] dark:text-[#AEB4BB]">{parcel.recordAreaSqM}</td>
                      <td className="py-3 px-3 text-right font-mono font-medium text-[#1B1F23] dark:text-[#E8EAED]">{parcel.measuredAreaSqM}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="inline-block px-1.5 py-0.5 rounded-[2px] border border-[#C99A3C]/40 text-[#B78103] dark:text-[#C99A3C] text-[11px] font-medium">
                          Δ {parcel.areaDeltaPercent}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleApproveParcel(parcel)}
                            className="px-2.5 py-1 text-xs font-medium rounded-[2px] bg-[#2E7D32] dark:bg-[#4FA37A] text-white hover:opacity-90 cursor-pointer"
                          >
                            {t('Approve','मंज़ूर')}
                          </button>
                          <button
                            onClick={() => handleRequestSurvey(parcel)}
                            className="px-2 py-1 text-xs border border-[#D5D9DE] dark:border-[#2F343A] text-[#4A5568] dark:text-[#AEB4BB] hover:bg-[#F4F5F7] dark:hover:bg-[#22262B] rounded-[2px] cursor-pointer"
                          >
                            {t('Survey','सर्वेक्षण')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-3 border-t border-[#D5D9DE] dark:border-[#2F343A] bg-[#F4F5F7] dark:bg-[#22262B] text-xs text-[#718096] dark:text-[#7D858E] flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span>{t('Rows per page:','प्रति पृष्ठ पंक्तियाँ:')}</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-2 py-1 bg-white dark:bg-[#1A1D21] border border-[#D5D9DE] dark:border-[#2F343A] rounded-[2px] text-xs"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>{language === 'hi' ? `1 से ${pendingApprovals.length} प्रविष्टियां दिखाई जा रही हैं (कुल ${pendingApprovals.length})` : `Showing 1 to ${pendingApprovals.length} of ${pendingApprovals.length} entries`}</span>
              </div>

              <div className="flex items-center gap-1">
                <button disabled className="px-2.5 py-1 border border-[#D5D9DE] dark:border-[#2F343A] rounded-[2px] bg-white dark:bg-[#1A1D21] disabled:opacity-50">
                  {t('Previous','पिछला')}
                </button>
                <span className="px-2 py-1 font-semibold text-[#1B1F23] dark:text-[#E8EAED]">1</span>
                <button disabled className="px-2.5 py-1 border border-[#D5D9DE] dark:border-[#2F343A] rounded-[2px] bg-white dark:bg-[#1A1D21] disabled:opacity-50">
                  {t('Next','अगला')}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Selected Parcel Inspector Card (1 col) */}
          <div className="space-y-4">
            {selectedParcel ? (
              <div className="bg-white dark:bg-[#1A1D21] border border-[#D5D9DE] dark:border-[#2F343A] rounded-[4px] p-5 shadow-xs space-y-4">
                <div className="border-b border-[#D5D9DE] dark:border-[#2F343A] pb-3">
                  <div className="text-[11px] text-[#718096] dark:text-[#7D858E]">{t('Selected Cadastral Record','चयनित कैडस्ट्राल रिकॉर्ड')}</div>
                  <h3 className="text-base font-semibold text-[#1B1F23] dark:text-[#E8EAED]">
                    {t('Survey No.','सर्वेक्षण संख्या')} {selectedParcel.surveyNo}
                  </h3>
                  <p className="text-xs text-[#718096] dark:text-[#7D858E]">
                    {t('Khasra','खसरा')} {selectedParcel.khasraNo} · {selectedParcel.landUse}
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#D5D9DE] dark:border-[#2F343A]">
                    <span className="text-[#718096] dark:text-[#7D858E]">{t('Registered Owner','पंजीकृत मालिक')}</span>
                    <span className="font-semibold text-[#1B1F23] dark:text-[#E8EAED]">{selectedParcel.ownerName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#D5D9DE] dark:border-[#2F343A]">
                    <span className="text-[#718096] dark:text-[#7D858E]">{t('Deed Area (RoR)','विलेख क्षेत्रफल (RoR)')}</span>
                    <span className="font-mono text-[#1B1F23] dark:text-[#E8EAED]">{selectedParcel.recordAreaSqM} m²</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#D5D9DE] dark:border-[#2F343A]">
                    <span className="text-[#718096] dark:text-[#7D858E]">{t('Drone Measured (ORI)','ड्रोन से मापा गया (ORI)')}</span>
                    <span className="font-mono font-semibold text-[#1B1F23] dark:text-[#E8EAED]">{selectedParcel.measuredAreaSqM} m²</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#D5D9DE] dark:border-[#2F343A]">
                    <span className="text-[#718096] dark:text-[#7D858E]">{t('Area Discrepancy','क्षेत्रफल विसंगति')}</span>
                    <span className="font-semibold text-[#B78103] dark:text-[#C99A3C]">
                      Δ {selectedParcel.areaDeltaPercent}% ({Math.abs(selectedParcel.recordAreaSqM - selectedParcel.measuredAreaSqM).toFixed(1)} m²)
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#D5D9DE] dark:border-[#2F343A]">
                    <span className="text-[#718096] dark:text-[#7D858E]">{t('ISO 19157 Quality','ISO 19157 गुणवत्ता')}</span>
                    <span className="font-mono font-semibold text-[#1B1F23] dark:text-[#E8EAED]">{selectedParcel.confidenceScore}%</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-semibold text-[#718096] dark:text-[#7D858E] block">
                    {t('Conflation Lineage:','एकीकरण वंशावली:')}
                  </span>
                  <ul className="text-xs text-[#4A5568] dark:text-[#AEB4BB] space-y-1">
                    {selectedParcel.lineage.map((l, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#718096]" />
                        <span>{l}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-[#D5D9DE] dark:border-[#2F343A] space-y-2">
                  <button
                    onClick={() => handleApproveParcel(selectedParcel)}
                    className="w-full h-10 text-xs font-semibold rounded-[4px] bg-[#1F4E8C] dark:bg-[#3F7CC4] text-white hover:opacity-95 transition-opacity cursor-pointer"
                  >
                    {t('Confirm & Update Jamabandi','पुष्टि करें और जमाबंदी अपडेट करें')}
                  </button>
                  <button
                    onClick={() => handleRequestSurvey(selectedParcel)}
                    className="w-full h-10 text-xs font-semibold rounded-[4px] border border-[#D5D9DE] dark:border-[#2F343A] bg-transparent text-[#4A5568] dark:text-[#AEB4BB] hover:bg-[#F4F5F7] dark:hover:bg-[#22262B] transition-colors cursor-pointer"
                  >
                    {t('Dispatch Field Surveyor Requisition','फील्ड सर्वेक्षक की मांग भेजें')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#1A1D21] border border-[#D5D9DE] dark:border-[#2F343A] rounded-[4px] p-6 text-center text-xs text-[#718096] dark:text-[#7D858E]">
                {t('Select a parcel row in the table to inspect revenue attributes, variance, and conflation lineage.','राजस्व विशेषताओं, अंतर और एकीकरण वंशावली का निरीक्षण करने के लिए तालिका में एक पार्सल पंक्ति का चयन करें।')}
              </div>
            )}

            {/* Discrepancy Chart (plain 1px gridlines, muted colors) */}
            <div className="bg-white dark:bg-[#1A1D21] border border-[#D5D9DE] dark:border-[#2F343A] rounded-[4px] p-4 shadow-xs space-y-2">
              <div className="text-xs font-semibold text-[#1B1F23] dark:text-[#E8EAED]">
                {t('Spatial Discrepancy Overview (m²)','स्थानिक विसंगति अवलोकन (m²)')}
              </div>
              <p className="text-[11px] text-[#718096] dark:text-[#7D858E]">
                {t('Comparison of registered deed area vs drone measured area','पंजीकृत विलेख क्षेत्र बनाम ड्रोन द्वारा मापे गए क्षेत्र की तुलना')}
              </p>
              <div className="h-44 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={discrepancyChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2F343A" opacity={0.5} />
                    <XAxis dataKey="survey" tick={{ fontSize: 10, fill: '#7D858E' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#7D858E' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#22262B', 
                        borderColor: '#2F343A', 
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: '#E8EAED'
                      }} 
                    />
                    <Bar dataKey="record" name="Deed Record" fill="#5C8FCB" />
                    <Bar dataKey="measured" name="Drone Measurement" fill="#C99A3C" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Mutation Tracker */}
      {activeTab === 'mutations' && (
        <div className="bg-white dark:bg-[#1A1D21] border border-[#D5D9DE] dark:border-[#2F343A] rounded-[4px] shadow-xs">
          <div className="p-4 border-b border-[#D5D9DE] dark:border-[#2F343A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#1B1F23] dark:text-[#E8EAED]">
                {t('Mutation Registration Ledger','म्यूटेशन पंजीकरण खाता')}
              </h3>
              <p className="text-xs text-[#718096] dark:text-[#7D858E]">
                {t('Track devolution, sale deeds, and partition notices against verified spatial parcels','सत्यापित स्थानिक पार्सल के विरुद्ध हस्तांतरण, बिक्री विलेख और विभाजन नोटिस को ट्रैक करें')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadCSV('Mutation_Ledger')}
                className="px-2.5 py-1 text-xs border border-[#D5D9DE] dark:border-[#2F343A] bg-[#F4F5F7] dark:bg-[#22262B] text-[#4A5568] dark:text-[#AEB4BB] hover:text-[#1B1F23] rounded-[2px] cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#E9ECF0] dark:bg-[#22262B] text-[#4A5568] dark:text-[#AEB4BB] font-semibold border-b border-[#D5D9DE] dark:border-[#2F343A]">
                <tr>
                  <th className="py-2.5 px-3">{t('Mutation ID','म्यूटेशन आईडी')}</th>
                  <th className="py-2.5 px-3">{t('Survey / Khasra','सर्वेक्षण / खसरा')}</th>
                  <th className="py-2.5 px-3">{t('Applicant Name','आवेदक का नाम')}</th>
                  <th className="py-2.5 px-3">{t('Transferor','हस्तांतरणकर्ता')}</th>
                  <th className="py-2.5 px-3">{t('Type','प्रकार')}</th>
                  <th className="py-2.5 px-3">{t('Filing Date','दाखिल करने की तिथि')}</th>
                  <th className="py-2.5 px-3">{t('Status','स्थिति')}</th>
                  <th className="py-2.5 px-3 text-right">{t('Actions','क्रियाएँ')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D5D9DE] dark:divide-[#2F343A]">
                {mutationRecords.map((mut, idx) => (
                  <tr 
                    key={mut.id}
                    className={`transition-colors ${
                      idx % 2 === 0
                        ? 'bg-white dark:bg-[#1A1D21]'
                        : 'bg-[#F8F9FA] dark:bg-[#1E2227]'
                    } hover:bg-[#E9ECF0] dark:hover:bg-[#22262B]`}
                  >
                    <td className="py-3 px-3 font-mono text-[#1F4E8C] dark:text-[#7FB0E8] font-medium">{mut.id}</td>
                    <td className="py-3 px-3 font-medium text-[#1B1F23] dark:text-[#E8EAED]">{mut.surveyNo}</td>
                    <td className="py-3 px-3 text-[#1B1F23] dark:text-[#E8EAED]">{mut.applicantName}</td>
                    <td className="py-3 px-3 text-[#718096] dark:text-[#AEB4BB]">{mut.transferorName}</td>
                    <td className="py-3 px-3 text-[#4A5568] dark:text-[#AEB4BB]">{mut.mutationType}</td>
                    <td className="py-3 px-3 font-mono text-[#718096] dark:text-[#7D858E]">{mut.filingDate}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-1.5 py-0.5 rounded-[2px] border text-[11px] font-medium ${
                        mut.status === 'Sanctioned'
                          ? 'border-[#2E7D32]/40 text-[#2E7D32] dark:text-[#4FA37A]'
                          : mut.status === 'Notice Issued'
                          ? 'border-[#B78103]/40 text-[#B78103] dark:text-[#C99A3C]'
                          : 'border-[#1565C0]/40 text-[#1565C0] dark:text-[#5C8FCB]'
                      }`}>
                        {mut.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {mut.status !== 'Sanctioned' ? (
                        <button
                          onClick={() => {
                            updateMutationStatus(mut.id, 'Sanctioned');
                            showToast("Mutation Sanctioned", `Sanction order generated for ${mut.id}.`, "success");
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded-[2px] bg-[#1F4E8C] dark:bg-[#3F7CC4] text-white hover:opacity-90 cursor-pointer"
                        >
                          {t('Sanction Order','स्वीकृति आदेश')}
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#2E7D32] dark:text-[#4FA37A] font-medium">{t('Sanctioned','स्वीकृत')}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Conflicts View */}
      {activeTab === 'conflicts' && (
        <div className="bg-white dark:bg-[#1A1D21] border border-[#D5D9DE] dark:border-[#2F343A] rounded-[4px] p-5 shadow-xs space-y-4">
          <div className="border-b border-[#D5D9DE] dark:border-[#2F343A] pb-3">
            <h3 className="text-sm font-semibold text-[#1B1F23] dark:text-[#E8EAED]">
              {t('Active Spatial & Encumbrance Disputes','सक्रिय स्थानिक और भार विवाद')}
            </h3>
            <p className="text-xs text-[#718096] dark:text-[#7D858E]">
              {t('Discrepancies identified across survey maps, deed registers, and drone orthorectified measurements','सर्वेक्षण मानचित्रों, विलेख रजिस्टरों और ड्रोन ऑर्थोरेक्टिफाइड मापों में पहचानी गई विसंगतियाँ')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {conflicts.map((conf) => (
              <div 
                key={conf.id} 
                className="p-4 border border-[#D5D9DE] dark:border-[#2F343A] bg-[#F4F5F7] dark:bg-[#22262B] rounded-[4px] space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-[#1F4E8C] dark:text-[#7FB0E8]">{conf.id}</span>
                  <span className="text-[11px] px-1.5 py-0.2 rounded-[2px] border border-[#C4584F]/40 text-[#C62828] dark:text-[#C4584F] font-medium">
                    {conf.conflictType}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#1B1F23] dark:text-[#E8EAED]">{conf.surveyNo}</h4>
                <p className="text-[11px] text-[#4A5568] dark:text-[#AEB4BB] leading-relaxed">
                  {conf.aiSuggestion.reasoning}
                </p>
                <div className="pt-2 border-t border-[#D5D9DE] dark:border-[#2F343A] flex gap-2">
                  <button
                    onClick={() => resolveConflict(conf.id, 'accepted_ai')}
                    className="flex-1 py-1.5 text-xs font-semibold rounded-[2px] bg-[#1F4E8C] dark:bg-[#3F7CC4] text-white hover:opacity-95 transition-opacity cursor-pointer"
                  >
                    {t('Accept Recommendation','सिफारिश स्वीकार करें')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: All Records */}
      {activeTab === 'records' && (
        <div className="bg-white dark:bg-[#1A1D21] border border-[#D5D9DE] dark:border-[#2F343A] rounded-[4px] shadow-xs">
          <div className="p-4 border-b border-[#D5D9DE] dark:border-[#2F343A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#1B1F23] dark:text-[#E8EAED]">
                {t('Official Cadastral Records Ledger (Ward 142)','आधिकारिक कैडस्ट्राल रिकॉर्ड खाता (वार्ड 142)')}
              </h3>
              <p className="text-xs text-[#718096] dark:text-[#7D858E]">
                {t('All 40 urban land parcels reconciled with NAKSHA spatial indices','नक्शा स्थानिक सूचकांकों के साथ मिलान किए गए सभी 40 शहरी भूमि पार्सल')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadCSV('Cadastral_Records_Ward142')}
                className="px-2.5 py-1 text-xs border border-[#D5D9DE] dark:border-[#2F343A] bg-[#F4F5F7] dark:bg-[#22262B] text-[#4A5568] dark:text-[#AEB4BB] hover:text-[#1B1F23] rounded-[2px] cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#E9ECF0] dark:bg-[#22262B] text-[#4A5568] dark:text-[#AEB4BB] font-semibold border-b border-[#D5D9DE] dark:border-[#2F343A]">
                <tr>
                  <th className="py-2.5 px-3">{t('Parcel ID','पार्सल आईडी')}</th>
                  <th className="py-2.5 px-3">{t('Survey / Plot','सर्वेक्षण / प्लॉट')}</th>
                  <th className="py-2.5 px-3">{t('Owner Name','मालिक का नाम')}</th>
                  <th className="py-2.5 px-3">{t('Land Use','भूमि उपयोग')}</th>
                  <th className="py-2.5 px-3 text-right">{t('Deed Area (m²)','विलेख क्षेत्रफल (m²)')}</th>
                  <th className="py-2.5 px-3 text-right">{t('Measured (m²)','मापा गया (m²)')}</th>
                  <th className="py-2.5 px-3">{t('Status','स्थिति')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D5D9DE] dark:divide-[#2F343A]">
                {parcels.map((p, idx) => (
                  <tr 
                    key={p.id}
                    className={`transition-colors ${
                      idx % 2 === 0
                        ? 'bg-white dark:bg-[#1A1D21]'
                        : 'bg-[#F8F9FA] dark:bg-[#1E2227]'
                    } hover:bg-[#E9ECF0] dark:hover:bg-[#22262B]`}
                  >
                    <td className="py-2.5 px-3 font-mono font-medium text-[#1F4E8C] dark:text-[#7FB0E8]">{p.id}</td>
                    <td className="py-2.5 px-3 font-medium text-[#1B1F23] dark:text-[#E8EAED]">{p.surveyNo}</td>
                    <td className="py-2.5 px-3 text-[#1B1F23] dark:text-[#E8EAED]">{p.ownerName}</td>
                    <td className="py-2.5 px-3 text-[#4A5568] dark:text-[#AEB4BB]">{p.landUse}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#718096] dark:text-[#AEB4BB]">{p.recordAreaSqM}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#1B1F23] dark:text-[#E8EAED]">{p.measuredAreaSqM}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-1.5 py-0.5 rounded-[2px] border text-[11px] font-medium ${
                        p.status === 'verified'
                          ? 'border-[#2E7D32]/40 text-[#2E7D32] dark:text-[#4FA37A]'
                          : p.status === 'conflict'
                          ? 'border-[#C4584F]/40 text-[#C62828] dark:text-[#C4584F]'
                          : 'border-[#B78103]/40 text-[#B78103] dark:text-[#C99A3C]'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
