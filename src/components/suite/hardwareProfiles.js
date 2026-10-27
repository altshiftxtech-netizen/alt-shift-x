const hardwareProfiles = {
  rover: { size: [2.45, 1.1, 2.9], center: [0, 2.1, .2], roof: 2.76, code: 'RV-06 / AUTONOMOUS EXPLORER' },
  transport: { size: [2.45, 1.1, 2.9], center: [0, 2.1, .2], roof: 2.76, code: 'HT-06 / TRANSIT SYSTEMS' },
  quadruped: { size: [1.35, .65, 2.45], center: [0, 1.85, 0], code: 'QD-04 / FIELD ROBOTICS' },
  drone: { size: [1.4, .65, 2.3], center: [0, 0, 0], code: 'AV-04 / AERIAL SYSTEMS' },
  surveyor: { size: [.75, 1, .5], center: [0, 2.05, 0], frontOnly: true, code: 'SR-01 / SURVEY SYSTEMS' },
  satellite: { size: [1.5, 1.8, 1.5], center: [0, 0, 0], code: 'OS-02 / ORBITAL SYSTEMS' },
  wing: { size: [5.7, .16, 1.8], center: [0, 0, 0], topOnly: true, code: 'AX-02 / FLIGHT SYSTEMS' },
  planter: { size: [4.6, 1.2, 5], center: [0, 2.7, 0], roof: 3.51, code: 'EP-06 / ECOLOGICAL SYSTEMS' },
  seedDrone: { size: [3, .7, 3], center: [0, 0, 0], code: 'SD-04 / REFORESTATION' },
  forestryCarrier: { size: [7, 2, 10], center: [0, 2, 0], noRoof: true, code: 'FC-08 / FORESTRY SYSTEMS' },
  forestryDog: { size: [2, 1, 4], center: [0, 2.4, 0], code: 'ES-04 / ECOLOGICAL SURVEY' },
  truck: { size: [7.6, 2.9, 5.3], center: [0, 4.7, 6.4], roof: 6.2, code: 'RC-06 / GEOLOGICAL LOGISTICS' },
  turret: { size: [10, 8, 12], center: [0, 0, 0], code: 'LR-04 / OPTICAL SYSTEMS' },
};
export default hardwareProfiles;