import BaseModel from './base.model.js';

export class movie extends BaseModel{
  constructor( dbConnection ){
    super( 'movies', dbConnection );
  }
}