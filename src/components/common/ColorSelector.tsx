import { PAYMENT_SOURCE_COLORS } from '@/utils/constants';
import { cn } from '@/lib/utils';

interface ColorSelectorProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorSelector({ value, onChange }: ColorSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {PAYMENT_SOURCE_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={cn(
            'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            value === color ? 'scale-110 border-foreground' : 'border-transparent'
          )}
          style={{ backgroundColor: color }}
          aria-label={`Select color ${color}`}
          aria-pressed={value === color}
        />
      ))}
      <label
        className="relative h-8 w-8 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/60"
        title="Custom color"
      >
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="absolute inset-[-8px] h-12 w-12 cursor-pointer border-0 p-0"
          aria-label="Select a custom color"
        />
      </label>
    </div>
  );
}
