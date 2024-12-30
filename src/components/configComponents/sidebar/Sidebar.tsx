import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';

interface GuideMessage {
  text: string;
  position: 'top' | 'right' | 'bottom' | 'left';
}

const DashboardIcon = ({ isActive }: { isActive: boolean }) => (
  <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className={isActive ? styles.activeIcon : styles.icon}>
      {/* Background with glow effect */}
      <rect 
        x="2" 
        y="2" 
        width="20" 
        height="20" 
        rx="3"
        className={styles.iconBackground}
      />

      {/* Main dashboard grid */}
      <g className={styles.dashboardGrid}>
        {/* Large stats panel */}
        <rect 
          x="4" 
          y="4" 
          width="10" 
          height="8" 
          rx="2"
          className={`${styles.dashPanel} ${styles.statsPanel}`}
        />
        
        {/* Chart panel */}
        <rect 
          x="16" 
          y="4" 
          width="4" 
          height="8" 
          rx="1"
          className={`${styles.dashPanel} ${styles.chartPanel}`}
        />

        {/* Bottom panels */}
        <rect 
          x="4" 
          y="14" 
          width="4" 
          height="6" 
          rx="1"
          className={`${styles.dashPanel} ${styles.bottomPanel1}`}
        />
        <rect 
          x="10" 
          y="14" 
          width="4" 
          height="6" 
          rx="1"
          className={`${styles.dashPanel} ${styles.bottomPanel2}`}
        />
        <rect 
          x="16" 
          y="14" 
          width="4" 
          height="6" 
          rx="1"
          className={`${styles.dashPanel} ${styles.bottomPanel3}`}
        />
      </g>

      {/* Animated chart lines in the chart panel */}
      <g className={styles.chartLines}>
        <path 
          d="M16.5 5.5l0.7 1.5 0.8-2 0.7 1 0.8-2" 
          className={styles.chartLine}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path 
          d="M16.5 8.5l0.7 1 0.8-1.5 0.7 0.5 0.8-1" 
          className={styles.chartLine}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Stats dots */}
      <g className={styles.statsDots}>
        <circle cx="6" cy="6" r="0.5" className={styles.statDot1} />
        <circle cx="6" cy="8" r="0.5" className={styles.statDot2} />
        <circle cx="6" cy="10" r="0.5" className={styles.statDot3} />
      </g>

      {/* Animated bars in bottom panels */}
      <g className={styles.bottomBars}>
        <rect x="5" y="16" width="2" height="2" className={styles.bar1} />
        <rect x="11" y="16" width="2" height="2" className={styles.bar2} />
        <rect x="17" y="16" width="2" height="2" className={styles.bar3} />
      </g>

      {/* Glowing activity indicator */}
      <circle 
        cx="12" 
        cy="8" 
        r="0.5" 
        className={styles.activityIndicator}
      />
    </g>
  </svg>
);

const WidgetsIcon = ({ isActive }: { isActive: boolean }) => (
  <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className={isActive ? styles.activeIcon : styles.icon}>
      {/* Main container */}
      <rect 
        x="2" 
        y="2" 
        width="20" 
        height="20" 
        rx="3"
        className={styles.iconBackground}
      />
      
      {/* Animated widget blocks */}
      <g className={styles.widgetBlocks}>
        {/* Top left widget */}
        <rect 
          x="4" 
          y="4" 
          width="6" 
          height="6" 
          rx="1.5"
          className={`${styles.widgetBlock} ${styles.widgetBlock1}`}
        />
        {/* Top right widget */}
        <rect 
          x="14" 
          y="4" 
          width="6" 
          height="6" 
          rx="1.5"
          className={`${styles.widgetBlock} ${styles.widgetBlock2}`}
        />
        {/* Bottom left widget */}
        <rect 
          x="4" 
          y="14" 
          width="6" 
          height="6" 
          rx="1.5"
          className={`${styles.widgetBlock} ${styles.widgetBlock3}`}
        />
        {/* Bottom right widget */}
        <rect 
          x="14" 
          y="14" 
          width="6" 
          height="6" 
          rx="1.5"
          className={`${styles.widgetBlock} ${styles.widgetBlock4}`}
        />
      </g>

      {/* Animated connection lines */}
      <g className={styles.connectionLines}>
        <path 
          d="M10 7h4M7 10v4M17 10v4M10 17h4" 
          className={styles.connectionLine}
          strokeWidth="0.75"
        />
      </g>

      {/* Animated dots */}
      <g className={styles.dots}>
        <circle cx="12" cy="7" r="0.5" className={styles.dot} />
        <circle cx="7" cy="12" r="0.5" className={styles.dot} />
        <circle cx="17" cy="12" r="0.5" className={styles.dot} />
        <circle cx="12" cy="17" r="0.5" className={styles.dot} />
      </g>

      {/* Center pulse effect */}
      <circle 
        cx="12" 
        cy="12" 
        r="1.5" 
        className={styles.centerPulse}
      />
    </g>
  </svg>
);

