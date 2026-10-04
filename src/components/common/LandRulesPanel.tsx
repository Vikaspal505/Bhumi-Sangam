import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BookOpen, 
  Search, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle
} from 'lucide-react';
import { GroundingCitation } from '../../types';

export const LandRulesPanel: React.FC = () => {
  const { askSearchGrounding, language } = useApp();
  const t = (en: string, hi: string) => language === 'hi' ? hi : en;

  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{
    text: string;
    citations: GroundingCitation[];
    disclaimer: string;
  } | null>({
    text: "Under the NAKSHA (National Geospatial Knowledge-based Land Survey) Programme, urban land records are harmonized across drone orthorectified imagery (ORI at ≤5 cm GSD) and revenue cadastral Tippani maps. Permissible area variance between deed area and digital drone measurement is typically set at ±1.0% in commercial zones before formal mutation approval.",
    citations: [
      { title: "Department of Land Resources (DoLR) - NAKSHA Guidelines", url: "https://dolr.gov.in" },
      { title: "Survey of India - Urban Cadastral Standard Operating Procedure", url: "https://surveyofindia.gov.in" }
    ],
    disclaimer: "Information is retrieved from public sources. Please verify with the official gazette or department notification."
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const presetQuestions = [
    t("Latest NAKSHA programme operational guidelines","नवीनतम नक्शा कार्यक्रम संचालन दिशानिर्देश"),
    t("Current statutory procedures for mutation of land records","भूमि अभिलेखों के म्यूटेशन के लिए वर्तमान वैधानिक प्रक्रियाएं"),
    t("Survey of India cadastral accuracy and permissible tolerance limits","भारतीय सर्वेक्षण विभाग की कैडस्ट्राल सटीकता और स्वीकार्य सहिष्णुता सीमाएं")
  ];

  const handleSearch = async (questionToSearch: string) => {
    if (!questionToSearch.trim()) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await askSearchGrounding(questionToSearch);
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || t('Failed to retrieve statutory guidelines.','वैधानिक दिशानिर्देश प्राप्त करने में विफल।'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1A1D21] rounded-[4px] border border-[#D5D9DE] dark:border-[#2F343A] p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#D5D9DE] dark:border-[#2F343A]">
        <div>
          <h2 className="text-sm font-semibold text-[#1B1F23] dark:text-[#E8EAED]">
            {t('Land Rules and Statutory Updates','भूमि नियम और वैधानिक अपडेट')}
          </h2>
          <p className="text-xs text-[#718096] dark:text-[#7D858E] mt-0.5">
            {t('Statutory updates sourced from official Government of India notifications and department portals.','भारत सरकार की आधिकारिक सूचनाओं और विभागीय पोर्टलों से प्राप्त वैधानिक अपडेट।')}
          </p>
        </div>
      </div>

      {/* Suggested Queries list (plain text links, not chips) */}
      <div className="text-xs text-[#4A5568] dark:text-[#AEB4BB]">
        <span className="font-semibold text-[#718096] dark:text-[#7D858E] mr-2">
          {t('Suggested queries:','सुझाए गए प्रश्न:')}
        </span>
        <span className="inline-flex flex-wrap gap-x-4 gap-y-1">
          {presetQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(q);
                handleSearch(q);
              }}
              className="text-[#1F4E8C] dark:text-[#7FB0E8] hover:underline cursor-pointer text-left"
            >
              {q}
            </button>
          ))}
        </span>
      </div>

      {/* Search Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(query);
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={t("Search regulations (e.g. permissible deed variance, inheritance mutation, CORS datum)...","नियम खोजें (उदा. स्वीकार्य विलेख भिन्नता, विरासत म्यूटेशन, CORS डेटम)...")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-10 px-3 text-xs rounded-[4px] border border-[#D5D9DE] dark:border-[#2F343A] bg-[#F4F5F7] dark:bg-[#22262B] text-[#1B1F23] dark:text-[#E8EAED] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="h-10 px-4 bg-[#1F4E8C] dark:bg-[#3F7CC4] text-white text-xs font-semibold rounded-[4px] hover:opacity-95 disabled:opacity-50 transition-opacity flex items-center gap-1.5 cursor-pointer"
        >
          {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
          <span>{t('Search','खोजें')}</span>
        </button>
      </form>

      {/* Error State */}
      {errorMsg && (
        <div className="p-3 rounded-[4px] bg-[#C4584F]/10 border border-[#C4584F]/30 text-[#C62828] dark:text-[#C4584F] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="p-4 rounded-[4px] bg-[#F4F5F7] dark:bg-[#22262B] border border-[#D5D9DE] dark:border-[#2F343A] text-xs text-[#718096] dark:text-[#AEB4BB] flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#1F4E8C] dark:text-[#3F7CC4]" />
          <span>{t('Retrieving statutory records from department gazettes...','विभागीय राजपत्रों से वैधानिक रिकॉर्ड प्राप्त किए जा रहे हैं...')}</span>
        </div>
      )}

      {/* Result Display: Numbered list with source link & disclaimer */}
      {result && !loading && (
        <div className="p-4 rounded-[4px] bg-[#F4F5F7] dark:bg-[#22262B] border border-[#D5D9DE] dark:border-[#2F343A] text-xs space-y-3">
          <div className="leading-relaxed text-[#1B1F23] dark:text-[#E8EAED] whitespace-pre-line">
            {result.text}
          </div>

          {result.citations && result.citations.length > 0 && (
            <div className="pt-2 border-t border-[#D5D9DE] dark:border-[#2F343A]">
              <span className="font-semibold text-[#718096] dark:text-[#7D858E] block mb-1">
                {t('Official Sources:','आधिकारिक स्रोत:')}
              </span>
              <ol className="list-decimal list-inside space-y-1 text-[#4A5568] dark:text-[#AEB4BB]">
                {result.citations.map((cite, i) => (
                  <li key={i}>
                    <span>{cite.title} — </span>
                    <a
                      href={cite.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1F4E8C] dark:text-[#7FB0E8] hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <span>{t('Source:','स्रोत:')} {cite.url}</span>
                      <ExternalLink className="w-3 h-3 inline" />
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Legal Disclaimer Note */}
          <div className="text-[11px] text-[#718096] dark:text-[#7D858E] italic pt-1">
            {t('Note: Information is retrieved from public sources. Please verify with the official gazette or department notification.','नोट: जानकारी सार्वजनिक स्रोतों से प्राप्त की गई है। कृपया आधिकारिक राजपत्र या विभागीय अधिसूचना से सत्यापित करें।')}
          </div>
        </div>
      )}
    </div>
  );
};
