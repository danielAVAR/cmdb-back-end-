import BaseModel from './base.model.js';

export class catagories extends BaseModel{
  constructor( dbConnection ){
    super( 'categories', dbConnection );
  }
}