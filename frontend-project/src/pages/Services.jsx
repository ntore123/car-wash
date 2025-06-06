import { useState, useEffect } from 'react';
import { serviceAPI, carAPI, packageAPI } from '../services/api';
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

function Services() {
  const [services, setServices] = useState([]);
  const [cars, setCars] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });

  const { register: registerAdd, handleSubmit: handleSubmitAdd, formState: { errors: errorsAdd }, reset: resetAdd } = useForm();
  const { register: registerEdit, handleSubmit: handleSubmitEdit, formState: { errors: errorsEdit }, reset: resetEdit, setValue } = useForm();

  // Fetch all services
  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await serviceAPI.getAllServices();
      if (response.data.success) {
        setServices(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch cars and packages for dropdowns
  const fetchDropdownData = async () => {
    try {
      const [carsResponse, packagesResponse] = await Promise.all([
        carAPI.getAllCars(),
        packageAPI.getAllPackages()
      ]);

      if (carsResponse.data.success) {
        setCars(carsResponse.data.data);
      }

      if (packagesResponse.data.success) {
        // Ensure PackagePrice is always a number
        const packagesWithNumericPrices = packagesResponse.data.data.map(pkg => ({
          ...pkg,
          PackagePrice: pkg.PackagePrice ? parseFloat(pkg.PackagePrice) : 0
        }));
        setPackages(packagesWithNumericPrices);
      }
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
      setError('Failed to load form data. Please try again.');
    }
  };

  // Initial data load
  useEffect(() => {
    fetchServices();
    fetchDropdownData();
  }, []);

  // Filter services by date range
  const handleDateFilter = async () => {
    if (!dateFilter.startDate || !dateFilter.endDate) {
      setError('Please select both start and end dates');
      return;
    }

    try {
      setLoading(true);
      const response = await serviceAPI.getServicesByDateRange(
        dateFilter.startDate,
        dateFilter.endDate
      );

      if (response.data.success) {
        setServices(response.data.data);
      }
    } catch (err) {
      console.error('Error filtering services:', err);
      setError('Failed to filter services. Please try again.');
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
    fetchServices();
  };

  // Add a new service
  const onAddService = async (data) => {
    try {
      setLoading(true);
      const response = await serviceAPI.createService({
        serviceDate: data.serviceDate,
        plateNumber: data.plateNumber,
        packageNumber: data.packageNumber
        // RecordNumber will be auto-generated by backend using UUID
      });

      if (response.data.success) {
        setSuccessMessage('Service added successfully');
        fetchServices();
        setIsAddModalOpen(false);
        resetAdd();
      }
    } catch (err) {
      console.error('Error adding service:', err);
      setError(err.response?.data?.message || 'Failed to add service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Edit a service
  const onEditService = async (data) => {
    try {
      setLoading(true);
      const response = await serviceAPI.updateService(currentService.RecordNumber, data);

      if (response.data.success) {
        setSuccessMessage('Service updated successfully');
        fetchServices();
        setIsEditModalOpen(false);
      }
    } catch (err) {
      console.error('Error updating service:', err);
      setError(err.response?.data?.message || 'Failed to update service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete a service
  const onDeleteService = async () => {
    try {
      setLoading(true);
      const response = await serviceAPI.deleteService(currentService.RecordNumber);

      if (response.data.success) {
        setSuccessMessage('Service deleted successfully');
        fetchServices();
        setIsDeleteModalOpen(false);
      }
    } catch (err) {
      console.error('Error deleting service:', err);
      setError(err.response?.data?.message || 'Failed to delete service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal and populate form
  const handleEditClick = (service) => {
    setCurrentService(service);
    // RecordNumber is not editable, so we don't set it in the form
    setValue('serviceDate', service.ServiceDate.split('T')[0]); // Format date for input
    setValue('plateNumber', service.PlateNumber);
    setValue('packageNumber', service.PackageNumber);
    setIsEditModalOpen(true);
  };

  // Open delete modal
  const handleDeleteClick = (service) => {
    setCurrentService(service);
    setIsDeleteModalOpen(true);
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
    { key: 'RecordNumber', header: 'Record ID', render: (row) => (
      <span className="text-xs font-mono text-gray-600" title={row.RecordNumber}>
        {row.RecordNumber}
      </span>
    )},
    { key: 'ServiceDate', header: 'Date', render: (row) => formatDate(row.ServiceDate) },
    { key: 'PlateNumber', header: 'Plate Number' },
    { key: 'DriverName', header: 'Driver' },
    { key: 'PackageName', header: 'Package' },
    { key: 'PackagePrice', header: 'Price', render: (row) => `${(row.PackagePrice ? parseFloat(row.PackagePrice) : 0).toFixed(0)} RWF` },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditClick(row)}
            className="text-primary-600 hover:text-primary-800 px-2 py-1 text-sm"
            aria-label="Edit service"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            className="text-red-600 hover:text-red-800 px-2 py-1 text-sm"
            aria-label="Delete service"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Service Records"
        description="Smart Pack - Rubavu | Manage all car service records (Full CRUD operations available)"
        actions={
          <Button onClick={() => setIsAddModalOpen(true)}>
            Add Service Record
          </Button>
        }
      />

      {/* Success message */}
      {successMessage && <Alert type="success" message={successMessage} />}

      {/* Error message */}
      {error && <Alert type="error" message={error} />}

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

      {/* Services table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <Table
          columns={columns}
          data={services}
          emptyMessage="No services found. Add a new service to get started."
        />
      )}

      {/* Add Service Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Service Record"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="addServiceForm">
              Add Service Record
            </Button>
          </>
        }
      >
        <form id="addServiceForm" onSubmit={handleSubmitAdd(onAddService)}>

          <FormInput
            label="Service Date"
            type="date"
            {...registerAdd('serviceDate', { required: 'Service date is required' })}
            error={errorsAdd.serviceDate?.message}
            required
          />
          <FormSelect
            label="Car"
            {...registerAdd('plateNumber', { required: 'Car is required' })}
            options={cars.map(car => ({
              value: car.PlateNumber,
              label: `${car.PlateNumber} - ${car.DriverName} (${car.CarType})`
            }))}
            error={errorsAdd.plateNumber?.message}
            required
          />
          <FormSelect
            label="Package"
            {...registerAdd('packageNumber', { required: 'Package is required' })}
            options={packages.map(pkg => ({
              value: pkg.PackageNumber,
              label: `${pkg.PackageName} - ${(pkg.PackagePrice ? parseFloat(pkg.PackagePrice) : 0).toFixed(0)} RWF`
            }))}
            error={errorsAdd.packageNumber?.message}
            required
          />
        </form>
      </Modal>

      {/* Edit Service Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Service Record"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="editServiceForm">
              Save Changes
            </Button>
          </>
        }
      >
        <form id="editServiceForm" onSubmit={handleSubmitEdit(onEditService)}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Record Number
            </label>
            <div className="p-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">
              {currentService?.RecordNumber || 'Auto-generated ID'}
            </div>
            <p className="text-xs text-gray-500 mt-1">This field cannot be modified</p>
          </div>
          <FormInput
            label="Service Date"
            type="date"
            {...registerEdit('serviceDate', { required: 'Service date is required' })}
            error={errorsEdit.serviceDate?.message}
            required
          />
          <FormSelect
            label="Car"
            {...registerEdit('plateNumber', { required: 'Car is required' })}
            options={cars.map(car => ({
              value: car.PlateNumber,
              label: `${car.PlateNumber} - ${car.DriverName} (${car.CarType})`
            }))}
            error={errorsEdit.plateNumber?.message}
            required
          />
          <FormSelect
            label="Package"
            {...registerEdit('packageNumber', { required: 'Package is required' })}
            options={packages.map(pkg => ({
              value: pkg.PackageNumber,
              label: `${pkg.PackageName} - ${(pkg.PackagePrice ? parseFloat(pkg.PackagePrice) : 0).toFixed(0)} RWF`
            }))}
            error={errorsEdit.packageNumber?.message}
            required
          />
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Service Record"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onDeleteService}>
              Delete
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to delete the service record #{' '}
          <span className="font-semibold">{currentService?.RecordNumber}</span>?
        </p>
        <p className="mt-2 text-red-600">This action cannot be undone.</p>
      </Modal>
    </div>
  );
}

export default Services;
