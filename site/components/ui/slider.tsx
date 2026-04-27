import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderPrimitive.Root.Props) {
  const _values = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? defaultValue
      : [min, max]

  return (
    <SliderPrimitive.Root
      className={cn("group/slider data-horizontal:w-full data-vertical:h-full", className)}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      {/* Outer pad — extends the click/touch target vertically without
          changing the visual track height. Click anywhere in this band to
          jump; drag to scrub. */}
      <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col py-2 -my-2">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative grow overflow-hidden rounded-full select-none data-horizontal:h-0.5 data-horizontal:w-full data-vertical:h-full data-vertical:w-0.5 transition-[height] group-hover/slider:data-horizontal:h-1"
          style={{ backgroundColor: "var(--color-border)" }}
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="select-none data-horizontal:h-full data-vertical:w-full"
            style={{ backgroundColor: "var(--color-accent)" }}
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className="relative block size-2 shrink-0 rounded-full opacity-60 transition-[opacity,transform] select-none after:absolute after:-inset-3 group-hover/slider:opacity-100 group-hover/slider:scale-125 group-data-[active]/slider:opacity-100 group-data-[active]/slider:scale-150 focus-visible:opacity-100 focus-visible:scale-125 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing"
            style={{ backgroundColor: "var(--color-accent)" }}
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
