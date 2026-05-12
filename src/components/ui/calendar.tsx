import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-4",
        caption: "flex justify-center pt-1 pb-2 relative items-center",
        caption_label: "text-sm font-semibold tracking-tight",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-8 w-8 inline-flex items-center justify-center rounded-md border border-border/60 bg-background text-foreground/70 hover:text-foreground hover:bg-accent hover:border-border transition-colors",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex mb-1",
        head_cell: "text-muted-foreground/80 w-9 font-medium text-[0.7rem] uppercase tracking-wider",
        row: "flex w-full mt-1",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/40 [&:has([aria-selected])]:bg-accent/60 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: "h-9 w-9 p-0 font-normal text-sm rounded-md inline-flex items-center justify-center transition-colors hover:bg-accent hover:text-accent-foreground aria-selected:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        day_range_end: "day-range-end",
        day_selected:
          "bg-accent text-accent-foreground font-semibold shadow-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        day_today: "border border-accent/50 text-foreground font-semibold",
        day_outside:
          "day-outside text-muted-foreground/40 aria-selected:bg-accent/40 aria-selected:text-muted-foreground aria-selected:opacity-50",
        day_disabled: "text-muted-foreground/30 line-through hover:bg-transparent cursor-not-allowed",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground rounded-none",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
