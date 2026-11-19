import { Schema, model, models, Model, Document } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password: string;
}

export interface IUserDocument extends IUser, Document {
  id: string;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const User: Model<IUserDocument> =
  (models.User as Model<IUserDocument>) ||
  model<IUserDocument>("User", UserSchema);

export default User;

// Compatibilidad total con CommonJS require() y ESM import
if (typeof module !== "undefined" && module.exports) {
  module.exports = User;
  module.exports.default = User;
  module.exports.User = User;
}
