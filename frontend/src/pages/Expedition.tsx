import { useEffect, useState } from 'react';
import { useExpeditionStore } from '@/stores/expeditionStore';
import { expeditionService } from '@/services/expeditionService';
import { Checkpoint, MountainId } from '@/types';
import Card from '@/components/shared/Card';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ExpeditionMap from '@/components/expedition/ExpeditionMap';
import MountainCard from '@/components/expedition/MountainCard';
import CheckpointModal from '@/components/expedition/CheckpointModal';
import { Mountain } from 'lucide-react';

const Expedition = () => {
  const { mountains, setMountains, setProgress, isLoading, setLoading } = useExpeditionStore();
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<Checkpoint | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [mountainsData, progressData] = await Promise.all([
          expeditionService.getAllMountains(),
          expeditionService.getMountainProgress(),
        ]);
        setMountains(mountainsData);
        setProgress(progressData);
      } catch (error) {
        console.error('Failed to fetch expedition data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMountainClick = (mountainId: MountainId) => {
    const mountain = mountains.find((m) => m.id === mountainId);
    if (mountain && mountain.isUnlocked) {
      // Show mountain details or first incomplete checkpoint
      const firstIncomplete = mountain.checkpoints.find((c) => !c.isCompleted);
      if (firstIncomplete) {
        setSelectedCheckpoint(firstIncomplete);
        setIsModalOpen(true);
      }
    }
  };

  const handleCheckpointComplete = async () => {
    if (!selectedCheckpoint) return;

    try {
      await expeditionService.completeCheckpoint(
        selectedCheckpoint.mountainId,
        selectedCheckpoint.id
      );
      // Refresh data
      const mountainsData = await expeditionService.getAllMountains();
      setMountains(mountainsData);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to complete checkpoint:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-shadow-lg flex items-center">
          <Mountain className="w-10 h-10 mr-3 text-accent-gold" />
          Expedition Map
        </h1>
        <p className="text-white/70 mt-1">
          Conquer 5 mountains to master the A.R.I.S.E. values
        </p>
      </div>

      {/* Interactive Map */}
      <ExpeditionMap mountains={mountains} onMountainClick={handleMountainClick} />

      {/* Mountains List */}
      <div>
        <h2 className="font-display font-bold text-2xl mb-4">Your Mountains</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mountains.map((mountain, index) => (
            <MountainCard
              key={mountain.id}
              mountain={mountain}
              onClick={() => handleMountainClick(mountain.id)}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Progress Summary */}
      <Card>
        <h3 className="font-display font-bold text-xl mb-4">Overall Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-accent-gold">
              {mountains.filter((m) => m.isCompleted).length}
            </p>
            <p className="text-sm text-white/70 mt-1">Mountains Completed</p>
          </div>
          <div className="glass rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-accent-gold">
              {mountains.reduce((sum, m) => sum + m.checkpoints.filter((c) => c.isCompleted).length, 0)}
            </p>
            <p className="text-sm text-white/70 mt-1">Checkpoints Reached</p>
          </div>
          <div className="glass rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-accent-gold">
              {Math.round(
                mountains.reduce((sum, m) => sum + m.progress, 0) / mountains.length
              )}%
            </p>
            <p className="text-sm text-white/70 mt-1">Average Progress</p>
          </div>
        </div>
      </Card>

      {/* Checkpoint Modal */}
      <CheckpointModal
        isOpen={isModalOpen}
        checkpoint={selectedCheckpoint}
        onClose={() => setIsModalOpen(false)}
        onComplete={handleCheckpointComplete}
        canComplete={true} // TODO: Check if requirements are met
      />
    </div>
  );
};

export default Expedition;
