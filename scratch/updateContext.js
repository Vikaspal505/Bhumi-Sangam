import fs from 'fs';
const file = 'd:/SIH ps2/BhuSetu-main/BhuSetu-main/src/context/AppContext.tsx';
let content = fs.readFileSync(file, 'utf8');

const triggerCode = `
  useEffect(() => {
    try {
      const gte = document.querySelector('.goog-te-combo');
      if (gte) {
        gte.value = language === 'hi' ? 'hi' : 'en';
        gte.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        // Retry after a bit if widget not loaded yet
        setTimeout(() => {
          const gteRetry = document.querySelector('.goog-te-combo');
          if (gteRetry) {
            gteRetry.value = language === 'hi' ? 'hi' : 'en';
            gteRetry.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, 1500);
      }
    } catch(e) {}
  }, [language]);
`;

if(!content.includes('gte.dispatchEvent')) {
  // Find where language state is defined
  const search = "  const [language, setLanguageState] = useState<'en' | 'hi'>";
  content = content.replace(search, triggerCode + '\n' + search);
  fs.writeFileSync(file, content);
  console.log('App context updated');
}
