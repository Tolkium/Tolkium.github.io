export type Language = 'en' | 'sk';

export interface NorbertGiftTranslations {
  pageTitle: string;
  pageSubtitle: string;
  overallProgress: string;
  totalRaised: string;
  remaining: string;
  totalGoal: string;
  giftItems: string;
  expandGift: string;
  collapseGift: string;
  description: string;
  specs: string;
  contributors: string;
  total: string;
  raised: string;
  of: string;
  donateToThis: string;
  statsGrowth: string;
  statsEarnings: string;
  statsTotalContributors: string;
  statsGifts: string;
  thankYouTitle: string;
  people: string;
  topContributor: string;
  modalTitle: string;
  modalDescription: string;
  modalName: string;
  modalIban: string;
  modalBicSwift: string;
  modalCopy: string;
  modalThankYou: string;
  translateButton: string;
  byMe: string;
  byOthers: string;
  selfFunded: string;
  friendlyDisclaimerTitle: string;
  friendlyDisclaimerText: string;
  textAlternatives: string[];
  noContributors: string;
  beFirst: string;
  giftProgress: string;
}

export const TRANSLATIONS: Record<Language, NorbertGiftTranslations> = {
  en: {
    pageTitle: "🎸 Norbert's Wishlist",
    pageSubtitle: 'A few things Dad would love',
    overallProgress: 'Overall Wishlist Progress',
    totalRaised: 'Total Raised',
    remaining: 'remaining',
    totalGoal: 'Total Goal',
    giftItems: 'Gift Items',
    expandGift: 'Show details',
    collapseGift: 'Hide details',
    description: 'Description',
    specs: 'Specifications',
    contributors: 'Contributors',
    total: 'Total',
    raised: 'Raised',
    of: 'of',
    donateToThis: 'Contribute to this gift',
    statsGrowth: 'Overall Growth',
    statsEarnings: 'Raised',
    statsTotalContributors: 'Contributors',
    statsGifts: 'Gifts',
    thankYouTitle: 'Thank You!',
    people: 'people',
    topContributor: 'Top Contributor',
    modalTitle: 'Contribute to Norbert\'s Wishlist',
    modalDescription: 'Your contribution helps make these gifts happen! Every amount counts — thank you for being part of this.',
    modalName: 'Account Holder:',
    modalIban: 'IBAN:',
    modalBicSwift: 'BIC/SWIFT:',
    modalCopy: 'Copy',
    modalThankYou: 'Thank you for your generosity! Every contribution brings us closer to surprising Dad with his gifts.',
    translateButton: 'SK',
    byMe: 'By Me',
    byOthers: 'by others',
    selfFunded: 'self-funded',
    friendlyDisclaimerTitle: 'Friendly Disclaimer',
    friendlyDisclaimerText: 'This is a voluntary contribution, not an obligation. I\'m covering a portion myself — this is just a fun way to share the gift ideas with family & friends. No pressure! 🎸',
    textAlternatives: [
      'If you were thinking of a gift for Dad, here\'s what he\'d love',
      'Looking for a gift idea for Norbert? I\'ve got you covered',
      'Skip the guesswork — here\'s Dad\'s wishlist',
      'Should you be considering a gift, I have a few suggestions',
      'A few things that would make Dad\'s year',
      'The ultimate guitar gift collection for Norbert'
    ],
    noContributors: 'No contributions yet',
    beFirst: 'Be the first to contribute!',
    giftProgress: 'Gift Progress',
  },
  sk: {
    pageTitle: "🎸 Norbertov Wishlist",
    pageSubtitle: 'Pár vecí, ktoré by otec rád dostal',
    overallProgress: 'Celkový postup zoznamu',
    totalRaised: 'Celkovo vyzbierané',
    remaining: 'zostáva',
    totalGoal: 'Celkový cieľ',
    giftItems: 'Darčeky',
    expandGift: 'Zobraziť detaily',
    collapseGift: 'Skryť detaily',
    description: 'Popis',
    specs: 'Parametre',
    contributors: 'Prispievatelia',
    total: 'Celkom',
    raised: 'Vyzbierané',
    of: 'z',
    donateToThis: 'Prispieť na tento darček',
    statsGrowth: 'Celkový rast',
    statsEarnings: 'Vyzbierané',
    statsTotalContributors: 'Prispievatelia',
    statsGifts: 'Darčeky',
    thankYouTitle: 'Ďakujeme!',
    people: 'ľudí',
    topContributor: 'Top Prispievateľ',
    modalTitle: 'Prispejte na Norbertov zoznam',
    modalDescription: 'Váš príspevok pomôže splniť tieto darčeky! Každá suma sa počíta — ďakujeme, že ste toho súčasťou.',
    modalName: 'Majiteľ účtu:',
    modalIban: 'IBAN:',
    modalBicSwift: 'BIC/SWIFT:',
    modalCopy: 'Kopírovať',
    modalThankYou: 'Ďakujeme za vašu štedrosť! Každý príspevok nás približuje k prekvapeniu ocovej s jeho darčekmi.',
    translateButton: 'EN',
    byMe: 'Mnou',
    byOthers: 'od ostatných',
    selfFunded: 'samofinancované',
    friendlyDisclaimerTitle: 'Priateľské upozornenie',
    friendlyDisclaimerText: 'Toto je dobrovoľný príspevok, nie povinnosť. Časť sumy hradím sám — je to len zábavný spôsob, ako zdieľať nápady na darčeky s rodinou a priateľmi. Bez tlaku! 🎸',
    textAlternatives: [
      'Ak rozmýšľate nad darčekom pre otca, tu je čo by rád',
      'Hľadáte nápad na darček pre Norberta? Mám to pre vás',
      'Preskočte hádanie — tu je otcov zoznam prianí',
      'Ak by ste zvažovali darček, mám pár návrhov',
      'Pár vecí, ktoré by otcovi urobili rok',
      'Ultimátna gitárová kolekcia pre Norberta'
    ],
    noContributors: 'Zatiaľ žiadne príspevky',
    beFirst: 'Buďte prvý, kto prispeje!',
    giftProgress: 'Postup darčeka',
  }
};
