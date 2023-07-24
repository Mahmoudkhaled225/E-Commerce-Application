import express from 'express';
import errorHandlerMW from "./middleware/errorHandlerMW.js";
import morgan from 'morgan';

import { createHandler } from 'graphql-http/lib/use/express';


import path from "path";
import {fileURLToPath} from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url))
import {config} from "dotenv";
config({path: path.join(__dirname,'./config/dot.env')});


import * as indexRouter from "./modules/indexRouter.js"
import {productSchema} from "./modules/Product/graphQL/schema.js";

const app = express();
app.use(express.json());
app.use(morgan('dev'));

export const baseUrl = process.env.BASE_URL;

app.use(`${baseUrl}/auth`,indexRouter.authRouter);
app.use(`${baseUrl}/category`,indexRouter.categoryRouter);
app.use(`${baseUrl}/subcategory`,indexRouter.subCategoryRouter);
app.use(`${baseUrl}/brand`,indexRouter.brandRouter);
app.use(`${baseUrl}/product`,indexRouter.productRouter);
app.use(`${baseUrl}/coupon`,indexRouter.couponRouter);
app.use(`${baseUrl}/cart`,indexRouter.cartRouter);
app.use(`${baseUrl}/order`,indexRouter.orderRouter);

// http://localhost:3000/ecommerce/v1/graphql
app.all(`${baseUrl}/graphQL`, createHandler({schema:productSchema, graphiql: true}));


app.all("*", (req, res/*,next*/) => {
    //next(new AppError(`In-valid Routing `+req.originalUrl,404));
    console.log(`In-valid Routing `+req.originalUrl);
    res.status(404).json({
        status: "Fail",
        message: `In-valid Routing `+req.originalUrl
    });
});

// error handler
app.use(errorHandlerMW);

export default app;