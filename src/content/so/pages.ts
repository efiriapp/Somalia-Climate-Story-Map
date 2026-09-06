import type { ClimateHazardId, ClimateImpactPage } from '../climate-impact';

export const ABOUT_SO = {
  title: 'Ku saabsan Machadka ICE',
  website: 'https://ice.simad.edu.so/about/',
  paragraphs: [
    'Machadka Cimilada iyo Deegaanka (ICE) waa hay’ad hormuud ka ah cilmi-baarista siyaasadda iyo tallaabada, oo Jaamacadda SIMAD u aasaastay inay ka hortagto caqabadaha cimilada, deegaanka, iyo horumarka Soomaaliya iyo wixii ka baxsan. Xarunta waa Jaamacadda SIMAD ee Muqdisho. ICE waxay isku xidhaa cilmi-baaris, falanqayn, u doodid siyaasadeed, xoojinta awoodda, iyo hal-abuurnimo cimilo si loo dhiso Soomaaliya cagaaran oo adkaysi badan.',
    'ICE waxay la shaqeysaa dawladaha, ganacsiga gaarka ah, bulshooyinka, iyo bulshada rayidka si loo xoojiyo awoodaha maxalliga ah, loo ilaaliyo deegaanka, loona gacan qaado adkeysiga cimilada. Shaqadeedu waxay ku fidsan tahay cimilo, deegaan, tamarta, biyaha, badda, cuntada, maamulka, iyo sinnaanta. Daabacaadaha iyo natiijooyinka waa la wadaagaa si dadka, siyaasad-dejiyeyaasha, iyo asxaabta ay uga faa’iideestaan caddaynta.',
    'Cilmi-baarayaasha ICE waxay soo saaraan daraasado asal ah, qiimeeyaan xalal, oo ay caddaynta ku miisaamaan heerarka ugu sarreeya ee dib-u-eegista asxaabta, kalsoonida, iyo aaminaadda. Habka machadku waa in la qeexo oo la helo dhismayaasha dhibaatada, aqoonta lala wadaago bulshooyinka iyo hay’adaha, ka dibna xalalka la geeyo isla-goyska cadaaladda bulsho, dhaqaale, iyo deegaan.',
    'ICE sidoo kale waxay korisaa xalal cagaaran, waxay tababartaa hoggaamiyeyaal cimilo oo dhallinyaro ah, oo caddaynta Soomaaliyeed u geeysaa marxaladaha gobolka iyo caalamka. Wax badan ka ogow bogga rasmiga ah ee Machadka ICE.',
  ],
};

export const CLIMATE_HUB_SO = {
  title: 'Saamaynta Cimilada',
  lede: 'Soomaaliya horay ayay ugu nool tahay daadad, abaaraha, hirarka kulaylka, El Niño, iyo La Niña. Bogaggani waxay sheekooyinkaas ku sheegaan caddaynta Machadka ICE: sida khatarta kasta u saameyso dadka, xoolaha, magaalooyinka, iyo dhaqaalaha.',
};

export const FOOTER_SO = {
  institute: 'Machadka Cimilada iyo Deegaanka (ICE)',
  university: 'Jaamacadda SIMAD',
  platform: 'Barnaamijka Sheekaynta Xogta Cimilada Soomaaliyeed',
  comment:
    'Sheekooyinka, cilmi-baarista, iyo bogagga ICE ee Marxaladda Caalamiga ee barnaamijkan waa qayb ka mid ah taxanaha sheekaynta cimilada ee Machadka ICE. Waxay iftiimiyaan dadka Soomaaliyeed, xogta, iyo tallaabada cimilada si dadweynuhu u barto.',
  copyright: '© 2026 Machadka Cimilada iyo Deegaanka (ICE), Jaamacadda SIMAD. Dhammaan xuquuqdu waa la xafiday.',
};

type ClimateSo = Pick<ClimateImpactPage, 'lede' | 'paragraphs' | 'chapters'> & {
  title?: string;
  kicker?: string;
  sourceLabel?: string;
};

