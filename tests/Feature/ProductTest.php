<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_inventory_page_displays_product_stock_status(): void
    {
        Product::create([
            'sku' => 'PRD-TEST-1',
            'name' => 'Test product',
            'category' => 'Accessories',
            'price' => 12.50,
            'stock' => 3,
        ]);

        $this->get(route('products.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('products/index')
                ->has('products', 1)
                ->where('products.0.status', 'low')
                ->where('products.0.total_value', 37.5));
    }

    public function test_product_can_be_created_and_duplicate_skus_are_rejected(): void
    {
        $attributes = [
            'sku' => 'PRD-TEST-2',
            'name' => 'New product',
            'category' => 'Other',
            'price' => 19.99,
            'stock' => 8,
        ];

        $this->post(route('products.store'), $attributes)
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('products', $attributes);

        $this->post(route('products.store'), $attributes)
            ->assertSessionHasErrors('sku');
    }

    public function test_product_can_be_updated_and_deleted(): void
    {
        $product = Product::create([
            'sku' => 'PRD-TEST-3',
            'name' => 'Old name',
            'category' => 'Electronics',
            'price' => 10,
            'stock' => 1,
        ]);

        $this->put(route('products.update', $product), [
            'sku' => $product->sku,
            'name' => 'Updated name',
            'category' => 'Electronics',
            'price' => 15.25,
            'stock' => 0,
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Updated name',
            'price' => 15.25,
            'stock' => 0,
        ]);

        $this->delete(route('products.destroy', $product))
            ->assertSessionHasNoErrors();

        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }
}
