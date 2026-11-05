import BaseModel from './base.model.js';

export class historial extends BaseModel {
    constructor(dbConnection) {
        super('historial', dbConnection);
    }
}
