<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $items = [
            ['PRD-1001', 'Wireless Ergonomic Mouse', 'Electronics', 25, 45],
            ['PRD-1002', 'Mechanical RGB Keyboard', 'Electronics', 85, 3],
            ['PRD-1003', 'USB-C Fast Charging Cable', 'Accessories', 12, 0],
            ['PRD-1004', 'Ergonomic Mesh Office Chair', 'Furniture', 180, 12],
            ['PRD-1005', 'Aluminum Laptop Riser Stand', 'Accessories', 34.5, 5],
        ];

        foreach ($items as [$sku, $name, $category, $price, $stock]) {
            Product::create(compact('sku', 'name', 'category', 'price', 'stock'));
        }
    }
}