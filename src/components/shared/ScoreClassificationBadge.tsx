interface ScoreClassificationBadgeProps {
  score: number;
  par: number;
  showLabel?: boolean;
}

export default function ScoreClassificationBadge({
  score,
  par,
  showLabel = true,
}: ScoreClassificationBadgeProps) {
  const diff = score - par;

  // Determine classification and color
  let label = '';
  let bgColor = '';
  let textColor = '';

  if (score === 1) {
    label = 'Hole in One';
    bgColor = 'bg-purple-100';
    textColor = 'text-purple-800';
  } else if (diff <= -3) {
    label = 'Albatross';
    bgColor = 'bg-purple-100';
    textColor = 'text-purple-800';
  } else if (diff === -2) {
    label = 'Eagle';
    bgColor = 'bg-blue-100';
    textColor = 'text-blue-800';
  } else if (diff === -1) {
    label = 'Birdie';
    bgColor = 'bg-green-100';
    textColor = 'text-green-800';
  } else if (diff === 0) {
    label = 'Par';
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-800';
  } else if (diff === 1) {
    label = 'Bogey';
    bgColor = 'bg-orange-100';
    textColor = 'text-orange-800';
  } else if (diff === 2) {
    label = 'Double Bogey';
    bgColor = 'bg-red-100';
    textColor = 'text-red-800';
  } else if (diff === 3) {
    label = 'Triple Bogey';
    bgColor = 'bg-red-200';
    textColor = 'text-red-900';
  } else {
    label = `+${diff}`;
    bgColor = 'bg-gray-200';
    textColor = 'text-gray-900';
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
    >
      {showLabel ? label : diff > 0 ? `+${diff}` : diff === 0 ? 'E' : diff.toString()}
    </span>
  );
}
