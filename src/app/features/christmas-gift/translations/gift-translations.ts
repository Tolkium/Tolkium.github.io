// Christmas Gift Page Translations
// Hardcoded EN/SK translations for the gift page

export type Language = 'en' | 'sk';

export interface GiftTranslations {
  // Page header
  pageTitle: string;
  pageSubtitle: string;
  
  // GPU section
  gpuSubtitle: string;
  assemblyProgress: string;
  remaining: string;
  
  // HUD overlay
  hudVram: string;
  hudDlss: string;
  hudTensor: string;
  hudPerf: string;
  hudDlss4: string;
  hudRayTracing: string;
  hudWindforce: string;
  hudSffReady: string;
  
  // Donation button
  donationButtonText: string;
  donationButtonHover: string;
  
  // Disclaimer
  disclaimerTitle: string;
  disclaimerText: string;
  
  // Stats cards
  statsGrowth: string;
  statsTotalDonors: string;
  statsActiveContributors: string;
  statsEarnings: string;
  statsRaisedSoFar: string;
  statsStatus: string;
  statsPurchased: string;
  
  // Charts
  donationActivity: string;
  contributors: string;
  total: string;
  goalVelocity: string;
  perDayAverage: string;
  growthTrend: string;
  ahead: string;
  velocityTrend: string;
  behind: string;
  
  // Milestones
  milestoneAchievements: string;
  milestone: string;
  progress: string;
  noMilestonesAchieved: string;
  recentMilestones: string;
  noMilestonesCompleted: string;
  
  // Modal
  modalTitle: string;
  modalDescription: string;
  modalName: string;
  modalIban: string;
  modalBicSwift: string;
  modalCopy: string;
  modalThankYou: string;
  
  // Translation button
  translateButton: string;
  
  // By Me indicator
  byMe: string;
  byOthers: string;
  selfFunded: string;
  
  // Thank You card
  thankYouTitle: string;
  people: string;
  
  // Top Contributor
  topContributor: string;
  
  // Friendly Disclaimer
  friendlyDisclaimerTitle: string;
  friendlyDisclaimerText: string;
  
  // Text alternatives (rotating subtitle)
  textAlternatives: string[];
}

