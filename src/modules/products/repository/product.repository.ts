import "reflect-metadata";
import { IProductRepository } from './product.interface';
import * as mongoose from 'mongoose';
import { IPageInfoService, PageInfoService } from '@app/services/page-info.service';
import { PageInfoMetadata } from '@app/core/interfaces/page-info.interface';
import { Product } from '../interfaces/product';
import { MongoDataSource } from 'apollo-datasource-mongodb';
import CategoryModel from "../categories/category";
import NotFoundExeception from "@app/exceptions/not-found.exception";
import { ApolloError, UserInputError } from "apollo-server";
import { QueryParams } from "@app/core/interfaces/query-params.interface";
import { IQueryParamsService } from "@app/services/query-params.service";
import { inject, optional } from "inversify";
import { types } from "@app/inversify.config";
import { ProductModel } from "../product";

export class ProductRepository extends MongoDataSource<Product> implements IProductRepository {

    private _queryParamsService: IQueryParamsService<Product>;
    private _pageInfoService: IPageInfoService;

    constructor(
        @inject(types.IQueryParamsService) @optional() queryParamsService?: IQueryParamsService<Product>,
        @inject(types.IPageInfoService) @optional() pageInfoService?: IPageInfoService
    ) {
        super(ProductModel);
        this._pageInfoService = pageInfoService;
        this._queryParamsService = queryParamsService;
    }

    async getAll(queryParams?: QueryParams<Product>): Promise<{ data: Product[], pageInfo: PageInfoMetadata | null }> {
        if (queryParams) {
            queryParams = this._queryParamsService.getParams(queryParams);
        }
        let paginationMetadata: PageInfoMetadata | null = null;
        let aggregate: any = [
            {
                $match: {
                    deletedAt: null,
                    ...queryParams?.searchText
                },
            },
        ];
        if (queryParams?.limit && typeof queryParams?.skip !== undefined) {
            aggregate = [
                ...aggregate,
                {
                    $skip: queryParams.skip
                },
                {
                    $limit: queryParams.limit
                }
            ];
        }
        if (queryParams?.sort) {
            aggregate = [
                ...aggregate,
                {
                    $sort: queryParams.sort
                }
            ];
        }

        const query = await this.model.aggregate(aggregate).exec();

        if (typeof queryParams?.skip !== undefined && queryParams?.limit && query.length > 0) {
            paginationMetadata = await this._pageInfoService.getPageInfo(await this.getTotal(queryParams.searchText), queryParams.skip, queryParams.limit);
        }

        return {
            data: [...query],
            pageInfo: paginationMetadata
        };
    }

    async getTotal(searchText: any): Promise<number> {
        return await this.model.find(
            { $and: [{ deletedAt: null }, { parent: null }] },
            searchText
        )
            .count();
    }

    async get(id: string) {
        return this.model.findOne({ _id: mongoose.Types.ObjectId(id) })
            .where('deletedAt').equals(null)
            .exec();
    }

    async add(product: Product): Promise<mongoose.Document | NotFoundExeception> {
        if (product.categories) {
            let categories = [];
            for (const id of product.categories) {
                const category = await CategoryModel.findOne({ _id: id }).lean().exec();
                if (category === null) {
                    return new NotFoundExeception('Category', id);
                } else {
                    const validateIfIsParent = await CategoryModel.find({ parent: id }).exec();
                    if (validateIfIsParent.length > 0) {
                        return new UserInputError(`Category with ${id} is a parent and can't be directly assigned to a product`)
                    } else {
                        console.log(category);
                        categories = [...categories, category];
                    }
                }
            }
            product.categories = categories;
        }
        return this.model.create(
            {
                ...product
            });
    }

    update(id: string, product: Product): Promise<mongoose.Document> {
        return this.model.findOneAndUpdate({ _id: mongoose.Types.ObjectId(id) }, product, { new: true }).exec();
    }

    delete(id: string): Promise<mongoose.Document> {
        return this.model.findByIdAndUpdate(mongoose.Types.ObjectId(id), {
            deletedAt: new Date()
        }).exec();
    }

}