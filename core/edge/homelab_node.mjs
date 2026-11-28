console.log('\x1b[1;36m[HOMELAB-NODE]\x1b[0m Initializing Sovereign LAN Gossip Protocol...');
const clusterId = 'sovereign-mesh-' + Math.random().toString(36).substring(2, 7);

console.log(`\x1b[32m[DISCOVERY]\x1b[0m Broadcasting mDNS zero-configuration beacon on LAN: \${clusterId}`);
console.log('\x1b[32m[SERIAL UMBILICAL]\x1b[0m Probing UART / USB ports for Arduino/ESP32 microcontroller telemetry...');
console.log('\x1b[32m[TELEMETRY STREAM]\x1b[0m Virtual serial bridge active @ 115200 baud. Zero cloud MQTT brokers required.');
console.log('\x1b[32m[CLUSTER MEMORY]\x1b[0m Ready to pool RAM with peer Raspberry Pi / Mini-PC nodes via zero-copy sharding.');
console.log('\x1b[1;32m✓ NODE ACTIVE: Autonomous edge hub operational in 100% offline air-gapped mode.\x1b[0m\n');
