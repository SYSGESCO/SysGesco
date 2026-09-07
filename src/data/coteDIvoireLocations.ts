/**
 * SysGesco - Référentiel Géographique National de Côte d'Ivoire
 * Villes, Communes et Quartiers pour la localisation et l'affectation des établissements scolaires
 */

export interface CommuneInfo {
  name: string;
  quartiers: string[];
}

export interface CityInfo {
  name: string;
  region: string;
  communes: CommuneInfo[];
}

export const COTE_D_IVOIRE_LOCATIONS: CityInfo[] = [
  {
    name: 'Abidjan',
    region: "District Autonome d'Abidjan",
    communes: [
      {
        name: 'Cocody',
        quartiers: [
          'Deux-Plateaux',
          'Angré (7e, 8e, 9e Tranche)',
          'Angré Château',
          'Riviera 2',
          'Riviera 3',
          'Riviera 4',
          'Riviera Palmeraie',
          'Riviera Bonoumin',
          'Riviera Golf',
          'Riviera Faya',
          'Blockhauss',
          "M'Pouto",
          'Danga',
          'Ambassades',
          'Bessikoi',
          'Abatta',
        ],
      },
      {
        name: 'Yopougon',
        quartiers: [
          'Niangon Nord',
          'Niangon Sud',
          'Maroc',
          'Toit Rouge',
          'Sideci',
          'Selmer',
          'Sogefiha',
          'Siporex',
          'Port-Bouët 2',
          'Kouté',
          'Andokoi',
          'Millionnaire',
          'Gesco',
          'Académie',
          'Bel Air',
          'Santé',
        ],
      },
      {
        name: 'Plateau',
        quartiers: [
          'Centre des Affaires',
          'Cité Administrative',
          'Rue du Commerce',
          'Avenue Chardy',
          'Camp Gallieni',
          'Pyramide',
          'Indénié',
        ],
      },
      {
        name: 'Abobo',
        quartiers: [
          'PK 18',
          'Anador',
          'Avocatier',
          'Belle Ville',
          'Samaké',
          'Abobo Baoulé',
          'Banco',
          'Clouetcha',
          'Dokui',
          'Sagbé',
          'Kennedy',
          "N'Dotré",
          'Akeikoi',
          'Bocabo',
        ],
      },
      {
        name: 'Marcory',
        quartiers: [
          'Zone 4C',
          'Biétry',
          'Marcory Résidentiel',
          'Hibiscus',
          'Champroux',
          'Anoumabo',
          'Aliodan',
          'Sicogi',
          'Konankro',
        ],
      },
      {
        name: 'Koumassi',
        quartiers: [
          'Remblais',
          'Prodomo',
          'Koumassi 05',
          'Campement',
          'Grand Campement',
          'Divo',
          'Fanny',
          'Sopim',
          'Acal',
          'Soweto',
        ],
      },
      {
        name: 'Treichville',
        quartiers: [
          'Avenue 8',
          'Arras',
          'Belleville',
          'Biafra',
          'Zone Portuaire',
          'Zone 1',
          'Zone 2',
          'Solibra',
          'France-Amérique',
          'Entrepôts',
        ],
      },
      {
        name: 'Port-Bouët',
        quartiers: [
          'Vridi',
          'Gonzagueville',
          'Jean Folly',
          'Adjouffou',
          'Derrière Wharf',
          'Phare',
          'Aéroport',
          'Anani',
          'Abouabou',
        ],
      },
      {
        name: 'Adjamé',
        quartiers: [
          '220 Logements',
          'Mirador',
          'Liberté',
          'Bromakoté',
          'Dallas',
          'Bracodi',
          'Williamsville',
          'Paillet',
          'Agban',
          'Renault',
        ],
      },
      {
        name: 'Attécoubé',
        quartiers: [
          'Locodjro',
          'Santé 3',
          'Jérusalem',
          'Boribana',
          'Jean-Paul 2',
          'Agban-Attié',
          'Sebroko',
          'Bidjante',
        ],
      },
      {
        name: 'Bingerville',
        quartiers: [
          'Centre-Ville',
          'Blanchon',
          'Gbagba',
          'Akandjé',
          'Feh Kessé',
          'Savane',
          'Adjamé-Bingerville',
          'Marina',
        ],
      },
      {
        name: 'Anyama',
        quartiers: [
          'Zossonkoi',
          'Belle-ville',
          'Schneider',
          'Christiankoi',
          'Grand-Moutcho',
          'Akeikoi-Anyama',
          'Gare',
        ],
      },
      {
        name: 'Songon',
        quartiers: [
          'Songon Agban',
          'Songon Dagbé',
          'Songon Kassemblé',
          'Bimbresso',
          'Abiaté 1',
          'Abiaté 2',
        ],
      },
    ],
  },
  {
    name: 'Bouaké',
    region: 'Gbêkê',
    communes: [
      {
        name: 'Bouaké Commune',
        quartiers: [
          'Commerce',
          'Nimbo',
          'Koko',
          'Ahougnanssou',
          'Dar-es-Salam',
          'Belleville',
          'Broukro',
          'Air France 1',
          'Air France 2',
          'Kennedy',
          "N'Gattakro",
          'Zone Industrielle',
          'Sokoura',
          'Olierkro',
        ],
      },
    ],
  },
  {
    name: 'Yamoussoukro',
    region: 'District Autonome de Yamoussoukro',
    communes: [
      {
        name: 'Yamoussoukro Commune',
        quartiers: [
          '200 Logements',
          'Habitat',
          'Morofé',
          'Assabou',
          "N'Gokro",
          'Dioulakro',
          'Kokrenou',
          'Sopim',
          'Résidentiel',
          'Millionnaire',
          'Fondations',
          'Logbakro',
        ],
      },
    ],
  },
  {
    name: 'San-Pédro',
    region: 'San-Pédro',
    communes: [
      {
        name: 'San-Pédro Commune',
        quartiers: [
          'Cité',
          'Bardot 1',
          'Bardot 2',
          'Balmer',
          'Lac',
          'Sewéké',
          'Zone Portuaire',
          'Sonouko',
          'Nitoro',
          'Poro',
          'Bardo Extension',
        ],
      },
    ],
  },
  {
    name: 'Korhogo',
    region: 'Poro',
    communes: [
      {
        name: 'Korhogo Commune',
        quartiers: [
          'Koko',
          'Sinistré',
          'Haoussabougou',
          'Petit Paris',
          'Soba',
          'Téguéré',
          'Logokaha',
          'Ahoussabougou',
          'Belleville',
          'Koko Extension',
          'Nangbékaha',
        ],
      },
    ],
  },
  {
    name: 'Daloa',
    region: 'Haut-Sassandra',
    communes: [
      {
        name: 'Daloa Commune',
        quartiers: [
          'Tazibouo',
          'Lobia',
          'Marais',
          'Kennedy',
          'Gbeuliville',
          'Soleil',
          'Abattoir',
          'Orly',
          'Garage',
          'Tagoura',
        ],
      },
    ],
  },
  {
    name: 'Man',
    region: 'Tonkpi',
    communes: [
      {
        name: 'Man Commune',
        quartiers: [
          'Grand Gbapleu',
          'Domoraud',
          'Sari',
          'Libreville',
          'Doyagouiné',
          'Kôkô',
          'Lycée',
          'Blokhaus',
          'Camp Militaire',
        ],
      },
    ],
  },
  {
    name: 'Gagnoa',
    region: 'Gôh',
    communes: [
      {
        name: 'Gagnoa Commune',
        quartiers: [
          'Babré',
          'Dioulabougou',
          'Soleil',
          'Garahio',
          'Zapopa',
          'Barouhio',
          'Gnahio',
          'Rond-Point',
        ],
      },
    ],
  },
  {
    name: 'Grand-Bassam',
    region: 'Sud-Comoé',
    communes: [
      {
        name: 'Grand-Bassam Commune',
        quartiers: [
          'Quartier France (Patrimoine)',
          'Nouveau Bassam',
          'Moossou',
          'Impérial',
          'Rosiers',
          'Azuretti',
          'Phare',
          'Modeste',
          'Cafop',
        ],
      },
    ],
  },
  {
    name: 'Divo',
    region: 'Lôh-Djiboua',
    communes: [
      {
        name: 'Divo Commune',
        quartiers: [
          'Bada',
          'Boudoukou',
          'Konankro',
          'Dialogue',
          'Libreville',
          'Grémian',
          'Dougako',
          'Gnanmangui',
        ],
      },
    ],
  },
  {
    name: 'Soubré',
    region: 'Nawa',
    communes: [
      {
        name: 'Soubré Commune',
        quartiers: [
          'Campement',
          'Résidentiel',
          'Nabouhi',
          'Kpehiri',
          'Gabaguhé',
          'Madinani',
          'Gbaléguhé',
        ],
      },
    ],
  },
  {
    name: 'Agboville',
    region: 'Agnéby-Tiassa',
    communes: [
      {
        name: 'Agboville Commune',
        quartiers: [
          'Artisanal',
          'Commerce',
          'Samaké',
          'Sokoura',
          'La Paix',
          'Château',
          'Ery-Makouguié',
          'Gare',
        ],
      },
    ],
  },
  {
    name: 'Abengourou',
    region: 'Indénié-Djuablin',
    communes: [
      {
        name: 'Abengourou Commune',
        quartiers: [
          'Cafop',
          'Plateau',
          'Agnikro',
          'Indénié',
          'Adaou',
          'Relais',
          'Kirifi',
          'Château d’eau',
        ],
      },
    ],
  },
  {
    name: 'Bondoukou',
    region: 'Gontougo',
    communes: [
      {
        name: 'Bondoukou Commune',
        quartiers: [
          'Zanzan',
          'Donzosso',
          'Malagasso',
          'Kamagaya',
          'TP',
          'Montagne',
          'Région',
        ],
      },
    ],
  },
  {
    name: 'Dabou',
    region: 'Grands-Ponts',
    communes: [
      {
        name: 'Dabou Commune',
        quartiers: [
          'Kpass',
          'Agban',
          'Négro',
          'Débrimou',
          'Bouboury',
          'Brafèdon',
          'Gbougbo',
        ],
      },
    ],
  },
  {
    name: 'Odienné',
    region: 'Kabadougou',
    communes: [
      {
        name: 'Odienné Commune',
        quartiers: [
          'Résidentiel',
          'Yankafissa',
          'Bromakoté',
          'Hermankono',
          'Dallas',
          'Sokoura',
        ],
      },
    ],
  },
  {
    name: 'Ferkessédougou',
    region: 'Tchologo',
    communes: [
      {
        name: 'Ferkessédougou Commune',
        quartiers: [
          'Bromakoté',
          'Gare',
          'Résidentiel',
          'Dioulabougou',
          'Zémogo',
          'Douane',
        ],
      },
    ],
  },
  {
    name: 'Toumodi',
    region: 'Bélier',
    communes: [
      {
        name: 'Toumodi Commune',
        quartiers: ['Rombo', 'Résidentiel', 'Binava', 'Zaher', 'Dida', 'Commerce'],
      },
    ],
  },
  {
    name: 'Séguéla',
    region: 'Worodougou',
    communes: [
      {
        name: 'Séguéla Commune',
        quartiers: ['Bakayoko', 'Soukrougban', 'Dioulabougou', 'Résidentiel', 'Château'],
      },
    ],
  },
  {
    name: 'Guiglo',
    region: 'Cavally',
    communes: [
      {
        name: 'Guiglo Commune',
        quartiers: ['Résidentiel', 'Nicla', 'Dioulabougou', 'TP', 'Yaoudé', 'Gare'],
      },
    ],
  },
  {
    name: 'Daoukro',
    region: 'Iffou',
    communes: [
      {
        name: 'Daoukro Commune',
        quartiers: ['Baoulékro', 'Dioulakro', 'Gagou', 'Résidentiel', 'Commerce', 'Bédiekro'],
      },
    ],
  },
  {
    name: 'Adzopé',
    region: 'La Mé',
    communes: [
      {
        name: 'Adzopé Commune',
        quartiers: ['Annonciation', 'Tsan-Tsan', 'Dioulakro', 'Massandji', 'Résidentiel'],
      },
    ],
  },
  {
    name: 'Sassandra',
    region: 'Gbôklé',
    communes: [
      {
        name: 'Sassandra Commune',
        quartiers: ['Batéguédé', 'Groudou', 'Plateau', 'Espoir', 'Port', 'Phare'],
      },
    ],
  },
  {
    name: 'Aboisso',
    region: 'Sud-Comoé',
    communes: [
      {
        name: 'Aboisso Commune',
        quartiers: ['Rive Droite', 'TP', 'Sokoura', 'Commerce', 'Ayénouan', 'Belleville'],
      },
    ],
  },
  {
    name: 'Tiassalé',
    region: 'Agnéby-Tiassa',
    communes: [
      {
        name: 'Tiassalé Commune',
        quartiers: ['Morokro', 'Bécédi', 'Plateau', 'Rive Gauche', "N'Douci", 'Commerce'],
      },
    ],
  },
  {
    name: 'Dimbokro',
    region: "N'Zi",
    communes: [
      {
        name: 'Dimbokro Commune',
        quartiers: ['Dioulakro', 'Sokouradjan', 'Belleville', 'Commerce', 'Broukro'],
      },
    ],
  },
  {
    name: 'Katiola',
    region: 'Hambol',
    communes: [
      {
        name: 'Katiola Commune',
        quartiers: ['Kôkô', 'Lafonkaha', 'Résidentiel', 'Mangoro', 'Aviation'],
      },
    ],
  },
  {
    name: 'Boundiali',
    region: 'Bagoué',
    communes: [
      {
        name: 'Boundiali Commune',
        quartiers: ['Loworo', 'Haoussa', 'Résidentiel', 'Ganaoni', 'Tchédio'],
      },
    ],
  },
  {
    name: 'Bouna',
    region: 'Bounkani',
    communes: [
      {
        name: 'Bouna Commune',
        quartiers: ['Bouna Centre', 'Dasseyesso', 'Kôkô', 'Résidentiel', 'Gendarmerie'],
      },
    ],
  },
  {
    name: 'Issia',
    region: 'Haut-Sassandra',
    communes: [
      {
        name: 'Issia Commune',
        quartiers: ['Dar-es-Salam', 'Issia 2', 'Dioulabougou', 'Résidentiel', 'Soleil'],
      },
    ],
  },
  {
    name: 'Oumé',
    region: 'Gôh',
    communes: [
      {
        name: 'Oumé Commune',
        quartiers: ['Dougbaflan', 'Gata', 'Dioulabougou', 'Plateau', 'Kouamékro'],
      },
    ],
  },
  {
    name: 'Duékoué',
    region: 'Guémon',
    communes: [
      {
        name: 'Duékoué Commune',
        quartiers: ['Guinglo', 'Carrefour', 'Résidentiel', 'Petit Duékoué', 'Kokoman'],
      },
    ],
  },
  {
    name: 'Bouaflé',
    region: 'Marahoué',
    communes: [
      {
        name: 'Bouaflé Commune',
        quartiers: ['Koblata', 'Dioulabougou', 'Lopoua', 'Résidentiel', 'Gare', 'Degbézéré'],
      },
    ],
  },
  {
    name: 'Sinfra',
    region: 'Marahoué',
    communes: [
      {
        name: 'Sinfra Commune',
        quartiers: ['Douafla', 'Dioulabougou', 'Résidentiel', 'Château', 'Gare'],
      },
    ],
  },
];

