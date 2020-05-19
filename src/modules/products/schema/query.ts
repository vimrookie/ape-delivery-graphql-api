import { gql } from "apollo-server";

export const ProductQuery = gql`

type ProductConnection {
    data: [Product],
    pageInfo: PageInfo
}

extend type Query {
    """
    Returns all products.
    """
    products(
        paginate: Boolean,
        searchText: String, 
        skip: Int, 
        limit: Int,
        fields: [String]
        sort: JSON,
        ): ProductConnection
    """
    Returns a product.
    """
    product(id: ID!): Product
}
`