const SettingsIcon = ({ isActive }: { isActive: boolean }) => (
  <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className={isActive ? styles.activeIcon : styles.icon}>
      {/* Outer gear */}
      <path 
        d="M12 15a3 3 0 100-6 3 3 0 000 6z"
        className={styles.gearCenter}
      />
      <path 
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
        className={styles.gearOuter}
      />
      {/* Animated inner circles */}
      <circle 
        cx="12" 
        cy="12" 
        r="1.5"
        className={styles.gearInner}
      />
    </g>
  </svg>
);

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, userRole } = useAuth();
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const [cameraAngle, setCameraAngle] = useState({ x: 0, y: 0 });
  const [guideMessage, setGuideMessage] = useState<GuideMessage | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      // Calculate angle based on cursor position relative to viewport center
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      // Calculate angles (limited to reasonable range)
      const angleX = Math.min(Math.max((e.clientX - centerX) / centerX * 20, -20), 20);
      const angleY = Math.min(Math.max((e.clientY - centerY) / centerY * 20, -20), 20);
      
      setCameraAngle({ x: angleX, y: angleY });
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  const getGuideMessage = (pathname: string): GuideMessage => {
    if (pathname.includes('dashboard')) {
      return {
        text: "👋 Need help? Double-click cards to edit, or drag to rearrange!",
        position: 'right'
      };
    } else if (pathname.includes('widgets')) {
      return {
        text: "🎯 Create new widgets here or customize existing ones",
        position: 'right'
      };
    } else if (pathname.includes('settings')) {
      return {
        text: "⚙️ Configure your preferences and system settings",
        position: 'right'
      };
    }
    return {
      text: "👀 I'm watching your workflow! Click me for guidance",
      position: 'right'
    };
  };

  useEffect(() => {
    setGuideMessage(getGuideMessage(location.pathname));
  }, [location.pathname]);

  const handleCameraClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWatching(!isWatching);
    if (!isWatching) {
      setGuideMessage(getGuideMessage(location.pathname));
    } else {
      setGuideMessage(null);
    }
  };

  const getAdminSidebarItems = () => [
    {
      icon: <DashboardIcon isActive={location.pathname.includes('dashboard')} />,
      path: 'dashboard',
      label: 'Dashboard'
    },
    {
      icon: <WidgetsIcon isActive={location.pathname.includes('widgets')} />,
      path: 'widgets',
      label: 'Widgets'
    },
    {
      icon: <SettingsIcon isActive={location.pathname.includes('settings')} />,
      path: 'settings',
      label: 'Settings'
    },
  ];

  const getUserSidebarItems = () => [
    {
      icon: <DashboardIcon isActive={location.pathname.includes('dashboard')} />,
      path: 'dashboard',
      label: 'Dashboard'
    },
    {
      icon: <SettingsIcon isActive={location.pathname.includes('settings')} />,
      path: 'settings',
      label: 'Settings'
    },
  ];

  const sidebarItems = userRole === 'admin' ? getAdminSidebarItems() : getUserSidebarItems();

  const handleNavigation = (path: string | undefined) => {
    if (path) {
      const basePath = userRole === 'admin' ? '/localconfig/' : '/localhost/';
      navigate(basePath + path);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - bounds.left - bounds.width / 2) / 10;
    const y = (e.clientY - bounds.top - bounds.height / 2) / 10;
    setEyePosition({ x, y });
  };

  return (
    <div className={styles.sidebar}>
      <div 
        className={`${styles.sidebarLogo} ${isWatching ? styles.watching : ''}`}
        onClick={handleCameraClick}
        role="button"
        tabIndex={0}
      >
        <svg className={styles.logoIcon} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main Camera Body - Adjusted for new viewBox */}
          <path 
            d="M10 14C10 12.8954 10.8954 12 12 12H36C37.1046 12 38 12.8954 38 14V34C38 35.1046 37.1046 36 36 36H12C10.8954 36 10 35.1046 10 34V14Z"
            fill="#4F46E5"
            style={{
              transform: `rotate(${cameraAngle.x * 0.2}deg)`,
              transformOrigin: 'center'
            }}
          />

          {/* Camera Mount - Adjusted */}
          <path 
            d="M19 36L15 42H33L29 36" 
            stroke="#4F46E5" 
            strokeWidth="2.5"
          />

          {/* Lens Housing - Adjusted */}
          <circle 
            cx="24" 
            cy="24" 
            r="8" 
            fill="#1E293B"
            style={{
              transform: `translate(${cameraAngle.x * 0.1}px, ${cameraAngle.y * 0.1}px)`,
            }}
          />

          {/* Lens - Adjusted */}
          <circle 
            cx="24" 
            cy="24" 
            r="5" 
            fill="#6366F1"
            style={{
              transform: `translate(${cameraAngle.x * 0.15}px, ${cameraAngle.y * 0.15}px)`,
            }}
          />

          {/* Status Light - Adjusted */}
          <circle cx="33" cy="17" r="2" fill="#EF4444">
            <animate
              attributeName="opacity"
              values="1;0.3;1"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Camera Top - Adjusted */}
          <path 
            d="M12 12C12 11.4477 12.4477 11 13 11H35C35.5523 11 36 11.4477 36 12V14C36 14.5523 35.5523 15 35 15H13C12.4477 15 12 14.5523 12 14V12Z"
            fill="#1E293B"
            style={{
              transform: `rotate(${cameraAngle.x * 0.2}deg)`,
              transformOrigin: 'center'
            }}
          />

          {/* Camera details - Adjusted */}
          <path
            d="M14 17H18"
            stroke="#6366F1"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          
          {/* Lens reflection - Adjusted */}
          <circle 
            cx="22" 
            cy="22" 
            r="2" 
            fill="rgba(255, 255, 255, 0.6)"
            style={{
              transform: `translate(${cameraAngle.x * 0.15}px, ${cameraAngle.y * 0.15}px)`,
            }}
          />

          {/* Add scanning effect when watching */}
          {isWatching && (
            <rect
              x="10"
              y="14"
              width="28"
              height="20"
              fill="none"
              stroke="#6366F1"
              strokeWidth="0.5"
              opacity="0.5"
              className={styles.scanLine}
            />
          )}
          
          {/* Add pulsing focus ring when active */}
          {isWatching && (
            <circle
              cx="24"
              cy="24"
              r="6"
              stroke="#6366F1"
              strokeWidth="0.5"
              fill="none"
              className={styles.focusRing}
            />
          )}
        </svg>
        
        {/* Add guide message tooltip */}
        {guideMessage && (
          <div className={`${styles.guideMessage} ${styles[guideMessage.position]}`}>
            {guideMessage.text}
          </div>
        )}
      </div>

      <nav className={styles.sidebarNav}>
        {sidebarItems.map((item, index) => (
          <div 
            key={index} 
            className={`${styles.sidebarItem} ${item.path && location.pathname.includes(item.path) ? styles.active : ''}`}
            onClick={() => handleNavigation(item.path)}
            title={item.label}
            role="button"
            tabIndex={0}
          >
            {item.icon}
            <span className={styles.tooltip}>{item.label}</span>
          </div>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <button 
          className={styles.logoutButton} 
          onClick={handleLogout}
          title="Logout"
        >
          <svg 
            className={styles.logoutIcon}
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
          >
            <path 
              d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 