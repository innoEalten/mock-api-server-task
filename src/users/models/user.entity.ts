import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Address } from './address.entity';
import { Company } from './company.entity';

@Entity() // This is a main entity, so @Entity() is correct.
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  // Hashed password, should not be returned by default in queries
  @Column({ select: false, nullable: true }) // nullable:true if password is not mandatory for all users (e.g. initially seeded ones)
  password?: string;

  @Column(() => Address) // Embeds Address
  address: Address;

  @Column()
  phone: string;

  @Column()
  website: string;

  @Column(() => Company) // Embeds Company
  company: Company;
}
