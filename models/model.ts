import mongoose, { Types } from "mongoose";

const Schema = mongoose.Schema;

interface PageDocument extends Document {
  user_id: string;
  parent_id: Types.ObjectId | null;
  title: string;
  icon?: string;
  isOpen: boolean;
  content: string;
  bg_image?: string | null;
  type: "parent" | "nested";
  depth?: number;
  is_deleted?: boolean;
  is_favorite?:boolean
}
const userSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
} as const);

// Session Schema
const sessionSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  expires_at: {
    type: Date,
    required: true,
  },
} as const);

const pageSchema = new Schema<PageDocument>({
  user_id: {
    type: String,
    required: true,
  },
  parent_id: {
    type: mongoose.Types.ObjectId,
    ref: "Page",
    default: null,
  },
  title: {
    type: String,
    default: "untitled",
  },
  icon: {
    type: String,
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
  content: {
    type: String,
    default: "",
  },
  bg_image: {
    type: String,
    default: null,
  },
  type: {
    type: String,
  },
  depth: {
    type: Number,
    default: 0,
  },
  is_favorite:{
    type:Boolean,
    default:false
  },
  is_deleted: {
    type: Boolean,
    default: false,
  },
});

pageSchema.pre("save", async function (next) {
  if (this.isModified("parent_id") || this.depth === undefined) {
    let parentDepth = 0;

    if (this.parent_id) {
      const parentPage: any = await this.model("Page").findById(this.parent_id);
      parentDepth = parentPage ? (parentPage.depth || 0) + 1 : 0;
    }

    (this as PageDocument).depth = parentDepth;
  }

  (this as PageDocument).type = this.parent_id ? "nested" : "parent";

  next();
});

// Media Schema
const mediaSchema = new Schema({
  type: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  pageId: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },
});

// Task Schema
const taskSchema = new Schema({
  page_id: {
    type: mongoose.Types.ObjectId,
    ref: "Page",
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const favoriteSchema = new Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    page_id: {
      type: mongoose.Types.ObjectId,
      ref: "Page",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.models.User ?? mongoose.model("User", userSchema);
export const Session =
  mongoose.models.Session ?? mongoose.model("Session", sessionSchema);
export const Page =
  mongoose.models.Page ?? mongoose.model<PageDocument>("Page", pageSchema);

export const Media =
  mongoose.models.Media ?? mongoose.model("Media", mediaSchema);

export const Favorite =
  mongoose.models.Favorite ?? mongoose.model("Favorite", favoriteSchema);

export const Task = mongoose.models.Task ?? mongoose.model("Task", taskSchema);
