export interface Venue {
  name: string;
  lat: number;
  lng: number;
}

/**
 * Coordinates are best-effort city/site-level placements (not surveyed venue
 * entrances) derived from public knowledge of each host city, intended to
 * plot findings on the right part of the map. Replace with exact venue GPS
 * coordinates in this file as they become available from the OCOG venue team.
 */
export const VENUES: Venue[] = [
  { name: "Aichi Country Club Higashiyama Course (Golf)", lat: 35.195, lng: 137.06 },
  { name: "Aichi International Arena (Breaking)", lat: 35.115, lng: 136.885 },
  { name: "Aichi International Arena (Judo)", lat: 35.115, lng: 136.885 },
  { name: "Aichi International Arena (Wrestling)", lat: 35.115, lng: 136.885 },
  { name: "Aichi Prefectural General Shooting Gallery (Shooting)", lat: 35.05, lng: 137.17 },
  { name: "Aichi Prefectural Martial Arts Hall (Jiu-Jitsu)", lat: 35.1892, lng: 137.0508 },
  { name: "Aichi Prefectural Martial Arts Hall (Kurash)", lat: 35.1892, lng: 137.0508 },
  { name: "Aichi Prefectural Martial Arts Hall (Wushu)", lat: 35.1892, lng: 137.0508 },
  { name: "Aichi Sky Expo (Cycling)", lat: 34.862, lng: 136.813 },
  { name: "Aichi Sky Expo (E-Sports)", lat: 34.862, lng: 136.813 },
  { name: "Aichi Sky Expo (Fencing)", lat: 34.862, lng: 136.813 },
  { name: "Aichi Sky Expo (Skateboarding)", lat: 34.862, lng: 136.813 },
  { name: "Airport", lat: 34.8584, lng: 136.8054 },
  { name: "Anjo Athletics Ground (Modern Pentathlon)", lat: 34.955, lng: 137.085 },
  { name: "Anjo Softball Ground (Softball)", lat: 34.9575, lng: 137.0821 },
  { name: "Circular course around the Aichi Prefectural (Race Walk)", lat: 35.1807, lng: 136.9066 },
  { name: "Circular course in Shinshiro City (Cycling Road)", lat: 34.9097, lng: 137.4956 },
  { name: "Gamagori City Triathlon Venue (Triathlon)", lat: 34.8324, lng: 137.2199 },
  { name: "General", lat: 35.1815, lng: 136.9066 },
  { name: "Gifu Prefectural Green Stadium (Hockey)", lat: 35.4233, lng: 136.7606 },
  { name: "Hekinan Ryokuchi Beach Court (Beach Volleyball)", lat: 34.8916, lng: 136.9997 },
  { name: "Hotel", lat: 35.1835, lng: 136.9086 },
  { name: "IBC", lat: 35.1049, lng: 136.8825 },
  { name: "Ichinomiya City Municipal Gymnasium (Badminton)", lat: 35.3042, lng: 136.8025 },
  { name: "Izu Velodrome (Cycling Track)", lat: 34.9758, lng: 138.9506 },
  { name: "JRA Equestrian Park (Dressage / Eventing / Jumping)", lat: 35.13, lng: 137.08 },
  { name: "Kaiyoh Yacht Harbor (Sailing)", lat: 34.828, lng: 137.235 },
  { name: "Kasugai City Gymnasium (Handball)", lat: 35.2477, lng: 136.9723 },
  { name: "Kinjo Futo Station Square Venue (Basketball)", lat: 35.115, lng: 136.885 },
  { name: "Kobe Universiade Memorial Stadium (Football)", lat: 34.6663, lng: 135.1741 },
  { name: "Kyoto Stadium (Football)", lat: 34.9807, lng: 135.7121 },
  { name: "Live Sites", lat: 35.1704, lng: 136.9078 },
  { name: "Long Beach (Surfing)", lat: 34.648, lng: 137.278 },
  { name: "Miyoshi Lake (Canoe Sprint)", lat: 35.1167, lng: 137.0833 },
  { name: "Nagai Stadium (Football)", lat: 34.6249, lng: 135.5181 },
  { name: "Nagaragawa Athletics Stadium (Football)", lat: 35.4408, lng: 136.7728 },
  { name: "Nagaragawa International Regatta Course (Rowing)", lat: 35.455, lng: 136.785 },
  {
    name: "Nagoya City General Gymnasium (Artistic Gymnastics /Rhythmic Gymnastics /Trampoline)",
    lat: 35.158,
    lng: 136.97,
  },
  { name: "Nagoya City General Gymnasium (Water Polo)", lat: 35.158, lng: 136.97 },
  { name: "Nagoya City Higashiyama Park Tennis Centre (Tennis/Soft Tennis)", lat: 35.16, lng: 136.966 },
  { name: "Nagoya City Minato Soccer Field (Football)", lat: 35.108, lng: 136.873 },
  { name: "Nagoya City Mizuho Park (Sepaktakraw)", lat: 35.1223, lng: 136.9524 },
  { name: "Nagoya City Mizuho Park (Track and Field, Marathon)", lat: 35.1223, lng: 136.9524 },
  { name: "Nagoya City Mizuho Park Rugby Field (Football)", lat: 35.1223, lng: 136.9524 },
  { name: "Nagoya City Mizuho Park Rugby Field (Rugby)", lat: 35.1223, lng: 136.9524 },
  { name: "Nagoya City Trade and Industry Centre (Weightlifting)", lat: 35.145, lng: 136.87 },
  { name: "Nagoya International Exhibition Hall (Climbing)", lat: 35.1049, lng: 136.8825 },
  { name: "Nagoya Kinjo Pier Arena (Squash)", lat: 35.115, lng: 136.885 },
  { name: "Nagoya Velodrome BMX Race Course (BMX)", lat: 35.166, lng: 137.014 },
  { name: "Nishio Gymnasium (Boxing)", lat: 34.8595, lng: 137.0592 },
  { name: "Obata Ryokuchi Park (Mountain Bike)", lat: 35.2167, lng: 136.9333 },
  { name: "Okazaki Chuo Sogo Park (Archery)", lat: 34.9536, lng: 137.174 },
  { name: "Okazaki Chuo Sogo Park Baseball Stadium (Baseball)", lat: 34.9536, lng: 137.174 },
  { name: "Okazaki Chuo Sogo Park Gymnasium (Volleyball)", lat: 34.9536, lng: 137.174 },
  { name: "Other Non-Competition Venue", lat: 35.1795, lng: 136.9046 },
  { name: "Park Arena Komaki (Volleyball)", lat: 35.2934, lng: 136.9186 },
  { name: "Shinmaiko Marine Park (Marathon Swimming)", lat: 34.941, lng: 136.848 },
  { name: "Shizuoka Stadium Ecopa (Football)", lat: 34.7583, lng: 137.9161 },
  { name: "Sky Hall Toyota (Table Tennis)", lat: 35.0827, lng: 137.156 },
  { name: "ToBiO Swimming Centre (Artistic Swimming)", lat: 35.648, lng: 139.823 },
  { name: "Tokai Citizen Gymnasium (Kabaddi)", lat: 35.0333, lng: 136.9014 },
  { name: "Tokyo Aquatics Centre (Swimming/Diving)", lat: 35.6455, lng: 139.8194 },
  { name: "Toyoda Gosei Memorial Gymnasium (Handball)", lat: 35.228, lng: 136.839 },
  { name: "Toyohashi Gymnasium (Karate)", lat: 34.765, lng: 137.385 },
  { name: "Toyohashi Gymnasium (Taekwondo)", lat: 34.765, lng: 137.385 },
  { name: "Toyohashi Municipal Baseball Stadium (Baseball)", lat: 34.7692, lng: 137.391 },
  { name: "Toyota Stadium (Football)", lat: 35.0844, lng: 137.156 },
  { name: "Train Station", lat: 35.1709, lng: 136.8815 },
  { name: "Training Venue", lat: 35.1775, lng: 136.9106 },
  { name: "Wave Stadium Kariya (Football)", lat: 34.9866, lng: 137.0021 },
  { name: "Wing Arena Kariya (Basketball)", lat: 34.99, lng: 137.005 },
  { name: "Yahagigawa Canoe Slalom Course (Canoe Slalom)", lat: 34.99, lng: 137.16 },
];

export const VENUE_NAMES = VENUES.map((v) => v.name);

export function getVenueCoords(name: string): { lat: number; lng: number } | null {
  const venue = VENUES.find((v) => v.name === name);
  return venue ? { lat: venue.lat, lng: venue.lng } : null;
}
