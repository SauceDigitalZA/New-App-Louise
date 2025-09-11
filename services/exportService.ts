
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { utils, writeFile } from 'xlsx';

export const exportToPDF = (elementId: string, fileName: string = 'dashboard-report.pdf'): void => {
  const input = document.getElementById(elementId);
  if (!input) {
    console.error(`Element with id "${elementId}" not found.`);
    return;
  }

  html2canvas(input, { scale: 2 }).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(fileName);
  });
};

// Fix: Refactored exportToExcel to accept an array of sheet objects.
// This allows exporting multiple datasets into separate sheets in a single file,
// resolving the TypeScript error from mixing incompatible data types.
interface ExcelSheet {
  sheetName: string;
  data: any[];
}

export const exportToExcel = (sheets: ExcelSheet[], fileName: string = 'data-export.xlsx'): void => {
  if (sheets.length === 0 || sheets.every(s => s.data.length === 0)) {
    alert('No data to export.');
    return;
  }
  const workbook = utils.book_new();
  sheets.forEach(sheet => {
    if (sheet.data.length > 0) {
      const worksheet = utils.json_to_sheet(sheet.data);
      utils.book_append_sheet(workbook, worksheet, sheet.sheetName);
    }
  });
  writeFile(workbook, fileName);
};
