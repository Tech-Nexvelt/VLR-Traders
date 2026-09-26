"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Package,
  FolderKanban,
  Sliders,
  Globe,
  Home,
  LogOut,
  Search,
  Bell,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import styles from "./admin-layout.module.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [leadCount, setLeadCount] = useState<number>(0);
  const [profile, setProfile] = useState<{ fullName: string; email: string } | null>(null);

  // Collapse state for desktop sidebar (250px -> 70px)
  const [collapsed, setCollapsed] = useState<boolean>(false);
  // Drawer open state for mobile responsive navigation
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) return;

    // Fetch live lead count for sidebar badge
    fetch("/api/leads")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setLeadCount(data.count || 0);
      })
      .catch(() => {});

    // Fetch the logged-in user profile
    fetch("/api/admin/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProfile(data.profile);
      })
      .catch(() => {});
  }, [isLoginPage]);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
    { label: "Leads", href: "/admin/leads", icon: <Users size={18} />, badge: leadCount > 0 ? leadCount : undefined },
    { label: "Catalog Management", href: "/admin/catalog", icon: <Package size={18} /> },
    { label: "Projects", href: "/admin/projects", icon: <FolderKanban size={18} /> },
    { label: "Enquiries Settings", href: "/admin/settings/enquiries", icon: <Sliders size={18} /> },
    { label: "Website Settings", href: "/admin/settings/website", icon: <Globe size={18} /> },
  ];

  return (
    <div className={styles.adminWrapper}>
      {/* Mobile Drawer Backdrop Overlay */}
      {mobileOpen && (
        <div
          className={styles.mobileBackdrop}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── LEFT SIDEBAR ───────────────────────────────────── */}
      <aside
        className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""} ${
          mobileOpen ? styles.mobileSidebarOpen : ""
        }`}
      >
        {/* Toggle Button (Floating on edge between sidebar & topbar, vertically centered at 16px) */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className={styles.collapseToggleBtn}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className={styles.sidebarTop}>
          {/* Header / Brand Section (Fixed 64px height) */}
          <div className={styles.sidebarHeader}>
            <Link href="/" className={styles.brandWrap}>
              <div className={styles.brandLogoCircle}>VLR</div>
              {!collapsed && (
                <div className={styles.brandTextGroup}>
                  <span className={styles.brandName}>VLR TRADERS</span>
                  <span className={styles.brandSub}>MINI CRM</span>
                </div>
              )}
            </Link>

            {/* Mobile Close Button */}
            <button
              type="button"
              className={styles.mobileCloseBtn}
              onClick={() => setMobileOpen(false)}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav List */}
          <nav className={styles.navSection}>
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href === "/admin/leads" && pathname === "/admin");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.activeNavLink : ""}`}
                  title={collapsed ? item.label : undefined}
                >
                  <div className={styles.navLinkContent}>
                    <span className={styles.navIcon}>{item.icon}</span>
                    {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                  </div>
                  {item.badge !== undefined && (
                    <span className={`${styles.badgePill} ${collapsed ? styles.badgePillDot : ""}`}>
                      {collapsed ? "" : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          {/* Sidebar Promo Card (Hidden when collapsed) */}
          {!collapsed && (
            <div className={styles.promoCard}>
              <span className={styles.promoIcon}>
                <Home size={20} color="#1b4f8a" />
              </span>
              <h4 className={styles.promoTitle}>Grow Your Business</h4>
              <p className={styles.promoDesc}>
                Manage enquiries, update products and track your growth — all in one place.
              </p>
              <a href="/" target="_blank" className={styles.promoBtn}>
                View Website <ExternalLink size={12} />
              </a>
            </div>
          )}

          {/* Footer utilities */}
          <div className={styles.sidebarFooterNav}>
            <button
              type="button"
              className={styles.logoutBtn}
              onClick={handleLogout}
              title={collapsed ? "Logout" : undefined}
            >
              <span className={styles.logoutContent}>
                <LogOut size={16} />
                {!collapsed && <span>Logout</span>}
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ────────────────────────────────── */}
      <div className={styles.mainContainer}>
        {/* Top Header Bar (Fixed 64px height) */}
        <header className={styles.topHeader}>
          <div className={styles.headerLeft}>
            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              className={styles.mobileHamburgerBtn}
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>

            {/* Search Input */}
            <div className={styles.searchWrap}>
              <span className={styles.searchIcon}>
                <Search size={16} color="#64748b" />
              </span>
              <input
                type="search"
                className={styles.searchInput}
                placeholder="Search leads, products, or anything..."
              />
              <span className={styles.shortcutKbd}>⌘ K</span>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button type="button" className={styles.notifBtn} title="Notifications">
              <Bell size={18} color="#475569" />
              <span className={styles.notifBadge} />
            </button>

            <div className={styles.profileBox}>
              <div className={styles.avatarCircle}>
                {(profile?.fullName || "Admin")
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className={styles.profileMeta}>
                <span className={styles.profileName}>{profile?.fullName || "Admin"}</span>
                <span className={styles.profileEmail}>{profile?.email || ""}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={styles.pageContent}>{children}</main>
      </div>
    </div>
  );
}
