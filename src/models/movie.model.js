import BaseModel from './base.model.js';

export class MovieModel extends BaseModel {
  constructor( dbConnection ){
    super( 'movies', dbConnection );
  }
}
