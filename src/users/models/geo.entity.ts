import { Column } from 'typeorm';

export class Geo {
  @Column()
  lat: string;

  @Column()
  lng: string;
}
