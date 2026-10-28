import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getCategoryDisplayName } from './categoryUtils.js';

describe('getCategoryDisplayName', () => {
  it('handles null, undefined, or empty values', () => {
    assert.equal(getCategoryDisplayName(null), '');
    assert.equal(getCategoryDisplayName(undefined), '');
    assert.equal(getCategoryDisplayName(''), '');
  });

  it('handles string input directly', () => {
    assert.equal(getCategoryDisplayName('Drinks'), 'Drinks');
  });

  it('correctly reads category objects in English and Khmer', () => {
    const category = {
      id: 1,
      name: 'Beverages',
      name_local: 'ភេសជ្ជៈ',
    };

    assert.equal(getCategoryDisplayName(category, 'en'), 'Beverages');
    assert.equal(getCategoryDisplayName(category, 'km'), 'ភេសជ្ជៈ');
  });

  it('never uses product name when given a product object', () => {
    const product = {
      id: 101,
      name: 'COCA COLA', // Product name
      categoryName: 'Beverages', // Category English
      categoryNameLocal: 'ភេសជ្ជៈ', // Category Khmer
      categoryId: 1,
    };

    // Must return Category name, NEVER "COCA COLA"
    assert.equal(getCategoryDisplayName(product, 'en'), 'Beverages');
    assert.equal(getCategoryDisplayName(product, 'km'), 'ភេសជ្ជៈ');
    assert.notEqual(getCategoryDisplayName(product, 'en'), 'COCA COLA');
    assert.notEqual(getCategoryDisplayName(product, 'km'), 'COCA COLA');
  });

  it('extracts nested category from product.category object', () => {
    const product = {
      id: 102,
      name: 'Fried Rice',
      category: {
        id: 2,
        name: 'Food',
        name_local: 'អាហារ',
      },
      categoryId: 2,
    };

    assert.equal(getCategoryDisplayName(product, 'en'), 'Food');
    assert.equal(getCategoryDisplayName(product, 'km'), 'អាហារ');
  });
});

