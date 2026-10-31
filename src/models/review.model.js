import BaseModel from './base.model.js';

export class ReviewModel extends BaseModel {
  constructor( dbConnection ){
    super( 'reviews', dbConnection );
  }
}
