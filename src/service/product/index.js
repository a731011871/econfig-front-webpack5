import { findOneById } from '../../model/user/helper';
import { delay } from 'utils/delay';
import { updateRecord } from './helper';

let mockProducts = [];

export const productService = {
    addProduct(dto) {
        return new Promise(res => {
            delay(1000, () => {
                dto.id = mockProducts.length.toString();
                mockProducts.push(dto);
                res(true);
            });
        });
    },
    fetchProduct() {
        return new Promise(res => {
            delay(1000, () => {
                res(mockProducts);
            });
        });
    },
    updateProduct(id, dto) {
        return new Promise((res, rej) => {
            delay(2000, () => {
                const updateProduct = findOneById(mockProducts, id);
                if (!updateProduct) {
                    rej({ message: '不存在该用户' });
                }
                updateRecord(mockProducts, {
                    id,
                    dto
                });
                res(true);
            });
        });
    },
    deleteProduct(id) {
        return new Promise(res => {
            delay(2000, () => {
                mockProducts = mockProducts.filter(
                    product => product.id !== id
                );
                res(true);
            });
        });
    }
};
