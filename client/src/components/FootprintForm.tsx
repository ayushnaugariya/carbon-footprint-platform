import { useState, type FormEvent } from 'react';
import { NumberField } from './NumberField';
import { ToggleField } from './ToggleField';
import type { DietType, FootprintInput } from '../types';

const DEFAULT_INPUT: FootprintInput = {
  transport: {
    carPetrolKmPerWeek: 0,
    carDieselKmPerWeek: 0,
    carElectricKmPerWeek: 0,
    carHybridKmPerWeek: 0,
    motorbikeKmPerWeek: 0,
    busKmPerWeek: 0,
    trainKmPerWeek: 0,
    metroKmPerWeek: 0,
    bicycleKmPerWeek: 0,
    walkKmPerWeek: 0,
    flightsShortHaulPerYear: 0,
    flightsLongHaulPerYear: 0
  },
  home: { electricityKwhPerWeek: 0, usesRenewableElectricity: false, naturalGasKwhPerWeek: 0, lpgKgPerWeek: 0 },
  diet: { type: 'average' },
  consumption: {
    fastFashionItemsPerMonth: 0,
    generalClothingItemsPerMonth: 0,
    electronicsSmallPerYear: 0,
    electronicsLargePerYear: 0,
    foodDeliveryOrdersPerWeek: 0,
    onlineParcelsPerWeek: 0
  },
  waste: { landfillKgPerWeek: 0, recycledKgPerWeek: 0, compostedKgPerWeek: 0 }
};

const DIET_OPTIONS: { value: DietType; label: string; hint: string }[] = [
  { value: 'meat_heavy', label: 'Meat-heavy', hint: 'Meat with most meals' },
  { value: 'average', label: 'Average', hint: 'Mixed diet with regular meat' },
  { value: 'pescatarian', label: 'Pescatarian', hint: 'Fish but no other meat' },
  { value: 'vegetarian', label: 'Vegetarian', hint: 'No meat or fish' },
  { value: 'vegan', label: 'Vegan', hint: 'No animal products' }
];

