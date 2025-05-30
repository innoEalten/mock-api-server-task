import { Column } from 'typeorm'; // Entity decorator is not needed for embedded entities

export class Company {
  @Column()
  name: string;

  @Column()
  catchPhrase: string;

  @Column()
  bs: string;
}
