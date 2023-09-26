import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Country, Region, SmallCountry } from '../interfaces/country.interface';
import { Observable, combineLatest, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CountriesService {
  private baseUrl: string = 'https://restcountries.com/v3.1';

  private _regions: Region[] = [
    Region.Africa,
    Region.Americas,
    Region.Asia,
    Region.Europe,
    Region.Oceania,
  ];

  constructor(private http: HttpClient) {}

  get regions(): Region[] {
    return [...this._regions];
  }
  /**
   *
   * @param {Region} region
   * @returns {Observable<SmallCountry[]>}
   * if !region, returns []
   * makes a request to url
   * returns Country and map it into an array of SmallCountry
   */
  getCountriesByRegion(region: Region): Observable<SmallCountry[]> {
    if (!region) return of([]);
    const url: string = `${this.baseUrl}/region/${region}?fields=cca3,name,borders`;
    return this.http.get<Country[]>(url).pipe(
      map((countries) =>
        countries.map((country) => ({
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? [],
        }))
      )
    );
  }
  /**
   *
   * @param {string} alphaCode
   * @returns Observable<SmallCountry>
   * which recieves a country by alpha code
   * and transforms the answer into an SmallCountry obj with map
   */
  getCountryByAlphaCode(alphaCode: string): Observable<SmallCountry> {
    const url = `${this.baseUrl}/alpha/${alphaCode}?fields=cca3,name,borders`;
    return this.http.get<Country>(url).pipe(
      map((country) => ({
        name: country.name.common,
        cca3: country.cca3,
        borders: country.borders ?? [],
      }))
    );
  }
  /**
   *
   * @param {string[]} borders
   * @returns Observable<SmallCountry[]>
   * if the country has no borders, returns []
   * else creates a SmallCountry type observable (countriesRequest)
   * iterates borders and creates one request to bring
   * a country by alpha code for every request
   * and put them in countriesRequest
   * after iteration, execute all countriesRequest
   */
  getCountryBordersByCodes(borders: string[]): Observable<SmallCountry[]> {
    if (!borders || borders.length === 0) return of([]);
    const countriesRequests: Observable<SmallCountry>[] = [];
    borders.forEach((code) => {
      const request = this.getCountryByAlphaCode(code);
      countriesRequests.push(request);
    });
    return combineLatest(countriesRequests);
  }
}