export function FootprintForm({
  initialValue = DEFAULT_INPUT,
  onSubmit,
  submitLabel = 'Calculate my footprint'
}: {
  initialValue?: FootprintInput;
  onSubmit: (input: FootprintInput) => Promise<void>;
  submitLabel?: string;
}) {
  const [input, setInput] = useState<FootprintInput>(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function update<K extends keyof FootprintInput>(section: K, patch: Partial<FootprintInput[K]>) {
    setInput((prev) => ({ ...prev, [section]: { ...prev[section], ...patch } }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(input);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8" aria-describedby={submitError ? 'form-error' : undefined}>
      <fieldset className="rounded-xl border border-gray-200 p-5">
        <legend className="px-1 text-lg font-semibold text-ink-900">🚗 Transport (per week)</legend>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NumberField id="carPetrol" label="Petrol car" unit="km/week" value={input.transport.carPetrolKmPerWeek} onChange={(v) => update('transport', { carPetrolKmPerWeek: v })} />
          <NumberField id="carDiesel" label="Diesel car" unit="km/week" value={input.transport.carDieselKmPerWeek} onChange={(v) => update('transport', { carDieselKmPerWeek: v })} />
          <NumberField id="carElectric" label="Electric car" unit="km/week" value={input.transport.carElectricKmPerWeek} onChange={(v) => update('transport', { carElectricKmPerWeek: v })} />
          <NumberField id="carHybrid" label="Hybrid car" unit="km/week" value={input.transport.carHybridKmPerWeek} onChange={(v) => update('transport', { carHybridKmPerWeek: v })} />
          <NumberField id="motorbike" label="Motorbike" unit="km/week" value={input.transport.motorbikeKmPerWeek} onChange={(v) => update('transport', { motorbikeKmPerWeek: v })} />
          <NumberField id="bus" label="Bus" unit="km/week" value={input.transport.busKmPerWeek} onChange={(v) => update('transport', { busKmPerWeek: v })} />
          <NumberField id="train" label="Train" unit="km/week" value={input.transport.trainKmPerWeek} onChange={(v) => update('transport', { trainKmPerWeek: v })} />
          <NumberField id="metro" label="Metro / subway" unit="km/week" value={input.transport.metroKmPerWeek} onChange={(v) => update('transport', { metroKmPerWeek: v })} />
          <NumberField id="bicycle" label="Bicycle" unit="km/week" value={input.transport.bicycleKmPerWeek} onChange={(v) => update('transport', { bicycleKmPerWeek: v })} />
          <NumberField id="walk" label="Walking" unit="km/week" value={input.transport.walkKmPerWeek} onChange={(v) => update('transport', { walkKmPerWeek: v })} />
          <NumberField id="flightsShort" label="Short-haul flights" unit="per year" value={input.transport.flightsShortHaulPerYear} onChange={(v) => update('transport', { flightsShortHaulPerYear: v })} hint="Under ~1,500 km, e.g. domestic trips" />
          <NumberField id="flightsLong" label="Long-haul flights" unit="per year" value={input.transport.flightsLongHaulPerYear} onChange={(v) => update('transport', { flightsLongHaulPerYear: v })} hint="International, e.g. intercontinental" />
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-gray-200 p-5">
        <legend className="px-1 text-lg font-semibold text-ink-900">🏠 Home energy (per week)</legend>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NumberField id="electricity" label="Electricity" unit="kWh/week" value={input.home.electricityKwhPerWeek} onChange={(v) => update('home', { electricityKwhPerWeek: v })} />
          <NumberField id="naturalGas" label="Natural gas" unit="kWh/week" value={input.home.naturalGasKwhPerWeek} onChange={(v) => update('home', { naturalGasKwhPerWeek: v })} />
          <NumberField id="lpg" label="LPG / propane" unit="kg/week" value={input.home.lpgKgPerWeek} onChange={(v) => update('home', { lpgKgPerWeek: v })} />
        </div>
        <div className="mt-4">
          <ToggleField
            id="renewable"
            label="My electricity comes from a renewable / green tariff"
            checked={input.home.usesRenewableElectricity}
            onChange={(v) => update('home', { usesRenewableElectricity: v })}
          />
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-gray-200 p-5">
        <legend className="px-1 text-lg font-semibold text-ink-900">🍽️ Diet</legend>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DIET_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={[
                'flex cursor-pointer flex-col gap-1 rounded-lg border p-3 text-sm transition-colors',
                input.diet.type === option.value ? 'border-brand-600 bg-brand-50' : 'border-gray-200 hover:bg-gray-50'
              ].join(' ')}
            >
              <span className="flex items-center gap-2 font-medium text-ink-900">
                <input
                  type="radio"
                  name="diet"
                  value={option.value}
                  checked={input.diet.type === option.value}
                  onChange={() => update('diet', { type: option.value })}
                  className="accent-brand-600"
                />
                {option.label}
              </span>
              <span className="text-xs text-ink-500">{option.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-gray-200 p-5">
        <legend className="px-1 text-lg font-semibold text-ink-900">🛍️ Shopping &amp; consumption</legend>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NumberField id="fastFashion" label="Fast-fashion items" unit="per month" value={input.consumption.fastFashionItemsPerMonth} onChange={(v) => update('consumption', { fastFashionItemsPerMonth: v })} />
          <NumberField id="generalClothing" label="Other clothing items" unit="per month" value={input.consumption.generalClothingItemsPerMonth} onChange={(v) => update('consumption', { generalClothingItemsPerMonth: v })} />
          <NumberField id="electronicsSmall" label="Small electronics" unit="per year" value={input.consumption.electronicsSmallPerYear} onChange={(v) => update('consumption', { electronicsSmallPerYear: v })} hint="Phones, headphones, gadgets" />
          <NumberField id="electronicsLarge" label="Large electronics" unit="per year" value={input.consumption.electronicsLargePerYear} onChange={(v) => update('consumption', { electronicsLargePerYear: v })} hint="Laptops, TVs, appliances" />
          <NumberField id="foodDelivery" label="Food delivery orders" unit="per week" value={input.consumption.foodDeliveryOrdersPerWeek} onChange={(v) => update('consumption', { foodDeliveryOrdersPerWeek: v })} />
          <NumberField id="parcels" label="Online parcel deliveries" unit="per week" value={input.consumption.onlineParcelsPerWeek} onChange={(v) => update('consumption', { onlineParcelsPerWeek: v })} />
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-gray-200 p-5">
        <legend className="px-1 text-lg font-semibold text-ink-900">🗑️ Waste (per week)</legend>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NumberField id="landfill" label="Landfill waste" unit="kg/week" value={input.waste.landfillKgPerWeek} onChange={(v) => update('waste', { landfillKgPerWeek: v })} />
          <NumberField id="recycled" label="Recycled waste" unit="kg/week" value={input.waste.recycledKgPerWeek} onChange={(v) => update('waste', { recycledKgPerWeek: v })} />
          <NumberField id="composted" label="Composted waste" unit="kg/week" value={input.waste.compostedKgPerWeek} onChange={(v) => update('waste', { compostedKgPerWeek: v })} />
        </div>
      </fieldset>

      {submitError ? (
        <p id="form-error" role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="self-start rounded-lg bg-brand-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
      >
        {isSubmitting ? 'Calculating…' : submitLabel}
      </button>
    </form>
  );
}
