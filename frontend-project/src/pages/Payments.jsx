import { useState, useEffect } from 'react';
import { paymentAPI, serviceAPI } from '../services/api';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import FormInput from '../components/ui/FormInput';
import FormSelect from '../components/ui/FormSelect';
import Alert from '../components/ui/Alert';
import Card from '../components/ui/Card';
// Icons removed as per user request
import { useForm } from 'react-hook-form';

function Payments() {
  const [payments, setPayments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [currentPayment, setCurrentPayment] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [totalRevenue, setTotalRevenue] = useState(0);

  const { register: registerAdd, handleSubmit: handleSubmitAdd, formState: { errors: errorsAdd }, reset: resetAdd } = useForm();

  // Fetch all payments
  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentAPI.getAllPayments();
      if (response.data.success) {
        // Ensure AmountPaid is always a number
        const paymentsWithNumericAmounts = response.data.data.map(payment => ({
          ...payment,
          AmountPaid: payment.AmountPaid ? parseFloat(payment.AmountPaid) : 0,
          PackagePrice: payment.PackagePrice ? parseFloat(payment.PackagePrice) : 0
        }));
        setPayments(paymentsWithNumericAmounts);
        calculateTotalRevenue(paymentsWithNumericAmounts);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to load payments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total revenue
  const calculateTotalRevenue = (paymentsData) => {
    const total = paymentsData.reduce((sum, payment) => sum + payment.AmountPaid, 0);
    setTotalRevenue(total);
  };

  // Fetch services for dropdown
  const fetchServices = async () => {
    try {
      const response = await serviceAPI.getAllServices();
      if (response.data.success) {
        // Ensure PackagePrice is always a number
        const servicesWithNumericPrices = response.data.data.map(service => ({
          ...service,
          PackagePrice: service.PackagePrice ? parseFloat(service.PackagePrice) : 0,
          AmountPaid: service.AmountPaid ? parseFloat(service.AmountPaid) : 0
        }));
        setServices(servicesWithNumericPrices);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services data. Please try again.');
    }
  };

  // Initial data load
  useEffect(() => {
    fetchPayments();
    fetchServices();
  }, []);

  // Filter payments by date range
  const handleDateFilter = async () => {
    if (!dateFilter.startDate || !dateFilter.endDate) {
      setError('Please select both start and end dates');
      return;
    }

    try {
      setLoading(true);
      const response = await paymentAPI.getPaymentsByDateRange(
        dateFilter.startDate,
        dateFilter.endDate
      );

      if (response.data.success) {
        // Ensure AmountPaid is always a number
        const paymentsWithNumericAmounts = response.data.data.map(payment => ({
          ...payment,
          AmountPaid: payment.AmountPaid ? parseFloat(payment.AmountPaid) : 0,
          PackagePrice: payment.PackagePrice ? parseFloat(payment.PackagePrice) : 0
        }));
        setPayments(paymentsWithNumericAmounts);
        calculateTotalRevenue(paymentsWithNumericAmounts);
      }
    } catch (err) {
      console.error('Error filtering payments:', err);
      setError('Failed to filter payments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset date filter
  const resetDateFilter = () => {
    setDateFilter({
      startDate: '',
      endDate: ''
    });
    fetchPayments();
  };

  // Add a new payment
  const onAddPayment = async (data) => {
    try {
      setLoading(true);
      const response = await paymentAPI.createPayment({
        amountPaid: parseFloat(data.amountPaid),
        paymentDate: data.paymentDate,
        recordNumber: data.recordNumber
      });

      if (response.data.success) {
        setSuccessMessage('Payment added successfully');
        fetchPayments();
        setIsAddModalOpen(false);
        resetAdd();
      }
    } catch (err) {
      console.error('Error adding payment:', err);
      setError(err.response?.data?.message || 'Failed to add payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  // View payment details
  const handleViewClick = (payment) => {
    setCurrentPayment(payment);
    setIsEditModalOpen(true);
  };

  // Print receipt
  const handlePrintClick = (payment) => {
    if (!payment) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');

    // Add necessary styles and content
    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt #${payment.PaymentNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .receipt { border: 1px solid #ccc; padding: 20px; max-width: 500px; margin: 0 auto; }
            .receipt-title { text-align: center; font-size: 24px; margin-bottom: 20px; }
            .receipt-item { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .receipt-total { font-weight: bold; border-top: 1px solid #ccc; padding-top: 10px; margin-top: 10px; }
            .footer { text-align: center; margin-top: 50px; font-size: 12px; }
            .signature-section { margin-top: 60px; }
            .signature-line { border-bottom: 1px solid #000; height: 40px; margin: 5px 0; }
            .signature-name { margin: 5px 0; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Smart Pack - Car Services</h1>
            <p>Rubavu, Rwanda</p>
          </div>

          <div class="receipt">
            <div class="receipt-title">Payment Receipt</div>

            <div class="receipt-item">
              <span>Receipt Number:</span>
              <span>#${payment.PaymentNumber}</span>
            </div>

            <div class="receipt-item">
              <span>Date:</span>
              <span>${new Date(payment.PaymentDate).toLocaleDateString()}</span>
            </div>

            <div class="receipt-item">
              <span>Customer:</span>
              <span>${payment.DriverName}</span>
            </div>

            <div class="receipt-item">
              <span>Vehicle:</span>
              <span>${payment.PlateNumber}</span>
            </div>

            <div class="receipt-item">
              <span>Service:</span>
              <span>${payment.PackageName}</span>
            </div>

            <div class="receipt-total">
              <span>Total Amount:</span>
              <span>${(payment.AmountPaid ? parseFloat(payment.AmountPaid) : 0).toFixed(0)} RWF</span>
            </div>

            <div class="signature-section">
              <p>Customer Signature:</p>
              <div class="signature-line"></div>
              <p class="signature-name">Name: ____________________</p>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for choosing Smart Pack Car Services!</p>
            <p>For inquiries, please contact us at: info@smartpack.rw</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Print after content is loaded
    printWindow.onload = function() {
      printWindow.print();
    };
  };

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Table columns configuration
  const columns = [
    { key: 'PaymentNumber', header: 'Payment #' },
    { key: 'PaymentDate', header: 'Date', render: (row) => formatDate(row.PaymentDate) },
    { key: 'PlateNumber', header: 'Plate Number' },
    { key: 'DriverName', header: 'Driver' },
    { key: 'PackageName', header: 'Package' },
    { key: 'AmountPaid', header: 'Amount', render: (row) => `${(row.AmountPaid ? parseFloat(row.AmountPaid) : 0).toFixed(0)} RWF` },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewClick(row)}
            className="text-primary-600 hover:text-primary-800 px-2 py-1 text-sm"
            aria-label="View payment details"
          >
            View
          </button>
          <button
            onClick={() => handlePrintClick(row)}
            className="text-primary-600 hover:text-primary-800 px-2 py-1 text-sm"
            aria-label="Print receipt"
          >
            Print
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Payment Records"
        description="Smart Pack - Rubavu | Track payments for car services"
        actions={
          <Button onClick={() => setIsAddModalOpen(true)}>
            Add Payment
          </Button>
        }
      />

      {/* Success message */}
      {successMessage && <Alert type="success" message={successMessage} />}

      {/* Error message */}
      {error && <Alert type="error" message={error} />}

      {/* Revenue summary */}
      <Card className="mb-6 bg-primary-50 border border-primary-200">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-primary-100 text-primary-600 mr-4 text-xl font-bold">
            RWF
          </div>
          <div>
            <h3 className="text-lg font-semibold text-primary-800">Total Revenue</h3>
            <p className="text-2xl font-bold text-primary-700">{(totalRevenue || 0).toFixed(0)} RWF</p>
          </div>
        </div>
      </Card>

      {/* Date filter */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
              className="form-input"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
              className="form-input"
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleDateFilter}>
              Filter
            </Button>
            <Button variant="secondary" onClick={resetDateFilter}>
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Payments table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <Table
          columns={columns}
          data={payments}
          emptyMessage="No payments found. Add a new payment to get started."
        />
      )}

      {/* Add Payment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Payment"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="addPaymentForm">
              Add Payment
            </Button>
          </>
        }
      >
        <form id="addPaymentForm" onSubmit={handleSubmitAdd(onAddPayment)}>
          <FormInput
            label="Amount Paid"
            type="number"
            step="0.01"
            {...registerAdd('amountPaid', {
              required: 'Amount is required',
              valueAsNumber: true,
              min: { value: 0, message: 'Amount must be positive' }
            })}
            error={errorsAdd.amountPaid?.message}
            required
          />
          <FormInput
            label="Payment Date"
            type="date"
            {...registerAdd('paymentDate', { required: 'Payment date is required' })}
            error={errorsAdd.paymentDate?.message}
            required
          />
          <FormSelect
            label="Service Record"
            {...registerAdd('recordNumber', { required: 'Service record is required' })}
            options={services.map(service => ({
              value: service.RecordNumber,
              label: `${service.RecordNumber} - ${service.PlateNumber} - ${service.PackageName} (${(service.PackagePrice ? parseFloat(service.PackagePrice) : 0).toFixed(0)} RWF)`
            }))}
            error={errorsAdd.recordNumber?.message}
            required
          />
        </form>
      </Modal>

      {/* View Payment Details Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Payment Details"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={() => handlePrintClick(currentPayment)}>
              Print Receipt
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Number</label>
            <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md">
              {currentPayment?.PaymentNumber}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount Paid</label>
            <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md">
              {(currentPayment?.AmountPaid ? parseFloat(currentPayment.AmountPaid) : 0).toFixed(0)} RWF
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Date</label>
            <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md">
              {currentPayment?.PaymentDate ? formatDate(currentPayment.PaymentDate) : ''}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Service Record</label>
            <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md">
              {currentPayment?.RecordNumber} - {currentPayment?.PlateNumber} - {currentPayment?.PackageName}
            </div>
          </div>
        </div>
      </Modal>


    </div>
  );
}

export default Payments;
