export class RxCustomerRepository {
  constructor(db) {
    this.col = db.customers;
  }

  async findByPhone(phone) {
    return this.col.findOne({ selector: { phone } }).exec();
  }

  async create(data) {
    const id = 'c' + data.phone;
    const doc = { id, ...data };
    await this.col.insert(doc);
    return doc;
  }
}