export const TRANSLATIONS: Record<Language, GiftTranslations> = {
  en: {
    // Page header
    pageTitle: 'Operation Christmas Gift',
    pageSubtitle: 'If you were thinking of getting me a gift, here\'s what I\'d love instead',
    
    // GPU section
    gpuSubtitle: 'WINDFORCE OC 16G • Blackwell Architecture',
    assemblyProgress: 'Donation Assembly Progress',
    remaining: 'remaining',
    
    // HUD overlay
    hudVram: 'VRAM',
    hudDlss: 'DLSS',
    hudTensor: 'Tensor',
    hudPerf: 'Perf',
    hudDlss4: '⚡ DLSS 4',
    hudRayTracing: '🎮 Ray Tracing',
    hudWindforce: '❄️ WINDFORCE',
    hudSffReady: '🔧 SFF Ready',
    
    // Donation button
    donationButtonText: 'Still want to help? 💝',
    donationButtonHover: 'Every contribution counts! Thank you!',
    
    // Disclaimer
    disclaimerTitle: 'Goal Complete!',
    disclaimerText: 'The GPU has been purchased! Thank you to everyone who contributed. I\'ve covered the remaining amount myself. There\'s also a financing option available that could help ease the cost—if you\'d still like to participate and help out, contributions are still welcome! 🎮',
    
    // Stats cards
    statsGrowth: 'Your Growth',
    statsTotalDonors: 'Total Donors',
    statsActiveContributors: 'Active contributors',
    statsEarnings: 'Earnings',
    statsRaisedSoFar: 'Raised so far',
    statsStatus: 'Status',
    statsPurchased: 'Purchased 20.12.25',
    
    // Charts
    donationActivity: 'Donation Activity',
    contributors: 'Contributors',
    total: 'Total',
    goalVelocity: 'Goal Velocity',
    perDayAverage: 'per day average',
    growthTrend: 'Growth Trend',
    ahead: 'Ahead',
    velocityTrend: 'Velocity Trend',
    behind: 'Behind',
    
    // Milestones
    milestoneAchievements: 'Milestone Achievements',
    milestone: 'Milestone',
    progress: 'Progress',
    noMilestonesAchieved: 'No milestones achieved yet',
    recentMilestones: 'Recent Milestones',
    noMilestonesCompleted: 'No milestones completed yet',
    
    // Modal
    modalTitle: 'System Update Initiated...',
    modalDescription: 'Automatic payment implementation in progress.',
    modalName: 'Name:',
    modalIban: 'IBAN:',
    modalBicSwift: 'BIC/SWIFT:',
    modalCopy: 'Copy',
    modalThankYou: 'Thank you for your contribution! Every donation brings us closer to the ultimate gaming setup.',
    
    // Translation button
    translateButton: 'SK',
    
    // By Me indicator
    byMe: 'By Me',
    byOthers: 'by others',
    selfFunded: 'self-funded',
    
    // Thank You card
    thankYouTitle: 'Thank You!',
    people: 'people',
    
    // Top Contributor
    topContributor: 'Top Contributor',
    
    // Friendly Disclaimer
    friendlyDisclaimerTitle: 'Friendly Disclaimer',
    friendlyDisclaimerText: 'This is a voluntary contribution, not a charity. I\'m planning to buy this GPU anyway (electronics prices are estimated to increase significantly in Q1 and Q2 2026), and I\'ll be contributing a larger portion myself. This is just a fun way to share the gift with friends & family. No pressure! 🎮',
    
    // Text alternatives
    textAlternatives: [
      'If you were thinking of getting me a gift, here\'s what I\'d love instead',
      'If you were considering a gift, I\'ve found the perfect one',
      'Looking for a gift idea? I\'ve got you covered',
      'Skip the guesswork—here\'s my gift wish list',
      'Should you be considering a gift, I have a suggestion',
      'If you were planning to surprise me, surprise—I found it first'
    ]
  },
  sk: {
    // Page header
    pageTitle: 'Operácia Vianočný Darček',
    pageSubtitle: 'Ak ste rozmýšľali o darčeku pre mňa, tu je čo by som namiesto toho rád',
    
    // GPU section
    gpuSubtitle: 'WINDFORCE OC 16G • Blackwell Architektúra',
    assemblyProgress: 'Postup zbierky darov',
    remaining: 'zostáva',
    
    // HUD overlay
    hudVram: 'VRAM',
    hudDlss: 'DLSS',
    hudTensor: 'Tensor',
    hudPerf: 'Výkon',
    hudDlss4: '⚡ DLSS 4',
    hudRayTracing: '🎮 Ray Tracing',
    hudWindforce: '❄️ WINDFORCE',
    hudSffReady: '🔧 SFF Ready',
    
    // Donation button
    donationButtonText: 'Stále chcete pomôcť? 💝',
    donationButtonHover: 'Každý príspevok sa počíta! Ďakujem!',
    
    // Disclaimer
    disclaimerTitle: 'Cieľ splnený!',
    disclaimerText: 'GPU bola zakúpená! Ďakujem všetkým, ktorí prispeli. Zvyšnú sumu som doplatil sám. Je tu aj možnosť financovania, ktorá by mohla pomôcť znížiť náklady—ak by ste stále chceli prispieť a pomôcť, príspevky sú stále vítané! 🎮',
    
    // Stats cards
    statsGrowth: 'Váš rast',
    statsTotalDonors: 'Celkom darcov',
    statsActiveContributors: 'Aktívni prispievatelia',
    statsEarnings: 'Výnosy',
    statsRaisedSoFar: 'Vyzbierané doteraz',
    statsStatus: 'Stav',
    statsPurchased: 'Zakúpené 20.12.25',
    
    // Charts
    donationActivity: 'Aktivita darov',
    contributors: 'Prispievatelia',
    total: 'Celkom',
    goalVelocity: 'Rýchlosť cieľa',
    perDayAverage: 'priemer za deň',
    growthTrend: 'Trend rastu',
    ahead: 'Vpredu',
    velocityTrend: 'Trend rýchlosti',
    behind: 'Vzadu',
    
    // Milestones
    milestoneAchievements: 'Dosiahnuté míľniky',
    milestone: 'Míľnik',
    progress: 'Postup',
    noMilestonesAchieved: 'Zatiaľ žiadne dosiahnuté míľniky',
    recentMilestones: 'Nedávne míľniky',
    noMilestonesCompleted: 'Zatiaľ žiadne dokončené míľniky',
    
    // Modal
    modalTitle: 'Aktualizácia systému spustená...',
    modalDescription: 'Automatická implementácia platby prebieha.',
    modalName: 'Meno:',
    modalIban: 'IBAN:',
    modalBicSwift: 'BIC/SWIFT:',
    modalCopy: 'Kopírovať',
    modalThankYou: 'Ďakujem za váš príspevok! Každý dar nás približuje k ultimátnemu hernému zostaveniu.',
    
    // Translation button
    translateButton: 'EN',
    
    // By Me indicator
    byMe: 'Mnou',
    byOthers: 'od ostatných',
    selfFunded: 'samofinancované',
    
    // Thank You card
    thankYouTitle: 'Ďakujem!',
    people: 'ľudí',
    
    // Top Contributor
    topContributor: 'Top Prispievateľ',
    
    // Friendly Disclaimer
    friendlyDisclaimerTitle: 'Priateľské upozornenie',
    friendlyDisclaimerText: 'Toto je dobrovoľný príspevok, nie charita. GPU plánujem kúpiť aj tak (ceny elektroniky by mali výrazne stúpnuť v Q1 a Q2 2026) a väčšiu časť prispiem sám. Je to len zábavný spôsob, ako zdieľať darček s priateľmi a rodinou. Bez tlaku! 🎮',
    
    // Text alternatives
    textAlternatives: [
      'Ak ste rozmýšľali o darčeku pre mňa, tu je čo by som namiesto toho rád',
      'Ak ste zvažovali darček, našiel som ten perfektný',
      'Hľadáte nápad na darček? Mám pre vás riešenie',
      'Preskočte hádanie—tu je môj zoznam prianí',
      'Ak by ste zvažovali darček, mám návrh',
      'Ak ste ma chceli prekvapiť, prekvapenie—našiel som to prvý'
    ]
  }
};

// Helper function to get translation
export function getTranslation(lang: Language): GiftTranslations {
  return TRANSLATIONS[lang];
}

