import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export function ErrorMessage({ message, className }: ErrorMessageProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md',
        className
      )}
    >
      <AlertCircle className="h-5 w-5 flex-shrink-0" />
      <p>{message}</p>
    </div>
  );
}
