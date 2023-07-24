import {GraphQLList, GraphQLObjectType,} from 'graphql';
import productModel from "../../../DB/models/productModel.js";
import {productType} from "./productType.js";
import {GraphQLID} from "graphql/index.js";



export const products = {
    type: new GraphQLList(productType),
    resolve: async (parent, args)=> {
        return await productModel.find().populate([{path:'createdBy'},{path:'categoryId'}
            ,{path:'subCategoryId'}, {path:'brandId'}, {path:'updatedBy'}]);
    }
};



export const product = {
    type: productType,
    args:{ID: { type: GraphQLID },},
    resolve: async (parent, args)=> {
        return await productModel.findById({_id:args.ID}).populate([{path:'createdBy'},{path:'categoryId'}
            ,{path:'subCategoryId'},{path:'updatedBy'}]);
    }
};