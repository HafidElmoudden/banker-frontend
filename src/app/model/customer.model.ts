export interface Customer {
  id : number;
  name : string;
  email : string;
  phone?: string;
  address?: string;
  createdAt?: Date;
  createdBy?: string;
  lastModifiedAt?: Date;
  lastModifiedBy?: string;
}
