import {GraphQLObjectType,GraphQLFloat, GraphQLID, GraphQLInt, GraphQLString} from 'graphql';


export const userType = new GraphQLObjectType({
    name: "User",
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        email: {type: GraphQLString},
    })
});

const categoryType = new GraphQLObjectType({
    name: "Category",
    fields: () => ({
        name: { type: GraphQLString },
    })
});

const subCategoryType = new GraphQLObjectType({
    name: "subCategory",
    fields: () => ({
        name: { type: GraphQLString },
    })
});

const brandType = new GraphQLObjectType({
    name: "Brand",
    fields: () => ({
        name: { type: GraphQLString },
    })
});

export const productType = new GraphQLObjectType({
    name: "Product",
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        slug: { type: GraphQLString },
        description: { type: GraphQLString },
        stock: { type: GraphQLInt },
        price: { type: GraphQLFloat },
        discount: { type: GraphQLFloat },
        priceAfterDiscount: { type: GraphQLFloat },
        image: { type: GraphQLString },
        subImgs: { type: GraphQLString },
        createdBy: { type: userType},
        updatedBy: { type: userType},
        categoryId: { type: categoryType},
        subCategoryId: { type: subCategoryType},
        brandId:{type: brandType},
    })
});
