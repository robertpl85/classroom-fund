import { useState, useEffect, useCallback } from "react";
import { api } from "./api";
import translations from "./translations";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

function useCountUp(target, duration = 1000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function getPasswordStrength(pw) {
  if (!pw) return 0;
  if (pw.length < 6) return 1;
  const hasNum     = /\d/.test(pw);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pw);
  const hasUpper   = /[A-Z]/.test(pw);
  if (pw.length >= 8 && hasUpper && (hasNum || hasSpecial)) return 3;
  if (hasNum || hasSpecial) return 2;
  return 1;
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return digits.slice(0,3) + '-' + digits.slice(3);
  return digits.slice(0,3) + '-' + digits.slice(3,6) + '-' + digits.slice(6);
}

const CATEGORIES = ["Holiday", "Craft", "Snacks", "Field Trip", "Birthday", "General", "Other"];

// ─── Icons ───────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18 }) => {
  const icons = {
    home:    "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
    users:   "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
    dollar:  "M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
    list:    "M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01",
    check:   "M20 6L9 17l-5-5",
    x:       "M18 6L6 18 M6 6l12 12",
    plus:    "M12 5v14 M5 12h14",
    edit:    "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
    trash:   "M3 6h18 M8 6V4h8v2 M19 6l-1 14H6L5 6",
    logout:  "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
    clock:   "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2",
    alert:   "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01",
    key:     "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
    shield:  "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    eye:     "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z",
    eyeOff:  "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24 M1 1l22 22",
    tag:     "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01",
    refresh: "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0020.49 15",
    unlock:   "M8 11V7a4 4 0 118 0m0 0v4 M5 11h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z",
    save:     "M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z M17 21v-8H7v8 M7 3v5h8",
    database: "M12 2C6.48 2 2 4.69 2 8s4.48 6 10 6 10-2.69 10-6-4.48-6-10-6z M2 14c0 3.31 4.48 6 10 6s10-2.69 10-6 M2 8v6 M22 8v6",
  };
  const d = icons[name];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {d.split(" M").map((seg, i) => (
        <path key={i} d={i === 0 ? seg : "M" + seg} />
      ))}
    </svg>
  );
};

