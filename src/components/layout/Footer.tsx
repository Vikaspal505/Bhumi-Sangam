import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { language } = useApp();
  const t = (en: string, hi: string) => language === 'hi' ? hi : en;
  const [modalTitle, setModalTitle] = useState<string | null>(null);

  const policyContent: Record<string, { en: string, hi: string }> = {
    'Website Policies': {
      en: 'This portal is designed, developed and hosted by the National Land Records Modernization Programme (DoLR/NIC). The contents on this website are for information purposes only, enabling the public and authorized revenue staff to access integrated cadastral and registration records.',
      hi: 'इस पोर्टल को राष्ट्रीय भूमि रिकॉर्ड आधुनिकीकरण कार्यक्रम (DoLR/NIC) द्वारा डिज़ाइन, विकसित और होस्ट किया गया है। इस वेबसाइट की सामग्री केवल सूचना के उद्देश्यों के लिए है, जो जनता और अधिकृत राजस्व कर्मचारियों को एकीकृत कैडस्ट्राल और पंजीकरण रिकॉर्ड तक पहुंचने में सक्षम बनाती है।'
    },
    'Accessibility Statement': {
      en: 'We are committed to ensuring that the Bhumi Sangam portal is accessible to all users irrespective of device, technology or ability. It complies with World Wide Web Consortium (W3C) Web Content Accessibility Guidelines (WCAG) 2.1 Level AA and Government of India Guidelines for Indian Government Websites (GIGW 3.0).',
      hi: 'हम यह सुनिश्चित करने के लिए प्रतिबद्ध हैं कि भूमि संगम पोर्टल सभी उपयोगकर्ताओं के लिए सुलभ हो, चाहे वे किसी भी उपकरण, तकनीक या क्षमता का उपयोग करते हों। यह वर्ल्ड वाइड वेब कंसोर्टियम (W3C) वेब कंटेंट एक्सेसिबिलिटी दिशानिर्देशों (WCAG) 2.1 लेवल एए और भारत सरकार के भारतीय सरकारी वेबसाइटों के लिए दिशानिर्देशों (GIGW 3.0) का अनुपालन करता है।'
    },
    'Terms and Conditions': {
      en: 'This website is maintained for official revenue harmonization workflows under the NAKSHA programme. Materials featured on this site may not be reproduced without prior authorization from the Department of Land Resources.',
      hi: 'इस वेबसाइट का रखरखाव नक्शा कार्यक्रम के तहत आधिकारिक राजस्व सामंजस्य कार्यप्रवाह के लिए किया जाता है। भूमि संसाधन विभाग के पूर्व प्राधिकरण के बिना इस साइट पर प्रदर्शित सामग्री को पुन: प्रस्तुत नहीं किया जा सकता है।'
    },
    'Privacy Policy': {
      en: 'As a general rule, this portal does not automatically collect personal information. Access logs and audit trails are recorded solely for verification, integrity checking, and system security as required by statutory land administration rules.',
      hi: 'सामान्य नियम के रूप में, यह पोर्टल स्वचालित रूप से व्यक्तिगत जानकारी एकत्र नहीं करता है। वैधानिक भूमि प्रशासन नियमों के अनुसार सत्यापन, अखंडता जाँच और प्रणाली सुरक्षा के लिए एक्सेस लॉग और ऑडिट ट्रेल्स विशेष रूप से रिकॉर्ड किए जाते हैं।'
    },
    'Help': {
      en: 'For queries regarding cadastral record ingestion, CORS RTK rover connectivity, or deed mutation arbitrations, please contact your respective District Tehsil Collectorate or submit a ticket through the Help Desk.',
      hi: 'कैडस्ट्राल रिकॉर्ड इंजेशन, CORS RTK रोवर कनेक्टिविटी, या डीड म्यूटेशन मध्यस्थता के संबंध में प्रश्नों के लिए, कृपया अपने संबंधित जिला तहसील कलेक्ट्रेट से संपर्क करें या हेल्प डेस्क के माध्यम से टिकट सबमिट करें।'
    },
    'Contact Us': {
      en: 'Department of Land Resources, Ministry of Rural Development, NBO Building, Nirman Bhawan, New Delhi - 110011. Email: support-bhusetu@gov.in | Phone: 011-23062456',
      hi: 'भूमि संसाधन विभाग, ग्रामीण विकास मंत्रालय, एनबीओ बिल्डिंग, निर्माण भवन, नई दिल्ली - 110011। ईमेल: support-bhusetu@gov.in | फोन: 011-23062456'
    },
    'Sitemap': {
      en: 'Portal Navigation Index:\n• Revenue Administration (Mutation Tracking, Dispute Arbitration, Deed Gazette)\n• Field GNSS Rover (CORS Base RTK, Cadastral Ground Truthing, GCP Survey)\n• System Administration (8-Stage GeoAI Harmonization, Ingestion Streams, ISO 19157)\n• Citizen Open Land Registry (Khasra/Survey Search, Public Grievance Filing)',
      hi: 'पोर्टल नेविगेशन इंडेक्स:\n• राजस्व प्रशासन (उत्परिवर्तन ट्रैकिंग, विवाद मध्यस्थता, विलेख राजपत्र)\n• फील्ड GNSS रोवर (CORS बेस RTK, कैडस्ट्राल ग्राउंड ट्रूथिंग, GCP सर्वेक्षण)\n• सिस्टम प्रशासन (8-चरणीय GeoAI हारमोनाइजेशन, इंजेशन स्ट्रीम, ISO 19157)\n• नागरिक ओपन लैंड रजिस्ट्री (खसरा/सर्वेक्षण खोज, लोक शिकायत निवारण)'
    }
  };

  return (
    <>
      <footer className="w-full bg-[#E9ECF0] dark:bg-[#1A1D21] border-t border-[#D5D9DE] dark:border-[#2F343A] text-xs text-[#4A5568] dark:text-[#AEB4BB] mt-auto">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 space-y-4">
          {/* Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] border-b border-[#D5D9DE] dark:border-[#2F343A] pb-4">
            {Object.keys(policyContent).map((link) => (
              <button
                key={link}
                onClick={() => setModalTitle(link)}
                className="text-[#1F4E8C] dark:text-[#7FB0E8] hover:underline font-medium cursor-pointer"
              >
                {t(
                  link, 
                  link === 'Website Policies' ? 'वेबसाइट नीतियां' : 
                  link === 'Accessibility Statement' ? 'अभिगम्यता कथन' : 
                  link === 'Terms and Conditions' ? 'नियम और शर्तें' : 
                  link === 'Privacy Policy' ? 'गोपनीयता नीति' : 
                  link === 'Help' ? 'सहायता' : 
                  link === 'Contact Us' ? 'संपर्क करें' : 'साइटमैप'
                )}
              </button>
            ))}
          </div>

          {/* Official Attribution & Disclaimers */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left text-[12px] leading-relaxed">
            <div className="space-y-1">
              <p className="font-semibold text-[#1B1F23] dark:text-[#E8EAED]">
                {t('Content owned, updated and maintained by Department of Land Resources, Ministry of Rural Development, Government of India','सामग्री का स्वामित्व, अद्यतन और रखरखाव भूमि संसाधन विभाग, ग्रामीण विकास मंत्रालय, भारत सरकार द्वारा किया जाता है')}
              </p>
              <p className="text-[#718096] dark:text-[#7D858E]">
                {t('Designed, developed and hosted by National Informatics Centre (NIC) · Compliant with GIGW 3.0 & WCAG 2.1 Level AA','राष्ट्रीय सूचना विज्ञान केंद्र (NIC) द्वारा डिजाइन, विकसित और होस्ट किया गया · GIGW 3.0 और WCAG 2.1 लेवल AA के अनुरूप')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-center gap-x-4 gap-y-1 text-[#718096] dark:text-[#7D858E] text-[11px] whitespace-nowrap">
              <span>{t('Last updated: 02 October 2026','अंतिम अद्यतन: 02 अक्टूबर 2026')}</span>
              <span className="hidden sm:inline" aria-hidden="true">|</span>
              <span>{t('Portal Version: 2.4.0 (National Release)','पोर्टल संस्करण: 2.4.0 (राष्ट्रीय रिलीज)')}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Policy / Statement Modal */}
      {modalTitle && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setModalTitle(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="footer-dialog-title"
        >
          <div 
            className="bg-white dark:bg-[#22262B] border border-[#D5D9DE] dark:border-[#2F343A] rounded-[4px] p-6 max-w-lg w-full shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#D5D9DE] dark:border-[#2F343A] pb-3 mb-4">
              <h3 id="footer-dialog-title" className="text-base font-semibold text-[#1B1F23] dark:text-[#E8EAED]">
                {t(
                  modalTitle, 
                  modalTitle === 'Website Policies' ? 'वेबसाइट नीतियां' : 
                  modalTitle === 'Accessibility Statement' ? 'अभिगम्यता कथन' : 
                  modalTitle === 'Terms and Conditions' ? 'नियम और शर्तें' : 
                  modalTitle === 'Privacy Policy' ? 'गोपनीयता नीति' : 
                  modalTitle === 'Help' ? 'सहायता' : 
                  modalTitle === 'Contact Us' ? 'संपर्क करें' : 'साइटमैप'
                )}
              </h3>
              <button
                onClick={() => setModalTitle(null)}
                className="p-1 text-[#718096] dark:text-[#AEB4BB] hover:text-[#1B1F23] dark:hover:text-[#E8EAED] cursor-pointer"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>
            <div className="text-[13px] text-[#4A5568] dark:text-[#AEB4BB] leading-relaxed whitespace-pre-line">
              {language === 'hi' ? policyContent[modalTitle]?.hi : policyContent[modalTitle]?.en}
            </div>
            <div className="mt-6 pt-3 border-t border-[#D5D9DE] dark:border-[#2F343A] flex justify-end">
              <button
                onClick={() => setModalTitle(null)}
                className="px-4 py-2 text-xs font-semibold bg-[#1F4E8C] dark:bg-[#3F7CC4] text-white rounded-[4px] hover:opacity-95 cursor-pointer"
              >
                {t('Close','बंद करें')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
