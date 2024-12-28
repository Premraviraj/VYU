import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { useAuth } from '../../../context/AuthContext';

interface GuideMessage {
  text: string;
  position: 'top' | 'right' | 'bottom' | 'left';
}

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
      icon: (
        <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            className={location.pathname.includes('dashboard') ? styles.activeIcon : styles.icon}
            d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5z" 
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path 
            className={location.pathname.includes('dashboard') ? styles.activeIcon : styles.icon}
            d="M9 21V10H5V21" 
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path 
            className={location.pathname.includes('dashboard') ? styles.activeIcon : styles.icon}
            d="M14 21V15H10V21" 
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path 
            className={location.pathname.includes('dashboard') ? styles.activeIcon : styles.icon}
            d="M19 21V8H15V21" 
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path 
            className={styles.iconGlow}
            d="M4 10h5M10 15h4M15 8h4" 
            strokeWidth="1"
          />
        </svg>
      ),
      path: 'dashboard',
      label: 'Dashboard'
    },
    {
      icon: (
        <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5zM14 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5zM4 15a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4zM14 15a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4z" 
            className={location.pathname.includes('widgets') ? styles.activeIcon : styles.icon}
            strokeWidth="2"
          />
          <path className={styles.iconGlow} d="M8 10V6m8 4V6m0 12v-4m-8 4v-4"/>
        </svg>
      ),
      path: 'widgets',
      label: 'Widgets'
    },
    {
      icon: (
        <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" className={location.pathname.includes('settings') ? styles.activeIcon : styles.icon}/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" 
            className={location.pathname.includes('settings') ? styles.activeIcon : styles.icon}
            strokeWidth="2"
          />
          <path className={styles.iconGlow} d="M12 8v8M8 12h8"/>
        </svg>
      ),
      path: 'settings',
      label: 'Settings'
    },
  ];

  const getUserSidebarItems = () => [
    {
      icon: (
        <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            className={location.pathname.includes('dashboard') ? styles.activeIcon : styles.icon}
            d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5z" 
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path 
            className={location.pathname.includes('dashboard') ? styles.activeIcon : styles.icon}
            d="M9 21V10H5V21" 
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path 
            className={location.pathname.includes('dashboard') ? styles.activeIcon : styles.icon}
            d="M14 21V15H10V21" 
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path 
            className={location.pathname.includes('dashboard') ? styles.activeIcon : styles.icon}
            d="M19 21V8H15V21" 
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path 
            className={styles.iconGlow}
            d="M4 10h5M10 15h4M15 8h4" 
            strokeWidth="1"
          />
        </svg>
      ),
      path: 'dashboard',
      label: 'Dashboard'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" 
            className={location.pathname.includes('settings') ? styles.activeIcon : styles.icon} 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" 
            className={location.pathname.includes('settings') ? styles.activeIcon : styles.icon} 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      ),
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