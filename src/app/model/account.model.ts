export interface AccountDetails {
  accountId:            string;
  balance:              number;
  currentPage:          number;
  totalPages:           number;
  pageSize:             number;
  accountOperationDTOS: AccountOperation[];
  createdAt?:           Date;
  createdBy?:          string;
  customerId?:         number;
  customerName?:       string;
  accountType?:        string;
  status?:             string;
}

export interface AccountOperation {
  id:            number;
  operationDate: Date;
  amount:        number;
  type:          string;
  description:   string;
  userId?:       number;
  username?:    string;
}

export interface AccountRequest {
  customerId:     number;
  initialBalance: number;
  accountType:    string;
  overDraft?:     number;
  interestRate?:  number;
  createdBy?:     string;
}
