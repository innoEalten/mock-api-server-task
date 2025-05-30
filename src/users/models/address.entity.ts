import { Column } from 'typeorm'; // Entity decorator is not needed for embedded entities
import { Geo } from './geo.entity';

export class Address {
  @Column()
  street: string;

  @Column()
  suite: string;

  @Column()
  city: string;

  @Column()
  zipcode: string;

  @Column(() => Geo) // Specifies that this column will store an embedded Geo object
  geo: Geo;
}