// Helper functions
export function getAllCities(): string[] {
  return COTE_D_IVOIRE_LOCATIONS.map((c) => c.name);
}

export function getCommunesForCity(cityName: string): CommuneInfo[] {
  const city = COTE_D_IVOIRE_LOCATIONS.find(
    (c) => c.name.toLowerCase() === cityName.toLowerCase()
  );
  return city ? city.communes : [];
}

export function getQuartiersForCommune(cityName: string, communeName: string): string[] {
  const communes = getCommunesForCity(cityName);
  const commune = communes.find(
    (cm) => cm.name.toLowerCase() === communeName.toLowerCase()
  );
  return commune ? commune.quartiers : [];
}

export interface RoleConfigItem {
  key: 'direction' | 'cashier' | 'teacher' | 'student' | 'parent';
  label: string;
  badge: string;
  description: string;
  targetView: string;
}

export const ROLE_DEFINITIONS: RoleConfigItem[] = [
  {
    key: 'direction',
    label: 'Directeur',
    badge: 'Direction & Administration',
    description: 'Gestion globale, dashboard, statistiques et administration',
    targetView: 'dashboard',
  },
  {
    key: 'cashier',
    label: 'Caissière',
    badge: 'Caisse & Écolages',
    description: 'Encaissement des frais de scolarité, reçus A4 et bilan financier',
    targetView: 'cashier',
  },
  {
    key: 'teacher',
    label: 'Professeur',
    badge: 'Enseignant',
    description: 'Saisie des notes, devoirs, cahier de texte et présences',
    targetView: 'grades',
  },
  {
    key: 'student',
    label: 'Élève',
    badge: 'Espace Scolaire',
    description: 'Consultation des bulletins de notes, devoirs et emploi du temps',
    targetView: 'bulletins',
  },
  {
    key: 'parent',
    label: 'Parent',
    badge: 'Espace Parents d’élèves',
    description: 'Suivi de la scolarité de ses enfants, paiements et bulletins',
    targetView: 'bulletins',
  },
];

export const ACADEMIC_YEARS = [
  '2026-2027',
  '2025-2026',
  '2024-2025',
  '2027-2028',
];
