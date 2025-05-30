import {
  IsString,
  IsEmail,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
  IsObject,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

class GeoDto {
  @IsString()
  @IsNotEmpty()
  lat: string;

  @IsString()
  @IsNotEmpty()
  lng: string;
}

class AddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  suite: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  zipcode: string;

  @ValidateNested()
  @Type(() => GeoDto)
  @IsObject() // Ensures 'geo' is an object and not a primitive
  geo: GeoDto;
}

class CompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  catchPhrase: string;

  @IsString()
  @IsNotEmpty()
  bs: string;
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  // @IsNotEmpty() // Password is required for registration via AuthService, but optional for direct User creation/update if handled carefully
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsOptional() // For user creation via UsersService, password might be optional if set by AuthService later
  password?: string;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsObject() // Ensures 'address' is an object
  address: AddressDto;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional() // website is optional by schema
  website?: string;

  @ValidateNested()
  @Type(() => CompanyDto)
  @IsObject() // Ensures 'company' is an object
  company: CompanyDto;
}
