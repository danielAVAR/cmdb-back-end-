import BaseModel from './base.model.js';

export class CategoriesModel extends BaseModel {
  constructor( dbConnection ){
    super( 'categories', dbConnection );
  }
}
