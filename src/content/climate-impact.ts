export type ClimateHazardId = 'floods' | 'droughts' | 'heat-waves';

export type ClimateImpactPage = {
  id: ClimateHazardId;
  title: string;
  kicker: string;
  lede: string;
  paragraphs: string[];
  sourceLabel: string;
  sourceUrl: string;
};

export const climateImpactHub = {
  title: 'Climate Impact',
  lede: 'Somalia already lives with floods, droughts, and heat waves. These pages explain how each hazard hits people, livestock, cities, and the economy, using ICE Institute evidence from the State of Climate in Somalia 2026 and related research.',
};

export const climateImpactPages: ClimateImpactPage[] = [
  {
    id: 'floods',
    title: 'Floods',
    kicker: 'Climate Impact',
    lede: 'When heavy Gu or Deyr rains arrive, the Shabelle and Juba can overflow and flash floods can sweep through towns. Flooding is not only a weather event in Somalia. It displaces families, damages farms, and cuts roads that hold markets together.',
    paragraphs: [
      'Riverine floods along the Shabelle and Juba are among Somalia’s most visible climate shocks. After dry seasons, hard ground cannot absorb intense rainfall. Water rises quickly in riverine districts, inundates fields, and forces households to move with whatever they can carry. Flash floods in towns add another risk: drainage is limited, so a short burst of rain can flood streets, homes, and clinics.',
      'Floods compound other pressures. A family that has just recovered from drought can lose a harvest to standing water. Livestock die or scatter. Contaminated water raises disease risk. Displacement from flooding is a climate mobility problem, not a private misfortune: people move because the land under them has become unsafe.',
      'ICE’s State of Climate in Somalia 2026 treats floods as part of a structural national risk, not a one-off emergency. Preparedness means early warning, safer settlement planning, and climate-smart cities, not only emergency response after the water arrives. Adaptation finance that follows flood-prone river basins and urban drainage can protect lives before the next peak flow.',
    ],
    sourceLabel: 'State of Climate in Somalia 2026',
    sourceUrl:
      'https://ice.simad.edu.so/2026/04/24/state-of-climate-in-somalia-2026-trends-risks-and-pathways-to-resilience/',
  },
  {
    id: 'droughts',
    title: 'Droughts',
    kicker: 'Climate Impact',
    lede: 'When rains fail, wells dry, pasture disappears, and pastoralist families start moving. Drought in Somalia is a crisis of distance, animals, and survival, not only a rainfall statistic.',
    paragraphs: [
      'Somalia ranks among the most climate-vulnerable countries. ICE reports an ND-GAIN score of 37.5 and five failed seasons from 2023 to 2025 that hit the pastoral and farming majority. Consecutive poor Gu and Deyr rains create widespread rainfall deficits. More than 4.4 million people have faced food insecurity, and losses could approach 100 billion dollars by 2050 without adaptation.',
      'For pastoralists, water for people alone is not enough. Livestock provide milk, income, and accumulated wealth. When animals die, a household can lose its future. Farmers lose harvests when soil moisture fails. Both livelihoods are vulnerable when rainfall does not come. Drought is also a mobility problem: families leave home because wells and pasture have failed.',
      'ICE argues for a shift from reactive aid to resilient livelihoods, water systems, renewable energy, and evidence-based planning. Emergency water trucking can save lives in a season. Long-term drought response maps hotspots, protects water points, and designs systems that make the next failed rainy season less deadly.',
    ],
    sourceLabel: 'State of Climate in Somalia 2026',
    sourceUrl:
      'https://ice.simad.edu.so/2026/04/24/state-of-climate-in-somalia-2026-trends-risks-and-pathways-to-resilience/',
  },
  {
    id: 'heat-waves',
    title: 'Heat waves',
    kicker: 'Climate Impact',
    lede: 'Rising heat is already part of daily life in Somali cities and rangelands. Extreme temperatures strain health, outdoor work, livestock, and the economy, especially on a dry, hot path if fragility persists.',
    paragraphs: [
      'Heat waves are less visible than a flood wall or a dried well, but they cut into the same systems. Outdoor workers, vendors, and herders carry the first cost. Livestock suffer when shade and water are scarce. In Mogadishu and other towns, heat combines with dense settlement, limited green cover, and unreliable electricity, so nights stay warm and clinics fill.',
      'ICE’s briefing on the Country Climate and Development Report places droughts, floods, and heat together as shocks that already cut rural livelihoods and can deepen displacement. Under a dry, hot path, GDP losses could exceed 13 percent by mid-century if fragility persists. About 5.3 billion dollars of adaptation investment over 35 years could cut those damages and add growth.',
      'Heat adaptation is practical: shade, water, cooling in health facilities, climate-smart urban design, and early warnings that reach people who work outside. ICE treats heat as a development risk Somalia can plan for, not a background condition to endure.',
    ],
    sourceLabel: 'Somalia Country Climate and Development Report',
    sourceUrl: 'https://ice.simad.edu.so/2026/03/03/somalia-country-climate-and-development-report/',
  },
];
