import { useState, useEffect } from 'react';
import { carAPI } from '../services/api';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import FormInput from '../components/ui/FormInput';
import FormSelect from '../components/ui/FormSelect';
import Alert from '../components/ui/Alert';
// Icons removed as per user request
import { useForm } from 'react-hook-form';

function Cars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [currentCar, setCurrentCar] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const { register: registerAdd, handleSubmit: handleSubmitAdd, formState: { errors: errorsAdd }, reset: resetAdd } = useForm();

  // Fetch all cars
  const fetchCars = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await carAPI.getAllCars();
      if (response.data.success) {
        setCars(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching cars:', err);
      setError('Failed to load cars. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchCars();
  }, []);



  // Add a new car
  const onAddCar = async (data) => {
    try {
      setLoading(true);
      const response = await carAPI.createCar(data);
      if (response.data.success) {
        setSuccessMessage('Car added successfully');
        fetchCars();
        setIsAddModalOpen(false);
        resetAdd();
      }
    } catch (err) {
      console.error('Error adding car:', err);
      setError(err.response?.data?.message || 'Failed to add car. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // View car details
  const handleViewClick = (car) => {
    setCurrentCar(car);
    setIsEditModalOpen(true);
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

  // Table columns configuration
  const columns = [
    { key: 'PlateNumber', header: 'Plate Number' },
    { key: 'CarType', header: 'Car Type' },
    { key: 'CarSize', header: 'Car Size' },
    { key: 'DriverName', header: 'Driver Name' },
    { key: 'PhoneNumber', header: 'Phone Number' },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewClick(row)}
            className="text-primary-600 hover:text-primary-800 px-2 py-1 text-sm"
            aria-label="View car details"
          >
            View
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Cars Registry"
        description="Smart Pack - Rubavu | Register and view customer cars"
        actions={
          <Button onClick={() => setIsAddModalOpen(true)}>
            Add Car
          </Button>
        }
      />

      {/* Success message */}
      {successMessage && <Alert type="success" message={successMessage} />}

      {/* Error message */}
      {error && <Alert type="error" message={error} />}



      {/* Cars table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <Table
          columns={columns}
          data={cars}
          emptyMessage="No cars found. Add a new car to get started."
        />
      )}

      {/* Add Car Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Car"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="addCarForm">
              Add Car
            </Button>
          </>
        }
      >
        <form id="addCarForm" onSubmit={handleSubmitAdd(onAddCar)}>
          <FormInput
            label="Plate Number"
            {...registerAdd('plateNumber', { required: 'Plate number is required' })}
            error={errorsAdd.plateNumber?.message}
            required
          />
          <FormSelect
            label="Car Type"
            {...registerAdd('carType', { required: 'Car type is required' })}
            options={[
              { value: 'Sedan', label: 'Sedan' },
              { value: 'SUV', label: 'SUV' },
              { value: 'Hatchback', label: 'Hatchback' },
              { value: 'Truck', label: 'Truck' },
              { value: 'Van', label: 'Van' },
              { value: 'Motorcycle', label: 'Motorcycle' },
              { value: 'Other', label: 'Other' }
            ]}
            error={errorsAdd.carType?.message}
            required
          />
          <FormSelect
            label="Car Size"
            {...registerAdd('carSize', { required: 'Car size is required' })}
            options={[
              { value: 'Small', label: 'Small' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Large', label: 'Large' },
              { value: 'Extra Large', label: 'Extra Large' }
            ]}
            error={errorsAdd.carSize?.message}
            required
          />
          <FormInput
            label="Driver Name"
            {...registerAdd('driverName', { required: 'Driver name is required' })}
            error={errorsAdd.driverName?.message}
            required
          />
          <FormInput
            label="Phone Number"
            {...registerAdd('phoneNumber', { required: 'Phone number is required' })}
            error={errorsAdd.phoneNumber?.message}
            required
          />
        </form>
      </Modal>

      {/* View Car Details Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Car Details"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Close
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Plate Number</label>
            <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md">
              {currentCar?.PlateNumber}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Car Type</label>
            <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md">
              {currentCar?.CarType}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Car Size</label>
            <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md">
              {currentCar?.CarSize}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Driver Name</label>
            <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md">
              {currentCar?.DriverName}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md">
              {currentCar?.PhoneNumber}
            </div>
          </div>
        </div>
      </Modal>


    </div>
  );
}

export default Cars;
