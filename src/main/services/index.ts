import realspankinginstitute from './realspankinginstitute';
import bispnking from './bispanking';

export interface Item {
  id: string;
  date: Date;
  title: string;
  thumbnail: string;
  description: string;
  link: string;
}

// TODO: Make a dynamic list
const services = [realspankinginstitute, bispnking];

export default Object.fromEntries(
  services.map((service) => [service.id, service])
);
