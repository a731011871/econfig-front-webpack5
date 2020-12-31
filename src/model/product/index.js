import im from 'seamless-immutable';
import { createAction } from 'react-popo';
import { productService } from '../../service/product';

const state = im([]);

export const productModel = {
    namespace: 'product',
    state,
    reducer: {
        fetch(state, { payload }) {
            return im(payload);
        }
    },
    actions: {
        fetch: createAction('product/fetch')
    },
    effects: {
        async fetch() {
            const data = await productService.fetchProduct();
            await this.actions.product.fetch(data);
        },
        async add(dto) {
            await productService.addProduct(dto);
        },
        async delete( id) {
            await productService.deleteProduct(id);
            await this.effects.product.fetch();
        },
        async update(id, dto) {
            await productService.updateProduct(id, dto);
        }
    }
};
