import fs from 'fs';
const file = 'd:/SIH ps2/BhuSetu-main/BhuSetu-main/src/pages/roles/SurveyorDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

if(!content.includes('const t = (en:string, hi:string)')) {
  // We need to find `showToast \n  } = useApp();` and inject language
  content = content.replace('showToast \n  } = useApp();', 'showToast,\n    language \n  } = useApp();\n  const t = (en:string, hi:string) => language === \'hi\' ? hi : en;');
}

const replacements = [
  ['>Home<', ">{t('Home', 'होम')}<"],
  ['>Field GNSS Rover<', ">{t('Field GNSS Rover', 'फ़ील्ड GNSS रोवर')}<"],
  ['>Requisitions<', ">{t('Requisitions', 'मांग (Requisitions)')}<"],
  ['>Field Surveyor GNSS Terminal<', ">{t('Field Surveyor GNSS Terminal', 'फ़ील्ड सर्वेयर GNSS टर्मिनल')}<"],
  ['>Ground-truthing, physical stone inspection, and cm-level RTK positioning linked to CORS Base Bangalore. (Survey of India Rover RTK Connected)<', ">{t('Ground-truthing, physical stone inspection, and cm-level RTK positioning linked to CORS Base Bangalore. (Survey of India Rover RTK Connected)', 'ग्राउंड-ट्रूथिंग, भौतिक पत्थर निरीक्षण, और CORS बेस बैंगलोर से जुड़े cm-स्तर RTK पोजिशनिंग। (सर्वे ऑफ इंडिया रोवर RTK कनेक्टेड)')}<"],
  ['>CORS Base: RTK Fixed<', ">{t('CORS Base: RTK Fixed', 'CORS बेस: RTK फिक्स्ड')}<"],
  ['>Assigned Tasks<', ">{t('Assigned Tasks', 'सौंपे गए कार्य')}<"],
  ['>Ward 142 cadastral survey<', ">{t('Ward 142 cadastral survey', 'वार्ड 142 कैडस्ट्राल सर्वेक्षण')}<"],
  ['>Pending Inspection<', ">{t('Pending Inspection', 'लंबित निरीक्षण')}<"],
  ['>Physical verification required<', ">{t('Physical verification required', 'भौतिक सत्यापन आवश्यक')}<"],
  ['>Completed & Truthed<', ">{t('Completed & Truthed', 'पूर्ण और सत्यापित')}<"],
  ['>Synced to Tehsil server<', ">{t('Synced to Tehsil server', 'तहसील सर्वर से समन्वयित')}<"],
  ['>CORS RTK Precision<', ">{t('CORS RTK Precision', 'CORS RTK सटीकता')}<"],
  ['>3D RMS (Fixed solution)<', ">{t('3D RMS (Fixed solution)', '3D RMS (फिक्स्ड समाधान)')}<"],
  ['>GNSS Constellation<', ">{t('GNSS Constellation', 'GNSS तारामंडल')}<"],
  ['>Field Requisition Queue<', ">{t('Field Requisition Queue', 'फ़ील्ड मांग कतार')}<"],
  ['>Select a survey order to load boundary attributes<', ">{t('Select a survey order to load boundary attributes', 'सीमा विशेषताएँ लोड करने के लिए एक सर्वेक्षण आदेश चुनें')}<"],
  [' orders<', " {t('orders', 'आदेश')}<"],
  ['>Issue: <', ">{t('Issue:', 'मुद्दा:')} <"],
  ['>Target: <', ">{t('Target:', 'लक्ष्य:')} <"],
  ['>Due: <', ">{t('Due:', 'देय:')} <"],
  ['>Due: Today, <', ">{t('Due: Today, ', 'देय: आज, ')}<"],
  ['>Due: Tomorrow, <', ">{t('Due: Tomorrow, ', 'देय: कल, ')}<"],
  ['>Site Context - <', ">{t('Site Context - ', 'साइट संदर्भ - ')}<"],
  ['>Target coordinates: <', ">{t('Target coordinates: ', 'लक्ष्य निर्देशांक: ')}<"],
  ['>Identify Landmarks<', ">{t('Identify Landmarks', 'लैंडमार्क पहचानें')}<"],
  ['>CORS RTK Observation Log - Form No. 4A<', ">{t('CORS RTK Observation Log - Form No. 4A', 'CORS RTK अवलोकन लॉग - फॉर्म नंबर 4A')}<"],
  ['>Record physical boundary stone observations and submit to Tehsil server<', ">{t('Record physical boundary stone observations and submit to Tehsil server', 'भौतिक सीमा पत्थर टिप्पणियों को रिकॉर्ड करें और तहसील सर्वर पर जमा करें')}<"],
  ['>Server Synced<', ">{t('Server Synced', 'सर्वर सिंक्रनाइज़')}<"],
  ['>Not Synced<', ">{t('Not Synced', 'सिंक्रनाइज़ नहीं')}<"],
  ['>Latitude (WGS84 / EPSG:4326) *<', ">{t('Latitude (WGS84 / EPSG:4326) *', 'अक्षांश (WGS84 / EPSG:4326) *')}<"],
  ['>Longitude (WGS84 / EPSG:4326) *<', ">{t('Longitude (WGS84 / EPSG:4326) *', 'देशांतर (WGS84 / EPSG:4326) *')}<"],
  ['>Observed Accuracy (cm RMS) *<', ">{t('Observed Accuracy (cm RMS) *', 'प्रेक्षित सटीकता (cm RMS) *')}<"],
  ['>Boundary Verification Action *<', ">{t('Boundary Verification Action *', 'सीमा सत्यापन कार्रवाई *')}<"],
  ['>Field Surveyor Remarks & Ground Observations *<', ">{t('Field Surveyor Remarks & Ground Observations *', 'फ़ील्ड सर्वेयर की टिप्पणियाँ और जमीनी अवलोकन *')}<"],
  ['>Note: Standard observation text may also be generated via the Help Assistant at bottom-right.<', ">{t('Note: Standard observation text may also be generated via the Help Assistant at bottom-right.', 'नोट: मानक अवलोकन पाठ निचले-दाएँ पर सहायता सहायक के माध्यम से भी उत्पन्न किया जा सकता है।')}<"],
  ['>Geotagged site photograph attached (Latitude/Longitude embedded in EXIF)<', ">{t('Geotagged site photograph attached (Latitude/Longitude embedded in EXIF)', 'जियोटैग की गई साइट तस्वीर संलग्न (EXIF में अक्षांश/देशांतर एम्बेडेड)')}<"],
  ['>Clear Data<', ">{t('Clear Data', 'डेटा साफ़ करें')}<"],
  ['>Submit Observation Form<', ">{t('Submit Observation Form', 'अवलोकन फॉर्म जमा करें')}<"]
];

for(const [find, replace] of replacements) {
  content = content.split(find).join(replace);
}

// Special case for task priority since it is rendered inside string interpolation or mixed nodes:
// Assuming it might be inside <span>{task.surveyNo} - High Priority</span>
content = content.replace(/\{task\.status\}\n/g, "{task.status === 'Completed' ? t('Completed', 'पूर्ण') : task.status === 'Pending' ? t('Pending', 'लंबित') : t('In Progress', 'प्रगति पर')}\n");

content = content.replace(/\{task.surveyNo\} - High Priority/g, "{task.surveyNo} - {t('High Priority', 'उच्च प्राथमिकता')}");
content = content.replace(/\{task.surveyNo\} - Medium Priority/g, "{task.surveyNo} - {t('Medium Priority', 'मध्यम प्राथमिकता')}");
content = content.replace(/\{task.surveyNo\} - Low Priority/g, "{task.surveyNo} - {t('Low Priority', 'निम्न प्राथमिकता')}");


fs.writeFileSync(file, content);
console.log("Replacements complete");
