import { GET } from "services/api-fn";
import { CategoryList } from "./scheme";

export enum CategoryKeys {
  LIST = "LIST",
}

export const CategoryService = {
  list: () => GET<CategoryList>("/api/categories"),
};
