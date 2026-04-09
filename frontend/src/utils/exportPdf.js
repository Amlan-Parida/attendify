import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatPct } from './attendanceUtils';

export const exportDashboardToPDF = (subjects, userName) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(99, 102, 241); // Primary color
  doc.text('Attendify Report', 14, 22);

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Student: ${userName}`, 14, 30);
  doc.text(`Generated on: ${date}`, 14, 36);

  // Table Data
  const tableColumn = ['Subject', 'Attended', 'Conducted', 'Percentage', 'Status', 'Classes Needed / Safe'];
  const tableRows = [];

  let totalAttended = 0;
  let totalConducted = 0;

  subjects.forEach((subject) => {
    totalAttended += subject.attended;
    totalConducted += subject.conducted;
    const pct = formatPct(subject.attended, subject.conducted);
    const needed = subject.classesNeeded > 0 ? `Need ${subject.classesNeeded}` : `Safe to miss ${subject.canMiss}`;
    
    tableRows.push([
      subject.name,
      subject.attended.toString(),
      subject.conducted.toString(),
      `${pct}%`,
      subject.status.toUpperCase(),
      needed,
    ]);
  });

  // Render Table
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      3: { fontStyle: 'bold' },
      4: { fontStyle: 'bold', textColor: [71, 85, 105] },
    },
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index === 4) {
        const status = data.cell.raw;
        if (status === 'SAFE') data.cell.styles.textColor = [34, 197, 94]; // Green
        else if (status === 'WARNING') data.cell.styles.textColor = [245, 158, 11]; // Amber
        else if (status === 'CRITICAL') data.cell.styles.textColor = [239, 68, 68]; // Red
      }
    }
  });

  // Footer Summary
  const finalY = doc.lastAutoTable.finalY || 45;
  const overallPct = formatPct(totalAttended, totalConducted);
  
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text(`Overall Attendance: ${overallPct}%`, 14, finalY + 15);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Classes Attended: ${totalAttended} / ${totalConducted}`, 14, finalY + 22);

  // Save the PDF
  doc.save(`Attendify_Report_${userName.replace(/\s+/g, '_')}_${date.replace(/\//g, '-')}.pdf`);
};
