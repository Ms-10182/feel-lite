
import { formatDistanceToNow } from "date-fns";

interface TimeAgoProps {
  date: Date;
  className?: string;
}

const TimeAgo = ({ date, className = "" }: TimeAgoProps) => {
  const timeAgo = formatDistanceToNow(date, { addSuffix: true });
  
  return <span className={className}>{timeAgo}</span>;
};

export default TimeAgo;
