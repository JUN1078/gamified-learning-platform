import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Award, TrendingUp } from 'lucide-react';
import { usePeerReviewStore } from '@/stores/peerReviewStore';
import { peerReviewService } from '@/services/peerReviewService';
import { useUIStore } from '@/stores/uiStore';
import Card from '@/components/shared/Card';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmployeeCard from '@/components/peerReview/EmployeeCard';

const PeerReview = () => {
  const navigate = useNavigate();
  const { addToast } = useUIStore();
  const {
    employees,
    isLoadingEmployees,
    setEmployees,
    setLoadingEmployees,
    selectEmployee,
  } = usePeerReviewStore();

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const data = await peerReviewService.getEmployees();
      setEmployees(data);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.error || 'Failed to load employees',
      });
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleStartReview = (employee: typeof employees[0]) => {
    selectEmployee(employee);
    navigate('/peer-review/form');
  };

  const handleViewResults = () => {
    navigate('/peer-review/results');
  };

  const handleViewJourney = () => {
    navigate('/peer-review/journey');
  };

  const reviewedCount = employees.filter((e) => e.hasReviewed).length;
  const totalCount = employees.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-shadow-lg">
            ARISE Peer Review
          </h1>
          <p className="text-white/70 mt-1">Review your peers and help them grow</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleViewResults} className="btn-secondary">
            <Award className="w-5 h-5 mr-2" />
            My Results
          </button>
          <button onClick={handleViewJourney} className="btn-secondary">
            <TrendingUp className="w-5 h-5 mr-2" />
            My Journey
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-display font-bold mb-2">Review Progress</h3>
            <p className="text-white/70">
              You've reviewed <span className="text-accent-gold font-bold">{reviewedCount}</span> out of{' '}
              <span className="text-accent-gold font-bold">{totalCount}</span> employees
            </p>
          </div>
          <div className="relative w-24 h-24">
            <svg className="transform -rotate-90 w-24 h-24">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-white/10"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - reviewedCount / totalCount)}`}
                className="text-accent-gold transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">
                {totalCount > 0 ? Math.round((reviewedCount / totalCount) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Employee Grid */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-6 h-6 text-accent-gold" />
          <h2 className="text-2xl font-display font-bold">Select Employee to Review</h2>
        </div>

        {isLoadingEmployees ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : employees.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-white/70">No employees available to review</p>
            </div>
          </Card>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, staggerChildren: 0.05 }}
          >
            {employees.map((employee, index) => (
              <motion.div
                key={employee.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <EmployeeCard employee={employee} onStartReview={handleStartReview} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PeerReview;
