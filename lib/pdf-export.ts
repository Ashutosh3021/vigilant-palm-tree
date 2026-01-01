import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReportData {
  title: string;
  dateRange: string;
  summary: {
    productiveDays: number;
    avgScore: number;
    completedTasks: number;
    totalHours: number;
  };
  goals: Array<{
    name: string;
    progress: string;
    status: string;
  }>;
  habits: {
    avgScreenTime: number;
    avgSleep: number;
    avgWater: number;
    avgMood: number;
    avgEnergy: number;
  };
  achievements: string[];
}

export const exportReportToPDF = async (reportData: ReportData, elementId?: string) => {
  try {
    let pdf: jsPDF;
    
    if (elementId) {
      // If an element ID is provided, capture that element as PDF
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with ID ${elementId} not found`);
      }
      
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
    } else {
      // Create a structured PDF report
      pdf = new jsPDF();
      
      // Title
      pdf.setFontSize(22);
      pdf.setTextColor(30, 30, 30);
      pdf.text(reportData.title, 105, 20, { align: 'center' });
      
      // Date range
      pdf.setFontSize(14);
      pdf.setTextColor(100, 100, 100);
      pdf.text(reportData.dateRange, 105, 30, { align: 'center' });
      
      // Summary section
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Executive Summary', 20, 45);
      
      pdf.setFontSize(12);
      pdf.text(`Productive Days: ${reportData.summary.productiveDays}`, 20, 55);
      pdf.text(`Average Score: ${reportData.summary.avgScore}%`, 20, 62);
      pdf.text(`Tasks Completed: ${reportData.summary.completedTasks}`, 20, 69);
      pdf.text(`Estimated Hours: ${reportData.summary.totalHours.toFixed(1)}`, 20, 76);
      
      // Goals section
      pdf.setFontSize(16);
      pdf.text('Goals Progress', 20, 90);
      
      let goalY = 98;
      for (const goal of reportData.goals) {
        pdf.setFontSize(12);
        pdf.text(`${goal.name}: ${goal.progress} (${goal.status})`, 20, goalY);
        goalY += 7;
      }
      
      // Habits section
      pdf.setFontSize(16);
      pdf.text('Habit Metrics', 20, goalY + 10);
      
      pdf.setFontSize(12);
      pdf.text(`Avg Screen Time: ${reportData.habits.avgScreenTime.toFixed(1)} hours`, 20, goalY + 18);
      pdf.text(`Avg Sleep: ${reportData.habits.avgSleep.toFixed(1)} hours`, 20, goalY + 25);
      pdf.text(`Avg Water: ${reportData.habits.avgWater.toFixed(0)} glasses`, 20, goalY + 32);
      pdf.text(`Avg Mood: ${reportData.habits.avgMood}/10`, 20, goalY + 39);
      pdf.text(`Avg Energy: ${reportData.habits.avgEnergy}/10`, 20, goalY + 46);
      
      // Achievements section
      if (reportData.achievements.length > 0) {
        pdf.setFontSize(16);
        pdf.text('Achievements', 20, goalY + 60);
        
        let achievementY = goalY + 68;
        for (const achievement of reportData.achievements) {
          pdf.setFontSize(12);
          pdf.text(`• ${achievement}`, 20, achievementY);
          achievementY += 7;
        }
      }
    }
    
    // Save the PDF
    pdf.save(`${reportData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};