import { CategoryDimension } from '../services/syntheticDataset';

export interface RecommendationAction {
  id: string;
  category: CategoryDimension;
  title: string;
  description: string;
  estimatedWeeklySavingsKg: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const RECOMMENDATIONS_CATALOG: RecommendationAction[] = [
  // Transport
  { id: 'transport-bike-commute', category: 'transport', title: 'Bike or walk one commute a week', description: 'Swap one car commute for cycling or walking.', estimatedWeeklySavingsKg: 9.6, difficulty: 'easy' },
  { id: 'transport-public-transit', category: 'transport', title: 'Take public transit twice a week', description: 'Replace two short car trips with bus or train.', estimatedWeeklySavingsKg: 6.4, difficulty: 'easy' },
  { id: 'transport-carpool', category: 'transport', title: 'Carpool for one regular trip', description: 'Share a ride that you currently drive alone.', estimatedWeeklySavingsKg: 8.0, difficulty: 'medium' },
  { id: 'transport-combine-errands', category: 'transport', title: 'Combine errands into one trip', description: 'Batch short car trips together to cut total distance driven.', estimatedWeeklySavingsKg: 3.0, difficulty: 'easy' },
  { id: 'transport-reduce-short-flights', category: 'transport', title: 'Replace one short flight with rail where possible', description: 'For trips under ~500km, trains usually emit far less than flying.', estimatedWeeklySavingsKg: 15.0, difficulty: 'hard' },

  // Home energy
  { id: 'home-thermostat', category: 'home', title: 'Adjust thermostat by 2 degrees', description: 'Lower heating or raise cooling setpoints slightly.', estimatedWeeklySavingsKg: 4.2, difficulty: 'easy' },
  { id: 'home-led-bulbs', category: 'home', title: 'Switch remaining bulbs to LED', description: 'Replace incandescent or CFL bulbs with LEDs.', estimatedWeeklySavingsKg: 1.1, difficulty: 'easy' },
  { id: 'home-unplug-standby', category: 'home', title: 'Unplug standby electronics overnight', description: 'Cut phantom load from devices left on standby.', estimatedWeeklySavingsKg: 1.8, difficulty: 'easy' },
  { id: 'home-renewable-plan', category: 'home', title: 'Switch to a renewable electricity plan', description: 'Move to a green energy tariff if available in your area.', estimatedWeeklySavingsKg: 12.0, difficulty: 'medium' },
  { id: 'home-cold-wash', category: 'home', title: 'Wash clothes on a cold or eco cycle', description: 'Most of a wash cycle\'s energy goes to heating water.', estimatedWeeklySavingsKg: 2.0, difficulty: 'easy' },

  // Diet
  { id: 'diet-meatless-day', category: 'diet', title: 'Have one meat-free day per week', description: 'Swap meat for plant-based protein one day a week.', estimatedWeeklySavingsKg: 4.5, difficulty: 'easy' },
  { id: 'diet-reduce-red-meat', category: 'diet', title: 'Cut red meat portions by half', description: 'Red meat has one of the highest footprints per kg of any food.', estimatedWeeklySavingsKg: 6.0, difficulty: 'medium' },
  { id: 'diet-local-seasonal', category: 'diet', title: 'Choose local, seasonal produce', description: 'Reduces emissions from long-distance food transport and storage.', estimatedWeeklySavingsKg: 1.5, difficulty: 'easy' },
  { id: 'diet-reduce-food-waste', category: 'diet', title: 'Plan meals to cut food waste', description: 'Wasted food carries the full footprint of producing it for nothing.', estimatedWeeklySavingsKg: 2.5, difficulty: 'medium' },

  // Consumption
  { id: 'consumption-buy-less-fashion', category: 'consumption', title: 'Skip one fast-fashion purchase this month', description: 'Fast fashion items have a surprisingly high footprint per item.', estimatedWeeklySavingsKg: 5.0, difficulty: 'medium' },
  { id: 'consumption-repair-reuse', category: 'consumption', title: 'Repair instead of replace one item', description: 'Extending a product\'s life avoids the footprint of making a new one.', estimatedWeeklySavingsKg: 3.5, difficulty: 'medium' },
  { id: 'consumption-secondhand', category: 'consumption', title: 'Buy one item secondhand instead of new', description: 'Secondhand goods avoid most manufacturing-related emissions.', estimatedWeeklySavingsKg: 4.0, difficulty: 'easy' },
  { id: 'consumption-combine-deliveries', category: 'consumption', title: 'Combine online orders into fewer deliveries', description: 'Fewer, bigger shipments reduce per-item delivery emissions.', estimatedWeeklySavingsKg: 1.2, difficulty: 'easy' },

  // Waste
  { id: 'waste-recycle-more', category: 'waste', title: 'Sort and recycle more of your waste', description: 'Recycling avoids a large share of landfill-related emissions.', estimatedWeeklySavingsKg: 2.2, difficulty: 'easy' },
  { id: 'waste-compost-food-scraps', category: 'waste', title: 'Start composting food scraps', description: 'Composting avoids methane produced by food waste in landfill.', estimatedWeeklySavingsKg: 1.8, difficulty: 'medium' },
  { id: 'waste-reduce-single-use', category: 'waste', title: 'Cut single-use plastics this week', description: 'Switch to reusable bags, bottles, and containers.', estimatedWeeklySavingsKg: 1.0, difficulty: 'easy' }
];
