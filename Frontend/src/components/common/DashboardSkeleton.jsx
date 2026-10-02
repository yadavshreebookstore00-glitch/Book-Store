import React from 'react';

const DashboardSkeleton = () => {
  return (
    <div className="ds-wrapper">
      {/* ===== Header Skeleton ===== */}
      <div className="ds-header">
        <div className="ds-skel ds-title" />
        <div className="ds-skel ds-subtitle" />
      </div>

      {/* ===== Today's Highlight Skeleton ===== */}
      <div className="ds-today">
        <div>
          <div className="ds-skel ds-today-label" />
          <div className="ds-skel ds-today-value" />
        </div>
        <div className="ds-skel ds-today-date" />
      </div>

      {/* ===== Stat Cards Skeleton ===== */}
      <div className="ds-stats-grid">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="ds-stat-card">
            <div className="ds-skel ds-stat-icon" />
            <div className="ds-stat-content">
              <div className="ds-skel ds-stat-title" />
              <div className="ds-skel ds-stat-value" />
            </div>
          </div>
        ))}
      </div>

      {/* ===== Charts Row 1 Skeleton ===== */}
      <div className="ds-charts-row">
        {/* Chart 1 */}
        <div className="ds-chart-card">
          <div className="ds-skel ds-chart-title" />
          <div className="ds-skel ds-chart-subtitle" />
          <div className="ds-chart-area">
            <div className="ds-chart-bars">
              {[40, 65, 50, 80, 45, 70, 55].map((h, i) => (
                <div
                  key={i}
                  className="ds-skel ds-bar"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Chart 2 (Pie) */}
        <div className="ds-chart-card">
          <div className="ds-skel ds-chart-title" />
          <div className="ds-skel ds-chart-subtitle" />
          <div className="ds-pie-wrap">
            <div className="ds-skel ds-pie" />
          </div>
        </div>
      </div>

      {/* ===== Contact Messages Section Skeleton ===== */}
      <div className="ds-contact-section">
        {/* Header */}
        <div className="ds-contact-header">
          <div>
            <div className="ds-skel ds-contact-title" />
            <div className="ds-skel ds-contact-subtitle" />
          </div>
          <div className="ds-skel ds-contact-btn" />
        </div>

        {/* Mini Stats */}
        <div className="ds-mini-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="ds-mini-card">
              <div className="ds-skel ds-mini-icon" />
              <div>
                <div className="ds-skel ds-mini-label" />
                <div className="ds-skel ds-mini-value" />
              </div>
            </div>
          ))}
        </div>

        {/* Recent Contacts */}
        <div className="ds-contact-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="ds-contact-item">
              <div className="ds-skel ds-contact-avatar" />
              <div className="ds-contact-info">
                <div className="ds-skel ds-contact-name" />
                <div className="ds-skel ds-contact-subject" />
              </div>
              <div className="ds-skel ds-contact-time" />
            </div>
          ))}
        </div>
      </div>

      {/* ===== Charts Row 2 Skeleton ===== */}
      <div className="ds-charts-row">
        <div className="ds-chart-card">
          <div className="ds-skel ds-chart-title" />
          <div className="ds-skel ds-chart-subtitle" />
          <div className="ds-list-skeleton">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="ds-list-item">
                <div className="ds-skel ds-list-img" />
                <div className="ds-list-info">
                  <div className="ds-skel ds-list-name" />
                  <div className="ds-skel ds-list-sub" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ds-chart-card">
          <div className="ds-skel ds-chart-title" />
          <div className="ds-skel ds-chart-subtitle" />
          <div className="ds-chart-area">
            <div className="ds-chart-bars">
              {[60, 45, 70, 55, 80].map((h, i) => (
                <div
                  key={i}
                  className="ds-skel ds-bar"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Recent Orders + Low Stock Skeleton ===== */}
      <div className="ds-charts-row">
        {[1, 2].map((col) => (
          <div key={col} className="ds-chart-card">
            <div className="ds-skel ds-chart-title" />
            <div className="ds-skel ds-chart-subtitle" />
            <div className="ds-list-skeleton">
              {[1, 2, 3].map((i) => (
                <div key={i} className="ds-list-item">
                  <div className="ds-skel ds-list-avatar" />
                  <div className="ds-list-info">
                    <div className="ds-skel ds-list-name" />
                    <div className="ds-skel ds-list-sub" />
                  </div>
                  <div className="ds-skel ds-list-amount" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ============================================================
          CSS
          ============================================================ */}
      <style>{`
        /* ================= WRAPPER ================= */
        .ds-wrapper {
          width: 100%;
        }

        /* ================= SKELETON BASE ================= */
        .ds-skel {
          background: linear-gradient(
            90deg,
            #eff0f5 0%,
            #f7f8fc 50%,
            #eff0f5 100%
          );
          background-size: 200% 100%;
          animation: ds-shimmer 1.5s infinite;
          border-radius: 6px;
        }

        @keyframes ds-shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        /* ================= HEADER ================= */
        .ds-header {
          margin-bottom: 25px;
        }

        .ds-title {
          width: 240px;
          height: 26px;
          margin-bottom: 8px;
        }

        .ds-subtitle {
          width: 200px;
          height: 14px;
        }

        /* ================= TODAY HIGHLIGHT ================= */
        .ds-today {
          background: #e8eaf6;
          border-radius: 12px;
          padding: 22px 25px;
          margin-bottom: 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }

        .ds-today-label {
          width: 140px;
          height: 12px;
          margin-bottom: 8px;
        }

        .ds-today-value {
          width: 260px;
          height: 22px;
        }

        .ds-today-date {
          width: 120px;
          height: 32px;
          border-radius: 16px;
        }

        /* ================= STATS GRID ================= */
        .ds-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 18px;
          margin-bottom: 25px;
        }

        .ds-stat-card {
          background: #fff;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
          display: flex;
          align-items: center;
          gap: 16px;
          border-left: 5px solid #eff0f5;
        }

        .ds-stat-icon {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          flex-shrink: 0;
        }

        .ds-stat-content {
          flex: 1;
          min-width: 0;
        }

        .ds-stat-title {
          width: 80%;
          height: 12px;
          margin-bottom: 8px;
        }

        .ds-stat-value {
          width: 60%;
          height: 22px;
        }

        /* ================= CHARTS ROW ================= */
        .ds-charts-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px;
          margin-bottom: 25px;
        }

        .ds-chart-card {
          background: #fff;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
        }

        .ds-chart-title {
          width: 140px;
          height: 17px;
          margin-bottom: 8px;
        }

        .ds-chart-subtitle {
          width: 180px;
          height: 12px;
          margin-bottom: 20px;
        }

        /* Bar chart area */
        .ds-chart-area {
          height: 220px;
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          padding: 20px 10px;
          border-radius: 8px;
          background: #fafbfd;
        }

        .ds-chart-bars {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          width: 100%;
          height: 100%;
          gap: 10px;
        }

        .ds-bar {
          flex: 1;
          max-width: 40px;
          border-radius: 4px 4px 0 0;
        }

        /* Pie chart */
        .ds-pie-wrap {
          height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ds-pie {
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background: #eff0f5;
        }

        /* ================= CONTACT SECTION ================= */
        .ds-contact-section {
          background: #fff;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
          margin-bottom: 25px;
          border-top: 4px solid #eff0f5;
        }

        .ds-contact-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .ds-contact-title {
          width: 200px;
          height: 18px;
          margin-bottom: 8px;
        }

        .ds-contact-subtitle {
          width: 160px;
          height: 12px;
        }

        .ds-contact-btn {
          width: 90px;
          height: 32px;
          border-radius: 8px;
        }

        /* Mini stats */
        .ds-mini-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .ds-mini-card {
          background: #fafbfd;
          padding: 14px 12px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .ds-mini-icon {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          flex-shrink: 0;
        }

        .ds-mini-label {
          width: 50px;
          height: 9px;
          margin-bottom: 6px;
        }

        .ds-mini-value {
          width: 32px;
          height: 18px;
        }

        /* Contact list */
        .ds-contact-list {
          display: flex;
          flex-direction: column;
        }

        .ds-contact-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #f5f5f5;
        }

        .ds-contact-item:last-child {
          border-bottom: none;
        }

        .ds-contact-avatar {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .ds-contact-info {
          flex: 1;
          min-width: 0;
        }

        .ds-contact-name {
          width: 45%;
          height: 13px;
          margin-bottom: 6px;
        }

        .ds-contact-subject {
          width: 70%;
          height: 11px;
        }

        .ds-contact-time {
          width: 70px;
          height: 12px;
          flex-shrink: 0;
        }

        /* ================= LIST SKELETON ================= */
        .ds-list-skeleton {
          display: flex;
          flex-direction: column;
        }

        .ds-list-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid #f5f5f5;
        }

        .ds-list-item:last-child {
          border-bottom: none;
        }

        .ds-list-img {
          width: 35px;
          height: 48px;
          border-radius: 5px;
          flex-shrink: 0;
        }

        .ds-list-avatar {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .ds-list-info {
          flex: 1;
          min-width: 0;
        }

        .ds-list-name {
          width: 60%;
          height: 13px;
          margin-bottom: 6px;
        }

        .ds-list-sub {
          width: 40%;
          height: 11px;
        }

        .ds-list-amount {
          width: 50px;
          height: 14px;
          flex-shrink: 0;
        }

        /* ============================================================
           RESPONSIVE
           ============================================================ */

        @media (max-width: 768px) {
          .ds-title {
            width: 180px;
            height: 20px;
          }

          .ds-subtitle {
            width: 150px;
            height: 12px;
          }

          .ds-today {
            padding: 18px;
          }

          .ds-today-value {
            width: 180px;
            height: 18px;
          }

          .ds-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .ds-stat-card {
            padding: 16px 14px;
            gap: 12px;
          }

          .ds-stat-icon {
            width: 44px;
            height: 44px;
          }

          .ds-stat-title {
            height: 10px;
          }

          .ds-stat-value {
            height: 18px;
          }

          .ds-charts-row {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .ds-chart-card {
            padding: 20px;
          }

          .ds-chart-area {
            height: 180px;
          }

          .ds-pie-wrap {
            height: 180px;
          }

          .ds-pie {
            width: 130px;
            height: 130px;
          }

          .ds-contact-section {
            padding: 20px;
          }

          .ds-mini-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .ds-contact-item {
            gap: 10px;
          }

          .ds-contact-avatar {
            width: 34px;
            height: 34px;
          }
        }

        @media (max-width: 480px) {
          .ds-title {
            width: 140px;
            height: 18px;
          }

          .ds-today-label {
            width: 100px;
            height: 10px;
          }

          .ds-today-value {
            width: 150px;
            height: 16px;
          }

          .ds-today-date {
            width: 90px;
            height: 26px;
          }

          .ds-stat-icon {
            width: 38px;
            height: 38px;
          }

          .ds-chart-card {
            padding: 16px;
          }

          .ds-chart-area {
            height: 150px;
          }

          .ds-pie {
            width: 110px;
            height: 110px;
          }

          .ds-contact-section {
            padding: 16px;
          }

          .ds-contact-title {
            height: 16px;
          }

          .ds-mini-icon {
            width: 32px;
            height: 32px;
          }

          .ds-mini-value {
            height: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardSkeleton;