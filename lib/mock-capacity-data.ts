export interface CapacityMarker {
  id: string;
  lat: number;
  lng: number;
  type: 'seller' | 'buyer';
  capacity_mw: number;
  voltage: '11kV' | '33kV' | '132kV';
  location_name: string;
  owner: string;
}

export const mockCapacityData: CapacityMarker[] = [
  {
    id: 'cap-001',
    lat: 51.5074,
    lng: -0.1278,
    type: 'seller',
    capacity_mw: 15.5,
    voltage: '33kV',
    location_name: 'London Central',
    owner: 'UK Power Networks'
  },
  {
    id: 'cap-002',
    lat: 53.4808,
    lng: -2.2426,
    type: 'buyer',
    capacity_mw: 8.2,
    voltage: '11kV',
    location_name: 'Manchester',
    owner: 'Electricity North West'
  },
  {
    id: 'cap-003',
    lat: 52.4862,
    lng: -1.8904,
    type: 'seller',
    capacity_mw: 22.3,
    voltage: '132kV',
    location_name: 'Birmingham',
    owner: 'Western Power Distribution'
  },
  {
    id: 'cap-004',
    lat: 55.9533,
    lng: -3.1883,
    type: 'seller',
    capacity_mw: 12.7,
    voltage: '33kV',
    location_name: 'Edinburgh',
    owner: 'SP Energy Networks'
  },
  {
    id: 'cap-005',
    lat: 53.8008,
    lng: -1.5491,
    type: 'buyer',
    capacity_mw: 5.5,
    voltage: '11kV',
    location_name: 'Leeds',
    owner: 'Northern Powergrid'
  },
  {
    id: 'cap-006',
    lat: 51.4545,
    lng: -2.5879,
    type: 'seller',
    capacity_mw: 18.9,
    voltage: '132kV',
    location_name: 'Bristol',
    owner: 'Western Power Distribution'
  },
  {
    id: 'cap-007',
    lat: 52.2053,
    lng: 0.1218,
    type: 'buyer',
    capacity_mw: 6.8,
    voltage: '33kV',
    location_name: 'Cambridge',
    owner: 'UK Power Networks'
  },
  {
    id: 'cap-008',
    lat: 54.9783,
    lng: -1.6174,
    type: 'seller',
    capacity_mw: 14.2,
    voltage: '33kV',
    location_name: 'Newcastle',
    owner: 'Northern Powergrid'
  },
  {
    id: 'cap-009',
    lat: 50.8198,
    lng: -0.1370,
    type: 'buyer',
    capacity_mw: 9.3,
    voltage: '11kV',
    location_name: 'Brighton',
    owner: 'UK Power Networks'
  },
  {
    id: 'cap-010',
    lat: 51.3811,
    lng: -2.3590,
    type: 'seller',
    capacity_mw: 20.1,
    voltage: '132kV',
    location_name: 'Bath',
    owner: 'Western Power Distribution'
  },
  {
    id: 'cap-011',
    lat: 52.6369,
    lng: 1.2974,
    type: 'buyer',
    capacity_mw: 7.6,
    voltage: '33kV',
    location_name: 'Norwich',
    owner: 'UK Power Networks'
  },
  {
    id: 'cap-012',
    lat: 53.4084,
    lng: -2.9916,
    type: 'seller',
    capacity_mw: 16.4,
    voltage: '33kV',
    location_name: 'Liverpool',
    owner: 'SP Energy Networks'
  },
  {
    id: 'cap-013',
    lat: 51.2787,
    lng: 1.0789,
    type: 'buyer',
    capacity_mw: 4.9,
    voltage: '11kV',
    location_name: 'Canterbury',
    owner: 'UK Power Networks'
  },
  {
    id: 'cap-014',
    lat: 50.3755,
    lng: -4.1427,
    type: 'seller',
    capacity_mw: 11.8,
    voltage: '33kV',
    location_name: 'Plymouth',
    owner: 'Western Power Distribution'
  },
  {
    id: 'cap-015',
    lat: 54.5973,
    lng: -5.9301,
    type: 'buyer',
    capacity_mw: 10.2,
    voltage: '33kV',
    location_name: 'Belfast',
    owner: 'NIE Networks'
  }
];
