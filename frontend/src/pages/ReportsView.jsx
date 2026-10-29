export default function ReportsView() {
  return (
    <div className="view-container">
      <div className="view-intro">
        <h2>Institutional Reports & Analytics</h2>
        <p>Export semester grade audits, attendance compliance sheets, and accreditation data.</p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">STUDENT RETENTION</span>
          <strong className="metric-value">98.6%</strong>
          <span className="metric-trend positive">↑ 1.2% over last term</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">AVERAGE INSTITUTION CGPA</span>
          <strong className="metric-value">8.42</strong>
          <span className="metric-trend positive">↑ High distinction</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">OVERALL ATTENDANCE RATE</span>
          <strong className="metric-value">91.4%</strong>
          <span className="metric-trend positive">Satisfies regulatory criteria</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">GRADUATION RATE</span>
          <strong className="metric-value">99.1%</strong>
          <span className="metric-trend positive">Class of 2026</span>
        </div>
      </div>

      <div className="portal-card" style={{ marginTop: '24px' }}>
        <div className="portal-card-header">
          <h3>Available Academic Reports for Download</h3>
        </div>

        <div className="reports-list">
          <div className="report-item">
            <div>
              <strong>Semester 3 CSE Grade Distribution Report</strong>
              <p>Full cohort grading curve, mean, median, and standard deviation.</p>
            </div>
            <button className="secondary-btn" onClick={() => alert('Downloading CSV Report...')}>
              ⬇ Download CSV
            </button>
          </div>

          <div className="report-item">
            <div>
              <strong>Attendance Shortage Notice Report (Under 75%)</strong>
              <p>Filtered list of students requiring attendance counseling.</p>
            </div>
            <button className="secondary-btn" onClick={() => alert('Downloading PDF Report...')}>
              ⬇ Download PDF
            </button>
          </div>

          <div className="report-item">
            <div>
              <strong>Faculty Instructional Load Summary</strong>
              <p>Weekly classroom hours, lab batches, and credit allocations.</p>
            </div>
            <button className="secondary-btn" onClick={() => alert('Downloading Audit Sheet...')}>
              ⬇ Download Audit Sheet
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

