import { Document, Types } from "mongoose";

export interface PageDocument extends Document {
  user_id: string;
  parent_id: Types.ObjectId | null;
  title: string;
  icon?: string;
  isOpen: boolean;
  content: string;
  bg_image?: string | null;
  type: "parent" | "nested";
  depth: number;
  children: Document[];
}

export interface TreeDocument extends Document{
  _id: string;
  title: string;
  content: string;
  icon: string;
  children?: Document[];
}


export interface DocumentType {
  _id: string;
  title: string;
  content: string;
  parent_id?: string;
  icon?: string;
  children?: DocumentType[];
  bg_image?: "";
}