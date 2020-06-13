import { gql } from "apollo-server";

export const ProductType = gql`

type Product{
    _id: String
    name: String!
    price: Float!
    sku: String!
    images: [ProductImage]!
    isActive: Boolean!
    productAttributes: [ProductAttribute]!
    warrantyTerms: String
    description: String
    createdAt: DateTime
	updatedAt: DateTime
    deletedAt: DateTime
}

type ProductImage {
    url: String!
    position: Float!
}

type ProductAttribute {
    name: String!
    description: String!
}`