import type { DeleteOptions, UpdateOptions } from "mongodb";
import type {
  Model,
  PopulateOptions,
  ProjectionType,
  QueryFilter,
  QueryOptions,
  Types,
  UpdateQuery,
} from "mongoose";


export abstract class DBRepository<TDocument> {
  constructor(public readonly model: Model<TDocument>) {}

  // ---------- Create ----------
  async create(data: Partial<TDocument>) {
    return await this.model.create(data);
  }

  async createMany(data: Partial<TDocument>[]) {
    return await this.model.insertMany(data);
  }

  // ---------- Read ----------
  async findById({
    id,
    projection = {},
    options = {},
  }: {
    id: Types.ObjectId | string;
    projection?: ProjectionType<TDocument>;
    options?: QueryOptions<TDocument>;
  }) {
    return await this.model.findById(id, projection, options);
  }

  async findOne({
    filter,
    projection = {},
    options = {},
  }: {
    filter: QueryFilter<TDocument>;
    projection?: ProjectionType<TDocument>;
    options?: QueryOptions<TDocument>;
  }) {
    return await this.model.findOne(filter, projection, options);
  }

  async find({
    filter = {},
    projection = {},
    options = {},
  }: {
    filter?: QueryFilter<TDocument>;
    projection?: ProjectionType<TDocument>;
    options?: QueryOptions<TDocument>;
  } = {}) {
    return await this.model.find(filter, projection, options);
  }

  async findWithPopulate({
    filter = {},
    projection = {},
    options = {},
    populate,
  }: {
    filter?: QueryFilter<TDocument>;
    projection?: ProjectionType<TDocument>;
    options?: QueryOptions<TDocument>;
    populate: PopulateOptions | PopulateOptions[];
  }) {
    return await this.model
      .find(filter, projection, options)
      .populate(populate);
  }

  async paginate({
    filter = {},
    projection = {},
    options = {},
    page = 1,
    limit = 10,
  }: {
    filter?: QueryFilter<TDocument>;
    projection?: ProjectionType<TDocument>;
    options?: QueryOptions<TDocument>;
    page?: number;
    limit?: number;
  } = {}) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.find(filter, projection, { ...options, skip, limit }),
      this.model.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async exists({ filter }: { filter: QueryFilter<TDocument> }) {
    return await this.model.exists(filter);
  }

  async count({ filter = {} }: { filter?: QueryFilter<TDocument> } = {}) {
    return await this.model.countDocuments(filter);
  }

  // ---------- Update ----------
  async updateOne({
  filter,
  update,
  options = {},
}: {
  filter: QueryFilter<TDocument>;
  update: UpdateQuery<TDocument>;
  options?: UpdateOptions;
}) {
  return await this.model.updateOne(filter, update, options);
}

async updateMany({
  filter,
  update,
  options = {},
}: {
  filter: QueryFilter<TDocument>;
  update: UpdateQuery<TDocument>;
  options?: UpdateOptions;
}) {
  return await this.model.updateMany(filter, update, options);
}

  async findOneAndUpdate({
    filter,
    update,
    options = { new: true },
  }: {
    filter: QueryFilter<TDocument>;
    update: UpdateQuery<TDocument>;
    options?: QueryOptions<TDocument>;
  }) {
    return await this.model.findOneAndUpdate(filter, update, options);
  }

  async findByIdAndUpdate({
    id,
    update,
    options = { new: true },
  }: {
    id: Types.ObjectId | string;
    update: UpdateQuery<TDocument>;
    options?: QueryOptions<TDocument>;
  }) {
    return await this.model.findByIdAndUpdate(id, update, options);
  }

  // ---------- Delete ----------
  async deleteOne({
    filter,
    options = {},
  }: {
    filter: QueryFilter<TDocument>;
    options?: DeleteOptions;
  }) {
    return await this.model.deleteOne(filter, options);
  }

  async deleteMany({
    filter,
    options = {},
  }: {
    filter: QueryFilter<TDocument>;
    options?: DeleteOptions;
  }) {
    return await this.model.deleteMany(filter, options);
  }

  async findOneAndDelete({
    filter,
    options = {},
  }: {
    filter: QueryFilter<TDocument>;
    options?: QueryOptions<TDocument>;
  }) {
    return await this.model.findOneAndDelete(filter, options);
  }

  async findByIdAndDelete({
    id,
    options = {},
  }: {
    id: Types.ObjectId | string;
    options?: QueryOptions<TDocument>;
  }) {
    return await this.model.findByIdAndDelete(id, options);
  }
}