export const CLIMATE_PAGES_SO: Record<ClimateHazardId, ClimateSo> = {
  floods: {
    title: 'Daadad',
    kicker: 'Saamaynta Cimilada',
    sourceLabel: 'Xaaladda Cimilada Soomaaliya 2026',
    lede: 'Marka roobku noqdo daad, keliya biyo ma keenayo. Wuxuu burburiyaa guryaha, dalagyada, xoolaha, waddooyinka, dakhliga, iyo rajada qoysaska nugul.',
    paragraphs: [
      'Soomaaliya guud ahaan cimilo qallalan bay leedahay, laakiin roob culus ka dib abaar dheer wuxuu keeni karaa daad degdeg ah. Ciidda qallalan ee xumaatay biyo ma nuugi karto. Bullaacadaha xiran ama daciifka ah waxay u oggolaadaan in biyuhu magaalada isugu ururaan. Shabeelle iyo Jubba way ka buuxsan karaan, daad degdeg ah wuxuu waddooyinka dhex mari karaa, duufaannada xeebtana waxay badda gudaha u riixi karaan.',
      'Tani waa khatarta labanlaabka ah ee cimilada Soomaaliya. Roob la’aan waxay keentaa abaar. Roob culus muddo gaaban waxay keentaa daad. Labada khatar midkoodba waxay isla sanadkaas ku dhici kartaa isla beesha.',
    ],
    chapters: [
      {
        heading: 'Maalintii biyuhu yimaadeen',
        paragraphs: [
          'Subax hore, qoys ku nool duleedka Muqdisho ayaa maqlay roob culus oo saqafka ku dhacaya. Markii hore roobku wuxuu u ekaa barako. Carruurtu waxay rumaysnaayeen inuu ceelasha buuxin doono oo xoolaha biyo siin doono.',
          'Saacado yar gudahood, biyuhu waxay mareen waddooyinka iyo meelaha hoose. Daad dhoobo ah ayaa guriga yar galay. Alaabtu way qoyday, dukumentiyadii waa lumeen, waddada dibaddana lama marin karin. Hooyadu waxay wajahday doorasho xanuun leh: carruurta u kaxee meel sare mise isku day inay badbaadiso waxa yar ee qoysku haystay. Daadku hadda keliya dhacdo cimilo ma ahayn. Waxay noqotay qas, barakac, iyo badbaado.',
        ],
      },
      {
        heading: 'Waa maxay daadka?',
        paragraphs: [
          'Daad wuxuu dhacaa marka biyaha roobka, webiga, ama badda ka koraan xadkooda caadiga ah oo ay qariyaan dhul, guryo, waddooyin, iyo beeraha caadi ahaan qallalan.',
          'Noocyada ugu waaweyn ee daadka Soomaaliya waxaa ka mid ah daad degdeg ah, marka roob culus muddo gaaban da’o oo si degdeg ah u buuxiyo waddooyin, guryo, iyo xeryo; daad webi, marka Shabeelle ama Jubba ka buuxsamaan; daad magaalo, marka biyaha roobku ururaan sababtoo ah bullaacadaha waa xiran yihiin ama aad u yaryihiin; daad xeeb oo ka yimaada mowjado, duufaanno, ama badda korodhay; iyo daad isku-dhafan, marka biyuhu yimaadaan iyadoo ay weheliyaan abaar, barakac, colaad, cunto-yari, ama cudur.',
        ],
      },
      {
        heading: 'Baaxadda dhibaatada',
        paragraphs: [
          'Daadadkii 2023 waxay saameeyeen ku dhawaad 2.5 milyan oo qof. Ku dhawaad hal milyan ayaa si cusub u barakacay, ilaa 41,000 hektar ayaa qoyay, ugu yaraan 118 qof ayaa dhintay. Daadadku waxay kor u qaadeen khatarta daacuunka oo jareen waddooyinka iyo gaadiidka.',
          'Xilligii El Niño 2023–2024 wuxuu kiciyay qaar ka mid ah daadadkii ugu taariikhda badnaa, oo saameeyay in ka badan 2.4 milyan oo qof, qiyaastii 110 naf qaatay, 1.2 milyan ka barakiciyay 36 degmo. Biyaha daadka waxay burburiyeen 1.5 milyan hektar oo beer ah oo dileen kumaan xoolo. Ku dhawaad 70 boqolkiiba qoysaska daadku saameeyay horay ayay ugu barakaceen colaad ama abaar.',
          'Xilliga Gu 2025, daadadku waxay saameeyeen in ka badan 84,000 qof oo keeneen ugu yaraan 17 dhimasho. Qiyaastii 8,100 qof ayaa barakacay. Banaadir, roobkii 9 Maajo 2025 wuxuu saameeyay ugu yaraan 24,600 qof, gaar ahaan kuwa guryaha daciifka ah iyo xeryaha barakacayaasha. Hal duufaan 10 saacadood ah bartamaha 2025 ayaa guryo ku dumisay Muqdisho, dhaawacay lix waddo waaweyn, habeenkii dilay ugu yaraan toddoba qof.',
        ],
      },
      {
        heading: 'Saamaynta nolosha dadka',
        paragraphs: [
          'Guryaha waa la burburiyaa ama biyo ayaa buuxiya. Qoysasku beeshooda way ka baxaan. Carruurtu dugsiga way seegaan ama waxay maraan waddooyin daad khatar ah. Ceelasha way wasakhoobaan. Cudurrada biyaha, oo ay ku jiraan shuban iyo daacuun, way koraan. Haweenka, carruurta, waayeelka, iyo dadka naafada ah waxay wajahaan khataro dheeraad ah. Qoysasku waxay lumiyaan cunto, dhar, dukumentiyo, iyo qalab.',
          'Marka daadku guriga galo, shaqaale maalinle ah wuxuu lumin karaa dakhliga maalintaas. Carruurta hoyga ciriiriga ah waxay wajahaan nafaqo-darro iyo cudur. Daadadka xilliyeed si kalsooni leh ayay u kiciyaan daacuun, shuban degdeg ah, iyo duumada, kuwaas oo 30 ilaa 50 boqolkiiba ku kori kara degmooyinka saameysan sababtoo ah barkadaha istaaga.',
        ],
      },
      {
        heading: 'Saamaynta dhaqaale iyo bulsho',
        paragraphs: [
          'Beeraleydu waxay lumiyaan dalag, abuur, iyo ciidda bacrin. Xooluhu daaqsiin way lumiyaan. Waddooyinka dhaawacan waxay adkeeyaan in cunto, xoolo, iyo badeeco la raro. Bangiga Adduunka wuxuu ku qiyaasay in daadadkii Soomaaliya 2019 ay keeneen in ka badan 206 milyan oo doolar khasaare iyo dhaawac waddooyin, buundooyin, guryo, beeraha, iyo xeryaha barakacayaasha.',
          'Waddo dhaawacan waxay kor u qaaddaa qiimaha gaadiidka iyo cuntada. Ganacsiyada yaryar macaamiil way lumiyaan. Marka buundo la jaro, dawo iyo gargaar waqtigooda ma iman karaan. Daadku wuxuu kala fogeeyaa qoysaska, kordhiyaa barakaca gudaha, una saaraa Muqdisho baahi dheeraad ah oo biyo, hoy, caafimaad, nadaafad, waxbarasho, iyo shaqo.',
          'Qoys horay xoolihiisa ugu lumiyay abaar, daad kale wuxuu u ekaan karaa dharbaaxada ugu dambeysa.',
        ],
      },
      {
        heading: 'Ka hortagga in daadku noqdo masiibo',
        paragraphs: [
          'Roobka lama joojin karo, laakiin dhaawaca waa la yareyn karaa: dhis oo dayactir bullaacadaha magaalada; ilaali dhul-qoyan, webiyo, iyo marinno dabiici ah; u dir digniino hore oo beesha si degdeg ah u gaadha; ka saar qashinka xiraya bullaacadaha; dhig guryo iyo xeryo dhul badbaado leh oo sare; ilaali ceelasha; xooji buundooyinka iyo waddooyinka; horay u diyaari cunto, dawo, biyo nadiif ah, iyo hoy ka hor roobabka culus; sii beeraleyda abuur daad u adkaysta; iskuna xidh dawladda, bulshooyinka, iyo asxaabta gargaarka.',
          'FAO waxay ka digniiseen El Niño bilo ka hor daadadkii ugu xumaa 2023. Digniin aan tallaabo kicin waa macluumaad keliya. Adkeysiga daadka waa in lagu dhisaa magaalooyinka, nolosha waa in loo ilaaliyo sida gargaarka degdegga ah, maamulka biyuhuna waa inuu xudduudaha ka gudbaa sababtoo ah roobka buuraha Itoobiya ayaa quudiya Jubba iyo Shabeelle.',
          'Daadku wuxuu ku bilaabmi karaa roob, laakiin wuxuu noqdaa masiibo marka waddooyinku daciif yihiin, bullaacadaha xiran yihiin, guryuhu ku yaallaan dhul hoose, digniinihuna soo daahaan. Yareynta khatarta daadka waa ilaalinta nolosha, sharafta, iyo mustaqbalka dadka.',
        ],
      },
    ],
  },
  droughts: {
    title: 'Abaaraha',
    kicker: 'Saamaynta Cimilada',
    sourceLabel: 'Xaaladda Cimilada Soomaaliya 2026',
    lede: 'Marka roobabku mar kale fashilmaan, dhibaatadu waxay uga sii gudubtaa beero iyo daaqsimeed ilaa ceelasha, suuqyada, iyo bulshooyinka barakacay ee Muqdisho.',
    paragraphs: [
      'Abaaraha Soomaaliya keliya mid xilli roobaad fashilmay ma aha. Waxay ka soo baxaan cimilo qallalan, heerkul sii kordhaya, xumaan dhul, colaad, faqriga, iyo gargaar soo daahay. Soomaaliya waxay wajahaysaa xaalad degdeg ah oo abaareed oo saameysa in ka badan 5 ilaa 6.5 milyan oo qof ka dib xilliyo roobaad oo isdaba-joog ah oo fashilmay ama ka hooseeya celceliska.',
      'Xoola-dhaqatada, biyaha dadka keliya kuma filna. Xooluhu waxay bixiyaan caano, dakhli, iyo hanti la ururiyay. Marka xooluhu dhintaan, qoysku wuxuu lumin karaa mustaqbalkiisa.',
    ],
    chapters: [
      {
        heading: 'Maalintii ceelku madhnaaday',
        paragraphs: [
          'Ka hor qorrax-soo-baxa, hooyo ku nool xero duleedka Muqdisho waxay ku biirtaa saf iyadoo sita laba jeerikeen huruud ah. Carruurteedu weli way hurdaan, laakiin kulaylku dhawaan safarka wuu adkeyn doonaa. Gaariga biyaha wuu soo daahi karaa, qiimaha biyuhuna mar kale wuu kici karaa. Kaliya biyo kuma sugeyso. Waxay sugeysaa cunto, dakhli, iyo sabab ay ku rumaysato in qoyskeedu halkaas sii joogi karo.',
          'Soomaaliya oo dhan, abaartu go’aannada caadiga ah waxay ka dhigtaa xisaab xanuun leh. Qoysasku waxay go’aansadaan in lacagta hadhay lagu bixiyo biyo, hadhuudh, ama gaadiid. Xoola-dhaqatadu waxay go’aansadaan intee xoolaha loo rarayo ka hor intaanay daciifin. Beeraleydu waxay eegaan beer qallalan oo abuur lagu beeray oo aan waligood soo bixin. Magaalada, saamaynta waxay u muuqataa qiimo cunto oo kacay, xeryo ciriiri ah, iyo dad ka yimid miyiga. Miyiga, dhibaatadu waxay ku bilaabmaysaa roob, daaq, iyo xoolo oo lumay.',
        ],
      },
      {
        heading: 'Saamaynta dadka iyo gaajada',
        paragraphs: [
          'Ku dhawaad 6.5 milyan oo Soomaali ah ayaa wajahaya gaajo heer sare ah, in ka badan 1.8 milyan oo caruur ahna waxay wajahayaan nafaqo-darro ba’an sababtoo ah abaarta sii xumaanaysa, sida ay sheegtay Barnaamijka Cuntada Adduunka. Laba milyan ayaa wajahaya gaajo daran (Heerka IPC 4). In ka badan 1.8 milyan oo caruur ah oo ka yar shan sano ayaa u baahan daaweyn nafaqo-darro, ku dhawaad nus milyanna si daran ayay u nafaqo-daran yihiin.',
          'Daraasad wadajir ah oo Wasaaradda Caafimaadka Soomaaliya, UNICEF, iyo WHO sameeyeen ayaa ku qiyaastay 71,100 dhimasho dheeraad ah oo abaar la xiriirta Janaayo 2022 ilaa Juun 2024, qiyaastii 40 boqolkiibana waa caruur yaryar. Kumaan kun oo qof ayaa guryahooda ka tegey iyagoo raadinaya biyo, daaq, iyo cunto. Qiimaha biyuhu aad buu u kacay markii Shabeelle iyo Jubba si xooggan u hoos u dhaceen ama meelo badan qallaleen. Ugu yaraan 829 dugsi ayaa khalkhal galay.',
        ],
      },
      {
        heading: 'Maxay abaaruhu u soo noqnoqdaan',
        paragraphs: [
          'Soomaaliya dabiici ahaan waa dhul qallalan ilaa mid-qallalan. Roobku aad buu u kala duwan yahay. Isbeddelka cimiladu wuxuu cadaadiska kordhiyaa isagoo abaarta ka dhigaya mid kulul, dedejiya uumi-baxa, yareyna waqtiga dhulka, dalagyada, iyo daaqsigu u heli karaan inay soo kabtaan.',
          'Nidaamka FAO ee Macluumaadka Biyaha iyo Dhulka Soomaaliyeed wuxuu isku daraa roob iyo heerkul Tusmada Abaarta Isku-dhafan. Abaar keliya ma aha roob la’aan; heerkulka sare wuxuu kordhiyaa luminta qoyaanka. FAO waxay Janaayo 2026 sheegtay in abaartu sii xoogaysanayso oo ay la mid noqon karto 2011, 2017, iyo 2022. Qiyaastii 70 ilaa 85 boqolkiiba dhulka dalagga ee meelaha ugu muhiimsan ayaa ku jiray abaar daran.',
          'Roobabkii Deyr 2025, kuwaas oo caadi ahaan la filayo Oktoobar ilaa Diseembar, meelo badan si gebi ahaan ah ayay u fashilmeen. Wax-soo-saarka hadhuudhka Deyr waxaa lagu qiyaasay ilaa 15,600 tan, kan ugu hooseeya taariikhda diiwaanka, oo qiyaastii 75 boqolkiiba ka hooseeya celceliska hore ee shanta sano. Goosashadii Gu 2025 meelo dhexe iyo koonfur aad bay u fiicnayd, ka dib Deyr fashilmay ayaa tirtiray soo kabashadaas.',
          'La Niña waxay gacan ka geysan kartaa xaalad ka qallalan caadiga qaybo ka mid ah Bariga Afrika, halka Indian Ocean Dipole ay saameyso qoyaanka gobolka. Waa kuwan dariiqyada cimilada ee dejiya xaaladda, laakiin dhibaatada oo dhan ma sharxaan. Darnimada ugu dambeysa waxaa qaabeeya nidaamyada aadanaha.',
        ],
      },
      {
        heading: 'Marka dhulku lumiyo ilaalintiisa',
        paragraphs: [
          'Daaqsiin xad-dhaaf ah, jarista geedaha, iyo soo saarista dhuxusha waxay daciifiyaan awoodda dhulka inuu biyo hayo. Bangiga Adduunka wuxuu ku xidhayaa dhuxusha, daaqsiinta xad-dhaafka, nabaad-guurka ciidda, iyo xumaan khayraadka dabiiciga khatarta abaarta iyo saxaraha Soomaaliya. Qiimeyn 2017, Bangigu wuxuu ku qiyaasay in nabaad-guurka ciidda ee abaarta la xiriira uu ka qaaday ilaa 93,000 tan oo ciid sare ah, taasoo keentay qiyaastii 36 milyan oo doolar dhaawac bacriminta iyo adeegyada deegaanka.',
          'Marka dhirta baaba’do, ciiddu waxay u furan tahay dabaysha iyo kulaylka. Roobka, markuu yimaado, wuxuu ku ordi karaa dhul adag halkii uu ka nuugi lahaa. Roob xun wuxuu yareeyaa daaqa; xooluhu waxay isugu ururaan biyaha hadhay; daaqsiin xad-dhaaf ah ayaa dhirta ka qaada; ciidda xumaatay biyo yar bay haysaa; qallalxumada xigta waxay keentaa dhaawac ka weyn.',
        ],
      },
      {
        heading: 'Laga soo bilaabo beer qallalan ilaa suuq madhan',
        paragraphs: [
          'Xoola-dhaqate xoolihiisa lumiyay wuxuu lumiyay caano, hilib, gaadiid, kayd, iyo awood uu cunto ku iibsado. Beeraley goosasho lumiyay wuxuu lumiyay cunto iyo abuur labadaba. Marka kumaan qoys isla khasaarahaas wajahaan, suuqyadu waxay helaan sahay maxalli ah oo yaraatay iyadoo baahida cunto la soo dhoofiyo ay kordhayso.',
          'FAO waxay sheegtay in qiimaha masagada Muqdisho uu 25 boqolkiiba kacay Noofambar 2025 ilaa Janaayo 2026, halka galleydu 45 boqolkiiba kacday. Warbixinta Dhaqaalaha Soomaaliya ee Bangiga Adduunka Maajo 2026 waxay sheegtay in koritaanku ku hoos u dhacay 3 boqolkiiba 2025, ka hooseeya 4 boqolkiiba 2023 iyo 2024, qayb ahaan sababtoo ah cimiladu waxay khalkhalisay beeraha iyo xoolaha.',
          'FSNAU waxay sheegtay in qiyaastii 6 milyan oo qof, 31 boqolkiiba dadka la falanqeeyay, ay wajahayeen cunto-yari daran Abriil ilaa Juun 2026. Ku dhawaad 1.88 milyan oo caruur ah ayaa la filayay inay u baahdaan daaweyn nafaqo-darro 2026. Ogosto 2026, Qaramada Midoobay waxay sheegtay in in ka badan saddex-meelood saddex meel ilaha dhaqameed ee biyaha ay qallaleen qaar ka mid ah gobollada.',
        ],
      },
      {
        heading: 'Wajiyada kala duwan ee abaarta',
        paragraphs: [
          'Abaartu waa silsilad cadaadis: abaar cimilo marka roobku ka hooseeyo caadiga; abaar beer marka qoyaanka ciiddu fashilmo dalag iyo daaq; abaar dhir marka daaqsigu soo kaban waayo; abaar biyo marka webiyo, ceelal, ceelal qodan, iyo biyaha dhulka hoostiisa hoos u dhacaan; abaar dhaqaale-bulsho marka biyo, cunto, xoolo, iyo shaqo aysan la awoodin; iyo abaar isku-dhafan marka kulayl, colaad, barakac, cudur, ama gargaar yaraada ay wada yimaadaan. Xaaladda degdegga ah ee Soomaaliya hadda dhammaantood isla wakhti ayay ku jiraan.',
        ],
      },
      {
        heading: 'Dhibaato laga hor tagi karo inay noqoto masiibo',
        paragraphs: [
          'Abaar had iyo jeer lama hor tagi karo, laakiin cawaaqibkeeda ugu xun waa la yareyn karaa iyadoo laga gudbo jawaab degdeg ah oo daahday una gudbo tallaabo hore oo la saadaalin karo: ururinta biyaha, kormeerka biyaha dhulka hoostiisa, dalagyada abaarta u adkaysta, caafimaadka xoolaha, kayd caws, soo celinta daaqsimeedka, iyo ilaalinta marinada rarista. Lacag ama cunto waa inay timaadaa ka hor intaan qoysasku xoolahooda ugu dambeeya iibin. Digniinaha hore waa inay ku gaadhaan bulshooyinka afafka Soomaaliga.',
          'Muqdisho waa inay isu diyaarisaa dad badan oo ka imanaya miyiga abaartu saameysay iyadoo ballaarinaysa biyo, nadaafad, xarumaha caafimaadka, guryo la awoodi karo, iyo shaqo. 2024, FAO waxay siisay lacag horudhac ah 2,400 qoys Soomaaliyeed iyadoo ku saleysan digniin hore, taasoo u oggolaatay qoysaska inay ilaaliyaan awoodda iibsashada iyo hantida ka hor intaan abaartu sii daran.',
          'Abaaraha Soomaaliya waxay ku bilaabmi karaan roob fashilmay, laakiin waxay noqdaan masiibooyin bini-aadamnimo marka qoysasku kayd la’aan yihiin, dhulka xumaatay soo kabin waayo, suuqyadu naxdinta qaadi waayaan, gargaarna soo daaho. In carruurtu gaajo, barakac, ama nabad ku sii jiraan kuma xirna roobka xiga keliya, ee waxaa ku xiran sida dalka ugu horreeyo ka hor inta uusan iman.',
        ],
      },
    ],
  },
  'heat-waves': {
    title: 'Hirarka kulaylka',
    kicker: 'Saamaynta Cimilada',
    sourceLabel: 'Warbixinta Cimilada iyo Horumarka Dalka Soomaaliya',
    lede: 'Marka waddadu noqoto foorno, heerkulka sii kacaya ee Muqdisho wax ka badan cimilada ayuu beddelaa. Wuxuu saameeyaa waddooyinka, shaqaalaha gaadiidka, dakhliga qoysaska, caafimaadka dadweynaha, iyo mustaqbalka magaalada.',
    paragraphs: [
      'Galabnimadii hore, waddo mashquul ah oo Muqdisho ah ayaa bilaabata inay dhalaaliso. Dusha madow wuxuu nuugaa qorraxda subaxda, baabuurta waxay sii daayaan kulayl dheeraad ah, dadka lugaynayana waxay raadiyaan hoos yar. Darawalka bajaajku wuu gaabiyaa si uu biyo u cabo ka hor inta uusan sii socon. Rakaabkiisu keliya shaqo ama suuq uma socdaan; waxay dhex socdaan deegaan sii adkaanaya in la adkeeyo.',
    ],
    chapters: [
      {
        heading: 'Magaalo ku hoos jirta kulayl',
        paragraphs: [
          'Goobta xeebta ee Muqdisho waxay siisaa xoogaa fudayd, laakiin magaaladu si siman uma qabowdo. Meelaha dhismaha badan ee gudaha waxay noqon karaan ilaa 2°C ka kulul meelaha u dhow Badweynta Hindiya. Shubka, asfaltka, dhirta yar, iyo dhismo ciriiri ah ayaa nuuga kulaylka maalintii habeenkiina si tartiib ah u sii daaya. Banaadir, huurwanaagu wuxuu gaadhi karaa 69 ilaa 79 boqolkiiba, taasoo abuurta xaalad heerkul-tusmo ka sarreysa 40°C qaybo ka mid ah sanadka.',
          'Isku-darka kulaylka iyo huurwanaaga waa khatar sababtoo ah jidhku wuxuu ku dhibtoonaa inuu isku qaboojiyo dhidid. Darawalada, iibiyeyaasha waddada, shaqaalaha dhismaha, booliska taraafikada, xamaaliyeyaasha, iyo dadka lugaynaya, waddadu waxay noqotaa goob shaqo saqaf la’aan.',
        ],
      },
      {
        heading: 'Marka kulaylku khalkhaliyo gaadiidka',
        paragraphs: [
          'Hirarka kulaylka waxay saameeyaan dadka waddada isticmaala iyo waddada lafteeda. Darawal saacado badan qorraxda tooska ah ku jira wuxuu la kulmi karaa fuuq-bax, madax-xanuun, daal, ama wareer. Qaar ayaa saacadaha yareeya, nasasho dheer qaata, ama ka fogaada qaybta ugu kulul ee maalinta. Dadka lugaynaya isla dhibaato ayay wajahaan. Socod 20 daqiiqo ah wuxuu noqdaa mid daal badan marka waddooyinku hoos yar yeeshaan oo meelo biyo la cabo aysan jirin.',
          'Asfaltku wuu jilicsan karaa, jeexjeexi karaa, qaabkiisana lumin karaa marka taraafikadu culus tahay. Dhaawaca waddada wuxuu kordhiyaa kharashka dayactirka oo gaabin karaa rakaab, cunto, shidaal, iyo badeecooyin kale. Waddo dhaawacan ama ciriiri ah waxay ka hor istaagi kartaa qof inuu shaqo gaadho, daahiso xaalad caafimaad degdeg ah, ama kor u qaaddo qiimaha suuqyada xaafadda.',
          'Isla magaalada waxay xilli kulayl daran arki kartaa, xilli kalena daad ka dib roob culus. Warbixinta Cimilada iyo Horumarka Dalka Soomaaliya waxay tilmaamaysaa cadaadiska kulaylka ee shaqaalaha iyo daadka kaaga dhaca kaabayaasha gaadiidka inay ka mid yihiin dariiqyada isbeddelka cimiladu dhaqaalaha qaran u dhaawici karo.',
        ],
      },
      {
        heading: 'Kharashka dhaqaale',
        paragraphs: [
          'Cawaaqibka dhaqaale ee hirka kulaylka inta badan lama arko. Darawal saacado yar buu shaqeeyaa. Iibiye wax yar buu iibiyaa sababtoo ah macaamiishu kulaylka way ka fogaadaan. Koox dhismo horay ayay u joogsataa. Qoys wax badan ayuu ku bixiyaa biyo, gaadiid, ama daaweyn.',
          'Qaabaynta Bangiga Adduunka waxay muujinaysaa in, xaalad cimilo qallalan oo kulul, cadaadiska kulaylka uu yareyn karo wax-soo-saarka shaqada qaran qiyaastii 4.5 boqolkiiba 2051–2060. Saamaynta la saadaaliyay way ka weyn tahay shaqada dibadda ee jidhka u baahan. Isla xaaladdaas ballaaran, isbeddelka cimiladu wuxuu yareyn karaa GDP-ga sanadlaha ah ee Soomaaliya in ka badan 13 boqolkiiba bartamaha qarniga. UNDP waxay sheegtaa in qiyaastii 70 boqolkiiba GDP-ga Soomaaliya laga soo saaro magaalooyinka. Marka kulaylku dhaqdhaqaaqa magaalada ka dhigo mid ga ghabeeya, khatar ah, ama qaali ah, wuxuu isla mar saameeyaa ganacsiyada, shaqaalaha, iyo macaamiisha.',
        ],
      },
      {
        heading: 'Xaaladda caafimaad ee waddada',
        paragraphs: [
          'Qiimeynta 2025 ee Nuglaanta iyo Awoodda Kulaylka iyo Caafimaadka ee Banaadir, Baay, Shabeellaha Dhexe, iyo Mudug waxay ogaatay in 98.6 boqolkiiba qoysaska la wareystay ay la kulmeen dhacdo kulayl daran sanadkii hore. Ku dhawaad 95 boqolkiiba shakhsiyaadka ayaa ka warbixiyay calaamado kulayl, oo ay ku jiraan madax-xanuun, daal, iyo xasaasiyad maqaar. Mid lixdii midka ah wuxuu awoodi waayay hawlaha caadiga ah. Khalkhal hurdo ayaa saameeyay in ka badan 96 boqolkiiba jawaab-bixiyeyaasha.',
          'Cudurada wadnaha ayaa saameeyay qiyaastii 20 boqolkiiba qoysaska la wareystay, 41.3 boqolkiiba bukaannada xaaladdaas qaba ayaa sheegay in calaamaduhu ay ka sii dareen cimilada kulul. Xarumaha la qiimeeyay, celceliska diyaargarowga adeegga kulaylka wuxuu ahaa 1.29 kaliya oo 5 ka mid ah. 5.9 boqolkiiba xarumaha ayaa lahaa qorsheyaal tallaabo kulayl. Banaadir, 82.1 boqolkiiba qoysaska la wareystay waxay sheegeen inaanay waligood helin digniinaha kulaylka.',
        ],
      },
      {
        heading: 'Waddo loo maro adkeysiga',
        paragraphs: [
          'Waddooyinka Muqdisho waa inaan loo arkin kaliya kaabayaal gaadiid. Waxay kaloo yihiin meelo caafimaad dadweyne iyo xadhkaha nolosha dhaqaale. Tallaabooyin wax ku ool ah waxaa ka mid ah geedo iyo marinno hoos leh; meelo biyo, nasasho, iyo xarumaha qaboojinta ee darawalada, iibiyeyaasha, iyo shaqaalaha dibadda; digniinaha kulaylka iyada oo loo marayo raadiyaha, taleefanka, shaqaalaha caafimaadka bulshada, iyo maamulka maxalliga ah; jadwalka saacadaha qabow ee shaqada dibadda ee culus; tilmaamaha laamiga ee yareeya dhaawaca kulaylka; bullaacado daadka qaadi kara; qaboojin iyo biyo xarumaha caafimaadka; iyo diiwaangelinta xanuunnada kulaylka nidaamyada macluumaadka caafimaadka.',
          'Mashruuc 2026 UNDP–GEF ayaa loo qorsheeyay inuu taageero qorsheynta magaalooyinka cimilada u adkaysata 17 magaalo Soomaaliyeed, oo ay ku jirto Muqdisho, iyadoo marinno cagaaran, bullaacado, iyo xalal dabiici ah loogu talo galay in lagu yareeyo cadaadiska kulaylka, daadka, iyo saamaynta abaarta.',
          'Maalin hirka kulaylka, waddadu waxay muujisaa nuglaanta magaalada. Waxay kaloo muujin kartaa jidka hore: Muqdisho qabow, nabad ah, halkaasoo dhaqdhaqaaq, shaqo, iyo caafimaad dadweyne si wadajir ah loo ilaaliyo.',
        ],
      },
    ],
  },
  'el-nino': {
    title: 'El Niño',
    kicker: 'Saamaynta Cimilada',
    sourceLabel: 'Xaaladda Cimilada Soomaaliya 2026',
    lede: 'El Niño-gii Soomaaliya 2023: markii roobku ku soo noqday daad. Ka dib sanooyin abaar, biyihii qoysasku u baahnaayeen waxay yimaadeen xoog aad u weyn oo burburiyay guryo, beeraha, iyo fursadda soo kabashada.',
    paragraphs: [
      'El Niño waa qaab cimilo oo la xiriira heerkulka dusha badda ee ka kulul celceliska ee Badweynta Baasifigga dhexe iyo bari. Geeska Afrika, saamayntiisu waxay gacan ka geysan kartaa roob kordhay. Marka Indian Ocean Dipole togan isla yimaado, roobabka Deyr aad bay u qoyan noqon karaan.',
      'Daadkii 2023 keliya dhacdo dabiici ah ma ahayn. Wuxuu noqday qas sababtoo ah dadku horay ayay ugu noolaayeen khayraad dhammaaday, nolosha dhaawacan, kaabayaal daciif ah, iyo adeegyo aasaasi ah oo xaddidan.',
    ],
    chapters: [
      {
        heading: 'Webigu magaalada galaa',
        paragraphs: [
          '9 Maajo 2023, Webiga Shabeelle wuxuu ka dillaacay xeebtiisa agagaarka Beledweyne ee Hiiraan. Biyuhu waxay galeen guryo, waddooyin, dugsiyo, iyo beeraha. Qoysaska horay sanooyin ugu jiray abaar mar kale waa lagu qasbay inay baxaan. Beledweyne iyo agagaarkeeda, qiyaastii 35,000 qoys iyo 210,000 qof ayaa barakacay. Shan qof ayaa dhintay, 81 dugsi ayaa dhaawacmay, in ka badan 25,200 caruur ah ayaa saameysay. Qiyaastii 3,272 hektar oo beer ah ayaa qoyay, in ka badan 3,400 xoolo ayaa dhintay.',
          '6 Juun, daadadku waxay saameeyeen ugu yaraan 468,000 qof Soomaaliya oo dhan, qiyaastii 247,000na way barakaceen. Beledweyne, 97 boqolkiiba hantida biyaha, oo ay ku jiraan ceelal iyo bambooyin, way wasakhoobeen ama dhaawacmeen. Biyo istaagay ayaa ka hadhay ka dib markii daadku bilaabay inuu hoos u dhaco, taasoo ka hor istaagtay in qoysas badan soo noqdaan oo kordhisay khatarta cudurrada biyaha. Beelo badan, su’aashu hadda ma ahayn in biyo imanayaan iyo in kale. Su’aashu waxay ahayd in biyuhu fudayd keeni doonaan mise burbur.',
        ],
      },
      {
        heading: 'Daad hal qarni mar dhaca',
        paragraphs: [
          'Soomaaliya waxay 2023 gashay ka dib mid ka mid ah abaarihii ugu daran taariikhdeeda casriga ah. Intii u dhaxaysay 2020 iyo 2023 dalku wuxuu la kulmay abaartiisii ugu dheerayd diiwaanka dhowaan. Xoola-dhaqatadu waxay 2022 lumeen in ka badan 3.8 milyan xoolo. Roob aad ayaa loogu baahnaa.',
          'Luulyo 2023, FAO waxay ka digtay in El Niño, oo ay weheliso Indian Ocean Dipole togan, ay keeni karto roob Deyr ka sarreeya celceliska. Ilaa 1.2 milyan oo qof ayaa saameysan kara, qiyaastii 1.5 milyan hektar oo ku teedsan Jubba iyo Shabeelle ayaa khatar sare ku jiray. Beeluhu waxay u baahdeen digniino hore oo afafka maxalliga ah, sahay la raro ka hor intaan waddooyinku xirmin, iyo qorsheyaal daad-gureed ee degsiimooyinka xeebta webiga.',
          'Laga bilaabo Oktoobar 2023 roobkii la saadaaliyay wuu xoogaystay. Roob culus ayaa ku da’ay Soomaaliya oo dhan, halka roobka buuraha Itoobiya uu kordhiyay qulqulka Jubba iyo Shabeelle. FAO-SWALIM waxay diiwaangelisay 1,152 milimitir oo roob xilliyeed ah Baydhabo, kan ugu sarreeya saldhigyadeeda. 9 Noofambar, Qaramada Midoobay waxay ka digtay daad hal qarni mar dhaca.',
          '24 Diseembar, OCHA waxay ku qiyaastay 2.48 milyan oo qof oo saameysan, 1.2 milyan barakacay, qiyaastii 118 dhimasho, iyo 224 dugsi oo dhaawacmay. Bangiga Adduunka wuxuu diiwaangeliyay ku dhawaad 2.5 milyan oo qof oo saameysan, 41,000 hektar oo qoyay, qiyaastii 4,700 qoys oo burburay, iyo khalkhal weyn oo waddooyin iyo garoomo diyaaradeed. FAO waxay sheegtay in roobabka Deyr ay qariyeen in ka badan 1.5 milyan hektar oo beer ah.',
        ],
      },
      {
        heading: 'Waddan u dhexeeya abaar iyo daad',
        paragraphs: [
          'Khibradda Soomaaliya 2023 looma fahmi karo sheeko ku saabsan roob aad u badan keliya. Dalku wuxuu ka soo gudbay abaar dheer una gudbay daad burburinaya isla sanadkaas. Gobollada ugu daran waxaa ka mid ahaa Banaadir, Baay, Shabeellaha Hoose, Jubbada Hoose, iyo Shabeellaha Dhexe.',
          'Hase yeeshee roobku meelo wuxuu ku buuxiyay biyaha dhulka hoostiisa. Xoola-dhaqatadu waxay heleen fudayd ka timid abaarta, qiimaha cuntaduna mar dambe wuu yaraaday markii waddooyinku furmeen. Tani waa khilaafka udub-dhexaadka sheekada cimilada Soomaaliya: isla roobka guriga burburiya ayaa ceel beesha buuxin kara. Roobku si toos ah barako ama masiibo ma aha. Saamayntiisu waxay ku xiran tahay waqtiga, xoogga, diyaargarowga, iyo kaabayaasha.',
        ],
      },
      {
        heading: 'Waxa Soomaaliya ka baran karto 2023',
        paragraphs: [
          'FAO waxay ka digniiseen El Niño bilo ka hor daadadkii ugu xumaa. Digniin aan tallaabo kicin waa macluumaad keliya. Digniin hore waa inay ku xidhnaataa maalgelin horay loo heshiiyay, daad-gureed, hoy, kayd cunto, iyo kooxaha jawaabta maxalliga ah.',
          'Adkeysiga daadka waa in lagu dhisaa magaalooyinka, halkaasoo dad badan oo barakacay ku nool yihiin xeryo daad u nugul. Ilaalinta nolosha waxay u muhiim tahay sida gargaarka degdegga ah: FAO waxay ku qiyaastay in dolarka kasta ee loo galay ilaalinta nolosha miyiga uu badbaadin karo qiyaastii $10 gargaar cunto haddii qoysku barakaco. Maamulka biyuhuna waa inuu xudduudaha ka gudbaa, sababtoo ah roobka buuraha Itoobiya ayaa quudiya Jubba iyo Shabeelle.',
          'Casharka El Niño 2023 ma aha in Soomaaliya roob aad u badan heshay. Casharka qoto dheer waa in roobku yimid waddan aan weli ka soo kaban abaar, oo aan lahayn ilaalin ku filan ka dhanka daadadka. Xilliga roobaad ee xiga wuu iman doonaa. Su’aasha muhiimka ah waa in Soomaaliya si ka wanaagsan isu diyaarin doonto markuu yimaado.',
        ],
      },
    ],
  },
  'la-nina': {
    title: 'La Niña',
    kicker: 'Saamaynta Cimilada',
    sourceLabel: 'Xaaladda Cimilada Soomaaliya 2026',
    lede: 'La Niña waa dhinaca kale ee lulidda cimilada Baasifigga. Soomaaliya waxay inta badan ka dhigan tahay roobab Deyr oo qallalan, ciid kulul, ceelal madhan, iyo abaar ka socota daaqsimeedka una gudubta Muqdisho.',
    paragraphs: [
      'La Niña waa qaab cimilo oo la xiriira heerkulka dusha badda ee ka qabow celceliska ee Badweynta Baasifigga dhexe iyo bari — ka soo horjeedka El Niño. Qaybo ka mid ah Bariga Afrika, oo ay ku jirto Soomaaliya, waxay gacan ka geysan kartaa xaalad ka qallalan caadiga, gaar ahaan xilliga Deyr Oktoobar ilaa Diseembar.',
      'Indian Ocean Dipole sidoo kale wuxuu saameeyaa sida qoyaanku ugu dhaqaaqo gobolka. FEWS NET waxay tilmaamtay saadaasha La Niña iyo Indian Ocean Dipole taban inay ka mid yihiin sababaha rajooyinka roob Deyr ka hooseeya celceliska 2025. Dariiqyadan cimiladu waxay dejiyaan xaaladda. Dhibaatada oo dhan ma sharxaan. Darnimada ugu dambeysa waxaa qaabeeya xumaan dhul, colaad, faqriga, iyo gargaar soo daahay.',
    ],
    chapters: [
      {
        heading: 'Marka Baasifiggu qabowdo, roobabka Soomaaliya way fashilmi karaan',
        paragraphs: [
          'Soomaaliya dabiici ahaan waa dhul qallalan ilaa mid-qallalan. Roobku aad buu u kala duwan yahay. Isbeddelka cimiladu wuxuu cadaadiska kordhiyaa isagoo abaarta ka dhigaya mid kulul, dedejiya uumi-baxa, yareyna waqtiga dhulka, dalagyada, iyo daaqsigu u heli karaan inay soo kabtaan. Marka La Niña timaado, cadaadiskaas wuu adkaan karaa: qoyaan yar, dhul adag, iyo daaqad soo kabasho oo gaaban ka dib roob kasta oo da’a.',
          'Nidaamka FAO ee Macluumaadka Biyaha iyo Dhulka Soomaaliyeed wuxuu isku daraa roob iyo heerkul Tusmada Abaarta Isku-dhafan. Abaar keliya ma aha roob la’aan; heerkulka sare wuxuu kordhiyaa luminta qoyaanka ciidda, dalagyada, daaqa, iyo ilaha biyaha.',
        ],
      },
      {
        heading: 'Fashilka Deyr 2025',
        paragraphs: [
          'Roobabkii Deyr 2025, kuwaas oo caadi ahaan la filayo Oktoobar ilaa Diseembar, meelo badan si gebi ahaan ah ayay u fashilmeen. FAO waxay Janaayo 2026 sheegtay in abaartu sii xoogaysanayso oo ay la mid noqon karto 2011, 2017, iyo 2022. Qiyaastii 70 ilaa 85 boqolkiiba dhulka dalagga ee meelaha ugu muhiimsan ayaa ku jiray abaar daran. Wax-soo-saarka hadhuudhka Deyr waxaa lagu qiyaasay ilaa 15,600 tan, kan ugu hooseeya taariikhda diiwaanka, oo qiyaastii 75 boqolkiiba ka hooseeya celceliska hore ee shanta sano.',
          'Goosashadii Gu 2025 meelo dhexe iyo koonfur aad bay u fiicnayd. Deyr fashilmay ka dib ayaa tirtiray soo kabashadaas, dhaawacay xaaladda xoolaha, korna u qaaday qiimaha cuntada. Qiimaha masagada Muqdisho wuxuu 25 boqolkiiba kacay Noofambar 2025 ilaa Janaayo 2026, halka galleydu 45 boqolkiiba kacday.',
        ],
      },
      {
        heading: 'Laga soo bilaabo dariiqa cimilada ilaa xaalad bini-aadamnimo',
        paragraphs: [
          'Ku dhawaad 6.5 milyan oo Soomaali ah ayaa wajahay gaajo heer sare ah xaaladdan abaareed. Daraasad wadajir ah oo Wasaaradda Caafimaadka, UNICEF, iyo WHO sameeyeen ayaa ku qiyaastay 71,100 dhimasho dheeraad ah oo abaar la xiriirta Janaayo 2022 ilaa Juun 2024, qiyaastii 40 boqolkiibana waa caruur yaryar.',
          'Marka dhirta baaba’do, ciiddu waxay u furan tahay dabaysha iyo kulaylka. Roobka, markuu ugu dambeyn yimaado, wuxuu ku ordi karaa dhul adag halkii uu ka nuugi lahaa. Sidaas ayay La Niña-la xiriirta qallalxumadu uga noqotaa abaar beer, ka dib abaar biyo, ka dibna qas suuq iyo barakac Muqdisho.',
        ],
      },
      {
        heading: 'Tallaabo ka hor intaan roobabku fashilmin',
        paragraphs: [
          'La Niña lama joojin karo, laakiin cawaaqibkeeda ugu xun waa la yareyn karaa iyadoo laga gudbo jawaab degdeg ah oo daahday una gudbo tallaabo hore oo la saadaalin karo: ururinta biyaha, kormeerka biyaha dhulka hoostiisa, dalagyada abaarta u adkaysta, caafimaadka xoolaha, kayd caws, soo celinta daaqsimeedka, iyo lacag ka hor intaan qoysasku xoolahooda ugu dambeeya iibin. Digniinaha hore waa inay ku gaadhaan bulshooyinka afafka Soomaaliga.',
          'Mustaqbalka cimilada Soomaaliya keliya abaar ma aha, keliya daadna ma aha. El Niño roobka wuxuu ku soo celin karaa daad ahaan. La Niña roobka way celin kartaa ilaa ceelasha, daaqa, iyo goosashadu fashilmaan. Diyaargarowgu waa in la fiiriyo labada dhinac ee lulidda Baasifigga — lana dhaqaaqo ka hor intaan midkood masiibo noqon.',
        ],
      },
    ],
  },
};