// ─── Primary Button (with hover) ─────────────────────────────────────────────
function PrimaryButton({ onClick, disabled, style: extraStyle, children }) {
  const [hovered, setHovered] = useState(false);
  const hasCustomBg = extraStyle?.background;
  const bg = hasCustomBg
    ? extraStyle.background
    : (hovered && !disabled) ? "#3b0764" : "linear-gradient(135deg, #4a0080, #7b2fbe)";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...S.btnPrimary, ...extraStyle, background: bg, transition: "background 0.2s ease" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background:"#f3e8ff", borderRadius:12, padding:20, animation:"skeletonPulse 1.5s ease infinite" }}>
      <div style={{ height:20, background:"#e9d5ff", borderRadius:6, marginBottom:12, width:"60%" }}/>
      <div style={{ height:32, background:"#e9d5ff", borderRadius:6, marginBottom:8, width:"40%" }}/>
      <div style={{ height:14, background:"#e9d5ff", borderRadius:6, width:"80%" }}/>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const isMobile = useIsMobile();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [view, setView]               = useState("dashboard");
  const [toast, setToast]             = useState(null);

  const [language, setLanguage] = useState(() => localStorage.getItem('cf_language') || 'en');
  const t = translations[language];

  const [students, setStudents]   = useState([]);
  const [expenses, setExpenses]   = useState([]);
  const [users, setUsers]         = useState([]);
  const [summary, setSummary]     = useState({ balance: 0, total_collected: 0, total_spent: 0, pending_count: 0 });
  const [className, setClassName] = useState("Pierwsza Klasa");

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    api.getClassName().then(({ value }) => setClassName(value)).catch(() => {});
  }, []);

  useEffect(() => { document.title = `${className} – Class Fund Manager`; }, [className]);

  useEffect(() => {
    const token = localStorage.getItem("cf_token");
    if (!token) { setLoading(false); return; }
    api.me().then(({ user }) => {
      setCurrentUser(user);
      setLoading(false);
    }).catch(() => {
      localStorage.removeItem("cf_token");
      setLoading(false);
    });
  }, []);

  const loadAll = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [s, e, sum] = await Promise.all([api.getStudents(), api.getExpenses(), api.getSummary()]);
      setStudents(s);
      setExpenses(e);
      setSummary(sum);
      if (currentUser.role === "admin") {
        const u = await api.getUsers();
        setUsers(u);
      }
    } catch (err) {
      showToast(t.serverError, "error");
    }
  }, [currentUser, showToast, t]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleLogin = (user, token) => {
    localStorage.setItem("cf_token", token);
    setCurrentUser(user);
    setView("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("cf_token");
    setCurrentUser(null);
    setStudents([]); setExpenses([]); setUsers([]);
  };

  const handleReset = (newClassName) => {
    setClassName(newClassName);
    setView("dashboard");
    loadAll();
  };

  if (loading) return <Spinner />;
  if (!currentUser) return <LoginScreen onLogin={handleLogin} className={className} t={t} language={language} setLanguage={setLanguage} />;

  const pendingCount = expenses.filter(e => e.status === "pending").length;

  return (
    <div style={S.app}>
      {toast && (
        <div style={{ ...S.toast, background: toast.type === "error" ? "#ef4444" : "#7b2fbe" }}>
          {toast.msg}
        </div>
      )}
      {isMobile && <MobileTopBar currentUser={currentUser} className={className} onLogout={handleLogout} t={t} language={language} setLanguage={setLanguage} />}
      <Sidebar currentUser={currentUser} view={view} setView={setView}
        pendingCount={currentUser.role === "admin" ? pendingCount : 0}
        onLogout={handleLogout} className={className} isMobile={isMobile} t={t} language={language} setLanguage={setLanguage} />
      <main style={{ ...S.main, ...(isMobile ? { paddingTop:41, paddingBottom:65 } : {}) }}>
        {/* keyed wrapper triggers fadeIn animation on every view change */}
        <div key={view} style={{ animation:"fadeIn 0.3s ease forwards" }}>
          {view === "dashboard" && (
            <Dashboard summary={summary} students={students} expenses={expenses}
              currentUser={currentUser} setView={setView} onRefresh={loadAll} t={t} />
          )}
          {view === "students" && (
            <StudentsPanel students={students} currentUser={currentUser}
              showToast={showToast} reload={loadAll} t={t} />
          )}
          {view === "expenses" && (
            <ExpensesPanel expenses={expenses} currentUser={currentUser}
              showToast={showToast} reload={loadAll} summary={summary} t={t} />
          )}
          {view === "approvals" && currentUser.role === "admin" && (
            <ApprovalsPanel expenses={expenses} users={users} currentUser={currentUser}
              showToast={showToast} reload={loadAll} t={t} />
          )}
          {view === "accounts" && currentUser.role === "admin" && (
            <AccountsPanel users={users} currentUser={currentUser}
              showToast={showToast} reload={loadAll} className={className} onReset={handleReset} t={t} language={language} setLanguage={setLanguage} />
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#f5f3ff" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:40, marginBottom:12 }}>🏫</div>
        <p style={{ color:"#7b2fbe", fontFamily:"Nunito,sans-serif" }}>Loading…</p>
      </div>
    </div>
  );
}

// ─── Language Toggle ──────────────────────────────────────────────────────────
function LanguageToggle({ language, setLanguage }) {
  const toggle = () => {
    const newLang = language === 'en' ? 'pl' : 'en';
    setLanguage(newLang);
    localStorage.setItem('cf_language', newLang);
  };
  return (
    <button onClick={toggle} style={{
      background: "rgba(255,255,255,0.15)",
      border: "1px solid rgba(255,255,255,0.3)",
      borderRadius: 20,
      padding: "4px 12px",
      color: "#fff",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      gap: 6,
      fontFamily: "inherit"
    }}>
      {language === 'en' ? '🇵🇱 PL' : '🇺🇸 EN'}
    </button>
  );
}

// ─── Mobile Top Bar ───────────────────────────────────────────────────────────
function MobileTopBar({ currentUser, className, onLogout, t, language, setLanguage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <div style={S.mobileTopBar}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <img src="/logo.jpg" alt="Emilia Plater Polish School" style={{ width:30, height:30, borderRadius:6, objectFit:"cover" }} />
          <span style={{ color:"#fff", fontWeight:800, fontSize:15, lineHeight:1.2 }}>{className}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <LanguageToggle language={language} setLanguage={setLanguage} />
          <button onClick={() => setMenuOpen(!menuOpen)}
            style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}>
            <div style={{ ...S.avatar, width:34, height:34, fontSize:14 }}>{currentUser.name[0]}</div>
          </button>
        </div>
      </div>
      {menuOpen && (
        <div style={S.mobileUserMenu}>
          <div style={{ padding:"12px 16px", borderBottom:"1px solid #f3e8ff" }}>
            <div style={{ fontWeight:700, color:"#2d0057", fontSize:14 }}>{currentUser.name}</div>
            <div style={{ color:"#6b7280", fontSize:12 }}>{currentUser.email}</div>
            <div style={{ color:"#7b2fbe", fontSize:12, fontWeight:600, marginTop:2 }}>
              {currentUser.role === "admin" ? "★ Admin" : t.classroomMom}
            </div>
          </div>
          <button style={S.mobileMenuLogout} onClick={() => { setMenuOpen(false); onLogout(); }}>
            <Icon name="logout" size={16}/> {t.signOut}
          </button>
        </div>
      )}
    </>
  );
}

// ─── Login ───────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, className, t, language, setLanguage }) {
  const [email, setEmail]   = useState("");
  const [pw, setPw]         = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError]   = useState("");
  const [busy, setBusy]     = useState(false);

  const strength = getPasswordStrength(pw);
  const strengthLabel = ["", t.weak, t.medium, t.strong][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#10b981"][strength];

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeSlideUp {
        from { opacity: 0; transform: translateY(20px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes countUp { from { opacity: 0; } to { opacity: 1; } }
      @keyframes skeletonPulse {
        0%   { background-color: #e9d5ff; }
        50%  { background-color: #f3e8ff; }
        100% { background-color: #e9d5ff; }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes bottomSheet {
        from { opacity: 0; transform: translateY(100%); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleLogin = async () => {
    if (!email || !pw) { setError("Enter your email and password."); return; }
    setBusy(true); setError("");
    try {
      const { user, token } = await api.login(email, pw);
      onLogin(user, token);
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally { setBusy(false); }
  };

  return (
    <div style={S.loginWrap}>
      <div style={{ position:"absolute", width:500, height:500, background:"rgba(123,47,190,0.35)", borderRadius:"50%", filter:"blur(120px)", pointerEvents:"none", top:"10%", left:"50%", transform:"translateX(-50%)" }}/>
      <div style={{ ...S.loginCard, position:"relative", zIndex:1, animation:"fadeSlideUp 0.5s ease forwards" }}>
        <div style={S.loginLogo}>
          <img src="/logo.jpg" alt="Emilia Plater Polish School" style={{ width:110 }} />
          <h1 style={S.loginTitle}>{className}</h1>
          <p style={S.loginSub}>Emilia Plater Polish School</p>
          <p style={S.loginSub}>{t.classroomFundManager}</p>
        </div>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
          <button onClick={() => { const nl = language==='en'?'pl':'en'; setLanguage(nl); localStorage.setItem('cf_language',nl); }}
            style={{ background:"linear-gradient(135deg,#4a0080,#7b2fbe)", border:"none", borderRadius:20, padding:"5px 14px", color:"#fff", cursor:"pointer", fontSize:13, fontWeight:700, display:"flex", alignItems:"center", gap:6, fontFamily:"inherit" }}>
            {language==='en' ? '🇵🇱 PL' : '🇺🇸 EN'}
          </button>
        </div>
        <div style={S.fieldGroup}>
          <label style={S.label}>{t.email}</label>
          <input style={S.input} type="email" value={email}
            onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
            onKeyDown={e => e.key==="Enter" && handleLogin()} />
        </div>
        <div style={S.fieldGroup}>
          <label style={S.label}>{t.password}</label>
          <div style={{ position:"relative" }}>
            <input style={{ ...S.input, paddingRight:42 }} type={showPw?"text":"password"}
              value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••"
              onKeyDown={e => e.key==="Enter" && handleLogin()} />
            <button onClick={() => setShowPw(!showPw)} style={S.eyeBtn}>
              <Icon name={showPw?"eyeOff":"eye"} size={16}/>
            </button>
          </div>
          {pw && (
            <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:8 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ height:4, flex:1, borderRadius:99, transition:"background 0.3s",
                  background: strength >= i ? strengthColor : "#e9d5ff" }}/>
              ))}
              <span style={{ fontSize:11, fontWeight:700, color:strengthColor, minWidth:42, textAlign:"right" }}>
                {strengthLabel}
              </span>
            </div>
          )}
        </div>
        {error && <p style={S.errorText}>{error}</p>}
        <PrimaryButton style={{ width:"100%", justifyContent:"center", opacity:busy?0.7:1 }}
          onClick={handleLogin} disabled={busy}>
          {busy ? t.signingIn : t.signIn}
        </PrimaryButton>
        <p style={S.loginHint}>{t.contactAdmin}</p>
      </div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ currentUser, view, setView, pendingCount, onLogout, className, isMobile, t, language, setLanguage }) {
  const [hoveredNav, setHoveredNav] = useState(null);

  const navItems = [
    { id:"dashboard", label:t.dashboard, icon:"home" },
    { id:"students",  label:t.students,  icon:"users" },
    { id:"expenses",  label:t.expenses,  icon:"dollar" },
    ...(currentUser.role==="admin" ? [
      { id:"approvals", label:t.approvals, icon:"check", badge: pendingCount },
      { id:"accounts",  label:t.admin,  icon:"shield" },
    ] : []),
  ];

  if (isMobile) {
    return (
      <>
        <nav style={S.bottomNav}>
          {navItems.map(item => (
            <button key={item.id}
              style={{ ...S.bottomNavItem, ...(view===item.id ? S.bottomNavActive : {}) }}
              onClick={() => setView(item.id)}>
              <div style={{ position:"relative" }}>
                <Icon name={item.icon} size={22}/>
                {item.badge > 0 && <span style={S.bottomNavBadge}>{item.badge}</span>}
              </div>
              <span style={{ fontSize:10, marginTop:2, fontWeight:600 }}>{item.label}</span>
            </button>
          ))}
        </nav>
        <div style={{ position:"fixed", bottom:0, left:0, right:0, height:"15px", background:"#1e0038", zIndex:99 }} />
      </>
    );
  }

  return (
    <aside style={S.sidebar}>
      <div>
        <div style={S.sideHeader}>
          <img src="/logo.jpg" alt="Emilia Plater Polish School" style={{ width:36 }} />
          <div>
            <div style={S.sideTitle}>{className}</div>
            <div style={S.sideRole}>Emilia Plater Polish School</div>
            <div style={S.sideRole}>{currentUser.role==="admin"?"★ Admin":t.classroomMom}</div>
          </div>
        </div>
        <div style={S.sideUser}>
          <div style={S.avatar}>{currentUser.name[0]}</div>
          <div>
            <div style={S.sideUserName}>{currentUser.name}</div>
            <div style={S.sideUserEmail}>{currentUser.email}</div>
          </div>
        </div>
        <nav>
          {navItems.map(item => {
            const isActive  = view === item.id;
            const isHovered = hoveredNav === item.id;
            return (
              <button key={item.id}
                style={{
                  ...S.navItem,
                  ...(isActive ? S.navActive : {}),
                  ...(!isActive && isHovered ? { background:"rgba(168,85,247,0.15)" } : {}),
                  transition:"background 0.15s ease",
                }}
                onClick={() => setView(item.id)}
                onMouseEnter={() => setHoveredNav(item.id)}
                onMouseLeave={() => setHoveredNav(null)}>
                <Icon name={item.icon} size={17}/>
                <span style={{ flex:1, textAlign:"left" }}>{item.label}</span>
                {item.badge > 0 && <span style={S.badge}>{item.badge}</span>}
              </button>
            );
          })}
        </nav>
      </div>
      <div style={{ padding:"8px 12px 0" }}>
        <LanguageToggle language={language} setLanguage={setLanguage} />
      </div>
      <button style={S.logoutBtn} onClick={onLogout}>
        <Icon name="logout" size={17}/> {t.signOut}
      </button>
    </aside>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
function Dashboard({ summary, students, expenses, currentUser, setView, onRefresh, t }) {
  const isMobile   = useIsMobile();
  const [hoveredRow, setHoveredRow] = useState(null);

  const animBalance   = useCountUp(summary.balance);
  const animCollected = useCountUp(summary.total_collected);
  const animSpent     = useCountUp(summary.total_spent);

  const paidCount      = students.filter(s => s.paid).length;
  const recentExpenses = [...expenses].slice(0, 5);
  const isLoading      = summary.balance === 0 && students.length === 0;

  return (
    <div style={{ ...S.page, ...(isMobile ? { padding:"16px" } : {}) }}>
      <div style={{ ...S.pageHeader, ...(isMobile ? { marginBottom:16 } : {}) }}>
        <div>
          <h2 style={{ ...S.pageTitle, ...(isMobile ? { fontSize:20 } : {}) }}>{t.dashboard}</h2>
          <p style={S.pageSubtitle}>{t.welcomeBack}, {currentUser.name.split(" ")[0]}!</p>
        </div>
        <button style={S.btnSecondary} onClick={onRefresh}>
          <Icon name="refresh" size={15}/> {t.refresh}
        </button>
      </div>

      <div style={{ ...S.statsGrid, gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: isMobile ? 10 : 16 }}>
        {isLoading ? (
          [1,2,3,4].map(i => <SkeletonCard key={i}/>)
        ) : (
          <>
            <StatCard icon="dollar" label={t.balance}    value={`$${animBalance.toFixed(2)}`}         color="#7b2fbe" bg="#f5f3ff" note={t.availableFunds} />
            <StatCard icon="check"  label={t.collected}  value={`$${animCollected.toFixed(2)}`}       color="#059669" bg="#ecfdf5" note={`${paidCount}/${students.length} ${t.paid}`} />
            <StatCard icon="list"   label={t.totalSpent} value={`$${animSpent.toFixed(2)}`}           color="#d97706" bg="#fffbeb" note={t.approvedExpenses} />
            <StatCard icon="users"  label={t.classSize}  value={students.length}                       color="#6d28d9" bg="#f5f3ff" note={`${students.length-paidCount} ${t.unpaid}`} />
          </>
        )}
      </div>

      {currentUser.role==="admin" && summary.pending_count > 0 && (
        <div style={S.alertBox} onClick={() => setView("approvals")}>
          <Icon name="alert" size={18}/>
          <span><strong>{summary.pending_count} expense{summary.pending_count!==1?"s":""}</strong> waiting for your approval</span>
          <span style={S.alertArrow}>Review →</span>
        </div>
      )}

      <div style={{ ...S.twoCol, gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}>
        <div style={S.card}>
          <h3 style={S.cardTitle}>{t.recentExpenses}</h3>
          {recentExpenses.length===0 ? <p style={S.empty}>{t.noExpenses}</p> : recentExpenses.map(e => (
            <div key={e.id}
              style={{ ...S.expenseRow, background: hoveredRow===e.id ? "#faf5ff" : "transparent", borderRadius:8, transition:"background 0.15s ease", margin:"0 -8px", padding:"12px 8px" }}
              onMouseEnter={() => setHoveredRow(e.id)}
              onMouseLeave={() => setHoveredRow(null)}>
              <div>
                <div style={S.expenseDesc}>{e.description}</div>
                <div style={S.expenseMeta}>{e.date?.slice(0,10)} · {e.category}</div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                <span style={S.expenseAmt}>-${parseFloat(e.amount).toFixed(2)}</span>
                <StatusChip status={e.status} t={t}/>
              </div>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <h3 style={S.cardTitle}>{t.paymentSummary}</h3>
          {students.length > 0 ? (
            <>
              <div style={S.progressWrap}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <span style={S.meta}>{paidCount} {t.paid}</span>
                  <span style={S.meta}>{students.length-paidCount} {t.unpaid}</span>
                </div>
                <div style={S.progressBar}>
                  <div style={{ ...S.progressFill, width:`${(paidCount/students.length)*100}%` }}/>
                </div>
                <div style={{ textAlign:"center", marginTop:8, fontSize:13, color:"#6b7280" }}>
                  {Math.round((paidCount/students.length)*100)}{t.familiesPaid}
                </div>
              </div>
              {students.filter(s=>!s.paid).slice(0,4).map(s => (
                <div key={s.id} style={{ ...S.expenseRow, borderLeft:"3px solid #c084fc", paddingLeft:10, marginTop:8 }}>
                  <div>
                    <div style={S.expenseDesc}>{s.name}</div>
                    <div style={S.expenseMeta}>{s.parent_email}</div>
                  </div>
                  <span style={{ color:"#7b2fbe", fontSize:13, fontWeight:600 }}>{t.pending}</span>
                </div>
              ))}
            </>
          ) : <p style={S.empty}>{t.noStudentsFound}</p>}
        </div>
      </div>
    </div>
  );
}

function PasswordChecklist({ password, t }) {
  if (!password) return null;
  const checks = [
    { label: t.min8chars,    met: password.length >= 8 },
    { label: t.oneUppercase, met: /[A-Z]/.test(password) },
    { label: t.oneNumber,    met: /[0-9]/.test(password) },
    { label: t.oneSpecial,   met: /[!@#$%^&*()_+\-=\[\]{};:,.<>?]/.test(password) },
  ];
  return (
    <div style={{ marginTop:8, marginBottom:4 }}>
      {checks.map(({ label, met }) => (
        <div key={label} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, marginBottom:3 }}>
          <span style={{ color: met ? '#10b981' : '#ef4444', fontWeight:800, fontSize:13, lineHeight:1 }}>
            {met ? '✓' : '✗'}
          </span>
          <span style={{ color: met ? '#10b981' : '#6b7280' }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

function StatCard({ icon, label, value, color, bg, note }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{ ...S.statCard, borderTop:`3px solid ${color}`, transform: hovered ? "scale(1.02)" : "scale(1)", transition:"transform 0.2s ease", cursor:"default" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <div style={{ ...S.statIcon, background:bg, color }}><Icon name={icon} size={20}/></div>
      <div style={S.statValue}>{value}</div>
      <div style={S.statLabel}>{label}</div>
      <div style={S.statNote}>{note}</div>
    </div>
  );
}

// ─── Students Panel ───────────────────────────────────────────────────────────
function StudentsPanel({ students, currentUser, showToast, reload, t }) {
  const isMobile = useIsMobile();
  const [search, setSearch]       = useState("");
  const [showAdd, setShowAdd]     = useState(false);
  const [editSt, setEditSt]       = useState(null);
  const [filter, setFilter]       = useState("all");
  const [form, setForm]           = useState({ name:"", parent_email:"", parent_phone:"", paid:false, amount:50 });
  const [busy, setBusy]           = useState(false);
  const [emailValid, setEmailValid] = useState(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const filtered = students.filter(s => {
    const m = s.name.toLowerCase().includes(search.toLowerCase()) ||
              s.parent_email.toLowerCase().includes(search.toLowerCase());
    if (filter==="paid")   return m && s.paid;
    if (filter==="unpaid") return m && !s.paid;
    return m;
  });

  const openAdd  = () => { setForm({ name:"", parent_email:"", parent_phone:"", paid:false, amount:50 }); setEditSt(null); setEmailValid(null); setShowAdd(true); };
  const openEdit = s  => { setForm({ name:s.name, parent_email:s.parent_email, parent_phone:s.parent_phone||"", paid:s.paid, amount:s.amount }); setEditSt(s); setEmailValid(s.parent_email ? emailRegex.test(s.parent_email) : null); setShowAdd(true); };

  const handleSave = async () => {
    if (!form.name || !form.parent_email) { showToast(t.nameEmailRequired, "error"); return; }
    if (form.parent_email && !emailRegex.test(form.parent_email)) {
      showToast(t.invalidEmail, "error");
      return;
    }
    setBusy(true);
    try {
      if (editSt) { await api.updateStudent(editSt.id, form); showToast(t.studentUpdated); }
      else        { await api.addStudent(form); showToast(t.studentAdded); }
      setShowAdd(false); reload();
    } catch (err) { showToast(err.message, "error"); }
    finally { setBusy(false); }
  };

  const togglePaid = async (s) => {
    try {
      await api.togglePaid(s.id, { paid: !s.paid, amount: !s.paid ? 50 : 0 });
      reload();
    } catch (err) { showToast(err.message, "error"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this student?")) return;
    try { await api.deleteStudent(id); showToast(t.studentRemoved); reload(); }
    catch (err) { showToast(err.message, "error"); }
  };

  return (
    <div style={{ ...S.page, ...(isMobile ? { padding:"16px" } : {}) }}>
      <div style={{ ...S.pageHeader, ...(isMobile ? { marginBottom:14 } : {}) }}>
        <div>
          <h2 style={{ ...S.pageTitle, ...(isMobile ? { fontSize:20 } : {}) }}>{t.students}</h2>
          <p style={S.pageSubtitle}>{students.length} {t.students} · {students.filter(s=>s.paid).length} {t.paid}</p>
        </div>
        {currentUser.role==="admin" && (
          <PrimaryButton onClick={openAdd}>
            <Icon name="plus" size={16}/>{isMobile ? "" : ` ${t.addStudent}`}
          </PrimaryButton>
        )}
      </div>

      <div style={{ ...S.filterBar, marginBottom:12 }}>
        <input style={{ ...S.input, flex:1, minWidth:0 }} placeholder={t.searchStudents}
          value={search} onChange={e => setSearch(e.target.value)}/>
        <div style={S.filterBtns}>
          {[{id:"all",label:t.all},{id:"paid",label:t.paid},{id:"unpaid",label:t.unpaid}].map(f => (
            <button key={f.id} style={{ ...S.filterBtn, ...(filter===f.id ? S.filterActive : {}) }}
              onClick={() => setFilter(f.id)}>{f.label}</button>
          ))}
        </div>
      </div>

      {isMobile ? (
        <div>
          {filtered.length===0 ? (
            <p style={S.empty}>{t.noStudentsFound}</p>
          ) : filtered.map(s => (
            <div key={s.id} style={S.studentCard}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                <div style={{ display:"flex", gap:10, alignItems:"center", flex:1, minWidth:0 }}>
                  <div style={{ ...S.miniAvatar, width:36, height:36, fontSize:15, background:s.paid?"#d1fae5":"#fee2e2", color:s.paid?"#065f46":"#991b1b", flexShrink:0 }}>
                    {s.name[0]}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ ...S.studentName, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.name}</div>
                    <div style={{ ...S.expenseMeta, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.parent_email}</div>
                    {s.parent_phone && <div style={S.expenseMeta}>{s.parent_phone}</div>}
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6, flexShrink:0 }}>
                  <strong style={{ fontSize:14 }}>${parseFloat(s.amount).toFixed(2)}</strong>
                  {currentUser.role==="admin" ? (
                    <button style={{ ...S.statusToggle, ...(s.paid ? S.paidBtn : S.unpaidBtn) }}
                      onClick={() => togglePaid(s)}>
                      {s.paid ? `✓ ${t.paid}` : `○ ${t.unpaid}`}
                    </button>
                  ) : <StatusChip status={s.paid?"paid":"unpaid"} t={t}/>}
                </div>
              </div>
              {currentUser.role==="admin" && (
                <div style={{ display:"flex", justifyContent:"flex-end", gap:6, marginTop:10, paddingTop:10, borderTop:"1px solid #f3f4f6" }}>
                  <button style={S.iconBtn} onClick={() => openEdit(s)}><Icon name="edit" size={15}/></button>
                  <button style={{ ...S.iconBtn, color:"#ef4444" }} onClick={() => handleDelete(s.id)}><Icon name="trash" size={15}/></button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={S.card}>
          <table style={S.table}>
            <thead>
              <tr style={S.thead}>
                <th style={S.th}>{t.studentName}</th>
                <th style={S.th}>{t.parentEmail}</th>
                <th style={S.th}>{t.parentPhone}</th>
                <th style={S.th}>{t.amount}</th>
                <th style={S.th}>{t.paid}/{t.unpaid}</th>
                {currentUser.role==="admin" && <th style={S.th}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} style={S.trow}>
                  <td style={S.td}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ ...S.miniAvatar, background:s.paid?"#d1fae5":"#fee2e2", color:s.paid?"#065f46":"#991b1b" }}>
                        {s.name[0]}
                      </div>
                      <span style={S.studentName}>{s.name}</span>
                    </div>
                  </td>
                  <td style={S.td}><span style={S.meta}>{s.parent_email}</span></td>
                  <td style={S.td}><span style={S.meta}>{s.parent_phone||"—"}</span></td>
                  <td style={S.td}><strong>${parseFloat(s.amount).toFixed(2)}</strong></td>
                  <td style={S.td}>
                    {currentUser.role==="admin" ? (
                      <button style={{ ...S.statusToggle, ...(s.paid ? S.paidBtn : S.unpaidBtn) }}
                        onClick={() => togglePaid(s)}>
                        {s.paid ? `✓ ${t.paid}` : `○ ${t.unpaid}`}
                      </button>
                    ) : <StatusChip status={s.paid?"paid":"unpaid"} t={t}/>}
                  </td>
                  {currentUser.role==="admin" && (
                    <td style={S.td}>
                      <div style={{ display:"flex", gap:6 }}>
                        <button style={S.iconBtn} onClick={() => openEdit(s)}><Icon name="edit" size={15}/></button>
                        <button style={{ ...S.iconBtn, color:"#ef4444" }} onClick={() => handleDelete(s.id)}><Icon name="trash" size={15}/></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length===0 && <p style={S.empty}>{t.noStudentsFound}</p>}
        </div>
      )}

      {showAdd && (
        <Modal title={editSt ? t.editStudent : t.addStudent} onClose={() => setShowAdd(false)}>
          <div style={S.fieldGroup}>
            <label style={S.label}>{t.studentName}</label>
            <input style={S.input} value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}/>
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>{t.parentEmail}</label>
            <input
              style={{ ...S.input, border: emailValid === null ? "1.5px solid #c084fc" : emailValid ? "1.5px solid #10b981" : "1.5px solid #ef4444" }}
              type="email"
              value={form.parent_email}
              onChange={e => {
                const val = e.target.value;
                setForm({...form, parent_email: val});
                setEmailValid(val ? emailRegex.test(val) : null);
              }}
              placeholder="parent@example.com"
            />
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>{t.parentPhone}</label>
            <input style={S.input} value={form.parent_phone}
              placeholder="555-555-5555"
              onChange={e => setForm({...form, parent_phone: formatPhone(e.target.value)})}/>
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>{t.contributionAmount}</label>
            <input style={S.input} type="number" value={form.amount}
              onChange={e => setForm({...form, amount:Number(e.target.value)})}/>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <input type="checkbox" id="paid" checked={form.paid}
              onChange={e => setForm({...form, paid:e.target.checked})} style={{ width:18, height:18 }}/>
            <label htmlFor="paid" style={S.label}>{t.markedAsPaid}</label>
          </div>
          <div style={S.modalBtns}>
            <button style={S.btnSecondary} onClick={() => setShowAdd(false)}>{t.cancel}</button>
            <PrimaryButton style={{ opacity:busy?0.7:1 }} onClick={handleSave} disabled={busy}>
              {busy ? "Saving…" : t.save}
            </PrimaryButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Expenses Panel ───────────────────────────────────────────────────────────
function ExpensesPanel({ expenses, currentUser, showToast, reload, summary, t }) {
  const isMobile = useIsMobile();
  const [showAdd, setShowAdd]         = useState(false);
  const [filter, setFilter]           = useState("all");
  const [form, setForm]               = useState({ description:"", amount:"", category:"General", date:new Date().toISOString().split("T")[0] });
  const [busy, setBusy]               = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [editForm, setEditForm]       = useState({ description:"", amount:"", category:"General", date:"" });
  const [editBusy, setEditBusy]       = useState(false);
  const [hoveredRow, setHoveredRow]   = useState(null);

  const openEdit = (e) => {
    setEditExpense(e);
    setEditForm({ description:e.description, amount:parseFloat(e.amount), category:e.category, date:e.date?.slice(0,10) });
  };

  const handleEdit = async () => {
    if (!editForm.description || !editForm.amount) { showToast(t.descriptionAmountRequired, "error"); return; }
    setEditBusy(true);
    try {
      await api.updateExpense(editExpense.id, { ...editForm, amount: Number(editForm.amount) });
      showToast(t.expenseRecorded);
      setEditExpense(null);
      reload();
    } catch (err) { showToast(err.message, "error"); }
    finally { setEditBusy(false); }
  };

  const handleDelete = async (e) => {
    if (!window.confirm(`Delete "${e.description}"?`)) return;
    try {
      await api.deleteExpense(e.id);
      showToast(t.expenseRejected);
      reload();
    } catch (err) { showToast(err.message, "error"); }
  };

  const filtered = expenses.filter(e => filter==="all" || e.status===filter);

  const handleSubmit = async () => {
    if (!form.description || !form.amount) { showToast(t.descriptionAmountRequired, "error"); return; }
    setBusy(true);
    try {
      await api.addExpense({ ...form, amount: Number(form.amount) });
      showToast(currentUser.role==="admin" ? t.expenseRecorded : t.expenseSubmitted);
      setShowAdd(false);
      setForm({ description:"", amount:"", category:"General", date:new Date().toISOString().split("T")[0] });
      reload();
    } catch (err) { showToast(err.message, "error"); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ ...S.page, ...(isMobile ? { padding:"16px" } : {}) }}>
      <div style={{ ...S.pageHeader, ...(isMobile ? { marginBottom:14 } : {}) }}>
        <div>
          <h2 style={{ ...S.pageTitle, ...(isMobile ? { fontSize:20 } : {}) }}>{t.expenses}</h2>
          <p style={S.pageSubtitle}>{currentUser.role==="admin" ? t.allExpenses : t.yourExpenses}</p>
        </div>
        <PrimaryButton onClick={() => setShowAdd(true)}>
          <Icon name="plus" size={16}/>{isMobile ? "" : ` ${t.logExpense}`}
        </PrimaryButton>
      </div>

      {currentUser.role!=="admin" && (
        <div style={{ ...S.infoBox, marginBottom:16 }}>
          <Icon name="alert" size={16}/>
          <span>Expenses you submit will be reviewed by the admin before funds are deducted.</span>
        </div>
      )}

      <div style={{ overflowX:"auto", marginBottom:16, paddingBottom:isMobile?4:0 }}>
        <div style={{ ...S.filterBtns, flexWrap: isMobile ? "nowrap" : "wrap" }}>
          {[{id:"all",label:t.all},{id:"approved",label:t.approved},{id:"pending",label:t.pending},{id:"rejected",label:t.rejected}].map(f => (
            <button key={f.id} style={{ ...S.filterBtn, ...(filter===f.id ? S.filterActive : {}), whiteSpace:"nowrap" }}
              onClick={() => setFilter(f.id)}>{f.label}</button>
          ))}
        </div>
      </div>

      <div style={S.card}>
        {filtered.length===0 ? <p style={S.empty}>{t.noExpenses}</p> : filtered.map(e => (
          <div key={e.id}
            style={{ ...S.expenseRow, background: hoveredRow===e.id ? "#faf5ff" : "transparent", borderRadius:8, transition:"background 0.15s ease", margin:"0 -8px", padding:"12px 8px" }}
            onMouseEnter={() => setHoveredRow(e.id)}
            onMouseLeave={() => setHoveredRow(null)}>
            <div style={{ display:"flex", gap:isMobile?8:12, alignItems:"flex-start", flex:1, minWidth:0 }}>
              {!isMobile && (
                <div style={{ ...S.catBadge, ...getCatStyle(e.category), flexShrink:0 }}>
                  <Icon name="tag" size={13}/> {e.category}
                </div>
              )}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ ...S.expenseDesc, overflow:"hidden", textOverflow:"ellipsis", whiteSpace: isMobile?"nowrap":"normal" }}>{e.description}</div>
                <div style={S.expenseMeta}>
                  {isMobile ? e.category + " · " : ""}{e.date?.slice(0,10)}{e.status==="approved" ? " · ✓" : ""}
                </div>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6, flexShrink:0 }}>
              <span style={S.expenseAmt}>-${parseFloat(e.amount).toFixed(2)}</span>
              <StatusChip status={e.status} t={t}/>
              {currentUser.role==="admin" && e.status==="approved" && (
                <div style={{ display:"flex", gap:4 }}>
                  <button style={S.iconBtn} onClick={() => openEdit(e)} title="Edit"><Icon name="edit" size={14}/></button>
                  <button style={{ ...S.iconBtn, color:"#ef4444" }} onClick={() => handleDelete(e)} title="Delete"><Icon name="trash" size={14}/></button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {editExpense && (
        <Modal title={t.expenses} onClose={() => setEditExpense(null)}>
          <div style={S.fieldGroup}>
            <label style={S.label}>{t.description}</label>
            <input style={S.input} value={editForm.description}
              onChange={e => setEditForm({...editForm, description:e.target.value})}/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div style={S.fieldGroup}>
              <label style={S.label}>{t.amount} ($)</label>
              <input style={S.input} type="number" step="0.01" min="0" value={editForm.amount}
                onChange={e => setEditForm({...editForm, amount:e.target.value})}/>
            </div>
            <div style={S.fieldGroup}>
              <label style={S.label}>{t.date}</label>
              <input style={S.input} type="date" value={editForm.date}
                onChange={e => setEditForm({...editForm, date:e.target.value})}/>
            </div>
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>{t.category}</label>
            <select style={S.input} value={editForm.category}
              onChange={e => setEditForm({...editForm, category:e.target.value})}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={S.modalBtns}>
            <button style={S.btnSecondary} onClick={() => setEditExpense(null)}>{t.cancel}</button>
            <PrimaryButton style={{ opacity:editBusy?0.7:1 }} onClick={handleEdit} disabled={editBusy}>
              {editBusy ? "Saving…" : t.save}
            </PrimaryButton>
          </div>
        </Modal>
      )}

      {showAdd && (
        <Modal title={t.logExpense} onClose={() => setShowAdd(false)}>
          <div style={S.fieldGroup}>
            <label style={S.label}>{t.description}</label>
            <input style={S.input} value={form.description}
              onChange={e => setForm({...form, description:e.target.value})}
              placeholder="e.g. Valentine's Day supplies"/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div style={S.fieldGroup}>
              <label style={S.label}>{t.amount} ($)</label>
              <input style={S.input} type="number" step="0.01" min="0" value={form.amount}
                onChange={e => setForm({...form, amount:e.target.value})} placeholder="0.00"/>
            </div>
            <div style={S.fieldGroup}>
              <label style={S.label}>{t.date}</label>
              <input style={S.input} type="date" value={form.date}
                onChange={e => setForm({...form, date:e.target.value})}/>
            </div>
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>{t.category}</label>
            <select style={S.input} value={form.category}
              onChange={e => setForm({...form, category:e.target.value})}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          {currentUser.role!=="admin" && (
            <div style={S.infoBox}>
              <Icon name="clock" size={15}/>
              <span>This will be sent to the admin for approval before funds are deducted.</span>
            </div>
          )}
          <div style={S.modalBtns}>
            <button style={S.btnSecondary} onClick={() => setShowAdd(false)}>{t.cancel}</button>
            <PrimaryButton style={{ opacity:busy?0.7:1 }} onClick={handleSubmit} disabled={busy}>
              {busy ? "Submitting…" : t.submit}
            </PrimaryButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Approvals Panel ─────────────────────────────────────────────────────────
function ApprovalsPanel({ expenses, users, currentUser, showToast, reload, t }) {
  const isMobile = useIsMobile();
  const pending = expenses.filter(e => e.status==="pending");
  const history = expenses.filter(e => e.status!=="pending").sort((a,b) => new Date(b.date)-new Date(a.date));
  const [busy, setBusy] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  const approve = async (id) => {
    setBusy(id+"-approve");
    try { await api.approveExpense(id); showToast(t.expenseApproved); reload(); }
    catch (err) { showToast(err.message, "error"); }
    finally { setBusy(null); }
  };
  const reject = async (id) => {
    setBusy(id+"-reject");
    try { await api.rejectExpense(id); showToast(t.expenseRejected, "error"); reload(); }
    catch (err) { showToast(err.message, "error"); }
    finally { setBusy(null); }
  };

  return (
    <div style={{ ...S.page, ...(isMobile ? { padding:"16px" } : {}) }}>
      <div style={S.pageHeader}>
        <div>
          <h2 style={{ ...S.pageTitle, ...(isMobile ? { fontSize:20 } : {}) }}>{t.approvals}</h2>
          <p style={S.pageSubtitle}>{pending.length} {t.pendingReimbursements}</p>
        </div>
      </div>

      {pending.length===0 ? (
        <div style={S.emptyState}>
          <div style={{ fontSize:48, marginBottom:12 }}>🎉</div>
          <p style={{ color:"#6b7280" }}>{t.allCaughtUp}</p>
        </div>
      ) : (
        <div style={{ marginBottom:32 }}>
          <h3 style={{ ...S.sectionLabel, marginBottom:12 }}>{t.pendingReimbursements}</h3>
          {pending.map(e => (
            <div key={e.id} style={S.approvalCard}>
              <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                <div style={{ ...S.catBadge, ...getCatStyle(e.category) }}>
                  <Icon name="tag" size={13}/> {e.category}
                </div>
                <div style={{ flex:1 }}>
                  <div style={S.expenseDesc}>{e.description}</div>
                  <div style={S.expenseMeta}>
                    {t.submittedBy} <strong>{e.submitted_by_name || "Unknown"}</strong> · {e.date?.slice(0,10)}
                  </div>
                  <div style={{ marginTop:4, color:"#7b2fbe", fontWeight:700, fontSize:16 }}>
                    ${parseFloat(e.amount).toFixed(2)}
                  </div>
                </div>
              </div>
              <div style={{ display:"flex", gap:8, marginTop:12, justifyContent:"flex-end" }}>
                <button style={{ ...S.btnReject, opacity:busy?0.6:1 }} onClick={() => reject(e.id)} disabled={!!busy}>
                  <Icon name="x" size={15}/> {busy===e.id+"-reject" ? "…" : t.reject}
                </button>
                <button style={{ ...S.btnApprove, opacity:busy?0.6:1 }} onClick={() => approve(e.id)} disabled={!!busy}>
                  <Icon name="check" size={15}/> {busy===e.id+"-approve" ? "…" : t.approveReimburse}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <div>
          <h3 style={{ ...S.sectionLabel, marginBottom:12 }}>{t.approvalHistory}</h3>
          <div style={S.card}>
            {history.map(e => (
              <div key={e.id}
                style={{ ...S.expenseRow, background: hoveredRow===e.id ? "#faf5ff" : "transparent", borderRadius:8, transition:"background 0.15s ease", margin:"0 -8px", padding:"12px 8px" }}
                onMouseEnter={() => setHoveredRow(e.id)}
                onMouseLeave={() => setHoveredRow(null)}>
                <div style={{ flex:1 }}>
                  <div style={S.expenseDesc}>{e.description}</div>
                  <div style={S.expenseMeta}>By {e.submitted_by_name||"Unknown"} · {e.date?.slice(0,10)}</div>
                </div>
                <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                  <span style={S.expenseAmt}>-${parseFloat(e.amount).toFixed(2)}</span>
                  <StatusChip status={e.status} t={t}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Accounts Panel ───────────────────────────────────────────────────────────
function AccountsPanel({ users, currentUser, showToast, reload, className, onReset, t, language, setLanguage }) {
  const isMobile = useIsMobile();
  const [showAdd, setShowAdd]           = useState(false);
  const [resetId, setResetId]           = useState(null);
  const [form, setForm]                 = useState({ name:"", email:"", password:"", role:"mom" });
  const [newPw, setNewPw]               = useState("");
  const [busy, setBusy]                 = useState(false);
  const [yearStep, setYearStep]         = useState(0);
  const [newClassName, setNewClassName] = useState("");
  const [confirmText, setConfirmText]   = useState("");
  const [yearBusy, setYearBusy]         = useState(false);

  // Backup & Restore state
  const [backups, setBackups]           = useState([]);
  const [backupBusy, setBackupBusy]     = useState(false);
  const [restoreFile, setRestoreFile]   = useState(null);
  const [restoreStep, setRestoreStep]   = useState(0);
  const [restoreText, setRestoreText]   = useState("");
  const [restoreBusy, setRestoreBusy]   = useState(false);

  const loadBackups = useCallback(() => {
    api.getBackups().then(setBackups).catch(() => {});
  }, []);

  useEffect(() => { loadBackups(); }, [loadBackups]);

  const openYearReset  = () => { setNewClassName(className); setConfirmText(""); setYearStep(1); };
  const closeYearReset = () => setYearStep(0);

  const handleYearReset = async () => {
    setYearBusy(true);
    try {
      await api.resetYear({ class_name: newClassName });
      closeYearReset();
      showToast(t.newSchoolYear + "!");
      onReset(newClassName);
    } catch (err) { showToast(err.message, "error"); }
    finally { setYearBusy(false); }
  };

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) { showToast(t.allFieldsRequired, "error"); return; }
    setBusy(true);
    try {
      await api.createUser(form);
      showToast(t.accountCreated);
      setShowAdd(false);
      setForm({ name:"", email:"", password:"", role:"mom" });
      reload();
    } catch (err) { showToast(err.message, "error"); }
    finally { setBusy(false); }
  };

  const handleReset = async (id) => {
    if (!newPw || newPw.length < 8) { showToast(t.min8chars, "error"); return; }
    setBusy(true);
    try {
      await api.resetPassword(id, newPw);
      showToast(t.passwordReset);
      setResetId(null); setNewPw("");
    } catch (err) { showToast(err.message, "error"); }
    finally { setBusy(false); }
  };

  const handleUnlock = async (u) => {
    try {
      await api.unlockUser(u.id);
      showToast(`${t.accountUnlocked} (${u.name})`);
      reload();
    } catch (err) { showToast(err.message, "error"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this account?")) return;
    try { await api.deleteUser(id); showToast(t.accountRemoved); reload(); }
    catch (err) { showToast(err.message, "error"); }
  };

  const handleCreateBackup = async () => {
    setBackupBusy(true);
    try {
      await api.createBackup();
      showToast(t.backupCreated);
      loadBackups();
    } catch (err) { showToast(err.message, "error"); }
    finally { setBackupBusy(false); }
  };

  const handleRestore = async () => {
    setRestoreBusy(true);
    try {
      await api.restoreBackup(restoreFile.filename);
      showToast(t.databaseRestored);
      setRestoreStep(0);
      setTimeout(() => {
        localStorage.removeItem("cf_token");
        window.location.reload();
      }, 2000);
    } catch (err) { showToast(err.message, "error"); setRestoreBusy(false); }
  };

  return (
    <div style={{ ...S.page, ...(isMobile ? { padding:"16px" } : {}) }}>
      <div style={{ ...S.pageHeader, ...(isMobile ? { marginBottom:16 } : {}) }}>
        <div>
          <h2 style={{ ...S.pageTitle, ...(isMobile ? { fontSize:20 } : {}) }}>{t.admin}</h2>
          <p style={S.pageSubtitle}>{t.adminPanel}</p>
        </div>
        <PrimaryButton style={{ background:"#ef4444" }} onClick={openYearReset}>
          <Icon name="refresh" size={16}/> {t.newSchoolYear}
        </PrimaryButton>
      </div>

      <div style={{ ...S.card, marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <Icon name="users" size={18}/>
            <h3 style={{ ...S.cardTitle, margin:0 }}>{t.accounts}</h3>
          </div>
          <PrimaryButton onClick={() => setShowAdd(true)}>
            <Icon name="plus" size={16}/> {t.addAccount}
          </PrimaryButton>
        </div>
        {users.map(u => {
          const isLocked = u.locked_until && new Date(u.locked_until) > new Date();
          return (
            <div key={u.id} style={S.userRow}>
              <div style={{ display:"flex", gap:12, alignItems:"center", flex:1, minWidth:0 }}>
                <div style={S.avatar}>{u.name[0]}</div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontWeight:600, color:"#111827", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {u.name}
                    {u.role==="admin" && <span style={S.adminTag}>Admin</span>}
                    {isLocked && (
                      <span style={{ background:"#fee2e2", color:"#991b1b", padding:"2px 8px", borderRadius:99, fontSize:11, fontWeight:700, marginLeft:6 }}>
                        🔒 Locked
                      </span>
                    )}
                  </div>
                  <div style={{ ...S.meta, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.email}</div>
                </div>
              </div>
              <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                {isLocked && (
                  <button style={{ ...S.iconBtn, color:"#f59e0b" }} onClick={() => handleUnlock(u)} title={t.unlock}>
                    <Icon name="unlock" size={15}/>
                  </button>
                )}
                <button style={S.iconBtn} onClick={() => { setResetId(u.id); setNewPw(""); }} title={t.resetPassword}>
                  <Icon name="key" size={15}/>
                </button>
                {u.id !== currentUser.id && (
                  <button style={{ ...S.iconBtn, color:"#ef4444" }} onClick={() => handleDelete(u.id)}>
                    <Icon name="trash" size={15}/>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showAdd && (
        <Modal title={t.createAccount} onClose={() => setShowAdd(false)}>
          <div style={S.fieldGroup}>
            <label style={S.label}>{t.fullName}</label>
            <input style={S.input} value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}/>
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>{t.emailAddress}</label>
            <input style={S.input} type="email" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}/>
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>{t.temporaryPassword}</label>
            <input style={S.input} type="password" value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}/>
            <PasswordChecklist password={form.password} t={t}/>
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>{t.role}</label>
            <select style={S.input} value={form.role} onChange={e => setForm({...form, role:e.target.value})}>
              <option value="mom">{t.classroomMom}</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div style={S.modalBtns}>
            <button style={S.btnSecondary} onClick={() => setShowAdd(false)}>{t.cancel}</button>
            <PrimaryButton style={{ opacity:busy?0.7:1 }} onClick={handleCreate} disabled={busy}>
              {busy ? "Creating…" : t.createAccount}
            </PrimaryButton>
          </div>
        </Modal>
      )}

      {resetId && (
        <Modal title={t.resetPassword} onClose={() => setResetId(null)}>
          <p style={{ ...S.meta, marginBottom:12 }}>
            {t.newPassword}: <strong>{users.find(u=>u.id===resetId)?.name}</strong>
          </p>
          <div style={S.fieldGroup}>
            <label style={S.label}>{t.newPassword}</label>
            <input style={S.input} type="password" value={newPw}
              onChange={e => setNewPw(e.target.value)} placeholder="Enter new password"/>
            <PasswordChecklist password={newPw} t={t}/>
          </div>
          <div style={S.modalBtns}>
            <button style={S.btnSecondary} onClick={() => setResetId(null)}>{t.cancel}</button>
            <PrimaryButton style={{ opacity:busy?0.7:1 }} onClick={() => handleReset(resetId)} disabled={busy}>
              {busy ? "Resetting…" : t.resetPassword}
            </PrimaryButton>
          </div>
        </Modal>
      )}

      {/* ── Backup & Restore ── */}
      <div style={S.card}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <Icon name="database" size={18} />
            <h3 style={{ ...S.cardTitle, margin:0 }}>{t.backupRestore}</h3>
          </div>
          <PrimaryButton onClick={handleCreateBackup} disabled={backupBusy}
            style={{ opacity:backupBusy?0.7:1 }}>
            <Icon name="save" size={15}/>
            {backupBusy ? " Creating…" : ` ${t.createBackup}`}
          </PrimaryButton>
        </div>

        {backups.length === 0 ? (
          <p style={S.empty}>No backups found.</p>
        ) : (
          backups.map(b => (
            <div key={b.filename} style={{ ...S.expenseRow, padding:"10px 0", borderBottom:"1px solid #f3f4f6" }}>
              <div>
                <div style={{ fontWeight:600, color:"#111827", fontSize:14 }}>{b.date}</div>
                <div style={S.expenseMeta}>{b.size} · {new Date(b.created).toLocaleString()}</div>
              </div>
              <button
                style={{ ...S.iconBtn, color:"#f59e0b", padding:"6px 12px", fontSize:13, fontWeight:700, gap:6, display:"flex", alignItems:"center" }}
                onClick={() => { setRestoreFile(b); setRestoreStep(1); setRestoreText(""); }}>
                <Icon name="refresh" size={14}/> {t.restore}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Restore confirmation — step 1: warning */}
      {restoreStep === 1 && restoreFile && (
        <Modal title={t.restore} onClose={() => setRestoreStep(0)}>
          <div style={{ ...S.infoBox, background:"#fef2f2", borderColor:"#fca5a5", color:"#b91c1c", marginBottom:16 }}>
            <Icon name="alert" size={16}/>
            <strong>{t.restoreWarning}</strong>
          </div>
          <p style={{ ...S.meta, marginBottom:12, lineHeight:1.6 }}>
            {t.restoreWarning} {t.date}: <strong>{restoreFile.date}</strong>.
          </p>
          <div style={S.modalBtns}>
            <button style={S.btnSecondary} onClick={() => setRestoreStep(0)}>{t.cancel}</button>
            <PrimaryButton style={{ background:"#ef4444" }} onClick={() => setRestoreStep(2)}>{t.continue}</PrimaryButton>
          </div>
        </Modal>
      )}

      {/* Restore confirmation — step 2: type RESTORE */}
      {restoreStep === 2 && restoreFile && (
        <Modal title={t.confirm} onClose={() => setRestoreStep(0)}>
          <div style={{ ...S.infoBox, background:"#fef2f2", borderColor:"#fca5a5", color:"#b91c1c", marginBottom:16 }}>
            <Icon name="alert" size={16}/>
            <span>{t.restoreWarning}</span>
          </div>
          <p style={{ ...S.meta, marginBottom:12 }}>
            {t.typeRestore} — <strong>{restoreFile.date}</strong>.
          </p>
          <div style={S.fieldGroup}>
            <input style={S.input} value={restoreText}
              onChange={e => setRestoreText(e.target.value)}
              placeholder="Type RESTORE here" autoFocus/>
          </div>
          <div style={S.modalBtns}>
            <button style={S.btnSecondary} onClick={() => setRestoreStep(0)}>{t.cancel}</button>
            <PrimaryButton
              style={{ background:"#ef4444", opacity:(restoreText==="RESTORE" && !restoreBusy)?1:0.4 }}
              onClick={handleRestore}
              disabled={restoreText !== "RESTORE" || restoreBusy}>
              {restoreBusy ? "Restoring…" : t.restore}
            </PrimaryButton>
          </div>
        </Modal>
      )}

      {yearStep === 1 && (
        <Modal title={t.newSchoolYear} onClose={closeYearReset}>
          <div style={{ ...S.infoBox, background:"#fef2f2", borderColor:"#fca5a5", color:"#b91c1c", marginBottom:16 }}>
            <Icon name="alert" size={16}/>
            <strong>{t.newYearWarning}</strong>
          </div>
          <p style={{ ...S.meta, marginBottom:8, lineHeight:1.6 }}>
            {t.newYearWarning}
          </p>
          <div style={S.modalBtns}>
            <button style={S.btnSecondary} onClick={closeYearReset}>{t.cancel}</button>
            <PrimaryButton style={{ background:"#ef4444" }} onClick={() => setYearStep(2)}>{t.continue}</PrimaryButton>
          </div>
        </Modal>
      )}

      {yearStep === 2 && (
        <Modal title={t.newClassName} onClose={closeYearReset}>
          <p style={{ ...S.meta, marginBottom:12 }}>{t.newYearStep2}</p>
          <div style={S.fieldGroup}>
            <label style={S.label}>{t.newClassName}</label>
            <input style={S.input} value={newClassName}
              onChange={e => setNewClassName(e.target.value)}
              placeholder="e.g. Pierwsza Klasa"/>
          </div>
          <div style={S.modalBtns}>
            <button style={S.btnSecondary} onClick={() => setYearStep(1)}>{t.back}</button>
            <PrimaryButton style={{ background:"#ef4444" }} onClick={() => setYearStep(3)} disabled={!newClassName.trim()}>{t.continue}</PrimaryButton>
          </div>
        </Modal>
      )}

      {yearStep === 3 && (
        <Modal title={t.confirm} onClose={closeYearReset}>
          <div style={{ ...S.infoBox, background:"#fef2f2", borderColor:"#fca5a5", color:"#b91c1c", marginBottom:16 }}>
            <Icon name="alert" size={16}/>
            <span>{t.newYearWarning}</span>
          </div>
          <p style={{ ...S.meta, marginBottom:12 }}>
            {t.newYearStep3} — <strong>{newClassName}</strong>.
          </p>
          <div style={S.fieldGroup}>
            <input style={S.input} value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="Type RESET here"/>
          </div>
          <div style={S.modalBtns}>
            <button style={S.btnSecondary} onClick={closeYearReset}>{t.cancel}</button>
            <PrimaryButton
              style={{ background:"#ef4444", opacity:(confirmText==="RESET" && !yearBusy)?1:0.4 }}
              onClick={handleYearReset}
              disabled={confirmText !== "RESET" || yearBusy}>
              {yearBusy ? "Resetting…" : t.confirm}
            </PrimaryButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ ...S.overlay, ...(isMobile ? { alignItems:"flex-end", padding:0 } : {}) }}>
      <div style={{
        ...S.modal,
        ...(isMobile ? { borderRadius:"16px 16px 0 0", maxWidth:"100%", maxHeight:"90vh", overflowY:"auto", padding:"20px 16px 32px" } : {})
      }}>
        <div style={S.modalHeader}>
          <h3 style={S.modalTitle}>{title}</h3>
          <button style={S.closeBtn} onClick={onClose}><Icon name="x" size={18}/></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StatusChip({ status, t }) {
  const map = {
    approved: { bg:"#d1fae5", color:"#065f46", label: t ? t.approved : "Approved" },
    pending:  { bg:"#ede9fe", color:"#5b21b6", label: t ? t.pending  : "Pending"  },
    rejected: { bg:"#fee2e2", color:"#991b1b", label: t ? t.rejected : "Rejected" },
    paid:     { bg:"#d1fae5", color:"#065f46", label: t ? t.paid     : "Paid"     },
    unpaid:   { bg:"#fee2e2", color:"#991b1b", label: t ? t.unpaid   : "Unpaid"   },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ background:s.bg, color:s.color, padding:"2px 10px", borderRadius:99, fontSize:12, fontWeight:600 }}>
      {s.label}
    </span>
  );
}

function getCatStyle(cat) {
  const map = {
    Holiday:      { background:"#fce7f3", color:"#9d174d" },
    Craft:        { background:"#e0e7ff", color:"#3730a3" },
    Snacks:       { background:"#fef3c7", color:"#92400e" },
    "Field Trip": { background:"#d1fae5", color:"#065f46" },
    Birthday:     { background:"#ede9fe", color:"#5b21b6" },
    General:      { background:"#f3f4f6", color:"#374151" },
    Other:        { background:"#f3f4f6", color:"#374151" },
  };
  return map[cat] || map.Other;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  app:          { display:"flex", height:"100vh", width:"100vw", fontFamily:"'Nunito','Segoe UI',sans-serif", background:"#f8fafc", overflow:"hidden", margin:0, padding:0 },

  // ── Sidebar ──
  sidebar:      { width:240, background:"#1e0038", display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"0 0 16px", flexShrink:0, overflowY:"auto" },
  sideHeader:   { display:"flex", alignItems:"center", gap:10, padding:"20px 16px 12px", borderBottom:"1px solid rgba(192,132,252,0.2)" },
  sideTitle:    { color:"#f3e8ff", fontWeight:800, fontSize:16, lineHeight:1.2 },
  sideRole:     { color:"#c084fc", fontSize:11, fontWeight:600 },
  sideUser:     { display:"flex", alignItems:"center", gap:10, padding:"12px 16px", borderBottom:"1px solid rgba(192,132,252,0.2)", marginBottom:8 },
  sideUserName: { color:"#e9d5ff", fontSize:13, fontWeight:700 },
  sideUserEmail:{ color:"#a855f7", fontSize:11 },
  navItem:      { display:"flex", alignItems:"center", gap:10, width:"100%", padding:"10px 16px", background:"none", border:"none", cursor:"pointer", color:"#e9d5ff", fontSize:14, fontWeight:600, textAlign:"left" },
  navActive:    { background:"rgba(168,85,247,0.25)", color:"#f3e8ff", borderRight:"3px solid #a855f7" },
  badge:        { background:"#7b2fbe", color:"#fff", borderRadius:99, fontSize:11, fontWeight:700, minWidth:20, height:20, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 6px" },
  logoutBtn:    { display:"flex", alignItems:"center", gap:8, margin:"8px 12px 0", padding:"9px 14px", background:"rgba(168,85,247,0.15)", border:"none", borderRadius:8, color:"#c084fc", fontSize:13, fontWeight:600, cursor:"pointer" },

  // ── Mobile bars ──
  mobileTopBar:     { position:"fixed", top:0, left:0, right:0, height:41, background:"#1e0038", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", zIndex:200, boxShadow:"0 2px 12px rgba(123,47,190,0.4)" },
  mobileUserMenu:   { position:"fixed", top:56, right:8, background:"#fff", borderRadius:10, boxShadow:"0 8px 30px rgba(123,47,190,0.2)", zIndex:300, minWidth:220, border:"1px solid #e9d5ff" },
  mobileMenuLogout: { display:"flex", alignItems:"center", gap:8, width:"100%", padding:"12px 16px", background:"none", border:"none", cursor:"pointer", color:"#ef4444", fontSize:14, fontWeight:600 },
  bottomNav:        { position:"fixed", bottom:0, left:0, right:0, height:64, background:"#1e0038", display:"flex", alignItems:"stretch", zIndex:200, borderTop:"1px solid rgba(192,132,252,0.2)", marginBottom:"15px" },
  bottomNavItem:    { flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"none", border:"none", cursor:"pointer", color:"#e9d5ff", padding:0, gap:2, transition:"background 0.15s" },
  bottomNavActive:  { color:"#c084fc", background:"rgba(168,85,247,0.25)" },
  bottomNavBadge:   { position:"absolute", top:-4, right:-8, background:"#7b2fbe", color:"#fff", borderRadius:99, fontSize:10, fontWeight:700, minWidth:16, height:16, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 3px" },

  // ── Layout ──
  main:         { flex:1, overflow:"auto", background:"#f8f5ff" },
  page:         { padding:"28px 32px", maxWidth:1000, margin:"0 auto" },
  pageHeader:   { display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, gap:16 },
  pageTitle:    { fontSize:24, fontWeight:800, color:"#2d0057", margin:0 },
  pageSubtitle: { color:"#6b7280", fontSize:14, marginTop:2 },
  statsGrid:    { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 },
  twoCol:       { display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 },

  // ── Cards ──
  card:         { background:"#fff", borderRadius:14, padding:20, marginBottom:20, boxShadow:"0 1px 4px rgba(123,47,190,0.08)", border:"1px solid #ede9fe" },
  cardTitle:    { fontSize:15, fontWeight:800, color:"#2d0057", marginBottom:14, marginTop:0 },
  statCard:     { background:"#fff", borderRadius:14, padding:18, boxShadow:"0 1px 4px rgba(123,47,190,0.08)", border:"1px solid #ede9fe" },
  statIcon:     { width:40, height:40, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10 },
  statValue:    { fontSize:22, fontWeight:800, color:"#2d0057", marginBottom:2 },
  statLabel:    { fontSize:13, fontWeight:700, color:"#374151", marginBottom:2 },
  statNote:     { fontSize:12, color:"#9ca3af" },
  approvalCard: { background:"#fff", borderRadius:12, padding:18, marginBottom:12, boxShadow:"0 1px 4px rgba(123,47,190,0.1)", border:"1px solid #ede9fe" },
  studentCard:  { background:"#fff", borderRadius:12, padding:"14px", marginBottom:10, boxShadow:"0 1px 3px rgba(123,47,190,0.08)", border:"1px solid #ede9fe" },

  // ── Alerts / info ──
  alertBox:     { background:"#faf5ff", border:"1px solid #c084fc", borderRadius:10, padding:"12px 16px", display:"flex", alignItems:"center", gap:10, marginBottom:20, cursor:"pointer", color:"#5b21b6", fontWeight:600, fontSize:14 },
  alertArrow:   { marginLeft:"auto", fontWeight:700 },
  infoBox:      { background:"#faf5ff", border:"1px solid #e9d5ff", borderRadius:8, padding:"10px 14px", display:"flex", alignItems:"center", gap:10, color:"#6b21a8", fontSize:13, marginBottom:12 },

  // ── Rows ──
  expenseRow:   { display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid #f3f4f6", gap:12 },
  expenseDesc:  { fontWeight:600, color:"#111827", fontSize:14 },
  expenseMeta:  { color:"#9ca3af", fontSize:12, marginTop:2 },
  expenseAmt:   { fontWeight:700, color:"#2d0057", fontSize:15, whiteSpace:"nowrap" },
  catBadge:     { display:"flex", alignItems:"center", gap:4, padding:"3px 10px", borderRadius:99, fontSize:12, fontWeight:700, whiteSpace:"nowrap", flexShrink:0 },
  progressWrap: { marginTop:8 },
  progressBar:  { height:10, background:"#e9d5ff", borderRadius:99, overflow:"hidden" },
  progressFill: { height:"100%", background:"linear-gradient(90deg,#7b2fbe,#a855f7)", borderRadius:99, transition:"width .4s" },
  avatar:       { width:36, height:36, borderRadius:"50%", background:"#7b2fbe", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:15, flexShrink:0 },
  miniAvatar:   { width:30, height:30, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, flexShrink:0 },
  userRow:      { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 0", borderBottom:"1px solid #f3f4f6" },
  adminTag:     { background:"#f3e8ff", color:"#6b21a8", padding:"2px 8px", borderRadius:99, fontSize:11, fontWeight:700, marginLeft:6 },
  sectionLabel: { fontSize:13, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:".05em" },
  emptyState:   { textAlign:"center", padding:"60px 20px" },
  empty:        { textAlign:"center", color:"#9ca3af", padding:"24px 0", fontSize:14 },
  meta:         { color:"#6b7280", fontSize:13 },

  // ── Filter ──
  filterBar:    { display:"flex", gap:12, marginBottom:16, flexWrap:"wrap", alignItems:"center" },
  filterBtns:   { display:"flex", gap:6 },
  filterBtn:    { padding:"7px 16px", borderRadius:99, border:"1px solid #e9d5ff", background:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", color:"#6b7280" },
  filterActive: { background:"#4a0080", color:"#fff", border:"1px solid #4a0080" },

  // ── Table ──
  table:        { width:"100%", borderCollapse:"collapse" },
  thead:        { background:"#faf5ff" },
  th:           { padding:"10px 14px", textAlign:"left", fontSize:12, fontWeight:700, color:"#6b21a8", textTransform:"uppercase", letterSpacing:".04em", borderBottom:"1px solid #ede9fe" },
  trow:         { borderBottom:"1px solid #f3f4f6" },
  td:           { padding:"12px 14px", fontSize:14 },
  studentName:  { fontWeight:600, color:"#111827" },
  statusToggle: { padding:"4px 12px", borderRadius:99, border:"none", cursor:"pointer", fontSize:13, fontWeight:700 },
  paidBtn:      { background:"#d1fae5", color:"#065f46" },
  unpaidBtn:    { background:"#fee2e2", color:"#991b1b" },

  // ── Buttons ──
  btnPrimary:   { display:"inline-flex", alignItems:"center", gap:6, padding:"9px 20px", borderRadius:8, background:"linear-gradient(135deg, #4a0080, #7b2fbe)", color:"#fff", border:"none", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" },
  btnSecondary: { display:"inline-flex", alignItems:"center", gap:6, padding:"9px 20px", borderRadius:8, background:"#fff", color:"#4a0080", border:"1.5px solid #e9d5ff", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" },
  btnApprove:   { display:"inline-flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:8, background:"#10b981", color:"#fff", border:"none", fontWeight:700, fontSize:13, cursor:"pointer" },
  btnReject:    { display:"inline-flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:8, background:"#fee2e2", color:"#991b1b", border:"none", fontWeight:700, fontSize:13, cursor:"pointer" },
  iconBtn:      { padding:7, borderRadius:7, background:"#f5f3ff", border:"none", cursor:"pointer", display:"flex", alignItems:"center", color:"#4a0080" },

  // ── Forms ──
  label:        { display:"block", fontSize:14, fontWeight:600, color:"#4a0080", marginBottom:5, fontFamily:"'Playfair Display', serif" },
  input:        { width:"100%", padding:"11px 14px", borderRadius:10, border:"1.5px solid #c084fc", fontSize:15, outline:"none", boxSizing:"border-box", background:"#faf5ff", fontFamily:"'Nunito', sans-serif", color:"#2d0057" },
  fieldGroup:   { marginBottom:14 },
  eyeBtn:       { position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#a855f7", display:"flex", alignItems:"center" },
  errorText:    { color:"#ef4444", fontSize:13, marginBottom:12, fontWeight:600 },

  // ── Modal ──
  overlay:      { position:"fixed", inset:0, background:"rgba(45,0,87,.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 },
  modal:        { background:"#fff", borderRadius:14, width:"100%", maxWidth:460, padding:24, boxShadow:"0 20px 60px rgba(123,47,190,0.25)" },
  modalHeader:  { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 },
  modalTitle:   { fontSize:17, fontWeight:800, color:"#2d0057", margin:0 },
  closeBtn:     { background:"none", border:"none", cursor:"pointer", color:"#a855f7", display:"flex", padding:4 },
  modalBtns:    { display:"flex", gap:10, justifyContent:"flex-end", marginTop:20 },

  // ── Login ──
  loginWrap:    { display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", width:"100vw", margin:0, padding:20, background:"linear-gradient(135deg, #1a0033 0%, #4a0080 40%, #7b2fbe 70%, #9d4edd 100%)", position:"relative", overflow:"hidden" },
  loginCard:    { background:"#fff", borderRadius:18, padding:40, width:"100%", maxWidth:400, boxShadow:"0 25px 60px rgba(123,47,190,0.4)", borderTop:"4px solid #7b2fbe" },
  loginLogo:    { textAlign:"center", marginBottom:28 },
  loginTitle:   { fontSize:28, fontWeight:700, color:"#2d0057", margin:0, fontFamily:"'Playfair Display', serif" },
  loginSub:     { color:"#6b21a8", fontSize:14, marginTop:4, fontFamily:"'Nunito', sans-serif" },
  loginHint:    { textAlign:"center", fontSize:12, color:"#9ca3af", marginTop:16 },

  // ── Toast ──
  toast:        { position:"fixed", top:20, right:20, color:"#fff", padding:"12px 20px", borderRadius:10, fontWeight:700, fontSize:14, zIndex:2000, boxShadow:"0 4px 20px rgba(123,47,190,0.3)" },
};
