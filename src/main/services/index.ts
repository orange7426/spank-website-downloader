import realspankinginstitute from './realspankinginstitute';
import bispnking from './bispanking';

export interface Auth {
  username: string;
  password: string;
}

export interface Item {
  id: string;
  date: string;
  title: string;
  thumbnail: string;
  description: string;
  link: string;
}

// TODO: Make a dynamic list
const services = [bispnking, realspankinginstitute];

export default Object.fromEntries(
  services.map((service) => [service.id, service])
);
