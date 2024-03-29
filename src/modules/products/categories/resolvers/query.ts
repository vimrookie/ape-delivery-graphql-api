import { QueryParams } from '@app/core/interfaces/query-params.interface';
import Category from '../interfaces/category.interface';

const Query = {
    category: async (_, { id }: { id: string }, { dataSources: { productCategories } }) => await productCategories.get(id),

    categories: async (_, args: QueryParams<Category>, { dataSources: { productsCategories } }) => {
        return await productsCategories.getAll(args);
    }
};

export default Query;