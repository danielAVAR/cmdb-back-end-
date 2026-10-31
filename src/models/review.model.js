import BaseModel from './base.model.js';

export class review extends BaseModel{
  constructor( dbConnection ){
    super( 'reviews', dbConnection );
  }
}