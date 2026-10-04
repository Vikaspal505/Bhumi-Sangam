import fs from 'fs';
const file = 'd:/SIH ps2/BhuSetu-main/BhuSetu-main/src/context/AppContext.tsx';
let content = fs.readFileSync(file, 'utf8');

const startIdx = content.indexOf('  useEffect(() => {\n    try {\n      const gte = document.querySelector');
if (startIdx !== -1) {
  const endIdx = content.indexOf('  }, [language]);', startIdx) + 17;
  content = content.substring(0, startIdx) + content.substring(endIdx);
}

const triggerCode = `
  useEffect(() => {
    try {
      const gte = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (gte) {
        gte.value = language === 'hi' ? 'hi' : 'en';
        gte.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        setTimeout(() => {
          const gteRetry = document.querySelector('.goog-te-combo') as HTMLSelectElement;
          if (gteRetry) {
            gteRetry.value = language === 'hi' ? 'hi' : 'en';
            gteRetry.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, 1500);
      }
    } catch(e) {}
  }, [language]);
`;

const insertPos = content.indexOf("  const setLanguage = ");
if (insertPos !== -1) {
    content = content.substring(0, insertPos) + triggerCode + '\n' + content.substring(insertPos);
}

fs.writeFileSync(file, content);
console.log('App context fixed');
