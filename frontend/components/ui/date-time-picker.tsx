'use client';

import * as React from 'react';
import { format, setHours, setMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DateTimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// Gerar array de horas (0-23)
const hours = Array.from({ length: 24 }, (_, i) => i);

// Gerar array de minutos de 5 em 5 (0, 5, 10, 15, ..., 55)
const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

export function DateTimePicker({
  value,
  onChange,
  placeholder = 'Selecione a data',
  disabled,
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse the ISO string to Date object
  const dateValue = React.useMemo(() => {
    if (!value) return undefined;
    try {
      return new Date(value);
    } catch {
      return undefined;
    }
  }, [value]);

  // Get hour and minute from date
  const hourValue = React.useMemo(() => {
    if (!dateValue) return 8;
    return dateValue.getHours();
  }, [dateValue]);

  const minuteValue = React.useMemo(() => {
    if (!dateValue) return 0;
    // Arredondar para o múltiplo de 5 mais próximo
    return Math.round(dateValue.getMinutes() / 5) * 5;
  }, [dateValue]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;

    // Preserve the current time when changing date
    const newDate = setMinutes(setHours(selectedDate, hourValue), minuteValue);

    onChange?.(format(newDate, "yyyy-MM-dd'T'HH:mm"));
    setOpen(false);
  };

  const handleHourChange = (hourStr: string) => {
    const hour = parseInt(hourStr, 10);

    // If no date selected, use today
    const baseDate = dateValue || new Date();
    const newDate = setHours(baseDate, hour);

    onChange?.(format(newDate, "yyyy-MM-dd'T'HH:mm"));
  };

  const handleMinuteChange = (minuteStr: string) => {
    const minute = parseInt(minuteStr, 10);

    // If no date selected, use today
    const baseDate = dateValue || new Date();
    const newDate = setMinutes(baseDate, minute);

    onChange?.(format(newDate, "yyyy-MM-dd'T'HH:mm"));
  };

  return (
    <div className={cn('flex gap-2', className)}>
      <div className="flex-1">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className={cn(
                'w-full justify-start text-left font-normal',
                !dateValue && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateValue ? (
                format(dateValue, "dd 'de' MMM, yyyy", { locale: ptBR })
              ) : (
                <span>{placeholder}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={handleDateSelect}
              defaultMonth={dateValue}
              locale={ptBR}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-1">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <Select
          value={hourValue.toString()}
          onValueChange={handleHourChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-16">
            <SelectValue placeholder="Hora" />
          </SelectTrigger>
          <SelectContent>
            {hours.map((hour) => (
              <SelectItem key={hour} value={hour.toString()}>
                {hour.toString().padStart(2, '0')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-muted-foreground">:</span>

        <Select
          value={minuteValue.toString()}
          onValueChange={handleMinuteChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-16">
            <SelectValue placeholder="Min" />
          </SelectTrigger>
          <SelectContent>
            {minutes.map((minute) => (
              <SelectItem key={minute} value={minute.toString()}>
                {minute.toString().padStart(2, '0')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
