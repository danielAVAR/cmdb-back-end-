import BaseModel from './base.model.js';

export class UserModel extends BaseModel {
  constructor( dbConnection ){
    super( 'users', dbConnection );
  }
}
