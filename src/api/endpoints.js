export const API_ENDPOINTS = {
    USERS: {
        LOGIN: 'api/auth/login',
        REGISTER: 'api/users',
        GET_ALL: 'api/users',
        UPDATE: (id) => `api/users?id=${id}`,
        DETAIL: (id) => `api/users?id=${id}`,
    },
    CATEGORIES: {
        GET_ALL: 'api/categories',
        CREATE: 'api/categories',
        UPDATE: (id) => `api/categories?id=${id}`,
        DELETE: (id) => `api/categories?id=${id}`,
    },
    PRODUCTS: {
        GET_ALL: 'api/products',
        CREATE: 'api/products',
        UPDATE: (id) => `api/products?id=${id}`,
        DELETE: (id) => `api/products?id=${id}`,
    },
    ORDERS: {
        GET_ALL: 'api/orders',
        GET_ONE: (id) => `api/orders?id=${id}`,
        CREATE: 'api/orders',
        UPDATE: (id) => `api/orders?id=${id}`,
    },
    SLIDES: {
        GET_ALL: 'api/promotions',
        CREATE: 'api/promotions',
        UPDATE: (id) => `api/promotions?id=${id}`,
    },
    SETTINGS:{
        GET_ALL: 'api/settings',
        CREATE: 'api/settings/register',
        UPDATE: (id) => `api/settings?id=${id}`,
        FORGOT_PASSWORD: 'api/settings/forgot-password',
        RESET_PASSWORD: 'api/settings/reset-password',
    },
    DELIVERY_PROVIDERS: {
        GET_ALL: 'api/delivery-providers',
        CREATE: 'api/delivery-providers',
        UPDATE: (id) => `api/delivery-providers?id=${id}`
    }
};