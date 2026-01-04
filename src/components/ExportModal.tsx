import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  Download,
  Settings,
  Calendar,
  Trophy,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Zap,
  Loader2,
  FileJson,
  FileType
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from "docx";
import { saveAs } from "file-saver";

interface ExamAttempt {
  id: string;
  exam: {
    id: string;
    title: string;
    language: string;
  };
  score: number;
  total_points: number;
  start_time: string;
  end_time: string;
  is_completed: boolean;
  passed: boolean;
  distinction?: boolean;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  attempts: ExamAttempt[];
  averageScore: number;
  totalAttempts: number;
  passedAttempts: number;
  distinctionAttempts: number;
  passRate: number;
  performanceTrend: Array<{
    date: string;
    score: number;
    exam_title: string;
    status: "pass" | "fail" | "distinction";
  }>;
}

const ExportModal = ({
  isOpen,
  onClose,
  attempts,
  averageScore,
  totalAttempts,
  passedAttempts,
  distinctionAttempts,
  passRate,
  performanceTrend
}: ExportModalProps) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [csvOptions, setCsvOptions] = useState({
    includeHeaders: true,
    includeMetadata: true,
    includeTimeTaken: true,
    includeStatus: true,
    delimiter: "comma",
    encoding: "utf-8"
  });
  const [jsonOptions, setJsonOptions] = useState({
    prettyPrint: true,
    includeMetadata: true,
    includePerformanceData: true,
    includeChartData: true,
    minify: false
  });
  const [pdfOptions, setPdfOptions] = useState({
    includeCharts: true,
    includeStatistics: true,
    includeDetailedResults: true,
    orientation: "portrait",
    paperSize: "a4"
  });

  const formatTimeTaken = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
    return `${diffMins}m ${diffSecs}s`;
  };

  const getStatusText = (attempt: ExamAttempt) => {
    if (attempt.distinction) return "Distinction";
    if (attempt.passed) return "Pass";
    return "Fail";
  };

  const getStatusIcon = (attempt: ExamAttempt) => {
    if (attempt.distinction) return "🏆";
    if (attempt.passed) return "✅";
    return "❌";
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    setExportProgress(10);

    try {
      const pdf = new jsPDF({
        orientation: pdfOptions.orientation as "portrait" | "landscape",
        unit: "mm",
        format: pdfOptions.paperSize as "a4" | "letter"
      });

      setExportProgress(30);

      // Add title
      pdf.setFontSize(24);
      pdf.text("Exam Results Report", 20, 30);
      
      setExportProgress(40);

      // Add summary statistics
      pdf.setFontSize(16);
      pdf.text("Summary Statistics", 20, 50);
      
      pdf.setFontSize(12);
      const summaryData = [
        `Total Exams: ${totalAttempts}`,
        `Passed: ${passedAttempts}`,
        `Distinctions: ${distinctionAttempts}`,
        `Average Score: ${averageScore}%`,
        `Pass Rate: ${passRate}%`
      ];
      
      summaryData.forEach((item, index) => {
        pdf.text(item, 25, 65 + (index * 8));
      });

      setExportProgress(60);

      // Add detailed results
      pdf.setFontSize(16);
      pdf.text("Detailed Results", 20, 120);
      
      pdf.setFontSize(10);
      const startY = 135;
      let currentY = startY;

      attempts.forEach((attempt, index) => {
        if (currentY > 250) {
          pdf.addPage();
          currentY = 30;
        }

        pdf.text(`${getStatusIcon(attempt)} ${attempt.exam.title}`, 20, currentY);
        pdf.text(`Score: ${attempt.score}% | Status: ${getStatusText(attempt)} | Date: ${new Date(attempt.end_time).toLocaleDateString()}`, 25, currentY + 5);
        pdf.text(`Language: ${attempt.exam.language} | Time Taken: ${formatTimeTaken(attempt.start_time, attempt.end_time)}`, 25, currentY + 10);
        
        currentY += 20;
        setExportProgress(60 + (index / attempts.length) * 30);
      });

      setExportProgress(95);

      // Save the PDF
      pdf.save(`exam-results-${new Date().toISOString().split('T')[0]}.pdf`);

      setExportProgress(100);
      toast({
        title: "Export Successful",
        description: "Results exported to PDF file",
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export to PDF",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const exportToWord = async () => {
    setIsExporting(true);
    setExportProgress(10);

    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Exam Results Report",
                  bold: true,
                  size: 32,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Generated on ${new Date().toLocaleDateString()}`,
                  size: 20,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Summary Statistics",
                  bold: true,
                  size: 24,
                }),
              ],
            }),
            ...[
              `Total Exams: ${totalAttempts}`,
              `Passed: ${passedAttempts}`,
              `Distinctions: ${distinctionAttempts}`,
              `Average Score: ${averageScore}%`,
              `Pass Rate: ${passRate}%`
            ].map(stat => new Paragraph({
              children: [new TextRun({ text: stat, size: 22 })],
            })),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Detailed Results",
                  bold: true,
                  size: 24,
                }),
              ],
            }),
            ...attempts.map(attempt => 
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${getStatusIcon(attempt)} ${attempt.exam.title}`,
                    bold: true,
                    size: 22,
                  }),
                  new TextRun({
                    text: `\nScore: ${attempt.score}% | Status: ${getStatusText(attempt)} | Date: ${new Date(attempt.end_time).toLocaleDateString()}\nLanguage: ${attempt.exam.language} | Time Taken: ${formatTimeTaken(attempt.start_time, attempt.end_time)}`,
                    size: 20,
                  }),
                ],
              })
            )
          ],
        }],
      });

      setExportProgress(80);

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `exam-results-${new Date().toISOString().split('T')[0]}.docx`);

      setExportProgress(100);
      toast({
        title: "Export Successful",
        description: "Results exported to Word document",
      });
    } catch (error) {
      console.error("Word export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export to Word",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    setExportProgress(10);

    try {
      const workbook = XLSX.utils.book_new();

      // Summary sheet
      const summaryData = [
        ["Metric", "Value"],
        ["Total Exams", totalAttempts],
        ["Passed", passedAttempts],
        ["Distinctions", distinctionAttempts],
        ["Average Score", `${averageScore}%`],
        ["Pass Rate", `${passRate}%`]
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

      setExportProgress(40);

      // Detailed results sheet
      const detailedData = [
        ["Exam Title", "Score", "Status", "Date Completed", "Time Taken", "Language", "Total Points"]
      ].concat(
        attempts.map(attempt => [
          attempt.exam.title,
          `${attempt.score}%`,
          getStatusText(attempt),
          new Date(attempt.end_time).toLocaleDateString(),
          formatTimeTaken(attempt.start_time, attempt.end_time),
          attempt.exam.language,
          attempt.total_points
        ])
      );
      const detailedSheet = XLSX.utils.aoa_to_sheet(detailedData);
      XLSX.utils.book_append_sheet(workbook, detailedSheet, "Detailed Results");

      setExportProgress(80);

      // Performance trend sheet
      if (performanceTrend.length > 0) {
        const trendData = [
          ["Date", "Score", "Exam Title", "Status"]
        ].concat(
          performanceTrend.map(trend => [
            trend.date,
            `${trend.score}%`,
            trend.exam_title,
            trend.status.charAt(0).toUpperCase() + trend.status.slice(1)
          ])
        );
        const trendSheet = XLSX.utils.aoa_to_sheet(trendData);
        XLSX.utils.book_append_sheet(workbook, trendSheet, "Performance Trend");
      }

      setExportProgress(95);

      // Save the file
      XLSX.writeFile(workbook, `exam-results-${new Date().toISOString().split('T')[0]}.xlsx`);

      setExportProgress(100);
      toast({
        title: "Export Successful",
        description: "Results exported to Excel file",
      });
    } catch (error) {
      console.error("Excel export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export to Excel",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const exportToImage = async () => {
    setIsExporting(true);
    setExportProgress(10);

    try {
      // Find the chart element
      const chartElement = document.querySelector('[data-chart]') || document.querySelector('.recharts-wrapper');
      
      if (!chartElement) {
        throw new Error("Chart element not found");
      }

      setExportProgress(50);

      const canvas = await html2canvas(chartElement as HTMLElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      });

      setExportProgress(80);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, `exam-performance-chart-${new Date().toISOString().split('T')[0]}.png`);
        }
      }, 'image/png');

      setExportProgress(100);
      toast({
        title: "Export Successful",
        description: "Chart exported as image",
      });
    } catch (error) {
      console.error("Image export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export chart as image",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const exportToCSV = () => {
    try {
      const delimiter = csvOptions.delimiter === "comma" ? "," : csvOptions.delimiter === "semicolon" ? ";" : "\t";
      
      const headers = [
        csvOptions.includeHeaders && "Exam Title",
        csvOptions.includeHeaders && "Score",
        csvOptions.includeHeaders && "Status",
        csvOptions.includeHeaders && "Date Completed",
        csvOptions.includeTimeTaken && "Time Taken",
        csvOptions.includeHeaders && "Language",
        csvOptions.includeMetadata && "Total Points",
        csvOptions.includeMetadata && "Attempt ID"
      ].filter(Boolean);

      const rows = attempts.map(attempt => [
        attempt.exam.title,
        `${attempt.score}%`,
        getStatusText(attempt),
        new Date(attempt.end_time).toLocaleDateString(),
        csvOptions.includeTimeTaken ? formatTimeTaken(attempt.start_time, attempt.end_time) : undefined,
        attempt.exam.language,
        csvOptions.includeMetadata ? attempt.total_points.toString() : undefined,
        csvOptions.includeMetadata ? attempt.id : undefined
      ].filter(Boolean)) as string[][];

      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(delimiter))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `exam-results-${new Date().toISOString().split('T')[0]}.csv`);

      toast({
        title: "Export Successful",
        description: "Results exported to CSV file",
      });
    } catch (error) {
      console.error("CSV export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export to CSV",
        variant: "destructive",
      });
    }
  };

  const exportToJSON = () => {
    try {
      const exportData = {
        metadata: jsonOptions.includeMetadata ? {
          exportDate: new Date().toISOString(),
          totalExams: totalAttempts,
          generatedBy: "DoStuff Exam Platform"
        } : null,
        summary: {
          totalAttempts,
          passedAttempts,
          distinctionAttempts,
          averageScore,
          passRate
        },
        results: attempts.map(attempt => ({
          examTitle: attempt.exam.title,
          score: attempt.score,
          status: getStatusText(attempt),
          dateCompleted: attempt.end_time,
          timeTaken: jsonOptions.includeMetadata ? formatTimeTaken(attempt.start_time, attempt.end_time) : undefined,
          language: attempt.exam.language,
          totalPoints: jsonOptions.includeMetadata ? attempt.total_points : undefined,
          attemptId: jsonOptions.includeMetadata ? attempt.id : undefined
        })),
        performanceTrend: jsonOptions.includePerformanceData ? performanceTrend : undefined,
        statistics: jsonOptions.includePerformanceData ? {
          averageScore,
          passRate,
          distinctionRate: totalAttempts > 0 ? (distinctionAttempts / totalAttempts) * 100 : 0
        } : undefined
      };

      const jsonContent = jsonOptions.prettyPrint 
        ? JSON.stringify(exportData, null, 2)
        : JSON.stringify(exportData);

      const blob = new Blob([jsonContent], { type: 'application/json' });
      saveAs(blob, `exam-results-${new Date().toISOString().split('T')[0]}.json`);

      toast({
        title: "Export Successful",
        description: "Results exported to JSON file",
      });
    } catch (error) {
      console.error("JSON export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export to JSON",
        variant: "destructive",
      });
    }
  };

  const formatOptions = [
    {
      id: 'pdf',
      name: 'PDF Document',
      description: 'Professional report with charts and statistics',
      icon: FileText,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      premium: false
    },
    {
      id: 'word',
      name: 'Word Document',
      description: 'Editable document for presentations',
      icon: FileType,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      premium: true
    },
    {
      id: 'excel',
      name: 'Excel Spreadsheet',
      description: 'Multiple sheets with detailed analysis',
      icon: FileSpreadsheet,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      premium: true
    },
    {
      id: 'image',
      name: 'Chart Image',
      description: 'High-quality performance chart',
      icon: FileImage,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      premium: false
    },
    {
      id: 'csv',
      name: 'CSV File',
      description: 'Data file with customizable options',
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      premium: false
    },
    {
      id: 'json',
      name: 'JSON Data',
      description: 'Structured data with metadata',
      icon: FileJson,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      premium: true
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Download className="w-6 h-6" />
            Premium Export Options
          </DialogTitle>
          <DialogDescription>
            Choose your preferred format and customize export settings
          </DialogDescription>
        </DialogHeader>

        {isExporting && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="font-medium text-blue-900">Exporting...</span>
            </div>
            <Progress value={exportProgress} className="w-full" />
            <p className="text-sm text-blue-700 mt-1">{exportProgress}% complete</p>
          </div>
        )}

        <Tabs defaultValue="formats" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="formats">Export Formats</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
          </TabsList>

          <TabsContent value="formats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formatOptions.map((format) => {
                const Icon = format.icon;
                return (
                  <div
                    key={format.id}
                    className="relative p-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all cursor-pointer group"
                    onClick={() => {
                      if (isExporting) return;
                      switch (format.id) {
                        case 'pdf': exportToPDF(); break;
                        case 'word': exportToWord(); break;
                        case 'excel': exportToExcel(); break;
                        case 'image': exportToImage(); break;
                        case 'csv': exportToCSV(); break;
                        case 'json': exportToJSON(); break;
                      }
                    }}
                  >
                    {format.premium && (
                      <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                        <Star className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                    
                    <div className="flex items-start gap-3">
                      <div className={`p-3 rounded-lg ${format.bgColor} group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-6 h-6 ${format.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{format.name}</h3>
                        <p className="text-sm text-gray-600">{format.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Button 
                            size="sm" 
                            disabled={isExporting}
                            className="text-xs px-3 py-1"
                          >
                            {isExporting ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <Download className="w-3 h-3 mr-1" />
                                Export
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CSV Options */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                  <h3 className="font-semibold">CSV Settings</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="csv-headers">Include Headers</Label>
                    <Checkbox 
                      id="csv-headers"
                      checked={csvOptions.includeHeaders}
                      onCheckedChange={(checked) => setCsvOptions(prev => ({ ...prev, includeHeaders: !!checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="csv-metadata">Include Metadata</Label>
                    <Checkbox 
                      id="csv-metadata"
                      checked={csvOptions.includeMetadata}
                      onCheckedChange={(checked) => setCsvOptions(prev => ({ ...prev, includeMetadata: !!checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="csv-time">Include Time Taken</Label>
                    <Checkbox 
                      id="csv-time"
                      checked={csvOptions.includeTimeTaken}
                      onCheckedChange={(checked) => setCsvOptions(prev => ({ ...prev, includeTimeTaken: !!checked }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Delimiter</Label>
                    <Select value={csvOptions.delimiter} onValueChange={(value) => setCsvOptions(prev => ({ ...prev, delimiter: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="comma">Comma (,)</SelectItem>
                        <SelectItem value="semicolon">Semicolon (;)</SelectItem>
                        <SelectItem value="tab">Tab</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* JSON Options */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <FileJson className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-semibold">JSON Settings</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="json-pretty">Pretty Print</Label>
                    <Switch 
                      id="json-pretty"
                      checked={jsonOptions.prettyPrint}
                      onCheckedChange={(checked) => setJsonOptions(prev => ({ ...prev, prettyPrint: !!checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="json-metadata">Include Metadata</Label>
                    <Checkbox 
                      id="json-metadata"
                      checked={jsonOptions.includeMetadata}
                      onCheckedChange={(checked) => setJsonOptions(prev => ({ ...prev, includeMetadata: !!checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="json-performance">Include Performance Data</Label>
                    <Checkbox 
                      id="json-performance"
                      checked={jsonOptions.includePerformanceData}
                      onCheckedChange={(checked) => setJsonOptions(prev => ({ ...prev, includePerformanceData: !!checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="json-chart">Include Chart Data</Label>
                    <Checkbox 
                      id="json-chart"
                      checked={jsonOptions.includeChartData}
                      onCheckedChange={(checked) => setJsonOptions(prev => ({ ...prev, includeChartData: !!checked }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                onClick={exportToCSV}
                disabled={isExporting}
                className="flex-1"
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button 
                onClick={exportToJSON}
                disabled={isExporting}
                className="flex-1"
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;