import realspankinginstitute from './realspankinginstitute';
import bispnking from './bispanking';

// TODO: Make a dynamic list
const services = [realspankinginstitute, bispnking];

export default Object.fromEntries(
  services.map((service) => [service.id, service])
);
