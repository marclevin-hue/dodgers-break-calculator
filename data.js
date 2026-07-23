// 2026 Topps Chrome Baseball — group-break odds data
// Sourced from the official Topps checklist + odds sheet (per-pack odds for
// Hobby/Jumbo/Mega/Value; per-box odds for Breaker Delight, which has no pack
// structure). Where Topps only discloses a "Gold Refractor" tier for an insert,
// that tier is used as a stand-in for "any copy of this insert."

const BOX_META = {
  hobby:   { label: 'Hobby',           cardsPerPack: 4,  packsPerBox: 20 },
  jumbo:   { label: 'Jumbo',           cardsPerPack: 11, packsPerBox: 12 },
  mega:    { label: 'Mega',            cardsPerPack: 7,  packsPerBox: 6  },
  value:   { label: 'Value',           cardsPerPack: 4,  packsPerBox: 7  },
  delight: { label: 'Breaker Delight', cardsPerPack: 12, packsPerBox: 1  } // 1 box = 1 unit (odds are per-box)
};
const BOX_TYPES = ['hobby', 'jumbo', 'mega', 'value', 'delight'];

for (const k of BOX_TYPES) {
  BOX_META[k].cardsPerBox = BOX_META[k].cardsPerPack * BOX_META[k].packsPerBox;
}

// The two known Miguel Rojas cards in the set.
const ROJAS_CARDS = [
  {
    id: 'champ',
    name: 'CHAMP-15 — Miguel Rojas',
    setName: 'Topps Chrome Champion Refractors (Gold tier)',
    total: 16, target: 1,
    odds: { hobby: 6402, jumbo: 9530, value: 56594, mega: 106290, delight: 591 }
  },
  {
    id: 'wca',
    name: 'WCA-MR — Miguel Rojas',
    setName: '2025 World Champions Autograph Refractor (Gold tier)',
    total: 17, target: 1,
    odds: { hobby: 12175, jumbo: 3706, value: 205730, mega: 55228, delight: 2.540 }
  }
];

