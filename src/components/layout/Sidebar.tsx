import React from 'react';
import { 
  LayoutDashboard, 
  UploadCloud, 
  GitMerge, 
  Map, 
  ShieldCheck, 
  History, 
  Scale, 
  Gauge, 
  Share2, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Compass,
  FileCheck2,
  Layers3
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type NavViewKey = 
  | 'dashboard'
  | 'sources'
  | 'pipeline'
  | 'map'
  | 'topology'
  | 'changes'
  | 'conflicts'
  | 'confidence'
  | 'output'
  | 'analytics'
  | 'settings'
  | 'mutations'
  | 'surveyor_tasks'
  | 'admin_users'
  | 'geocad';

interface SidebarProps {
  activeView: NavViewKey;
  setActiveView: (view: NavViewKey) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  isCollapsed,
  setIsCollapsed
}) => {
  const { conflicts, topologyIssues, userRole, language } = useApp();
  const t = (en: string, hi: string) => language === 'hi' ? hi : en;

  const unresolvedConflictsCount = conflicts.filter(c => c.status === 'unresolved').length;
  const activeTopologyCount = topologyIssues.filter(t => t.status === 'detected').length;

  // Custom navigation items per role
  const getNavItems = () => {
    if (userRole === 'Revenue Officer') {
      return [
        { key: 'dashboard' as NavViewKey, label: t('Revenue overview','राजस्व अवलोकन'), icon: LayoutDashboard },
        { 
          key: 'conflicts' as NavViewKey, 
          label: t('Dispute arbitration','विवाद मध्यस्थता'), 
          icon: Scale, 
          count: unresolvedConflictsCount > 0 ? unresolvedConflictsCount : undefined
        },
        { key: 'map' as NavViewKey, label: t('Cadastral map workspace','भूमि मानचित्र कार्यक्षेत्र'), icon: Map },
        { key: 'changes' as NavViewKey, label: t('Bi-temporal change audit','द्वि-कालिक परिवर्तन ऑडिट'), icon: History },
        { key: 'confidence' as NavViewKey, label: t('Accuracy & quality gating','सटीकता और गुणवत्ता जाँच'), icon: Gauge },
        { key: 'output' as NavViewKey, label: t('Gazette & statutory reports','राजपत्र और वैधानिक रिपोर्ट'), icon: Share2 },
        { key: 'analytics' as NavViewKey, label: t('Turnaround benchmarks','टर्नअराउंड बेंचमार्क'), icon: BarChart3 }
      ];
    }

    if (userRole === 'Field Surveyor') {
      return [
        { key: 'dashboard' as NavViewKey, label: t('Field requisitions & rover','फील्ड अनुरोध और रोवर'), icon: Compass },
        { key: 'map' as NavViewKey, label: t('Cadastral map workspace','भूमि मानचित्र कार्यक्षेत्र'), icon: Map },
        { 
          key: 'topology' as NavViewKey, 
          label: t('Boundary geometry & planar rules','सीमा ज्यामिति और नियम'), 
          icon: ShieldCheck,
          count: activeTopologyCount > 0 ? activeTopologyCount : undefined
        },
        { key: 'confidence' as NavViewKey, label: t('CORS RTK quality check','CORS RTK गुणवत्ता जाँच'), icon: Gauge },
        { key: 'output' as NavViewKey, label: t('Field sync & exports','फील्ड सिंक और निर्यात'), icon: Share2 }
      ];
    }

    // Default System Admin: Full Suite
    return [
      { key: 'dashboard' as NavViewKey, label: t('System overview & engine','सिस्टम अवलोकन और इंजन'), icon: LayoutDashboard },
      { key: 'sources' as NavViewKey, label: t('Data ingestion streams (10)','डेटा प्रविष्टि स्ट्रीम (10)'), icon: UploadCloud },
      { key: 'pipeline' as NavViewKey, label: t('Harmonization pipeline','एकीकरण पाइपलाइन'), icon: GitMerge },
      { key: 'map' as NavViewKey, label: t('Cadastral map workspace','भूमि मानचित्र कार्यक्षेत्र'), icon: Map },
      { 
        key: 'topology' as NavViewKey, 
        label: t('Topology & planar rules','टोपोलॉजी और नियम'), 
        icon: ShieldCheck, 
        count: activeTopologyCount > 0 ? activeTopologyCount : undefined
      },
      { key: 'changes' as NavViewKey, label: t('Bi-temporal change detection','द्वि-कालिक परिवर्तन पहचान'), icon: History },
      { 
        key: 'conflicts' as NavViewKey, 
        label: t('Dispute arbitration center','विवाद मध्यस्थता केंद्र'), 
        icon: Scale, 
        count: unresolvedConflictsCount > 0 ? unresolvedConflictsCount : undefined
      },
      { key: 'confidence' as NavViewKey, label: t('ISO 19157 quality scoring','ISO 19157 गुणवत्ता स्कोरिंग'), icon: Gauge },
      { key: 'output' as NavViewKey, label: t('Interoperability & gazette sync','पारस्परिकता और राजपत्र सिंक'), icon: Share2 },
      { key: 'analytics' as NavViewKey, label: t('Performance benchmarks','प्रदर्शन बेंचमार्क'), icon: BarChart3 },
      { key: 'geocad' as NavViewKey, label: t('GeoCadAI Enterprise Platform','GeoCadAI उद्यम मंच'), icon: Layers3 },
      { key: 'settings' as NavViewKey, label: t('Architecture & documentation','आर्किटेक्चर और दस्तावेज़ीकरण'), icon: Settings }
    ];

  };

  const navItems = getNavItems();

  return (
    <aside 
      className={`relative flex flex-col bg-white dark:bg-[#1A1D21] border-r border-[#D5D9DE] dark:border-[#2F343A] transition-all duration-150 z-30 shrink-0 ${
        isCollapsed ? 'w-16' : 'w-[240px]'
      }`}
      aria-label="Sidebar navigation"
    >
      {/* Sidebar Top: Collapse Toggle & Section Label */}
      <div className="h-10 px-3 flex items-center justify-between border-b border-[#D5D9DE] dark:border-[#2F343A] bg-[#F4F5F7] dark:bg-[#22262B]">
        {!isCollapsed && (
          <span className="text-[12px] font-semibold text-[#4A5568] dark:text-[#AEB4BB]">
            {t('Navigation menu','नेविगेशन मेनू')}
          </span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 text-[#718096] dark:text-[#AEB4BB] hover:text-[#1B1F23] dark:hover:text-[#E8EAED] rounded-[2px] transition-colors cursor-pointer ml-auto"
          aria-label={isCollapsed ? "Expand navigation sidebar" : "Collapse navigation sidebar"}
          title={isCollapsed ? "Expand menu" : "Collapse menu"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Items list */}
      <nav className="flex-1 py-2 space-y-0.5 overflow-y-auto" role="navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveView(item.key)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center h-11 px-3 text-left transition-colors cursor-pointer text-[14px] leading-tight ${
                isActive
                  ? 'border-l-[3px] border-[#1F4E8C] dark:border-[#3F7CC4] bg-[#EDF2F7] dark:bg-[#22262B] text-[#1B1F23] dark:text-[#E8EAED] font-semibold'
                  : 'text-[#4A5568] dark:text-[#AEB4BB] hover:bg-[#F4F5F7] dark:hover:bg-[#22262B] border-l-[3px] border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Icon className="w-[18px] h-[18px] text-[#718096] dark:text-[#AEB4BB] shrink-0" aria-hidden="true" />
                {!isCollapsed && (
                  <span className="truncate flex-1">
                    {item.label}
                  </span>
                )}
              </div>

              {!isCollapsed && item.count !== undefined && item.count > 0 && (
                <span 
                  className="px-1.5 py-0.5 text-[11px] font-bold rounded-[2px] bg-[#C4584F] text-white shrink-0 ml-1.5"
                  title={`${item.count} items require action`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer info */}
      {!isCollapsed && (
        <div className="p-3 border-t border-[#D5D9DE] dark:border-[#2F343A] bg-[#F4F5F7] dark:bg-[#22262B] text-[11px] text-[#718096] dark:text-[#7D858E] leading-normal">
          <div className="font-semibold text-[#1B1F23] dark:text-[#E8EAED]">
            Department of Land Resources
          </div>
          <div>MeghRaj Cloud Node · India</div>
        </div>
      )}
    </aside>
  );
};
