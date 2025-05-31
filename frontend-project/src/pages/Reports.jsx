import { useState, useEffect } from 'react';
import { paymentAPI, packageAPI } from '../services/api';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Alert from '../components/ui/Alert';
// Icons removed as per user request

function Reports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of current month
    endDate: new Date().toISOString().split('T')[0] // Today
  });
  const [reportData, setReportData] = useState({
    dailyReport: [],
    summary: {
      totalRevenue: 0,
      totalPayments: 0,
      averageRevenue: 0
    }
  });



  // Function to fetch package details by package number
  const fetchPackageDetails = async (packageNumber) => {
    try {
      const response = await packageAPI.getPackageByNumber(packageNumber);
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching package details:', error);
      return null;
    }
  };

  // Fetch daily report data with specific fields
  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch payments with joined service and package data
      const paymentsResponse = await paymentAPI.getPaymentsByDateRange(dateRange.startDate, dateRange.endDate);

      if (paymentsResponse.data.success) {
        // Log the response data to check if PackageDescription is present
        console.log('Payment response data:', paymentsResponse.data.data);

        // Process the data and fetch missing package descriptions
        const dailyReportData = [];

        for (const payment of paymentsResponse.data.data) {
          // Log each payment to check for PackageDescription
          console.log('Payment item:', payment);

          // Try to get package description from different possible fields
          let packageDescription =
            payment.PackageDescription ||
            payment.Package?.PackageDescription ||
            payment.package?.PackageDescription ||
            payment.packageDescription ||
            payment.package_description;

          // If package description is still missing, try to fetch it
          if (!packageDescription && payment.PackageNumber) {
            console.log('Fetching package details for:', payment.PackageNumber);
            const packageDetails = await fetchPackageDetails(payment.PackageNumber);
            if (packageDetails) {
              packageDescription = packageDetails.PackageDescription;
              console.log('Fetched package description:', packageDescription);
            }
          }

          // If still no description, use default
          if (!packageDescription) {
            packageDescription = 'No description available';
          }

          console.log('Final package description:', packageDescription);

          dailyReportData.push({
            PlateNumber: payment.PlateNumber || '',
            PackageName: payment.PackageName || '',
            PackageDescription: packageDescription,
            AmountPaid: payment.AmountPaid ? parseFloat(payment.AmountPaid) : 0,
            PaymentDate: payment.PaymentDate || ''
          });
        }

        // Calculate total revenue
        const totalRevenue = dailyReportData.reduce((sum, item) => sum + item.AmountPaid, 0);

        // Update state with the report data
        setReportData({
          dailyReport: dailyReportData,
          summary: {
            totalRevenue,
            totalPayments: dailyReportData.length,
            averageRevenue: dailyReportData.length > 0 ? totalRevenue / dailyReportData.length : 0
          }
        });
      } else {
        setError('Failed to load report data. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Failed to load report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle date range change and refresh data
  const handleDateRangeChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  const handleGenerateReport = () => {
    fetchReportData();
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };




  // Print report
  const handlePrintReport = () => {
    if (reportData.dailyReport.length === 0) {
      setError('No data available to print. Please generate a report first.');
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');

    // Generate table rows from report data
    const tableRows = reportData.dailyReport.map(row => `
      <tr>
        <td>${row.PlateNumber}</td>
        <td>${row.PackageName}</td>
        <td style="background-color: #f0fdf4;">${row.PackageDescription || 'N/A'}</td>
        <td>${(row.AmountPaid ? parseFloat(row.AmountPaid) : 0).toFixed(0)} RWF</td>
        <td>${formatDate(row.PaymentDate)}</td>
      </tr>
    `).join('');

    // Add necessary styles
    printWindow.document.write(`
      <html>
        <head>
          <title>Smart Pack - Payment Records Report (${dateRange.startDate} to ${dateRange.endDate})</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #166534; text-align: center; }
            h2 { color: #166534; margin-top: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background-color: #f3f4f6; text-align: left; padding: 10px; border: 1px solid #e5e7eb; }
            td { padding: 10px; border: 1px solid #e5e7eb; }

            /* Signature styles */
            .signature-section { margin-top: 60px; margin-bottom: 40px; page-break-inside: avoid; }
            .signature-row { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .signature-box { width: 45%; }
            .signature-line { border-bottom: 1px solid #000; height: 40px; margin: 5px 0; }
            .signature-name, .signature-title { margin: 5px 0; font-size: 14px; }
            .signature-date { margin-top: 20px; font-size: 14px; }

            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Smart Pack - Payment Records Report</h1>
            <h3 style="color: #166534; text-align: center; margin-top: 5px;">Including Package Description</h3>
            <p style="font-size: 16px; margin-bottom: 20px;">
              <strong>Period:</strong> ${new Date(dateRange.startDate).toLocaleDateString()} to ${new Date(dateRange.endDate).toLocaleDateString()}
            </p>
            <hr style="margin: 20px 0; border: 1px solid #e5e7eb;" />
          </div>

          <table>
            <thead>
              <tr>
                <th>Plate Number</th>
                <th>Package Name</th>
                <th style="background-color: #dcfce7;">Package Description</th>
                <th>Amount Paid</th>
                <th>Payment Date</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div class="signature-section">
            <div class="signature-row">
              <div class="signature-box">
                <p>Prepared by:</p>
                <div class="signature-line"></div>
                <p class="signature-name">Name: ____________________</p>
                <p class="signature-title">Title: ____________________</p>
              </div>
              <div class="signature-box">
                <p>Approved by:</p>
                <div class="signature-line"></div>
                <p class="signature-name">Name: ____________________</p>
                <p class="signature-title">Title: ____________________</p>
              </div>
            </div>
            <p class="signature-date">Date: ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString()} by Smart Pack Car Services Management System</p>
            <p>Smart Pack - Rubavu</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Print after content is loaded
    printWindow.onload = function () {
      printWindow.print();
      // printWindow.close(); // Uncomment to auto-close after print dialog
    };
  };

  // Daily report table columns
  const dailyReportColumns = [
    { key: 'PlateNumber', header: 'Plate Number' },
    { key: 'PackageName', header: 'Package Name' },
    { key: 'PackageDescription', header: 'Package Description' },
    { key: 'AmountPaid', header: 'Amount Paid', render: (row) => `${(row.AmountPaid ? parseFloat(row.AmountPaid) : 0).toFixed(0)} RWF` },
    { key: 'PaymentDate', header: 'Payment Date', render: (row) => formatDate(row.PaymentDate) }
  ];

  return (
    <div>
      <PageHeader
        title="Payment Records Report"
        description="Smart Pack - Rubavu | Generate reports with PlateNumber, PackageName, PackageDescription, AmountPaid, PaymentDate"
        actions={
          <Button onClick={handlePrintReport} variant="primary">
            Print Report
          </Button>
        }
      />

      {/* Error message */}
      {error && <Alert type="error" message={error} />}

      {/* Date range selector */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateRangeChange}
              className="form-input"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateRangeChange}
              className="form-input"
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleGenerateReport}>
              Generate Report
            </Button>
          </div>
        </div>
      </Card>



      {/* Daily Report */}
      <Card
        title="Payment Records Report (Including Package Description)"
        className="mb-6"

      >
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <Table
            columns={dailyReportColumns}
            data={reportData.dailyReport}
            emptyMessage="No data available for the selected date range."
          />
        )}
      </Card>


    </div>
  );
}

export default Reports;
