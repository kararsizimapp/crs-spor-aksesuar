import { Product } from '../types';
import { PRODUCTS_PART1 } from './productsPart1';
import { PRODUCTS_PART2 } from './productsPart2';
import { PRODUCTS_PART3 } from './productsPart3';
import { PRODUCTS_PART4 } from './productsPart4';

export const ALL_CATALOG_PRODUCTS: Product[] = [
  ...PRODUCTS_PART1,
  ...PRODUCTS_PART2,
  ...PRODUCTS_PART3,
  ...PRODUCTS_PART4
];
