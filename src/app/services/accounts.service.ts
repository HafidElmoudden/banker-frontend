import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {AccountDetails, AccountOperation, AccountRequest} from "../model/account.model";

@Injectable({
  providedIn: 'root'
})
export class AccountsService {

  constructor(private http : HttpClient) { }

  public getAccount(accountId : string, page : number, size : number):Observable<AccountDetails>{
    return this.http.get<AccountDetails>(`${environment.backendHost}/accounts/${accountId}/pageOperations?page=${page}&size=${size}`);
  }

  public getCustomerAccounts(customerId: number): Observable<Array<AccountDetails>> {
    return this.http.get<Array<AccountDetails>>(`${environment.backendHost}/accounts/customer/${customerId}`);
  }

  public getAllAccounts(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${environment.backendHost}/accounts?page=${page}&size=${size}`);
  }

  public searchAccounts(keyword: string, page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${environment.backendHost}/accounts/search?keyword=${keyword}&page=${page}&size=${size}`);
  }

  public createAccount(accountRequest: AccountRequest): Observable<AccountDetails> {
    return this.http.post<AccountDetails>(`${environment.backendHost}/accounts`, accountRequest);
  }

  public updateAccount(accountId: string, data: any): Observable<AccountDetails> {
    return this.http.put<AccountDetails>(`${environment.backendHost}/accounts/${accountId}`, data);
  }

  public debit(accountId : string, amount : number, description:string){
    let data={accountId : accountId, amount : amount, description : description}
    return this.http.post(environment.backendHost+"/accounts/debit",data);
  }
  public credit(accountId : string, amount : number, description:string){
    let data={accountId : accountId, amount : amount, description : description}
    return this.http.post(environment.backendHost+"/accounts/credit",data);
  }
  public transfer(accountSource: string,accountDestination: string, amount : number, description:string){
    let data={accountSource, accountDestination, amount, description }
    return this.http.post(environment.backendHost+"/accounts/transfer",data);
  }

  public getAccountHistory(accountId: string): Observable<Array<AccountOperation>> {
    return this.http.get<Array<AccountOperation>>(`${environment.backendHost}/accounts/${accountId}/operations`);
  }

  public getAccountStatistics(accountId: string): Observable<any> {
    return this.http.get<any>(`${environment.backendHost}/accounts/${accountId}/statistics`);
  }

  public changeAccountStatus(accountId: string, status: string): Observable<any> {
    return this.http.put<any>(`${environment.backendHost}/accounts/${accountId}/status`, { status });
  }
}
