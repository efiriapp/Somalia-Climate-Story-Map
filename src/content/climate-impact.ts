export type ClimateHazardId = 'floods' | 'droughts' | 'heat-waves' | 'el-nino' | 'la-nina';

export type ClimateImpactChapter = {
  heading: string;
  paragraphs: string[];
};

export type ClimateImpactVideo = {
  title: string;
  url: string;
  outlet: string;
};

export type ClimateImpactPage = {
  id: ClimateHazardId;
  title: string;
  kicker: string;
  lede: string;
  paragraphs: string[];
  chapters: ClimateImpactChapter[];
  images: string[];
  videos: ClimateImpactVideo[];
  sourceLabel: string;
  sourceUrl: string;
};

export function splitStoryImages(images: string[]): {
  first: string[];
  middle: string[];
  last: string[];
} {
  if (images.length <= 1) {
    return { first: [...images], middle: [], last: [] };
  }
  if (images.length === 2) {
    return { first: [images[0]], middle: [], last: [images[1]] };
  }
  return {
    first: [images[0]],
    middle: images.slice(1, -1),
    last: [images[images.length - 1]],
  };
}

export const climateImpactHub = {
  title: 'Climate Impact',
  lede: 'Somalia already lives with floods, droughts, heat waves, El Niño, and La Niña. These pages tell those stories with ICE Institute evidence: how each hazard hits people, livestock, cities, and the economy.',
};

