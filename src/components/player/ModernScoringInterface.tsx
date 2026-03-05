import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../shared/ToastContainer';
import { useRetryMutation } from '../../hooks/useRetryMutation';
import type { Id } from '../../../convex/_generated/dataModel';
import { 
  ArrowLeft,
  Check,
  Minus,
  Plus,
  Flag,
  TrendingDown,
  TrendingUp
} from 'lucide-react';

export default function ModernScoringInterface() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  // Get hole parameter from URL
  const searchParams = new URLSearchParams(window.location.search);
  const holeParam = searchParams.get('hole');
  
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const [strokes, setStrokes] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tournamentDetails = useQuery(
    api.tournaments.getTournamentDetails,
    id && user ? { 
      tournamentId: id as Id<'tournaments'>,
      userId: user._id 
    } : 'skip'
  );

  const playerScores = useQuery(
    api.scores.getPlayerScores,
    id && user ? {
      tournamentId: id as Id<'tournaments'>,
      playerId: user._id as Id<'users'>,
    } : 'skip'
  );

  const { mutate: submitScoreMutation } = useRetryMutation(
    api.scores.submitScore,
    {
      maxRetries: 3,
      onSuccess: () => {
        showSuccess('Score submitted! 🎉', 1000);
        setStrokes(0);
      },
      onError: (error) => {
        showError(error.message || 'Failed to submit score');
      },
    }
  );

  const { mutate: updateScoreMutation } = useRetryMutation(
    api.scores.updateScore,
    {
      maxRetries: 3,
      onSuccess: () => {
        showSuccess('Score updated! ✅', 1000);
      },
      onError: (error) => {
        showError(error.message || 'Failed to update score');
      },
    }
  );

  // All hooks must be called before any conditional returns
  const holesConfig = tournamentDetails?.holesConfig || [];
  const scoredHolesMap = new Map((playerScores || []).map((s) => [s.holeNumber, s]));
  
  const currentHole = holesConfig[currentHoleIndex];
  const existingScore = currentHole ? scoredHolesMap.get(currentHole.holeNumber) : null;
  const isEditMode = !!existingScore;

  const totalHoles = holesConfig.length;
  const holesCompleted = (playerScores || []).length;
  const progress = totalHoles > 0 ? (holesCompleted / totalHoles) * 100 : 0;

  const totalStrokes = (playerScores || []).reduce((sum, score) => sum + score.strokes, 0);
  const totalPar = (playerScores || []).reduce((sum, score) => {
    const hole = holesConfig.find(h => h.holeNumber === score.holeNumber);
    return sum + (hole?.par || 0);
  }, 0);
  const scoreToPar = totalStrokes - totalPar;

  // Quick score buttons
  const quickScores = currentHole ? [
    { value: currentHole.par - 2, label: 'Eagle', color: 'bg-yellow-600' },
    { value: currentHole.par - 1, label: 'Birdie', color: 'bg-green-600' },
    { value: currentHole.par, label: 'Par', color: 'bg-blue-600' },
    { value: currentHole.par + 1, label: 'Bogey', color: 'bg-orange-600' },
    { value: currentHole.par + 2, label: 'Double', color: 'bg-red-600' },
  ] : [];

  // Move early returns after all hooks
  useEffect(() => {
    if (!id || !user) {
      navigate('/player');
    }
  }, [id, user, navigate]);

  // Set initial hole based on URL parameter
  useEffect(() => {
    if (holeParam && holesConfig.length > 0) {
      const holeNumber = parseInt(holeParam);
      const holeIndex = holesConfig.findIndex(h => h.holeNumber === holeNumber);
      if (holeIndex !== -1) {
        setCurrentHoleIndex(holeIndex);
      }
    }
  }, [holeParam, holesConfig]);

  useEffect(() => {
    if (currentHole) {
      // If editing, use existing score, otherwise use par
      setStrokes(existingScore?.strokes || currentHole.par);
    }
  }, [currentHole, existingScore]);

  // Don't render if no user or id
  if (!id || !user) {
    return null;
  }

  if (tournamentDetails === undefined || playerScores === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] via-[#0f0f0f] to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!currentHole || strokes <= 0) return;

    setIsSubmitting(true);
    try {
      if (isEditMode && existingScore) {
        // Update existing score
        await updateScoreMutation({
          scoreId: existingScore._id,
          playerId: user._id as Id<'users'>,
          newStrokes: strokes,
        });
      } else {
        // Submit new score
        await submitScoreMutation({
          tournamentId: id as Id<'tournaments'>,
          playerId: user._id as Id<'users'>,
          holeNumber: currentHole.holeNumber,
          strokes,
        });
      }

      // Navigate back to flight scoring overview after submission
      // Don't auto-advance to next hole, let user click Save button
      setTimeout(() => {
        navigate(`/player/flight-scoring/${id}`);
      }, 800);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevHole = () => {
    if (currentHoleIndex > 0) {
      setCurrentHoleIndex(currentHoleIndex - 1);
    }
  };

  const handleNextHole = () => {
    if (currentHoleIndex < holesConfig.length - 1) {
      setCurrentHoleIndex(currentHoleIndex + 1);
    }
  };

  const incrementStrokes = () => setStrokes(prev => Math.min(prev + 1, 15));
  const decrementStrokes = () => setStrokes(prev => Math.max(prev - 1, 1));

  if (!currentHole) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] via-[#0f0f0f] to-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Check className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Round Complete! 🎉</h2>
          <p className="text-gray-400 mb-6">
            You've completed all holes. Check your scorecard to see your results.
          </p>
          <button
            onClick={() => navigate(`/player/flight-scoring/${id}`)}
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-xl"
          >
            View Scorecard
          </button>
        </div>
      </div>
    );
  }

  const currentScoreToPar = strokes - currentHole.par;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] via-[#0f0f0f] to-black pb-6">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black shadow-2xl sticky top-0 z-10 border-b border-gray-800">
        <div className="container mx-auto px-3 py-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`/player/flight-scoring/${id}`)}
              className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            
            <div className="flex-1 mx-3">
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 to-red-700 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-0.5">
                {holesCompleted}/{totalHoles} holes
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-gray-400">Score</p>
              <p className={`text-sm font-bold ${
                scoreToPar < 0 ? 'text-green-500' : scoreToPar > 0 ? 'text-red-500' : 'text-white'
              }`}>
                {scoreToPar > 0 ? '+' : ''}{scoreToPar}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 py-3 max-w-2xl">
        <div className="space-y-3">
          {/* Hole Info Card */}
          <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-xl shadow-xl p-4 relative overflow-hidden border border-gray-800">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-900/20 to-red-800/20 rounded-full -mr-12 -mt-12" />

            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">HOLE</p>
                  <h1 className="text-4xl font-black text-white">{currentHole.holeNumber}</h1>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-medium mb-0.5">PAR</p>
                  <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-black text-white">{currentHole.par}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Flag className="w-3 h-3 text-red-500" />
                  <span>Index {currentHole.index}</span>
                </div>
                <div className="flex items-center gap-2">
                  {currentHoleIndex > 0 && (
                    <button
                      onClick={handlePrevHole}
                      className="text-red-500 text-xs font-semibold hover:text-red-400 transition-colors"
                    >
                      ← Prev
                    </button>
                  )}
                  {currentHoleIndex < holesConfig.length - 1 && (
                    <button
                      onClick={handleNextHole}
                      className="text-red-500 text-xs font-semibold hover:text-red-400 transition-colors"
                    >
                      Next →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Score Display */}
          <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-xl shadow-xl p-4 border border-gray-800">
            <div className="text-center mb-3">
              <p className="text-xs text-gray-400 font-medium mb-1">YOUR STROKES</p>
              <div className="relative inline-block">
                <div className="text-5xl font-black text-white mb-1">
                  {strokes}
                </div>
                {currentScoreToPar !== 0 && (
                  <div className={`absolute -top-1 -right-10 flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold ${
                    currentScoreToPar < 0 
                      ? 'bg-green-900/50 text-green-400 border border-green-700' 
                      : 'bg-red-900/50 text-red-400 border border-red-700'
                  }`}>
                    {currentScoreToPar < 0 ? (
                      <TrendingDown className="w-3 h-3" />
                    ) : (
                      <TrendingUp className="w-3 h-3" />
                    )}
                    {currentScoreToPar > 0 ? '+' : ''}{currentScoreToPar}
                  </div>
                )}
              </div>
            </div>

            {/* Stroke Counter */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <button
                onClick={decrementStrokes}
                disabled={strokes <= 1}
                className="w-12 h-12 bg-red-600 hover:bg-red-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all transform active:scale-95 shadow-lg"
              >
                <Minus className="w-5 h-5" />
              </button>
              
              <div className="flex-1 max-w-xs">
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={strokes}
                  onChange={(e) => setStrokes(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-800 rounded-full appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${((strokes - 1) / 14) * 100}%, #1f2937 ${((strokes - 1) / 14) * 100}%, #1f2937 100%)`
                  }}
                />
              </div>

              <button
                onClick={incrementStrokes}
                disabled={strokes >= 15}
                className="w-12 h-12 bg-green-600 hover:bg-green-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all transform active:scale-95 shadow-lg"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Score Buttons */}
            <div className="grid grid-cols-5 gap-1.5 mb-3">
              {quickScores.map((quick) => (
                <button
                  key={quick.label}
                  onClick={() => setStrokes(quick.value)}
                  className={`py-2 rounded-lg text-white font-bold text-[10px] transition-all transform hover:scale-105 active:scale-95 ${quick.color} ${
                    strokes === quick.value ? 'ring-2 ring-offset-1 ring-offset-black ring-red-500' : ''
                  }`}
                >
                  {quick.label}
                </button>
              ))}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || strokes <= 0}
              className={`w-full py-3 ${
                isEditMode 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' 
                  : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
              } disabled:from-gray-800 disabled:to-gray-800 text-white font-black text-sm rounded-xl transition-all transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:transform-none shadow-xl flex items-center justify-center gap-2`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isEditMode ? 'Updating...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  {isEditMode ? 'Update Score' : 'Submit Score'}
                </>
              )}
            </button>
          </div>

          {/* Hole Navigation */}
          {/* <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-xl shadow-xl p-3 border border-gray-800">
            <h3 className="text-xs font-bold text-white mb-2">ALL HOLES</h3>
            <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5">
              {holesConfig.map((hole, index) => {
                const holeScore = scoredHolesMap.get(hole.holeNumber);
                const isScored = !!holeScore;
                const isCurrent = hole.holeNumber === currentHole?.holeNumber;
                
                return (
                  <button
                    key={hole.holeNumber}
                    onClick={() => setCurrentHoleIndex(index)}
                    className={`aspect-square rounded-lg font-bold text-xs transition-all relative ${
                      isCurrent
                        ? 'bg-gradient-to-br from-red-600 to-red-700 text-white ring-2 ring-red-500/50 scale-110'
                        : isScored
                        ? 'bg-blue-900/50 text-blue-400 border border-blue-700 hover:bg-blue-900/70'
                        : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-red-500 hover:bg-gray-700'
                    }`}
                  >
                    <div>{hole.holeNumber}</div>
                    {isScored && !isCurrent && (
                      <div className="text-[9px] absolute bottom-0 right-0 bg-blue-600 text-white rounded-tl-md rounded-br-md px-0.5">
                        {holeScore.strokes}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">
              Click any hole to score or edit • Blue = Already scored
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
}
