import {GraphQLObjectType, GraphQLSchema} from 'graphql';
import {products, product} from "./fields.js";




export const productSchema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "productQraphQL",
        description: "Query products",
        fields:{
            products,
            product
        }
    })
});