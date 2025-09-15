// Adaptador de infraestructura para productos (implementa puerto abstracto)
export class RxProductRepository {
  constructor(db) {
    this.col = db.products;
  }

  async getAll() {
    return this.col.find().sort({ name: 'asc' }).exec();
  }

  async findById(id) {
    return this.col.findOne(id).exec();
  }

  async searchByName(term) {
    const regex = new RegExp(term, 'i');
    return this.col.find({ selector: { name: { $regex: regex } } }).exec();
  }
}