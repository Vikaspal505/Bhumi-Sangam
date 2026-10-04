import fs from 'fs';
const file = 'd:/SIH ps2/BhuSetu-main/BhuSetu-main/src/pages/GeoCadAIDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

if(!content.includes('useApp')) {
  content = content.replace("import React, { useState, useRef, useEffect, useCallback } from 'react';", "import React, { useState, useRef, useEffect, useCallback } from 'react';\nimport { useApp } from '../context/AppContext';");
}

if(!content.includes('const { language } = useApp();')) {
  content = content.replace('export const GeoCadAIDashboard: React.FC = () => {', "export const GeoCadAIDashboard: React.FC = () => {\n  const { language } = useApp();\n  const t = (en:string, hi:string) => language === 'hi' ? hi : en;");
}

const replacements = [
  ['>GeoCadAI Platform<', ">{t('GeoCadAI Platform', 'जियोकैड एआई प्लेटफॉर्म')}<"],
  ['>NAKSHA Enterprise Engine v3.0<', ">{t('NAKSHA Enterprise Engine v3.0', 'नक्शा एंटरप्राइज़ इंजन v3.0')}<"],
  ['>Bi-Temporal Kafka Stream Active<', ">{t('Bi-Temporal Kafka Stream Active', 'द्वि-कालिक काफ्का स्ट्रीम सक्रिय')}<"],
  ['> Valid Time (Tv): ', ">{t('Valid Time (Tv):', 'वैध समय (Tv):')} "],
  ['> Transaction (Tt): ', ">{t('Transaction (Tt):', 'लेन-देन (Tt):')} "],
  ['>Zone 4 - High-Density Urban Sector<', ">{t('Zone 4 - High-Density Urban Sector', 'ज़ोन 4 - उच्च-घनत्व शहरी क्षेत्र')}<"],
  ['>Export<', ">{t('Export', 'निर्यात')}<"],
  
  ['>Multi-Source Layer & Ingestion<', ">{t('Multi-Source Layer & Ingestion', 'बहु-स्रोत परत और अंतर्ग्रहण')}<"],
  ['title="Ingestion Dropzone"', "title={t('Ingestion Dropzone','अंतर्ग्रहण ड्रॉपज़ोन')}"],
  ['title="Interactive Layer Hierarchy"', "title={t('Interactive Layer Hierarchy','संवादात्मक परत पदानुक्रम')}"],
  ['title="Point Cloud & Geometry Status"', "title={t('Point Cloud & Geometry Status','पॉइंट क्लाउड और ज्यामिति स्थिति')}"],
  ['>LiDAR Density<', ">{t('LiDAR Density', 'LiDAR घनत्व')}<"],
  ['>RMSE H-Accuracy<', ">{t('RMSE H-Accuracy', 'RMSE H-सटीकता')}<"],
  ['>CSG-to-B-Rep Status<', ">{t('CSG-to-B-Rep Status', 'CSG-to-B-Rep स्थिति')}<"],
  ['label="Conversion Complete"', "label={t('Conversion Complete','रूपांतरण पूर्ण')}"],
  
  ['>2D View<', ">{t('2D View', '2D दृश्य')}<"],
  ['>3D View<', ">{t('3D View', '3D दृश्य')}<"],
  ['>Volumetric Overlay Legend<', ">{t('Volumetric Overlay Legend', 'वॉल्यूमेट्रिक ओवरले लेजेंड')}<"],
  ['>Valid Titles<', ">{t('Valid Titles', 'वैध स्वामित्व')}<"],
  ['>Pending Disputes<', ">{t('Pending Disputes', 'लंबित विवाद')}<"],
  ['>Overlap / Conflict<', ">{t('Overlap / Conflict', 'ओवरलैप / विवाद')}<"],
  ['>Bi-Temporal Historic Time-Travel<', ">{t('Bi-Temporal Historic Time-Travel', 'द्वि-कालिक ऐतिहासिक समय-यात्रा')}<"],
  ['>Bitemporal Split-Screen Comparison<', ">{t('Bitemporal Split-Screen Comparison', 'द्वि-कालिक स्प्लिट-स्क्रीन तुलना')}<"],
  ['>Legacy 2D Map ◂▸ 3D Extracted Footprints<', ">{t('Legacy 2D Map ◂▸ 3D Extracted Footprints', 'विरासत 2D मानचित्र ◂▸ 3D निकाले गए पदचिह्न')}<"],
  
  ['> REAL-TIME PROCESSING CONSOLE ', ">{t(' REAL-TIME PROCESSING CONSOLE ', ' रीयल-टाइम प्रोसेसिंग कंसोल ')} "],
  
  ['>Advanced AI Inspector & LADM Hub<', ">{t('Advanced AI Inspector & LADM Hub', 'उन्नत AI इंस्पेक्टर और LADM हब')}<"],
  
  ["label:'Schema Matcher'", "label:t('Schema Matcher','स्कीमा मैचर')"],
  ["label:'Topology Engine'", "label:t('Topology Engine','टोपोलॉजी इंजन')"],
  ["label:'Change Detection'", "label:t('Change Detection','बदलाव की पहचान')"],
  ["label:'LADM Valuation'", "label:t('LADM Valuation','LADM मूल्यांकन')"],
  ["label:'GeoAI Assistant'", "label:t('GeoAI Assistant','GeoAI सहायक')"],
  
  ['> Magneto Schema Matcher<', ">{t(' Magneto Schema Matcher', ' मैग्नेटो स्कीमा मैचर')}<"],
  ['label="SLM + LLM Reranking Active"', "label={t('SLM + LLM Reranking Active','SLM + LLM रीरैंकिंग सक्रिय')}"],
  ['>Live column alignment between source revenue CSVs and target LADM Ed II classes.<', ">{t('Live column alignment between source revenue CSVs and target LADM Ed II classes.', 'स्रोत राजस्व CSV और लक्ष्य LADM Ed II वर्गों के बीच लाइव कॉलम संरेखण।')}<"],
  ['>Run Reranker<', ">{t('Run Reranker', 'रीरैंकर चलाएं')}<"],
  ['>Manual Override<', ">{t('Manual Override', 'मैनुअल ओवरराइड')}<"],
  
  ['> Point Cloud & Topology Engine<', ">{t(' Point Cloud & Topology Engine', ' पॉइंट क्लाउड और टोपोलॉजी इंजन')}<"],
  ['label="Review Pending"', "label={t('Review Pending','समीक्षा लंबित')}"],
  ['>GMM Noise Filter Metrics<', ">{t('GMM Noise Filter Metrics', 'GMM नॉइज़ फ़िल्टर मेट्रिक्स')}<"],
  ['>Vegetation Noise Filtered<', ">{t('Vegetation Noise Filtered', 'वनस्पति शोर फ़िल्टर किया गया')}<"],
  ['>ICP Boundary Alignment<', ">{t('ICP Boundary Alignment', 'ICP सीमा संरेखण')}<"],
  ['>RMSE Error Reduction<', ">{t('RMSE Error Reduction', 'RMSE त्रुटि में कमी')}<"],
  ['>Topology Conflict Detected<', ">{t('Topology Conflict Detected', 'टोपोलॉजी विवाद का पता चला')}<"],
  ['>Parcel Overlap: <', ">{t('Parcel Overlap: ', 'पार्सल ओवरलैप: ')}<"],
  ['> at Boundary #104<', ">{t(' at Boundary #104', ' सीमा #104 पर')}<"],
  ['>PolyFit Surface Reconstruction & Orthogonality controls available for first-floor area refinement.<', ">{t('PolyFit Surface Reconstruction & Orthogonality controls available for first-floor area refinement.', 'प्रथम तल क्षेत्र शोधन के लिए PolyFit सतह पुनर्निर्माण और ऑर्थोगोनलिटी नियंत्रण उपलब्ध हैं।')}<"],
  ['>Auto-Fix (PolyFit)<', ">{t('Auto-Fix (PolyFit)', 'ऑटो-फिक्स (PolyFit)')}<"],
  ['>Flag for Engineer Review<', ">{t('Flag for Engineer Review', 'इंजीनियर समीक्षा के लिए फ़्लैग करें')}<"],
  
  ['> 3D Change Detection<', ">{t(' 3D Change Detection', ' 3D बदलाव की पहचान')}<"],
  ['>Comparing multi-temporal scans (Epoch 1 vs Epoch 2).<', ">{t('Comparing multi-temporal scans (Epoch 1 vs Epoch 2).', 'मल्टी-टेम्पोरल स्कैन की तुलना (युग 1 बनाम युग 2)।')}<"],
  ['>Semantic Classification Tags<', ">{t('Semantic Classification Tags', 'सिमेंटिक वर्गीकरण टैग')}<"],
  ['>Permanent Walls<', ">{t('Permanent Walls', 'स्थायी दीवारें')}<"],
  ['>Dynamic Furniture/Clutter<', ">{t('Dynamic Furniture/Clutter', 'अस्थायी फर्नीचर / क्लटर')}<"],
  ['>Structural Modification Detected<', ">{t('Structural Modification Detected', 'संरचनात्मक संशोधन का पता चला')}<"],
  ['>Wall Removed - Rooms 201 & 202 Merged.<', ">{t('Wall Removed - Rooms 201 & 202 Merged.', 'दीवार हटा दी गई - कमरे 201 और 202 मिला दिए गए।')}<"],
  ['>Re-calculated Area<', ">{t('Re-calculated Area', 'पुनः परिकलित क्षेत्र')}<"],
  ['>3D Unit Volume<', ">{t('3D Unit Volume', '3D इकाई आयतन')}<"],
  
  ['> LADM Title & Valuation<', ">{t(' LADM Title & Valuation', ' LADM स्वामित्व और मूल्यांकन')}<"],
  ['label="Verified"', "label={t('Verified','सत्यापित')}"],
  ['>Legal Rights (LA_RRR)<', ">{t('Legal Rights (LA_RRR)', 'कानूनी अधिकार (LA_RRR)')}<"],
  ['>Ownership Type<', ">{t('Ownership Type', 'स्वामित्व प्रकार')}<"],
  ['>Freehold<', ">{t('Freehold', 'फ़्रीहोल्ड')}<"],
  ['>Height Limit<', ">{t('Height Limit', 'ऊंचाई सीमा')}<"],
  ['>Encumbrances<', ">{t('Encumbrances', 'भार')}<"],
  ['>Clear<', ">{t('Clear', 'स्पष्ट')}<"],
  ['>Multi-Tier Stratification<', ">{t('Multi-Tier Stratification', 'मल्टी-टियर स्तरीकरण')}<"],
  ['>-10m to 0m (Subsurface)<', ">{t('-10m to 0m (Subsurface)', '-10m से 0m (उपसतह)')}<"],
  ['>0m to +0.6m (Surface)<', ">{t('0m to +0.6m (Surface)', '0m से +0.6m (सतह)')}<"],
  ['>+9m to +50m (Airspace)<', ">{t('+9m to +50m (Airspace)', '+9m से +50m (हवाई क्षेत्र)')}<"],
  ['>3D Property Valuation Card<', ">{t('3D Property Valuation Card', '3D संपत्ति मूल्यांकन कार्ड')}<"],
  ['>Sunlight Exposure<', ">{t('Sunlight Exposure', 'सूरज की रोशनी का संपर्क')}<"],
  ['>High (South-Facing)<', ">{t('High (South-Facing)', 'उच्च (दक्षिण की ओर)')}<"],
  ['>Floor Height<', ">{t('Floor Height', 'फर्श की ऊंचाई')}<"],
  ['>12.5m (4th Floor)<', ">{t('12.5m (4th Floor)', '12.5m (चौथी मंजिल)')}<"],
  ['>Volumetric Co-ownership Ratio<', ">{t('Volumetric Co-ownership Ratio', 'वॉल्यूमेट्रिक सह-स्वामित्व अनुपात')}<"],
  ['>14.2% of Block A<', ">{t('14.2% of Block A', 'ब्लॉक ए का 14.2%')}<"],
  
  ['> Text-to-SQL (CodeS-7B)<', ">{t(' Text-to-SQL (CodeS-7B)', ' टेक्स्ट-टू-SQL (CodeS-7B)')}<"],
  ['> Python Coding Agent<', ">{t(' Python Coding Agent', ' पायथन कोडिंग एजेंट')}<"],
  ['>Spatial SQL Trace<', ">{t('Spatial SQL Trace', 'स्थानिक SQL ट्रेस')}<"],
  ['>Python Analytics Trace<', ">{t('Python Analytics Trace', 'पायथन एनालिटिक्स ट्रेस')}<"],
  ['placeholder="Type a spatial query or analytics request..."', "placeholder={t('Type a spatial query or analytics request...','स्थानिक क्वेरी या एनालिटिक्स अनुरोध टाइप करें...')}"]
];

for(const [find, replace] of replacements) {
  content = content.split(find).join(replace);
}

fs.writeFileSync(file, content);
console.log("Replacements complete");
