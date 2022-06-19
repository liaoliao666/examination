import { GET } from "services/helper";
import { CategoryListResponse } from "lib/scheme/category";

export enum CategoryKeys {
  LIST = "LIST",
}

export const CategoryService = {
  list: () => GET<CategoryListResponse>("/api/categories"),
};