export const climateImpactPages: ClimateImpactPage[] = [
  {
    id: 'floods',
    title: 'Floods',
    kicker: 'Climate Impact',
    lede: 'When the rain becomes a flood, it does not only bring water. It destroys homes, crops, livestock, roads, income, and the hopes of vulnerable families.',
    paragraphs: [
      'Somalia has a generally dry climate, but heavy rain after a long drought can produce sudden flooding. Dry, degraded soil may not absorb water. Blocked or weak drainage lets water collect in towns. The Shabelle and Juba can overflow, flash floods can sweep through streets, and coastal storms can push seawater inland.',
      'This is Somalia’s double climate risk. A lack of rain creates drought. Intense rainfall over a short period creates flooding. Both hazards can hit the same community in the same year.',
    ],
    chapters: [
      {
        heading: 'The day the water arrived',
        paragraphs: [
          'Early one morning, a family on the outskirts of Mogadishu heard heavy rain hitting the roof. At first the rain seemed like a blessing. Children believed it would refill wells and provide water for livestock.',
          'Within a few hours, water flowed through roads and low-lying areas. Muddy floodwater entered the small home. Belongings became soaked, documents were lost, and the road outside became impossible to use. The mother faced a painful choice: take her children to higher ground or try to save the few things the family owned. The flood was no longer only a weather event. It had become a crisis of fear, displacement, and survival.',
        ],
      },
      {
        heading: 'What is a flood?',
        paragraphs: [
          'A flood occurs when rainwater, river water, or seawater rises beyond its normal boundaries and covers land, homes, roads, and farms that are usually dry.',
          'The main types of flooding in Somalia include flash floods, when heavy rain falls in a short period and rapidly floods roads, homes, and settlements; river flooding, when the Shabelle or Juba rise above their banks; urban flooding, when rainwater collects because drainage is blocked or too small; coastal flooding from strong waves, storms, or rising seas; and compound flooding, when water arrives alongside drought, displacement, conflict, food insecurity, or disease.',
        ],
      },
      {
        heading: 'The scale of the crisis',
        paragraphs: [
          'The 2023 floods affected nearly 2.5 million people. Almost one million people were newly displaced, about 41,000 hectares of land were inundated, and at least 118 people died. The floods also raised cholera risk and cut roads and transport.',
          'The 2023–2024 El Niño period triggered some of the most historic flooding on record, affecting more than 2.4 million people, claiming around 110 lives, and displacing 1.2 million people across 36 districts. Floodwaters destroyed 1.5 million hectares of farmland and killed thousands of livestock. Nearly 70 percent of flood-affected households were already internally displaced by conflict or drought.',
          'During the 2025 Gu rainy season, floods affected more than 84,000 people and caused at least 17 deaths. About 8,100 people were displaced. In Banadir, rainfall on 9 May 2025 affected at least 24,600 people, especially those in weak houses and displacement settlements. A single 10-hour storm in mid-2025 collapsed homes in Mogadishu, damaged six major transit roads, and killed at least seven people overnight.',
        ],
      },
      {
        heading: 'Effects on people’s lives',
        paragraphs: [
          'Homes are destroyed or filled with water. Families leave their communities. Children miss school or travel through dangerous flooded roads. Wells become contaminated. Waterborne diseases, including diarrhoea and cholera, increase. Women, children, older people, and persons with disabilities face additional risks. Families lose food, clothing, documents, and tools.',
          'When floodwater enters a home, a daily wage worker may lose a day’s income. Children in overcrowded shelters face malnutrition and disease. Seasonal floods reliably trigger spikes in cholera, acute watery diarrhoea, and malaria, which can expand by 30 to 50 percent in affected districts because of stagnant breeding pools.',
        ],
      },
      {
        heading: 'Economic and social effects',
        paragraphs: [
          'Farmers lose crops, seeds, and fertile soil. Livestock lose grazing. Damaged roads make it hard to move food, animals, and goods. The World Bank estimated that Somalia’s 2019 floods caused more than 206 million dollars in losses and damage to roads, bridges, homes, farms, and displacement sites.',
          'A damaged road raises transport and food prices. Small businesses lose customers. When a bridge is cut, medicine and assistance may not arrive on time. Flooding separates families, increases internal displacement, and places extra demand on Mogadishu for water, shelter, healthcare, sanitation, education, and work.',
          'For a family that has already lost livestock to drought, another flood can feel like the final blow.',
        ],
      },
      {
        heading: 'Preventing floods from becoming disasters',
        paragraphs: [
          'Rainfall cannot be stopped, but damage can be reduced: build and maintain urban drainage; protect wetlands, rivers, and natural channels; send early warnings that reach communities quickly; remove waste that blocks drains; build homes and displacement sites on safe, elevated land; protect wells; strengthen bridges and roads; pre-position food, medicine, clean water, and shelter before heavy rains; give farmers flood-resistant seeds; and connect government, communities, and humanitarian partners.',
          'FAO had warned about El Niño months before the worst 2023 flooding. A warning that does not trigger action is only information. Flood resilience must be built in cities, livelihoods must be protected as carefully as emergency relief, and water management must cross borders because rainfall in the Ethiopian highlands feeds the Juba and Shabelle.',
          'Flooding may begin with rain, but it becomes a disaster when roads are weak, drainage is blocked, homes sit in low-lying land, and warnings arrive too late. Reducing flood risk is about protecting people’s lives, dignity, and future.',
        ],
      },
    ],
    images: [
      '/images/climate-impact/flood.jpg',
      '/images/climate-impact/flood-1.jpg',
      '/images/climate-impact/flood-2.jpg',
      '/images/climate-impact/flood-3.jpg',
      '/images/climate-impact/flood-4.webp',
    ],
    videos: [
      {
        title: 'Deadly floods continue to ravage Somalia',
        url: 'https://youtu.be/MjYZsu23LkE?si=BWEGsOJenPTaupxF',
        outlet: 'AP',
      },
      {
        title: 'Somalia floods: Heavy rains force thousands from their homes',
        url: 'https://youtu.be/PrBU7HGTpuE?si=UqUn5gi2RCVo1QT0',
        outlet: 'Al Jazeera',
      },
      {
        title: "Flood damage in Somalia's capital",
        url: 'https://youtube.com/shorts/Pk0ZU1EsmWU?si=SYWrS1masvd1aVTX',
        outlet: 'Reuters',
      },
    ],
    sourceLabel: 'State of Climate in Somalia 2026',
    sourceUrl:
      'https://ice.simad.edu.so/2026/04/24/state-of-climate-in-somalia-2026-trends-risks-and-pathways-to-resilience/',
  },
  {
    id: 'droughts',
    title: 'Droughts',
    kicker: 'Climate Impact',
    lede: 'When the rains fail again, the crisis travels from rural farms and grazing lands to the water points, markets, and displaced communities of Mogadishu.',
    paragraphs: [
      'Somalia’s droughts are not simply the result of one failed rainy season. They emerge from a naturally dry climate, rising temperatures, land degradation, conflict, poverty, and delayed assistance. Somalia is facing a severe drought emergency affecting over 5 to 6.5 million people after consecutive failed or below-average rainfall seasons.',
      'For pastoralists, water for people alone is not enough. Livestock provide milk, income, and accumulated wealth. When animals die, a household can lose its future.',
    ],
    chapters: [
      {
        heading: 'The day the water point emptied',
        paragraphs: [
          'Before sunrise, a mother in a settlement on the outskirts of Mogadishu joins a queue carrying two yellow jerrycans. Her children are still asleep, but the heat will soon make the journey harder. The water truck may arrive late, and the price of water may rise again. She is not only waiting for water. She is waiting for food, income, and a reason to believe her family can remain where they are.',
          'Across Somalia, drought turns ordinary decisions into painful calculations. Families decide whether to spend remaining money on water, grain, or transport. Pastoralists decide how far they can move animals before the animals become too weak. Farmers look at dry fields where seeds were planted but never germinated. In the city, the effects show up as rising food prices, crowded settlements, and people arriving from rural areas. In the countryside, the crisis begins with the disappearance of rain, pasture, and livestock.',
        ],
      },
      {
        heading: 'Impact on people and hunger',
        paragraphs: [
          'Nearly 6.5 million Somalis face high levels of hunger, and more than 1.8 million children face acute malnutrition because of worsening drought, as reported by the World Food Programme. Two million people experience severe hunger (IPC Phase 4). Over 1.8 million children under five require treatment for acute malnutrition, with nearly half a million severely malnourished.',
          'A joint study by the Somali Ministry of Health, UNICEF, and WHO estimated 71,100 drought-related excess deaths between January 2022 and June 2024, with about 40 percent being young children. Tens of thousands of people have abandoned their homes searching for water, pasture, and food. Water prices have soared as the Shabelle and Juba dropped sharply or dried in several areas. At least 829 schools have been disrupted.',
        ],
      },
      {
        heading: 'Why droughts keep returning',
        paragraphs: [
          'Somalia is naturally arid to semi-arid. Rainfall is highly variable. Climate change increases the pressure by making drought hotter, accelerating evaporation, and reducing the time land, crops, and pasture have to recover.',
          'FAO’s Somali Water and Land Information Management System combines rainfall and temperature in a Combined Drought Index. Drought is not measured only by the absence of rain; high temperatures also increase moisture loss. FAO reported in January 2026 that the drought was intensifying and could become comparable to 2011, 2017, and 2022. About 70 to 85 percent of cropland in key producing areas was under severe drought.',
          'The 2025 Deyr rains, normally expected from October to December, almost completely failed in many areas. Deyr cereal production was estimated at about 15,600 tonnes, the lowest in the historical record and about 75 percent below the already low average of the previous five years. The 2025 Gu harvest had performed relatively well in some central and southern areas, then the failed Deyr erased much of that recovery.',
          'La Niña can contribute to drier-than-normal conditions in parts of East Africa, while the Indian Ocean Dipole affects moisture across the region. These climate drivers set conditions, but they do not explain the entire disaster. The final severity is shaped by human systems.',
        ],
      },
      {
        heading: 'When the land loses its protection',
        paragraphs: [
          'Overgrazing, deforestation, and charcoal production weaken the land’s ability to retain water. The World Bank has linked charcoal, overgrazing, soil erosion, and natural-resource degradation to Somalia’s drought and desertification risk. In a 2017 assessment, the Bank estimated that drought-related soil erosion had removed about 93,000 tonnes of topsoil, causing an estimated 36 million dollars in damage to soil fertility and ecosystem services.',
          'When vegetation disappears, soil is exposed to wind and heat. Rainfall, when it arrives, may run across hardened ground instead of soaking in. Poor rainfall reduces pasture; livestock concentrate around remaining water; overgrazing removes vegetation; degraded soil holds less water; the next dry spell produces greater damage.',
        ],
      },
      {
        heading: 'From dry fields to empty markets',
        paragraphs: [
          'A pastoralist who loses animals loses milk, meat, transport, savings, and the ability to pay for food. A farmer who loses a harvest loses both food and seed. When thousands of families face the same loss, markets receive fewer local supplies while demand for imported food increases.',
          'FAO reported that sorghum prices in Mogadishu rose by 25 percent between November 2025 and January 2026, while maize prices increased by 45 percent. The World Bank’s May 2026 Somalia Economic Update reported that growth slowed to 3 percent in 2025, down from 4 percent in 2023 and 2024, partly because weather disrupted agriculture and livestock.',
          'FSNAU reported that about 6 million people, 31 percent of the analysed population, were facing acute food insecurity between April and June 2026. Nearly 1.88 million children were expected to need treatment for acute malnutrition during 2026. By August 2026, the United Nations reported that more than three-quarters of traditional water sources had dried up in some regions.',
        ],
      },
      {
        heading: 'The different faces of drought',
        paragraphs: [
          'Drought is a chain of stresses: meteorological drought when rainfall stays below normal; agricultural drought when soil moisture fails crops and pasture; vegetation drought when rangelands cannot regenerate; hydrological drought when rivers, wells, boreholes, and groundwater decline; socioeconomic drought when water, food, livestock, and work become unaffordable; and compound drought when heat, conflict, displacement, disease, or reduced assistance arrive together. Somalia’s current emergency includes all of these at the same time.',
        ],
      },
      {
        heading: 'A crisis that can be prevented from becoming a catastrophe',
        paragraphs: [
          'Drought cannot always be prevented, but its worst consequences can be reduced by moving from late emergency response to early, predictable action: water harvesting, groundwater monitoring, drought-resilient crops, livestock health, fodder reserves, rangeland restoration, and protection of migration corridors. Cash or food should arrive before families sell their last animals. Early warnings should reach communities in Somali languages.',
          'Mogadishu must prepare for more people arriving from drought-affected rural areas by expanding water, sanitation, health facilities, affordable housing, and work. In 2024, FAO provided anticipatory cash transfers to 2,400 Somali households based on early-warning information, allowing families to protect purchasing power and assets before drought became more severe.',
          'Somalia’s droughts may begin with failed rains, but they become humanitarian disasters when families have no reserves, degraded land cannot recover, markets cannot absorb the shock, and assistance arrives too late. Whether children remain hungry, displaced, or safe depends not only on the next rain, but on how early the country acts before it arrives.',
        ],
      },
    ],
    images: [
      '/images/climate-impact/drought-3.jpg',
      '/images/climate-impact/drought.jpg',
      '/images/climate-impact/drought-1.avif',
      '/images/climate-impact/drought-2.jpg',
      '/images/climate-impact/droughts.webp',
    ],
    videos: [
      {
        title: "Somalia's drought leaves 6.5 million on brink of hunger crisis, says ICRC",
        url: 'https://youtu.be/dK7wk-8RtFs?si=U8lw5eBVH46MINiC',
        outlet: 'Africanews',
      },
      {
        title: 'Somalia suffering worst drought in decades',
        url: 'https://youtu.be/8pk6KZQDSaw?si=gKX1eNaBOA1chxYJ',
        outlet: 'Al Jazeera',
      },
    ],
    sourceLabel: 'State of Climate in Somalia 2026',
    sourceUrl:
      'https://ice.simad.edu.so/2026/04/24/state-of-climate-in-somalia-2026-trends-risks-and-pathways-to-resilience/',
  },
  {
    id: 'heat-waves',
    title: 'Heat waves',
    kicker: 'Climate Impact',
    lede: 'When the road becomes a furnace, rising temperatures in Mogadishu change more than the weather. They affect roads, transport workers, household incomes, public health, and the future of the city.',
    paragraphs: [
      'By early afternoon, a busy road in Mogadishu begins to shimmer. The black surface absorbs the morning sun, vehicles release additional heat, and pedestrians search for small patches of shade. A bajaj driver slows down to drink water before continuing. His passengers are not only travelling to work or the market; they are travelling through an environment that is becoming harder to tolerate.',
    ],
    chapters: [
      {
        heading: 'A city under heat',
        paragraphs: [
          'Mogadishu’s coastal location provides some relief, but the city is not equally cool everywhere. Built-up areas in the interior can be about 2°C warmer than areas near the Indian Ocean. Concrete, asphalt, limited vegetation, and dense construction absorb heat during the day and release it slowly at night. In Banadir, humidity can reach 69 to 79 percent, creating heat-index conditions above 40°C during some periods of the year.',
          'This combination of heat and humidity is dangerous because the body struggles to cool itself through sweating. For drivers, street vendors, construction workers, traffic officers, porters, and pedestrians, the road becomes a workplace without a roof.',
        ],
      },
      {
        heading: 'When heat disrupts transport',
        paragraphs: [
          'Heatwaves affect the people who use the roads and the roads themselves. A driver who spends many hours in direct sunlight may experience dehydration, headache, fatigue, or dizziness. Some drivers reduce hours, take longer breaks, or avoid the hottest part of the day. Pedestrians face a similar problem. A 20-minute walk becomes exhausting when roads have little shade and few places to obtain drinking water.',
          'Asphalt can soften, develop ruts, and lose its shape under heavy traffic. Road damage increases maintenance costs and may slow passengers, food, fuel, and other goods. A damaged or congested road can prevent a person from reaching work, delay a medical emergency, or raise the price of goods in neighbourhood markets.',
          'The same city can experience extreme heat in one season and flooding after intense rainfall in another. Somalia’s Country Climate and Development Report identifies heat stress on workers and flooding of transport infrastructure among the channels through which climate change can damage the national economy.',
        ],
      },
      {
        heading: 'The economic cost',
        paragraphs: [
          'The economic consequences of a heatwave are often invisible. A driver works fewer hours. A vendor sells less because customers avoid the heat. A construction team stops earlier. A family spends more on water, transport, or treatment.',
          'World Bank modelling indicates that, under a dry and hot climate scenario, heat stress could reduce national labour productivity by approximately 4.5 percent by 2051–2060. The projected impact is greater for physically demanding outdoor work. Under the same broad scenario, climate change could reduce Somalia’s annual GDP by more than 13 percent by the middle of the century. UNDP reports that about 70 percent of Somalia’s GDP is generated in urban areas. When heat makes urban movement slower, less safe, or more expensive, it affects businesses, workers, and consumers at the same time.',
        ],
      },
      {
        heading: 'The health emergency on the road',
        paragraphs: [
          'A 2025 Heat and Health Vulnerability and Capacity Assessment in Banadir, Bay, Middle Shabelle, and Mudug found that 98.6 percent of surveyed households had experienced an extreme heat event during the previous year. Almost 95 percent of individuals reported heat-related symptoms, including headaches, fatigue, and skin rashes. One in six became unable to carry out normal daily activities. Sleep disruption affected more than 96 percent of respondents.',
          'Cardiovascular disease affected about 20 percent of surveyed households, and 41.3 percent of patients with the condition reported that symptoms became worse during hot weather. Across assessed facilities, the average heat-service readiness score was only 1.29 out of 5. Only 5.9 percent of facilities had heat action plans. In Banadir, 82.1 percent of surveyed households reported that they never received heat alerts.',
        ],
      },
      {
        heading: 'A road to resilience',
        paragraphs: [
          'Mogadishu’s roads should not be treated only as transport infrastructure. They are also public-health spaces and economic lifelines. Practical measures include trees and shaded walkways; water points, rest areas, and cooling centres for drivers, vendors, and outdoor workers; heat alerts through radio, mobile communication, community health workers, and local authorities; cooler-hour scheduling for heavy outdoor work; pavement specifications that reduce heat damage; drainage that can also handle floods; cooling and water at health facilities; and recording heat-related illness in health information systems.',
          'A 2026 UNDP–GEF project is planned to support climate-resilient urban planning in 17 Somali cities, including Mogadishu, with green corridors, drainage, and other nature-based solutions intended to reduce heat stress, flooding, and drought impacts.',
          'On a heatwave day, the road reveals the city’s vulnerability. It can also reveal the path forward: a cooler, safer Mogadishu where movement, work, and public health are protected together.',
        ],
      },
    ],
    images: [
      '/images/climate-impact/heat-wave.png',
      '/images/climate-impact/heat-wave-1.jpg',
      '/images/climate-impact/mogadishu-heat-wave.jpg',
      '/images/climate-impact/mogadishu-heat-waves.jpg',
      '/images/climate-impact/mogadishu-heat-wave-2.jpeg',
    ],
    videos: [
      {
        title: 'Heatwaves in Mogadishu',
        url: 'https://youtu.be/cwHvMhb_aZ0?si=V_fN6mdrNqnX7IfV',
        outlet: 'Somali Cable',
      },
      {
        title: 'Isbedelka cimilada: kulul daran ee ka jira Muqdisho',
        url: 'https://youtu.be/hohCFuGV7Xs?si=rgM-ycmIB-C-mvR3',
        outlet: 'Goobjoog',
      },
    ],
    sourceLabel: 'Somalia Country Climate and Development Report',
    sourceUrl: 'https://ice.simad.edu.so/2026/03/03/somalia-country-climate-and-development-report/',
  },
  {
    id: 'el-nino',
    title: 'El Niño',
    kicker: 'Climate Impact',
    lede: 'Somalia’s El Niño 2023: when the rain returned as a flood. After years of drought, the water that families needed arrived with such force that it destroyed homes, farms, and the chance to recover.',
    paragraphs: [
      'El Niño is a climate pattern associated with warmer-than-average sea-surface temperatures in the central and eastern Pacific Ocean. In the Horn of Africa, its influence can contribute to increased rainfall. When a positive Indian Ocean Dipole arrives at the same time, Deyr rains can become exceptionally wet.',
      'The 2023 flood was not simply a natural event. It became a crisis because people were already living with depleted resources, damaged livelihoods, weak infrastructure, and limited basic services.',
    ],
    chapters: [
      {
        heading: 'The river enters the city',
        paragraphs: [
          'On 9 May 2023, the Shabelle River broke its banks near Beledweyne in Hiiraan. Water moved into homes, roads, schools, and farms. Families who had already spent years in drought were forced to leave again. In Beledweyne and surrounding areas, about 35,000 families and 210,000 people were displaced. Five people died, 81 schools were damaged, and more than 25,200 children were affected. Around 3,272 hectares of farmland were inundated, and more than 3,400 livestock died.',
          'By 6 June, floods had affected at least 468,000 people across Somalia and displaced about 247,000. In Beledweyne, 97 percent of water assets, including wells and pumps, were contaminated or damaged. Stagnant water remained after the flood began to recede, preventing many families from returning and increasing the threat of waterborne disease. For many communities, the question was no longer whether water would come. The question was whether the water would bring relief or destruction.',
        ],
      },
      {
        heading: 'A once-in-a-century flood',
        paragraphs: [
          'Somalia entered 2023 after one of the most severe droughts in its modern history. Between 2020 and 2023 the country experienced its longest drought in recent record. Pastoralists had lost more than 3.8 million livestock in 2022. Rain was desperately needed.',
          'In July 2023, FAO warned that El Niño, combined with a positive Indian Ocean Dipole, could bring above-average Deyr rainfall. Up to 1.2 million people could be affected, and about 1.5 million hectares along the Juba and Shabelle were at high risk. Communities needed early warnings in local languages, supplies moved before roads closed, and evacuation plans for riverbank settlements.',
          'From October 2023 the predicted rainfall intensified. Heavy rain fell across Somalia, while rainfall in the Ethiopian highlands increased flows into the Juba and Shabelle. FAO-SWALIM recorded 1,152 millimetres of seasonal rain at Baidoa, the highest among stations in its review. On 9 November, the United Nations warned of once-in-a-century flooding.',
          'By 24 December, OCHA estimated 2.48 million people affected, 1.2 million displaced, around 118 deaths, and 224 schools damaged. The World Bank recorded nearly 2.5 million people affected, 41,000 hectares inundated, about 4,700 households destroyed, and major disruption to roads and airstrips. FAO reported that the Deyr rains submerged more than 1.5 million hectares of farmland.',
        ],
      },
      {
        heading: 'A country caught between drought and flood',
        paragraphs: [
          'Somalia’s 2023 experience cannot be understood as a story about too much rain alone. The country moved from prolonged drought to destructive flooding within the same year. The most severely affected regions included Banaadir, Bay, Lower Shabelle, Lower Juba, and Middle Shabelle.',
          'Yet the rain also refilled groundwater in some places. Pastoralists received relief from drought, and food prices later eased as roads reopened. This is the contradiction at the centre of Somalia’s climate story: the same rainfall that destroys a home may refill a community water source. Rain is not automatically a blessing or a disaster. Its impact depends on timing, intensity, preparedness, and infrastructure.',
        ],
      },
      {
        heading: 'What Somalia must learn from 2023',
        paragraphs: [
          'FAO had warned about El Niño months before the worst flooding. A warning that does not trigger action is only information. Early warning must connect to pre-agreed financing, evacuation, shelters, food stocks, and local response teams.',
          'Flood resilience must be built in cities, where many displaced people live in flood-prone settlements. Livelihood protection is as important as emergency relief: FAO estimated that every US$1 invested in protecting rural livelihoods could save about US$10 in food-related assistance if a family becomes displaced. Water management must also cross borders, because rainfall in the Ethiopian highlands feeds the Juba and Shabelle.',
          'The lesson of El Niño 2023 is not that Somalia received too much rain. The deeper lesson is that rainfall arrived in a country that had not yet recovered from drought and did not have enough protection against floods. The next rainy season will come. The critical question is whether Somalia will be better prepared when it does.',
        ],
      },
    ],
    images: ['/images/climate-impact/el-nino.jpg'],
    videos: [],
    sourceLabel: 'State of Climate in Somalia 2026',
    sourceUrl:
      'https://ice.simad.edu.so/2026/04/24/state-of-climate-in-somalia-2026-trends-risks-and-pathways-to-resilience/',
  },
  {
    id: 'la-nina',
    title: 'La Niña',
    kicker: 'Climate Impact',
    lede: 'La Niña is the other side of the Pacific climate swing. In Somalia it often means drier Deyr rains, hotter soils, empty water points, and a drought that travels from rangelands into Mogadishu.',
    paragraphs: [
      'La Niña is a climate pattern associated with cooler-than-average sea-surface temperatures in the central and eastern Pacific Ocean — the opposite of El Niño. In parts of East Africa, including Somalia, it can contribute to drier-than-normal conditions, especially during the Deyr season from October to December.',
      'The Indian Ocean Dipole also affects how moisture moves across the region. FEWS NET identified forecast La Niña and a negative Indian Ocean Dipole as factors contributing to expectations of below-average Deyr rainfall in 2025. These climate drivers set the conditions. They do not explain the entire disaster. The final severity is shaped by land degradation, conflict, poverty, and delayed assistance.',
    ],
    chapters: [
      {
        heading: 'When the Pacific turns cold, Somalia’s rains can fail',
        paragraphs: [
          'Somalia is naturally arid to semi-arid. Rainfall is highly variable. Climate change increases the pressure by making drought hotter, accelerating evaporation, and reducing the time land, crops, and pasture have to recover. When La Niña arrives, that pressure can tighten: less moisture, harder ground, and a shorter window for recovery after any rain that does fall.',
          'FAO’s Somali Water and Land Information Management System combines rainfall and temperature in a Combined Drought Index. Drought is not measured only by the absence of rain; high temperatures also increase moisture loss from soil, crops, pasture, and water sources.',
        ],
      },
      {
        heading: 'The 2025 Deyr failure',
        paragraphs: [
          'The 2025 Deyr rains, normally expected from October to December, almost completely failed in many areas. FAO reported in January 2026 that the drought was intensifying and could become comparable to 2011, 2017, and 2022. About 70 to 85 percent of cropland in key producing areas was under severe drought. Deyr cereal production was estimated at about 15,600 tonnes, the lowest in the historical record and about 75 percent below the already low average of the previous five years.',
          'The 2025 Gu harvest had performed relatively well in some central and southern areas. The failed Deyr then erased much of that recovery, damaged livestock conditions, and pushed food prices higher. Sorghum prices in Mogadishu rose by 25 percent between November 2025 and January 2026, while maize prices increased by 45 percent.',
        ],
      },
      {
        heading: 'From a climate driver to a human emergency',
        paragraphs: [
          'Nearly 6.5 million Somalis have faced high levels of hunger in this drought emergency. A joint study by the Somali Ministry of Health, UNICEF, and WHO estimated 71,100 drought-related excess deaths between January 2022 and June 2024, with about 40 percent being young children.',
          'When vegetation disappears, soil is exposed to wind and heat. Rainfall, when it eventually arrives, may run across hardened ground instead of soaking in. That is how La Niña-linked dryness becomes agricultural drought, then hydrological drought, then a market and displacement crisis in Mogadishu.',
        ],
      },
      {
        heading: 'Acting before the rains fail',
        paragraphs: [
          'La Niña cannot be stopped, but its worst consequences can be reduced by moving from late emergency response to early, predictable action: water harvesting, groundwater monitoring, drought-resilient crops, livestock health, fodder reserves, rangeland restoration, and cash before families sell their last animals. Early warnings should reach communities in Somali languages.',
          'Somalia’s climate future is not drought alone and not flood alone. El Niño can return rain as a flood. La Niña can withhold rain until wells, pasture, and harvests fail. Preparedness means watching both sides of the Pacific swing — and acting before either one becomes a catastrophe.',
        ],
      },
    ],
    images: [
      '/images/climate-impact/drought-2.jpg',
      '/images/climate-impact/drought-3.jpg',
    ],
    videos: [],
    sourceLabel: 'State of Climate in Somalia 2026',
    sourceUrl:
      'https://ice.simad.edu.so/2026/04/24/state-of-climate-in-somalia-2026-trends-risks-and-pathways-to-resilience/',
  },
];