// Every set in the checklist containing at least one Los Angeles Dodgers
// subject (including Brooklyn Dodgers legacy cards, since a "Dodgers" spot
// in a break conventionally includes franchise history). `unit: 'card'` means
// the ratio applies per physical card rather than per pack/box (used only for
// the generic base-card bucket, since Topps doesn't publish a per-player base
// rate — assumed uniform across the 300 subjects).
const DODGERS_SETS = [
  { name: 'Base cards (any subject, any parallel color)', category: 'base', total: 300, dodgers: 13, unit: 'card',
    odds: { hobby: 1, jumbo: 1, value: 1, mega: 1, delight: 1 } },
  { name: 'Base — Lightboard Logo Variation', category: 'base', total: 300, dodgers: 13,
    odds: { value: 281, mega: 120 } },
  { name: 'Base — Image Variations', category: 'base', total: 50, dodgers: 3,
    odds: { hobby: 103, jumbo: 152, value: 902, mega: 1655, delight: 10 } },
  { name: 'Base — Super Short Prints', category: 'base', total: 10, dodgers: 1,
    odds: { hobby: 5115, jumbo: 7552, value: 45552, mega: 85032, delight: 468 } },
  { name: 'Base — Award Winner Variation', category: 'base', total: 6, dodgers: 1,
    odds: { hobby: 33126, jumbo: 27602, delight: 1243 } },
  { name: '2025 Chrome MVP Buybacks (base)', category: 'base', total: 2, dodgers: 1,
    odds: { hobby: 12833, jumbo: 19059, value: 109859, mega: 212580, delight: 1163 } },

  { name: 'Ultraviolet', category: 'insert', total: 15, dodgers: 2,
    odds: { hobby: 1516, jumbo: 2243, value: 13340, mega: 25010, delight: 140 } },
  { name: 'Perspectives', category: 'insert', total: 10, dodgers: 1,
    odds: { hobby: 25, jumbo: 10, value: 18, mega: 15, delight: 11 } },
  { name: 'World Series At Night', category: 'insert', total: 10, dodgers: 5,
    odds: { hobby: 1705, jumbo: 2526, value: 15062, mega: 28344, delight: 157 } },
  { name: 'Topps Chrome Champion Refractors (Gold tier)', category: 'insert', total: 16, dodgers: 16,
    odds: { hobby: 6402, jumbo: 9530, value: 56594, mega: 106290, delight: 591 } },
  { name: 'Shadow Etch', category: 'insert', total: 20, dodgers: 2,
    odds: { hobby: 480, jumbo: 192, delight: 12 } },
  { name: 'Helix', category: 'insert', total: 15, dodgers: 2,
    odds: { hobby: 3412, jumbo: 5067, value: 30123, mega: 53145, delight: 314 } },
  { name: 'Static Noise', category: 'insert', total: 15, dodgers: 2,
    odds: { value: 3924, mega: 1175 } },
  { name: 'Hobby Masters', category: 'insert', total: 19, dodgers: 1,
    odds: { hobby: 1487, jumbo: 418, delight: 22 } },
  { name: 'Wild Style', category: 'insert', total: 25, dodgers: 4,
    odds: { hobby: 40, jumbo: 24 } },
  { name: 'Past To Present', category: 'insert', total: 50, dodgers: 4,
    odds: { value: 14, mega: 12 } },
  { name: 'Topps Chrome Expose', category: 'insert', total: 30, dodgers: 1,
    odds: { hobby: 28206, jumbo: 7926, delight: 419 } },
  { name: 'Big Ticket Players', category: 'insert', total: 25, dodgers: 2,
    odds: { hobby: 10, jumbo: 4, value: 7, mega: 6, delight: 4 } },
  { name: 'Wrecking Crew', category: 'insert', total: 25, dodgers: 2,
    odds: { hobby: 10, jumbo: 4, value: 7, mega: 6, delight: 4 } },
  { name: '1991 Topps Baseball', category: 'insert', total: 30, dodgers: 2,
    odds: { hobby: 9, jumbo: 4, value: 6, mega: 5, delight: 4 } },
  { name: 'Diamond Moments', category: 'insert', total: 50, dodgers: 7,
    odds: { hobby: 120, jumbo: 48 } },
  { name: "2025 MLB Commissioner's Trophy", category: 'insert', total: 1, dodgers: 1,
    odds: { hobby: 2848800 } },
  { name: 'Chrome Rivals Home', category: 'insert', total: 25, dodgers: 3,
    odds: { hobby: 40, jumbo: 24 } },

  { name: 'Rookie Autographs', category: 'auto', total: 94, dodgers: 3,
    odds: { hobby: 46, jumbo: 14, value: 780, mega: 208, delight: 2 } },
  { name: 'Retail Rookie Autographs', category: 'auto', total: 30, dodgers: 1,
    odds: { value: 203, mega: 182 } },
  { name: 'Chrome Legend Autographs (Gold tier)', category: 'auto', total: 47, dodgers: 5,
    odds: { hobby: 8187, jumbo: 1726, delight: 24 } },
  { name: 'World Series Champions Autographs', category: 'auto', total: 33, dodgers: 1,
    odds: { hobby: 6194, jumbo: 1304, delight: 19 } },
  { name: 'Ink Strokes', category: 'auto', total: 71, dodgers: 1,
    odds: { hobby: 500, jumbo: 153, value: 8490, mega: 2262, delight: 21 } },
  { name: '75th Diamond Autographs', category: 'auto', total: 69, dodgers: 5,
    odds: { hobby: 964, jumbo: 294, value: 16383, mega: 4350, delight: 41 } },
  { name: 'Chromographs', category: 'auto', total: 32, dodgers: 5,
    odds: { hobby: 5521, jumbo: 1682, value: 93380, mega: 25010, delight: 231 } },
  { name: '2025 World Champions Autograph Refractor (Gold tier)', category: 'auto', total: 17, dodgers: 17,
    odds: { hobby: 12175, jumbo: 3706, value: 205730, mega: 55228, delight: 2.540 } },
  { name: 'Radiating Rookies Autographs', category: 'auto', total: 15, dodgers: 1,
    odds: { hobby: 18499, jumbo: 5559, delight: 462 } },
  { name: '2025 Chrome MVP Buybacks Autographs', category: 'auto', total: 2, dodgers: 1,
    odds: { hobby: 149936, jumbo: 47086, value: 2743066, mega: 635130, delight: 6004 } },

  { name: 'Gold Logoman Relics', category: 'relic', total: 6, dodgers: 1,
    odds: { hobby: 316534, jumbo: 100056, value: 8229200, mega: 1270260, delight: 12008 } },
  { name: 'Gold Logoman Dual Relics', category: 'relic', total: 6, dodgers: 1,
    odds: { hobby: 569760, jumbo: 200112, value: 8229200, mega: 2540520, delight: 36024 } },
  { name: 'Gold Logoman Dual Autograph Relics', category: 'relic', total: 6, dodgers: 1,
    odds: { hobby: 1424400, jumbo: 400224, delight: 18012 } },
  { name: 'Gold Logoman Autograph Relics', category: 'relic', total: 6, dodgers: 1,
    odds: { hobby: 1424400, jumbo: 400224, delight: 18012 } }
];

const CATEGORY_LABELS = {
  base: 'Base cards (all parallels)',
  insert: 'Inserts',
  auto: 'Autographs',
  relic: 'Relics'
};
